-- Reversão da migração 14 (contrato magnético AS5600).
-- Só roda se NÃO houver leitura magnética gravada: as colunas elétricas voltam a ser obrigatórias
-- e uma leitura as5600_i2c não tem esses valores. Havendo leituras magnéticas, arquive-as e
-- apague-as antes (elas referenciam mag_services e mag_movements), ou mantenha a migração.
begin;
set local lock_timeout = '3s';
lock table public.gaxeta_devices, public.gaxeta_readings in access exclusive mode nowait;
do $$ begin
  if exists (select 1 from public.gaxeta_readings where modality <> 'adc_pot') then
    raise exception 'Há leituras magnéticas gravadas: a reversão não é segura sem arquivá-las antes.';
  end if;
end $$;

drop trigger mag_link_closed on gaxeta_private.device_links;
drop function public.gaxeta_mag_history(text, timestamptz, timestamptz);
drop function public.gaxeta_mag_summary(text[]);
drop function public.gaxeta_mag_cancel_service(text, text);
drop function public.gaxeta_mag_request_service(text, uuid, numeric, text);
drop function public.gaxeta_mag_set_equipment_defaults(uuid, text, numeric, bigint);
drop function public.gaxeta_mag_set_point_setup(uuid, bigint, integer, numeric, text);
drop function public.gaxeta_mag_geometries();
drop function public.gaxeta_mag_set_geometry_status(bigint, text, jsonb);
drop function public.gaxeta_mag_save_geometry(jsonb);
drop function public.gaxeta_ingest_v4(text, jsonb);

-- Funções alteradas: voltam ao corpo da migração 12.
create or replace function public.gaxeta_ingest(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare result jsonb; name text; noise numeric; d public.gaxeta_devices%rowtype; next_value numeric;
 v_mv integer; v_min integer; v_max integer; v_method text; v_scale text;
begin
 result:=public.gaxeta_ingest_v3(p_token,p_reading);
 if coalesce((result->>'duplicate')::boolean,false) then return result; end if;
 name:=p_reading->>'device_name';
 if p_reading ? 'adc_noise' then
 noise:=(p_reading->>'adc_noise')::numeric;
 if noise not between 0 and 4095 then raise exception 'Ruído ADC inválido'; end if;
 end if;
 -- Campos aditivos do firmware 4.3.0. Ausentes ou nulos em versões anteriores: continuam ausentes.
 if jsonb_typeof(p_reading->'voltage_mv') is distinct from 'null' and p_reading ? 'voltage_mv' then
  if jsonb_typeof(p_reading->'voltage_mv') <> 'number' or (p_reading->>'voltage_mv')::numeric not between 0 and 5000 then
   raise exception using errcode='22023',message='Tensão calibrada inválida';
  end if;
  v_mv:=round((p_reading->>'voltage_mv')::numeric)::integer;
 end if;
 if (p_reading ? 'adc_min' and jsonb_typeof(p_reading->'adc_min') <> 'null')
    or (p_reading ? 'adc_max' and jsonb_typeof(p_reading->'adc_max') <> 'null') then
  if jsonb_typeof(p_reading->'adc_min') is distinct from 'number' or jsonb_typeof(p_reading->'adc_max') is distinct from 'number'
     or (p_reading->>'adc_min')::numeric not between 0 and 4095 or (p_reading->>'adc_max')::numeric not between 0 and 4095
     or (p_reading->>'adc_min')::numeric > (p_reading->>'adc_max')::numeric then
   raise exception using errcode='22023',message='Mínimo e máximo do bloco ADC inválidos';
  end if;
  v_min:=round((p_reading->>'adc_min')::numeric)::integer; v_max:=round((p_reading->>'adc_max')::numeric)::integer;
 end if;
 if p_reading ? 'acq_method' and jsonb_typeof(p_reading->'acq_method') <> 'null' then
  v_method:=p_reading->>'acq_method';
  if jsonb_typeof(p_reading->'acq_method') <> 'string' or v_method !~ '^[a-z0-9][a-z0-9._-]{0,31}$' then
   raise exception using errcode='22023',message='Método de aquisição inválido';
  end if;
 end if;
 -- Escala elétrica do percentual (firmware 4.3.3 com limites fixos). Ausente: escala do ADC bruto, como sempre.
 if p_reading ? 'percent_scale' and jsonb_typeof(p_reading->'percent_scale') <> 'null' then
  v_scale:=p_reading->>'percent_scale';
  if jsonb_typeof(p_reading->'percent_scale') <> 'string' or v_scale !~ '^[a-z0-9][a-z0-9._-]{0,31}$' then
   raise exception using errcode='22023',message='Escala do percentual inválida';
  end if;
 end if;
 select * into d from public.gaxeta_devices where sensor_id=p_reading->>'sensor_id' for update;
 if d.last_boot_id=p_reading->>'boot_id' and d.last_sequence=(p_reading->>'sequence')::bigint then
 if d.stable_percent is not null and v_scale is distinct from d.last_percent_scale then
  -- A placa passou a enviar o percentual em outra escala elétrica: a referência do filtro
  -- recomeça no valor atual, sem registrar movimento. A troca de escala não é um giro.
  next_value:=case when d.last_percent between 0 and 100 then d.last_percent else d.stable_percent end;
  if next_value is distinct from d.stable_percent then d.stable_since:=(result->>'received_at')::timestamptz; end if;
 else
  next_value:=gaxeta_private.stabilize(d.stable_percent,d.last_percent);
  if next_value is distinct from d.stable_percent then
  insert into public.gaxeta_movements(reading_id,sensor_id,received_at,previous_percent,stable_percent)
  values((result->>'id')::bigint,d.sensor_id,(result->>'received_at')::timestamptz,d.stable_percent,next_value);
  d.stable_since:=(result->>'received_at')::timestamptz;
  end if;
 end if;
 d.stable_percent:=next_value;
 -- Diagnóstico da leitura atual: mesma proteção contra envio atrasado ou fora de ordem
 -- (só a amostra que virou a leitura atual do sensor atualiza estes campos).
 update public.gaxeta_devices set stable_percent=d.stable_percent,stable_since=d.stable_since,
 applied_label=case when name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then name else applied_label end,
 ble_mac=coalesce(left(p_reading->>'ble_mac',32),ble_mac),
 firmware_version=coalesce(left(p_reading->>'firmware_version',32),firmware_version),
 adc_noise=coalesce(noise,adc_noise),transport='direct_wifi',
 last_voltage_mv=v_mv,last_adc_raw=(p_reading->>'adc_raw')::numeric,last_adc_min=v_min,last_adc_max=v_max,last_acq_method=v_method,
 last_percent_scale=v_scale
 where sensor_id=d.sensor_id;
 end if;
 update public.gaxeta_readings set adc_noise=noise,stable_percent=d.stable_percent,
 voltage_mv=v_mv,adc_min=v_min,adc_max=v_max,acq_method=v_method,percent_scale=v_scale where id=(result->>'id')::bigint;
 return result;
end $function$;

create or replace function public.gaxeta_telemetry_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  r public.gaxeta_readings%rowtype;
  win tstzmultirange; v_gap numeric; items jsonb := '[]'::jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    r := null;
    select * into r from public.gaxeta_readings
      where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence and received_at <@ win;
    -- Intervalo típico entre envios (mediana dos três últimos), dentro do período que o usuário pode ler.
    select percentile_disc(0.5) within group (order by extract(epoch from g.gap)) into v_gap from (
      select q.received_at - pg_catalog.lag(q.received_at) over (order by q.received_at) as gap from (
        select x.received_at from public.gaxeta_readings x
         where x.sensor_id = d.sensor_id and x.received_at <@ win
         order by x.received_at desc limit 4) q) g where g.gap is not null;
    items := items || jsonb_build_object(
      'sensor_id', d.sensor_id, 'interval_s', round(v_gap), 'linked', d.measurement_point_id is not null,
      'reading_id', r.id::text, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
      'percent', r.travel_percent, 'percent_scale', r.percent_scale,
      'stable_percent', case when r.id is not null then d.stable_percent end,
      'stable_since', case when r.id is not null then d.stable_since end,
      'voltage_mv', coalesce(r.voltage_mv, round(r.voltage_v * 1000)::integer),
      'voltage_source', case when r.id is null then null when r.voltage_mv is not null then 'calibrated' else 'estimated' end,
      'adc', r.adc_raw, 'adc_min', r.adc_min, 'adc_max', r.adc_max, 'noise', r.adc_noise,
      'acq_method', r.acq_method,
      'block', case when r.id is not null then gaxeta_private.adc_block(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max) end,
      'transport_s', round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1));
  end loop;
  return jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'items', items);
