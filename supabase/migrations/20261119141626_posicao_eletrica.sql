-- Migração 12: posição elétrica. A ingestão deixa de aprovar referência mecânica e passa a
-- aceitar a leitura só elétrica; o painel ganha um resumo de telemetria sem ciclo de gaxeta.
--
-- O que muda:
--   1. position_mm vira campo legado e opcional (gaxeta_ingest_v3 e a coluna). Firmware até o
--      4.3.2 continua enviando o campo e continua aceito, sem mudança de resposta.
--   2. gaxeta_ingest não chama mais gaxeta_private.gland_try_anchor. Tensão, diagnóstico do
--      bloco, stable_percent, gaxeta_movements (5 p.p.), deduplicação, limites e credencial
--      continuam como estavam.
--   3. percent_scale (opcional): identifica a escala elétrica do percentual quando a placa usa
--      limites fixos. Na troca de escala a referência do filtro recomeça sem gerar movimento.
--   4. gaxeta_telemetry_summary: cadência de envio e leitura elétrica atual por sensor, com a
--      mesma regra de acesso do histórico. Substitui o uso de gaxeta_gland_summary na interface.
--   5. gaxeta_history: informa a escala do percentual de cada intervalo (campos aditivos).
--
-- O que NÃO muda: gaxeta_private.stabilize, as tabelas e as funções do ciclo de gaxeta (ficam
-- como estão até a migração 13, que as retira de operação depois da troca do site e do APK),
-- permissões, vínculos, equipamentos, spots e dados existentes.
begin;
set local lock_timeout = '3s';
-- Toma as duas tabelas de uma vez, sem esperar: se houver ingestão ou consulta em curso, a
-- migração falha na hora (nada é alterado) e basta repetir. Evita impasse com a ingestão.
lock table public.gaxeta_devices, public.gaxeta_readings in access exclusive mode nowait;

-- ---------------------------------------------------------------------------
-- 1. Campo legado opcional e escala do percentual
-- ---------------------------------------------------------------------------
alter table public.gaxeta_readings alter column position_mm drop not null;
comment on column public.gaxeta_readings.position_mm is
  'LEGADO. Estimativa nominal em mm enviada pelo firmware até o 4.3.2 (percentual × curso nominal). Não é medida, não alimenta cálculo e não aparece na interface. Nula nas leituras só elétricas.';
comment on column public.gaxeta_devices.last_position_mm is
  'LEGADO. Último position_mm recebido (ver gaxeta_readings.position_mm). Nulo nas leituras só elétricas.';
comment on column public.gaxeta_readings.travel_percent is
  'Posição elétrica do potenciômetro, em % da escala elétrica informada em percent_scale (nula: ADC bruto 0–4095).';

alter table public.gaxeta_readings
  add column percent_scale text,
  add constraint gaxeta_readings_percent_scale_check check (percent_scale ~ '^[a-z0-9][a-z0-9._-]{0,31}$');
alter table public.gaxeta_devices add column last_percent_scale text;
comment on column public.gaxeta_readings.percent_scale is
  'Escala elétrica usada pela placa para calcular travel_percent, por exemplo mv-142-2400 (limites fixos em mV) ou adc-80-3900 (contagens). Nula: ADC bruto 0–4095, como em todo firmware até o 4.3.2.';
comment on column public.gaxeta_devices.last_percent_scale is 'percent_scale da leitura atual do sensor.';

