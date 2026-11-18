-- Migração 10: tensão calibrada, qualidade do bloco e referência na marca superior validada.
--
-- Procedimento de troca que esta migração implementa (regra 2):
--   1. O técnico reposiciona o potenciômetro na MARCA SUPERIOR validada da montagem.
--   2. Mede com o paquímetro a distância inicial (D100) e registra o engaxetamento.
--   3. A plataforma só aceita como referência (V100) uma leitura posterior ao registro,
--      recente, estável, sem saturação e dentro da faixa elétrica esperada da marca
--      superior. Sem faixa caracterizada, o técnico confirma a leitura com a marca mantida.
--   4. Distância e percentual saem da grandeza elétrica calibrada (mV) e de uma inclinação
--      comprovada na montagem (segundo ponto medido, extremos do perfil ou razão de
--      transmissão documentada). Não há mais recurso ao curso nominal do firmware.
--
-- Os ciclos registrados antes desta migração (regra 1) continuam com o cálculo que
-- tinham, identificados como estimativa nominal. Um perfil novo vale adiante.
--
-- Ingestão: gaxeta_ingest_v3 não muda. O invólucro gaxeta_ingest passa a gravar os
-- campos novos e opcionais do firmware 4.3.0 (voltage_mv, adc_min, adc_max, acq_method)
-- e a aprovar a amostra de referência. O contrato de voltage_v, adc_raw, travel_percent
-- e position_mm é o mesmo; firmware antigo continua aceito e os campos novos ficam nulos.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 1. Telemetria: campos aditivos, com unidade e origem explícitas
-- ---------------------------------------------------------------------------
alter table public.gaxeta_readings
  add column voltage_mv integer,
  add column adc_min smallint,
  add column adc_max smallint,
  add column acq_method text,
  add constraint gaxeta_readings_voltage_mv_check check (voltage_mv between 0 and 5000),
  add constraint gaxeta_readings_adc_block_check
    check (adc_min between 0 and 4095 and adc_max between 0 and 4095 and adc_min <= adc_max);
comment on column public.gaxeta_readings.voltage_mv is
  'Tensão no pino do ADC, em mV, calibrada pelo ADC da placa (coeficientes de fábrica), média das mesmas amostras de adc_raw. Nula em firmware anterior ao 4.3.0. voltage_v continua sendo a estimativa adc_raw × 3,3 / 4095.';
comment on column public.gaxeta_readings.adc_min is 'Menor amostra bruta do bloco (contagens). Zero indica saturação inferior.';
comment on column public.gaxeta_readings.adc_max is 'Maior amostra bruta do bloco (contagens). 4095 indica saturação superior.';
comment on column public.gaxeta_readings.acq_method is
  'Identificador do método de aquisição informado pelo firmware (entrada, atenuação, amostras, esquema de calibração). Uma calibração só compara leituras do mesmo método.';

alter table public.gaxeta_devices
  add column last_voltage_mv integer,
  add column last_adc_raw numeric(8,3),
  add column last_adc_min smallint,
  add column last_adc_max smallint,
  add column last_acq_method text;

