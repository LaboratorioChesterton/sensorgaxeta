-- Migração 09: referência individual por engaxetamento.
-- Completa a migração 08 (ciclos_gaxeta), que já guarda os eventos e a amostra de
-- referência, com: distância de fim de ajuste, conferência com paquímetro (escala
-- medida), distância e percentual do ciclo, resumo para listas e histórico por ciclo.
--
-- Nada aqui toca em gaxeta_ingest, gaxeta_ingest_v3, estabilização, leituras ou
-- movimentos. O percentual do ciclo é derivado na consulta, a partir do ADC bruto
-- que a placa já envia e dos eventos registrados pelo técnico. A placa não precisa
-- receber a referência.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 1. Eventos: fim de ajuste (end_mm) e conferência (kind = 'check')
-- ---------------------------------------------------------------------------
alter table gaxeta_private.gland_events add column end_mm numeric(12,3);

do $$
declare c record;
begin
  for c in select conname from pg_catalog.pg_constraint
            where conrelid = 'gaxeta_private.gland_events'::regclass and contype = 'c' loop
    execute format('alter table gaxeta_private.gland_events drop constraint %I', c.conname);
  end loop;
end $$;

alter table gaxeta_private.gland_events
  add constraint gland_events_kind_check
    check (kind in ('maintenance', 'replacement', 'adjustment', 'check')),
  add constraint gland_events_mm_check check (coalesce(
    case kind
      when 'maintenance' then initial_mm is null and end_mm is null
      when 'check' then initial_mm > 0 and initial_mm <= 999999999.999 and end_mm is null
      else initial_mm > 0 and initial_mm <= 999999999.999
           and (end_mm is null or (end_mm >= 0 and end_mm < initial_mm))
    end, false));

comment on table gaxeta_private.gland_events is
  'Eventos imutáveis do ciclo de gaxeta por instalação (vínculo sensor–spot). maintenance: serviço em andamento; replacement/adjustment: nova referência de 100 % com a distância medida (initial_mm) e, se informada, a distância de fim de ajuste (end_mm); check: conferência com paquímetro, que mede a escala mm por contagem.';
comment on column gaxeta_private.gland_events.end_mm is
  'Distância, na mesma referência mecânica de initial_mm, em que não resta ajuste (0 %). Nula quando não informada: a plataforma mostra milímetros e não calcula percentual.';

-- ---------------------------------------------------------------------------
-- 2. Amostra de referência: passa a trazer também a posição nominal do firmware
-- ---------------------------------------------------------------------------
create or replace function gaxeta_private.gland_anchor(
  p_sensor_id text, p_start timestamptz, p_end timestamptz
) returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('id', r.id::text, 'sampled_at', r.sampled_at,
    'adc', r.adc_raw, 'noise', r.adc_noise, 'mm', r.position_mm, 'percent', 100)
  from public.gaxeta_readings r
  where r.sensor_id = p_sensor_id and r.received_at >= p_start and r.received_at < p_end
    and r.sampled_at >= p_start and r.sampled_at <= r.received_at
    and r.received_at - r.sampled_at <= interval '30 seconds'
    and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise)
  order by r.received_at, r.id limit 1
$$;

-- Fim da validade de um evento: o próximo evento que muda o ciclo (a conferência
-- não muda) ou o fim da instalação.
create function gaxeta_private.gland_stop(p_link_id bigint, p_event_id bigint)
 returns timestamptz language sql stable set search_path = '' as $$
  select least(
    (select l.unlinked_at from gaxeta_private.device_links l where l.id = p_link_id),
    (select n.recorded_at from gaxeta_private.gland_events n
      where n.link_id = p_link_id and n.id > p_event_id and n.kind <> 'check' order by n.id limit 1),
    'infinity'::timestamptz)
$$;

