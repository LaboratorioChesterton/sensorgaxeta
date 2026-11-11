\set ON_ERROR_STOP 1
select set_config('t.suite', '40 matriz de acesso e escopo', false);
-- Resumo do que cada conta enxerga pelas mesmas chamadas que o pacote publicado faz:
-- gaxeta_has_access, SELECT em ativos e gateways, gaxeta_snapshot e gaxeta_history.
create or replace function t.view_of(p_user uuid) returns text language plpgsql as $$
declare v text;
begin
  perform t.login(p_user);
  select public.gaxeta_has_access()::text || ' ativos=' || (select count(*) from public.gaxeta_assets)
      || ' gateways=' || (select count(*) from public.gaxeta_gateways)
      || ' sensores=' || jsonb_array_length(public.gaxeta_snapshot(null, 5) -> 'devices')
      || ' leituras=' || (select count(*) from public.gaxeta_readings)
      || ' movimentos=' || (select count(*) from public.gaxeta_movements) into v;
  perform set_config('role', 'postgres', true);
  return v;
end $$;
create or replace function t.hist_count(p_user uuid, p_sensor text) returns text language plpgsql as $$
declare j jsonb;
begin
  perform t.login(p_user);
  j := public.gaxeta_history(p_sensor, now() - interval '30 days', now() + interval '1 day');
  perform set_config('role', 'postgres', true);
  return (j -> 'stats' ->> 'count') || '/' || jsonb_array_length(j -> 'movements') || '/' || coalesce(j ->> 'seed', 'null');
end $$;

begin;
select t.eq((select count(*) from public.gaxeta_readings r join public.gaxeta_devices d using (sensor_id) where d.origin = 'esp32'), 1512::bigint, 'base: 1.512 leituras de sensores esp32');
-- Administradores globais: visão total (6 sensores esp32; o de validação segue oculto, como hoje).
select t.eq(t.view_of(t.id('adm1')), 'true ativos=20 gateways=2 sensores=6 leituras=1512 movimentos=' || (select count(*) from public.gaxeta_movements m join public.gaxeta_devices d using (sensor_id) where d.origin = 'esp32'), 'adm1 vê tudo');
select t.eq(t.view_of(t.id('adm2')), t.view_of(t.id('adm1')), 'adm2: mesma visão global');
select t.eq(t.view_of(t.id('adm3')), t.view_of(t.id('adm1')), 'adm3: consulta em todas as empresas');
-- Corporação Alfa.
select t.ok(t.view_of(t.id('uA_all')) like 'true ativos=14 gateways=1 sensores=3 leituras=300 %', 'Todos na corporação: 14 ativos, 3 sensores, só leituras após o vínculo');
select t.ok(t.view_of(t.id('uA_tag')) like 'true ativos=5 gateways=0 sensores=1 leituras=100 %', 'TAG específico: o TAG, seu spot e 3 ancestrais de caminho; 1 sensor');
select t.ok(t.view_of(t.id('uA_sel')) like 'true ativos=6 gateways=1 sensores=1 leituras=100 %', 'Selecionar com Nenhum numa área: ramo negado não aparece');
select t.eq(t.view_of(t.id('uA_none')), 'true ativos=0 gateways=0 sensores=0 leituras=0 movimentos=0', 'sem concessão: sessão abre, nada é mostrado');
select t.ok(t.view_of(t.id('uA_campo')) like 'true ativos=6 gateways=0 sensores=1 leituras=100 %', 'operador de campo: só a área concedida e o caminho');
-- Corporação Beta não atravessa.
select t.ok(t.view_of(t.id('uB_all')) like 'true ativos=6 gateways=1 sensores=1 leituras=100 %', 'Beta: só a própria corporação');
select t.eq(t.view_of(t.id('estranho')), 'false ativos=0 gateways=0 sensores=0 leituras=0 movimentos=0', 'conta sem cadastro: nada');
commit;

