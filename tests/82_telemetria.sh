#!/usr/bin/env bash
# Telemetria: reproduz o limite de tempo de gaxeta_history com volume sintético,
# compara planos e tempos (A: baseline; B: corpo atual + políticas novas; C: migração 06)
# e prova que a resposta é idêntica. Recria a base gaxeta_perf do zero (~4 min).
set -euo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_perf; EV="$ROOT/evidencias"
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
plan() { # plan <rótulo> <arquivo> : plano principal de uma chamada de 31 dias no sensor de 66 mil leituras
  q <<SQL > /tmp/plan_raw.txt 2>&1
load 'auto_explain'; set auto_explain.log_min_duration = 0; set auto_explain.log_analyze = on; set auto_explain.log_nested_statements = on; set auto_explain.log_timing = off; set client_min_messages = log;
begin; select t.login('00000000-0000-4000-a000-000000000001');
select length(public.gaxeta_history('ESP32-PERF00066K', (select a from t.anchor) - interval '31 days', (select a from t.anchor))::text);
commit;
SQL
  { echo "# $1"; echo "# planos aninhados registrados numa chamada: $(grep -c '^LOG:  duration' /tmp/plan_raw.txt)"
    awk '/Query Text: with (source|buckets) as/{f=1} f{print} /^LOG:/{if(f&&c++>0)exit}' /tmp/plan_raw.txt | grep -v '^LOG'; } > "$2"
  echo "$1: $(sed -n 2p "$2" | cut -c3-)"
}

"$ROOT/dev/reset_db.sh" $DB >/dev/null 2>&1
q -f "$ROOT/tests/00_helpers.sql"
q -f "$ROOT/tests/80_telemetria_antes.sql" >/dev/null
q -c "create table t.anchor as select date_trunc('minute', now()) as a; grant select on t.anchor to public" >/dev/null
q -c "create or replace function t.time_history(p_label text, p_user uuid, p_sensor text, p_win interval) returns text language plpgsql as \$\$
declare t0 timestamptz; j jsonb; v_ms numeric; v_out text := 'ok'; v_n bigint; v_a timestamptz := (select a from t.anchor);
begin
  perform t.login(p_user); t0 := clock_timestamp();
  begin j := public.gaxeta_history(p_sensor, v_a - p_win, v_a); v_n := (j -> 'stats' ->> 'count')::bigint;
  exception when query_canceled then v_out := 'TIMEOUT 8s (57014)'; end;
  v_ms := round(extract(epoch from clock_timestamp() - t0) * 1000, 1);
  perform set_config('role', 'postgres', true);
  insert into t.timing values (p_label, p_sensor, p_win::text, v_ms, v_out, v_n);
  return v_ms::text;
end \$\$" >/dev/null
measure() { q -v label="'aquecimento'" -f "$ROOT/tests/81_medir_history.sql" >/dev/null 2>&1; q -c "delete from t.timing where label='aquecimento'"; q -v label="'$1'" -f "$ROOT/tests/81_medir_history.sql" >/dev/null 2>&1; }

echo "== A: baseline (corpo e políticas de produção)"; measure A; plan "A baseline" "$EV/plano_history_A_baseline.txt"

