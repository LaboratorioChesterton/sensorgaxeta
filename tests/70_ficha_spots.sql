\set ON_ERROR_STOP 1
-- Migração 07: ficha técnica do TAG, nomes de Spot, resumo do TAG e busca por TAG.
-- Roda depois das suítes 30, 40 e 60 (usa a árvore e os usuários sintéticos delas).
select set_config('t.suite', '70 ficha de equipamento e spots', false);

begin; select t.login(t.id('adm1'));
select t.eq((select count(*) from public.gaxeta_equipment_types), 14::bigint, 'catálogo inicial com 14 tipos');
select t.throws($$select public.gaxeta_save_equipment(null, t.id('A1_cald'), '  ', '{"equipment_type":"refinador"}')$$, 'Informe o TAG', 'TAG obrigatório');
select t.throws($$select public.gaxeta_save_equipment(null, t.id('A1_cald'), 'RF-01', '{}')$$, 'Selecione o tipo', 'tipo obrigatório no cadastro novo');
select t.throws($$select public.gaxeta_save_equipment(null, t.id('A1_cald'), 'RF-01', '{"equipment_type":"foguete"}')$$, 'desconhecido', 'tipo fora do catálogo é recusado');
select t.throws($$select public.gaxeta_save_equipment(null, t.id('A1'), 'RF-01', '{"equipment_type":"refinador"}')$$, 'incompatível', 'TAG sob empresa é recusado no servidor');
select t.throws($$select public.gaxeta_save_equipment(null, t.id('A1_cald'), 'RF-01', '{"equipment_type":"refinador","ring_count":"-2"}')$$, 'inteiro', 'quantidade negativa é recusada');
select t.eq((select count(*) from public.gaxeta_assets where tag = 'RF-01'), 0::bigint, 'falha na ficha não deixa o TAG gravado (operação atômica)');

select t.put('rf01', public.gaxeta_save_equipment(null, t.id('A1_cald'), ' RF-01 ', '{"equipment_type":"refinador","fluid":"Polpa","shaft_size":"120 mm","ring_count":5,"gland_bolt_count":"4","assembly_rule":"  "}') ->> 'id');
select t.eq((select name || '|' || tag from public.gaxeta_assets where id = t.id('rf01')), 'RF-01|RF-01', 'TAG novo: valor canônico em tag e em name (clientes anteriores)');
select t.eq((select equipment_type || '|' || fluid || '|' || shaft_size || '|' || ring_count || '|' || gland_bolt_count || '|' || coalesce(assembly_rule, 'NULL')
               from public.gaxeta_equipment_details where asset_id = t.id('rf01')), 'refinador|Polpa|120 mm|5|4|NULL', 'ficha persistida; campo vazio é ausência');
select t.eq(public.gaxeta_save_equipment(t.id('rf01'), null, 'RF-01A', '{"equipment_type":"refinador","fluid":"Polpa","model":"X"}') ->> 'tag', 'RF-01A', 'edição do TAG');
select t.eq((select name from public.gaxeta_assets where id = t.id('rf01')), 'RF-01A', 'nome acompanha o TAG quando não havia nome distinto');
select t.eq((select coalesce(shaft_size, 'NULL') || '|' || model from public.gaxeta_equipment_details where asset_id = t.id('rf01')), 'NULL|X', 'edição grava a ficha enviada (campo limpo vira ausência)');
select t.throws($$select public.gaxeta_save_equipment(t.id('rf01'), null, 'RF-01A', '{}')$$, 'Selecione o tipo', 'tipo já informado não volta a ficar vazio');
select t.eq(public.gaxeta_save_equipment(t.id('A1_tq200'), null, 'TQ-200', '{"manufacturer":"ACME"}') ->> 'name', 'Tanque 200', 'legado com nome distinto: nome preservado, ficha gravada sem tipo');
select t.eq(public.gaxeta_equipment_overview(t.id('A1_tq200')) -> 'details' ->> 'equipment_type', null, 'legado sem tipo continua sem tipo');
select t.throws($$select public.gaxeta_save_equipment(t.id('A1_cald'), null, 'X', '{"equipment_type":"refinador"}')$$, 'não encontrado', 'só TAG (equipamento) tem ficha');
select t.throws($$insert into public.gaxeta_equipment_details (asset_id) values (t.id('rf01'))$$, '42501', 'escrita direta na ficha: sem privilégio');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'equipment.', t.id('rf01')::text, null)) >= 1, 'alteração da ficha fica na auditoria');

