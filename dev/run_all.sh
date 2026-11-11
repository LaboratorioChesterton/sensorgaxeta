#!/usr/bin/env bash
# Suíte funcional completa, do zero: baseline + fixture legada + migrações 01–06 + testes.
# Uso: PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh   (~1 min)
set -uo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_dev
"$ROOT/dev/rebuild.sh" $DB
for f in 20_pos_migracao 30_tenants 40_matriz_acesso 60_consultas_novas; do
  psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/$f.sql" > /tmp/suite_$f.log 2>&1 || { echo "ERRO em $f:"; grep -n "ERROR" -A3 /tmp/suite_$f.log | head -8; }
done
"$ROOT/tests/50_concorrencia.sh" $DB > /tmp/suite_50.log 2>&1
"$ROOT/tests/90_base_limpa_e_reversao.sh" > /tmp/suite_90.log 2>&1 || echo "ERRO em 90"
grep -v "^migrações\|^$" /tmp/suite_90.log
psql -q -At -F ' | ' -d $DB -c "select rpad(suite, 40), 'ok=' || count(*) filter (where ok), 'falhas=' || count(*) filter (where not ok) from (select suite, ok from t.results union all select 'x', true where false) r group by suite order by suite"
psql -q -At -d $DB -c "select 'FALHA: ' || suite || ' | ' || name || ' | ' || coalesce(detail, '') from t.results where not ok"
psql -q -At -d $DB -c "select 'TOTAL: ' || count(*) || ' verificações, ' || count(*) filter (where not ok) || ' falhas' from t.results"
