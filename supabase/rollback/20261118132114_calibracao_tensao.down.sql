-- Reversão da migração 10 (tensão calibrada e referência na marca superior validada).
-- Devolve a ingestão, o histórico e as funções do ciclo à forma das migrações 06 e 09.
-- Descarta: tensão calibrada, mínimo, máximo e método de aquisição das leituras; as
-- amostras de referência aprovadas; os perfis de instalação; a versão da regra dos eventos.
-- Os eventos (trocas, reajustes, conferências, manutenções), vínculos e leituras ficam, e os
-- ciclos registrados na regra 2 passam a ser calculados pela regra anterior (curso nominal).
-- Reverta antes o firmware para o 4.2.0 ou mantenha o 4.3.0: os campos novos são ignorados.
begin;
set local lock_timeout = '3s';

drop function public.gaxeta_confirm_gland_anchor(text, text, text, text);
drop function public.gaxeta_save_gland_profile(text, text, uuid, jsonb);

-- Ingestão como na baseline.
create or replace function public.gaxeta_ingest(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare result jsonb; name text; noise numeric; d public.gaxeta_devices%rowtype; next_value numeric;
begin
 result:=public.gaxeta_ingest_v3(p_token,p_reading);
 if coalesce((result->>'duplicate')::boolean,false) then return result; end if;
 name:=p_reading->>'device_name';
 if p_reading ? 'adc_noise' then
 noise:=(p_reading->>'adc_noise')::numeric;
 if noise not between 0 and 4095 then raise exception 'Ruído ADC inválido'; end if;
 end if;
 select * into d from public.gaxeta_devices where sensor_id=p_reading->>'sensor_id' for update;
 if d.last_boot_id=p_reading->>'boot_id' and d.last_sequence=(p_reading->>'sequence')::bigint then
 next_value:=gaxeta_private.stabilize(d.stable_percent,d.last_percent);
 if next_value is distinct from d.stable_percent then
 insert into public.gaxeta_movements(reading_id,sensor_id,received_at,previous_percent,stable_percent)
 values((result->>'id')::bigint,d.sensor_id,(result->>'received_at')::timestamptz,d.stable_percent,next_value);
 d.stable_since:=(result->>'received_at')::timestamptz;
 end if;
 d.stable_percent:=next_value;
 update public.gaxeta_devices set stable_percent=d.stable_percent,stable_since=d.stable_since,
 applied_label=case when name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then name else applied_label end,
 ble_mac=coalesce(left(p_reading->>'ble_mac',32),ble_mac),
 firmware_version=coalesce(left(p_reading->>'firmware_version',32),firmware_version),
 adc_noise=coalesce(noise,adc_noise),transport='direct_wifi' where sensor_id=d.sensor_id;
 end if;
 update public.gaxeta_readings set adc_noise=noise,stable_percent=d.stable_percent where id=(result->>'id')::bigint;
 return result;
end $function$;

-- Histórico de telemetria como na migração 06.
create or replace function public.gaxeta_history(p_sensor_id text, p_from timestamp with time zone, p_to timestamp with time zone)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to ''
 set statement_timeout to '8s'
as $function$
declare result jsonb; bucket_seconds numeric; v_win tstzmultirange;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to-p_from<interval '1 second' or p_to-p_from>interval '366 days' then
 raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
 bucket_seconds:=greatest(1,extract(epoch from(p_to-p_from))/600);
 v_win:=gaxeta_authz.sensor_read_windows(p_sensor_id);
 with buckets as (
 select min(received_at) received_at,avg(travel_percent) travel_percent,min(travel_percent) min_percent,
 max(travel_percent) max_percent,avg(position_mm) position_mm,avg(voltage_v) voltage_v,
 -- última leitura do intervalo por (received_at,id), sem ordenar o grupo
 (max(array[extract(epoch from received_at),id::numeric,stable_percent]))[3] stable_percent,count(*) samples,
 max(received_at) last_at
 from public.gaxeta_readings
 where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to and received_at <@ v_win
 group by floor(extract(epoch from(received_at-p_from))/bucket_seconds)
 ), events as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to and received_at <@ v_win
 order by received_at,reading_id limit 5001
 ), seed as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at<p_from and received_at <@ v_win
 order by received_at desc,reading_id desc limit 1
 ) select jsonb_build_object(
 'history',coalesce((select jsonb_agg(jsonb_build_object('received_at',b.received_at,'travel_percent',b.travel_percent,
   'min_percent',b.min_percent,'max_percent',b.max_percent,'position_mm',b.position_mm,'voltage_v',b.voltage_v,
   'stable_percent',b.stable_percent,'samples',b.samples) order by b.received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',coalesce(sum(samples),0),'min',min(min_percent),'max',max(max_percent),'last_received_at',max(last_at)) from buckets),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;

-- Funções do ciclo como na migração 09.
create or replace function gaxeta_private.gland_state(d public.gaxeta_devices, win tstzmultirange)
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

create or replace function public.gaxeta_gland_summary(p_sensor_ids text[])
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

create or replace function public.gaxeta_gland_history(p_sensor_id text, p_from timestamptz, p_to timestamptz)
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

drop function gaxeta_private.gland_try_anchor(bigint);
drop function gaxeta_private.gland_model(bigint, bigint, timestamptz);
drop function gaxeta_private.gland_eval(jsonb, numeric);
drop function gaxeta_private.gland_window(bigint, timestamptz);
drop function gaxeta_private.gland_profile_at(bigint, timestamptz);
drop function gaxeta_private.gland_qvalue(text, text, numeric, integer, text);
drop function gaxeta_private.gland_quality(numeric, numeric, integer, integer, numeric);
drop table gaxeta_private.gland_anchors;
drop table gaxeta_private.gland_profiles;

alter table gaxeta_private.gland_events drop constraint gland_events_rule_check, drop column rule_version;
alter table public.gaxeta_devices
  drop column last_voltage_mv, drop column last_adc_raw, drop column last_adc_min,
  drop column last_adc_max, drop column last_acq_method;
alter table public.gaxeta_readings
  drop constraint gaxeta_readings_voltage_mv_check, drop constraint gaxeta_readings_adc_block_check,
  drop column voltage_mv, drop column adc_min, drop column adc_max, drop column acq_method;

notify pgrst, 'reload schema';
commit;
