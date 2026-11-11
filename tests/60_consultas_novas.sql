\set ON_ERROR_STOP 1
select set_config('t.suite', '60 consultas paginadas e histórico', false);
begin; select t.login(t.id('uA_tag'));
select t.eq((select string_agg(e ->> 'name' || ':' || (e ->> 'access'), ',') from jsonb_array_elements(public.gaxeta_assets_children(null) -> 'items') e), 'Corporação Alfa:path', 'árvore sob demanda: raiz aparece só como caminho');
select t.eq((select string_agg(e ->> 'name' || ':' || (e ->> 'access'), ',') from jsonb_array_elements(public.gaxeta_assets_children(t.id('corpA')) -> 'items') e), 'Alfa Unidade 2:path', 'filhos da corporação: só a empresa do caminho, sem irmãs nem totais delas');
select t.eq((public.gaxeta_assets_children(t.id('corpA')) ->> 'total')::int, 1, 'total de filhos conta só o visível');
select t.eq((select string_agg(e ->> 'name' || ':' || (e ->> 'access'), ',') from jsonb_array_elements(public.gaxeta_assets_children(t.id('A2_util')) -> 'items') e), 'Bomba 101:full', 'TAG concedido aparece com acesso');
select t.eq(jsonb_array_length(public.gaxeta_assets_search('Bomba')), 1, 'busca por nome: só o TAG do escopo (homônimos de outra empresa e corporação ficam fora)');
select t.eq(jsonb_array_length(public.gaxeta_assets_search('B-101')), 1, 'busca por TAG respeita o escopo');
select t.eq((public.gaxeta_devices_page() ->> 'total')::int, 1, 'sensores paginados: 1 no escopo');
select t.eq((public.gaxeta_devices_page(null, null, true) ->> 'total')::int, 0, 'fila sem vínculo: invisível ao usuário de corporação');
select t.eq((public.gaxeta_devices_page(null, 'ESP32-B0') ->> 'total')::int, 0, 'busca por identificador de sensor de outra corporação: nada');
select t.eq(jsonb_array_length(public.gaxeta_devices_status(array['ESP32-A00000000003', 'ESP32-B00000000001', 'ESP32-PILOTO000001']) -> 'devices'), 1, 'estado por IDs conhecidos: só o sensor do escopo');
commit;
begin; select t.login(t.id('adm3'));
select t.eq(jsonb_array_length(public.gaxeta_assets_search('Bomba')), 5, 'adm3 busca em todas as empresas (3 TAGs homônimos e 2 subáreas)');
select t.eq((public.gaxeta_devices_page(null, null, true) ->> 'total')::int, 2, 'fila de associação visível aos administradores');
select t.eq((public.gaxeta_devices_page(t.id('corpB')) ->> 'total')::int, 1, 'sensores por ramo');
select t.eq(jsonb_array_length(public.gaxeta_assets_children(null, 1, 1) -> 'items'), 1, 'paginação de raízes');
select t.throws($$select public.gaxeta_history('ESP32-A00000000003', now() - interval '400 days', now())$$, 'entre 1 segundo e 366 dias', 'limite de 366 dias preservado');
select t.throws($$select public.gaxeta_history('ESP32-A00000000003', now(), now())$$, 'entre 1 segundo e 366 dias', 'limite mínimo de 1 segundo preservado');
select t.eq((public.gaxeta_history('VALIDACAO-INTEGRACAO', now() - interval '30 days', now()) -> 'stats' ->> 'count'), '0', 'dispositivo de validação segue fora do histórico, como hoje');
commit;
-- A RPC de histórico e a leitura direta sob RLS devolvem o mesmo conjunto, por conta e sensor.
create or replace function t.rpc_vs_rls(p_user uuid) returns text language plpgsql as $$
declare r record; v_bad text := '';
begin
  perform t.login(p_user);
  for r in select sensor_id from unnest(array['ESP32-AAAA00000001', 'ESP32-A00000000002', 'ESP32-A00000000003', 'ESP32-B00000000001', 'ESP32-PILOTO000001', 'VALIDACAO-INTEGRACAO']) sensor_id loop
    if (public.gaxeta_history(r.sensor_id, now() - interval '30 days', now() + interval '1 day') -> 'stats' ->> 'count')::bigint
       <> (select count(*) from public.gaxeta_readings where sensor_id = r.sensor_id and received_at between now() - interval '30 days' and now() + interval '1 day')
       or jsonb_array_length(public.gaxeta_history(r.sensor_id, now() - interval '30 days', now() + interval '1 day') -> 'movements')
       <> (select count(*) from public.gaxeta_movements where sensor_id = r.sensor_id and received_at between now() - interval '30 days' and now() + interval '1 day') then
      v_bad := v_bad || r.sensor_id || ' ';
    end if;
  end loop;
  perform set_config('role', 'postgres', true);
  return v_bad;
end $$;
select t.eq(t.rpc_vs_rls(t.id(k)), '', 'histórico por RPC = leitura direta sob RLS (' || k || ')') from unnest(array['adm1', 'adm3', 'uA_all', 'uA_tag', 'uA_sel', 'uA_campo', 'uB_all', 'convidado']) k;
select name, detail from t.results where suite = current_setting('t.suite') and not ok;
select current_setting('t.suite') as suite, count(*) filter (where ok) as ok, count(*) filter (where not ok) as falhas from t.results where suite = current_setting('t.suite');
