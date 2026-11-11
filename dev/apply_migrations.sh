#!/usr/bin/env bash
# Aplica as migrações em ordem na base indicada. Uso: dev/apply_migrations.sh <base> [até_versão] [a_partir_da_versão]
set -euo pipefail
DB="${1:-gaxeta_dev}"; UPTO="${2:-99999999999999}"; FROM="${3:-0}"
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for f in "$ROOT"/supabase/migrations/*.sql; do
  v="$(basename "$f" | cut -d_ -f1)"; [ "$v" -le "$UPTO" ] && [ "$v" -ge "$FROM" ] || continue
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" 2>&1 | sed "s|^|[$(basename "$f" .sql | cut -c1-22)] |"
done
echo "migrações aplicadas em $DB"
