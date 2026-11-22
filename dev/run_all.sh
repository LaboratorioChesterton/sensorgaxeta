#!/usr/bin/env bash
# Suíte funcional completa, do zero: baseline + fixture legada + migrações 01–16 + testes.
# As suítes 75 a 77 conferem o ciclo de gaxeta como ele existiu até a migração 11 (histórico
# reproduzível); por isso rodam antes das migrações 12 e 13, que tiram esse fluxo de operação.
# Uso: PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh   (~1 min)
set -uo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_dev
"$ROOT/dev/rebuild.sh" $DB 20261118165547
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
# Migração 12 (posição elétrica) e suíte 78; depois a migração 13 (ciclo de gaxeta fora de operação) e a suíte 79.
"$ROOT/dev/apply_migrations.sh" $DB 20261119141626 20261119141626 | tail -1
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/78_posicao_eletrica.sql" > /tmp/suite_78_posicao_eletrica.log 2>&1 || { echo "ERRO em 78_posicao_eletrica:"; grep -n "ERROR" -A3 /tmp/suite_78_posicao_eletrica.log | head -8; }
"$ROOT/dev/apply_migrations.sh" $DB 20261119142500 20261119142500 | tail -1
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/79_ciclo_fora_de_operacao.sql" > /tmp/suite_79_ciclo_fora_de_operacao.log 2>&1 || { echo "ERRO em 79_ciclo_fora_de_operacao:"; grep -n "ERROR" -A3 /tmp/suite_79_ciclo_fora_de_operacao.log | head -8; }
# Migração 14 (contrato magnético AS5600), suíte 84 e concorrência magnética (85).
"$ROOT/dev/apply_migrations.sh" $DB 20261121154407 20261121154407 | tail -1
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/84_contrato_magnetico.sql" > /tmp/suite_84_contrato_magnetico.log 2>&1 || { echo "ERRO em 84_contrato_magnetico:"; grep -n "ERROR" -A3 /tmp/suite_84_contrato_magnetico.log | head -8; }
"$ROOT/tests/85_concorrencia_magnetica.sh" $DB > /tmp/suite_85.log 2>&1 || echo "ERRO em 85"
# Migração 15 (Modo bancada, curso por TAG e por spot, faixas de ajuste) e suíte 87.
"$ROOT/dev/apply_migrations.sh" $DB 20261121999999 20261121154408 | tail -1
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/87_modo_bancada.sql" > /tmp/suite_87_modo_bancada.log 2>&1 || { echo "ERRO em 87_modo_bancada:"; grep -n "ERROR" -A3 /tmp/suite_87_modo_bancada.log | head -8; }
# Migração 16 (faixas simuladas da bancada; faixa idêntica não encerra a bancada) e suíte 88.
"$ROOT/dev/apply_migrations.sh" $DB 99999999999999 20261122000000 | tail -1
psql -q -At -v ON_ERROR_STOP=1 -d $DB -f "$ROOT/tests/88_faixas_simuladas.sql" > /tmp/suite_88_faixas_simuladas.log 2>&1 || { echo "ERRO em 88_faixas_simuladas:"; grep -n "ERROR" -A3 /tmp/suite_88_faixas_simuladas.log | head -8; }
"$ROOT/tests/90_base_limpa_e_reversao.sh" > /tmp/suite_90.log 2>&1 || echo "ERRO em 90"
grep -v "^migrações\|^$" /tmp/suite_90.log
psql -q -At -F ' | ' -d $DB -c "select rpad(suite, 40), 'ok=' || count(*) filter (where ok), 'falhas=' || count(*) filter (where not ok) from (select suite, ok from t.results union all select 'x', true where false) r group by suite order by suite"
psql -q -At -d $DB -c "select 'FALHA: ' || suite || ' | ' || name || ' | ' || coalesce(detail, '') from t.results where not ok"
psql -q -At -d $DB -c "select 'TOTAL: ' || count(*) || ' verificações, ' || count(*) filter (where not ok) || ' falhas' from t.results"