-- Detalhe do TAG restrito: caminho sem irmãos, IDs conhecidos, histórico e contagens.
begin; select t.login(t.id('uA_tag'));
select t.eq((select string_agg(name, ' > ' order by cardinality(path)) from public.gaxeta_assets), 'Corporação Alfa > Alfa Unidade 2 > Utilidades > Bomba 101 > Spot 1', 'TAG restrito: exatamente o caminho e o próprio ramo');
select t.eq((select count(*) from public.gaxeta_assets where id in (t.id('A1'), t.id('A1_b101'), t.id('B1_b101'))), 0::bigint, 'ID conhecido de irmã, de TAG homônimo e de outra corporação não retorna linha');
select t.eq((select count(*) from public.gaxeta_devices where sensor_id in ('ESP32-A00000000002', 'ESP32-B00000000001', 'ESP32-PILOTO000001')), 0::bigint, 'sensores fora do escopo e fila sem vínculo: invisíveis');
select t.eq((select count(*) from public.gaxeta_readings where sensor_id <> 'ESP32-A00000000003'), 0::bigint, 'leituras de outros sensores: nenhuma, mesmo filtrando por ID');
select t.eq((select count(*) from public.gaxeta_readings where received_at < now() - interval '30 minutes'), 0::bigint, 'leituras anteriores ao vínculo: restritas');
select t.throws($$select public.gaxeta_asset_dependencies(t.id('A1'))$$, '42501', 'contagens de ramo fora do escopo: negadas');
select t.throws($$select public.gaxeta_admin_users()$$, '42501', 'usuário comum não lista usuários');
select t.throws($$select public.gaxeta_admin_audit()$$, '42501', 'usuário comum não lê auditoria');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A2_b101'), 'point', 'Novo', '', '')$$, '42501', 'sem capacidade de edição: criação negada');
select t.throws($$select public.gaxeta_configure_sensor('ESP32-A00000000003', 'RENOMEAR', t.id('A2_b101_s1'), null)$$, '42501', 'sem capacidade de edição: configuração de sensor negada');
select t.throws($$insert into public.gaxeta_gateways (company_id, name, identifier) values (t.id('A2'), 'x', 'GW-TAG')$$, '42501', 'inserção direta de gateway negada');
select t.throws($$update public.gaxeta_assets set name = 'x' where id = t.id('A2_b101')$$, '42501', 'UPDATE direto em ativos: sem privilégio');
select t.throws($$insert into public.gaxeta_assets (parent_id, kind, name) values (t.id('A2_b101'), 'point', 'x')$$, '42501', 'INSERT direto em ativos: sem privilégio');
select t.throws($$delete from public.gaxeta_assets where id = t.id('A2_b101_s1')$$, '42501', 'DELETE direto de ativo visível: negado pelo servidor');
select t.throws($$truncate public.gaxeta_assets cascade$$, '42501', 'TRUNCATE: sem privilégio');
commit;
select t.eq(t.hist_count(t.id('uA_tag'), 'ESP32-A00000000003'), '100/' || (select count(*) from public.gaxeta_movements where sensor_id = 'ESP32-A00000000003' and received_at >= (select linked_at from gaxeta_private.device_links where sensor_id = 'ESP32-A00000000003')) || '/null', 'histórico do próprio sensor: só a janela do vínculo, sem referência anterior a ela');
select t.eq(t.hist_count(t.id('uA_tag'), 'ESP32-A00000000002'), '0/0/null', 'histórico de sensor de outro ramo: vazio');
select t.eq(t.hist_count(t.id('uA_tag'), 'ESP32-B00000000001'), '0/0/null', 'histórico de sensor de outra corporação: vazio');
select t.eq(split_part(t.hist_count(t.id('adm3'), 'ESP32-A00000000003'), '/', 1), '201', 'adm3 analisa o histórico completo (antes e depois do vínculo)');
select t.throws($$select t.hist_count(t.id('estranho'), 'ESP32-A00000000003')$$, '42501', 'conta sem cadastro: histórico negado');