create or replace function public.gaxeta_ingest(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare result jsonb; name text; noise numeric; d public.gaxeta_devices%rowtype; next_value numeric;
 v_mv integer; v_min integer; v_max integer; v_method text; v_current boolean := false;
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
 select * into d from public.gaxeta_devices where sensor_id=p_reading->>'sensor_id' for update;
 if d.last_boot_id=p_reading->>'boot_id' and d.last_sequence=(p_reading->>'sequence')::bigint then
 v_current:=true;
 next_value:=gaxeta_private.stabilize(d.stable_percent,d.last_percent);
 if next_value is distinct from d.stable_percent then
 insert into public.gaxeta_movements(reading_id,sensor_id,received_at,previous_percent,stable_percent)
 values((result->>'id')::bigint,d.sensor_id,(result->>'received_at')::timestamptz,d.stable_percent,next_value);
 d.stable_since:=(result->>'received_at')::timestamptz;
 end if;
 d.stable_percent:=next_value;
 -- Diagnóstico da leitura atual: mesma proteção contra envio atrasado ou fora de ordem
 -- (só a amostra que virou a leitura atual do sensor atualiza estes campos).
 update public.gaxeta_devices set stable_percent=d.stable_percent,stable_since=d.stable_since,
 applied_label=case when name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then name else applied_label end,
 ble_mac=coalesce(left(p_reading->>'ble_mac',32),ble_mac),
 firmware_version=coalesce(left(p_reading->>'firmware_version',32),firmware_version),
 adc_noise=coalesce(noise,adc_noise),transport='direct_wifi',
 last_voltage_mv=v_mv,last_adc_raw=(p_reading->>'adc_raw')::numeric,last_adc_min=v_min,last_adc_max=v_max,last_acq_method=v_method
 where sensor_id=d.sensor_id;
 end if;
 update public.gaxeta_readings set adc_noise=noise,stable_percent=d.stable_percent,
 voltage_mv=v_mv,adc_min=v_min,adc_max=v_max,acq_method=v_method where id=(result->>'id')::bigint;
 -- Referência do ciclo de gaxeta: só a leitura atual de um sensor vinculado pode ser aprovada.
 -- Uma falha aqui nunca rejeita a telemetria.
 if v_current and d.measurement_point_id is not null then
  begin
   perform gaxeta_private.gland_try_anchor((result->>'id')::bigint);
  exception when others then
   raise warning 'gland_try_anchor(%): %', result->>'id', sqlerrm;
  end;
 end if;
 return result;
end $function$;

-- ---------------------------------------------------------------------------
-- 2. Eventos: versão da regra. Os existentes ficam na regra 1; os novos, na regra 2.
-- ---------------------------------------------------------------------------
alter table gaxeta_private.gland_events add column rule_version smallint not null default 1;
alter table gaxeta_private.gland_events alter column rule_version set default 2;
alter table gaxeta_private.gland_events add constraint gland_events_rule_check check (rule_version in (1, 2));
comment on column gaxeta_private.gland_events.rule_version is
  '1: regra anterior (referência em qualquer posição do potenciômetro, curso nominal do firmware quando não há conferência). 2: referência na marca superior validada, grandeza elétrica calibrada e inclinação comprovada na montagem.';

-- ---------------------------------------------------------------------------
-- 3. Amostra de referência aprovada: uma por evento, gravada uma vez, nunca trocada
-- ---------------------------------------------------------------------------
create table gaxeta_private.gland_anchors (
  event_id bigint primary key references gaxeta_private.gland_events(id),
  reading_id bigint not null,
  approved_at timestamptz not null default clock_timestamp(),
  approved_by uuid,
  mode text not null check (mode in ('window', 'confirmed', 'check')),
  quantity text not null check (quantity in ('mv', 'adc')),
  acq_method text,
  value numeric(10,3) not null,
  adc_raw numeric(8,3) not null,
  voltage_mv integer,
  adc_noise numeric,
  sampled_at timestamptz not null,
  received_at timestamptz not null,
  window_lo numeric(10,3),
  window_hi numeric(10,3),
  check ((mode = 'confirmed') = (approved_by is not null))
);
alter table gaxeta_private.gland_anchors enable row level security;
revoke all on table gaxeta_private.gland_anchors from public, anon, authenticated, service_role;
comment on table gaxeta_private.gland_anchors is
  'Amostra que confirmou cada evento do ciclo de gaxeta (regra 2). window: aprovada sozinha, dentro da faixa elétrica esperada da marca superior; confirmed: confirmada pelo técnico com a marca mantida; check: leitura associada a uma conferência de medida. Os valores são copiados da leitura no momento da aprovação: pacote atrasado, nova conferência ou recálculo não trocam a referência.';

-- ---------------------------------------------------------------------------
-- 4. Perfil versionado por instalação (vínculo sensor–spot)
-- ---------------------------------------------------------------------------
create table gaxeta_private.gland_profiles (
  id bigint generated always as identity primary key,
  link_id bigint not null references gaxeta_private.device_links(id),
  version integer not null,
  created_at timestamptz not null default clock_timestamp(),
  created_by uuid not null,
  request_id uuid not null,
  quantity text not null check (quantity in ('mv', 'adc')),
  acq_method text,
  high_value numeric(10,3),
  high_tolerance numeric(10,3),
  low_value numeric(10,3),
  valid_lo numeric(10,3),
  valid_hi numeric(10,3),
  mm_per_unit numeric(14,8),
  noise_max numeric(8,3),
  note text,
  unique (link_id, version),
  unique (link_id, request_id),
  check (high_value is null or (high_value between 0 and 5000 and high_tolerance > 0 and high_tolerance <= 1000)),
  check (low_value is null or low_value between 0 and 5000),
  check (low_value is null or high_value is null or high_value > low_value),
  check ((valid_lo is null) = (valid_hi is null) and (valid_lo is null or (valid_lo >= 0 and valid_hi <= 5000 and valid_lo < valid_hi))),
  check (mm_per_unit is null or (mm_per_unit > 0 and mm_per_unit <= 5 and valid_lo is not null and note is not null)),
  check (noise_max is null or noise_max between 1 and 25)
);
create index gland_profiles_link_recent on gaxeta_private.gland_profiles (link_id, version desc);
alter table gaxeta_private.gland_profiles enable row level security;
revoke all on table gaxeta_private.gland_profiles from public, anon, authenticated, service_role;
comment on table gaxeta_private.gland_profiles is
  'Perfil elétrico e mecânico medido de uma instalação, versionado. high_value ± high_tolerance: faixa esperada da marca superior (100 %); low_value: valor elétrico da marca de fim de ajuste (0 %); valid_lo..valid_hi: faixa em que a resposta foi comprovada linear; mm_per_unit: razão de transmissão medida e documentada (note). Cada versão vale da sua criação em diante; leituras anteriores continuam com a versão da época.';

-- ---------------------------------------------------------------------------
-- 5. Qualidade da amostra e grandeza comparável
-- ---------------------------------------------------------------------------
-- 'ok' quando o bloco serve para calibrar. A saturação usa a média e, quando o firmware
-- informa, o mínimo e o máximo do bloco: uma única amostra no limite já invalida.
create function gaxeta_private.gland_quality(p_adc numeric, p_noise numeric, p_min integer, p_max integer, p_noise_max numeric)
 returns text language sql immutable set search_path = '' as $$
  select case
    when p_adc is null or p_noise is null then 'missing'
    when p_adc >= 4095 or coalesce(p_max, 0) >= 4095 then 'saturated_high'
    when p_adc <= 0 or coalesce(p_min, 1) <= 0 then 'saturated_low'
    when p_noise < 0 or p_noise > coalesce(p_noise_max, 25) then 'unstable'
    else 'ok' end
$$;

-- Valor de uma leitura na grandeza de uma calibração. Em mV, só leituras do mesmo método
-- de aquisição são comparáveis. Em contagens, vale o bloco bruto de qualquer firmware.
create function gaxeta_private.gland_qvalue(p_quantity text, p_method text, p_adc numeric, p_mv integer, p_reading_method text)
 returns numeric language sql immutable set search_path = '' as $$
  select case when p_quantity = 'mv'
              then case when p_reading_method is not distinct from p_method then p_mv::numeric end
              else p_adc end
$$;

create function gaxeta_private.gland_profile_at(p_link_id bigint, p_at timestamptz)
 returns gaxeta_private.gland_profiles language sql stable set search_path = '' as $$
  select p.* from gaxeta_private.gland_profiles p
   where p.link_id = p_link_id and p.created_at <= p_at order by p.version desc limit 1
$$;

-- Faixa elétrica esperada da marca superior numa instalação: a do perfil, ou a última
-- referência confirmada pelo técnico (a mais recente das duas). Nula enquanto a marca
-- não foi caracterizada. Tolerância provisória sem perfil: ±60 mV ou ±75 contagens.
create function gaxeta_private.gland_window(p_link_id bigint, p_at timestamptz)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  p gaxeta_private.gland_profiles%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  v_tol numeric;
begin
  p := gaxeta_private.gland_profile_at(p_link_id, p_at);
  select x.* into a from gaxeta_private.gland_anchors x
    join gaxeta_private.gland_events e on e.id = x.event_id
   where e.link_id = p_link_id and e.kind <> 'check' and x.mode = 'confirmed' and x.approved_at <= p_at
   order by x.approved_at desc limit 1;
  if p.id is not null and p.high_value is not null and (a.event_id is null or p.created_at >= a.approved_at) then
    return jsonb_build_object('source', 'profile', 'profile_version', p.version, 'quantity', p.quantity,
      'acq_method', p.acq_method, 'center', p.high_value, 'tolerance', p.high_tolerance,
      'lo', p.high_value - p.high_tolerance, 'hi', p.high_value + p.high_tolerance);
  elsif a.event_id is not null then
    v_tol := case when p.id is not null and p.high_tolerance is not null and p.quantity = a.quantity then p.high_tolerance
                  when a.quantity = 'mv' then 60 else 75 end;
    return jsonb_build_object('source', 'confirmed', 'event_id', a.event_id::text, 'quantity', a.quantity,
      'acq_method', a.acq_method, 'center', a.value, 'tolerance', v_tol, 'lo', a.value - v_tol, 'hi', a.value + v_tol);
  end if;
  return null;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Aprovação da amostra de referência na chegada da leitura
-- ---------------------------------------------------------------------------
-- Chamada pelo invólucro de ingestão para a leitura que acabou de virar a leitura atual.
-- Ficam de fora: pacote atrasado (mais de 30 s entre amostra e chegada), amostra colhida
-- antes do registro, bloco instável ou saturado e valor fora da faixa esperada.
create function gaxeta_private.gland_try_anchor(p_reading_id bigint)
 returns void language plpgsql set search_path = '' as $$
declare
  r public.gaxeta_readings%rowtype;
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  cyc gaxeta_private.gland_events%rowtype;
  c gaxeta_private.gland_events%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  w jsonb; v numeric;
begin
  select * into r from public.gaxeta_readings where id = p_reading_id;
  if r.id is null then return; end if;
  select * into d from public.gaxeta_devices where sensor_id = r.sensor_id;
  if d.measurement_point_id is null or d.last_boot_id is distinct from r.boot_id
     or d.last_sequence is distinct from r.sequence then return; end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if l.id is null then return; end if;
  select * into cyc from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  if cyc.id is null or cyc.kind = 'maintenance' or cyc.rule_version < 2 then return; end if;
  if r.sampled_at is null or r.sampled_at < cyc.recorded_at or r.sampled_at > r.received_at
     or r.received_at - r.sampled_at > interval '30 seconds' then return; end if;
  p := gaxeta_private.gland_profile_at(l.id, r.received_at);
  if gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, p.noise_max) <> 'ok' then return; end if;

  select * into a from gaxeta_private.gland_anchors where event_id = cyc.id;
  if a.event_id is null then
    w := gaxeta_private.gland_window(l.id, r.received_at);
    if w is null then return; end if;  -- marca superior ainda não caracterizada: o técnico confirma
    v := gaxeta_private.gland_qvalue(w ->> 'quantity', w ->> 'acq_method', r.adc_raw, r.voltage_mv, r.acq_method);
    if v is null or v < (w ->> 'lo')::numeric or v > (w ->> 'hi')::numeric then return; end if;
    insert into gaxeta_private.gland_anchors (event_id, reading_id, mode, quantity, acq_method, value,
        adc_raw, voltage_mv, adc_noise, sampled_at, received_at, window_lo, window_hi)
    values (cyc.id, r.id, 'window', w ->> 'quantity', w ->> 'acq_method', v,
        r.adc_raw, r.voltage_mv, r.adc_noise, r.sampled_at, r.received_at, (w ->> 'lo')::numeric, (w ->> 'hi')::numeric)
    on conflict (event_id) do nothing;
    return;
  end if;

  -- Conferência de medida: só a mais recente ainda sem leitura recebe esta amostra.
  select * into c from gaxeta_private.gland_events
    where link_id = l.id and kind = 'check' and id > cyc.id order by id desc limit 1;
  if c.id is null or r.sampled_at < c.recorded_at
     or exists (select 1 from gaxeta_private.gland_anchors x where x.event_id = c.id) then return; end if;
  v := gaxeta_private.gland_qvalue(a.quantity, a.acq_method, r.adc_raw, r.voltage_mv, r.acq_method);
  if v is null then return; end if;
  insert into gaxeta_private.gland_anchors (event_id, reading_id, mode, quantity, acq_method, value,
      adc_raw, voltage_mv, adc_noise, sampled_at, received_at)
  values (c.id, r.id, 'check', a.quantity, a.acq_method, v, r.adc_raw, r.voltage_mv, r.adc_noise, r.sampled_at, r.received_at)
  on conflict (event_id) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Modelo de conversão de um ciclo (regra 2), válido num instante
