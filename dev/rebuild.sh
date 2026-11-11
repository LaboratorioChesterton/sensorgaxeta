#!/usr/bin/env bash
# Base de desenvolvimento do zero: shim + baseline + fixture legada + migrações. Uso: dev/rebuild.sh [base]
set -euo pipefail
DB="${1:-gaxeta_dev}"; export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT/dev/reset_db.sh" "$DB" >/dev/null 2>&1
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$ROOT/tests/00_helpers.sql"
psql -q -At -v ON_ERROR_STOP=1 -d "$DB" -f "$ROOT/tests/10_legacy_fixture.sql" >/dev/null
"$ROOT/dev/apply_migrations.sh" "$DB" | tail -1
