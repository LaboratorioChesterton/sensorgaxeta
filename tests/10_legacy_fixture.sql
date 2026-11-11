-- Estado legado (antes das migrações): contas do piloto por e-mail, árvore criada
-- pelas regras antigas (subárea obrigatória), sensor vinculado com gateway, sensor
-- do piloto sem vínculo e dispositivo de validação. Tudo sintético.
\set ON_ERROR_STOP 1
select set_config('t.suite', '10 fixture legada', false);

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-4000-a000-000000000001', 'admin.um@dev.test',   '$2a$10$devhash', now(), '{"must_change_password":false}'),
  ('00000000-0000-4000-a000-000000000002', 'admin.dois@dev.test', '$2a$10$devhash', now(), '{"must_change_password":false}');
insert into gaxeta_private.platform_members (email) values ('admin.um@dev.test'), ('admin.dois@dev.test');
-- Chave de ingestão exclusiva do ambiente de desenvolvimento.
insert into gaxeta_private.ingest_keys (token_hash, label) values (sha256(convert_to('dev-token-0123456789abcdef0123456789abcdef', 'UTF8')), 'dev');
select t.put('adm1', '00000000-0000-4000-a000-000000000001'), t.put('adm1b', '00000000-0000-4000-a000-000000000002');

-- Dispositivos chegam pela rota real de ingestão (anon + token), como a placa faz.
begin;
select t.anon();
select t.eq((public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef',
  jsonb_build_object('sensor_id', 'ESP32-AAAA00000001', 'boot_id', 'aaaaaaaaaaaaaaaa', 'sequence', 2, 'travel_percent', 50.00, 'position_mm', 25, 'voltage_v', 1.65,
                     'adc_noise', 1.2, 'firmware_version', '4.0.0', 'device_name', 'GAXETA-ESP32')) ->> 'ok')::boolean, true, 'ingestão cria o sensor A1');
select t.eq((public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef',
  jsonb_build_object('sensor_id', 'ESP32-PILOTO000001', 'boot_id', 'bbbbbbbbbbbbbbbb', 'sequence', 2, 'travel_percent', 4.60, 'position_mm', 2.3, 'voltage_v', 0.15)) ->> 'ok')::boolean, true, 'ingestão cria o sensor do piloto (sem vínculo)');
select t.eq((public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef',
  jsonb_build_object('sensor_id', 'VALIDACAO-INTEGRACAO', 'origin', 'integration_test', 'boot_id', 'cccccccccccccccc', 'sequence', 1, 'travel_percent', 10, 'position_mm', 5, 'voltage_v', 0.3)) ->> 'ok')::boolean, true, 'ingestão cria o dispositivo de validação');
commit;

-- Árvore e vínculo pelas RPCs antigas, como o pacote publicado faz.
begin;
select t.login(t.id('adm1'));
select t.put('corpA', public.gaxeta_save_asset(null, null, 'corporation', 'Corporação Alfa', '', '') ->> 'id');
select t.put('A1', public.gaxeta_save_asset(null, t.id('corpA'), 'company', 'Alfa Unidade 1', '', '') ->> 'id');
select t.put('A1_util', public.gaxeta_save_asset(null, t.id('A1'), 'area', 'Utilidades', '', '') ->> 'id');
select t.put('A1_bombas', public.gaxeta_save_asset(null, t.id('A1_util'), 'subarea', 'Bombas', '', '') ->> 'id');
select t.put('A1_b101', public.gaxeta_save_asset(null, t.id('A1_bombas'), 'equipment', 'Bomba 101', 'B-101', '') ->> 'id');
select t.put('A1_b101_la', public.gaxeta_save_asset(null, t.id('A1_b101'), 'point', 'Lado acionado', '', 'LA') ->> 'id');
select t.throws($$select public.gaxeta_save_asset(null, t.id('A1_util'), 'equipment', 'TAG direto na área', 'X-1', '')$$,
  'Nível superior incompatível', 'LEGADO: equipamento direto na área é rejeitado (divergência a corrigir)');
insert into public.gaxeta_gateways (company_id, name, identifier) values (t.id('A1'), 'Gateway A1', 'GW-A1-0001');
select t.put('gwA1', (select id::text from public.gaxeta_gateways where identifier = 'GW-A1-0001'));
select t.eq(public.gaxeta_configure_sensor('ESP32-AAAA00000001', 'A1-B101-LA', t.id('A1_b101_la'), t.id('gwA1')) ->> 'gateway_id', t.id('gwA1')::text, 'legado: sensor vinculado com gateway');
commit;
select t.gen_sensor('ESP32-AAAA00000001', 400, now() - interval '3 days', interval '10 seconds', 0.11);
select t.gen_sensor('ESP32-PILOTO000001', 400, now() - interval '3 days', interval '10 seconds', 0.22);
select name, ok, detail from t.results where suite = '10 fixture legada' and not ok;
