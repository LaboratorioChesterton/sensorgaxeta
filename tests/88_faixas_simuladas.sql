\set ON_ERROR_STOP 1
-- Migração 16: faixas simuladas da bancada (preferência de apresentação por vínculo) e faixa
-- idêntica que não encerra a bancada. Roda depois da suíte 87 e da migração 16.
-- SIMULAÇÃO em banco local: nenhum ângulo aqui veio de sensor físico. Nada toca produção.
select set_config('t.suite', '88 faixas simuladas da bancada', false);
begin;
\set bk 'ESP32-BANCADA00001'
\set bf 'ESP32-BANCADA00002'

create or replace function t.bands(p_sensor text) returns text language sql as $$
  select coalesce(t.ms(p_sensor) ->> 'bench_bands', 'nulo') $$;
create or replace function t.pref_rows() returns bigint language sql security definer set search_path to '' as $$
  select count(*) from gaxeta_private.mag_bench_prefs $$;
grant execute on function t.pref_rows() to public;
create or replace function t.bench_anchor_of(p_sensor text) returns text language sql security definer set search_path to '' as $$
  select id || '|' || anchor_status || '|' || anchor_session || '|' || anchor_count || '|' || anchor_u_deg || '|' || anchor_reading_id || '|' || anchor_at
    from gaxeta_private.mag_bench_modes where sensor_id = p_sensor and status = 'active' $$;
grant execute on function t.bench_anchor_of(text) to public;
create or replace function t.audit_n(p_action text) returns bigint language sql security definer set search_path to '' as $$
  select count(*) from gaxeta_private.audit_log where action = p_action $$;
grant execute on function t.audit_n(text) to public;

-- ---------------------------------------------------------------------------
-- A. Padrão: ligadas, sem nenhuma linha gravada; leitura para quem vê o sensor
-- ---------------------------------------------------------------------------
select t.root();
select t.eq(t.pref_rows(), 0::bigint, 'migração aplicada: nenhuma preferência gravada (o padrão não precisa de linha)');
select t.login(t.id('uA_campo'));
select t.eq(t.bands(:'bk'), 'true', 'sensor vinculado, sem preferência gravada: faixas simuladas ligadas por padrão');
select t.login(t.id('uA_all'));
select t.eq(t.bands(:'bk'), 'true', 'conta de consulta lê a mesma preferência (quem vê o sensor vê a escolha)');
select t.login(t.id('uB_all'));
select t.eq(public.gaxeta_mag_summary(array[:'bk']) -> 'items', '[]'::jsonb, 'outra corporação continua sem ver o sensor (nem a preferência)');

-- Bancada ligada e início confirmado em 147,04° (= 67,04 % de 80°→180°), como no ensaio de 21/11.
select t.login(t.id('uA_campo'));
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80, 180, 1) \g /dev/null
select t.bench_anchor(:'bk', 147.04) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '67.04', 'bancada ativa com início confirmado: 67,04 %');
select t.bench_anchor_of(:'bk') as bk_anchor, t.bench_rows(:'bk') as bk_rows \gset
select t.root();
select (select count(*) from public.gaxeta_readings where sensor_id = :'bk') as rd0 \gset
select (select count(*) from gaxeta_private.mag_movements) as mm0, (select count(*) from gaxeta_private.mag_services) as sv0,
       (select count(*) from gaxeta_private.mag_maintenance_notes) as nt0, (select count(*) from public.gaxeta_movements) as mv0 \gset
select t.login(t.id('uA_campo'));

