#!/usr/bin/env bash
# Ensaio completo da limpeza em desenvolvimento: simulação, manifesto congelado, cópia,
# exclusão em lotes com ingestão concorrente, verificação e restauração (com conflito).
set -euo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_cleanup; S=ESP32-PILOTO000001; TOK=dev-token-0123456789abcdef0123456789abcdef
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
"$ROOT/dev/rebuild.sh" $DB >/dev/null
q -c "select set_config('t.suite','95 ensaio da limpeza',false)" >/dev/null
chk() { q -c "select set_config('t.suite','95 ensaio da limpeza',false); select t.log(($1), \$\$$2\$\$, (\$\$$3\$\$))" | tail -1; }
# Sensor do piloto com volume e cadência parecidos com os de produção (66 mil a cada 10 s, até agora).
q -c "delete from public.gaxeta_movements where sensor_id='$S'; delete from public.gaxeta_readings where sensor_id='$S'; update public.gaxeta_devices set reading_count=0, stable_percent=null, stable_since=null where sensor_id='$S'" >/dev/null
q -c "select t.gen_sensor('$S', 66100, now() - interval '10 seconds' * 66100, interval '10 seconds', 0.9)" >/dev/null
q -c "analyze public.gaxeta_readings"
q -f "$ROOT/limpeza/00_esquema_manutencao.sql"
echo "--- simulação (somente leitura)"; q -v sensor="'$S'" -v n=60000 -v dedupe="'24 hours'" -f "$ROOT/limpeza/01_simulacao_somente_leitura.sql" | python3 -I -c "import sys,json; d=json.load(sys.stdin); [print(f'  {k}: {v}') for k,v in d.items()]"
q <<SQL >/dev/null
create table t.before as select
  (select count(*) from public.gaxeta_readings where sensor_id='$S') as n,
  (select count(*) from public.gaxeta_movements) as mov, (select md5(string_agg(m::text, '' order by reading_id)) from public.gaxeta_movements m) as mov_md5,
  (select reading_count from public.gaxeta_devices where sensor_id='$S') as rc,
  (select stable_percent::text || '|' || stable_since::text || '|' || last_sequence from public.gaxeta_devices where sensor_id='$S') as state,
  (select count(*) from public.gaxeta_readings where sensor_id<>'$S') as others, (select md5(string_agg(r::text, '' order by id)) from public.gaxeta_readings r where sensor_id<>'$S') as others_md5,
  now() as anchor;
create or replace function t.h(p_a interval, p_b interval) returns jsonb language plpgsql as \$\$
declare j jsonb; v_anchor timestamptz := (select anchor from t.before);
begin
  perform t.login(t.id('adm1')); j := public.gaxeta_history('$S', v_anchor - p_a, v_anchor - p_b); perform set_config('role', 'postgres', true);
  return j;
end \$\$;
create table t.hist_before as select w, t.h(a, b) j
  from (values ('retido_12h', interval '12 hours', interval '0'), ('retido_16h', interval '16 hours', interval '1 hour'), ('antigo_2d', interval '7 days', interval '5 days'), ('tudo_8d', interval '8 days', interval '0')) v(w, a, b);