"$ROOT/dev/apply_migrations.sh" $DB 20261111175624 | tail -1
# Usuário de corporação com três janelas no sensor de 66 mil leituras: uma em spot fora
# do escopo (não lê), uma encerrada em spot do escopo e a atual.
q <<'SQL' >/dev/null
insert into auth.users (id, email, encrypted_password, email_confirmed_at) values ('00000000-0000-4000-a000-0000000000a1', 'alfa.todos@dev.test', 'x', now());
begin; select t.login('00000000-0000-4000-a000-000000000001');
select t.put('c', public.gaxeta_save_asset(null, null, 'corporation', 'Corp Perf', '', '') ->> 'id');
select t.put('e', public.gaxeta_save_asset(null, t.id('c'), 'company', 'Empresa', '', '') ->> 'id');
select t.put('a1', public.gaxeta_save_asset(null, t.id('e'), 'area', 'Área 1', '', '') ->> 'id');
select t.put('a2', public.gaxeta_save_asset(null, t.id('e'), 'area', 'Área 2', '', '') ->> 'id');
select t.put('q1', public.gaxeta_save_asset(null, t.id('a1'), 'equipment', 'TAG 1', 'T-1', '') ->> 'id');
select t.put('q2', public.gaxeta_save_asset(null, t.id('a2'), 'equipment', 'TAG 2', 'T-2', '') ->> 'id');
select t.put('p1', public.gaxeta_save_asset(null, t.id('q1'), 'point', 'LOA', '', '') ->> 'id');
select t.put('p1b', public.gaxeta_save_asset(null, t.id('q1'), 'point', 'LA', '', '') ->> 'id');
select t.put('p2', public.gaxeta_save_asset(null, t.id('q2'), 'point', 'LOA', '', '') ->> 'id');
select public.gaxeta_admin_invite_user('alfa.todos@dev.test', 'Alfa', null, t.id('c'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('a1'), 'mode', 'all'))) ->> 'kind';
commit;
update public.gaxeta_devices set measurement_point_id = t.id('p1') where sensor_id = 'ESP32-PERF00066K';
delete from gaxeta_private.device_links;
insert into gaxeta_private.device_links (sensor_id, point_id, linked_at, unlinked_at) values
  ('ESP32-PERF00066K', t.id('p2'),  (select a from t.anchor) - interval '6 days', (select a from t.anchor) - interval '5 days'),
  ('ESP32-PERF00066K', t.id('p1b'), (select a from t.anchor) - interval '5 days', (select a from t.anchor) - interval '4 days'),
  ('ESP32-PERF00066K', t.id('p1'),  (select a from t.anchor) - interval '2 days', null);
create table t.win (sensor text, f timestamptz, t timestamptz);
insert into t.win select s, a - w, a - e from t.anchor, (values ('ESP32-PERF00066K'), ('ESP32-PERF00780K')) x(s),
  (values ('1 hour'::interval, '0'::interval), ('1 day', '0'), ('7 days', '0'), ('31 days', '0'), ('92 days', '0'), ('366 days', '0'),
          ('3 days 02:13:07.5', '2 days 01:00:03.25'), ('5 days 12:00:00', '3 days 12:00:00'), ('100 days', '95 days'),
          ('00:00:01', '0'), ('00:10:00', '00:09:30'), ('200 days', '89 days 23:00:00'), ('6 days 06:00:00', '1 day 18:00:00')) v(w, e);
create or replace function t.time_call(p_user uuid, p_sql text) returns numeric language plpgsql as $$
declare t0 timestamptz;
begin
  perform t.login(p_user); execute p_sql; t0 := clock_timestamp(); execute p_sql;
  perform set_config('role', 'postgres', true);
  return round(extract(epoch from clock_timestamp() - t0) * 1000, 2);
end $$;
create table t.ref (label text, who text, sensor text, f timestamptz, t timestamptz, j jsonb);
create or replace function t.capture(p_label text, p_who text, p_user uuid) returns bigint language plpgsql as $$
declare r record; j jsonb; n bigint := 0;
begin
  for r in select * from t.win order by sensor, f loop
    perform t.login(p_user);
    j := public.gaxeta_history(r.sensor, r.f, r.t);
    perform set_config('role', 'postgres', true);
    insert into t.ref values (p_label, p_who, r.sensor, r.f, r.t, j); n := n + 1;
  end loop;
  return n;
