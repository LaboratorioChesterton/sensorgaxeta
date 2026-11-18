set local lock_timeout = '3s';

-- Eventos imutáveis. O vínculo distingue duas instalações do mesmo sensor,
-- mesmo que ele seja removido e depois volte ao mesmo spot.
create table gaxeta_private.gland_events (
  id bigint generated always as identity primary key,
  link_id bigint not null references gaxeta_private.device_links(id),
  request_id uuid not null,
  actor_id uuid not null,
  recorded_at timestamptz not null default clock_timestamp(),
  kind text not null check (kind in ('maintenance', 'replacement', 'adjustment')),
  initial_mm numeric(12,3),
  unique (link_id, request_id),
  check ((kind = 'maintenance' and initial_mm is null) or
         (kind <> 'maintenance' and initial_mm > 0 and initial_mm <= 999999999.999 and initial_mm is not null))
);
create index gland_events_link_recent on gaxeta_private.gland_events (link_id, id desc);
alter table gaxeta_private.gland_events enable row level security;
revoke all on table gaxeta_private.gland_events from public, anon, authenticated, service_role;

-- Critério elétrico de bancada: evita saturação nas extremidades do ADC
-- e blocos cuja dispersão chega a mais de 25 contagens. Não define curso mecânico.
create function gaxeta_private.gland_sample_ok(p_adc numeric, p_noise numeric)
 returns boolean language sql immutable set search_path = '' as $$
  select coalesce(p_adc > 0 and p_adc < 4095 and p_noise between 0 and 25, false)
$$;

-- A primeira amostra apta é escolhida por ordem de recepção. Amostras em fila
-- colhidas antes do registro ou com relógio ausente nunca formam uma referência.
create function gaxeta_private.gland_anchor(
  p_sensor_id text, p_start timestamptz, p_end timestamptz
) returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('id', r.id::text, 'sampled_at', r.sampled_at,
    'adc', r.adc_raw, 'noise', r.adc_noise, 'percent', 100)
  from public.gaxeta_readings r
  where r.sensor_id = p_sensor_id and r.received_at >= p_start and r.received_at < p_end
    and r.sampled_at >= p_start and r.sampled_at <= r.received_at
    and r.received_at - r.sampled_at <= interval '30 seconds'
    and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise)
  order by r.received_at, r.id limit 1
$$;
revoke all on function gaxeta_private.gland_sample_ok(numeric,numeric),
  gaxeta_private.gland_anchor(text,timestamptz,timestamptz) from public, anon, authenticated, service_role;