SQL
q -c "select set_config('request.jwt.claims','',false)" >/dev/null
RUN=$(q -c "select gaxeta_maint.freeze('$S', 60000, '24 hours', 'ensaio em desenvolvimento')")
echo "--- manifesto congelado"; q -x -c "select id, sensor_id, first_n, protected_by_movement, protected_as_reference, protected_by_dedupe, manifest_count, manifest_checksum, first_received_at, last_received_at, status from gaxeta_maint.cleanup_runs where id=$RUN" | sed 's/^/  /'
chk "(select manifest_count = first_n - protected_by_movement - protected_as_reference - protected_by_dedupe from gaxeta_maint.cleanup_runs where id=$RUN)" "manifesto = primeiras N menos as protegidas" ""
chk "(select count(*) from gaxeta_maint.readings_backup where run_id=$RUN) = (select manifest_count from gaxeta_maint.cleanup_runs where id=$RUN)" "cópia restaurável tem todas as linhas do manifesto" ""
# A "placa" continua enviando durante a exclusão (rota real, boot novo, 1 leitura por segundo).
( for i in $(seq 1 14); do psql -q -At -d "$DB" -c "begin; select t.anon(); select public.gaxeta_ingest('$TOK', jsonb_build_object('sensor_id','$S','boot_id','ffffffffffffffff','sequence',$((i*2)),'travel_percent',$((20+i)),'position_mm',10,'voltage_v',0.5)) ->> 'ok'; commit;" ; sleep 0.9; done > /tmp/ingest_during.txt 2>&1 ) &
ING=$!
sleep 1.2; echo "--- execução em lotes (5.000 por transação, ingestão concorrente)"
while :; do R=$(q -c "select gaxeta_maint.run_batch($RUN, 5000, '30 seconds')"); echo "  $R"; echo "$R" | grep -q '"status": "done"' && break; sleep 0.4; done
wait $ING
OKI=$(grep -c '^true$' /tmp/ingest_during.txt || true)
chk "$OKI = 14" "ingestão concorrente: 14 de 14 leituras aceitas durante os lotes" "aceitas=$OKI"
chk "(select count(*) from public.gaxeta_readings r join gaxeta_maint.cleanup_manifest m on m.reading_id = r.id and m.run_id=$RUN) = 0" "nenhuma linha do manifesto permanece" ""
chk "(select count(*) from public.gaxeta_readings where sensor_id='$S') = (select n from t.before) - (select manifest_count from gaxeta_maint.cleanup_runs where id=$RUN) + $OKI" "contagem final = anterior − manifesto + ingeridas no período" ""
chk "(select count(*) from public.gaxeta_movements where sensor_id<>'$S' or received_at <= (select anchor from t.before)) = (select mov from t.before) and (select md5(string_agg(m::text, '' order by reading_id)) from public.gaxeta_movements m where received_at <= (select anchor from t.before)) = (select mov_md5 from t.before)" "todos os movimentos anteriores intactos (conteúdo idêntico)" ""
chk "not exists (select 1 from public.gaxeta_movements m where not exists (select 1 from public.gaxeta_readings r where r.id = m.reading_id))" "FK de movimentos íntegra" ""
chk "(select reading_count from public.gaxeta_devices where sensor_id='$S') = (select rc from t.before) + $OKI" "reading_count acumulado não diminuiu (só somou as novas)" ""
chk "(select count(*) from public.gaxeta_readings where sensor_id<>'$S') = (select others from t.before) and (select md5(string_agg(r::text, '' order by id)) from public.gaxeta_readings r where sensor_id<>'$S') = (select others_md5 from t.before)" "leituras de outros dispositivos (inclusive VALIDACAO-INTEGRACAO) intocadas" ""
chk "(select bool_and(t.h(a, b) = (select j from t.hist_before where w = v.w)) from (values ('retido_12h', interval '12 hours', interval '0'), ('retido_16h', interval '16 hours', interval '1 hour')) v(w, a, b))" "histórico do período retido idêntico ao de antes" ""
chk "(select (h.j -> 'movements') = (n.j -> 'movements') and (h.j -> 'seed') = (n.j -> 'seed') from t.hist_before h, (select t.h(interval '7 days', interval '5 days') j) n where h.w = 'antigo_2d')" "período antigo: mudanças e referência anterior preservadas (linha estabilizada continua desenhável)" ""
echo "  período antigo, leituras brutas no histórico: antes=$(q -c "select j -> 'stats' ->> 'count' from t.hist_before where w='antigo_2d'") depois=$(q -c "select t.h(interval '7 days', interval '5 days') -> 'stats' ->> 'count'") (só as protegidas)"
echo "  janela bruta contínua restante: $(q -c "select round(extract(epoch from max(received_at) - min(received_at)) / 3600.0, 1) || ' h, ' || count(*) || ' leituras' from public.gaxeta_readings where sensor_id='$S' and received_at > (select last_received_at from gaxeta_maint.cleanup_runs where id=$RUN)")"
# Reenvio tardio de uma amostra já apagada (janela de deduplicação): entra como linha nova.
DUP=$(q -c "select boot_id || ' ' || sequence from gaxeta_maint.readings_backup where run_id=$RUN order by id limit 1")
q -c "begin; select t.anon(); select pg_sleep(0.8); select public.gaxeta_ingest('$TOK', jsonb_build_object('sensor_id','$S','boot_id','${DUP% *}','sequence',${DUP#* },'travel_percent',33,'position_mm',10,'voltage_v',0.5)) ->> 'duplicate'; commit;" > /tmp/dup.txt
chk "'$(tail -1 /tmp/dup.txt)' = 'false'" "efeito conhecido: reenvio de amostra apagada deixa de ser reconhecido como duplicata" "duplicate=$(tail -1 /tmp/dup.txt)"
echo "--- restauração"; q -c "create table t.res as select gaxeta_maint.restore($RUN) as j"; echo "  $(q -c "select j from t.res")"
chk "(select ((select j from t.res) ->> 'restored')::int + ((select j from t.res) ->> 'skipped_same_boot_sequence')::int = manifest_count from gaxeta_maint.cleanup_runs where id=$RUN) and ((select j from t.res) ->> 'skipped_same_boot_sequence')::int = 1" "restauração: tudo volta, exceto a amostra que conflitou por (sensor, boot, sequência)" ""
chk "(select md5(string_agg(md5(row(r.*)::text), '' order by r.id)) from public.gaxeta_readings r join gaxeta_maint.readings_backup b on b.run_id=$RUN and b.id = r.id) is not null and (select count(*) from public.gaxeta_readings r join gaxeta_maint.readings_backup b on b.run_id=$RUN and b.id = r.id and row(r.*) = row(b.id, b.sensor_id, b.boot_id, b.sequence, b.received_at, b.sampled_at, b.travel_percent, b.position_mm, b.voltage_v, b.adc_raw, b.rssi, b.uptime_ms, b.adc_noise, b.stable_percent)) = ((select j from t.res) ->> 'restored')::int" "linhas restauradas idênticas à cópia, com os mesmos IDs" ""
chk "(select t.h(interval '7 days', interval '5 days') -> 'stats' ->> 'count') = (select j -> 'stats' ->> 'count' from t.hist_before where w = 'antigo_2d')" "após restaurar, o período antigo volta a ter todas as leituras" ""
q -c "select name, detail from t.results where suite='95 ensaio da limpeza' and not ok; select '95 ensaio da limpeza: ok=' || count(*) filter (where ok) || ' falhas=' || count(*) filter (where not ok) from t.results where suite='95 ensaio da limpeza'"