-- ---------------------------------------------------------------------------
-- B. Desligar e ligar: só a preferência muda
-- ---------------------------------------------------------------------------
select t.eq(public.gaxeta_mag_bench_set_bands(:'bk', false)::text, '{"changed": true, "show_bands": false}', 'quem opera o spot desliga as faixas simuladas');
select t.eq(t.bands(:'bk'), 'false', 'resumo passa a dizer desligadas');
select t.eq(t.bp(:'bk'), '67.04', 'o percentual de bancada continua o mesmo com as faixas desligadas');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'state', 'ok', 'o estado da bancada continua ok (não pede referência)');
select t.eq(t.bench_anchor_of(:'bk'), :'bk_anchor', 'a âncora (sessão, contagem, leitura e horário) fica intacta');
select t.eq(t.bench_rows(:'bk'), :'bk_rows', 'nenhuma configuração de bancada foi encerrada nem criada');
select t.eq(public.gaxeta_mag_bench_set_bands(:'bk', false)::text, '{"changed": false, "show_bands": false}', 'repetir a mesma escolha não grava nada');
select t.root();
select t.eq(t.pref_rows(), 1::bigint, 'uma linha por vínculo, não por clique');
select t.eq(t.audit_n('mag.bench.bands'), 1::bigint, 'auditoria: uma linha na mudança, nenhuma na repetição');
select t.login(t.id('uA_all'));
select t.eq(t.bands(:'bk'), 'false', 'outro cliente (conta de consulta) lê a escolha feita pelo operador');
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-BANCADA00001', true)$$, '42501', 'conta de consulta não altera a preferência');
select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-BANCADA00001', true)$$, '42501', 'outra corporação não altera a preferência');
select t.anon();
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-BANCADA00001', true)$$, '42501', 'anônimo (o papel da placa) não executa a função');
select t.login(t.id('uA_campo'));
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-BANCADA00001', null)$$, '22023', 'valor nulo é recusado');
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-NAO-EXISTE', true)$$, '42501', 'sensor inexistente: mesma recusa de quem não tem acesso');

-- A placa segue enviando com as faixas desligadas: mesma sessão, mesma conta, sem evento.
select t.anon(); select t.ct(:'bk', 150.29) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '70.29', 'leitura seguinte: 70,29 % (a contagem contínua seguiu a mesma sessão)');
select t.eq(public.gaxeta_mag_bench_set_bands(:'bk', true)::text, '{"changed": true, "show_bands": true}', 'religa as faixas simuladas');
select t.eq(t.bands(:'bk'), 'true', 'resumo volta a dizer ligadas');
select t.eq(t.bp(:'bk'), '70.29', 'religar não muda o percentual');
select t.eq(t.bench_anchor_of(:'bk'), :'bk_anchor', 'religar não toca a âncora');
select t.root();
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'bk'), :rd0::bigint + 1, 'leituras: só a que a placa enviou (nenhum registro por amostra criado pela preferência)');
select t.eq((select count(*) from gaxeta_private.mag_movements), :mm0::bigint, 'nenhum movimento de campo');
select t.eq((select count(*) from gaxeta_private.mag_services), :sv0::bigint, 'nenhuma referência de engaxetamento');
select t.eq((select count(*) from gaxeta_private.mag_maintenance_notes), :nt0::bigint, 'nenhum registro de manutenção');
select t.eq((select count(*) from public.gaxeta_movements), :mv0::bigint, 'nenhuma mudança de 5 p.p. da série elétrica');

-- ---------------------------------------------------------------------------
-- C. A escolha não vaza entre sensores e acompanha o vínculo
-- ---------------------------------------------------------------------------
select t.anon(); select t.ct(:'bf', 100) \g /dev/null
select t.login(t.id('adm1'));
select t.put('bf_pt', public.gaxeta_save_asset(null, t.id('bk_eq'), 'point', 'LA', '', '') ->> 'id') \g /dev/null
select t.ok(public.gaxeta_link_sensor(:'bf', t.id('bf_pt'), 'suíte 88') ->> 'measurement_point_id' is not null, 'segundo sensor vinculado ao spot LA do mesmo TAG');
select t.anon(); select t.ct(:'bf', 100) \g /dev/null
select t.login(t.id('uA_campo'));
select public.gaxeta_mag_bench_set_bands(:'bk', false) \g /dev/null
select t.eq(t.bands(:'bk') || '|' || t.bands(:'bf'), 'false|true', 'desligar em um sensor não muda o outro');
select public.gaxeta_mag_bench_set_bands(:'bf', false) \g /dev/null
select public.gaxeta_mag_bench_set_bands(:'bk', true) \g /dev/null
select t.eq(t.bands(:'bk') || '|' || t.bands(:'bf'), 'true|false', 'cada vínculo guarda a sua escolha');
select t.login(t.id('adm1'));
select public.gaxeta_unlink_sensor(:'bf', 'suíte 88') \g /dev/null
select t.eq(t.bands(:'bf'), 'nulo', 'sensor sem vínculo: sem preferência (não há bancada sem spot)');
select t.throws($$select public.gaxeta_mag_bench_set_bands('ESP32-BANCADA00002', true)$$, '42501', 'sensor sem vínculo: a preferência não pode ser gravada');
select t.ok(public.gaxeta_link_sensor(:'bf', t.id('bf_pt'), 'suíte 88, de novo') ->> 'measurement_point_id' is not null, 'sensor vinculado de novo ao mesmo spot');
select t.eq(t.bands(:'bf'), 'true', 'vínculo novo começa no padrão (ligadas): a escolha era do vínculo anterior');

