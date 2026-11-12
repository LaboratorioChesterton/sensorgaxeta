#!/usr/bin/env bash
# Volume representativo: 10.000 corporações, 230 mil ativos, 120 mil sensores vinculados.
# Mede as consultas por ramo (novas) e as do pacote publicado (árvore inteira e snapshot).
set -euo pipefail
export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; DB=gaxeta_vol; N="${1:-10000}"
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
"$ROOT/dev/reset_db.sh" $DB >/dev/null 2>&1; q -f "$ROOT/tests/00_helpers.sql"
q -c "insert into auth.users (id, email, encrypted_password, email_confirmed_at) values ('00000000-0000-4000-a000-000000000001', 'admin.um@dev.test', 'x', now()), ('00000000-0000-4000-a000-0000000000a1', 'corp.todos@dev.test', 'x', now()), ('00000000-0000-4000-a000-0000000000a2', 'corp.tag@dev.test', 'x', now()); insert into gaxeta_private.platform_members (email) values ('admin.um@dev.test')"
"$ROOT/dev/apply_migrations.sh" $DB | tail -1
T0=$(date +%s)
q <<SQL >/dev/null
alter table public.gaxeta_assets disable trigger gaxeta_asset_audit;
-- Carga em lotes de 500 corporações por transação: a escrita estrutural toma um bloqueio
-- por corporação, então uma única transação não deve atravessar milhares delas.
do \$\$
declare lo int := 1; step int := 500;
begin
  while lo <= $N loop
    create temp table c on commit drop as
      with ins as (insert into public.gaxeta_assets (kind, name) select 'corporation', 'Corp ' || lpad(g::text, 5, '0') from generate_series(lo, least(lo + step - 1, $N)) g returning id)
      select id from ins;
    insert into public.gaxeta_assets (parent_id, kind, name) select id, 'company', 'Unidade 1' from c;
    insert into public.gaxeta_assets (parent_id, kind, name) select a.id, 'area', 'Área ' || n from public.gaxeta_assets a, generate_series(1, 2) n where a.kind = 'company' and a.corporation_id in (select id from c);
    insert into public.gaxeta_assets (parent_id, kind, name) select a.id, 'subarea', 'Subárea 1' from public.gaxeta_assets a where a.kind = 'area' and a.name = 'Área 1' and a.corporation_id in (select id from c);
    insert into public.gaxeta_assets (parent_id, kind, name, tag) select a.id, 'equipment', 'Bomba ' || n, 'B-10' || n from public.gaxeta_assets a, generate_series(1, 3) n
      where a.corporation_id in (select id from c) and (a.kind = 'subarea' or (a.kind = 'area' and a.name = 'Área 2'));
    insert into public.gaxeta_assets (parent_id, kind, name, "position") select a.id, 'point', case n when 1 then 'LA' else 'LOA' end, case n when 1 then 'LA' else 'LOA' end from public.gaxeta_assets a, generate_series(1, 2) n
      where a.kind = 'equipment' and a.corporation_id in (select id from c);
    commit;
    lo := lo + step;
  end loop;
end \$\$;
alter table public.gaxeta_assets enable trigger gaxeta_asset_audit;
insert into public.gaxeta_devices (sensor_id, origin, label, measurement_point_id, last_received_at, last_percent, stable_percent)
  select 'ESP32-V' || lpad(row_number() over (order by path)::text, 9, '0'), 'esp32', 'S-' || row_number() over (order by path), id, now(), 50, 50 from public.gaxeta_assets where kind = 'point';
insert into gaxeta_private.device_links (sensor_id, point_id) select sensor_id, measurement_point_id from public.gaxeta_devices;
analyze;
begin; select t.login('00000000-0000-4000-a000-000000000001');
select public.gaxeta_admin_invite_user('corp.todos@dev.test', 'Corp Todos', null, (select id from public.gaxeta_assets where name = 'Corp 05000'), false,
  jsonb_build_array(jsonb_build_object('asset_id', (select id from public.gaxeta_assets where name = 'Corp 05000'), 'mode', 'all')));