-- ---------------------------------------------------------------------------
-- distância = D100 + k × (V − V100);  fração = (V − V0) / (V100 − V0);  avanço = D100 − distância.
-- k (mm por unidade elétrica) só existe quando comprovado na montagem:
--   measured  : segundo ponto medido (conferência) com amplitude suficiente, sentido
--               esperado (a distância cai quando a tensão cai) e, havendo mais pontos no
--               mesmo ciclo, resíduo dentro da tolerância de linearidade;
--   endpoints : marca de fim de ajuste do perfil (V0) e distância de fim de ajuste (D0);
--   ratio     : razão de transmissão medida e documentada no perfil.
-- Entre perfil e conferência, vale o mais recente. A faixa validada é o intervalo elétrico
-- coberto pelos pontos medidos (ou o declarado no perfil).
create function gaxeta_private.gland_model(p_link_id bigint, p_cycle_id bigint, p_at timestamptz)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  e gaxeta_private.gland_events%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  c record;
  v_k numeric; v_src text := 'none'; v_reason text := 'none'; v_src_at timestamptz; v_src_event bigint; v_src_cycle bigint;
  v_lo numeric; v_hi numeric; v_tol numeric; v_v0 numeric; v_end_ok boolean := false;
  v_span numeric; v_min_span numeric; v_try numeric; v_max_res numeric; v_points integer := 0;
  v_d100 numeric; v_v100 numeric; v_lin_tol numeric; v_unit_per_count numeric; v_res_mm numeric;
  v_profile_newer boolean;