-- ---------------------------------------------------------------------------
-- 2. Ingestão: position_mm opcional (única alteração em gaxeta_ingest_v3)
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_ingest_v3(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare
  v_key gaxeta_private.ingest_keys%rowtype;
  v_device public.gaxeta_devices%rowtype;
  v_id text; v_boot text; v_origin text;
  v_seq bigint; v_percent numeric; v_position numeric; v_voltage numeric;
  v_adc numeric; v_rssi integer; v_uptime bigint; v_sampled timestamptz;
  v_row_id bigint; v_received timestamptz; v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if p_token is null or pg_catalog.length(p_token) < 32 or pg_catalog.length(p_token) > 256 then
    raise sqlstate 'PT401' using message='Credencial de envio inválida';
  end if;
  select * into v_key from gaxeta_private.ingest_keys
    where token_hash = pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')) and enabled for update;
  if not found then raise sqlstate 'PT401' using message='Credencial de envio inválida'; end if;
  if p_reading is null or pg_catalog.jsonb_typeof(p_reading) <> 'object'
      or pg_catalog.octet_length(p_reading::text) > 3000 then
    raise exception using errcode='22023',message='Mensagem inválida';
  end if;
  v_id := p_reading->>'sensor_id'; v_boot := p_reading->>'boot_id';
  v_origin := coalesce(p_reading->>'origin','esp32');
  if v_id is null or v_id !~ '^[A-Z0-9-]{6,48}$' or v_boot is null or v_boot !~ '^[a-f0-9]{16,64}$'
      or v_origin not in ('esp32','integration_test') then
    raise exception using errcode='22023',message='Identidade da amostra inválida';
  end if;
  if pg_catalog.jsonb_typeof(p_reading->'sequence') is distinct from 'number'
    or pg_catalog.jsonb_typeof(p_reading->'travel_percent') is distinct from 'number'
    or pg_catalog.jsonb_typeof(p_reading->'voltage_v') is distinct from 'number' then
    raise exception using errcode='22023',message='Campos numéricos obrigatórios ausentes';
  end if;
  if (p_reading->>'sequence')::numeric <> pg_catalog.trunc((p_reading->>'sequence')::numeric) then
    raise exception using errcode='22023',message='Sequência deve ser inteira';
  end if;
  v_seq := (p_reading->>'sequence')::bigint;
  v_percent := (p_reading->>'travel_percent')::numeric;
  -- position_mm é um campo legado (estimativa nominal do firmware até o 4.3.2): opcional.
  -- Ausente ou nulo: a leitura é só elétrica e nenhuma medida em mm é gravada.
  if p_reading ? 'position_mm' and pg_catalog.jsonb_typeof(p_reading->'position_mm') not in ('number','null') then
    raise exception using errcode='22023',message='Campo position_mm inválido';
  end if;
  v_position := case when pg_catalog.jsonb_typeof(p_reading->'position_mm') = 'number' then (p_reading->>'position_mm')::numeric end;
  v_voltage := (p_reading->>'voltage_v')::numeric;
  v_adc := (p_reading->>'adc_raw')::numeric;
  v_rssi := (p_reading->>'rssi')::integer;
  v_uptime := (p_reading->>'uptime_ms')::bigint;
  v_sampled := (p_reading->>'sampled_at')::timestamptz;
  if not (v_seq between 1 and 4294967295) or not (v_percent between 0 and 100)
      or (v_position is not null and not (v_position between 0 and 10000)) or not (v_voltage between 0 and 5)
      or (v_adc is not null and not (v_adc between 0 and 4095))
      or (v_rssi is not null and not (v_rssi between -127 and 0))
      or (v_uptime is not null and not (v_uptime between 0 and 4294967295))
      or (v_sampled is not null and (not pg_catalog.isfinite(v_sampled) or v_sampled > v_now + interval '10 minutes' or v_sampled < '2025-01-01'::timestamptz)) then
    raise exception using errcode='22023',message='Leitura fora da faixa permitida';
  end if;
  -- Reenvio da mesma amostra: não cria linha nem altera a leitura atual.
  select id, received_at into v_row_id, v_received from public.gaxeta_readings
    where sensor_id=v_id and boot_id=v_boot and sequence=v_seq;
  if found then return pg_catalog.jsonb_build_object('ok',true,'duplicate',true,'id',v_row_id,'received_at',v_received); end if;
  select * into v_device from public.gaxeta_devices where sensor_id=v_id;
  if not found then
    if (select pg_catalog.count(*) from public.gaxeta_devices where origin='esp32') >= v_key.max_devices and v_origin='esp32' then
      raise sqlstate 'PT429' using message='Limite de sensores do piloto atingido';
    end if;
    insert into public.gaxeta_devices(sensor_id,origin,wifi_mac)
      values(v_id,v_origin,pg_catalog.left(p_reading->>'wifi_mac',32));
  else
    if v_device.origin <> v_origin then raise exception using errcode='22023',message='Origem incompatível com o sensor'; end if;
    if v_device.last_received_at > v_now - interval '750 milliseconds' then
      raise sqlstate 'PT429' using message='Aguarde antes da próxima leitura';
    end if;
  end if;
  insert into public.gaxeta_readings(sensor_id,boot_id,sequence,received_at,sampled_at,travel_percent,position_mm,voltage_v,adc_raw,rssi,uptime_ms)
    values(v_id,v_boot,v_seq,v_now,v_sampled,v_percent,v_position,v_voltage,v_adc,v_rssi,v_uptime)
    returning id,received_at into v_row_id,v_received;
  -- Amostras atrasadas da mesma inicialização entram no histórico sem regredir o percentual atual.
  update public.gaxeta_devices set reading_count=reading_count+1 where sensor_id=v_id;
  update public.gaxeta_devices set
    last_received_at=v_now,last_sampled_at=v_sampled,last_boot_id=v_boot,last_sequence=v_seq,
    last_percent=v_percent,last_position_mm=v_position,last_voltage_v=v_voltage,last_rssi=v_rssi
    where sensor_id=v_id
      and (last_boot_id is null or
        (last_boot_id=v_boot and v_seq>last_sequence) or
        (last_boot_id<>v_boot and (v_sampled is null or last_sampled_at is null or v_sampled>=last_sampled_at)));
  return pg_catalog.jsonb_build_object('ok',true,'duplicate',false,'id',v_row_id,'received_at',v_received);
end
$function$;

-- ---------------------------------------------------------------------------
-- 3. Invólucro: sem referência mecânica; escala do percentual
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4. Diagnóstico elétrico do bloco e resumo de telemetria (sem ciclo de gaxeta)
-- ---------------------------------------------------------------------------
-- ceiling/floor: bloco inteiro no limite do ADC. touch_*: alguma amostra no limite, bloco pouco
-- disperso. mixed_*: amostras no limite junto com amostras muito diferentes (contato, giro durante
-- a aquisição ou cursor solto). unstable: longe dos limites, mas disperso demais. ok: bloco bom.
create function gaxeta_private.adc_block(p_adc numeric, p_noise numeric, p_min integer, p_max integer)
 returns text language sql immutable set search_path = '' as $$
  select case
    when p_adc is null then 'missing'
    when coalesce(p_min, case when p_adc >= 4095 then 4095 end) >= 4095 then 'ceiling'
    when coalesce(p_max, case when p_adc <= 0 then 0 end) <= 0 then 'floor'
    when p_max >= 4095 and (p_max - p_min > 400 or coalesce(p_noise, 0) > 25) then 'mixed_high'
    when p_min <= 0 and (p_max - p_min > 400 or coalesce(p_noise, 0) > 25) then 'mixed_low'
    when p_max >= 4095 or p_adc >= 4095 then 'touch_high'
    when p_min <= 0 or p_adc <= 0 then 'touch_low'
    when p_noise is null and p_min is null then 'unknown'
    when coalesce(p_noise, 0) > 25 or p_max - p_min > 400 then 'unstable'
    else 'ok' end
$$;

create function public.gaxeta_telemetry_summary(p_sensor_ids text[])
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
comment on function public.gaxeta_telemetry_summary(text[]) is
  'Leitura elétrica atual e cadência de envio por sensor (com ou sem vínculo), limitada ao período que o usuário pode ler. Não consulta nem cria ciclo, referência ou perfil de gaxeta.';

revoke all on function gaxeta_private.adc_block(numeric, numeric, integer, integer) from public, anon, authenticated, service_role;
revoke all on function public.gaxeta_telemetry_summary(text[]) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_telemetry_summary(text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Histórico: escala do percentual por intervalo (campos aditivos)
-- ---------------------------------------------------------------------------
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

notify pgrst, 'reload schema';
commit;