select public.gaxeta_admin_invite_user('corp.tag@dev.test', 'Corp TAG', null, (select id from public.gaxeta_assets where name = 'Corp 07000'), false,
  jsonb_build_array(jsonb_build_object('asset_id', (select e.id from public.gaxeta_assets e where e.kind = 'equipment' and e.corporation_id = (select id from public.gaxeta_assets where name = 'Corp 07000') order by e.path limit 1), 'mode', 'all')));
commit;
create or replace function t.time_call(p_user uuid, p_sql text) returns text language plpgsql as \$\$
declare t0 timestamptz; v bigint;
begin
  perform t.login(p_user); execute p_sql; t0 := clock_timestamp(); execute p_sql;
  perform set_config('role', 'postgres', true);
  return lpad(round(extract(epoch from clock_timestamp() - t0) * 1000, 1)::text, 9) || ' ms';
end \$\$;
SQL
echo "carga sintética: $(( $(date +%s) - T0 )) s | ativos=$(q -c "select count(*) from public.gaxeta_assets") | sensores=$(q -c "select count(*) from public.gaxeta_devices") | corporações=$N"
A=00000000-0000-4000-a000-000000000001; C=00000000-0000-4000-a000-0000000000a1; G=00000000-0000-4000-a000-0000000000a2
m() { printf "%-78s %s\n" "$1" "$(q -c "set statement_timeout='8s'; select t.time_call('$2', \$\$$3\$\$)" 2>&1 | tail -1 | cut -c1-60)"; }
CORP="(select id from public.gaxeta_assets where name = 'Corp 05000')"
{
echo "# Consultas com 10.000 corporações (PostgreSQL local 16.15, 2 vCPU; limite da API 8 s)"
echo "## Usuário de corporação com Todos na corporação (23 ativos, 12 sensores)"
m "árvore inteira como o pacote publicado lê (select * order by name)"     $C "select * from public.gaxeta_assets order by name"
m "gaxeta_snapshot(null, 5) como o pacote publicado chama"                 $C "select public.gaxeta_snapshot(null, 5)"
m "gaxeta_assets_children(raiz)"                                           $C "select public.gaxeta_assets_children(null)"
m "gaxeta_assets_search('Bomba 2')"                                        $C "select public.gaxeta_assets_search('Bomba 2')"
m "gaxeta_devices_page()"                                                  $C "select public.gaxeta_devices_page()"
m "gaxeta_devices_status()"                                                $C "select public.gaxeta_devices_status()"
echo "## Usuário de corporação com um único TAG (2 spots, 2 sensores)"
m "árvore inteira como o pacote publicado lê"                              $G "select * from public.gaxeta_assets order by name"
m "gaxeta_snapshot(null, 5)"                                               $G "select public.gaxeta_snapshot(null, 5)"
echo "## Administrador global"
m "gaxeta_assets_children(raiz, 100 por página)"                           $A "select public.gaxeta_assets_children(null, 100, 0)"
m "gaxeta_assets_children(raiz, página 50)"                                $A "select public.gaxeta_assets_children(null, 100, 5000)"
m "gaxeta_assets_children(uma corporação)"                                 $A "select public.gaxeta_assets_children($CORP)"
m "gaxeta_assets_search('Corp 0500')"                                      $A "select public.gaxeta_assets_search('Corp 0500')"
m "gaxeta_assets_search('B-102') (30 mil ocorrências, 50 devolvidas)"      $A "select public.gaxeta_assets_search('B-102')"
m "gaxeta_devices_page(uma corporação)"                                    $A "select public.gaxeta_devices_page($CORP)"
m "gaxeta_devices_page(busca 'ESP32-V00006')"                              $A "select public.gaxeta_devices_page(null, 'ESP32-V00006')"
m "gaxeta_devices_status(12 IDs)"                                          $A "select public.gaxeta_devices_status(array(select sensor_id from public.gaxeta_devices order by sensor_id limit 12))"
m "gaxeta_admin_users()"                                                   $A "select public.gaxeta_admin_users()"
m "LEGADO: árvore inteira (230 mil linhas para o navegador)"               $A "select * from public.gaxeta_assets order by name"
m "LEGADO: gaxeta_snapshot(null, 5) (120 mil sensores num JSON)"           $A "select public.gaxeta_snapshot(null, 5)"
} | tee "$ROOT/evidencias/volume_10k_corporacoes.txt"