begin
  select * into e from gaxeta_private.gland_events where id = p_cycle_id and link_id = p_link_id;
  select * into a from gaxeta_private.gland_anchors where event_id = p_cycle_id and approved_at <= p_at;
  if e.id is null or a.event_id is null then
    return jsonb_build_object('anchored', false, 'source', 'none', 'reason', 'no_anchor');
  end if;
  p := gaxeta_private.gland_profile_at(p_link_id, p_at);
  if p.id is not null and (p.quantity <> a.quantity or p.acq_method is distinct from a.acq_method) then
    p := null;
    v_reason := 'method_changed';
  end if;

  -- Conferência válida mais recente da instalação, na mesma grandeza e método.
  for c in
    select ce.id, ce.initial_mm as mm, ca.value as val, ca.approved_at, ca.adc_noise as noise,
           cy.id as cycle_id, cy.initial_mm as d100, ya.value as v100, ya.adc_noise as noise100
      from gaxeta_private.gland_events ce
      join gaxeta_private.gland_anchors ca on ca.event_id = ce.id
      cross join lateral (select g.* from gaxeta_private.gland_events g
                           where g.link_id = ce.link_id and g.kind <> 'check' and g.id < ce.id
                           order by g.id desc limit 1) cy
      join gaxeta_private.gland_anchors ya on ya.event_id = cy.id
     where ce.link_id = p_link_id and ce.kind = 'check' and ce.rule_version >= 2 and cy.rule_version >= 2
       and cy.kind <> 'maintenance' and ca.approved_at <= p_at
       and ca.quantity = a.quantity and ca.acq_method is not distinct from a.acq_method
       and ya.quantity = a.quantity and ya.acq_method is not distinct from a.acq_method
     order by ca.approved_at desc limit 12
  loop
    v_span := c.val - c.v100;
    v_min_span := greatest(100, 8 * greatest(coalesce(c.noise, 0), coalesce(c.noise100, 0)));
    if abs(v_span) < v_min_span then
      if v_reason = 'none' then v_reason := 'insufficient_span'; end if;
      continue;
    end if;
    v_try := (c.mm - c.d100) / v_span;
    if v_try <= 0 then
      v_reason := 'inverted';  -- a distância subiu quando a tensão caiu: conferir montagem e ligação
      exit;
    end if;
    if v_try < 0.00002 or v_try > 5 then
      if v_reason = 'none' then v_reason := 'incoherent'; end if;
      continue;
    end if;
    v_src_cycle := c.cycle_id; v_d100 := c.d100; v_v100 := c.v100; v_src_at := c.approved_at;
    exit;
  end loop;

  if v_src_cycle is not null then
    -- No ciclo dessa conferência, a inclinação vem do ponto mais distante da referência;
    -- os demais pontos medidos verificam a linearidade.
    select ce.id, (ce.initial_mm - v_d100) / (ca.value - v_v100), abs(ce.initial_mm - v_d100)
      into v_src_event, v_k, v_lin_tol
      from gaxeta_private.gland_events ce join gaxeta_private.gland_anchors ca on ca.event_id = ce.id
     where ce.link_id = p_link_id and ce.kind = 'check' and ce.id > v_src_cycle
       and ca.approved_at <= p_at and ca.approved_at < gaxeta_private.gland_stop(p_link_id, v_src_cycle)
       and ca.quantity = a.quantity and ca.acq_method is not distinct from a.acq_method
       and abs(ca.value - v_v100) >= 100 and (ce.initial_mm - v_d100) / (ca.value - v_v100) between 0.00002 and 5
     order by abs(ca.value - v_v100) desc, ce.id desc limit 1;
    v_lin_tol := greatest(0.3, 0.05 * v_lin_tol);
    select max(abs(ce.initial_mm - (v_d100 + v_k * (ca.value - v_v100)))), count(*),
           least(v_v100, min(ca.value)), greatest(v_v100, max(ca.value))
      into v_max_res, v_points, v_lo, v_hi
      from gaxeta_private.gland_events ce join gaxeta_private.gland_anchors ca on ca.event_id = ce.id
     where ce.link_id = p_link_id and ce.kind = 'check' and ce.id > v_src_cycle
       and ca.approved_at <= p_at and ca.approved_at < gaxeta_private.gland_stop(p_link_id, v_src_cycle)
       and ca.quantity = a.quantity and ca.acq_method is not distinct from a.acq_method;
    if v_max_res > v_lin_tol then
      v_k := null; v_reason := 'nonlinear'; v_lo := null; v_hi := null;
    else
      v_src := 'measured'; v_reason := 'none';
    end if;
  end if;

  -- Perfil mais recente que a conferência (ou único disponível).
  v_profile_newer := p.id is not null and (v_src_at is null or p.created_at > v_src_at);
  -- Os extremos do perfil só valem para um ciclo cuja referência está na marca superior do perfil.
  if v_profile_newer and p.low_value is not null and e.end_mm is not null
     and (p.high_value is null or abs(a.value - p.high_value) <= p.high_tolerance) then
    if a.value - p.low_value >= 100 then
      v_k := (e.initial_mm - e.end_mm) / (a.value - p.low_value);
      v_src := 'endpoints'; v_reason := 'none'; v_src_event := null; v_max_res := null; v_points := 0;
      v_lo := p.low_value; v_hi := a.value;
    elsif v_k is null then
      v_reason := 'insufficient_span';
    end if;
  elsif v_profile_newer and p.mm_per_unit is not null then
    v_k := p.mm_per_unit; v_src := 'ratio'; v_reason := 'none'; v_src_event := null; v_max_res := null; v_points := 0;
    v_lo := p.valid_lo; v_hi := p.valid_hi;
  end if;
  if v_k is not null and p.id is not null and p.valid_lo is not null and (v_src <> 'measured' or v_profile_newer) then
    v_lo := p.valid_lo; v_hi := p.valid_hi;
  end if;

  if v_k is not null then
    -- A marca superior deste ciclo pertence à faixa validada (foi aprovada dentro da faixa esperada).
    v_lo := least(v_lo, a.value); v_hi := greatest(v_hi, a.value);
    v_tol := greatest(15, 0.02 * (v_hi - v_lo));
    if e.end_mm is not null then
      v_v0 := a.value - (e.initial_mm - e.end_mm) / v_k;
      v_end_ok := v_v0 >= v_lo - v_tol and v_v0 <= v_hi + v_tol and a.value - v_v0 > 0;
    end if;
    -- Menor movimento distinguível: três vezes a dispersão do bloco, convertida em mm.
    v_unit_per_count := case when a.quantity = 'mv' and a.adc_raw > 0 then a.voltage_mv / a.adc_raw else 1 end;
    v_res_mm := v_k * 3 * greatest(coalesce(a.adc_noise, 0), 1) * v_unit_per_count;
  end if;

  return jsonb_build_object('anchored', true, 'quantity', a.quantity,
    'unit', case when a.quantity = 'mv' then 'mV' else 'contagens' end, 'acq_method', a.acq_method,
    'v100', a.value, 'd100', e.initial_mm, 'd0', e.end_mm,
    'source', v_src, 'reason', v_reason, 'k', v_k, 'mm_per_unit', round(v_k, 6),
    'source_event_id', v_src_event::text, 'source_at', v_src_at,
    'profile_version', case when v_src in ('endpoints', 'ratio') or (v_k is not null and v_profile_newer) then p.version end,
    'valid_lo', v_lo, 'valid_hi', v_hi, 'edge_tol', v_tol, 'v0', round(v_v0, 1), 'end_ok', v_end_ok,
    'resolution_mm', round(v_res_mm, 3), 'points', v_points, 'max_residual_mm', round(v_max_res, 3));
end $$;

-- Distância, percentual e avanço de um valor elétrico num modelo. Nulo sem inclinação.
create function gaxeta_private.gland_eval(p_model jsonb, p_value numeric)
 returns jsonb language sql immutable set search_path = '' as $$
  select case when x.k is null or p_value is null then null else jsonb_build_object(
      'distance_mm', round(x.d100 + x.k * (p_value - x.v100), 2),
      'advance_mm', round(-x.k * (p_value - x.v100), 2),
      'percent', case when x.end_ok then round(100 * (p_value - x.v0) / (x.v100 - x.v0), 1) end,
      'in_range', p_value >= x.lo - x.tol and p_value <= x.hi + x.tol,
      'side', case when p_value > x.hi + x.tol then 'above' when p_value < x.lo - x.tol then 'below' end)
    end
  from (select (p_model ->> 'k')::numeric as k, (p_model ->> 'v100')::numeric as v100,
               (p_model ->> 'd100')::numeric as d100, (p_model ->> 'd0')::numeric as d0,
               (p_model ->> 'v100')::numeric - ((p_model ->> 'd100')::numeric - (p_model ->> 'd0')::numeric) / nullif((p_model ->> 'k')::numeric, 0) as v0,
               coalesce((p_model ->> 'end_ok')::boolean, false) as end_ok,
               (p_model ->> 'valid_lo')::numeric as lo, (p_model ->> 'valid_hi')::numeric as hi,
               (p_model ->> 'edge_tol')::numeric as tol) x
$$;

