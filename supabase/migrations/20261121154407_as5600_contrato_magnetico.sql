-- Migração 14: contrato magnético (AS5600 por I²C), aditivo e compatível.
--
-- O que entra:
--   1. Discriminador por leitura (gaxeta_readings.modality: 'adc_pot' | 'as5600_i2c') e campos
--      próprios da modalidade magnética. Os campos elétricos (travel_percent, voltage_v) passam a
--      aceitar nulo SÓ nas leituras magnéticas; nas elétricas a obrigatoriedade continua, por
--      restrição condicional. Nenhum 0 %, 0 V ou 0 mm representa ausência de medição.
--   2. Rota nova de ingestão, public.gaxeta_ingest_v4: mesma credencial, mesma deduplicação por
--      sensor/boot/sequência, mesma regra de leitura atual e de intervalo mínimo da rota antiga.
--   3. Geometria de montagem por revisão (caracterização de bancada), vínculo da geometria ao
--      spot, sugestão de curso por equipamento (TAG) e evento de engaxetamento por vínculo.
--   4. Captura automática da referência: primeira amostra nova, válida, estável e posterior ao
--      clique, no vínculo vigente; ativação atômica; rastreabilidade da referência anterior.
--   5. Limiar inclusivo de 5 pontos percentuais sobre o CURSO RESTANTE válido, dentro de cada
--      referência (gaxeta_private.mag_movements). gaxeta_movements continua só elétrica.
--   6. Consultas: gaxeta_mag_summary, gaxeta_mag_history; gaxeta_telemetry_summary informa a
--      modalidade; gaxeta_history agrega só leituras elétricas.
--
-- O que NÃO muda: gaxeta_ingest_v3, gaxeta_private.stabilize, gaxeta_movements, vínculos,
-- permissões existentes, tabelas e funções do antigo ciclo (gland_*), dados já gravados.
-- gaxeta_ingest (rota do potenciômetro) recebe só o tratamento da troca de modalidade no mesmo
-- sensor (volta ao potenciômetro por rollback): o filtro elétrico recomeça sem movimento e
-- nenhuma grandeza magnética fica como leitura atual.
--
-- Independe da migração 20261119142500_desativa_calibracao_mecanica (pode ser aplicada antes ou
-- depois desta).
begin;
set local lock_timeout = '3s';
lock table public.gaxeta_devices, public.gaxeta_readings in access exclusive mode nowait;

-- ---------------------------------------------------------------------------
-- 1. Geometria, montagem por spot, sugestão por equipamento, serviço e movimentos
-- ---------------------------------------------------------------------------
create table gaxeta_private.mag_geometries (
  id bigint generated always as identity primary key,
  key text not null check (key ~ '^[a-z][a-z0-9_-]{1,39}$'),
  revision integer not null check (revision between 1 and 9999),
  label text not null check (length(btrim(label)) between 1 and 80),
  status text not null default 'draft' check (status in ('draft', 'validated', 'retired')),
  model_kind text not null check (model_kind in ('linear', 'table')),
  direction smallint not null check (direction in (-1, 1)),
  mm_per_deg numeric check (mm_per_deg > 0 and mm_per_deg <= 100),
  curve jsonb,
  datum_raw smallint check (datum_raw between 0 and 4095),
  unique_arc_deg numeric not null check (unique_arc_deg > 18 and unique_arc_deg <= 330),
  back_margin_deg numeric not null default 15 check (back_margin_deg between 1 and 90),
  tolerance_mm numeric not null check (tolerance_mm >= 0 and tolerance_mm <= 50),
  min_course_mm numeric not null check (min_course_mm > 0),
  max_course_mm numeric not null check (max_course_mm <= 1000),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object' and pg_column_size(evidence) <= 8000),
  created_by uuid, created_at timestamptz not null default clock_timestamp(),
  validated_by uuid, validated_at timestamptz,
  unique (key, revision),
  constraint mag_geometries_model_check check (
    (model_kind = 'linear' and mm_per_deg is not null and curve is null)
    or (model_kind = 'table' and curve is not null and mm_per_deg is null)),
  constraint mag_geometries_course_check check (min_course_mm <= max_course_mm),
  constraint mag_geometries_arc_check check (unique_arc_deg + back_margin_deg <= 345),
  constraint mag_geometries_validated_check check (status = 'draft' or validated_at is not null)
);
comment on table gaxeta_private.mag_geometries is
  'Revisões de geometria da montagem sensor/haste (caracterização de engenharia em bancada). linear: avanço = giro orientado × mm_per_deg. table: curva monotônica [graus desde o datum mecânico, mm], interpolada só dentro dos limites. unique_arc_deg: arco útil comprovadamente único (menos de uma volta); back_margin_deg: recuo tolerado em torno do zero. Uma revisão validada não é editada: mudança de montagem = revisão nova.';
comment on column gaxeta_private.mag_geometries.direction is
  'Sinal de (ângulo bruto atual − ângulo bruto de referência) que corresponde a avanço do preme-gaxeta (+1 ou −1), com DIR do módulo em nível fixo.';

create table gaxeta_private.mag_point_setups (
  id bigint generated always as identity primary key,
  point_id uuid not null references public.gaxeta_assets(id) on delete restrict,
  geometry_id bigint not null references gaxeta_private.mag_geometries(id),
  datum_raw smallint check (datum_raw between 0 and 4095),
  suggested_course_mm numeric(8, 2) check (suggested_course_mm > 0 and suggested_course_mm <= 1000),
  note text check (length(note) <= 500),
  set_by uuid, valid_from timestamptz not null default clock_timestamp(), valid_to timestamptz,
  constraint mag_point_setups_period_check check (valid_to is null or valid_to >= valid_from)
);
create unique index mag_point_setups_current on gaxeta_private.mag_point_setups (point_id) where valid_to is null;
create index mag_point_setups_point on gaxeta_private.mag_point_setups (point_id, valid_from);
comment on table gaxeta_private.mag_point_setups is
  'Geometria vigente em cada spot (ponto de medição), com histórico. datum_raw: ângulo bruto no datum mecânico desta instalação (curvas table sem porta-ímã indexado). suggested_course_mm: estimativa de curso, nunca tratada como medida.';

create table gaxeta_private.mag_equipment_defaults (
  asset_id uuid primary key references public.gaxeta_assets(id) on delete cascade,
  size_class text check (size_class in ('small', 'medium', 'large')),
  suggested_course_mm numeric(8, 2) check (suggested_course_mm > 0 and suggested_course_mm <= 1000),
  geometry_id bigint references gaxeta_private.mag_geometries(id),
  updated_at timestamptz not null default clock_timestamp(), updated_by uuid
);
comment on table gaxeta_private.mag_equipment_defaults is
  'Sugestões por equipamento (TAG): porte, curso típico (estimativa) e geometria sugerida. Valem para os spots sem montagem própria em mag_point_setups.';

create table gaxeta_private.mag_services (
  id bigint generated always as identity primary key,
  link_id bigint not null references gaxeta_private.device_links(id),
  point_id uuid not null references public.gaxeta_assets(id) on delete restrict,
  sensor_id text not null references public.gaxeta_devices(sensor_id),
  request_id uuid not null,
  actor_id uuid not null,
  requested_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  course_mm numeric(8, 3) not null check (course_mm > 0 and course_mm <= 1000),
  course_unit text not null default 'mm' check (course_unit = 'mm'),
  course_origin text not null check (course_origin in ('measured', 'estimated')),
  geometry_id bigint not null references gaxeta_private.mag_geometries(id),
  geometry jsonb not null,
  provisional boolean not null default false,
  datum_raw smallint check (datum_raw between 0 and 4095),
  capture text not null check (capture ~ '^[a-f0-9]{8}$'),
  status text not null default 'pending' check (status in ('pending', 'active', 'superseded', 'expired', 'cancelled', 'rejected')),
  ref_reading_id bigint references public.gaxeta_readings(id) on delete restrict,
  ref_raw_angle smallint check (ref_raw_angle between 0 and 4095),
  ref_sampled_at timestamptz, captured_at timestamptz,
  capture_rule text check (capture_rule in ('clock', 'echo')),
  stable_remaining numeric(9, 4), stable_since timestamptz,
  ended_at timestamptz, ended_by uuid, end_reason text check (length(end_reason) <= 60),
  superseded_by bigint references gaxeta_private.mag_services(id),
  unique (link_id, request_id),
  constraint mag_services_ref_check check (
    (status in ('active', 'superseded')) <= (ref_reading_id is not null and ref_raw_angle is not null and captured_at is not null)),
  constraint mag_services_end_check check ((status in ('pending', 'active')) = (ended_at is null))
);
create unique index mag_services_one_pending on gaxeta_private.mag_services (link_id) where status = 'pending';
create unique index mag_services_one_active on gaxeta_private.mag_services (link_id) where status = 'active';
create index mag_services_sensor_time on gaxeta_private.mag_services (sensor_id, requested_at desc);
comment on table gaxeta_private.mag_services is
  'Engaxetamentos registrados (modalidade magnética), por vínculo sensor–spot. Guarda autor, instante do comando, curso disponível D (mm), origem (medido/estimado), revisão e cópia da geometria usada, sentido, leitura de referência e instante da captura. pending: aguardando a primeira amostra válida posterior ao clique. active: referência vigente. superseded: substituída por outra (superseded_by) ou encerrada por troca de vínculo ou de modalidade. Contrato distinto de gland_events/gland_anchors/gland_profiles.';