-- Spots: LOA, LA ou UNICO
select t.throws($$select public.gaxeta_save_asset(null, t.id('rf01'), 'point', 'Mancal', '', '')$$, 'LOA, LA ou UNICO', 'spot novo com nome livre é recusado (também pelo contrato antigo)');
select t.put('rf01_u', public.gaxeta_save_asset(null, t.id('rf01'), 'point', ' único ', '', 'lado do acionamento') ->> 'id');
select t.eq((select name from public.gaxeta_assets where id = t.id('rf01_u')), 'UNICO', 'equivalência inequívoca é normalizada');
select t.put('rf01_loa', public.gaxeta_save_asset(null, t.id('rf01'), 'point', 'loa', '', '') ->> 'id');
select t.put('rf01_loa2', public.gaxeta_save_asset(null, t.id('rf01'), 'point', 'LOA', '', 'segunda caixa') ->> 'id');
select t.ok(t.id('rf01_loa2') is not null, 'nome padronizado não impõe unicidade nem teto de spots');
select t.eq(public.gaxeta_save_asset(t.id('A1_b101_la'), t.id('A1_b101'), 'point', 'Lado acionado', '', 'nova posição') ->> 'position', 'nova posição', 'spot legado: posição editável sem trocar o nome');
select t.throws($$select public.gaxeta_save_asset(t.id('A1_b101_la'), t.id('A1_b101'), 'point', 'Outro livre', '', '')$$, 'LOA, LA ou UNICO', 'spot legado: troca de nome exige uma das três opções');
select t.eq((select name from public.gaxeta_assets where id = t.id('A1_b101_la')), 'Lado acionado', 'nome legado preservado após a recusa');

-- Resumo do TAG e busca por TAG
select coalesce((select sensor_id from public.gaxeta_devices where origin = 'esp32' and measurement_point_id is null order by sensor_id limit 1), '') as s70 \gset
select t.ok(:'s70' <> '', 'há sensor na fila de associação para o teste');
select t.eq(public.gaxeta_link_sensor(:'s70', t.id('rf01_u'), 'teste 70') ->> 'measurement_point_id', t.id('rf01_u')::text, 'sensor da fila vinculado ao spot');
select t.eq((o ->> 'spot_count') || '/' || (o ->> 'sensor_count') || '/' || (o -> 'spots' -> 0 ->> 'name') || '/' || (o -> 'spots' -> 2 ->> 'name') || '/' || (o -> 'spots' -> 2 -> 'sensor' ->> 'sensor_id')
            || '/' || (o -> 'details' ->> 'equipment_type_label') || '/' || (o -> 'asset' ->> 'access'),
            '3/1/LOA/UNICO/' || :'s70' || '/Refinador/full', 'resumo do TAG: spots, sensores e tipo numa chamada')
  from (select public.gaxeta_equipment_overview(t.id('rf01')) o) q;
select t.eq((public.gaxeta_devices_page(null, 'rf-01a') ->> 'total')::int, 1, 'busca de sensores encontra pelo TAG do equipamento');
select t.eq((public.gaxeta_devices_page(null, :'s70') ->> 'total')::int, 1, 'busca por identificador do sensor continua valendo');
commit;

begin; select t.login(t.id('uA_campo'));
select t.eq(public.gaxeta_save_equipment(t.id('rf01'), null, 'RF-01A', '{"equipment_type":"refinador","density":"1,02 g/cm3"}') -> 'details' ->> 'density', '1,02 g/cm3', 'operador com edição grava a ficha no ramo concedido');
select t.throws($$select public.gaxeta_save_equipment(t.id('A2_b101'), null, 'B-101', '{}')$$, '42501', 'operador: ficha fora do ramo é negada');
commit;

begin; select t.login(t.id('uA_tag'));
select t.throws($$select public.gaxeta_save_equipment(t.id('A2_b101'), null, 'B-101', '{}')$$, '42501', 'sem edição: gravação da ficha é negada');
select t.eq(t.n($$select 1 from public.gaxeta_equipment_details$$), 0::bigint, 'fichas de outros ramos são invisíveis');
select t.throws($$select public.gaxeta_equipment_overview(t.id('rf01'))$$, 'não encontrado', 'resumo de TAG fora do escopo: não encontrado');
commit;

-- TAG visível só como caminho (concessão num único spot): sem ficha, só o spot concedido.
begin; select t.login(t.id('adm1'));
select public.gaxeta_admin_set_access(t.id('uA_tag'), null, jsonb_build_array(jsonb_build_object('asset_id', t.id('rf01_u'), 'mode', 'all'))) ->> 'user_id';
commit;
begin; select t.login(t.id('uA_tag'));
select t.eq((o -> 'asset' ->> 'access') || '/' || coalesce(o ->> 'details', 'NULL') || '/' || (o ->> 'spot_count') || '/' || (o ->> 'sensor_count'), 'path/NULL/1/1',
            'TAG só como caminho: sem ficha; contagem só do spot concedido')
  from (select public.gaxeta_equipment_overview(t.id('rf01')) o) q;
commit;
begin; select t.login(t.id('adm1'));
select public.gaxeta_admin_set_access(t.id('uA_tag'), null, jsonb_build_array(jsonb_build_object('asset_id', t.id('A2_b101'), 'mode', 'all'))) ->> 'user_id';
commit;

begin; select t.anon();
select t.throws($$select 1 from public.gaxeta_equipment_types$$, '42501', 'anônimo: catálogo sem privilégio');
select t.throws($$select public.gaxeta_equipment_overview(t.id('rf01'))$$, '42501', 'anônimo: resumo do TAG sem privilégio');
commit;

select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'public.gaxeta_ingest(text,jsonb)'::regprocedure), '86e3e54a185017b0b3d70c5cf95de619', 'ingestão intocada pela migração 07');