-- ---------------------------------------------------------------------------
-- 8. Estado atual do ciclo (substitui a versão da migração 09; a regra 1 fica como era)
-- ---------------------------------------------------------------------------
create or replace function gaxeta_private.gland_state(d public.gaxeta_devices, win tstzmultirange)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  v_last_id bigint; anchor jsonb; scale jsonb; val jsonb; model jsonb; w jsonb; cur jsonb; cand jsonb;
  status text := 'no_reference'; v_wait text; v_reason text; v_quality text; v_fresh boolean; v_value numeric;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and unlinked_at is null and linked_at <@ win;
  if l.id is null then
    return jsonb_build_object('state', 'unlinked', 'can_operate', false);
  end if;
  select id into v_last_id from gaxeta_private.gland_events where link_id = l.id order by id desc limit 1;
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  select * into r from public.gaxeta_readings
    where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  p := gaxeta_private.gland_profile_at(l.id, v_now);
  v_quality := gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, p.noise_max);
  v_fresh := coalesce(r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds', false);
  -- Leitura atual com a origem de cada grandeza: tensão calibrada quando o firmware envia,
  -- senão a estimativa adc × 3,3 / 4095 de sempre.
  cur := case when r.id is null then null else jsonb_build_object(
    'reading_id', r.id::text, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
    'adc', r.adc_raw, 'adc_min', r.adc_min, 'adc_max', r.adc_max, 'noise', r.adc_noise,
    'voltage_mv', coalesce(r.voltage_mv, round(r.voltage_v * 1000)::integer),
    'voltage_source', case when r.voltage_mv is not null then 'calibrated' else 'estimated' end,
    'acq_method', r.acq_method, 'quality', v_quality, 'fresh', v_fresh) end;

  if e.kind = 'maintenance' then
    status := 'maintenance';

  elsif e.id is not null and e.rule_version < 2 then
    -- Regra 1 (ciclos anteriores a esta migração): cálculo preservado, estimativa nominal.
    anchor := gaxeta_private.gland_anchor(d.sensor_id, e.recorded_at, 'infinity'::timestamptz);
    status := 'waiting';
    if anchor is not null then
      status := 'unusable';
      scale := gaxeta_private.gland_scale(d.sensor_id, l.id, v_now);
      if r.sampled_at >= (anchor ->> 'sampled_at')::timestamptz
         and r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds'
         and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise) then
        status := 'active';
        val := gaxeta_private.gland_value(e.initial_mm, e.end_mm, anchor,
                 (scale ->> 'mm_per_count')::numeric, r.adc_raw, r.position_mm);
      end if;
    end if;
    return jsonb_build_object('state', status, 'rule', 1, 'calibrated', false, 'link_id', l.id::text,
      'event_id', v_last_id::text, 'cycle_event_id', e.id::text, 'kind', e.kind,
      'can_operate', gaxeta_authz.can_operate_point(l.point_id),
      'initial_mm', e.initial_mm, 'end_mm', e.end_mm, 'recorded_at', e.recorded_at,
      'anchor', anchor, 'scale', scale, 'current', cur,
      'current_adc', case when val is not null then r.adc_raw end,
      'current_sampled_at', case when val is not null then r.sampled_at end,
      'delta_adc', case when val is not null then r.adc_raw - (anchor ->> 'adc')::numeric end,
      'distance_mm', val -> 'distance_mm', 'percent', val -> 'percent',
      'advance_mm', case when val is not null then e.initial_mm - (val ->> 'distance_mm')::numeric end,
      'out_of_range', coalesce((val ->> 'percent')::numeric not between -5 and 105, false),
      'near_limit', coalesce(val is not null and (r.adc_raw <= 205 or r.adc_raw >= 3890), false));

  elsif e.id is not null then
    -- Regra 2: referência na marca superior validada.
    select * into a from gaxeta_private.gland_anchors where event_id = e.id;
    if a.event_id is null then
      status := 'waiting';
      w := gaxeta_private.gland_window(l.id, v_now);
      if r.id is null or r.sampled_at is null or r.sampled_at < e.recorded_at
         or d.last_received_at < e.recorded_at then
        v_wait := 'no_sample';
      elsif v_quality <> 'ok' then
        v_wait := v_quality;
      elsif not v_fresh then
        v_wait := 'stale';
      else
        v_value := case when w is null then coalesce(r.voltage_mv::numeric, r.adc_raw)
                        else gaxeta_private.gland_qvalue(w ->> 'quantity', w ->> 'acq_method', r.adc_raw, r.voltage_mv, r.acq_method) end;
        v_wait := case when w is null then 'needs_confirmation'
                       when v_value is null then 'method_changed'
                       else 'outside_window' end;
        -- Leitura que o técnico pode confirmar com a marca superior fisicamente mantida.
        cand := jsonb_build_object('reading_id', r.id::text, 'sampled_at', r.sampled_at,
          'quantity', case when r.voltage_mv is not null then 'mv' else 'adc' end,
          'value', coalesce(r.voltage_mv::numeric, r.adc_raw), 'adc', r.adc_raw, 'voltage_mv', r.voltage_mv, 'noise', r.adc_noise);
      end if;
    else
      anchor := jsonb_build_object('id', a.reading_id::text, 'sampled_at', a.sampled_at, 'approved_at', a.approved_at,
        'mode', a.mode, 'quantity', a.quantity, 'value', a.value, 'adc', a.adc_raw, 'voltage_mv', a.voltage_mv,
        'noise', a.adc_noise, 'percent', 100, 'window_lo', a.window_lo, 'window_hi', a.window_hi,
        'actor', (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = a.approved_by));
      model := gaxeta_private.gland_model(l.id, e.id, v_now);
      w := gaxeta_private.gland_window(l.id, v_now);
      v_value := gaxeta_private.gland_qvalue(a.quantity, a.acq_method, r.adc_raw, r.voltage_mv, r.acq_method);
      if r.id is null or r.sampled_at < a.sampled_at or v_quality <> 'ok' or not v_fresh then
        status := 'unusable';
        v_reason := case when v_quality <> 'ok' then v_quality when not v_fresh then 'stale' else 'no_sample' end;
      elsif v_value is null then
        status := 'no_scale'; v_reason := 'method_changed';
      elsif model ->> 'k' is null then
        status := 'no_scale'; v_reason := model ->> 'reason';
      else
        val := gaxeta_private.gland_eval(model, v_value);
        status := case when not (val ->> 'in_range')::boolean then 'out_of_range'
                       when not (model ->> 'end_ok')::boolean then 'no_end'
                       else 'active' end;
        v_reason := case when status = 'out_of_range' then val ->> 'side'
                         when status = 'no_end' then case when e.end_mm is null then 'missing' else 'outside_validated' end end;
      end if;
      scale := case when model ->> 'k' is null
        then jsonb_build_object('source', 'none', 'reason', model ->> 'reason', 'unit', model ->> 'unit')
        else jsonb_build_object('source', model ->> 'source', 'mm_per_unit', model -> 'mm_per_unit', 'unit', model ->> 'unit',
          'event_id', model ->> 'source_event_id', 'recorded_at', model -> 'source_at', 'profile_version', model -> 'profile_version',
          'valid_lo', model -> 'valid_lo', 'valid_hi', model -> 'valid_hi', 'v0', model -> 'v0', 'end_ok', model -> 'end_ok',
          'resolution_mm', model -> 'resolution_mm', 'points', model -> 'points', 'max_residual_mm', model -> 'max_residual_mm') end;
    end if;
  end if;

  return jsonb_build_object('state', status, 'rule', e.rule_version,
    'calibrated', status = 'active', 'link_id', l.id::text,
    'event_id', v_last_id::text, 'cycle_event_id', e.id::text, 'kind', e.kind,
    'can_operate', gaxeta_authz.can_operate_point(l.point_id),
    'initial_mm', e.initial_mm, 'end_mm', e.end_mm, 'recorded_at', e.recorded_at,
    'anchor', anchor, 'scale', scale, 'current', cur, 'window', w, 'candidate', cand,
    'wait_reason', v_wait, 'reason', v_reason, 'unit', coalesce(model ->> 'unit', case when w ->> 'quantity' = 'adc' then 'contagens' when w is not null then 'mV' end),
    'value', v_value,
    'current_adc', case when val is not null then r.adc_raw end,
    'current_sampled_at', case when val is not null then r.sampled_at end,
    'delta_adc', case when val is not null then r.adc_raw - a.adc_raw end,
    'distance_mm', val -> 'distance_mm', 'percent', val -> 'percent', 'advance_mm', val -> 'advance_mm',
    'out_of_range', coalesce(status = 'out_of_range', false),
    'near_limit', coalesce((r.adc_raw <= 205 or r.adc_raw >= 3890) and e.kind <> 'maintenance', false));