create table gaxeta_private.mag_movements (
  reading_id bigint primary key references public.gaxeta_readings(id) on delete restrict,
  service_id bigint not null references gaxeta_private.mag_services(id),
  sensor_id text not null references public.gaxeta_devices(sensor_id),
  received_at timestamptz not null,
  previous_remaining numeric(9, 4),
  stable_remaining numeric(9, 4) not null,
  rule_version smallint not null default 1
);
create index mag_movements_sensor_time on gaxeta_private.mag_movements (sensor_id, received_at, reading_id);
comment on table gaxeta_private.mag_movements is
  'Mudanças estabilizadas do curso de ajuste restante (%): limiar inclusivo de 5 pontos percentuais em relação ao último valor estabilizado DENTRO da mesma referência (service_id). Troca de referência, de modalidade ou de revisão recomeça a linha sem gerar movimento.';

alter table gaxeta_private.mag_geometries enable row level security;
alter table gaxeta_private.mag_point_setups enable row level security;
alter table gaxeta_private.mag_equipment_defaults enable row level security;
alter table gaxeta_private.mag_services enable row level security;
alter table gaxeta_private.mag_movements enable row level security;
revoke all on gaxeta_private.mag_geometries, gaxeta_private.mag_point_setups, gaxeta_private.mag_equipment_defaults,
  gaxeta_private.mag_services, gaxeta_private.mag_movements from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Leituras e sensores: discriminador e campos magnéticos
-- ---------------------------------------------------------------------------
alter table public.gaxeta_readings
  alter column travel_percent drop not null,
  alter column voltage_v drop not null,
  add column modality text not null default 'adc_pot',
  add column schema_version smallint,
  add column raw_angle smallint,
  add column angle_pp smallint,
  add column mag_status text,
  add column bus_status text,
  add column agc smallint,
  add column magnitude smallint,
  add column capture text,
  add column service_id bigint references gaxeta_private.mag_services(id),
  add column advance_mm numeric(10, 4),
  add column remaining_mm numeric(10, 4),
  add column remaining_percent numeric(9, 4),
  add column range_state text,
  add column stable_remaining numeric(9, 4);
alter table public.gaxeta_readings
  add constraint gaxeta_readings_raw_angle_check check (raw_angle between 0 and 4095),
  add constraint gaxeta_readings_angle_pp_check check (angle_pp between 0 and 4095),
  add constraint gaxeta_readings_agc_check check (agc between 0 and 255),
  add constraint gaxeta_readings_magnitude_check check (magnitude between 0 and 4095),
  add constraint gaxeta_readings_capture_check check (capture ~ '^[a-f0-9]{8}$'),
  add constraint gaxeta_readings_range_state_check check (range_state in ('ok', 'out_of_range')),
  add constraint gaxeta_readings_modality_check check (case modality
    when 'adc_pot' then
      travel_percent is not null and voltage_v is not null
      and raw_angle is null and angle_pp is null and mag_status is null and bus_status is null
      and agc is null and magnitude is null and capture is null and service_id is null
      and advance_mm is null and remaining_mm is null and remaining_percent is null
      and range_state is null and stable_remaining is null
    when 'as5600_i2c' then
      travel_percent is null and position_mm is null and voltage_v is null and voltage_mv is null
      and adc_raw is null and adc_min is null and adc_max is null and adc_noise is null
      and percent_scale is null and stable_percent is null
      and bus_status in ('ok', 'no_ack', 'read_error', 'timeout')
      and (case when bus_status = 'ok' then mag_status in ('ok', 'no_magnet', 'weak', 'strong') else mag_status is null end)
      and ((raw_angle is not null) = (bus_status = 'ok' and mag_status in ('ok', 'weak', 'strong')))
      and (remaining_percent is null or (service_id is not null and mag_status = 'ok'))
      and ((remaining_percent is null) = (range_state is null))
    else false end);
comment on column public.gaxeta_readings.modality is
  'Modalidade de aquisição DESTA leitura. adc_pot: potenciômetro no ADC (todo firmware até o 4.3.x; campos elétricos obrigatórios). as5600_i2c: sensor magnético AS5600 por I²C (campos elétricos sempre nulos).';
comment on column public.gaxeta_readings.raw_angle is
  'AS5600: RAW ANGLE de 12 bits (0 a 4095; grau = valor × 360/4096), média circular do bloco. Nulo quando o barramento falhou ou o ímã não foi detectado. Ângulo absoluto do ímã: não é avanço nem curso.';
comment on column public.gaxeta_readings.angle_pp is 'AS5600: maior diferença entre amostras válidas do bloco, em contagens, já desenrolada (estabilidade da leitura).';
comment on column public.gaxeta_readings.mag_status is 'AS5600: qualidade magnética do bloco. ok; no_magnet (MD=0); weak (ML=1); strong (MH=1). Nula quando o barramento não respondeu.';
comment on column public.gaxeta_readings.bus_status is 'AS5600: qualidade do barramento I²C no bloco. ok; no_ack (módulo sem resposta em 0x36); read_error (leitura curta ou incoerente); timeout.';
comment on column public.gaxeta_readings.capture is 'Identificador de captura devolvido pela ingestão e repetido pela placa na amostra seguinte: prova que a amostra foi tomada depois do clique quando o horário não basta.';
comment on column public.gaxeta_readings.service_id is 'Engaxetamento (referência) usado para calcular avanço e curso restante desta leitura. Nulo: sem referência vigente, amostra inválida ou amostra atrasada.';
comment on column public.gaxeta_readings.advance_mm is 'CALCULADO: avanço do preme-gaxeta desde o engaxetamento, em mm, com sinal (negativo = recuo), pela geometria da referência.';
comment on column public.gaxeta_readings.remaining_mm is 'CALCULADO: curso de ajuste restante em mm = D − avanço, com sinal.';
comment on column public.gaxeta_readings.remaining_percent is 'CALCULADO: curso de ajuste restante em % = 100 × restante/D, com sinal e sem limitar a 0–100 (o limite é só visual).';
comment on column public.gaxeta_readings.range_state is 'ok: dentro do arco e da tolerância validados. out_of_range: fora da faixa validada (não alimenta a linha estabilizada).';
comment on column public.gaxeta_readings.stable_remaining is 'Curso restante estabilizado (%) vigente quando esta leitura chegou, dentro da referência service_id.';
comment on column public.gaxeta_readings.travel_percent is
  'Posição elétrica do potenciômetro, em % da escala elétrica informada em percent_scale (nula: ADC bruto 0–4095). Sempre nula nas leituras magnéticas (modality = as5600_i2c).';

alter table public.gaxeta_devices
  add column last_modality text check (last_modality in ('adc_pot', 'as5600_i2c')),
  add column last_raw_angle smallint,
  add column last_angle_pp smallint,
  add column last_mag_status text,
  add column last_bus_status text,
  add column last_agc smallint,
  add column last_magnitude smallint,
  add column last_valid_raw_angle smallint,
  add column last_valid_at timestamptz,
  add column send_period_s integer check (send_period_s between 5 and 86400);
comment on column public.gaxeta_devices.last_modality is 'Modalidade da leitura atual do sensor. Nula: sensor que só enviou antes da migração 14 (potenciômetro).';
comment on column public.gaxeta_devices.last_valid_raw_angle is 'AS5600: último ângulo bruto VÁLIDO, com horário próprio em last_valid_at. Não representa a saúde atual (ver last_mag_status e last_bus_status).';
comment on column public.gaxeta_devices.send_period_s is 'Cadência de envio anunciada pela placa (s). Serve para estimar a espera pela próxima leitura.';

-- ---------------------------------------------------------------------------
-- 3. Cálculo: curva, avanço e curso restante (funções puras)
-- ---------------------------------------------------------------------------
-- Curva válida: 2 a 64 pontos [graus desde o datum, mm], graus estritamente crescentes entre 0 e
-- 345, mm estritamente crescentes (ramo único, sem trecho plano).
create function gaxeta_private.mag_curve_ok(p_curve jsonb)
 returns boolean language plpgsql immutable set search_path = '' as $$
declare e jsonb; px numeric; py numeric; x numeric; y numeric; n integer := 0;
begin
  if p_curve is null or jsonb_typeof(p_curve) <> 'array' then return false; end if;
  for e in select * from jsonb_array_elements(p_curve) loop
    if jsonb_typeof(e) <> 'array' or jsonb_array_length(e) <> 2
       or jsonb_typeof(e->0) <> 'number' or jsonb_typeof(e->1) <> 'number' then return false; end if;
    x := (e->>0)::numeric; y := (e->>1)::numeric;
    if x < 0 or x > 345 or y < -1000 or y > 1000 then return false; end if;
    if n > 0 and (x <= px or y <= py) then return false; end if;
    px := x; py := y; n := n + 1;
  end loop;
  return n between 2 and 64;
end $$;

