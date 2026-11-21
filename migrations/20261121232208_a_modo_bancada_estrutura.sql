-- Migração 15: Modo bancada (posição contínua), curso por TAG e por spot, faixas de ajuste.
-- Aditiva e compatível com o site e o firmware em uso (4.4.0 continua aceito sem alteração).
--
-- O que entra:
--   1. Contagem contínua na leitura magnética (gaxeta_readings.ct_*): sessão, contagem com
--      sinal, origem, motivo do início da sessão, maior passo e maior lacuna entre amostras desde
--      o envio anterior. Campos opcionais do firmware 4.5.0; nulos no 4.4.0. A contagem é
--      absoluta dentro da sessão: reenviar o pacote não soma nada.
--   2. Modo bancada por vínculo sensor–spot (gaxeta_private.mag_bench_modes), de ativação
--      explícita e versionado por período: ângulo do 0 %, ângulo do 100 % e sentido. O início é
--      confirmado com o eixo dentro da faixa (primeira leitura nova, válida e estável depois do
--      toque). O percentual é limitado a 0–100 e a posição além do extremo fica guardada.
--      Sessão diferente da confirmada = "Reposicionar para retomar"; a última leitura boa fica
--      preservada com horário. A bancada não cria referência, movimento nem evento de campo.
--   3. Curso típico por TAG com exceção por spot independentes da geometria
--      (mag_point_setups.geometry_id passa a aceitar nulo; origem de cada valor informada).
--   4. Faixas do curso de ajuste restante (alto, médio, baixo, sem ajuste) decididas no servidor,
--      sobre o valor estabilizado com duas casas, o mesmo que a tela mostra.
--   5. Registro de manutenção sem referência (mag_maintenance_notes): o fato e a hora do
--      engaxetamento quando a montagem ainda não tem geometria validada. Não inicia escala.
--
-- O que NÃO muda: gaxeta_ingest (potenciômetro), gaxeta_ingest_v3, gaxeta_movements, a regra de
-- 5 pontos percentuais, mag_compute, mag_stabilize, as referências e os movimentos já gravados,
-- gaxeta_mag_set_point_setup, gaxeta_mag_set_equipment_defaults, permissões existentes.
-- Substituídas com o mesmo contrato (campos novos são aditivos): gaxeta_ingest_v4,
-- gaxeta_mag_request_service, gaxeta_mag_summary, gaxeta_mag_history, gaxeta_private.mag_setup,
-- gaxeta_private.mag_close_services.
--
-- Independe da migração 20261119142500_desativa_calibracao_mecanica (antes ou depois desta).
begin;
set local lock_timeout = '3s';
lock table public.gaxeta_devices, public.gaxeta_readings in access exclusive mode nowait;