end $$;

-- ---------------------------------------------------------------------------
-- 9. Confirmação da referência pelo técnico (marca superior mantida)
-- ---------------------------------------------------------------------------
-- Usada no comissionamento, enquanto a marca superior da instalação não tem faixa elétrica
-- caracterizada, ou quando a leitura cai fora da faixa esperada e o técnico confirma, no
-- local, que a marca está certa. A leitura precisa ser a atual, posterior ao registro,
-- recente e estável. Uma referência aprovada não é substituída.
create function public.gaxeta_confirm_gland_anchor(
  p_sensor_id text, p_link_id text, p_event_id text, p_reading_id text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  w jsonb; v_quality text; v_quantity text;
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
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  if e.id is null or e.id::text is distinct from p_event_id or e.kind = 'maintenance' or e.rule_version < 2 then
    raise sqlstate 'PT409' using message = 'O ciclo mudou. Revise o estado atual e tente novamente.';
  end if;
  select * into a from gaxeta_private.gland_anchors where event_id = e.id;
  if found then
    if a.reading_id::text = p_reading_id then
      return jsonb_build_object('event_id', e.id::text, 'reading_id', a.reading_id::text, 'duplicate', true);
    end if;
    raise sqlstate 'PT409' using message = 'A referência deste ciclo já foi aprovada e não é substituída. Para outra referência, registre um novo engaxetamento.';
  end if;
  select * into r from public.gaxeta_readings
    where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  if r.id is null or r.id::text is distinct from p_reading_id then
    raise sqlstate 'PT409' using message = 'Chegou uma leitura mais nova. Confira o valor e confirme de novo.';
  end if;
  p := gaxeta_private.gland_profile_at(l.id, pg_catalog.clock_timestamp());
  v_quality := gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, p.noise_max);
  if r.sampled_at is null or r.sampled_at < e.recorded_at then
    raise invalid_parameter_value using message = 'A leitura é anterior ao registro. Mantenha o sensor na marca superior e aguarde a próxima leitura.';
  elsif r.sampled_at > r.received_at or r.received_at - r.sampled_at > interval '30 seconds' then
    raise invalid_parameter_value using message = 'A leitura chegou com atraso e não serve de referência. Aguarde a próxima.';
  elsif v_quality = 'saturated_high' then
    raise invalid_parameter_value using message = 'A leitura está no limite superior do ADC (saturada). Nesta placa a marca superior fica fora da faixa mensurável: a medida informada foi preservada, mas a calibração depende de ajuste no circuito.';
  elsif v_quality <> 'ok' then
    raise invalid_parameter_value using message = 'A leitura não está estável o bastante para servir de referência. Confira a fixação e aguarde a próxima.';
  end if;
  v_quantity := case when r.voltage_mv is not null then 'mv' else 'adc' end;
  w := gaxeta_private.gland_window(l.id, pg_catalog.clock_timestamp());
  insert into gaxeta_private.gland_anchors (event_id, reading_id, approved_by, mode, quantity, acq_method, value,
      adc_raw, voltage_mv, adc_noise, sampled_at, received_at, window_lo, window_hi)
  values (e.id, r.id, auth.uid(), 'confirmed', v_quantity, case when v_quantity = 'mv' then r.acq_method end,
      case when v_quantity = 'mv' then r.voltage_mv::numeric else r.adc_raw end,
      r.adc_raw, r.voltage_mv, r.adc_noise, r.sampled_at, r.received_at, (w ->> 'lo')::numeric, (w ->> 'hi')::numeric);
  perform gaxeta_private.audit('gland.anchor', 'sensor', d.sensor_id,
    (select x.corporation_id from public.gaxeta_assets x where x.id = l.point_id),
    jsonb_build_object('event_id', e.id, 'link_id', l.id, 'reading_id', r.id, 'quantity', v_quantity,
      'value', case when v_quantity = 'mv' then r.voltage_mv::numeric else r.adc_raw end,
      'adc_raw', r.adc_raw, 'expected', w));
  return jsonb_build_object('event_id', e.id::text, 'reading_id', r.id::text, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- 10. Perfil da instalação: nova versão (níveis 1 e 2)
-- ---------------------------------------------------------------------------
create function public.gaxeta_save_gland_profile(
  p_sensor_id text, p_link_id text, p_request_id uuid, p_profile jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  v_key text; v_version integer;
begin
  select * into d from public.gaxeta_devices
    where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null
     or coalesce(gaxeta_authz.my_role(), '') not in ('adm1', 'adm2')
     or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'O perfil de calibração é registrado por administradores de nível 1 ou 2.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if not found or l.id::text is distinct from p_link_id then
    raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.';
  end if;
  if p_request_id is null or p_profile is null or jsonb_typeof(p_profile) <> 'object' then
    raise invalid_parameter_value using message = 'Perfil inválido.';
  end if;
  select * into p from gaxeta_private.gland_profiles where link_id = l.id and request_id = p_request_id;
  if found then return jsonb_build_object('id', p.id::text, 'version', p.version, 'duplicate', true); end if;
  for v_key in select jsonb_object_keys(p_profile) loop
    if v_key not in ('quantity', 'acq_method', 'high_value', 'high_tolerance', 'low_value', 'valid_lo', 'valid_hi', 'mm_per_unit', 'noise_max', 'note') then
      raise invalid_parameter_value using message = 'Campo desconhecido no perfil: ' || v_key;
    end if;
    if v_key not in ('quantity', 'acq_method', 'note') and jsonb_typeof(p_profile -> v_key) not in ('number', 'null') then
      raise invalid_parameter_value using message = 'Valor numérico inválido em ' || v_key;
    end if;
  end loop;
  if coalesce(p_profile ->> 'quantity', '') not in ('mv', 'adc')
     or (p_profile ->> 'acq_method' is not null and p_profile ->> 'acq_method' !~ '^[a-z0-9][a-z0-9._-]{0,31}$')
     or length(coalesce(p_profile ->> 'note', '')) > 500 then
    raise invalid_parameter_value using message = 'Informe a grandeza (mv ou adc), o método de aquisição e uma observação de até 500 caracteres.';
  end if;
  select coalesce(max(version), 0) + 1 into v_version from gaxeta_private.gland_profiles where link_id = l.id;
  begin
    insert into gaxeta_private.gland_profiles (link_id, version, created_by, request_id, quantity, acq_method,
        high_value, high_tolerance, low_value, valid_lo, valid_hi, mm_per_unit, noise_max, note)
    values (l.id, v_version, auth.uid(), p_request_id, p_profile ->> 'quantity', p_profile ->> 'acq_method',
        (p_profile ->> 'high_value')::numeric,
        case when p_profile ->> 'high_value' is not null
             then coalesce((p_profile ->> 'high_tolerance')::numeric, case when p_profile ->> 'quantity' = 'mv' then 60 else 75 end) end,
        (p_profile ->> 'low_value')::numeric, (p_profile ->> 'valid_lo')::numeric, (p_profile ->> 'valid_hi')::numeric,
        (p_profile ->> 'mm_per_unit')::numeric, (p_profile ->> 'noise_max')::numeric, nullif(btrim(p_profile ->> 'note'), ''))
    returning * into p;
  exception when check_violation then
    raise invalid_parameter_value using message = 'Perfil incoerente: confira a marca superior e a tolerância, a marca de fim de ajuste (menor que a superior), a faixa validada (mínimo menor que máximo) e, para a razão de transmissão, a faixa validada e a observação com a medição.';
  end;
  perform gaxeta_private.audit('gland.profile', 'sensor', d.sensor_id,
    (select x.corporation_id from public.gaxeta_assets x where x.id = l.point_id),
    jsonb_build_object('profile_id', p.id, 'link_id', l.id, 'version', p.version) || (to_jsonb(p) - 'id' - 'link_id' - 'version' - 'created_by' - 'request_id' - 'created_at'));
  return jsonb_build_object('id', p.id::text, 'version', p.version, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- 11. Estado e histórico de eventos de um sensor (mesma assinatura)
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_gland_status(p_sensor_id text, p_history_before text default null)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  win tstzmultirange;
  events jsonb; st jsonb; profile jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32';
  win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  if d.sensor_id is null or win = '{}'::tstzmultirange then raise insufficient_privilege; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', h.id::text, 'link_id', h.link_id::text, 'kind', h.kind, 'rule', h.rule_version,
    'initial_mm', h.initial_mm, 'end_mm', h.end_mm, 'recorded_at', h.recorded_at,
    'actor', (select nullif(p.display_name, '') from gaxeta_private.user_profiles p where p.user_id = h.actor_id),
    'anchor', case
      when h.kind = 'maintenance' then null
      when h.rule_version >= 2 and h.cycle_rule >= 2 then
        (select jsonb_build_object('id', x.reading_id::text, 'sampled_at', x.sampled_at, 'approved_at', x.approved_at,
            'mode', x.mode, 'quantity', x.quantity, 'value', x.value, 'adc', x.adc_raw, 'voltage_mv', x.voltage_mv, 'noise', x.adc_noise,
            'actor', (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = x.approved_by))
           from gaxeta_private.gland_anchors x where x.event_id = h.id)
      else gaxeta_private.gland_anchor(d.sensor_id, h.recorded_at, gaxeta_private.gland_stop(h.link_id, h.id)) end
    ) order by h.id desc), '[]'::jsonb) into events
  from (
    select g.*, coalesce((select c.rule_version from gaxeta_private.gland_events c
                           where c.link_id = g.link_id and c.kind <> 'check' and c.id <= g.id order by c.id desc limit 1), g.rule_version) as cycle_rule
      from gaxeta_private.device_links dl
      join gaxeta_private.gland_events g on g.link_id = dl.id
     where dl.sensor_id = d.sensor_id and g.recorded_at <@ win
       and (p_history_before is null or g.id < p_history_before::bigint)
     order by g.id desc limit 20
  ) h;

  st := gaxeta_private.gland_state(d, win);
  select to_jsonb(q) into profile from (
    select p.version, p.created_at, p.quantity, p.acq_method, p.high_value, p.high_tolerance, p.low_value,
           p.valid_lo, p.valid_hi, p.mm_per_unit, p.noise_max, p.note,
           (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = p.created_by) as actor
      from gaxeta_private.gland_profiles p
     where p.link_id = (st ->> 'link_id')::bigint order by p.version desc limit 1) q;
  return st || jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'events', events, 'profile', profile,
    'can_profile', coalesce((st ->> 'can_operate')::boolean, false) and coalesce(gaxeta_authz.my_role(), '') in ('adm1', 'adm2'));