-- Interpolação linear por trechos, só dentro dos limites da curva (fora: nulo).
create function gaxeta_private.mag_curve_eval(p_curve jsonb, p_deg numeric)
 returns numeric language sql immutable set search_path = '' as $$
  select a.y + (b.y - a.y) * (p_deg - a.x) / (b.x - a.x)
    from (select (e->>0)::numeric x, (e->>1)::numeric y, o from jsonb_array_elements(p_curve) with ordinality q(e, o)) a
    join (select (e->>0)::numeric x, (e->>1)::numeric y, o from jsonb_array_elements(p_curve) with ordinality q(e, o)) b on b.o = a.o + 1
   where p_deg >= a.x and p_deg <= b.x order by a.o limit 1
$$;

-- Avanço e curso restante de uma amostra, pela geometria copiada no serviço. Não arredonda:
-- a decisão do limiar usa o valor inteiro; o arredondamento é só do armazenamento.
--   linear: giro orientado c = ((bruto − referência) × sentido) mod 4096, lido como recuo
--     pequeno quando cai na margem atrás do zero; avanço = graus × mm_per_deg.
--   table:  fase φ = ((bruto − datum) × sentido) mod 4096 em graus; avanço = f(φ) − f(φ_ref).
-- range_state 'out_of_range': além do arco único, da curva ou da tolerância validada.
create function gaxeta_private.mag_compute(p_geometry jsonb, p_datum integer, p_ref integer, p_raw integer, p_course numeric)
 returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  v_dir integer := (p_geometry->>'direction')::integer;
  v_tol numeric := (p_geometry->>'tolerance_mm')::numeric;
  v_arc numeric := (p_geometry->>'unique_arc_deg')::numeric;
  v_back numeric := (p_geometry->>'back_margin_deg')::numeric;
  c integer; v_deg numeric; v_adv numeric; v_rem numeric; v_ok boolean := true;
  v_curve jsonb; f_now numeric; f_ref numeric;
begin
  if p_ref is null or p_raw is null or p_course is null or p_course <= 0 then return null; end if;
  c := (((p_raw - p_ref) * v_dir) % 4096 + 4096) % 4096;
  if c * 360.0 / 4096 > 360 - v_back then c := c - 4096; end if;
  v_deg := c * 360.0 / 4096;
  if p_geometry->>'model_kind' = 'linear' then
    v_adv := v_deg * (p_geometry->>'mm_per_deg')::numeric;
    if v_deg > v_arc then v_ok := false; end if;
  else
    if p_datum is null then return null; end if;
    v_curve := p_geometry->'curve';
    f_now := gaxeta_private.mag_curve_eval(v_curve, ((((p_raw - p_datum) * v_dir) % 4096 + 4096) % 4096) * 360.0 / 4096);
    f_ref := gaxeta_private.mag_curve_eval(v_curve, ((((p_ref - p_datum) * v_dir) % 4096 + 4096) % 4096) * 360.0 / 4096);
    if f_now is null or f_ref is null then
      return jsonb_build_object('rel_deg', v_deg, 'advance_mm', null, 'remaining_mm', null, 'remaining_percent', null, 'range_state', 'out_of_range');
    end if;
    v_adv := f_now - f_ref;
  end if;
  v_rem := p_course - v_adv;
  if v_adv < -v_tol or v_adv > p_course + v_tol then v_ok := false; end if;
  return jsonb_build_object('rel_deg', v_deg, 'advance_mm', v_adv, 'remaining_mm', v_rem,
    'remaining_percent', 100 * v_rem / p_course, 'range_state', case when v_ok then 'ok' else 'out_of_range' end);
end $$;

-- Limiar inclusivo de 5 p.p. sobre o curso restante (mesma regra de gaxeta_private.stabilize,
-- sem o corte em 0–100: o valor válido pode passar um pouco de 0 ou de 100 dentro da tolerância).
create function gaxeta_private.mag_stabilize(p_previous numeric, p_raw numeric)
 returns numeric language sql immutable set search_path = '' as $$
  select case when p_raw is null then p_previous
              when p_previous is null or abs(p_raw - p_previous) >= 5 then p_raw else p_previous end
$$;

-- Motivo, em código, de a amostra magnética não servir como posição operacional.
create function gaxeta_private.mag_invalid_reason(p_bus text, p_mag text)
 returns text language sql immutable set search_path = '' as $$
  select case when p_bus is null then 'no_reading'
              when p_bus <> 'ok' then 'bus_' || p_bus
              when p_mag = 'no_magnet' then 'no_magnet'
              when p_mag = 'weak' then 'field_weak'
              when p_mag = 'strong' then 'field_strong' end
$$;

-- Cópia da geometria gravada no serviço (o histórico não muda quando a TAG muda de revisão).
create function gaxeta_private.mag_geometry_snapshot(g gaxeta_private.mag_geometries)
 returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('id', g.id, 'key', g.key, 'revision', g.revision, 'label', g.label, 'status', g.status,
    'model_kind', g.model_kind, 'direction', g.direction, 'mm_per_deg', g.mm_per_deg, 'curve', g.curve,
    'unique_arc_deg', g.unique_arc_deg, 'back_margin_deg', g.back_margin_deg, 'tolerance_mm', g.tolerance_mm)
$$;

-- Montagem vigente de um spot: a do próprio spot; se não houver, a sugerida no equipamento (TAG).
create function gaxeta_private.mag_setup(p_point_id uuid)
 returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('source', q.source, 'geometry_id', q.geometry_id, 'datum_raw', q.datum_raw,
           'suggested_course_mm', q.course, 'size_class', q.size_class)
    from (
      select 'point' source, s.geometry_id, s.datum_raw,
             coalesce(s.suggested_course_mm, (select e.suggested_course_mm from gaxeta_private.mag_equipment_defaults e
               join public.gaxeta_assets a on a.id = p_point_id where e.asset_id = any (a.path)
               order by array_position(a.path, e.asset_id) desc limit 1)) course,
             (select e.size_class from gaxeta_private.mag_equipment_defaults e
               join public.gaxeta_assets a on a.id = p_point_id where e.asset_id = any (a.path)
               order by array_position(a.path, e.asset_id) desc limit 1) size_class, 1 o
        from gaxeta_private.mag_point_setups s where s.point_id = p_point_id and s.valid_to is null
      union all
      select 'equipment', e.geometry_id, null::smallint, e.suggested_course_mm, e.size_class, 2
        from gaxeta_private.mag_equipment_defaults e join public.gaxeta_assets a on a.id = p_point_id
       where e.asset_id = any (a.path)
       order by o limit 1) q
$$;

-- Encerra os serviços em aberto de um vínculo (troca de spot, de sensor ou de modalidade).
create function gaxeta_private.mag_close_services(p_link_id bigint, p_reason text, p_at timestamptz)
 returns void language sql set search_path = '' as $$
  update gaxeta_private.mag_services
     set status = case status when 'pending' then 'cancelled' else 'superseded' end,
         ended_at = p_at, end_reason = p_reason
   where link_id = p_link_id and status in ('pending', 'active')
$$;

create function gaxeta_private.mag_link_closed()
 returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.unlinked_at is not null and old.unlinked_at is null then
    perform gaxeta_private.mag_close_services(new.id, 'link_closed', new.unlinked_at);
  end if;
  return null;
end $$;
create trigger mag_link_closed after update of unlinked_at on gaxeta_private.device_links
  for each row execute function gaxeta_private.mag_link_closed();

