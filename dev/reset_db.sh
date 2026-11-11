#!/usr/bin/env bash
# Recria uma base limpa: emulação do Supabase + baseline do aplicativo. Uso: dev/reset_db.sh <nome_da_base>
set -euo pipefail
DB="${1:-gaxeta_dev}"; export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
psql -qAt -d postgres -c "drop database if exists $DB with (force)" -c "create database $DB template template0"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$ROOT/dev/00_supabase_shim.sql"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$ROOT/supabase/baseline/20261111000000_baseline_app.sql"
echo "base $DB pronta (shim + baseline)"
