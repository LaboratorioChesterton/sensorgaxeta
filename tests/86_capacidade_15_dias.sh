#!/usr/bin/env bash
# Capacidade para 15 dias de ensaio com o contrato magnético (migração 14), em CÓPIA ISOLADA.
# Não toca a produção nem o banco das suítes: cria gaxeta_cap a partir de gaxeta_dev (rode
# dev/run_all.sh antes). Carga: N placas magnéticas enviando a cada 30 s por 15 dias (43.200
# leituras por placa) mais uma placa de potenciômetro no mesmo ritmo, para comparação.
# Mede: tamanho por linha e por índice, latência da ingestão (rota nova e antiga), latência das
# consultas da interface e o efeito de cada um dos dois índices (sensor_id, received_at).
# Uso: tests/86_capacidade_15_dias.sh [placas=10]        (~2 min)
set -euo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
SRC=gaxeta_dev; DB=gaxeta_cap; N="${1:-10}"; S=ESP32-MAGNE00000B1; P=ESP32-PILOTO000001
TOK=dev-token-0123456789abcdef0123456789abcdef
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
psql -q -d postgres -c "drop database if exists $DB" -c "create database $DB template $SRC"
SVC=$(q -c "select id from gaxeta_private.mag_services where sensor_id = '$S' and status = 'active'")
[ -n "$SVC" ] || { echo "sem referência ativa em $S: rode dev/run_all.sh antes"; exit 1; }
BEFORE=$(q -c "select count(*) || '|' || pg_total_relation_size('public.gaxeta_readings') from public.gaxeta_readings")

T0=$(date +%s)
q <<SQL >/dev/null
update gaxeta_private.ingest_keys set max_devices = 100;
-- A referência do sensor de consulta passa a valer desde o começo do período.
update gaxeta_private.mag_services set requested_at = now() - interval '15 days 1 hour', captured_at = now() - interval '15 days 1 hour',
       stable_since = now() - interval '15 days 1 hour' where id = $SVC;
-- Placas magnéticas: a de consulta ($S, vinculada, com referência) e as demais só com ângulo.
insert into public.gaxeta_devices (sensor_id, origin) select 'ESP32-CAP' || lpad(g::text, 9, '0'), 'esp32' from generate_series(2, $N) g;
insert into public.gaxeta_readings (sensor_id, boot_id, sequence, received_at, sampled_at, rssi, uptime_ms, acq_method,
    modality, schema_version, raw_angle, angle_pp, mag_status, bus_status, agc, magnitude,
    service_id, advance_mm, remaining_mm, remaining_percent, range_state, stable_remaining)
  select d.sensor_id, md5(d.sensor_id || (i / 2880)::text), (i % 2880) + 1,
         now() - interval '15 days' + make_interval(secs => i * 30 + d.k * 0.9), now() - interval '15 days' + make_interval(secs => i * 30 + d.k * 0.9 - 1.2),
         -55 - (i % 9), ((i % 2880) + 1) * 30000::bigint, 'as5600-i2c-n20-circ',
         'as5600_i2c', 4, r.raw, 1 + (i % 3), 'ok', 'ok', 61 + (i % 4), 2070 + (i % 40),
         case when d.k = 1 then $SVC end,
         case when d.k = 1 then round(((r.raw - 700) * 360.0 / 4096 * 0.25)::numeric, 4) end,
         case when d.k = 1 then round((30 - (r.raw - 700) * 360.0 / 4096 * 0.25)::numeric, 4) end,
         case when d.k = 1 then round((100 * (30 - (r.raw - 700) * 360.0 / 4096 * 0.25) / 30)::numeric, 4) end,
         case when d.k = 1 then 'ok' end,
         case when d.k = 1 then round((100 - 5 * floor((r.raw - 700) * 360.0 / 4096 * 0.25 / 30 * 20))::numeric, 4) end
    from (select '$S'::text sensor_id, 1 k union all select 'ESP32-CAP' || lpad(g::text, 9, '0'), g from generate_series(2, $N) g) d
    cross join generate_series(0, 43198) i
    cross join lateral (select (700 + (i * 1300 / 43200))::int raw) r;