-- ---------------------------------------------------------------------------
-- 4. Ingestão magnética (schema 4)
-- ---------------------------------------------------------------------------
create function public.gaxeta_ingest_v4(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare
  v_key gaxeta_private.ingest_keys%rowtype;
  d public.gaxeta_devices%rowtype;
  s gaxeta_private.mag_services%rowtype;
  v_id text; v_boot text; v_origin text; v_seq bigint;
  v_rssi integer; v_uptime bigint; v_sampled timestamptz; v_period integer;
  v_raw integer; v_pp integer; v_agc integer; v_mag integer;
  v_bus text; v_ms text; v_method text; v_capture text; v_name text; k text;
  v_row_id bigint; v_received timestamptz; v_now timestamptz := pg_catalog.clock_timestamp();
  v_current boolean := false; v_valid boolean; v_link bigint; v_calc jsonb;
  v_rem numeric; v_next numeric; v_rule text; v_reply_capture text;
begin
  if p_token is null or pg_catalog.length(p_token) < 32 or pg_catalog.length(p_token) > 256 then
    raise sqlstate 'PT401' using message='Credencial de envio inválida';
  end if;
  -- Mesma credencial da rota antiga. Bloqueio compartilhado: placas com a mesma credencial não
  -- ficam em fila uma atrás da outra; a ordem por sensor vem do bloqueio da linha do sensor.
  select * into v_key from gaxeta_private.ingest_keys
    where token_hash = pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')) and enabled for share;
  if not found then raise sqlstate 'PT401' using message='Credencial de envio inválida'; end if;
  if p_reading is null or pg_catalog.jsonb_typeof(p_reading) <> 'object'
      or pg_catalog.octet_length(p_reading::text) > 3000 then
    raise exception using errcode='22023',message='Mensagem inválida';
  end if;
  if pg_catalog.jsonb_typeof(p_reading->'schema_version') is distinct from 'number' or (p_reading->>'schema_version')::numeric <> 4
      or p_reading->>'modality' is distinct from 'as5600_i2c' then
    raise exception using errcode='22023',message='Esta rota aceita só schema_version 4 com modality as5600_i2c';
  end if;
  -- Nenhum campo elétrico entra pela rota magnética, nem como zero.
  foreach k in array array['travel_percent','voltage_v','position_mm','voltage_mv','adc_raw','adc_min','adc_max','adc_noise','percent_scale'] loop
    if p_reading ? k and pg_catalog.jsonb_typeof(p_reading->k) <> 'null' then
      raise exception using errcode='22023',message='Campo elétrico não pertence à modalidade magnética: ' || k;
    end if;
  end loop;
  v_id := p_reading->>'sensor_id'; v_boot := p_reading->>'boot_id';
  v_origin := coalesce(p_reading->>'origin','esp32');
  if v_id is null or v_id !~ '^[A-Z0-9-]{6,48}$' or v_boot is null or v_boot !~ '^[a-f0-9]{16,64}$'
      or v_origin not in ('esp32','integration_test') then
    raise exception using errcode='22023',message='Identidade da amostra inválida';
  end if;
  if pg_catalog.jsonb_typeof(p_reading->'sequence') is distinct from 'number'
     or (p_reading->>'sequence')::numeric <> pg_catalog.trunc((p_reading->>'sequence')::numeric) then
    raise exception using errcode='22023',message='Sequência deve ser inteira';
  end if;
  v_seq := (p_reading->>'sequence')::bigint;
  foreach k in array array['raw_angle','angle_pp','agc','magnitude','rssi','uptime_ms','send_period_s'] loop
    if p_reading ? k and pg_catalog.jsonb_typeof(p_reading->k) not in ('number','null') then
      raise exception using errcode='22023',message='Campo numérico inválido: ' || k;
    end if;
    if pg_catalog.jsonb_typeof(p_reading->k) = 'number' and (p_reading->>k)::numeric <> pg_catalog.trunc((p_reading->>k)::numeric) then
      raise exception using errcode='22023',message='Campo deve ser inteiro: ' || k;
    end if;
  end loop;
  v_raw := (p_reading->>'raw_angle')::integer; v_pp := (p_reading->>'angle_pp')::integer;
  v_agc := (p_reading->>'agc')::integer; v_mag := (p_reading->>'magnitude')::integer;
  v_rssi := (p_reading->>'rssi')::integer; v_uptime := (p_reading->>'uptime_ms')::bigint;
  v_period := (p_reading->>'send_period_s')::integer;
  v_sampled := (p_reading->>'sampled_at')::timestamptz;
  v_bus := p_reading->>'bus_status'; v_ms := p_reading->>'mag_status';
  v_method := p_reading->>'acq_method'; v_capture := p_reading->>'capture';
  if not (v_seq between 1 and 4294967295)
      or v_bus is null or v_bus not in ('ok','no_ack','read_error','timeout')
      or (v_bus = 'ok' and (v_ms is null or v_ms not in ('ok','no_magnet','weak','strong')))
      or (v_bus <> 'ok' and v_ms is not null)
      or ((v_raw is not null) <> (v_bus = 'ok' and v_ms in ('ok','weak','strong')))
      or (v_raw is not null and not (v_raw between 0 and 4095))
      or (v_pp is not null and (v_raw is null or not (v_pp between 0 and 4095)))
      or (v_agc is not null and not (v_agc between 0 and 255))
      or (v_mag is not null and not (v_mag between 0 and 4095))
      or (v_rssi is not null and not (v_rssi between -127 and 0))
      or (v_uptime is not null and not (v_uptime between 0 and 4294967295))
      or (v_period is not null and not (v_period between 5 and 86400))
      or (v_method is not null and v_method !~ '^[a-z0-9][a-z0-9._-]{0,31}$')
      or (v_capture is not null and v_capture !~ '^[a-f0-9]{8}$')
      or (v_sampled is not null and (not pg_catalog.isfinite(v_sampled) or v_sampled > v_now + interval '10 minutes' or v_sampled < '2025-01-01'::timestamptz)) then
    raise exception using errcode='22023',message='Leitura magnética fora da faixa permitida';
  end if;
  -- Reenvio da mesma amostra: não cria linha, não altera a leitura atual, não ancora referência.
  select id, received_at into v_row_id, v_received from public.gaxeta_readings
    where sensor_id=v_id and boot_id=v_boot and sequence=v_seq;
  if found then return pg_catalog.jsonb_build_object('ok',true,'duplicate',true,'id',v_row_id,'received_at',v_received); end if;
  select * into d from public.gaxeta_devices where sensor_id=v_id for update;
  if not found then
    if v_origin='esp32' then
      -- Limite de sensores da credencial: só a criação de sensor novo é serializada.
      perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('gaxeta_new_device'));
      if (select pg_catalog.count(*) from public.gaxeta_devices where origin='esp32') >= v_key.max_devices then
        raise sqlstate 'PT429' using message='Limite de sensores do piloto atingido';
      end if;
    end if;
    insert into public.gaxeta_devices(sensor_id,origin,wifi_mac)
      values(v_id,v_origin,pg_catalog.left(p_reading->>'wifi_mac',32))
      on conflict (sensor_id) do nothing;
    select * into d from public.gaxeta_devices where sensor_id=v_id for update;
  else
    if d.origin <> v_origin then raise exception using errcode='22023',message='Origem incompatível com o sensor'; end if;
    if d.last_received_at > v_now - interval '750 milliseconds' then
      raise sqlstate 'PT429' using message='Aguarde antes da próxima leitura';
    end if;
  end if;
  -- Corrida entre dois envios da mesma amostra: o segundo espera a linha do sensor e cai aqui.
  select id, received_at into v_row_id, v_received from public.gaxeta_readings
    where sensor_id=v_id and boot_id=v_boot and sequence=v_seq;
  if found then return pg_catalog.jsonb_build_object('ok',true,'duplicate',true,'id',v_row_id,'received_at',v_received); end if;

  insert into public.gaxeta_readings(sensor_id,boot_id,sequence,received_at,sampled_at,rssi,uptime_ms,acq_method,
      modality,schema_version,raw_angle,angle_pp,mag_status,bus_status,agc,magnitude,capture)
    values(v_id,v_boot,v_seq,v_now,v_sampled,v_rssi,v_uptime,v_method,
      'as5600_i2c',4,v_raw,v_pp,v_ms,v_bus,v_agc,v_mag,v_capture)
    returning id,received_at into v_row_id,v_received;
  -- Mesma regra da rota antiga: amostra atrasada entra no histórico sem virar a leitura atual.
  v_current := d.last_boot_id is null
    or (d.last_boot_id=v_boot and v_seq>d.last_sequence)
    or (d.last_boot_id<>v_boot and (v_sampled is null or d.last_sampled_at is null or v_sampled>=d.last_sampled_at));
  v_valid := v_bus = 'ok' and v_ms = 'ok';
  v_name := p_reading->>'device_name';

  if v_current then
    select l.id into v_link from gaxeta_private.device_links l
      where l.sensor_id = v_id and l.point_id = d.measurement_point_id and l.unlinked_at is null;
    if v_link is not null then
      -- Solicitação pendente: vence sozinha; senão tenta capturar esta amostra como referência.
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'pending' for update;
      if found then
        if v_now > s.expires_at then
          update gaxeta_private.mag_services set status='expired', ended_at=v_now, end_reason='no_valid_sample' where id = s.id;
        else
          -- Posterior ao clique: horário sincronizado com margem (e transporte plausível), ou o
          -- identificador de captura repetido pela placa. Estável: bloco com até 6 contagens.
          v_rule := case
            when v_capture is not distinct from s.capture then 'echo'
            when v_sampled is not null and v_sampled >= s.requested_at + interval '2 seconds'
                 and v_received - v_sampled between interval '-5 seconds' and interval '120 seconds' then 'clock' end;
          if v_valid and v_rule is not null and coalesce(v_pp, 0) <= 6 then
            v_calc := gaxeta_private.mag_compute(s.geometry, s.datum_raw, v_raw, v_raw, s.course_mm);
            if v_calc is null or v_calc->>'range_state' <> 'ok' then
              update gaxeta_private.mag_services set status='rejected', ended_at=v_now, end_reason='outside_geometry' where id = s.id;
            else
              update gaxeta_private.mag_services set status='superseded', ended_at=v_now, end_reason='new_service', superseded_by=s.id
                where link_id = v_link and status = 'active';
              update gaxeta_private.mag_services set status='active', ref_reading_id=v_row_id, ref_raw_angle=v_raw,
                  ref_sampled_at=v_sampled, captured_at=v_now, capture_rule=v_rule,
                  stable_remaining=(v_calc->>'remaining_percent')::numeric, stable_since=v_now
                where id = s.id;
            end if;
          else
            v_reply_capture := s.capture;
          end if;
        end if;
      end if;
      -- Referência vigente: avanço e curso restante desta amostra; linha estabilizada de 5 p.p.
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'active' for update;
      if found and v_valid then
        v_calc := gaxeta_private.mag_compute(s.geometry, s.datum_raw, s.ref_raw_angle, v_raw, s.course_mm);
        if v_calc is not null and v_calc->>'remaining_percent' is not null then
          v_rem := (v_calc->>'remaining_percent')::numeric;
          v_next := s.stable_remaining;
          if v_calc->>'range_state' = 'ok' and s.ref_reading_id <> v_row_id then
            v_next := gaxeta_private.mag_stabilize(s.stable_remaining, v_rem);
            if v_next is distinct from s.stable_remaining then
              insert into gaxeta_private.mag_movements(reading_id,service_id,sensor_id,received_at,previous_remaining,stable_remaining)
                values(v_row_id,s.id,v_id,v_received,s.stable_remaining,v_next);
              update gaxeta_private.mag_services set stable_remaining=v_next, stable_since=v_received where id = s.id;
            end if;
          end if;
          update public.gaxeta_readings set service_id=s.id, advance_mm=(v_calc->>'advance_mm')::numeric,
              remaining_mm=(v_calc->>'remaining_mm')::numeric, remaining_percent=v_rem,
              range_state=v_calc->>'range_state', stable_remaining=v_next
            where id = v_row_id;
        end if;
      end if;
    end if;
    -- Leitura atual do sensor. Os campos elétricos são zerados para NULO: nenhuma tensão ou
    -- percentual do potenciômetro fica como leitura atual de uma placa magnética.
    update public.gaxeta_devices set
      reading_count=reading_count+1,
      last_received_at=v_now,last_sampled_at=v_sampled,last_boot_id=v_boot,last_sequence=v_seq,last_rssi=v_rssi,
      last_percent=null,last_position_mm=null,last_voltage_v=null,last_voltage_mv=null,
      last_adc_raw=null,last_adc_min=null,last_adc_max=null,adc_noise=null,last_percent_scale=null,
      stable_percent=null,stable_since=null,
      last_modality='as5600_i2c',last_acq_method=v_method,
      last_raw_angle=v_raw,last_angle_pp=v_pp,last_mag_status=v_ms,last_bus_status=v_bus,last_agc=v_agc,last_magnitude=v_mag,
      last_valid_raw_angle=case when v_valid then v_raw else last_valid_raw_angle end,
      last_valid_at=case when v_valid then coalesce(v_sampled,v_now) else last_valid_at end,
      send_period_s=coalesce(v_period,send_period_s),
      applied_label=case when v_name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then v_name else applied_label end,
      ble_mac=coalesce(pg_catalog.left(p_reading->>'ble_mac',32),ble_mac),
      firmware_version=coalesce(pg_catalog.left(p_reading->>'firmware_version',32),firmware_version),
      transport='direct_wifi'
      where sensor_id=v_id;
  else
    update public.gaxeta_devices set reading_count=reading_count+1 where sensor_id=v_id;
  end if;
  return pg_catalog.jsonb_build_object('ok',true,'duplicate',false,'id',v_row_id,'received_at',v_received)
    || case when v_reply_capture is not null then pg_catalog.jsonb_build_object('capture',v_reply_capture) else '{}'::jsonb end;
