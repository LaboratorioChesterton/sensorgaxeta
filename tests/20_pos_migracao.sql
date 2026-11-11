\set ON_ERROR_STOP 1
select set_config('t.suite', '20 pós-migração e ingestão', false);
-- Backfill
select t.eq((select count(*) from public.gaxeta_assets where path is null or corporation_id is null), 0::bigint, 'todos os ativos legados têm caminho e corporação');
select t.eq((select cardinality(path) from public.gaxeta_assets where id = t.id('A1_b101_la')), 6, 'spot legado: caminho com 6 níveis');
select t.eq((select corporation_id from public.gaxeta_assets where id = t.id('A1_b101_la')), t.id('corpA'), 'spot legado: corporação derivada');
select t.eq((select count(*) from gaxeta_private.device_links where sensor_id = 'ESP32-AAAA00000001' and unlinked_at is null and point_id = t.id('A1_b101_la')), 1::bigint, 'vínculo legado entrou no histórico');
select t.eq((select count(*) from gaxeta_private.device_links), 1::bigint, 'sensor sem vínculo não ganhou histórico');
select t.eq((select string_agg(global_role, ',' order by email) from gaxeta_private.user_profiles), 'adm1,adm1', 'as duas contas do piloto viraram nível 1 por UUID');
select t.eq((select gateway_id from public.gaxeta_devices where sensor_id = 'ESP32-AAAA00000001'), t.id('gwA1'), 'gateway legado preservado pela migração');

-- Ingestão intocada: corpos e privilégios idênticos aos de produção (hash sem espaços lido em 11/11).
select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'public.gaxeta_ingest(text,jsonb)'::regprocedure), '86e3e54a185017b0b3d70c5cf95de619', 'gaxeta_ingest: corpo igual ao de produção');
select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'public.gaxeta_ingest_v3(text,jsonb)'::regprocedure), '1f743ba2f7786202193314e4f2f63e58', 'gaxeta_ingest_v3: corpo igual ao de produção');
select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'gaxeta_private.stabilize(numeric,numeric)'::regprocedure), 'd5cc19fb9511412aeef67bf00b39e490', 'stabilize: corpo igual ao de produção');
select t.eq((select md5(regexp_replace(prosrc, '\s+', '', 'g')) from pg_proc where oid = 'public.gaxeta_snapshot(text,integer)'::regprocedure), '16cd86e07816114e3d6ab72196ac4274', 'gaxeta_snapshot: corpo igual ao de produção');
select t.ok(has_function_privilege('anon', 'public.gaxeta_ingest(text,jsonb)', 'EXECUTE') and has_function_privilege('authenticated', 'public.gaxeta_ingest(text,jsonb)', 'EXECUTE'), 'gaxeta_ingest: anon e authenticated continuam executando');
select t.ok(not has_function_privilege('anon', 'public.gaxeta_ingest_v3(text,jsonb)', 'EXECUTE') and not has_function_privilege('authenticated', 'public.gaxeta_ingest_v3(text,jsonb)', 'EXECUTE'), 'gaxeta_ingest_v3: continua fechada para a API');
select t.eq((select count(*) from pg_trigger tg where tg.tgrelid in ('public.gaxeta_readings'::regclass, 'public.gaxeta_movements'::regclass) and not tg.tgisinternal), 0::bigint, 'nenhum gatilho novo em leituras e movimentos');
select t.eq((select string_agg(tgname, ',') from pg_trigger where tgrelid = 'public.gaxeta_devices'::regclass and not tgisinternal), 'gaxeta_device_config_audit', 'dispositivos: só o gatilho por coluna de configuração');

-- Regra dos 5 pontos pela rota real (anon + token de desenvolvimento), nos dois sentidos.
create or replace function t.send(p_seq bigint, p_raw numeric, p_boot text default 'dddddddddddddddd') returns jsonb language plpgsql as $$
declare r jsonb;
begin
  perform pg_sleep(0.8);
  r := public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', jsonb_build_object('sensor_id', 'ESP32-BORDA0000001',
        'boot_id', p_boot, 'sequence', p_seq, 'travel_percent', p_raw, 'position_mm', round(p_raw * 0.5, 3), 'voltage_v', round(p_raw * 0.033, 4), 'adc_noise', 1));
  return r;
end $$;
begin; select t.anon();
select t.eq((t.send(2, 50.00) ->> 'duplicate')::boolean, false, 'borda: primeira leitura aceita');
reset role; select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 50.00, 'borda: referência inicial = 50,00'); select t.anon();
select t.send(4, 54.99) is not null;
reset role; select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 50.00, 'borda: +4,99 mantém 50,00'); select t.anon();
select t.send(6, 55.00) is not null;
reset role; select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 55.00, 'borda: +5,00 exato atualiza para 55,00'); select t.anon();
select t.send(8, 50.01) is not null;
reset role; select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 55.00, 'borda: −4,99 mantém 55,00'); select t.anon();
select t.send(10, 50.00) is not null;
reset role; select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 50.00, 'borda: −5,00 exato atualiza para 50,00'); select t.anon();
select t.eq((t.send(10, 99.00) ->> 'duplicate')::boolean, true, 'reenvio da mesma sequência é duplicata');
select t.send(9, 10.00) is not null;
reset role;
select t.eq((select stable_percent::text || '/' || last_percent::text from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), '50.00/50.00', 'duplicata e amostra atrasada do mesmo boot não alteram o estado atual');
select t.eq((select stable_percent from public.gaxeta_readings where sensor_id = 'ESP32-BORDA0000001' and sequence = 9), 50.00, 'amostra atrasada entra no histórico com a referência vigente');
select t.anon();
select t.send(4, 99.00, 'eeeeeeeeeeeeeeee') is not null;
reset role;
select t.eq((select stable_percent from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 99.00, 'leitura de novo boot passa a ser a atual (comportamento existente)');
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = 'ESP32-BORDA0000001'), 7::bigint, 'duplicata não cria linha; atrasada e novo boot entram');
select t.eq((select string_agg(coalesce(previous_percent::text, 'null') || '>' || stable_percent::text, ' ' order by received_at) from public.gaxeta_movements where sensor_id = 'ESP32-BORDA0000001'),
            'null>50.00 50.00>55.00 55.00>50.00 50.00>99.00', 'movimentos gravados só nas variações >= 5 (e na troca de boot)');
select t.eq((select reading_count from public.gaxeta_devices where sensor_id = 'ESP32-BORDA0000001'), 7::bigint, 'reading_count acumula por inserção');
commit;
select name, detail from t.results where suite = current_setting('t.suite') and not ok;
select current_setting('t.suite') as suite, count(*) filter (where ok) as ok, count(*) filter (where not ok) as falhas from t.results where suite = current_setting('t.suite');