-- ---------------------------------------------------------------------------
-- 1. Modo bancada, registro de manutenção e curso por spot
-- ---------------------------------------------------------------------------
create table gaxeta_private.mag_bench_modes (
  id bigint generated always as identity primary key,
  link_id bigint not null references gaxeta_private.device_links(id),
  point_id uuid not null references public.gaxeta_assets(id) on delete restrict,
  sensor_id text not null references public.gaxeta_devices(sensor_id),
  request_id uuid not null,
  started_by uuid not null,
  started_at timestamptz not null default clock_timestamp(),
  zero_deg numeric(7, 3) not null check (zero_deg >= 0 and zero_deg < 360),
  full_deg numeric(7, 3) not null check (full_deg >= 0 and full_deg < 360),
  direction smallint not null check (direction in (-1, 1)),
  span_deg numeric(7, 3) not null check (span_deg >= 5 and span_deg <= 355),
  status text not null default 'active' check (status in ('active', 'ended')),
  ended_at timestamptz, ended_by uuid, end_reason text check (length(end_reason) <= 60),
  anchor_status text not null default 'none' check (anchor_status in ('none', 'pending', 'set', 'lost')),
  anchor_request_id uuid, anchor_requested_at timestamptz, anchor_requested_by uuid, anchor_expires_at timestamptz,
  anchor_capture text check (anchor_capture ~ '^[a-f0-9]{8}$'),
  anchor_note text check (length(anchor_note) <= 60),
  anchor_session text check (anchor_session ~ '^[a-f0-9]{8}$'),
  anchor_count integer, anchor_u_deg numeric(9, 3),
  anchor_reading_id bigint references public.gaxeta_readings(id) on delete restrict,
  anchor_at timestamptz, anchor_rule text check (anchor_rule in ('clock', 'echo')),
  lost_reason text check (length(lost_reason) <= 40), lost_at timestamptz,
  last_ok_reading_id bigint references public.gaxeta_readings(id) on delete restrict,
  last_ok_percent numeric(7, 4), last_ok_u_deg numeric(12, 3), last_ok_at timestamptz,
  unique (link_id, request_id),
  constraint mag_bench_end_check check ((status = 'active') = (ended_at is null)),
  constraint mag_bench_pending_check check (anchor_status <> 'pending'
    or (anchor_capture is not null and anchor_requested_at is not null and anchor_expires_at is not null)),
  constraint mag_bench_anchor_check check (anchor_status <> 'set'
    or (anchor_session is not null and anchor_count is not null and anchor_u_deg is not null and anchor_at is not null))
);
create unique index mag_bench_one_active on gaxeta_private.mag_bench_modes (link_id) where status = 'active';
create index mag_bench_sensor_time on gaxeta_private.mag_bench_modes (sensor_id, started_at desc);
comment on table gaxeta_private.mag_bench_modes is
  'Modo bancada do sensor magnético, por vínculo sensor–spot e por período (cada ativação ou troca de extremos é uma linha). zero_deg = ângulo do chip que vale 0 %; full_deg = ângulo que vale 100 %; direction = +1 quando o percentual cresce com o ângulo; span_deg = graus entre os dois extremos, no sentido. Âncora: sessão, contagem e posição (graus desde o 0 %) da leitura em que o início foi confirmado com o eixo dentro da faixa. A posição contínua de cada leitura da mesma sessão é anchor_u_deg + direction × (contagem − anchor_count) × 360/4096. lost: a sessão da placa mudou (reinício, ímã ausente, lacuna, velocidade) e a posição precisa de nova referência. Não é série de campo: não gera referência, movimento nem evento.';

create table gaxeta_private.mag_maintenance_notes (
  id bigint generated always as identity primary key,
  link_id bigint not null references gaxeta_private.device_links(id),
  point_id uuid not null references public.gaxeta_assets(id) on delete restrict,
  sensor_id text not null references public.gaxeta_devices(sensor_id),
  request_id uuid not null,
  actor_id uuid not null,
  noted_at timestamptz not null default clock_timestamp(),
  reason text not null check (reason in ('no_geometry', 'geometry_draft', 'geometry_retired')),
  reading_id bigint references public.gaxeta_readings(id) on delete restrict,
  raw_angle smallint check (raw_angle between 0 and 4095),
  note text check (length(note) <= 300),
  unique (link_id, request_id)
);
create index mag_maintenance_sensor_time on gaxeta_private.mag_maintenance_notes (sensor_id, noted_at desc);
comment on table gaxeta_private.mag_maintenance_notes is
  'Registro do FATO de um engaxetamento (quem e quando) em spot sem geometria validada. Não é referência operacional: não tem curso, não ancora ângulo como zero e não inicia cálculo de curso restante. reason: por que o cálculo de campo não estava disponível.';

alter table gaxeta_private.mag_bench_modes enable row level security;
alter table gaxeta_private.mag_maintenance_notes enable row level security;
revoke all on gaxeta_private.mag_bench_modes, gaxeta_private.mag_maintenance_notes from public, anon, authenticated, service_role;

-- O curso típico do spot deixa de depender de existir geometria: a linha do spot pode ter só o
-- curso (exceção ao TAG), só a geometria, ou os dois.
alter table gaxeta_private.mag_point_setups alter column geometry_id drop not null;
alter table gaxeta_private.mag_point_setups
  add constraint mag_point_setups_content_check check (geometry_id is not null or suggested_course_mm is not null);
comment on table gaxeta_private.mag_point_setups is
  'Montagem vigente em cada spot (ponto de medição), com histórico. geometry_id: revisão da montagem vinculada ao spot (nula: vale a sugerida no TAG). suggested_course_mm: curso disponível típico específico deste spot (nulo: herda o do TAG); é estimativa, nunca tratada como medida. datum_raw: ângulo bruto no datum mecânico desta instalação (curvas table sem porta-ímã indexado).';