end
$function$;
comment on function public.gaxeta_ingest_v4(text, jsonb) is
  'Ingestão magnética (schema_version 4, modality as5600_i2c). Mesma credencial, deduplicação por sensor/boot/sequência, regra de leitura atual e intervalo mínimo de gaxeta_ingest. Falha de I²C, ímã ausente e campo fora da faixa são telemetria de saúde: a leitura entra sem posição operacional. Recusa qualquer campo elétrico.';

-- Rota do potenciômetro: corpo da migração 12 com a troca de modalidade no mesmo sensor.
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
 -- A rota antiga continua só elétrica: pacote magnético vai para gaxeta_ingest_v4.
 if p_reading ? 'modality' and p_reading->>'modality' is distinct from 'adc_pot' then
  raise exception using errcode='22023',message='Modalidade não aceita nesta rota';
 end if;
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
 if d.last_modality = 'as5600_i2c' then
  -- A placa voltou do sensor magnético para o potenciômetro (rollback de hardware): o filtro
  -- elétrico recomeça no valor atual, sem movimento, e a referência magnética do vínculo é
  -- encerrada. Nenhuma porcentagem de curso é herdada.
  next_value:=case when d.last_percent between 0 and 100 then d.last_percent end;
  d.stable_since:=(result->>'received_at')::timestamptz;
  perform gaxeta_private.mag_close_services(l.id,'modality_change',(result->>'received_at')::timestamptz)
    from gaxeta_private.device_links l where l.sensor_id=d.sensor_id and l.unlinked_at is null;
 elsif d.stable_percent is not null and v_scale is distinct from d.last_percent_scale then
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
 last_percent_scale=v_scale,
 last_modality='adc_pot',last_raw_angle=null,last_angle_pp=null,last_mag_status=null,last_bus_status=null,
 last_agc=null,last_magnitude=null
 where sensor_id=d.sensor_id;
 end if;
 update public.gaxeta_readings set adc_noise=noise,stable_percent=d.stable_percent,
 voltage_mv=v_mv,adc_min=v_min,adc_max=v_max,acq_method=v_method,percent_scale=v_scale where id=(result->>'id')::bigint;
 return result;
end $function$;

-- ---------------------------------------------------------------------------
-- 5. Engenharia: geometria, montagem do spot e sugestão do equipamento
-- ---------------------------------------------------------------------------
create function public.gaxeta_mag_save_geometry(p_geometry jsonb)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare g gaxeta_private.mag_geometries%rowtype; v_rev integer;
begin
  if gaxeta_authz.my_role() is null or gaxeta_authz.my_role() not in ('adm1', 'adm2') then
    raise insufficient_privilege using message = 'Só a engenharia (ADM 1 ou 2) cadastra geometria.';
  end if;
  if p_geometry is null or jsonb_typeof(p_geometry) <> 'object' or pg_column_size(p_geometry) > 16000 then
    raise invalid_parameter_value using message = 'Geometria inválida.';
  end if;
  if p_geometry->>'model_kind' = 'table' and not gaxeta_private.mag_curve_ok(p_geometry->'curve') then
    raise invalid_parameter_value using message = 'Curva inválida: 2 a 64 pontos [graus, mm], graus e mm estritamente crescentes, graus entre 0 e 345.';
  end if;
  select coalesce(max(revision), 0) + 1 into v_rev from gaxeta_private.mag_geometries where key = p_geometry->>'key';
  insert into gaxeta_private.mag_geometries (key, revision, label, model_kind, direction, mm_per_deg, curve, datum_raw,
      unique_arc_deg, back_margin_deg, tolerance_mm, min_course_mm, max_course_mm, evidence, created_by)
  values (p_geometry->>'key', v_rev, p_geometry->>'label', p_geometry->>'model_kind', (p_geometry->>'direction')::smallint,
      case when p_geometry->>'model_kind' = 'linear' then (p_geometry->>'mm_per_deg')::numeric end,
      case when p_geometry->>'model_kind' = 'table' then p_geometry->'curve' end,
      (p_geometry->>'datum_raw')::smallint, (p_geometry->>'unique_arc_deg')::numeric,
      coalesce((p_geometry->>'back_margin_deg')::numeric, 15), (p_geometry->>'tolerance_mm')::numeric,
      (p_geometry->>'min_course_mm')::numeric, (p_geometry->>'max_course_mm')::numeric,
      coalesce(p_geometry->'evidence', '{}'::jsonb), auth.uid())
  returning * into g;
  -- O maior curso tem de caber no arco único (linear) ou na curva (table).
  if g.model_kind = 'linear' and g.max_course_mm / g.mm_per_deg > g.unique_arc_deg then
    raise invalid_parameter_value using message = 'O maior curso exige mais giro do que o arco único desta geometria.';
  end if;
  if g.model_kind = 'table' and ((g.curve->-1->>0)::numeric > g.unique_arc_deg
       or g.max_course_mm > (g.curve->-1->>1)::numeric - (g.curve->0->>1)::numeric) then
    raise invalid_parameter_value using message = 'A curva passa do arco único ou não cobre o maior curso.';
  end if;
  perform gaxeta_private.audit('mag.geometry.save', 'geometry', g.id::text, null, jsonb_build_object('key', g.key, 'revision', g.revision));
  return gaxeta_private.mag_geometry_snapshot(g);
end $$;

