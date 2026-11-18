#!/usr/bin/env bash
# Suíte funcional completa, do zero: baseline + fixture legada + migrações 01–11 + testes.
# Uso: PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh   (~1 min)
set -uo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_dev
"$ROOT/dev/rebuild.sh" $DB
for f in 20_pos_migracao 30_tenants 40_matriz_acesso 60_consultas_novas 70_ficha_spots; do
  psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/$f.sql" > /tmp/suite_$f.log 2>&1 || { echo "ERRO em $f:"; grep -n "ERROR" -A3 /tmp/suite_$f.log | head -8; }
done
"$ROOT/tests/50_concorrencia.sh" $DB > /tmp/suite_50.log 2>&1
# A suíte 75 usa o sensor que a 50 deixa vinculado; por isso roda depois dela.
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/75_ciclos_gaxeta.sql" > /tmp/suite_75_ciclos_gaxeta.log 2>&1 || { echo "ERRO em 75_ciclos_gaxeta:"; grep -n "ERROR" -A3 /tmp/suite_75_ciclos_gaxeta.log | head -8; }
# A suíte 76 (migração 10) usa a árvore e os sensores que a 75 deixa; por isso roda depois dela.
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/76_calibracao_tensao.sql" > /tmp/suite_76_calibracao_tensao.log 2>&1 || { echo "ERRO em 76_calibracao_tensao:"; grep -n "ERROR" -A3 /tmp/suite_76_calibracao_tensao.log | head -8; }
# A suíte 77 (migração 11) usa os utilitários e a árvore que a 76 deixa; por isso roda depois dela.
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/77_comissionamento_dois_pontos.sql" > /tmp/suite_77_comissionamento_dois_pontos.log 2>&1 || { echo "ERRO em 77_comissionamento_dois_pontos:"; grep -n "ERROR" -A3 /tmp/suite_77_comissionamento_dois_pontos.log | head -8; }
"$ROOT/tests/90_base_limpa_e_reversao.sh" > /tmp/suite_90.log 2>&1 || echo "ERRO em 90"
grep -v "^migrações\|^$" /tmp/suite_90.log
psql -q -At -F ' | ' -d $DB -c "select rpad(suite, 40), 'ok=' || count(*) filter (where ok), 'falhas=' || count(*) filter (where not ok) from (select suite, ok from t.results union all select 'x', true where false) r group by suite order by suite"
psql -q -At -d $DB -c "select 'FALHA: ' || suite || ' | ' || name || ' | ' || coalesce(detail, '') from t.results where not ok"
psql -q -At -d $DB -c "select 'TOTAL: ' || count(*) || ' verificações, ' || count(*) filter (where not ok) || ' falhas' from t.results"