-- ---------------------------------------------------------------------------
-- 2. Leituras: contagem contínua e resultado de bancada
-- ---------------------------------------------------------------------------
alter table public.gaxeta_readings
  add column ct_session text,
  add column ct_count integer,
  add column ct_origin smallint,
  add column ct_loss text,
  add column ct_step smallint,
  add column ct_gap_ms integer,
  add column bench_id bigint references gaxeta_private.mag_bench_modes(id),
  add column bench_state text,
  add column bench_u_deg numeric(12, 3),
  add column bench_percent numeric(7, 4);
alter table public.gaxeta_readings
  add constraint gaxeta_readings_ct_check check (
    (ct_session is null or ct_session ~ '^[a-f0-9]{8}$')
    and ((ct_session is null) = (ct_count is null)) and ((ct_session is null) = (ct_origin is null))
    and (ct_origin is null or ct_origin between 0 and 4095)
    and (ct_loss is null or ct_loss in ('boot', 'no_magnet', 'field', 'bus', 'gap', 'speed', 'ambiguous', 'incoherent'))
    and (ct_step is null or ct_step between 0 and 4095)
    and (ct_gap_ms is null or ct_gap_ms between 0 and 65535)),
  add constraint gaxeta_readings_bench_check check (
    (bench_state is null or bench_state in ('ok', 'awaiting_start', 'reposition', 'no_continuity'))
    and ((bench_id is null) = (bench_state is null))
    and ((bench_state is not distinct from 'ok') = (bench_percent is not null))
    and ((bench_percent is null) = (bench_u_deg is null))
    and (bench_percent is null or bench_percent between 0 and 100)),
  add constraint gaxeta_readings_ct_modality_check check (modality = 'as5600_i2c' or (
    ct_session is null and ct_count is null and ct_origin is null and ct_loss is null and ct_step is null and ct_gap_ms is null
    and bench_id is null and bench_state is null and bench_u_deg is null and bench_percent is null));
comment on column public.gaxeta_readings.ct_session is 'AS5600, firmware 4.5.0: sessão da contagem contínua (8 hexadecimais sorteados pela placa quando a contagem começa ou recomeça). Nula: firmware sem aquisição contínua ou placa sem contagem naquele instante.';
comment on column public.gaxeta_readings.ct_count is 'Contagens acumuladas desde a origem da sessão, com sinal (4096 por volta; 4095→0 vale +1). Valor absoluto dentro da sessão, não incremento: reenvio do pacote não altera nada.';
comment on column public.gaxeta_readings.ct_origin is 'Ângulo bruto (0 a 4095) da primeira amostra da sessão. Posição contínua no referencial do chip = (ct_origin + ct_count) × 360/4096.';
comment on column public.gaxeta_readings.ct_loss is 'Por que a sessão vigente começou (ou por que não há sessão): boot, no_magnet, field, bus, gap (lacuna de aquisição acima do limite), speed (90° ou mais entre duas amostras), ambiguous (meia volta exata), incoherent (pacote com origem + contagem diferente da última amostra).';
comment on column public.gaxeta_readings.ct_step is 'Maior passo entre duas amostras consecutivas desde o envio anterior, em contagens (margem em relação a 1024 = 90°).';
comment on column public.gaxeta_readings.ct_gap_ms is 'Maior lacuna entre duas amostras consecutivas desde o envio anterior, em ms.';
comment on column public.gaxeta_readings.bench_id is 'Modo bancada vigente quando esta leitura chegou (configuração do período). Nulo: leitura fora do Modo bancada.';
comment on column public.gaxeta_readings.bench_state is 'ok: posição de bancada calculada. awaiting_start: início ainda não confirmado. reposition: continuidade perdida, precisa de nova referência. no_continuity: firmware sem contagem contínua.';
comment on column public.gaxeta_readings.bench_u_deg is 'CALCULADO (bancada): posição contínua em graus a partir do ângulo de 0 %, com sinal e sem limite (abaixo de 0 ou acima da faixa = passou do extremo).';
comment on column public.gaxeta_readings.bench_percent is 'CALCULADO (bancada): Posição de bancada (%), limitada a 0–100. Não é curso de ajuste restante e não entra na série de campo.';