-- Revogação, alteração e ausência de escopo com o mesmo JWT (a decisão é do banco).
begin; select t.login(t.id('adm2'));
select public.gaxeta_admin_set_status(t.id('uA_all'), 'disabled') ->> 'status';
select public.gaxeta_admin_set_access(t.id('uA_tag'), null, '[]') ->> 'user_id';
commit;
select t.eq(t.view_of(t.id('uA_all')), 'false ativos=0 gateways=0 sensores=0 leituras=0 movimentos=0', 'usuário desativado perde tudo de imediato, com o token ainda válido');
select t.eq(t.view_of(t.id('uA_tag')), 'true ativos=0 gateways=0 sensores=0 leituras=0 movimentos=0', 'escopo removido: nada, sem esperar novo login');
begin; select t.login(t.id('adm2'));
select public.gaxeta_admin_set_status(t.id('uA_all'), 'active') ->> 'status';
select public.gaxeta_admin_set_access(t.id('uA_tag'), null, jsonb_build_array(jsonb_build_object('asset_id', t.id('A2_b101'), 'mode', 'all'))) ->> 'user_id';
commit;
select t.ok(t.view_of(t.id('uA_tag')) like 'true ativos=5 %', 'escopo restaurado volta a valer');
-- Banimento no Auth também corta o acesso.
update auth.users set banned_until = now() + interval '1 day' where id = t.id('uB_all');
select t.ok(t.view_of(t.id('uB_all')) like 'false ativos=0 %', 'conta banida no Auth: sem acesso');
update auth.users set banned_until = null where id = t.id('uB_all');

-- Matriz por ação.
begin; select t.login(t.id('adm3'));
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1'), 'area', 'x', '', '')$$, '42501', 'adm3: sem escrita na árvore');
select t.throws($$select public.gaxeta_link_sensor('ESP32-PILOTO000001', t.id('A1_tq200_s2'))$$, '42501', 'adm3: não vincula sensor');
select t.throws($$insert into public.gaxeta_gateways (company_id, name, identifier) values (t.id('A1'), 'x', 'GW-ADM3')$$, '42501', 'adm3: não cadastra gateway');
select t.throws($$select public.gaxeta_admin_users()$$, '42501', 'adm3: sem administração de usuários');
select t.throws($$delete from public.gaxeta_assets where id = t.id('A1_tq200_s2')$$, '42501', 'adm3: não exclui');
commit;
begin; select t.login(t.id('adm2'));
select t.put('A3', public.gaxeta_save_asset(null, t.id('corpA'), 'company', 'Alfa Unidade 3', '', '') ->> 'id');
select t.ok(t.id('A3') is not null, 'adm2: cria empresa');
select t.throws($$select public.gaxeta_save_asset(null, null, 'corporation', 'Nova corp', '', '')$$, '42501', 'adm2: não cria corporação');
select t.throws($$select public.gaxeta_save_corporation(null, 'Nova corp', null, null)$$, '42501', 'adm2: não cadastra corporação');
select t.throws($$delete from public.gaxeta_assets where id = t.id('A3')$$, '42501', 'adm2: DELETE direto negado');
select t.throws($$select public.gaxeta_delete_asset(t.id('A3'))$$, '42501', 'adm2: exclusão por RPC negada');
select t.throws($$select public.gaxeta_admin_set_status(t.id('adm1b'), 'disabled')$$, '42501', 'adm2: não altera conta de superior');
select t.throws($$select public.gaxeta_admin_set_status(t.id('adm3'), 'disabled')$$, '42501', 'adm2: não altera conta com papel global');
select t.throws($$select public.gaxeta_admin_set_role(t.id('uA_none'), 'adm3')$$, '42501', 'adm2: não promove');
select t.throws($$select public.gaxeta_admin_delete_user(t.id('uA_none'))$$, '42501', 'adm2: não exclui usuário');
select t.eq(public.gaxeta_link_sensor('ESP32-PILOTO000001', t.id('A1_tq200_s2'), 'teste de fila') ->> 'measurement_point_id', t.id('A1_tq200_s2')::text, 'adm2: vincula sensor da fila de associação');
select t.eq(public.gaxeta_unlink_sensor('ESP32-PILOTO000001', 'devolve à fila') ->> 'measurement_point_id', null, 'adm2: desvínculo explícito devolve à fila');
commit;
begin; select t.login(t.id('uA_campo'));
select t.put('A1_tq201', public.gaxeta_save_asset(null, t.id('A1_cald'), 'equipment', 'Tanque 201', 'TQ-201', '') ->> 'id');
select t.put('A1_tq201_s1', public.gaxeta_save_asset(null, t.id('A1_tq201'), 'point', 'Spot 1', '', '') ->> 'id');
select t.ok(t.id('A1_tq201_s1') is not null, 'operador com edição: cria TAG e spot no ramo concedido');
select t.put('A1_cald_sub', public.gaxeta_save_asset(null, t.id('A1_cald'), 'subarea', 'Linha 1', '', '') ->> 'id');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1'), 'area', 'Nova área', '', '')$$, '42501', 'operador: não cria em ancestral que é só caminho');
select t.throws($$select public.gaxeta_save_asset(null, t.id('corpA'), 'company', 'Nova empresa', '', '')$$, '42501', 'operador: não cria empresa');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1_util'), 'subarea', 'x', '', '')$$, '42501', 'operador: não escreve em ramo fora do escopo');
select t.eq(public.gaxeta_link_sensor('ESP32-A00000000002', t.id('A1_tq201_s1'), 'troca de spot') ->> 'measurement_point_id', t.id('A1_tq201_s1')::text, 'operador: move sensor entre spots do seu escopo');
select t.throws($$select public.gaxeta_link_sensor('ESP32-A00000000002', t.id('A1_b101_la'))$$, '42501', 'operador: não leva o sensor a spot fora do escopo');
select t.throws($$select public.gaxeta_link_sensor('ESP32-PILOTO000001', t.id('A1_tq200_s2'))$$, '42501', 'operador: não associa sensor da fila (identificador não autoriza)');
select t.throws($$select public.gaxeta_link_sensor('ESP32-B00000000001', t.id('A1_tq200_s2'))$$, '42501', 'operador: não puxa sensor de outra corporação');
select t.throws($$select public.gaxeta_unlink_sensor('ESP32-A00000000002')$$, '42501', 'operador: não devolve sensor à fila');
select t.eq(public.gaxeta_rename_sensor('ESP32-A00000000002', 'TQ201-S1') ->> 'label', 'TQ201-S1', 'operador: renomeia sensor do seu escopo');
select t.throws($$select public.gaxeta_set_sensor_gateway('ESP32-A00000000002', t.id('gwB1'))$$, 'mesma empresa', 'gateway de outra empresa/corporação é rejeitado');
select t.throws($$select public.gaxeta_delete_asset(t.id('A1_tq201_s1'))$$, '42501', 'operador: não exclui');
select t.eq((select count(*) from public.gaxeta_assets), 9::bigint, 'criar itens não amplia a visão além do ramo concedido');
commit;
select t.eq((select count(*) from gaxeta_private.device_links where sensor_id = 'ESP32-A00000000002'), 2::bigint, 'troca de spot preserva a proveniência (2 vínculos no histórico)');
select t.eq((select count(*) from gaxeta_private.device_links where sensor_id = 'ESP32-A00000000002' and unlinked_at is null), 1::bigint, 'um único vínculo aberto por sensor');
-- Leituras do período no spot antigo continuam com quem tem acesso àquele spot.
select t.eq(split_part(t.hist_count(t.id('uA_campo'), 'ESP32-A00000000002'), '/', 1), '100', 'proveniência: leituras feitas no spot anterior seguem visíveis a quem o acessa');

