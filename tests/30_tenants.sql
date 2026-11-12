\set ON_ERROR_STOP 1
select set_config('t.suite', '30 tenants, usuários e convites', false);
-- Identidades sintéticas no Auth (verificadas e com senha), ainda sem cadastro no app.
insert into auth.users (id, email, encrypted_password, email_confirmed_at) values
  ('00000000-0000-4000-a000-000000000011', 'adm.dois@dev.test',   '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-000000000012', 'adm.tres@dev.test',   '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000a1', 'alfa.todos@dev.test', '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000a2', 'alfa.tag@dev.test',   '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000a3', 'alfa.sel@dev.test',   '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000a4', 'alfa.nenhum@dev.test','$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000a5', 'alfa.campo@dev.test', '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000b1', 'beta.todos@dev.test', '$2a$10$devhash', now()),
  ('00000000-0000-4000-a000-0000000000ff', 'estranho@dev.test',   '$2a$10$devhash', now());
select t.put('adm2','00000000-0000-4000-a000-000000000011'), t.put('adm3','00000000-0000-4000-a000-000000000012'),
  t.put('uA_all','00000000-0000-4000-a000-0000000000a1'), t.put('uA_tag','00000000-0000-4000-a000-0000000000a2'),
  t.put('uA_sel','00000000-0000-4000-a000-0000000000a3'), t.put('uA_none','00000000-0000-4000-a000-0000000000a4'),
  t.put('uA_campo','00000000-0000-4000-a000-0000000000a5'), t.put('uB_all','00000000-0000-4000-a000-0000000000b1'),
  t.put('estranho','00000000-0000-4000-a000-0000000000ff');

-- Sensores novos chegam pela ingestão.
begin; select t.anon();
select public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', jsonb_build_object('sensor_id', s, 'boot_id', md5(s), 'sequence', 2, 'travel_percent', 40, 'position_mm', 20, 'voltage_v', 1.3)) ->> 'ok'
  from unnest(array['ESP32-A00000000002', 'ESP32-A00000000003', 'ESP32-B00000000001']) s;
commit;
-- Telemetria anterior ao vínculo (deve ficar só com os administradores).
select t.gen_sensor(s, 100, now() - interval '2 hours', interval '10 seconds', 0.3) from unnest(array['ESP32-A00000000002', 'ESP32-A00000000003', 'ESP32-B00000000001']) s;