end $$;

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
 -- tensão calibrada (mV): média só das leituras que a trazem; nula quando nenhuma traz
 round(avg(voltage_mv)) voltage_mv,round(avg(adc_raw),1) adc_raw,
 -- escala do percentual no intervalo; scale_mixed: o intervalo mistura duas escalas (troca de limites da placa)
 min(percent_scale) percent_scale,count(distinct coalesce(percent_scale,''))>1 scale_mixed,
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
   'voltage_mv',b.voltage_mv,'adc_raw',b.adc_raw,'percent_scale',b.percent_scale,'scale_mixed',b.scale_mixed,
   'stable_percent',b.stable_percent,'samples',b.samples) order by b.received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',coalesce(sum(samples),0),'min',min(min_percent),'max',max(max_percent),'last_received_at',max(last_at)) from buckets),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;

drop function gaxeta_private.mag_link_closed();
drop function gaxeta_private.mag_close_services(bigint, text, timestamptz);
drop function gaxeta_private.mag_setup(uuid);
drop function gaxeta_private.mag_geometry_snapshot(gaxeta_private.mag_geometries);
drop function gaxeta_private.mag_invalid_reason(text, text);
drop function gaxeta_private.mag_stabilize(numeric, numeric);
drop function gaxeta_private.mag_compute(jsonb, integer, integer, integer, numeric);
drop function gaxeta_private.mag_curve_eval(jsonb, numeric);
drop function gaxeta_private.mag_curve_ok(jsonb);

alter table public.gaxeta_devices
  drop column last_modality, drop column last_raw_angle, drop column last_angle_pp, drop column last_mag_status,
  drop column last_bus_status, drop column last_agc, drop column last_magnitude, drop column last_valid_raw_angle,
  drop column last_valid_at, drop column send_period_s;
alter table public.gaxeta_readings
  drop constraint gaxeta_readings_modality_check,
  drop column modality, drop column schema_version, drop column raw_angle, drop column angle_pp, drop column mag_status,
  drop column bus_status, drop column agc, drop column magnitude, drop column capture, drop column service_id,
  drop column advance_mm, drop column remaining_mm, drop column remaining_percent, drop column range_state,
  drop column stable_remaining;
alter table public.gaxeta_readings
  alter column travel_percent set not null,
  alter column voltage_v set not null;
comment on column public.gaxeta_readings.travel_percent is
  'Posição elétrica do potenciômetro, em % da escala elétrica informada em percent_scale (nula: ADC bruto 0–4095).';

drop table gaxeta_private.mag_movements;
drop table gaxeta_private.mag_services;
drop table gaxeta_private.mag_equipment_defaults;
drop table gaxeta_private.mag_point_setups;
drop table gaxeta_private.mag_geometries;

notify pgrst, 'reload schema';
commit;