-- ---------------------------------------------------------------------------
-- 3. Escala (mm por contagem do ADC)
-- ---------------------------------------------------------------------------
-- Uma conferência dá o segundo ponto da reta: (distância medida, ADC) no registro e
-- na conferência. Só vale com pelo menos 100 contagens de diferença, para o ruído
-- não dominar a inclinação. A escala medida passa a valer da conferência em diante,
-- inclusive nos ciclos seguintes da mesma instalação. Sem conferência válida, usa-se
-- a posição nominal que o firmware envia (curso de referência configurado na placa).
create function gaxeta_private.gland_scale(p_sensor_id text, p_link_id bigint, p_at timestamptz)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  c gaxeta_private.gland_events%rowtype;
  cyc gaxeta_private.gland_events%rowtype;
  v_stop timestamptz; a0 jsonb; a1 jsonb; v_dadc numeric; v_k numeric;
begin
  for c in select * from gaxeta_private.gland_events
            where link_id = p_link_id and kind = 'check' and recorded_at <= p_at
            order by id desc limit 8 loop
    select * into cyc from gaxeta_private.gland_events g
      where g.link_id = p_link_id and g.kind <> 'check' and g.id < c.id order by g.id desc limit 1;
    continue when cyc.id is null or cyc.kind = 'maintenance';
    v_stop := gaxeta_private.gland_stop(p_link_id, cyc.id);
    a0 := gaxeta_private.gland_anchor(p_sensor_id, cyc.recorded_at, v_stop);
    a1 := gaxeta_private.gland_anchor(p_sensor_id, c.recorded_at, v_stop);
    continue when a0 is null or a1 is null;
    v_dadc := (a1 ->> 'adc')::numeric - (a0 ->> 'adc')::numeric;
    continue when abs(v_dadc) < 100;
    v_k := (c.initial_mm - cyc.initial_mm) / v_dadc;
    continue when abs(v_k) < 0.0005 or abs(v_k) > 2;
    return jsonb_build_object('source', 'measured', 'mm_per_count', round(v_k, 6),
      'event_id', c.id::text, 'recorded_at', c.recorded_at,
      'delta_adc', round(v_dadc, 1), 'delta_mm', c.initial_mm - cyc.initial_mm);
  end loop;
  return jsonb_build_object('source', 'nominal', 'mm_per_count', null);
end $$;

-- Distância atual e percentual do ciclo para uma leitura.
create function gaxeta_private.gland_value(
  p_initial_mm numeric, p_end_mm numeric, p_anchor jsonb, p_mm_per_count numeric, p_adc numeric, p_mm numeric
) returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'distance_mm', round(x.dist, 2),
    'percent', case when p_end_mm is null then null
                    else round(100 * (x.dist - p_end_mm) / (p_initial_mm - p_end_mm), 1) end)
  from (select p_initial_mm + coalesce(
          p_mm_per_count * (p_adc - (p_anchor ->> 'adc')::numeric),
          p_mm - (p_anchor ->> 'mm')::numeric) as dist) x
$$;

-- ---------------------------------------------------------------------------
-- 4. Estado atual do ciclo de um sensor (base de gaxeta_gland_status e do resumo)
-- ---------------------------------------------------------------------------
create function gaxeta_private.gland_state(d public.gaxeta_devices, win tstzmultirange)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  v_last_id bigint; anchor jsonb; scale jsonb; val jsonb;
  status text := 'no_reference';
begin
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and unlinked_at is null and linked_at <@ win;
  if l.id is null then
    return jsonb_build_object('state', 'unlinked', 'can_operate', false);
  end if;
  select id into v_last_id from gaxeta_private.gland_events where link_id = l.id order by id desc limit 1;
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;

  if e.kind = 'maintenance' then
    status := 'maintenance';
  elsif e.id is not null then
    anchor := gaxeta_private.gland_anchor(d.sensor_id, e.recorded_at, 'infinity'::timestamptz);
    status := 'waiting';
    if anchor is not null then
      status := 'unusable';
      scale := gaxeta_private.gland_scale(d.sensor_id, l.id, pg_catalog.clock_timestamp());
      select * into r from public.gaxeta_readings
        where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
      if r.sampled_at >= (anchor ->> 'sampled_at')::timestamptz
         and r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds'
         and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise) then
        status := 'active';
        val := gaxeta_private.gland_value(e.initial_mm, e.end_mm, anchor,
                 (scale ->> 'mm_per_count')::numeric, r.adc_raw, r.position_mm);
      end if;
    end if;
  end if;

  return jsonb_build_object('state', status, 'link_id', l.id::text,
    'event_id', v_last_id::text, 'cycle_event_id', e.id::text, 'kind', e.kind,
    'can_operate', gaxeta_authz.can_operate_point(l.point_id),
    'initial_mm', e.initial_mm, 'end_mm', e.end_mm, 'recorded_at', e.recorded_at,
    'anchor', anchor, 'scale', scale,
    'current_adc', case when val is not null then r.adc_raw end,
    'current_sampled_at', case when val is not null then r.sampled_at end,
    'delta_adc', case when val is not null then r.adc_raw - (anchor ->> 'adc')::numeric end,
    'distance_mm', val -> 'distance_mm', 'percent', val -> 'percent',
    'out_of_range', coalesce((val ->> 'percent')::numeric not between -5 and 105, false),
    -- Potenciômetro de uma volta com batente: a 5 % de cada extremo da escala do ADC
    -- a leitura está perto de parar de acompanhar o movimento.
    'near_limit', coalesce(val is not null and (r.adc_raw <= 205 or r.adc_raw >= 3890), false));