end $$;
SQL
echo "== B: corpo atual + políticas novas (migrações 01–05)"; measure B; plan "B corpo atual, políticas novas" "$EV/plano_history_B_politicas_novas.txt"
q -c "set statement_timeout=0; select t.capture('B','admin','00000000-0000-4000-a000-000000000001'), t.capture('B','corp','00000000-0000-4000-a000-0000000000a1')" >/dev/null
TB=$(q -c "select t.time_call('00000000-0000-4000-a000-0000000000a1', \$\$select public.gaxeta_history('ESP32-PERF00066K', (select a from t.anchor) - interval '31 days', (select a from t.anchor))\$\$)")
SB=$(q -c "select t.time_call('00000000-0000-4000-a000-000000000001', 'select public.gaxeta_snapshot(null, 5)')")
"$ROOT/dev/apply_migrations.sh" $DB 99999999999999 20261111175658 | tail -1
echo "== C: migração 06"; measure C; plan "C migração 06" "$EV/plano_history_C_migracao_06.txt"
q -c "set statement_timeout=0; select t.capture('C','admin','00000000-0000-4000-a000-000000000001'), t.capture('C','corp','00000000-0000-4000-a000-0000000000a1')" >/dev/null
TC=$(q -c "select t.time_call('00000000-0000-4000-a000-0000000000a1', \$\$select public.gaxeta_history('ESP32-PERF00066K', (select a from t.anchor) - interval '31 days', (select a from t.anchor))\$\$)")
SC=$(q -c "select t.time_call('00000000-0000-4000-a000-000000000001', 'select public.gaxeta_snapshot(null, 5)') || ' ms (gaxeta_snapshot, 5 min) x ' || t.time_call('00000000-0000-4000-a000-000000000001', 'select public.gaxeta_devices_status()') || ' ms (gaxeta_devices_status)'")
{
echo "# gaxeta_history — tempos por variante (ms). Limite da API: 8.000 ms. PostgreSQL local 16.15, 2 vCPU."
echo "# A = baseline de produção; B = corpo atual + políticas novas; C = migração 06."
q -F ' | ' -c "select rpad(sensor, 17), lpad(win, 9), lpad(coalesce(max(readings)::text, '-'), 8) as leituras,
   lpad(max(case when label = 'A' then case when outcome = 'ok' then ms::text else 'TIMEOUT' end end), 8) as a,
   lpad(max(case when label = 'B' then case when outcome = 'ok' then ms::text else 'TIMEOUT' end end), 8) as b,
   lpad(max(case when label = 'C' then case when outcome = 'ok' then ms::text else 'TIMEOUT' end end), 8) as c
   from t.timing group by sensor, win order by sensor, max(readings) nulls last, win"
echo
echo "# Usuário de corporação (3 janelas de vínculo), 66 mil leituras, 31 dias: B = ${TB} ms; C = ${TC} ms"
echo "# Snapshot como o pacote publicado chama, com 843,6 mil leituras na base: ${SC} (antes da 06: ${SB} ms)"
echo
echo "# Equivalência da resposta (jsonb) entre o corpo atual (B) e o novo (C), mesmas janelas:"
q -F ' | ' -c "select b.who, count(*) as janelas, count(*) filter (where b.j = c.j) as identicas, count(*) filter (where b.j <> c.j) as diferentes,
   sum((b.j -> 'stats' ->> 'count')::bigint) as leituras_cobertas, count(*) filter (where (b.j ->> 'movements_truncated')::boolean) as truncadas, count(*) filter (where b.j -> 'seed' <> 'null') as com_referencia_anterior
   from t.ref b join t.ref c on c.label = 'C' and c.who = b.who and c.sensor = b.sensor and c.f = b.f and c.t = b.t where b.label = 'B' group by b.who order by 1"
echo
echo "# Usuário de corporação: leituras devolvidas pela RPC x SELECT direto sob RLS (mesma decisão):"
q -c "begin; select t.login('00000000-0000-4000-a000-0000000000a1');
  select 'RLS direto=' || (select count(*) from public.gaxeta_readings where sensor_id = 'ESP32-PERF00066K') || ' | RPC 366 dias=' ||
         (public.gaxeta_history('ESP32-PERF00066K', (select a from t.anchor) - interval '366 days', (select a from t.anchor)) -> 'stats' ->> 'count') ||
         ' | outro sensor: RLS=' || (select count(*) from public.gaxeta_readings where sensor_id = 'ESP32-PERF00780K') || ' RPC=' ||
         (public.gaxeta_history('ESP32-PERF00780K', (select a from t.anchor) - interval '366 days', (select a from t.anchor)) -> 'stats' ->> 'count'); commit;" | tail -1
echo
echo "# Uso dos índices de gaxeta_readings durante este roteiro:"
q -F ' | ' -c "select indexrelname, idx_scan from pg_stat_user_indexes where relname = 'gaxeta_readings' order by 1"
} | tee "$EV/telemetria_tempos_e_equivalencia.txt"