begin; select t.login(t.id('adm1'));
-- Árvore com e sem subárea, TAGs de mesmo nome em empresas e corporações diferentes.
select t.put('A1_cald', public.gaxeta_save_asset(null, t.id('A1'), 'area', 'Caldeiraria', '', '') ->> 'id');
select t.put('A1_tq200', public.gaxeta_save_asset(null, t.id('A1_cald'), 'equipment', 'Tanque 200', 'TQ-200', '') ->> 'id');
select t.ok(t.id('A1_tq200') is not null, 'equipamento/TAG criado direto na área (sem subárea)');
select t.put('A1_tq200_s1', public.gaxeta_save_asset(null, t.id('A1_tq200'), 'point', 'LOA', '', 'topo', 'ESP32-A00000000002', 'TQ200-S1') ->> 'id');
select t.put('A1_tq200_s2', public.gaxeta_save_asset(null, t.id('A1_tq200'), 'point', 'LA', '', 'fundo') ->> 'id');
select t.put('A2', public.gaxeta_save_asset(null, t.id('corpA'), 'company', 'Alfa Unidade 2', '', '') ->> 'id');
select t.put('A2_util', public.gaxeta_save_asset(null, t.id('A2'), 'area', 'Utilidades', '', '') ->> 'id');
select t.put('A2_b101', public.gaxeta_save_asset(null, t.id('A2_util'), 'equipment', 'Bomba 101', 'B-101', '') ->> 'id');
select t.put('A2_b101_s1', public.gaxeta_save_asset(null, t.id('A2_b101'), 'point', 'LOA', '', 'LA') ->> 'id');
select t.eq(public.gaxeta_link_sensor('ESP32-A00000000003', t.id('A2_b101_s1'), 'instalação inicial') ->> 'measurement_point_id', t.id('A2_b101_s1')::text, 'vínculo explícito sensor–spot');
select t.put('corpB', public.gaxeta_save_corporation(null, 'Corporação Beta', 'contato@beta.test', 'Responsável Beta', null, 'beta') ->> 'id');
select t.eq((public.gaxeta_save_corporation(t.id('corpA'), 'Corporação Alfa', null, null) ->> 'complete')::boolean, false, 'corporação pode ficar como rascunho (sem contato)');
select t.put('B1', public.gaxeta_save_asset(null, t.id('corpB'), 'company', 'Beta Unidade 1', '', '') ->> 'id');
select t.put('B1_util', public.gaxeta_save_asset(null, t.id('B1'), 'area', 'Utilidades', '', '') ->> 'id');
select t.put('B1_bombas', public.gaxeta_save_asset(null, t.id('B1_util'), 'subarea', 'Bombas', '', '') ->> 'id');
select t.put('B1_b101', public.gaxeta_save_asset(null, t.id('B1_bombas'), 'equipment', 'Bomba 101', 'B-101', '') ->> 'id');
select t.put('B1_b101_s1', public.gaxeta_save_asset(null, t.id('B1_b101'), 'point', 'LOA', '', 'LA', 'ESP32-B00000000001', null) ->> 'id');
select t.put('gwB1', public.gaxeta_save_gateway(null, t.id('B1'), 'Gateway B1', 'GW-B1-0001') ->> 'id');
select t.eq(public.gaxeta_save_gateway(t.id('gwB1'), t.id('B1'), 'Gateway B1 (portaria)', 'GW-B1-0001') ->> 'name', 'Gateway B1 (portaria)', 'edição real de gateway');
select t.throws($$select public.gaxeta_save_gateway(null, t.id('A1'), 'Outro', 'GW-B1-0001')$$, '23505', 'identificador de gateway é único');
select t.throws($$select public.gaxeta_save_gateway(null, t.id('A1_cald'), 'Em área', 'GW-X')$$, 'pertencer a uma empresa', 'gateway só sob empresa');
select t.eq((select count(*) from public.gaxeta_assets), 20::bigint, 'árvore sintética: 20 ativos em 2 corporações');

-- Cadastro de identidades existentes verificadas: vincula sem recriar conta.
select t.eq(public.gaxeta_admin_invite_user('adm.dois@dev.test', 'Adm Dois', 'adm2', null) ->> 'kind', 'linked', 'identidade existente vira adm2 sem novo convite');
select t.eq(public.gaxeta_admin_invite_user('adm.tres@dev.test', 'Adm Três', 'adm3', null) ->> 'kind', 'linked', 'identidade existente vira adm3');
select public.gaxeta_admin_invite_user('alfa.todos@dev.test', 'Alfa Todos', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('corpA'), 'mode', 'all'))) ->> 'kind';
select public.gaxeta_admin_invite_user('alfa.tag@dev.test', 'Alfa TAG', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('A2_b101'), 'mode', 'all'))) ->> 'kind';
select public.gaxeta_admin_invite_user('alfa.sel@dev.test', 'Alfa Selecionar', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('A1'), 'mode', 'all'), jsonb_build_object('asset_id', t.id('A1_util'), 'mode', 'none'))) ->> 'kind';
select public.gaxeta_admin_invite_user('alfa.nenhum@dev.test', 'Alfa Nenhum', null, t.id('corpA'), false, '[]') ->> 'kind';
select public.gaxeta_admin_invite_user('alfa.campo@dev.test', 'Alfa Campo', null, t.id('corpA'), true, jsonb_build_array(jsonb_build_object('asset_id', t.id('A1_cald'), 'mode', 'all'))) ->> 'kind';
select public.gaxeta_admin_invite_user('beta.todos@dev.test', 'Beta Todos', null, t.id('corpB'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('corpB'), 'mode', 'all'))) ->> 'kind';
select t.throws($$select public.gaxeta_admin_invite_user('x@dev.test', 'X', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('B1'), 'mode', 'all')))$$, 'Concessões inválidas', 'concessão em ativo de outra corporação é rejeitada');
select t.throws($$select public.gaxeta_admin_invite_user('alfa.tag@dev.test', 'Dup', null, t.id('corpA'))$$, '23505', 'e-mail já cadastrado não é recriado');
-- Prévia do acesso efetivo (Selecionar em A1 com Utilidades = Nenhum).
select t.eq((select string_agg(e ->> 'name' || '=' || (e ->> 'state'), ',' order by e ->> 'name') from jsonb_array_elements(public.gaxeta_admin_preview_access(t.id('corpA'),
              jsonb_build_array(jsonb_build_object('asset_id', t.id('A1'), 'mode', 'all'), jsonb_build_object('asset_id', t.id('A1_util'), 'mode', 'none')), t.id('A1')) -> 'items') e),
            'Caldeiraria=full,Utilidades=none', 'prévia: Todos na empresa com Nenhum numa área');