end $$;

-- ---------------------------------------------------------------------------
-- 5. Registro de evento (substitui a versão de seis parâmetros da migração 08)
-- ---------------------------------------------------------------------------
drop function public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric);

create function public.gaxeta_record_gland_event(
  p_sensor_id text, p_link_id text, p_expected_event text, p_request_id uuid,
  p_kind text, p_initial_mm numeric, p_end_mm numeric default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  cyc gaxeta_private.gland_events%rowtype;
begin
  select * into d from public.gaxeta_devices
    where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null
     or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if not found or l.id::text is distinct from p_link_id then
    raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.';
  end if;

  if p_request_id is null or p_kind is null
     or p_kind not in ('maintenance', 'replacement', 'adjustment', 'check') then
    raise invalid_parameter_value using message = 'Operação inválida.';
  end if;
  if p_kind = 'maintenance' and (p_initial_mm is not null or p_end_mm is not null) then
    raise invalid_parameter_value using message = 'O início da manutenção não recebe medida.';
  end if;
  if p_kind <> 'maintenance' and (p_initial_mm is null
       or not (p_initial_mm > 0 and p_initial_mm <= 999999999.999)
       or p_initial_mm <> round(p_initial_mm, 3)) then
    raise invalid_parameter_value using message = 'Informe a distância medida em mm, positiva, com até três casas decimais.';
  end if;
  if p_kind = 'check' and p_end_mm is not null then
    raise invalid_parameter_value using message = 'A conferência recebe só a distância medida.';
  end if;
  if p_kind in ('replacement', 'adjustment') and p_end_mm is not null
     and (not (p_end_mm >= 0 and p_end_mm < p_initial_mm) or p_end_mm <> round(p_end_mm, 3)) then
    raise invalid_parameter_value using message = 'A distância de fim de ajuste deve ser menor que a distância medida e não pode ser negativa.';
  end if;

  -- Reenvio da mesma solicitação (toque duplo, rede instável): devolve o evento já gravado.
  select * into e from gaxeta_private.gland_events where link_id = l.id and request_id = p_request_id;
  if found then
    if e.actor_id <> auth.uid() or e.kind <> p_kind or e.initial_mm is distinct from p_initial_mm
       or e.end_mm is distinct from p_end_mm then
      raise sqlstate 'PT409' using message = 'A solicitação já foi usada para outra operação.';
    end if;
    return jsonb_build_object('id', e.id::text, 'duplicate', true);
  end if;

  select * into e from gaxeta_private.gland_events where link_id = l.id order by id desc limit 1;
  if e.id::text is distinct from p_expected_event then
    raise sqlstate 'PT409' using message = 'Outra pessoa atualizou o ciclo. Revise o estado atual e tente novamente.';
  end if;
  select * into cyc from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  if p_kind = 'maintenance' and cyc.kind = 'maintenance' then
    raise sqlstate 'PT409' using message = 'O sensor já está em manutenção.';
  end if;
  if p_kind = 'check' and (cyc.id is null or cyc.kind = 'maintenance') then
    raise sqlstate 'PT409' using message = 'Registre o engaxetamento antes de conferir a medida.';
  end if;

  insert into gaxeta_private.gland_events (link_id, request_id, actor_id, kind, initial_mm, end_mm)
  values (l.id, p_request_id, auth.uid(), p_kind, p_initial_mm, p_end_mm) returning * into e;
  perform gaxeta_private.audit('gland.' || p_kind, 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id),
    jsonb_build_object('event_id', e.id, 'link_id', l.id, 'point_id', l.point_id,
      'initial_mm', p_initial_mm, 'end_mm', p_end_mm));
  return jsonb_build_object('id', e.id::text, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- 6. Estado e histórico de eventos de um sensor (mesma assinatura da migração 08)
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_gland_status(p_sensor_id text, p_history_before text default null)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  win tstzmultirange;
  events jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32';
  win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  if d.sensor_id is null or win = '{}'::tstzmultirange then raise insufficient_privilege; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', h.id::text, 'link_id', h.link_id::text, 'kind', h.kind,
    'initial_mm', h.initial_mm, 'end_mm', h.end_mm, 'recorded_at', h.recorded_at,
    'actor', (select nullif(p.display_name, '') from gaxeta_private.user_profiles p where p.user_id = h.actor_id),
    'anchor', case when h.kind <> 'maintenance' then
      gaxeta_private.gland_anchor(d.sensor_id, h.recorded_at, gaxeta_private.gland_stop(h.link_id, h.id)) end
    ) order by h.id desc), '[]'::jsonb) into events
  from (
    select g.* from gaxeta_private.device_links dl
      join gaxeta_private.gland_events g on g.link_id = dl.id
     where dl.sensor_id = d.sensor_id and g.recorded_at <@ win
       and (p_history_before is null or g.id < p_history_before::bigint)
     order by g.id desc limit 20
  ) h;

  return gaxeta_private.gland_state(d, win)
      || jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'events', events);
