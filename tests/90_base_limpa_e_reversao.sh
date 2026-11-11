#!/usr/bin/env bash
# (1) Base limpa: baseline + migrações, sem nenhum dado. (2) Reversão completa em ordem
# inversa devolve o catálogo do aplicativo exatamente ao da baseline. (3) Reversão só do
# corte (05) com usuários de corporação cadastrados não reabre leitura entre corporações.
set -euo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FP="$(grep -v '^--' "$ROOT/dev/catalog_fingerprint.sql")"
fp() { psql -q -At -d "$1" -c "select k || ' ' || h from ($FP) f order by k collate \"C\""; }
"$ROOT/dev/reset_db.sh" gaxeta_base >/dev/null 2>&1; fp gaxeta_base > /tmp/fp_base.txt
"$ROOT/dev/reset_db.sh" gaxeta_clean >/dev/null 2>&1
# Em base limpa não há contas: cria-se um nível 1 sintético para o corte poder ocorrer.
psql -q -d gaxeta_clean -c "insert into auth.users (id, email, encrypted_password, email_confirmed_at) values ('00000000-0000-4000-a000-000000000001', 'admin.um@dev.test', 'x', now()); insert into gaxeta_private.platform_members (email) values ('admin.um@dev.test')"
"$ROOT/dev/apply_migrations.sh" gaxeta_clean | tail -1
fp gaxeta_clean > /tmp/fp_migrated.txt
echo "itens de catálogo: baseline=$(wc -l < /tmp/fp_base.txt) | após migrações=$(wc -l < /tmp/fp_migrated.txt) (public + gaxeta_private)"
echo "objetos da baseline alterados pelas migrações:"; awk 'NR==FNR{h=$NF; $NF=""; a[$0]=h; next} {h=$NF; $NF=""; if (($0 in a) && a[$0]!=h) print "  " $0}' /tmp/fp_base.txt /tmp/fp_migrated.txt | cut -c1-120
echo "objetos da baseline removidos pelas migrações: $(awk 'NR==FNR{h=$NF; $NF=""; a[$0]=1; next} {$NF=""; delete a[$0]} END{n=0; for (k in a) {n++; print "  " k > "/dev/stderr"}; print n}' /tmp/fp_base.txt /tmp/fp_migrated.txt 2>&1 | tr '\n' ' ')"
for f in $(ls -r "$ROOT"/supabase/rollback/*.down.sql); do psql -q -v ON_ERROR_STOP=1 -d gaxeta_clean -f "$f"; done
fp gaxeta_clean > /tmp/fp_rolled.txt
if diff -q /tmp/fp_base.txt /tmp/fp_rolled.txt >/dev/null; then echo "REVERSÃO COMPLETA: catálogo idêntico ao da baseline ($(wc -l < /tmp/fp_rolled.txt) itens)"; else echo "REVERSÃO: DIFERENÇAS"; diff /tmp/fp_base.txt /tmp/fp_rolled.txt | head; exit 1; fi
echo "schemas restantes além da baseline: $(psql -q -At -d gaxeta_clean -c "select coalesce(string_agg(nspname, ','), 'nenhum') from pg_namespace where nspname like 'gaxeta_%' and nspname <> 'gaxeta_private'")"

# (3) Reversão apenas do corte, com tenants e usuários de corporação já cadastrados.
if psql -q -At -d postgres -c "select 1 from pg_database where datname='gaxeta_dev'" | grep -q 1; then
  psql -q -At -d postgres -c "drop database if exists gaxeta_rb with (force)" -c "create database gaxeta_rb template gaxeta_dev" 2>/dev/null
  psql -q -v ON_ERROR_STOP=1 -d gaxeta_rb -f "$ROOT/supabase/rollback/20261111175658_telemetria_consultas.down.sql" -f "$ROOT/supabase/rollback/20261111175624_corte_acesso.down.sql"
  psql -q -At -d gaxeta_rb -c "select set_config('t.suite','90 reversão do corte',false);
    select t.ok(t.view_of(t.id('uA_all')) like 'false ativos=0 gateways=0 sensores=0 leituras=0 %', 'após reverter o corte, usuário de corporação fica sem acesso (não vê outra corporação)');
    select t.ok(t.view_of(t.id('uB_all')) like 'false ativos=0 %', 'idem para a outra corporação');
    select t.ok(t.view_of(t.id('adm2')) like 'false ativos=0 %', 'adm2/adm3 (fora da lista do piloto) ficam sem acesso');
    select t.ok(t.view_of(t.id('adm1')) like 'true ativos=% sensores=6 %', 'contas administrativas do piloto seguem com a visão anterior');
    select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'public.gaxeta_ingest(text,jsonb)'::regprocedure), '86e3e54a185017b0b3d70c5cf95de619', 'ingestão intocada após a reversão');"
  psql -q -d postgres -c "drop database gaxeta_rb with (force)"
fi
