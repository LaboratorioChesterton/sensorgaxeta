#!/usr/bin/env bash
# Operações concorrentes reais (sessões paralelas) sobre a base de desenvolvimento.
set -uo pipefail
DB="${1:-gaxeta_dev}"; export PGHOST="${PGHOST:-/tmp}" PGPORT="${PGPORT:-54329}" PGUSER="${PGUSER:-postgres}"
q() { psql -q -At -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
q -c "select set_config('t.suite','50 concorrência',false)" >/dev/null
as() { # as <chave do usuário> <sql> : executa numa transação com o papel authenticated
  psql -q -At -d "$DB" -c "begin; select t.login(t.id('$1')); $2; commit;" 2>&1 | tr "\n" " "; }
log() { q -c "select set_config('t.suite','50 concorrência',false); select t.log($1, \$\$$2\$\$, \$\$${3:-}\$\$)" | tail -1; }

# 1) Duas pessoas ocupando o MESMO spot com sensores diferentes: só uma vence.
q -c "select set_config('request.jwt.claims','',false)" >/dev/null
as adm1 "select public.gaxeta_unlink_sensor('ESP32-A00000000003','prep')" >/dev/null
SPOT=$(q -c "select t.id('A1_tq200_s2')")
( as adm1 "select public.gaxeta_link_sensor('ESP32-A00000000003','$SPOT','corrida'); select pg_sleep(1.5)" > /tmp/c1a.txt ) &
sleep 0.3
( as adm2 "select public.gaxeta_link_sensor('ESP32-PILOTO000001','$SPOT','corrida')" > /tmp/c1b.txt ) &
wait
N=$(q -c "select count(*) from public.gaxeta_devices where measurement_point_id='$SPOT'")
E=$(grep -c "duplicate key" /tmp/c1b.txt)
log "$N = 1 and $E = 1" "mesmo spot, dois sensores em paralelo: um vínculo vence, o outro recebe conflito" "vinculados=$N conflito=$E"

# 2) Duas pessoas vinculando o MESMO sensor a spots diferentes: serializa, sobra um vínculo aberto.
S1=$(q -c "select t.id('A1_tq201_s1')"); S2=$(q -c "select t.id('A2_b101_s1')")
as adm1 "select public.gaxeta_link_sensor('ESP32-A00000000002','$S1','prep')" >/dev/null
( as adm1 "select public.gaxeta_link_sensor('ESP32-PILOTO000001','$S2','corrida A'); select pg_sleep(1.2)" >/tmp/c2a.txt ) &
sleep 0.3
( as adm2 "select public.gaxeta_link_sensor('ESP32-PILOTO000001','$(q -c "select t.id('A1_tq200_s1')")','corrida B')" >/tmp/c2b.txt ) &
wait
O=$(q -c "select count(*) from gaxeta_private.device_links where sensor_id='ESP32-PILOTO000001' and unlinked_at is null")
C=$(q -c "select (select measurement_point_id from public.gaxeta_devices where sensor_id='ESP32-PILOTO000001') = (select point_id from gaxeta_private.device_links where sensor_id='ESP32-PILOTO000001' and unlinked_at is null)")
log "$O = 1 and '$C' = 't'" "mesmo sensor, dois spots em paralelo: um único vínculo aberto, coerente com o dispositivo" "abertos=$O coerente=$C"

# 3) Movimentações e criações concorrentes na mesma corporação (4 sessões x 40 operações pela RPC).
q -c "create or replace function t.stress(p_n int, p_seed float8) returns text language plpgsql as \$f\$
declare i int; v_err int := 0; v_ok int := 0; x record; np uuid;
begin
  perform setseed(p_seed);
  for i in 1..p_n loop
    begin
      if random() < 0.25 then
        select id into np from public.gaxeta_assets where corporation_id = t.id('corpA') and kind = 'equipment' order by random() limit 1;
        perform public.gaxeta_save_asset(null, np, 'point', case when i % 2 = 0 then 'LOA' else 'LA' end, '', '');
      else
        select id, kind, name, tag, position into x from public.gaxeta_assets where corporation_id = t.id('corpA') and kind in ('equipment','subarea','area') order by random() limit 1;
        select id into np from public.gaxeta_assets where corporation_id = t.id('corpA')
           and kind = any (case x.kind when 'equipment' then array['area','subarea'] when 'subarea' then array['area'] else array['company'] end) order by random() limit 1;
        perform public.gaxeta_save_asset(x.id, np, x.kind, x.name, x.tag, x.position);
      end if;
      v_ok := v_ok + 1;
    exception when others then v_err := v_err + 1; end;
    perform pg_sleep(0.005);
  end loop;
  return v_ok || ' ok, ' || v_err || ' recusadas';
end \$f\$; grant execute on function t.stress(int,float8) to public" >/dev/null
for k in 1 2 3 4; do ( psql -q -At -d "$DB" -c "select set_config('request.jwt.claims', json_build_object('sub', t.id('adm1'))::text, false); set role authenticated; select t.stress(40, 0.$k)" > /tmp/c3_$k.txt 2>&1 ) & done; wait
R=$(cat /tmp/c3_*.txt | grep -v '^$' | grep 'ok' | paste -sd';')
BAD=$(q -c "with recursive r as (select id, array[id] p from public.gaxeta_assets where parent_id is null union all select a.id, r.p || a.id from public.gaxeta_assets a join r on a.parent_id = r.id)
            select count(*) from public.gaxeta_assets a left join r using (id) where r.p is distinct from a.path or a.corporation_id <> a.path[1]")
ORPH=$(q -c "select count(*) from public.gaxeta_assets a where kind <> 'corporation' and not exists (select 1 from public.gaxeta_assets p where p.id = a.parent_id
              and case a.kind when 'company' then p.kind = 'corporation' when 'area' then p.kind = 'company' when 'subarea' then p.kind = 'area' when 'equipment' then p.kind in ('area','subarea') when 'point' then p.kind = 'equipment' end)")
log "$BAD = 0 and $ORPH = 0" "160 escritas estruturais concorrentes: caminhos iguais ao recálculo recursivo, sem ciclo, órfão ou pai inválido" "divergentes=$BAD invalidos=$ORPH | $R"
GW=$(q -c "select count(*) from public.gaxeta_devices d join public.gaxeta_assets pt on pt.id = d.measurement_point_id join public.gaxeta_gateways g on g.id = d.gateway_id where not (pt.path @> array[g.company_id])")
log "$GW = 0" "após as movimentações, nenhum sensor ficou com gateway de outra empresa" "inconsistentes=$GW"

# 4) Dois níveis 1 desativando um ao outro ao mesmo tempo: nunca ficam zero.
( as adm1 "select public.gaxeta_admin_set_status(t.id('adm1b'),'disabled'); select pg_sleep(1)" >/tmp/c4a.txt ) &
sleep 0.2
( as adm1b "select public.gaxeta_admin_set_status(t.id('adm1'),'disabled')" >/tmp/c4b.txt ) &
wait
A=$(q -c "select count(*) from gaxeta_private.user_profiles where global_role='adm1' and status='active'")
log "$A >= 1" "dois níveis 1 se desativando em paralelo: sempre resta um ativo" "ativos=$A"
q -c "update gaxeta_private.user_profiles set status='active' where global_role='adm1'" >/dev/null
q -c "select name, detail from t.results where suite='50 concorrência' and not ok; select '50 concorrência', count(*) filter (where ok), count(*) filter (where not ok) from t.results where suite='50 concorrência'"