end $$;

-- ---------------------------------------------------------------------------
-- 7. Resumo para listas: estado do ciclo e cadência observada, vários sensores
-- ---------------------------------------------------------------------------
-- interval_s é a mediana dos intervalos entre as quatro últimas leituras recebidas (a
-- menor, quando só há duas): serve para a interface decidir "Transmitindo" quando a
-- placa hiberna entre envios, sem que uma parada longa conte como cadência.
create function public.gaxeta_gland_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  win tstzmultirange; st jsonb; v_gap numeric; items jsonb := '[]'::jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    st := gaxeta_private.gland_state(d, win);
    select percentile_disc(0.5) within group (order by extract(epoch from g.gap)) into v_gap from (
      select q.received_at - pg_catalog.lag(q.received_at) over (order by q.received_at) as gap from (
        select r.received_at from public.gaxeta_readings r
         where r.sensor_id = d.sensor_id and r.received_at <@ win
         order by r.received_at desc limit 4) q) g where g.gap is not null;
    items := items || jsonb_build_object('sensor_id', d.sensor_id, 'state', st -> 'state',
      'percent', st -> 'percent', 'distance_mm', st -> 'distance_mm',
      'initial_mm', st -> 'initial_mm', 'end_mm', st -> 'end_mm', 'recorded_at', st -> 'recorded_at',
      'scale_source', st -> 'scale' -> 'source', 'out_of_range', st -> 'out_of_range',
      'near_limit', st -> 'near_limit',
      'interval_s', round(v_gap));
  end loop;
  return jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'items', items);
end $$;