begin; select t.login(t.id('adm1'));
-- Gateway preservado ao salvar o ponto (o defeito da baseline) e regra de mesma empresa.
select public.gaxeta_save_asset(t.id('A1_b101_la'), t.id('A1_b101'), 'point', 'Lado acionado', '', 'LA rev.', 'ESP32-AAAA00000001', 'A1-B101-LA') ->> 'id';
select t.eq((select gateway_id from public.gaxeta_devices where sensor_id = 'ESP32-AAAA00000001'), t.id('gwA1'), 'salvar o ponto preserva o gateway do sensor');
select t.throws($$select public.gaxeta_save_asset(t.id('A2_b101_s1'), t.id('A2_b101'), 'point', 'Spot 1', '', 'LA', 'ESP32-AAAA00000001', null)$$, '23505|Desvincule o gateway', 'mover sensor com gateway para outra empresa exige desvincular antes');
select t.throws($$select public.gaxeta_set_sensor_gateway('ESP32-A00000000003', t.id('gwA1'))$$, 'mesma empresa', 'sensor, spot e gateway precisam ser da mesma empresa');
select t.throws($$select public.gaxeta_set_sensor_gateway('ESP32-PILOTO000001', t.id('gwA1'))$$, 'antes de associar', 'gateway exige sensor instalado num spot');
select t.eq(public.gaxeta_set_sensor_gateway('ESP32-AAAA00000001', null) ->> 'gateway_id', null, 'desvínculo explícito de gateway');
select t.eq(public.gaxeta_configure_sensor('ESP32-AAAA00000001', 'A1-B101-LA', t.id('A1_b101_la'), t.id('gwA1')) ->> 'gateway_id', t.id('gwA1')::text, 'contrato antigo configure_sensor segue funcionando');
select t.throws($$select public.gaxeta_link_sensor('ESP32-B00000000001', t.id('A1_tq200_s2'))$$, 'entre corporações', 'transferência direta de sensor entre corporações é bloqueada');
select t.throws($$select public.gaxeta_link_sensor('ESP32-A00000000003', t.id('A1_b101_la'))$$, '23505', 'spot ocupado: um sensor por spot');
select t.throws($$select public.gaxeta_link_sensor('ESP32-A00000000003', t.id('A1_b101'))$$, 'ponto de medição', 'sensor só se vincula a spot');
-- Hierarquia.
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1'), 'equipment', 'x', '', '')$$, 'incompatível', 'equipamento não fica direto na empresa');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1_cald'), 'point', 'x', '', '')$$, 'incompatível', 'spot órfão de TAG é rejeitado');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1'), 'corporation', 'x', '', '')$$, 'nível superior|check', 'corporação não tem pai');
select t.throws($$select public.gaxeta_save_asset(null, null, 'area', 'x', '', '')$$, 'nível superior|check', 'nível abaixo da raiz exige pai');
select t.throws($$select public.gaxeta_save_asset(t.id('A1_cald'), t.id('A1_cald'), 'area', 'Caldeiraria', '', '')$$, 'incompatível', 'ativo não vira pai de si mesmo');
select t.throws($$select public.gaxeta_save_asset(t.id('A1_cald'), t.id('B1'), 'area', 'Caldeiraria', '', '')$$, 'entre corporações', 'movimentação entre corporações é bloqueada');
select t.throws($$select public.gaxeta_save_asset(t.id('A1_cald'), t.id('A1'), 'subarea', 'Caldeiraria', '', '')$$, 'não pode ser alterado', 'nível do ativo é imutável');
-- Movimentação dentro da corporação: caminho dos descendentes e acessos reavaliados.
select public.gaxeta_save_asset(t.id('A1_tq200'), t.id('A1_util'), 'equipment', 'Tanque 200', 'TQ-200', '') ->> 'id';
select t.eq((select string_agg(x.name, ' > ' order by o.ord) from public.gaxeta_assets a, unnest(a.path) with ordinality o(id, ord) join public.gaxeta_assets x on x.id = o.id where a.id = t.id('A1_tq200_s1')),
            'Corporação Alfa > Alfa Unidade 1 > Utilidades > Tanque 200 > Spot 1', 'mover o TAG atualiza o caminho dos spots');