end $$;

-- ---------------------------------------------------------------------------
-- 12. Resumo para listas (mesma assinatura; campos novos são aditivos)
-- ---------------------------------------------------------------------------
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
      'interval_s', round(v_gap),
      'rule', st -> 'rule', 'calibrated', st -> 'calibrated', 'advance_mm', st -> 'advance_mm',
      'wait_reason', st -> 'wait_reason', 'reason', st -> 'reason', 'unit', st -> 'unit',
      'voltage_mv', st -> 'current' -> 'voltage_mv', 'voltage_source', st -> 'current' -> 'voltage_source',
      'quality', st -> 'current' -> 'quality', 'adc', st -> 'current' -> 'adc',
      'sampled_at', st -> 'current' -> 'sampled_at');
  end loop;
  return jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'items', items);
end $$;

-- ---------------------------------------------------------------------------
-- 13. Histórico por ciclo: cada leitura com a regra, a referência e o modelo da sua época
-- ---------------------------------------------------------------------------
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
    -- Regra 1: um trecho por evento que não seja manutenção; a conferência herda o ciclo em curso.
    select ev.id, ev.kind, ev.recorded_at as seg_start, ev.seg_stop, c.id as cycle_id,
           c.initial_mm, c.end_mm,
           gaxeta_private.gland_anchor(p_sensor_id, c.recorded_at, gaxeta_private.gland_stop(c.link_id, c.id)) as anchor,
           gaxeta_private.gland_scale(p_sensor_id, ev.link_id, ev.recorded_at) as scale
      from ev
      cross join lateral (
        select g.* from gaxeta_private.gland_events g
         where g.link_id = ev.link_id and g.kind <> 'check' and g.id <= ev.id order by g.id desc limit 1) c
     where ev.kind <> 'maintenance' and c.kind <> 'maintenance' and c.rule_version < 2 and ev.seg_stop > p_from
  ), pts as (
    select s.id::text as seg_id, r.received_at, (v.val ->> 'distance_mm')::numeric as distance_mm,
           (v.val ->> 'percent')::numeric as percent, s.initial_mm - (v.val ->> 'distance_mm')::numeric as advance_mm,
           r.voltage_mv, false as off_range, 1 as rule, (s.scale ->> 'source') = 'nominal' as nominal
      from seg s
      join public.gaxeta_readings r
        on r.sensor_id = p_sensor_id and r.received_at >= greatest(s.seg_start, p_from)
       and r.received_at < s.seg_stop and r.received_at <= p_to and r.received_at <@ win
      cross join lateral (select gaxeta_private.gland_value(s.initial_mm, s.end_mm, s.anchor,
          (s.scale ->> 'mm_per_count')::numeric, r.adc_raw, r.position_mm) as val) v
     where s.anchor is not null and r.sampled_at >= (s.anchor ->> 'sampled_at')::timestamptz
       and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise)
  ), cyc as (
    -- Regra 2: ciclos com referência aprovada.
    select g.id, g.link_id, gaxeta_private.gland_stop(g.link_id, g.id) as stop_at,
           x.received_at as anchor_at, x.sampled_at as anchor_sampled, x.approved_at, x.quantity, x.acq_method
      from ev g join gaxeta_private.gland_anchors x on x.event_id = g.id
     where g.kind in ('replacement', 'adjustment') and g.rule_version >= 2
  ), bound as (
    -- O modelo de um ciclo muda quando uma conferência é aprovada ou um perfil novo entra.
    select c.id, c.anchor_at as at, c.approved_at as model_at from cyc c
    union
    select c.id, x.received_at, x.approved_at from cyc c
      join gaxeta_private.gland_events k on k.link_id = c.link_id and k.kind = 'check' and k.id > c.id
      join gaxeta_private.gland_anchors x on x.event_id = k.id
     where x.received_at > c.anchor_at and x.approved_at < c.stop_at
    union
    select c.id, p.created_at, p.created_at from cyc c
      join gaxeta_private.gland_profiles p on p.link_id = c.link_id
     where p.created_at > c.approved_at and p.created_at < c.stop_at
  ), seg2 as (
    select c.id, c.quantity, c.acq_method, c.anchor_sampled, b.at as seg_start,
           coalesce(lead(b.at) over (partition by c.id order by b.at), c.stop_at) as seg_stop,
           gaxeta_private.gland_model(c.link_id, c.id, b.model_at) as model
      from cyc c join bound b on b.id = c.id
  ), pts2 as (
    select s.id::text || ':' || s.seg_start::text as seg_id, r.received_at, (v.val ->> 'distance_mm')::numeric as distance_mm,
           (v.val ->> 'percent')::numeric as percent, (v.val ->> 'advance_mm')::numeric as advance_mm,
           r.voltage_mv, not (v.val ->> 'in_range')::boolean as off_range, 2 as rule, false as nominal
      from seg2 s
      join public.gaxeta_readings r
        on r.sensor_id = p_sensor_id and r.received_at >= greatest(s.seg_start, p_from)
       and r.received_at < s.seg_stop and r.received_at <= p_to and r.received_at <@ win
      cross join lateral (select gaxeta_private.gland_eval(s.model,
          gaxeta_private.gland_qvalue(s.quantity, s.acq_method, r.adc_raw, r.voltage_mv, r.acq_method)) as val) v
     where s.seg_stop > p_from and v.val is not null and r.sampled_at >= s.anchor_sampled
       and r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds'
       and gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, null) = 'ok'
  ), allpts as (
    select * from pts union all select * from pts2
  ), buckets as (
    select min(received_at) as received_at, round(avg(distance_mm), 2) as distance_mm,
           round(avg(percent), 1) as percent, round(avg(advance_mm), 2) as advance_mm,
           round(avg(voltage_mv)) as voltage_mv, count(*) as samples,
           bool_or(off_range) as off_range, max(rule) as rule, bool_or(nominal) as nominal
      -- Um intervalo nunca mistura leituras de referências ou modelos diferentes.
      from allpts group by seg_id, floor(extract(epoch from (received_at - p_from)) / bucket_seconds)
  )
  select jsonb_build_object(
    'points', coalesce((select jsonb_agg(jsonb_build_object('received_at', b.received_at,
        'distance_mm', b.distance_mm, 'percent', b.percent, 'advance_mm', b.advance_mm, 'voltage_mv', b.voltage_mv,
        'samples', b.samples, 'out_of_range', b.off_range, 'rule', b.rule, 'nominal', b.nominal) order by b.received_at)
        from buckets b), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(jsonb_build_object('id', ev.id::text, 'kind', ev.kind, 'rule', ev.rule_version,
        'recorded_at', ev.recorded_at, 'initial_mm', ev.initial_mm, 'end_mm', ev.end_mm) order by ev.id)
        from ev where ev.seg_stop > p_from), '[]'::jsonb),
    'from', p_from, 'to', p_to, 'bucket_seconds', bucket_seconds) into result;
  return result;