select t.eq((select string_agg(e ->> 'name' || '=' || (e ->> 'state'), ',' order by e ->> 'name') from jsonb_array_elements(public.gaxeta_admin_preview_access(t.id('corpA'),
              jsonb_build_array(jsonb_build_object('asset_id', t.id('A2_b101'), 'mode', 'all')), t.id('corpA')) -> 'items') e),
            'Alfa Unidade 1=none,Alfa Unidade 2=path', 'prévia: TAG específico mostra a empresa só como caminho e oculta a irmã');
reset role;
-- Normalização: "Nenhum" sem "Todos" acima e "Todos" repetido abaixo são redundantes e não são gravados.
select t.eq(gaxeta_private.normalize_grants(t.id('corpA'), jsonb_build_array(jsonb_build_object('asset_id', t.id('A2'), 'mode', 'none'), jsonb_build_object('asset_id', t.id('A1'), 'mode', 'all'), jsonb_build_object('asset_id', t.id('A1_cald'), 'mode', 'all')))::text,
            jsonb_build_array(jsonb_build_object('asset_id', t.id('A1'), 'mode', 'all'))::text, 'concessões redundantes são descartadas');
-- Telemetria posterior ao vínculo.
select t.gen_sensor(s, 100, clock_timestamp() + interval '1 second', interval '1 second', 0.7) from unnest(array['ESP32-AAAA00000001', 'ESP32-A00000000002', 'ESP32-A00000000003', 'ESP32-B00000000001']) s;
commit;

