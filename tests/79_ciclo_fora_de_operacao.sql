\set ON_ERROR_STOP 1
-- Migração 13: as operações do ciclo de gaxeta deixam de ser executáveis; os registros antigos
-- ficam arquivados, intocados; ingestão, estabilização, resumo elétrico, histórico, vínculos e
-- exclusão autorizada continuam funcionando. Roda depois da suíte 78.
select set_config('t.suite', '79 ciclo de gaxeta fora de operação', false);
\set s 'ESP32-DESTR0000002'
select (select count(*) from gaxeta_private.gland_events) as ev0, (select count(*) from gaxeta_private.gland_anchors) as an0,
       (select count(*) from gaxeta_private.gland_profiles) as pf0, (select count(*) from public.gaxeta_movements) as mv0,
       (select count(*) from public.gaxeta_readings) as rd0, (select count(*) from gaxeta_private.device_links) as lk0 \gset
select t.ok(:ev0 > 0 and :an0 > 0, 'há registros antigos de ciclo e de referência para conferir que ficam arquivados');

begin; select t.login(t.id('adm1'));
select t.throws($$select public.gaxeta_gland_status('ESP32-DESTR0000002')$$, '42501', 'estado do ciclo: negado');
select t.throws($$select public.gaxeta_gland_summary(array['ESP32-DESTR0000002'])$$, '42501', 'resumo mecânico: negado');
select t.throws($$select public.gaxeta_gland_history('ESP32-DESTR0000002', now() - interval '1 day', now())$$, '42501', 'histórico de engaxetamento: negado');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-DESTR0000002', '1', null, gen_random_uuid(), 'replacement', 15, 3)$$, '42501', 'registrar engaxetamento: negado');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-DESTR0000002', '1', null, gen_random_uuid(), 'maintenance', null, null)$$, '42501', 'iniciar manutenção da gaxeta: negado');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-DESTR0000002', '1', '1', '1', false)$$, '42501', 'confirmar marca superior: negado');
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000002', '1', gen_random_uuid())$$, '42501', 'comissionamento: negado');
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-DESTR0000002', '1', gen_random_uuid(), '{}'::jsonb)$$, '42501', 'perfil de instalação: negado');
commit;
begin; select t.service();
select t.throws($$select public.gaxeta_gland_summary(array['ESP32-DESTR0000002'])$$, '42501', 'também negado ao papel de serviço');
commit;

-- O que continua funcionando
begin; select t.anon();
select t.ok(t.ing(:'s', 2150) > 0, 'ingestão continua aceitando o sensor vinculado');
select t.ok((t.ingp('ESP32-ELETR0000002', 47.0) ->> 'ok')::boolean, 'ingestão continua aceitando o sensor sem vínculo');
commit;
begin; select t.login(t.id('adm1'));
select t.eq(jsonb_array_length(public.gaxeta_telemetry_summary(array[:'s', 'ESP32-ELETR0000002']) -> 'items'), 2, 'resumo elétrico continua disponível (com e sem vínculo)');
select t.ok(jsonb_array_length(public.gaxeta_history(:'s', now() - interval '1 day', now() + interval '1 minute') -> 'history') > 0, 'histórico de telemetria continua disponível');
select t.ok(jsonb_array_length(public.gaxeta_devices_status(array[:'s']) -> 'devices') = 1, 'estado dos sensores continua disponível');
select t.ok((public.gaxeta_devices_page(null, null, true, 20, 0) -> 'items') is not null, 'fila de sensores sem vínculo continua disponível');
commit;
select t.eq(t.est('ESP32-ELETR0000002'), '47.0|47.0|2', 'estabilização de 5 p.p. continua registrando mudança (40 → 47)');

select t.eq((select count(*) from gaxeta_private.gland_events), :ev0::bigint, 'eventos antigos arquivados: nenhum apagado, nenhum criado');
select t.eq((select count(*) from gaxeta_private.gland_anchors), :an0::bigint, 'referências antigas arquivadas: intactas');
select t.eq((select count(*) from gaxeta_private.gland_profiles), :pf0::bigint, 'perfis antigos arquivados: intactos');
select t.eq((select count(*) from gaxeta_private.device_links), :lk0::bigint, 'vínculos intactos');
select t.ok((select count(*) from public.gaxeta_movements) >= :mv0::bigint and (select count(*) from public.gaxeta_readings) = :rd0::bigint + 2, 'leituras e mudanças de 5 p.p. preservadas');