-- ---------------------------------------------------------------------------
-- D. Trocar a faixa: idêntica não encerra; diferente encerra e pede novo início
-- ---------------------------------------------------------------------------
select t.login(t.id('uA_campo'));
select public.gaxeta_mag_bench_set_bands(:'bk', false) \g /dev/null
select t.eq((public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80, 180, 1) ->> 'unchanged'), 'true', 'aplicar a MESMA faixa (80°→180°, crescente) devolve unchanged');
select t.eq(t.bench_rows(:'bk'), :'bk_rows', '… e não encerra a bancada nem cria outra configuração');
select t.eq(t.bench_anchor_of(:'bk'), :'bk_anchor', '… e a âncora continua a mesma');
select t.eq(t.bp(:'bk'), '70.29', '… e o percentual continua na tela, sem pedir Confirmar início');
select t.eq((public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80.000, 180.000, 1) ->> 'unchanged'), 'true', 'mesma faixa escrita com casas decimais: também unchanged');
select gen_random_uuid() as bk_req \gset
select t.eq((public.gaxeta_mag_bench_start(:'bk', :'bk_req'::uuid, 180, 80, -1) ->> 'duplicate'), 'false', 'faixa invertida (180° = 0 %, 80° = 100 %, decrescente) é uma troca de verdade');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'state', 'awaiting_start', 'depois da troca efetiva: aguardando Confirmar início');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'percent', null, '… sem percentual até a leitura que confirma (nenhum número inventado)');
select t.eq(t.bands(:'bk'), 'false', 'a preferência de faixas atravessa a troca de extremos (é do vínculo, não da configuração)');
select t.eq((public.gaxeta_mag_bench_start(:'bk', :'bk_req'::uuid, 180, 80, -1) ->> 'duplicate'), 'true', 'reenvio da mesma solicitação (resposta perdida) não duplica');
select t.bench_anchor(:'bk', 150.29) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '29.71', 'faixa invertida confirmada em 150,29°: 29,71 % (o que era 70,29 %)');
select t.eq((public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 180, 80, -1) ->> 'unchanged'), 'true', 'a faixa invertida, repetida, também não encerra nada');
select t.throws($$select public.gaxeta_mag_bench_start('ESP32-BANCADA00001', gen_random_uuid(), 120, 120, 1)$$, '22023', 'extremos iguais são recusados (faixa de 0°)');
select t.eq(t.bp(:'bk'), '29.71', 'a recusa não altera a bancada em uso');
-- Faixa que atravessa 0°: 320° = 0 %, 60° = 100 %, crescente (100° de faixa).
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 320, 60, 1) \g /dev/null
select t.bench_anchor(:'bk', 370) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '50.02', 'faixa que atravessa 0°: 10° do chip (370° contínuos) vale 50,02 % (quantização de 0,088° do chip)');
select t.anon(); select t.ct(:'bk', 440) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'limit'), '100.00|above', 'além do 100 %: teto, com o excesso guardado');
select t.anon(); select t.ct(:'bk', 400) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '79.99', 'volta do teto medida do ponto real: 40° do chip = 79,99 %');
-- Perda de continuidade: sessão nova da placa pede Reposicionar; a preferência não interfere.
select t.anon(); select t.ct(:'bk', 400, '{"session":"bbbb0002","loss":"gap"}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'state', 'reposition', 'sessão da placa mudou: Reposicionar para retomar');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'percent', null, '… sem percentual atual');
select t.eq(t.ms(:'bk') -> 'bench' -> 'last_ok' ->> 'percent', '79.9907', '… e a última posição válida fica à vista, com horário');
select public.gaxeta_mag_bench_set_bands(:'bk', true) \g /dev/null
select t.eq(t.ms(:'bk') -> 'bench' ->> 'state', 'reposition', 'mexer na preferência não "conserta" nem muda o estado');
-- Volta à faixa do piloto para as próximas suítes e para a passada de interface.
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80, 180, 1) \g /dev/null
select t.bench_anchor(:'bk', 147.04, '{"session":"bbbb0002","loss":"gap"}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '67.04', 'de volta a 80°→180°, início confirmado: 67,04 %');
select t.root();
select t.eq((select count(*) from gaxeta_private.mag_movements), :mm0::bigint, 'trocas de faixa e de preferência: nenhum movimento de campo');
select t.eq((select count(*) from gaxeta_private.mag_services), :sv0::bigint, '… nenhuma referência de engaxetamento');
select t.eq((select count(*) from gaxeta_private.mag_maintenance_notes), :nt0::bigint, '… nenhum registro de manutenção');

-- ---------------------------------------------------------------------------
-- E. Fronteiras das faixas: a regra do servidor (mag_band) sobre o valor com duas casas
-- ---------------------------------------------------------------------------
select t.eq((select string_agg(gaxeta_private.mag_band(v), ',' order by i) from unnest(array[0, 29.99, 29.994, 29.995, 30, 49.99, 49.994, 49.995, 50, 72.99, 72.994, 72.995, 73, 100]::numeric[]) with ordinality u(v, i)),
  'none,none,none,low,low,low,low,medium,medium,medium,medium,high,high,high', '0 / 29,99 / 30 / 49,99 / 50 / 72,99 / 73 / 100 e os arredondamentos a duas casas: uma faixa por valor');
select t.eq(gaxeta_private.mag_band(null), null, 'sem dado não há faixa');

-- ---------------------------------------------------------------------------
-- F. Privilégio mínimo e ingestão intocada
-- ---------------------------------------------------------------------------
select t.eq((select count(*) from pg_policies where schemaname = 'gaxeta_private' and tablename = 'mag_bench_prefs'), 0::bigint, 'tabela nova sem política (só as funções chegam a ela)');
select t.eq((select relrowsecurity from pg_class where oid = 'gaxeta_private.mag_bench_prefs'::regclass), true, 'RLS ligada na tabela nova');
select t.ok(not has_function_privilege('anon', 'public.gaxeta_mag_bench_set_bands(text, boolean)', 'execute'), 'função nova fechada para anônimo');
select t.ok(has_function_privilege('authenticated', 'public.gaxeta_mag_bench_set_bands(text, boolean)', 'execute'), 'função nova aberta para usuário autenticado (a autorização é feita dentro dela)');
select t.ok(has_function_privilege('anon', 'public.gaxeta_ingest_v4(text, jsonb)', 'execute'), 'a placa (papel anon) continua podendo enviar');
select t.eq((select count(*) from information_schema.columns where table_schema = 'public' and table_name in ('gaxeta_readings', 'gaxeta_devices') and column_name ~ 'band'), 0::bigint,
  'nenhuma coluna nova nas tabelas da ingestão');
select t.ok((select prosrc !~ 'mag_bench_prefs' from pg_proc where oid = 'public.gaxeta_ingest_v4(text, jsonb)'::regprocedure), 'a ingestão não conhece a tabela de preferências');

commit;
select rpad(suite, 40) || ' ok=' || count(*) filter (where ok) || ' falhas=' || count(*) filter (where not ok) from t.results where suite = current_setting('t.suite') group by suite;
select 'FALHA | ' || name || ' | ' || coalesce(detail, '') from t.results where suite = current_setting('t.suite') and not ok;