-- Convite novo: pré-cadastro → envio (serviço) → senha → ativação imediata no escopo.
begin; select t.login(t.id('adm2'));
select t.put('inv1', public.gaxeta_admin_invite_user('Convidado@Dev.Test ', 'Convidado Novo', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('A1_cald'), 'mode', 'all'))) ->> 'invite_id');
select t.eq(public.gaxeta_admin_invite_user('convidado@dev.test', 'Convidado Novo', null, t.id('corpA'), false, jsonb_build_array(jsonb_build_object('asset_id', t.id('A1_cald'), 'mode', 'all'))) ->> 'invite_id', t.id('inv1')::text, 'convite repetido reaproveita o mesmo registro');
select t.throws($$select public.gaxeta_admin_invite_user('chefe@dev.test', 'Chefe', 'adm2', null)$$, '42501', 'adm2 não nomeia administradores globais');
select t.throws($$select public.gaxeta_service_invite_result(t.id('inv1'), true)$$, '42501', 'resultado de envio não é chamável por usuário logado');
commit;
begin; select t.service();
select t.eq(public.gaxeta_service_invite_result(t.id('inv1'), false, null, 'smtp indisponível') ->> 'status', 'failed', 'falha de envio fica registrada');
commit;
begin; select t.login(t.id('adm2'));
select t.eq((select e ->> 'status' from jsonb_array_elements(public.gaxeta_admin_users('convidado') -> 'items') e), 'invite_failed', 'lista mostra convite com falha');
select t.eq(public.gaxeta_admin_resend_invite(t.id('inv1')) ->> 'status', 'pending', 'reenvio volta o convite para pendente');
commit;
-- O Auth cria a identidade convidada (sem senha, e-mail ainda não confirmado).
insert into auth.users (id, email, encrypted_password, invited_at) values ('00000000-0000-4000-a000-0000000000c1', 'convidado@dev.test', '', now());
select t.put('convidado', '00000000-0000-4000-a000-0000000000c1');
begin; select t.service();
select t.eq(public.gaxeta_service_invite_result(t.id('inv1'), true, t.id('convidado'), null, now() + interval '1 day') ->> 'status', 'sent', 'envio confirmado pelo serviço');
commit;
begin; select t.login(t.id('convidado'));
select t.eq(public.gaxeta_has_access(), false, 'convite enviado ainda não dá acesso');
select t.throws($$select public.gaxeta_activate_invite()$$, '42501', 'ativação exige e-mail verificado');
commit;
update auth.users set email_confirmed_at = now() where id = t.id('convidado');
begin; select t.login(t.id('convidado'));
select t.throws($$select public.gaxeta_activate_invite()$$, 'Defina a senha', 'ativação exige senha definida no Auth');
select t.eq((public.gaxeta_my_context() ->> 'has_pending_invite')::boolean, true, 'contexto indica convite pendente');
commit;
update auth.users set encrypted_password = '$2a$10$devhash' where id = t.id('convidado');
begin; select t.login(t.id('convidado'));
select t.eq(public.gaxeta_activate_invite() ->> 'status', 'activated', 'ativação conclui depois da senha');
select t.eq(public.gaxeta_has_access(), true, 'acesso imediato após ativar, sem segunda aprovação');
select t.eq((select count(*) from public.gaxeta_assets), 6::bigint, 'convidado enxerga só o ramo pré-cadastrado (4) e o caminho (2)');
select t.eq(public.gaxeta_activate_invite() ->> 'status', 'already_registered', 'ativação é idempotente');
commit;
begin; select t.login(t.id('estranho'));
select t.throws($$select public.gaxeta_activate_invite()$$, 'convite pendente', 'conta sem convite não se ativa');
select t.eq(public.gaxeta_has_access(), false, 'conta sem cadastro não tem acesso');
commit;
-- Convite expirado e revogado.
begin; select t.login(t.id('adm1'));
select t.put('inv2', public.gaxeta_admin_invite_user('expira@dev.test', 'Vai Expirar', 'adm3', null) ->> 'invite_id');
commit;
update gaxeta_private.invites set status = 'sent', sent_at = now() - interval '3 days', expires_at = now() - interval '2 days' where id = t.id('inv2');
begin; select t.login(t.id('adm1'));
select t.eq((select e ->> 'status' from jsonb_array_elements(public.gaxeta_admin_users('expira') -> 'items') e), 'invite_expired', 'lista identifica convite expirado');
select t.eq(public.gaxeta_admin_revoke_invite(t.id('inv2')) ->> 'status', 'revoked', 'convite revogado');
select t.eq((public.gaxeta_admin_users(null, null, null, null, null, 5, 0) ->> 'total')::int, 11, 'listagem: 11 cadastros');
select t.eq(jsonb_array_length(public.gaxeta_admin_users(null, null, null, null, null, 5, 10) -> 'items'), 1, 'listagem paginada (limite 5, deslocamento 10)');
select t.eq((public.gaxeta_admin_users(null, 'corp', 'active', t.id('corpA')) ->> 'total')::int, 6, 'filtro por nível, status e corporação');
select t.eq((public.gaxeta_admin_users(null, null, null, null, t.id('A2')) ->> 'total')::int, 2, 'filtro por empresa (quem tem concessão que alcança A2)');
select t.ok((select count(*) from jsonb_array_elements(public.gaxeta_admin_audit(200)) e where e ->> 'action' in ('invite.create', 'invite.update', 'invite.sent', 'invite.failed', 'invite.resend', 'invite.accept', 'invite.revoke', 'user.link_existing')) >= 14, 'auditoria registra convites e vínculos');
commit;
select t.ok(not exists (select 1 from gaxeta_private.audit_log where details::text ~* 'devhash|token|password'), 'auditoria sem segredos');
select name, detail from t.results where suite = current_setting('t.suite') and not ok;
select current_setting('t.suite') as suite, count(*) filter (where ok) as ok, count(*) filter (where not ok) as falhas from t.results where suite = current_setting('t.suite');