create function public.gaxeta_mag_set_geometry_status(p_geometry_id bigint, p_status text, p_evidence jsonb default null)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare g gaxeta_private.mag_geometries%rowtype;
begin
  if gaxeta_authz.my_role() is null or gaxeta_authz.my_role() not in ('adm1', 'adm2') then
    raise insufficient_privilege using message = 'Só a engenharia (ADM 1 ou 2) valida geometria.';
  end if;
  select * into g from gaxeta_private.mag_geometries where id = p_geometry_id for update;
  if not found then raise invalid_parameter_value using message = 'Geometria não encontrada.'; end if;
  if not ((g.status = 'draft' and p_status = 'validated') or (g.status in ('draft', 'validated') and p_status = 'retired')) then
    raise sqlstate 'PT409' using message = 'Mudança de estado não permitida.';
  end if;
  -- Validar exige a evidência do ensaio: erro máximo, repetibilidade e folga medidos.
  if p_status = 'validated' and (p_evidence is null or jsonb_typeof(p_evidence) <> 'object'
       or jsonb_typeof(p_evidence->'max_error_mm') is distinct from 'number' or jsonb_typeof(p_evidence->'max_error_pp') is distinct from 'number'
       or jsonb_typeof(p_evidence->'backlash_mm') is distinct from 'number' or coalesce(p_evidence->>'report', '') = '') then
    raise invalid_parameter_value using message = 'Informe a evidência do ensaio: max_error_mm, max_error_pp, backlash_mm e report.';
  end if;
  update gaxeta_private.mag_geometries set status = p_status,
      evidence = case when p_evidence is null then evidence else evidence || p_evidence end,
      validated_by = case when p_status = 'validated' then auth.uid() else validated_by end,
      validated_at = case when p_status = 'validated' then clock_timestamp() else coalesce(validated_at, clock_timestamp()) end
    where id = g.id returning * into g;
  perform gaxeta_private.audit('mag.geometry.' || p_status, 'geometry', g.id::text, null, jsonb_build_object('key', g.key, 'revision', g.revision));
  return gaxeta_private.mag_geometry_snapshot(g);
end $$;

create function public.gaxeta_mag_geometries()
 returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  return coalesce((select jsonb_agg(gaxeta_private.mag_geometry_snapshot(g)
      || jsonb_build_object('min_course_mm', g.min_course_mm, 'max_course_mm', g.max_course_mm, 'datum_raw', g.datum_raw,
           'evidence', g.evidence, 'validated_at', g.validated_at) order by g.key, g.revision desc)
    from gaxeta_private.mag_geometries g), '[]'::jsonb);
end $$;

create function public.gaxeta_mag_set_point_setup(p_point_id uuid, p_geometry_id bigint, p_datum_raw integer default null,
    p_suggested_course_mm numeric default null, p_note text default null)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.gaxeta_assets%rowtype; g gaxeta_private.mag_geometries%rowtype; v_id bigint; v_now timestamptz := clock_timestamp(); l bigint;
begin
  select * into a from public.gaxeta_assets where id = p_point_id and kind = 'point';
  if not found or gaxeta_authz.my_role() is null or gaxeta_authz.my_role() not in ('adm1', 'adm2') then
    raise insufficient_privilege using message = 'Só a engenharia (ADM 1 ou 2) define a montagem do spot.';
  end if;
  select * into g from gaxeta_private.mag_geometries where id = p_geometry_id;
  if not found or g.status = 'retired' then raise invalid_parameter_value using message = 'Geometria inexistente ou retirada.'; end if;
  if g.model_kind = 'table' and coalesce(p_datum_raw, g.datum_raw::integer) is null then
    raise invalid_parameter_value using message = 'Curva exige o ângulo do datum mecânico (da geometria ou desta instalação).';
  end if;
  update gaxeta_private.mag_point_setups set valid_to = v_now where point_id = p_point_id and valid_to is null;
  insert into gaxeta_private.mag_point_setups (point_id, geometry_id, datum_raw, suggested_course_mm, note, set_by, valid_from)
    values (p_point_id, p_geometry_id, p_datum_raw, p_suggested_course_mm, p_note, auth.uid(), v_now) returning id into v_id;
  -- Mudou o mecanismo do spot: a referência vigente deixa de valer e a linha recomeça no próximo engaxetamento.
  for l in select id from gaxeta_private.device_links where point_id = p_point_id and unlinked_at is null loop
    perform gaxeta_private.mag_close_services(l, 'setup_changed', v_now);
  end loop;
  perform gaxeta_private.audit('mag.setup.point', 'asset', p_point_id::text, a.corporation_id,
    jsonb_build_object('setup_id', v_id, 'geometry_id', p_geometry_id, 'datum_raw', p_datum_raw, 'suggested_course_mm', p_suggested_course_mm));
  return gaxeta_private.mag_setup(p_point_id);
end $$;

create function public.gaxeta_mag_set_equipment_defaults(p_asset_id uuid, p_size_class text, p_suggested_course_mm numeric, p_geometry_id bigint default null)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.gaxeta_assets%rowtype;
begin
  select * into a from public.gaxeta_assets where id = p_asset_id and kind = 'equipment';
  if not found or not gaxeta_authz.can_write_tree('equipment', p_asset_id) then
    raise insufficient_privilege using message = 'Sem permissão para editar este equipamento.';
  end if;
  -- Geometria sugerida é decisão de engenharia; porte e curso típico seguem a permissão da ficha.
  if p_geometry_id is not null and gaxeta_authz.my_role() not in ('adm1', 'adm2') then
    raise insufficient_privilege using message = 'Só a engenharia (ADM 1 ou 2) sugere geometria.';
  end if;
  if p_geometry_id is not null and not exists (select 1 from gaxeta_private.mag_geometries where id = p_geometry_id and status <> 'retired') then
    raise invalid_parameter_value using message = 'Geometria inexistente ou retirada.';
  end if;
  insert into gaxeta_private.mag_equipment_defaults (asset_id, size_class, suggested_course_mm, geometry_id, updated_by)
    values (p_asset_id, p_size_class, p_suggested_course_mm, p_geometry_id, auth.uid())
    on conflict (asset_id) do update set size_class = excluded.size_class, suggested_course_mm = excluded.suggested_course_mm,
      geometry_id = case when gaxeta_authz.my_role() in ('adm1', 'adm2') then excluded.geometry_id else gaxeta_private.mag_equipment_defaults.geometry_id end,
      updated_at = clock_timestamp(), updated_by = auth.uid();
  perform gaxeta_private.audit('mag.setup.equipment', 'asset', p_asset_id::text, a.corporation_id,
    jsonb_build_object('size_class', p_size_class, 'suggested_course_mm', p_suggested_course_mm, 'geometry_id', p_geometry_id));
  return (select to_jsonb(e) from gaxeta_private.mag_equipment_defaults e where e.asset_id = p_asset_id);
end $$;

-- ---------------------------------------------------------------------------
-- 6. Campo: "Engaxetamento realizado" (uma medida, um clique) e cancelamento
-- ---------------------------------------------------------------------------
create function public.gaxeta_mag_request_service(p_sensor_id text, p_request_id uuid, p_course_mm numeric, p_course_origin text default 'measured')
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype; l gaxeta_private.device_links%rowtype;
  s gaxeta_private.mag_services%rowtype; g gaxeta_private.mag_geometries%rowtype;
  v_setup jsonb; v_now timestamptz := clock_timestamp(); v_wait integer; v_snap jsonb; v_role text := gaxeta_authz.my_role();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null for update;
  if not found then raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.'; end if;
  if p_request_id is null then raise invalid_parameter_value using message = 'Operação inválida.'; end if;
  if p_course_mm is null or p_course_mm = 'NaN'::numeric or not (p_course_mm > 0 and p_course_mm <= 1000) or p_course_mm <> round(p_course_mm, 3) then
    raise invalid_parameter_value using message = 'Informe o curso disponível em mm: positivo, até 1000, com até três casas decimais.';
  end if;
  if p_course_origin is null or p_course_origin not in ('measured', 'estimated') then
    raise invalid_parameter_value using message = 'Informe se o curso foi medido ou estimado.';
  end if;

  -- Reenvio da mesma solicitação (toque duplo, resposta perdida): devolve a que já existe.
  select * into s from gaxeta_private.mag_services where link_id = l.id and request_id = p_request_id;
  if found then
    if s.actor_id <> auth.uid() or s.course_mm <> p_course_mm or s.course_origin <> p_course_origin then
      raise sqlstate 'PT409' using message = 'A solicitação já foi usada para outra operação.';
    end if;
    return jsonb_build_object('id', s.id::text, 'status', s.status, 'duplicate', true, 'requested_at', s.requested_at, 'expires_at', s.expires_at);
  end if;

  if d.last_modality is distinct from 'as5600_i2c' then
    raise sqlstate 'PT409' using message = 'Este sensor não está enviando leitura magnética.';
  end if;
  v_setup := gaxeta_private.mag_setup(l.point_id);
  if v_setup is null or v_setup->>'geometry_id' is null then
    raise sqlstate 'PT409' using message = 'Este spot ainda não tem geometria de montagem. A engenharia precisa vincular a revisão caracterizada.';
  end if;
  select * into g from gaxeta_private.mag_geometries where id = (v_setup->>'geometry_id')::bigint;
  if g.status = 'retired' then
    raise sqlstate 'PT409' using message = 'A geometria deste spot foi retirada. A engenharia precisa vincular a revisão atual.';
  end if;
  -- Geometria ainda em caracterização: só a engenharia registra, e o resultado sai como provisório.
  if g.status = 'draft' and v_role not in ('adm1', 'adm2') then
    raise sqlstate 'PT409' using message = 'A geometria deste spot ainda não foi validada pela engenharia.';
  end if;
  if p_course_mm < g.min_course_mm or p_course_mm > g.max_course_mm then
    raise invalid_parameter_value using message = 'Curso fora da faixa validada para esta montagem ('
      || trim(to_char(g.min_course_mm, 'FM9990.0##')) || ' a ' || trim(to_char(g.max_course_mm, 'FM9990.0##')) || ' mm).';
  end if;
  if g.model_kind = 'linear' and p_course_mm / g.mm_per_deg > g.unique_arc_deg then
    raise invalid_parameter_value using message = 'Este curso exige mais giro do que o arco único da montagem: a posição ficaria indeterminada.';
  end if;

  -- Outra solicitação aguardando leitura (outro técnico ou outro aparelho).
  select * into s from gaxeta_private.mag_services where link_id = l.id and status = 'pending' for update;
  if found then
    if v_now > s.expires_at then
      update gaxeta_private.mag_services set status = 'expired', ended_at = v_now, end_reason = 'no_valid_sample' where id = s.id;
    else
      raise sqlstate 'PT409' using message = 'Já existe um engaxetamento aguardando leitura neste sensor. Aguarde a confirmação ou cancele a solicitação.';
    end if;
  end if;

  -- Espera estimada pela cadência anunciada (ou medida): até quatro envios mais folga.
  v_wait := least(3600, greatest(120, 4 * coalesce(d.send_period_s, gaxeta_private.gland_cadence(d.sensor_id)::integer, 30) + 30));
  v_snap := gaxeta_private.mag_geometry_snapshot(g);
  insert into gaxeta_private.mag_services (link_id, point_id, sensor_id, request_id, actor_id, requested_at, expires_at,
      course_mm, course_origin, geometry_id, geometry, provisional, datum_raw, capture)
    values (l.id, l.point_id, d.sensor_id, p_request_id, auth.uid(), v_now, v_now + make_interval(secs => v_wait),
      p_course_mm, p_course_origin, g.id, v_snap, g.status <> 'validated',
      coalesce((v_setup->>'datum_raw')::smallint, g.datum_raw), substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    returning * into s;
  perform gaxeta_private.audit('mag.service.request', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id),
    jsonb_build_object('service_id', s.id, 'link_id', l.id, 'point_id', l.point_id, 'course_mm', p_course_mm,
      'course_origin', p_course_origin, 'geometry_id', g.id, 'geometry', g.key || ' r' || g.revision));
  return jsonb_build_object('id', s.id::text, 'status', s.status, 'duplicate', false, 'requested_at', s.requested_at, 'expires_at', s.expires_at,
    'wait_s', coalesce(d.send_period_s, 30));