commit;
select t.ok(t.view_of(t.id('uA_campo')) like 'true ativos=6 %', 'após a movimentação, o operador deixa de ver o TAG que saiu da sua área');
begin; select t.login(t.id('adm1'));
select public.gaxeta_save_asset(t.id('A1_tq200'), t.id('A1_cald'), 'equipment', 'Tanque 200', 'TQ-200', '') ->> 'id';
-- Exclusão: dependências validadas no servidor.
select t.throws($$delete from public.gaxeta_assets where id = t.id('A1_cald')$$, '23503', 'DELETE direto com filhos: bloqueado por integridade');
select t.throws($$select public.gaxeta_delete_asset(t.id('A1_tq200_s1'))$$, '23503', 'spot com histórico de instalação não é excluído');
select t.ok((public.gaxeta_asset_dependencies(t.id('A1_cald')) ->> 'descendants')::int >= 5, 'dependências do ramo são informadas');
select t.eq(public.gaxeta_delete_asset(t.id('A3'), 'cadastro duplicado') ->> 'deleted', t.id('A3')::text, 'adm1: exclui ativo vazio por RPC');
delete from public.gaxeta_assets where id = t.id('A1_cald_sub');
select t.eq((select count(*) from public.gaxeta_assets where id = t.id('A1_cald_sub')), 0::bigint, 'adm1: DELETE direto do pacote publicado segue funcionando para ativo vazio');
select t.throws($$select public.gaxeta_delete_gateway(t.id('gwA1'))$$, '23503', 'gateway com sensores não é excluído');
-- Último nível 1.
select public.gaxeta_admin_set_status(t.id('adm1b'), 'disabled') ->> 'status';
select t.throws($$select public.gaxeta_admin_set_status(t.id('adm1'), 'disabled')$$, 'último administrador', 'último nível 1 ativo não pode ser desativado');
select t.throws($$select public.gaxeta_admin_set_role(t.id('adm1'), 'adm2')$$, 'último administrador', 'último nível 1 ativo não pode ser rebaixado');
select t.throws($$select public.gaxeta_admin_delete_user(t.id('adm1'))$$, 'último administrador', 'último nível 1 ativo não pode ser excluído');
select public.gaxeta_admin_set_status(t.id('adm1b'), 'active') ->> 'status';
select t.eq(public.gaxeta_admin_set_role(t.id('adm3'), 'adm2') ->> 'role', 'adm2', 'adm1 altera papel global');
select public.gaxeta_admin_set_role(t.id('adm3'), 'adm3') ->> 'role';
select t.eq((public.gaxeta_admin_delete_user(t.id('uA_none')) ->> 'deleted')::boolean, true, 'adm1 exclui cadastro de usuário');
select t.throws($$select public.gaxeta_delete_asset(t.id('corpB'))$$, '23503', 'corporação com empresas e usuários não é excluída');
commit;