-- Placa de potenciômetro no mesmo ritmo (pacote 4.3.2).
insert into public.gaxeta_readings (sensor_id, boot_id, sequence, received_at, sampled_at, travel_percent, position_mm, voltage_v, adc_raw, rssi, uptime_ms,
    adc_noise, stable_percent, voltage_mv, adc_min, adc_max, acq_method)
  select '$P', md5('cap-pot' || (i / 2880)::text), (i % 2880) + 1, now() - interval '15 days' + make_interval(secs => i * 30 + 7), now() - interval '15 days' + make_interval(secs => i * 30 + 6),
         round((40 + i * 20.0 / 43200)::numeric, 2), round((20 + i * 10.0 / 43200)::numeric, 3), round((1.32 + i * 0.66 / 43200)::numeric, 4), round((1638 + i * 819.0 / 43200)::numeric, 3),
         -57, ((i % 2880) + 1) * 30000::bigint, 2.5, round((40 + 5 * floor(i * 4.0 / 43200))::numeric, 2), (1216 + i * 608 / 43200)::int, (1634 + i * 819 / 43200)::int, (1642 + i * 819 / 43200)::int, 'a1-12db-n20-cf-c3'
    from generate_series(0, 43198) i;
update public.gaxeta_devices d set last_received_at = now() - interval '40 seconds', reading_count = reading_count + 43199,
       last_boot_id = x.boot_id, last_sequence = x.sequence, last_sampled_at = x.sampled_at,
       last_modality = case when x.modality = 'as5600_i2c' then 'as5600_i2c' else d.last_modality end,
       last_raw_angle = x.raw_angle, last_angle_pp = x.angle_pp, last_mag_status = x.mag_status, last_bus_status = x.bus_status
  from (select distinct on (sensor_id) * from public.gaxeta_readings where sensor_id = '$S' or sensor_id like 'ESP32-CAP%' or sensor_id = '$P' order by sensor_id, received_at desc) x
 where d.sensor_id = x.sensor_id;
vacuum analyze public.gaxeta_readings;

-- Tempo de uma consulta como o usuário a executa: mediana e pior de p_n execuções (ms).
create or replace function t.cap_q(p_user uuid, p_sql text, p_n int default 7) returns text language plpgsql as \$\$
declare t0 timestamptz; a numeric[] := '{}'; i int;
begin
  perform t.login(p_user); execute p_sql;
  for i in 1..p_n loop t0 := clock_timestamp(); execute p_sql; a := a || round(extract(epoch from clock_timestamp() - t0) * 1000, 2); end loop;
  perform set_config('role', 'postgres', true);
  return (select lpad(percentile_disc(0.5) within group (order by v)::text, 8) || ' ms (pior ' || max(v) || ')' from unnest(a) v);