-- ---------------------------------------------------------------------------
-- 3. Contas puras: faixa de bancada e faixas de ajuste
-- ---------------------------------------------------------------------------
-- Graus do ângulo 'p_deg' a partir do ângulo de 0 %, no sentido da faixa: 0 (incl.) a 360 (excl.).
create function gaxeta_private.mag_bench_u(p_zero numeric, p_direction integer, p_deg numeric)
 returns numeric language sql immutable set search_path = '' as $$
  select ((((p_deg - p_zero) * p_direction) % 360) + 360) % 360
$$;
-- Posição de bancada a partir da posição contínua u (graus desde o 0 %) e da faixa.
create function gaxeta_private.mag_bench_eval(p_span numeric, p_u numeric)
 returns jsonb language sql immutable set search_path = '' as $$
  select case when p_span is null or p_span <= 0 or p_u is null then null else jsonb_build_object(
    'u_deg', round(p_u, 3),
    'percent', round(least(100, greatest(0, 100 * p_u / p_span)), 4),
    'over_deg', round(case when p_u > p_span then p_u - p_span when p_u < 0 then p_u else 0 end, 3),
    'limit', case when p_u > p_span then 'above' when p_u < 0 then 'below' end) end
$$;
-- Faixa do curso de ajuste restante. A decisão usa o valor com duas casas, o mesmo que a tela
-- mostra: 29,99 é "sem ajuste" e 30,00 é "baixo ajuste", sem divergência entre número, legenda e cor.
create function gaxeta_private.mag_band(p_percent numeric)
 returns text language sql immutable set search_path = '' as $$
  select case when p_percent is null then null
              when round(p_percent, 2) >= 73 then 'high'
              when round(p_percent, 2) >= 50 then 'medium'
              when round(p_percent, 2) >= 30 then 'low'
              else 'none' end
$$;

-- Montagem vigente de um spot, campo a campo: o curso típico e a geometria vêm do próprio spot
-- ou, na falta, do TAG. 'source' mantém o significado anterior (há linha própria do spot ou não);
-- 'course_source' e 'geometry_source' dizem de onde veio cada valor.
create or replace function gaxeta_private.mag_setup(p_point_id uuid)
 returns jsonb language sql stable set search_path = '' as $$
  with p as (
    select s.geometry_id, s.datum_raw, s.suggested_course_mm from gaxeta_private.mag_point_setups s
     where s.point_id = p_point_id and s.valid_to is null
  ), e as (
    select d.geometry_id, d.suggested_course_mm, d.size_class from gaxeta_private.mag_equipment_defaults d
      join public.gaxeta_assets a on a.id = p_point_id
     where d.asset_id = any (a.path) order by array_position(a.path, d.asset_id) desc limit 1
  )
  select case when not exists (select 1 from p) and not exists (select 1 from e) then null else jsonb_build_object(
    'source', case when exists (select 1 from p) then 'point' else 'equipment' end,
    'geometry_id', coalesce((select geometry_id from p), (select geometry_id from e)),
    'geometry_source', case when (select geometry_id from p) is not null then 'point' when (select geometry_id from e) is not null then 'equipment' end,
    'datum_raw', (select datum_raw from p),
    'suggested_course_mm', coalesce((select suggested_course_mm from p), (select suggested_course_mm from e)),
    'course_source', case when (select suggested_course_mm from p) is not null then 'point' when (select suggested_course_mm from e) is not null then 'equipment' end,
    'size_class', (select size_class from e)) end
$$;

-- Encerra os serviços em aberto de um vínculo. Fim do vínculo e troca de modalidade encerram
-- também o Modo bancada (a troca de geometria do spot não mexe na bancada).
create or replace function gaxeta_private.mag_close_services(p_link_id bigint, p_reason text, p_at timestamptz)
 returns void language sql set search_path = '' as $$
  update gaxeta_private.mag_services
     set status = case status when 'pending' then 'cancelled' else 'superseded' end,
         ended_at = p_at, end_reason = p_reason
   where link_id = p_link_id and status in ('pending', 'active');
  update gaxeta_private.mag_bench_modes
     set status = 'ended', ended_at = p_at, end_reason = p_reason
   where link_id = p_link_id and status = 'active' and p_reason in ('link_closed', 'modality_change');
$$;

revoke all on function
  gaxeta_private.mag_bench_u(numeric, integer, numeric), gaxeta_private.mag_bench_eval(numeric, numeric), gaxeta_private.mag_band(numeric)
  from public, anon, authenticated, service_role;

notify pgrst, 'reload schema';
commit;