end $$;

-- ---------------------------------------------------------------------------
-- 14. Histórico de telemetria: tensão calibrada por intervalo (campo aditivo)
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
   'voltage_mv',b.voltage_mv,'adc_raw',b.adc_raw,
   'stable_percent',b.stable_percent,'samples',b.samples) order by b.received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',coalesce(sum(samples),0),'min',min(min_percent),'max',max(max_percent),'last_received_at',max(last_at)) from buckets),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;

-- ---------------------------------------------------------------------------
-- 15. Privilégios
-- ---------------------------------------------------------------------------
revoke all on function
  gaxeta_private.gland_quality(numeric, numeric, integer, integer, numeric),
  gaxeta_private.gland_qvalue(text, text, numeric, integer, text),
  gaxeta_private.gland_profile_at(bigint, timestamptz),
  gaxeta_private.gland_window(bigint, timestamptz),
  gaxeta_private.gland_try_anchor(bigint),
  gaxeta_private.gland_model(bigint, bigint, timestamptz),
  gaxeta_private.gland_eval(jsonb, numeric)
  from public, anon, authenticated, service_role;
revoke all on function
  public.gaxeta_confirm_gland_anchor(text, text, text, text),
  public.gaxeta_save_gland_profile(text, text, uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function
  public.gaxeta_confirm_gland_anchor(text, text, text, text),
  public.gaxeta_save_gland_profile(text, text, uuid, jsonb)
  to authenticated;

notify pgrst, 'reload schema';
commit;