-- Privilégios e políticas no catálogo.
select t.eq((select count(*) from pg_policies where schemaname = 'public' and policyname like 'member_%'), 0::bigint, 'nenhuma política antiga member_* restante');
select t.eq((select count(*) from pg_policies where schemaname = 'public' and (qual = 'true' or with_check = 'true')), 0::bigint, 'nenhuma política permissiva sem condição');
select t.eq((select count(*) from pg_policies where schemaname = 'public' and roles::text like '%anon%'), 0::bigint, 'nenhuma política para anon');
select t.ok(not has_table_privilege('authenticated', 'public.gaxeta_assets', 'TRUNCATE') and not has_table_privilege('authenticated', 'public.gaxeta_gateways', 'TRUNCATE')
        and not has_table_privilege('authenticated', 'public.gaxeta_assets', 'INSERT') and not has_table_privilege('authenticated', 'public.gaxeta_assets', 'UPDATE')
        and not has_table_privilege('authenticated', 'public.gaxeta_gateways', 'UPDATE'), 'authenticated: sem TRUNCATE; sem INSERT/UPDATE direto em ativos; sem UPDATE direto em gateways');
select t.ok(not has_table_privilege('anon', 'public.gaxeta_devices', 'SELECT') and not has_table_privilege('anon', 'public.gaxeta_readings', 'SELECT'), 'anon: sem SELECT herdado do piloto');
select t.ok(not has_function_privilege('anon', 'public.gaxeta_has_access()', 'EXECUTE'), 'anon: não executa gaxeta_has_access');
select t.eq((select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname like 'gaxeta\_%' and p.proname not in ('gaxeta_ingest', 'gaxeta_validate_asset', 'gaxeta_validate_asset_links', 'gaxeta_validate_gateway')
               and has_function_privilege('anon', p.oid, 'EXECUTE')), 0::bigint, 'anon só executa a ingestão');
select t.eq((select count(*) from pg_class c where c.relnamespace = 'gaxeta_private'::regnamespace and c.relkind = 'r' and (has_table_privilege('authenticated', c.oid, 'SELECT') or has_table_privilege('anon', c.oid, 'SELECT') or not c.relrowsecurity)), 0::bigint, 'tabelas privadas: sem acesso pela API e com RLS');
begin; select t.anon();
select t.throws($$select count(*) from public.gaxeta_readings$$, '42501', 'anon: leitura negada');
select t.throws($$select public.gaxeta_has_access()$$, '42501', 'anon: has_access negado');
commit;
select name, detail from t.results where suite = current_setting('t.suite') and not ok;
select current_setting('t.suite') as suite, count(*) filter (where ok) as ok, count(*) filter (where not ok) as falhas from t.results where suite = current_setting('t.suite');