create function public.gaxeta_record_gland_event(
  p_sensor_id text, p_link_id text, p_expected_event text, p_request_id uuid,
  p_kind text, p_initial_mm numeric
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
begin
  select * into d from public.gaxeta_devices
    where sensor_id=p_sensor_id and origin='esp32' for update;
  if not found or d.measurement_point_id is null
     or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message='Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id=d.sensor_id and point_id=d.measurement_point_id and unlinked_at is null;
  if not found or l.id::text is distinct from p_link_id then
    raise sqlstate 'PT409' using message='A instalação do sensor mudou. Abra os detalhes novamente.';
  end if;
  if p_request_id is null or p_kind is null or p_kind not in ('maintenance', 'replacement', 'adjustment')
     or (p_kind='maintenance' and p_initial_mm is not null)
     or (p_kind<>'maintenance' and (p_initial_mm is null or not (p_initial_mm > 0 and p_initial_mm <= 999999999.999)
         or p_initial_mm <> round(p_initial_mm, 3))) then
    raise invalid_parameter_value using message='Informe uma operação válida e uma distância positiva em mm, com até três casas decimais.';
  end if;
  select * into e from gaxeta_private.gland_events where link_id=l.id and request_id=p_request_id;
  if found then
    if e.actor_id<>auth.uid() or e.kind<>p_kind or e.initial_mm is distinct from p_initial_mm then
      raise sqlstate 'PT409' using message='A solicitação já foi usada para outra operação.';
    end if;
    return jsonb_build_object('id', e.id::text, 'duplicate', true);
  end if;

  select * into e from gaxeta_private.gland_events where link_id=l.id order by id desc limit 1;
  if e.id::text is distinct from p_expected_event then
    raise sqlstate 'PT409' using message='Outra pessoa atualizou o ciclo. Revise o estado atual e tente novamente.';
  end if;
  if p_kind='maintenance' and e.kind='maintenance' then
    raise sqlstate 'PT409' using message='O sensor já está em manutenção.';
  end if;
  if p_kind<>'maintenance' and e.kind is distinct from 'maintenance' then
    raise sqlstate 'PT409' using message='Inicie a manutenção antes de registrar o engaxetamento.';
  end if;

  insert into gaxeta_private.gland_events (link_id, request_id, actor_id, kind, initial_mm)
  values (l.id, p_request_id, auth.uid(), p_kind, p_initial_mm) returning * into e;
  return jsonb_build_object('id', e.id::text, 'duplicate', false);
end
$$;

create function public.gaxeta_gland_status(p_sensor_id text, p_history_before text default null)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  win tstzmultirange;
  anchor jsonb;
  events jsonb;
  current_adc numeric;
  status text := 'no_reference';
begin
  -- Reutiliza a visibilidade de sensores e as janelas históricas por vínculo.
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id=p_sensor_id and origin='esp32';
  win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  if d.sensor_id is null or win = '{}'::tstzmultirange then raise insufficient_privilege; end if;
  select * into l from gaxeta_private.device_links
    where sensor_id=d.sensor_id and unlinked_at is null and linked_at <@ win;
  select * into e from gaxeta_private.gland_events where link_id=l.id order by id desc limit 1;

  if e.kind='maintenance' then
    status := 'maintenance';
  elsif e.id is not null then
    anchor := gaxeta_private.gland_anchor(d.sensor_id,e.recorded_at,'infinity'::timestamptz);
    status := 'waiting';
    if anchor is not null then
      status := 'unusable';
      select * into r from public.gaxeta_readings
        where sensor_id=d.sensor_id and boot_id=d.last_boot_id and sequence=d.last_sequence;
      if r.sampled_at >= (anchor->>'sampled_at')::timestamptz
        and r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds'
        and gaxeta_private.gland_sample_ok(r.adc_raw,r.adc_noise) then
        status := 'active';
        current_adc := r.adc_raw;
      end if;
    end if;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', h.id::text, 'kind', h.kind, 'initial_mm', h.initial_mm,
    'recorded_at', h.recorded_at,
    'anchor', case when h.kind<>'maintenance' then
      gaxeta_private.gland_anchor(d.sensor_id,h.recorded_at,
        least(h.unlinked_at, (select n.recorded_at from gaxeta_private.gland_events n
          where n.link_id=h.link_id and n.id>h.id order by n.id limit 1), 'infinity'::timestamptz))
      end
    ) order by h.id desc),'[]'::jsonb) into events
  from (
    select g.*, dl.unlinked_at from gaxeta_private.device_links dl
      join gaxeta_private.gland_events g on g.link_id=dl.id
      where dl.sensor_id=d.sensor_id and g.recorded_at <@ win
        and (p_history_before is null or g.id < p_history_before::bigint)
      order by g.id desc limit 20
  ) h;

  return jsonb_build_object('state',status, 'link_id',l.id::text, 'event_id',e.id::text,
    'can_operate',l.id is not null and gaxeta_authz.can_operate_point(l.point_id),
    'initial_mm',e.initial_mm, 'recorded_at',e.recorded_at, 'anchor',anchor,
    'current_adc',current_adc, 'current_sampled_at',case when current_adc is not null then r.sampled_at end,
    'delta_adc',current_adc-(anchor->>'adc')::numeric, 'events',events);
end
$$;
revoke all on function public.gaxeta_record_gland_event(text,text,text,uuid,text,numeric),
  public.gaxeta_gland_status(text,text) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_record_gland_event(text,text,text,uuid,text,numeric),
  public.gaxeta_gland_status(text,text) to authenticated;
notify pgrst, 'reload schema';