-- ---------------------------------------------------------------------------
-- 8. Histórico por ciclo: cada leitura é calculada com a referência e a escala
--    que valiam quando ela foi colhida. Registrar um ciclo novo não muda o passado.
-- ---------------------------------------------------------------------------
create function public.gaxeta_gland_history(p_sensor_id text, p_from timestamptz, p_to timestamptz)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '8s' as $$
declare
  win tstzmultirange; bucket_seconds numeric; result jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to)
     or p_to - p_from < interval '1 second' or p_to - p_from > interval '366 days' then
    raise exception 'Selecione um intervalo entre 1 segundo e 366 dias';
  end if;
  win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  if win = '{}'::tstzmultirange
     or not exists (select 1 from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32') then
    raise insufficient_privilege;
  end if;
  bucket_seconds := greatest(1, extract(epoch from (p_to - p_from)) / 600);

  with ev as (
    select g.*, coalesce((select n.recorded_at from gaxeta_private.gland_events n
                           where n.link_id = g.link_id and n.id > g.id order by n.id limit 1),
                         dl.unlinked_at, 'infinity'::timestamptz) as seg_stop
      from gaxeta_private.device_links dl
      join gaxeta_private.gland_events g on g.link_id = dl.id
     where dl.sensor_id = p_sensor_id and g.recorded_at <@ win and g.recorded_at <= p_to
  ), seg as (
    -- Um trecho por evento que não seja manutenção; a conferência herda o ciclo em curso.
    select ev.id, ev.kind, ev.recorded_at as seg_start, ev.seg_stop, c.id as cycle_id,
           c.initial_mm, c.end_mm,
           gaxeta_private.gland_anchor(p_sensor_id, c.recorded_at, gaxeta_private.gland_stop(c.link_id, c.id)) as anchor,
           gaxeta_private.gland_scale(p_sensor_id, ev.link_id, ev.recorded_at) as scale
      from ev
      cross join lateral (
        select g.* from gaxeta_private.gland_events g
         where g.link_id = ev.link_id and g.kind <> 'check' and g.id <= ev.id order by g.id desc limit 1) c
     where ev.kind <> 'maintenance' and c.kind <> 'maintenance' and ev.seg_stop > p_from
  ), pts as (
    select s.id as seg_id, r.received_at, v.val
      from seg s
      join public.gaxeta_readings r
        on r.sensor_id = p_sensor_id and r.received_at >= greatest(s.seg_start, p_from)
       and r.received_at < s.seg_stop and r.received_at <= p_to and r.received_at <@ win
      cross join lateral (select gaxeta_private.gland_value(s.initial_mm, s.end_mm, s.anchor,
          (s.scale ->> 'mm_per_count')::numeric, r.adc_raw, r.position_mm) as val) v
     where s.anchor is not null and r.sampled_at >= (s.anchor ->> 'sampled_at')::timestamptz
       and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise)
  ), buckets as (
    select min(received_at) as received_at, round(avg((val ->> 'distance_mm')::numeric), 2) as distance_mm,
           round(avg((val ->> 'percent')::numeric), 1) as percent, count(*) as samples
      -- Um intervalo nunca mistura leituras de referências diferentes.
      from pts group by seg_id, floor(extract(epoch from (received_at - p_from)) / bucket_seconds)
  )
  select jsonb_build_object(
    'points', coalesce((select jsonb_agg(jsonb_build_object('received_at', b.received_at,
        'distance_mm', b.distance_mm, 'percent', b.percent, 'samples', b.samples) order by b.received_at)
        from buckets b), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', ev.id::text, 'kind', ev.kind,
        'recorded_at', ev.recorded_at, 'initial_mm', ev.initial_mm, 'end_mm', ev.end_mm) order by ev.id)
        from ev where ev.seg_stop > p_from), '[]'::jsonb),
    'from', p_from, 'to', p_to, 'bucket_seconds', bucket_seconds) into result;
  return result;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Privilégios
-- ---------------------------------------------------------------------------
revoke all on function
  gaxeta_private.gland_stop(bigint, bigint),
  gaxeta_private.gland_scale(text, bigint, timestamptz),
  gaxeta_private.gland_value(numeric, numeric, jsonb, numeric, numeric, numeric),
  gaxeta_private.gland_state(public.gaxeta_devices, tstzmultirange)
  from public, anon, authenticated, service_role;
revoke all on function
  public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric, numeric),
  public.gaxeta_gland_status(text, text),
  public.gaxeta_gland_summary(text[]),
  public.gaxeta_gland_history(text, timestamptz, timestamptz)
  from public, anon, authenticated, service_role;
grant execute on function
  public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric, numeric),
  public.gaxeta_gland_status(text, text),
  public.gaxeta_gland_summary(text[]),
  public.gaxeta_gland_history(text, timestamptz, timestamptz)
  to authenticated;

notify pgrst, 'reload schema';
commit;