end \$\$;
-- Latência da ingestão: p_n pacotes novos em sequência; só a chamada da rota é cronometrada.
create or replace function t.cap_ingest(p_kind text, p_sensor text, p_n int) returns text language plpgsql as \$\$
declare t0 timestamptz; a numeric[] := '{}'; i int; v jsonb; v_boot text := md5(p_sensor || p_kind || clock_timestamp()::text);
begin
  for i in 1..p_n loop
    update public.gaxeta_devices set last_received_at = last_received_at - interval '2 seconds' where sensor_id = p_sensor;
    if p_kind = 'mag' then
      v := jsonb_build_object('schema_version', 4, 'modality', 'as5600_i2c', 'sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', i, 'origin', 'esp32',
        'raw_angle', 1900 + (i % 5), 'angle_pp', 1, 'mag_status', 'ok', 'bus_status', 'ok', 'agc', 61, 'magnitude', 2078, 'rssi', -50, 'uptime_ms', i * 30000,
        'send_period_s', 30, 'firmware_version', '4.4.0-mag30', 'acq_method', 'as5600-i2c-n20-circ',
        'sampled_at', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
      t0 := clock_timestamp(); perform public.gaxeta_ingest_v4('$TOK', v);
    else
      v := jsonb_build_object('sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', i, 'origin', 'esp32', 'travel_percent', 60.2 + (i % 3) * 0.1, 'position_mm', 30.1,
        'voltage_v', 1.98, 'adc_raw', 2465.3, 'rssi', -57, 'uptime_ms', i * 30000, 'sampled_at', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'device_name', 'GAXETA-ESP32', 'firmware_version', '4.3.2-cont30', 'adc_noise', 2.5, 'voltage_mv', 1830, 'adc_min', 2461, 'adc_max', 2469, 'acq_method', 'a1-12db-n20-cf-c3');
      t0 := clock_timestamp(); perform public.gaxeta_ingest('$TOK', v);
    end if;
    a := a || round(extract(epoch from clock_timestamp() - t0) * 1000, 3);
  end loop;
  return (select 'p50 ' || percentile_disc(0.5) within group (order by x) || ' ms | p95 ' || percentile_disc(0.95) within group (order by x) || ' ms | pior ' || max(x) || ' ms' from unnest(a) x);
end \$\$;
SQL
LOAD=$(( $(date +%s) - T0 ))
A=$(q -c "select t.id('adm1')")
sizes() { q -F ' | ' -c "select rpad(c.relname, 46), lpad(pg_size_pretty(pg_relation_size(c.oid)), 9), lpad(round(pg_relation_size(c.oid)::numeric / (select count(*) from public.gaxeta_readings), 1)::text, 6) || ' B/linha'
  from pg_class c where c.oid = 'public.gaxeta_readings'::regclass or c.oid in (select indexrelid from pg_index where indrelid = 'public.gaxeta_readings'::regclass) order by pg_relation_size(c.oid) desc"; }
m() { printf "  %-74s %s\n" "$1" "$(q -c "set statement_timeout = '8s'; select t.cap_q('$A', \$\$$2\$\$)" 2>&1 | tail -1)"; }
bench() {
  echo "  ingestão magnética  (gaxeta_ingest_v4, 300 pacotes)                          $(q -c "select t.cap_ingest('mag', '$S', 300)")"
  echo "  ingestão elétrica   (gaxeta_ingest,    300 pacotes)                          $(q -c "select t.cap_ingest('pot', '$P', 300)")"
  m "resumo magnético de 1 sensor (cartão e gaveta)"                    "select public.gaxeta_mag_summary(array['$S'])"
  m "resumo de telemetria de 1 sensor (inclui mediana do intervalo)"     "select public.gaxeta_telemetry_summary(array['$S'])"
  m "histórico magnético, 24 h (2.880 leituras)"                         "select public.gaxeta_mag_history('$S', now() - interval '24 hours', now())"
  m "histórico magnético, 7 dias (20.160 leituras)"                      "select public.gaxeta_mag_history('$S', now() - interval '7 days', now())"
  m "histórico magnético, 15 dias (43.200 leituras)"                     "select public.gaxeta_mag_history('$S', now() - interval '15 days', now())"
  m "histórico elétrico, 15 dias (43.200 leituras)"                      "select public.gaxeta_history('$P', now() - interval '15 days', now())"
}
{
echo "# Capacidade para 15 dias — cópia isolada (PostgreSQL $(q -c 'show server_version'), $(nproc) vCPU, sem rede)"
echo "Carga: $N placas magnéticas + 1 de potenciômetro, 1 leitura a cada 30 s por 15 dias (43.200 por placa). Tempo de carga: ${LOAD} s."
echo "Antes da carga: ${BEFORE%%|*} leituras, $(( ${BEFORE##*|} / 1024 )) kB.  Depois: $(q -c "select count(*) || ' leituras, ' || pg_size_pretty(pg_total_relation_size('public.gaxeta_readings')) || ' (tabela + índices + TOAST)' from public.gaxeta_readings")"
echo
echo "## Tamanho por linha (bytes do registro, sem índice)"
q -F ' | ' -c "select rpad(modality, 12), 'linhas ' || count(*), 'média ' || round(avg(pg_column_size(r.*))) || ' B', 'máx ' || max(pg_column_size(r.*)) || ' B' from public.gaxeta_readings r where received_at > now() - interval '15 days 2 hours' group by 1 order by 1"
echo
echo "## Tabela e índices"
sizes
echo
echo "## A. Com os dois índices (sensor_id, received_at) — como a produção está"
bench
echo
echo "## B. Sem gaxeta_readings_sensor_time (o DESC); fica só gaxeta_readings_sensor_time_idx"
q -c "drop index public.gaxeta_readings_sensor_time; analyze public.gaxeta_readings" >/dev/null
bench
echo
echo "## Paralelo: $N placas enviando ao mesmo tempo, 5 rodadas (cada placa respeita os 750 ms)"
T1=$(date +%s%N)
for k in $(seq 1 "$N"); do
  SID=$([ "$k" = 1 ] && echo "$S" || printf 'ESP32-CAP%09d' "$k")
  ( for r in 1 2 3 4 5; do
      q -c "select public.gaxeta_ingest_v4('$TOK', jsonb_build_object('schema_version', 4, 'modality', 'as5600_i2c', 'sensor_id', '$SID', 'boot_id', md5('par$SID'), 'sequence', $r, 'origin', 'esp32', 'raw_angle', 1900, 'angle_pp', 1, 'mag_status', 'ok', 'bus_status', 'ok', 'sampled_at', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"')))" >/dev/null 2>>/tmp/cap_par.err || true
      sleep 0.8
    done ) &
done; wait
MS=$(( ($(date +%s%N) - T1) / 1000000 ))
echo "  $(q -c "select count(*) from public.gaxeta_readings where boot_id in (select md5('par' || sensor_id) from public.gaxeta_devices)") de $(( N * 5 )) pacotes gravados em ${MS} ms (5 rodadas × 0,8 s = 4.000 ms de espera própria)"
} | tee /tmp/capacidade_15_dias.txt