end $$;

create function public.gaxeta_mag_cancel_service(p_sensor_id text, p_service_id text)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; s gaxeta_private.mag_services%rowtype; v_now timestamptz := clock_timestamp();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into s from gaxeta_private.mag_services where id::text = p_service_id and sensor_id = d.sensor_id for update;
  if not found then raise invalid_parameter_value using message = 'Solicitação não encontrada.'; end if;
  if s.status <> 'pending' then
    return jsonb_build_object('id', s.id::text, 'status', s.status, 'changed', false);
  end if;
  update gaxeta_private.mag_services set status = 'cancelled', ended_at = v_now, ended_by = auth.uid(), end_reason = 'user_cancelled' where id = s.id;
  perform gaxeta_private.audit('mag.service.cancel', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = s.point_id), jsonb_build_object('service_id', s.id));
  return jsonb_build_object('id', s.id::text, 'status', 'cancelled', 'changed', true);
end $$;

-- ---------------------------------------------------------------------------
-- 7. Consultas: estado magnético atual e histórico por referência
-- ---------------------------------------------------------------------------
create function public.gaxeta_mag_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype; r public.gaxeta_readings%rowtype;
  s gaxeta_private.mag_services%rowtype; p gaxeta_private.mag_services%rowtype; g gaxeta_private.mag_geometries%rowtype;
  win tstzmultirange; items jsonb := '[]'::jsonb; v_link bigint; v_setup jsonb; v_reason text; v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and last_modality = 'as5600_i2c' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    r := null; s := null; p := null; g := null; v_link := null; v_setup := null;
    select * into r from public.gaxeta_readings
      where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence and received_at <@ win;
    if d.measurement_point_id is not null then
      select l.id into v_link from gaxeta_private.device_links l
        where l.sensor_id = d.sensor_id and l.point_id = d.measurement_point_id and l.unlinked_at is null;
      v_setup := gaxeta_private.mag_setup(d.measurement_point_id);
      if v_setup->>'geometry_id' is not null then
        select * into g from gaxeta_private.mag_geometries where id = (v_setup->>'geometry_id')::bigint;
      end if;
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'active';
      select * into p from gaxeta_private.mag_services where link_id = v_link and status = 'pending';
    end if;
    -- Por que não há curso restante agora (código; a interface traduz em texto de ação).
    v_reason := case
      when r.id is null then 'no_reading'
      when gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status) is not null then gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status)
      when v_link is null then 'no_link'
      when g.id is null then 'no_geometry'
      when s.id is null and p.id is not null then 'awaiting_reference'
      when s.id is null then 'no_reference'
      when r.service_id is distinct from s.id or r.remaining_percent is null then 'not_computed'
      when r.range_state = 'out_of_range' then 'out_of_range' end;
    items := items || jsonb_build_object(
      'sensor_id', d.sensor_id, 'modality', 'as5600_i2c', 'linked', v_link is not null, 'link_id', v_link::text,
      'can_operate', d.measurement_point_id is not null and gaxeta_authz.can_operate_point(d.measurement_point_id),
      'interval_s', d.send_period_s, 'firmware_version', d.firmware_version,
      'reading', case when r.id is not null then jsonb_build_object(
        'id', r.id::text, 'boot_id', r.boot_id, 'sequence', r.sequence, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
        'raw_angle', r.raw_angle, 'angle_deg', round(r.raw_angle * 360.0 / 4096, 3), 'angle_pp', r.angle_pp,
        'bus_status', r.bus_status, 'mag_status', r.mag_status, 'agc', r.agc, 'magnitude', r.magnitude, 'rssi', r.rssi,
        'transport_s', round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1)) end,
      'last_valid', case when d.last_valid_at is not null and d.last_valid_at <@ win then jsonb_build_object(
        'raw_angle', d.last_valid_raw_angle, 'angle_deg', round(d.last_valid_raw_angle * 360.0 / 4096, 3), 'at', d.last_valid_at) end,
      'setup', case when g.id is not null then jsonb_build_object('source', v_setup->>'source', 'geometry_id', g.id::text,
        'key', g.key, 'revision', g.revision, 'label', g.label, 'status', g.status, 'model_kind', g.model_kind,
        'min_course_mm', g.min_course_mm, 'max_course_mm', g.max_course_mm, 'tolerance_mm', g.tolerance_mm,
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class')
        when v_setup is not null then jsonb_build_object('source', v_setup->>'source',
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class') end,
      'pending', case when p.id is not null then jsonb_build_object('id', p.id::text, 'requested_at', p.requested_at,
        'expires_at', p.expires_at, 'expired', v_now > p.expires_at, 'mine', p.actor_id = auth.uid(),
        'course_mm', p.course_mm, 'course_origin', p.course_origin) end,
      'service', case when s.id is not null then jsonb_build_object('id', s.id::text, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'capture_rule', s.capture_rule, 'course_mm', s.course_mm, 'course_origin', s.course_origin,
        'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'geometry_current', g.id is not distinct from s.geometry_id,
        'ref_raw_angle', s.ref_raw_angle, 'ref_angle_deg', round(s.ref_raw_angle * 360.0 / 4096, 3), 'ref_sampled_at', s.ref_sampled_at,
        'stable_remaining', s.stable_remaining, 'stable_since', s.stable_since) end,
      'computed', case when s.id is not null and r.service_id = s.id and r.remaining_percent is not null then jsonb_build_object(
        'advance_mm', r.advance_mm, 'remaining_mm', r.remaining_mm, 'remaining_percent', r.remaining_percent,
        'range_state', r.range_state) end,
      'reason', v_reason);
  end loop;
  return jsonb_build_object('server_time', v_now, 'items', items);
end $$;
comment on function public.gaxeta_mag_summary(text[]) is
  'Estado atual dos sensores magnéticos que o usuário pode ler: ângulo absoluto e saúde (medidos), montagem do spot, solicitação pendente, referência vigente e curso restante (calculado). reason explica, em código, por que não há curso restante.';

create function public.gaxeta_mag_history(p_sensor_id text, p_from timestamptz, p_to timestamptz)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '8s' as $$
declare result jsonb; bucket_seconds numeric; v_win tstzmultirange;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to - p_from < interval '1 second' or p_to - p_from > interval '366 days' then
    raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
  bucket_seconds := greatest(1, extract(epoch from (p_to - p_from)) / 600);
  v_win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  with rows as (
    select * from public.gaxeta_readings
     where sensor_id = p_sensor_id and modality = 'as5600_i2c' and received_at >= p_from and received_at <= p_to and received_at <@ v_win
  ), buckets as (
    -- Um intervalo por referência: a linha quebra na troca de engaxetamento. O ângulo é média
    -- CIRCULAR (não se faz média aritmética através de 0°); o curso restante é média física.
    select floor(extract(epoch from (received_at - p_from)) / bucket_seconds) b, service_id,
      min(received_at) received_at, max(received_at) last_at, count(*) samples,
      count(*) filter (where bus_status = 'ok' and mag_status = 'ok') valid,
      count(*) filter (where bus_status <> 'ok') bus_fail,
      count(*) filter (where mag_status = 'no_magnet') no_magnet,
      count(*) filter (where mag_status in ('weak', 'strong')) field_out,
      avg(sin(radians(raw_angle * 360.0 / 4096))) filter (where bus_status = 'ok' and mag_status = 'ok') sy,
      avg(cos(radians(raw_angle * 360.0 / 4096))) filter (where bus_status = 'ok' and mag_status = 'ok') cx,
      avg(remaining_percent) filter (where range_state = 'ok') rem, min(remaining_percent) filter (where range_state = 'ok') rem_min,
      max(remaining_percent) filter (where range_state = 'ok') rem_max,
      avg(remaining_mm) filter (where range_state = 'ok') rem_mm, avg(advance_mm) filter (where range_state = 'ok') adv_mm,
      count(*) filter (where range_state = 'out_of_range') out_of_range,
      (max(array[extract(epoch from received_at), id::numeric, stable_remaining]))[3] stable_remaining
    from rows group by 1, 2
  ), svc as (
    select s.* from gaxeta_private.mag_services s
     where s.sensor_id = p_sensor_id and s.status in ('active', 'superseded')
       and s.captured_at <= p_to and coalesce(s.ended_at, 'infinity') >= p_from and s.captured_at <@ v_win
  ), events as (
    select m.* from gaxeta_private.mag_movements m
     where m.sensor_id = p_sensor_id and m.received_at >= p_from and m.received_at <= p_to and m.received_at <@ v_win
     order by m.received_at, m.reading_id limit 5001
  )
  select jsonb_build_object(
    'history', coalesce((select jsonb_agg(jsonb_build_object('received_at', b.received_at, 'last_at', b.last_at,
        'service_id', b.service_id::text, 'samples', b.samples, 'valid', b.valid, 'bus_fail', b.bus_fail,
        'no_magnet', b.no_magnet, 'field_out', b.field_out, 'out_of_range', b.out_of_range,
        'angle_deg', case when b.valid > 0 and (b.sy <> 0 or b.cx <> 0)
           then round((degrees(atan2(b.sy, b.cx))::numeric + 360) % 360, 3) end,
        'remaining_percent', round(b.rem, 4), 'min_remaining', b.rem_min, 'max_remaining', b.rem_max,
        'remaining_mm', round(b.rem_mm, 4), 'advance_mm', round(b.adv_mm, 4), 'stable_remaining', b.stable_remaining)
        order by b.received_at) from buckets b), '[]'::jsonb),
    'services', coalesce((select jsonb_agg(jsonb_build_object('id', s.id::text, 'status', s.status, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'ended_at', s.ended_at, 'end_reason', s.end_reason, 'course_mm', s.course_mm,
        'course_origin', s.course_origin, 'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'model_kind', s.geometry->>'model_kind', 'direction', (s.geometry->>'direction')::integer,
        'ref_raw_angle', s.ref_raw_angle, 'ref_reading_id', s.ref_reading_id::text) order by s.captured_at) from svc s), '[]'::jsonb),
    'movements', coalesce((select jsonb_agg(jsonb_build_object('reading_id', e.reading_id::text, 'service_id', e.service_id::text,
        'received_at', e.received_at, 'previous_remaining', e.previous_remaining, 'stable_remaining', e.stable_remaining,
        'rule_version', e.rule_version) order by e.received_at, e.reading_id) from events e), '[]'::jsonb),
    'movements_truncated', (select count(*) > 5000 from events),
    'stats', (select jsonb_build_object('count', coalesce(sum(samples), 0), 'valid', coalesce(sum(valid), 0),
        'last_received_at', max(last_at)) from buckets),
    'from', p_from, 'to', p_to, 'bucket_seconds', bucket_seconds, 'modality', 'as5600_i2c', 'rule_version', 1) into result;
  return result;
end $$;
comment on function public.gaxeta_mag_history(text, timestamptz, timestamptz) is
  'Histórico magnético agregado (até 600 intervalos), separado por referência: ângulo absoluto em média circular, curso restante e avanço em média física, contagem de amostras inválidas por motivo, referências do período e mudanças estabilizadas de 5 p.p. Limitado ao período que o usuário pode ler.';

-- ---------------------------------------------------------------------------
-- 8. Consultas existentes: modalidade no resumo; histórico elétrico só com leituras elétricas
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_telemetry_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  r public.gaxeta_readings%rowtype;
  win tstzmultirange; v_gap numeric; items jsonb := '[]'::jsonb; v_mag boolean;
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
    v_mag := coalesce(r.modality, d.last_modality) = 'as5600_i2c';
    -- Intervalo típico entre envios (mediana dos três últimos), dentro do período que o usuário pode ler.
    select percentile_disc(0.5) within group (order by extract(epoch from g.gap)) into v_gap from (
      select q.received_at - pg_catalog.lag(q.received_at) over (order by q.received_at) as gap from (
        select x.received_at from public.gaxeta_readings x
         where x.sensor_id = d.sensor_id and x.received_at <@ win
         order by x.received_at desc limit 4) q) g where g.gap is not null;
    -- Leitura magnética: todos os campos elétricos saem nulos (nunca zero, nunca a última tensão
    -- do potenciômetro). block = 'magnetic' identifica o caso para clientes que só leem block.
    items := items || jsonb_build_object(
      'sensor_id', d.sensor_id, 'interval_s', round(v_gap), 'linked', d.measurement_point_id is not null,
      'modality', case when v_mag then 'as5600_i2c' else 'adc_pot' end,
      'reading_id', r.id::text, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
      'percent', r.travel_percent, 'percent_scale', r.percent_scale,
      'stable_percent', case when r.id is not null and not v_mag then d.stable_percent end,
      'stable_since', case when r.id is not null and not v_mag then d.stable_since end,
      'voltage_mv', case when not v_mag then coalesce(r.voltage_mv, round(r.voltage_v * 1000)::integer) end,
      'voltage_source', case when r.id is null or v_mag then null when r.voltage_mv is not null then 'calibrated' else 'estimated' end,
      'adc', r.adc_raw, 'adc_min', r.adc_min, 'adc_max', r.adc_max, 'noise', r.adc_noise,
      'acq_method', r.acq_method,
      'block', case when r.id is null then null when v_mag then 'magnetic'
                    else gaxeta_private.adc_block(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max) end,
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
 -- Só leituras elétricas: % do ADC e % de curso magnético nunca entram na mesma média.
 where sensor_id=p_sensor_id and modality='adc_pot' and received_at>=p_from and received_at<=p_to and received_at <@ v_win
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
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1,'modality','adc_pot') into result;
 return result;
end $function$;

-- ---------------------------------------------------------------------------
-- 9. Permissões: privilégio mínimo
-- ---------------------------------------------------------------------------
revoke all on function
  gaxeta_private.mag_curve_ok(jsonb), gaxeta_private.mag_curve_eval(jsonb, numeric),
  gaxeta_private.mag_compute(jsonb, integer, integer, integer, numeric), gaxeta_private.mag_stabilize(numeric, numeric),
  gaxeta_private.mag_invalid_reason(text, text), gaxeta_private.mag_geometry_snapshot(gaxeta_private.mag_geometries),
  gaxeta_private.mag_setup(uuid), gaxeta_private.mag_close_services(bigint, text, timestamptz), gaxeta_private.mag_link_closed()
  from public, anon, authenticated, service_role;
revoke all on function
  public.gaxeta_ingest_v4(text, jsonb),
  public.gaxeta_mag_save_geometry(jsonb), public.gaxeta_mag_set_geometry_status(bigint, text, jsonb), public.gaxeta_mag_geometries(),
  public.gaxeta_mag_set_point_setup(uuid, bigint, integer, numeric, text),
  public.gaxeta_mag_set_equipment_defaults(uuid, text, numeric, bigint),
  public.gaxeta_mag_request_service(text, uuid, numeric, text), public.gaxeta_mag_cancel_service(text, text),
  public.gaxeta_mag_summary(text[]), public.gaxeta_mag_history(text, timestamptz, timestamptz)
  from public, anon, authenticated, service_role;
-- A placa envia com a chave publicável (papel anon), como na rota antiga.
grant execute on function public.gaxeta_ingest_v4(text, jsonb) to anon, authenticated, service_role;
grant execute on function
  public.gaxeta_mag_save_geometry(jsonb), public.gaxeta_mag_set_geometry_status(bigint, text, jsonb), public.gaxeta_mag_geometries(),
  public.gaxeta_mag_set_point_setup(uuid, bigint, integer, numeric, text),
  public.gaxeta_mag_set_equipment_defaults(uuid, text, numeric, bigint),
  public.gaxeta_mag_request_service(text, uuid, numeric, text), public.gaxeta_mag_cancel_service(text, text),
  public.gaxeta_mag_summary(text[]), public.gaxeta_mag_history(text, timestamptz, timestamptz)
  to authenticated;

notify pgrst, 'reload schema';
commit;
