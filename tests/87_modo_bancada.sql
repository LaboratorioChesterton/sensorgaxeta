\set ON_ERROR_STOP 1
-- Migração 15: Modo bancada (posição contínua multivolta), curso típico por TAG e por spot,
-- faixas de ajuste, registro de manutenção sem referência e independência dos históricos.
-- Roda depois da suíte 84/85 e da migração 15. As leituras entram pela rota real de ingestão.
-- SIMULAÇÃO em banco local: nenhum ângulo aqui veio de sensor físico. Nada toca produção.
select set_config('t.suite', '87 modo bancada, curso e faixas', false);
-- A suíte inteira roda numa transação: o papel escolhido (t.login, t.anon, t.root) vale até a
-- troca seguinte. Os horários das leituras vêm de clock_timestamp(), que avança dentro dela.
begin;
create or replace function t.root() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'none', true);
end $$;
grant execute on function t.root() to public;

\set bk 'ESP32-BANCADA00001'
\set bf 'ESP32-BANCADA00002'

-- Leitura do firmware 4.5.0: posição CONTÍNUA em graus no referencial do chip (pode passar de 360
-- ou ficar negativa). Opções: session, origin (bruto na origem da sessão), boot, seq, pp, age,
-- loss, step, gap, mag, bus, capture, nosession (placa sem contagem agora), fw44 (pacote do 4.4.0,
-- sem nenhum campo ct_*), extra.
create or replace function t.ct(p_sensor text, p_cont numeric, p_opts jsonb default '{}') returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare v_boot text := coalesce(p_opts ->> 'boot', md5(p_sensor || 'ct')); v_seq bigint; v_now timestamptz := clock_timestamp(); v jsonb;
        v_bus text := coalesce(p_opts ->> 'bus', 'ok'); v_mag text; v_origin integer := coalesce((p_opts ->> 'origin')::integer, 1479);
        v_abs bigint := round(p_cont * 4096 / 360.0); v_raw integer; v_valid boolean;
begin
  update public.gaxeta_devices set last_received_at = last_received_at - interval '2 seconds' where sensor_id = p_sensor;
  v_seq := coalesce((p_opts ->> 'seq')::bigint, (select coalesce(max(sequence), 0) + 1 from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot));
  v_mag := case when v_bus = 'ok' then coalesce(p_opts ->> 'mag', 'ok') end;
  v_valid := v_bus = 'ok' and v_mag = 'ok';
  v_raw := ((v_abs % 4096) + 4096) % 4096;
  v := jsonb_build_object('schema_version', 4, 'modality', 'as5600_i2c', 'sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', v_seq,
    'origin', 'esp32', 'raw_angle', case when v_bus = 'ok' and v_mag <> 'no_magnet' then v_raw end,
    'angle_pp', case when v_bus = 'ok' and v_mag <> 'no_magnet' then coalesce((p_opts ->> 'pp')::int, 1) end,
    'mag_status', v_mag, 'bus_status', v_bus, 'agc', case when v_bus = 'ok' then 64 end, 'magnitude', case when v_bus = 'ok' then 2100 end,
    'rssi', -52, 'uptime_ms', v_seq * 30000, 'send_period_s', 30, 'firmware_version', case when p_opts ? 'fw44' then '4.4.0-cont30' else '4.5.0-cont30' end,
    'acq_method', case when p_opts ? 'fw44' then 'as5600-i2c-n20-circ' else 'as5600-i2c-n20-circ-ct5' end,
    'sampled_at', to_char((v_now - make_interval(secs => coalesce((p_opts ->> 'age')::numeric, 0))) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  if not (p_opts ? 'fw44') then
    v := v || jsonb_build_object('ct_period_ms', 5, 'ct_gap_limit_ms', 100, 'ct_loss', coalesce(p_opts ->> 'loss', 'boot'),
      'ct_step', coalesce((p_opts ->> 'step')::int, 12), 'ct_gap_ms', coalesce((p_opts ->> 'gap')::int, 6), 'ct_samples', 6000);
    if v_valid and not (p_opts ? 'nosession') then
      v := v || jsonb_build_object('ct_session', coalesce(p_opts ->> 'session', 'aaaa0001'), 'ct_count', v_abs - v_origin, 'ct_origin', v_origin, 'ct_raw', v_raw);
    else
      v := v || jsonb_build_object('ct_session', null);
    end if;
  end if;
  if p_opts ? 'capture' then v := v || jsonb_build_object('capture', p_opts ->> 'capture'); end if;
  if p_opts ? 'extra' then v := v || (p_opts -> 'extra'); end if;
  return public.gaxeta_ingest_v4('dev-token-0123456789abcdef0123456789abcdef', v);
end $$;
grant execute on function t.ct(text, numeric, jsonb) to public;
-- Faz o toque em "Confirmar início" parecer ter ocorrido há p_secs segundos.
create or replace function t.bench_ago(p_sensor text, p_secs numeric) returns void language sql security definer set search_path to '' as $$
  update gaxeta_private.mag_bench_modes set anchor_requested_at = anchor_requested_at - make_interval(secs => p_secs)
   where sensor_id = p_sensor and status = 'active' and anchor_status = 'pending' $$;
grant execute on function t.bench_ago(text, numeric) to public;
create or replace function t.bench_rows(p_sensor text) returns text language sql security definer set search_path to '' as $$
  select string_agg(status || ':' || anchor_status || coalesce(':' || end_reason, ''), ',' order by id) from gaxeta_private.mag_bench_modes where sensor_id = p_sensor $$;
grant execute on function t.bench_rows(text) to public;
-- Posição de bancada da leitura atual, como a interface recebe (texto com duas casas, ou o estado).
create or replace function t.bp(p_sensor text) returns text language sql as $$
  select coalesce(to_char((t.ms(p_sensor) -> 'bench' ->> 'percent')::numeric, 'FM990.00'), t.ms(p_sensor) -> 'bench' ->> 'state', 'sem bancada') $$;
create or replace function t.near(p_got numeric, p_want numeric, p_tol numeric, p_name text) returns text language sql as $$
  select t.log(abs(p_got - p_want) <= p_tol, p_name, 'obtido=' || coalesce(p_got::text, 'NULL') || ' esperado=' || p_want || ' ±' || p_tol) $$;
-- Confirma o início e entrega a leitura que o ancora (eixo parado na posição contínua indicada).
-- Termina com o papel anônimo (o da placa).
create or replace function t.bench_anchor(p_sensor text, p_cont numeric, p_opts jsonb default '{}') returns jsonb language plpgsql as $$
begin
  perform t.login(t.id('uA_campo'));
  perform public.gaxeta_mag_bench_confirm(p_sensor, gen_random_uuid());
  perform t.bench_ago(p_sensor, 10);
  perform t.anon();
  return t.ct(p_sensor, p_cont, p_opts);
end $$;
grant execute on function t.bench_anchor(text, numeric, jsonb) to public;

select (select count(*) from gaxeta_private.mag_movements) as mm0, (select count(*) from gaxeta_private.mag_services) as sv0,
       (select count(*) from public.gaxeta_movements) as mv0 \gset

-- ---------------------------------------------------------------------------
-- A. Compatibilidade: firmware 4.4.0 e 4.5.0 na mesma rota
-- ---------------------------------------------------------------------------
select t.anon();
select t.ok((t.ct(:'bk', 130, '{"fw44":true}') ->> 'ok')::boolean, 'pacote do firmware 4.4.0 (sem ct_*) continua aceito depois da migração 15');
select t.root();
select t.eq((select ct_session is null and ct_count is null and ct_loss is null and bench_id is null from public.gaxeta_readings where sensor_id = :'bk' order by id desc limit 1), true,
  'leitura do 4.4.0: contagem contínua e bancada nulas (nenhum zero fictício)');
select t.anon();
select t.ok((t.ct(:'bk', 130) ->> 'ok')::boolean, 'pacote do firmware 4.5.0 com contagem contínua aceito');
select t.root();
select t.eq((select ct_session || '|' || ct_count || '|' || ct_origin || '|' || ct_loss || '|' || ct_step || '|' || ct_gap_ms from public.gaxeta_readings where sensor_id = :'bk' order by id desc limit 1),
  'aaaa0001|0|1479|boot|12|6', 'sessão, contagem, origem, motivo, maior passo e maior lacuna gravados na leitura');
select t.anon();
select t.throws($$select t.ct('ESP32-BANCADA00001', 130, '{"session":"XYZ"}')$$, '22023', 'sessão fora do formato é recusada');
select t.throws($$select t.ct('ESP32-BANCADA00001', 130, '{"loss":"qualquer"}')$$, '22023', 'motivo de sessão desconhecido é recusado');
select t.throws($$select t.ct('ESP32-BANCADA00001', 130, '{"extra":{"ct_count":1.5}}')$$, '22023', 'contagem não inteira é recusada');
select t.ok((t.ct(:'bk', 131, '{"extra":{"ct_raw":7}}') ->> 'ok')::boolean, 'pacote incoerente (origem + contagem ≠ última amostra): a leitura do ângulo entra');
select t.root();
select t.eq((select coalesce(ct_session, 'nula') || '|' || ct_loss || '|' || raw_angle from public.gaxeta_readings where sensor_id = :'bk' order by id desc limit 1),
  'nula|incoherent|1490', '… mas a contagem daquele pacote não é usada (ct_loss = incoherent)');

-- Árvore do caso de aceitação: TAG L2-956, spot UNICO.
select t.login(t.id('adm1'));
select t.put('bk_eq', public.gaxeta_save_asset(null, t.id('A1_cald'), 'equipment', 'L2-956', 'L2-956', '') ->> 'id');
select t.put('bk_pt', public.gaxeta_save_asset(null, t.id('bk_eq'), 'point', 'UNICO', '', '') ->> 'id');
select t.put('bk_pt2', public.gaxeta_save_asset(null, t.id('bk_eq'), 'point', 'LOA', '', '') ->> 'id');
select t.ok(public.gaxeta_link_sensor(:'bk', t.id('bk_pt'), 'suíte 87') ->> 'measurement_point_id' is not null, 'sensor vinculado ao spot UNICO do L2-956');
select t.anon(); select t.ct(:'bk', 130) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') ->> 'reason', 'no_geometry', 'vinculado, sem geometria e sem bancada: motivo no_geometry (nenhum percentual)');
select t.eq(t.ms(:'bk') -> 'bench', 'null'::jsonb, 'sem Modo bancada o resumo não traz bancada');
select t.eq(t.ms(:'bk') -> 'reading' -> 'ct' ->> 'continuous_deg', '129.990', 'resumo traz a posição contínua da leitura (origem + contagem)');

-- ---------------------------------------------------------------------------
-- B. Prévia e ativação
-- ---------------------------------------------------------------------------
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 80, 180, 1) ->> 'span_deg', '100.000', 'prévia: 80° = 0 % e 180° = 100 %, crescente: faixa de 100°');
select t.eq((public.gaxeta_mag_bench_preview(:'bk', 80, 180, 1) -> 'current' ->> 'inside') || '|' || (public.gaxeta_mag_bench_preview(:'bk', 80, 180, 1) -> 'current' ->> 'percent'),
  'true|49.99', 'prévia: a leitura atual (130°) está dentro da faixa e valeria 49,99 %');
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 80, 180, 1) -> 'marks' -> 2 ->> 'angle_deg', '130.000', 'prévia: 50 % em 130°');
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 350, 250, -1) -> 'marks' -> 2 ->> 'angle_deg', '300.000', 'prévia com sentido decrescente: 50 % em 300°');
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 320, 60, 1) -> 'marks' -> 4 ->> 'angle_deg', '60.000', 'prévia de faixa que cruza o zero do chip: 100 % em 60°');
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 200, 250, 1) -> 'current' ->> 'inside', 'false', 'prévia avisa quando a leitura atual está fora da faixa');
select t.throws($$select public.gaxeta_mag_bench_preview('ESP32-BANCADA00001', 80, 82, 1)$$, '22023', 'faixa menor que 5° é recusada');
select t.throws($$select public.gaxeta_mag_bench_preview('ESP32-BANCADA00001', 80, 79, 1)$$, '22023', 'faixa maior que 355° é recusada');
select t.throws($$select public.gaxeta_mag_bench_preview('ESP32-BANCADA00001', 80, 180, 0)$$, '22023', 'sentido inválido é recusado');
select t.throws($$select public.gaxeta_mag_bench_preview('ESP32-BANCADA00001', 80, 360, 1)$$, '22023', 'ângulo de 360° é recusado (0 a 359,999)');
select t.eq(t.bench_rows(:'bk'), null, 'a prévia não grava nada');
select t.login(t.id('uA_all'));
select t.throws($$select public.gaxeta_mag_bench_preview('ESP32-BANCADA00001', 80, 180, 1)$$, '42501', 'conta de consulta não configura o Modo bancada');
select t.throws($$select public.gaxeta_mag_bench_start('ESP32-BANCADA00001', gen_random_uuid(), 80, 180, 1)$$, '42501', 'conta de consulta não liga o Modo bancada');
select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_mag_bench_start('ESP32-BANCADA00001', gen_random_uuid(), 80, 180, 1)$$, '42501', 'conta de outra corporação não liga o Modo bancada');
select t.anon();
select t.throws($$select public.gaxeta_mag_bench_start('ESP32-BANCADA00001', gen_random_uuid(), 80, 180, 1)$$, '42501', 'anônimo não executa as funções de bancada');

select t.login(t.id('uA_campo'));
select t.put('b_req1', gen_random_uuid()::text);
select t.eq(public.gaxeta_mag_bench_start(:'bk', t.id('b_req1'), 80, 180, 1) ->> 'duplicate', 'false', 'operador do ramo liga o Modo bancada (80° → 180°, crescente)');
select t.eq(public.gaxeta_mag_bench_start(:'bk', t.id('b_req1'), 80, 180, 1) ->> 'duplicate', 'true', 'toque duplo com o mesmo identificador devolve a mesma ativação');
select t.throws(format($$select public.gaxeta_mag_bench_start('ESP32-BANCADA00001', %L, 90, 180, 1)$$, t.id('b_req1')), 'PT409', 'mesmo identificador com outra faixa é recusado');
select t.eq(t.bench_rows(:'bk'), 'active:none', 'uma única configuração ativa, início ainda não confirmado');
select t.eq(t.ms(:'bk') ->> 'reason', 'bench_awaiting_start', 'ativo e sem confirmação: motivo bench_awaiting_start');
select t.eq(t.bp(:'bk'), 'awaiting_start', 'sem confirmação não há percentual (nem 0 %)');
select t.anon(); select t.ct(:'bk', 146.95) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), 'awaiting_start', 'leitura nova antes de confirmar o início: continua sem percentual');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-BANCADA00001', gen_random_uuid(), 20, 'estimated')$$, 'PT409', 'com o Modo bancada ativo o engaxetamento de campo é recusado');

-- ---------------------------------------------------------------------------
-- C. Confirmar início: origem inequívoca, dentro da faixa
-- ---------------------------------------------------------------------------
select t.put('b_cf1', gen_random_uuid()::text);
select t.eq(public.gaxeta_mag_bench_confirm(:'bk', t.id('b_cf1')) ->> 'anchor_status', 'pending', 'Confirmar início: aguardando a próxima leitura');
select t.eq(public.gaxeta_mag_bench_confirm(:'bk', t.id('b_cf1')) ->> 'duplicate', 'true', 'toque duplo na confirmação devolve a mesma solicitação');
select t.throws($$select public.gaxeta_mag_bench_confirm('ESP32-BANCADA00001', gen_random_uuid())$$, 'PT409', 'segunda confirmação enquanto a primeira aguarda é recusada');
select t.anon();
select t.eq(t.ct(:'bk', 130, '{"age":20}') ->> 'bench_state', 'pending', 'amostra colhida ANTES do toque não vira referência (resposta à placa: pending)');
select t.root(); select t.bench_ago(:'bk', 10);
select t.anon();
select t.ok(t.ct(:'bk', 300) ->> 'capture' is not null, 'eixo FORA da faixa (300°): a confirmação segue aguardando e a placa recebe o identificador de captura');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'anchor_note', 'outside_range', '… com o motivo: fora da faixa');
select t.anon(); select t.ct(:'bk', 130, '{"pp":40}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'anchor_note', 'moving', 'eixo em movimento (bloco disperso): não confirma, motivo moving');
select t.anon(); select t.ct(:'bk', 130, '{"mag":"no_magnet"}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'anchor_note', 'invalid_sample', 'ímã ausente durante a espera: não confirma');
select t.anon(); select t.ct(:'bk', 130, '{"fw44":true}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'anchor_note', 'no_continuity', 'firmware sem contagem contínua: não confirma, motivo no_continuity');
select t.anon();
select t.eq(t.ct(:'bk', 130) ->> 'bench_state', 'ok', 'eixo parado em 130°, dentro da faixa: início confirmado na primeira leitura nova, válida e estável');
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '49.99', 'início em 130°: Posição de bancada 49,99 % (130° cai em 129,99° pela resolução de 12 bits)');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'anchor_status', 'set', 'âncora registrada');
select t.eq(t.ms(:'bk') ->> 'reason', 'bench', 'motivo passa a ser bench (número de bancada, não de campo)');

-- A tabela do pedido, partindo de 130° e girando em passos rastreáveis.
select t.anon();
select t.near((t.ct(:'bk', 80) ->> 'ok')::boolean::int, 1, 0, '80°: leitura aceita');
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 0, 0.05, '80° → 0 %');
select t.anon(); select t.ct(:'bk', 119.44) \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 39.44, 0.09, '119,44° → 39,44 %');
select t.anon(); select t.ct(:'bk', 146.95) \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 66.95, 0.09, '146,95° → 66,95 %');
select t.anon(); select t.ct(:'bk', 180.1) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk'), '100.00', '180° → 100 %');
select t.anon(); select t.ct(:'bk', 350) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'limit'), '100.00|above', '350°: continua em 100 %, marcado como acima do teto');
select t.near((t.ms(:'bk') -> 'bench' ->> 'over_deg')::numeric, 170, 0.1, '350°: 170° além do teto ficam guardados');
select t.anon(); select t.ct(:'bk', 370) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'turns'), '100.00|1', '370° (cruzou o zero): continua em 100 %, uma volta contada');
select t.near((t.ms(:'bk') -> 'reading' ->> 'angle_deg')::numeric, 10, 0.1, '… enquanto o chip mostra 10°');
select t.near((t.ms(:'bk') -> 'bench' ->> 'continuous_deg')::numeric, 370, 0.1, '… e a posição contínua é 370°');
select t.anon(); select t.ct(:'bk', 350) \g /dev/null
select t.login(t.id('uA_campo')); select t.eq(t.bp(:'bk'), '100.00', '370° → 350°: 100 %');
select t.anon(); select t.ct(:'bk', 190) \g /dev/null
select t.login(t.id('uA_campo')); select t.eq(t.bp(:'bk'), '100.00', '350° → 190°: 100 %');
select t.anon(); select t.ct(:'bk', 175) \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 95, 0.09, '190° → 175°: 95 %');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'limit', null, '… já dentro da faixa, sem marca de extremo');
select t.anon(); select t.ct(:'bk', 80) \g /dev/null
select t.ct(:'bk', 70) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'limit'), '0.00|below', '80° → 70°: 0 %, marcado como abaixo do piso');
select t.near((t.ms(:'bk') -> 'bench' ->> 'over_deg')::numeric, -10, 0.1, '70°: 10° abaixo do piso ficam guardados');
select t.anon(); select t.ct(:'bk', 75) \g /dev/null
select t.login(t.id('uA_campo')); select t.eq(t.bp(:'bk'), '0.00', '70° → 75°: ainda 0 %');
select t.anon(); select t.ct(:'bk', 85) \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 5, 0.09, '75° → 85°: 5 %');
-- Várias voltas, nos dois sentidos, sem perder a posição.
select t.anon(); select t.ct(:'bk', 85 + 5 * 360) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'turns'), '100.00|5', 'cinco voltas adiante: 100 %, cinco voltas contadas');
select t.anon(); select t.ct(:'bk', 85 - 3 * 360) \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.bp(:'bk') || '|' || (t.ms(:'bk') -> 'bench' ->> 'turns'), '0.00|-3', 'oito voltas de retorno: 0 %, três voltas negativas');
select t.anon(); select t.ct(:'bk', 146.95) \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 66.95, 0.09, 'de volta a 146,95°: 66,95 % outra vez (as voltas não se perdem)');

-- ---------------------------------------------------------------------------
-- D. Transporte: reenvio, fora de ordem, duas sessões do navegador
-- ---------------------------------------------------------------------------
select t.root();
select (select sequence from public.gaxeta_readings where sensor_id = :'bk' order by id desc limit 1) as last_seq \gset
-- A placa pulou uma sequência (pacote ainda na fila): o seguinte chega primeiro.
select t.anon(); select t.ct(:'bk', 146.95, format('{"seq":%s}', :last_seq + 2)::jsonb) \g /dev/null
select t.root();
select (select count(*) from public.gaxeta_readings where sensor_id = :'bk') as n_before \gset
select t.anon();
select t.eq(t.ct(:'bk', 146.95, format('{"seq":%s}', :last_seq + 2)::jsonb) ->> 'duplicate', 'true', 'reenvio do mesmo pacote: resposta duplicate');
select t.eq(t.ct(:'bk', 999, format('{"seq":%s}', :last_seq + 2)::jsonb) ->> 'duplicate', 'true', 'mesma sequência com outro conteúdo: também duplicate (a primeira vale)');
select t.root();
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'bk'), :n_before::bigint, 'reenvio não cria linha');
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 66.95, 0.09, 'reenvio não soma nada: a posição continua 66,95 %');
select t.anon();
select t.eq(t.ct(:'bk', 100, format('{"seq":%s}', :last_seq + 1)::jsonb) ->> 'duplicate', 'false', 'pacote atrasado (sequência anterior do mesmo boot) entra no histórico');
select t.root();
select t.eq((select bench_state is null and bench_percent is null from public.gaxeta_readings where sensor_id = :'bk' and boot_id = md5('ESP32-BANCADA00001ct') and sequence = :last_seq + 1), true,
  'pacote fora de ordem não recebe posição de bancada');
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 66.95, 0.09, 'pacote fora de ordem não muda a leitura atual');
select (t.ms(:'bk') -> 'bench')::text as tab1 \gset
select t.login(t.id('adm1'));
select t.eq(((t.ms(:'bk') -> 'bench') - 'mine' - 'pending')::text, (:'tab1'::jsonb - 'mine' - 'pending')::text, 'duas sessões (operador e ADM 1) recebem exatamente o mesmo resultado');
select t.login(t.id('uA_all'));
select t.eq((t.ms(:'bk') -> 'bench' ->> 'percent'), (:'tab1'::jsonb ->> 'percent'), 'a conta de consulta vê o mesmo número');
select t.eq(t.ms(:'bk') ->> 'can_operate', 'false', '… sem poder operar');

-- ---------------------------------------------------------------------------
-- E. Perda de continuidade: "Reposicionar para retomar", nunca 0 %
-- ---------------------------------------------------------------------------
select t.anon(); select t.ct(:'bk', 146.95, '{"mag":"no_magnet","loss":"no_magnet"}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') ->> 'reason', 'no_magnet', 'ímã ausente: o motivo exibido é ímã ausente');
select t.eq((t.ms(:'bk') -> 'bench' ->> 'state') || '|' || (t.ms(:'bk') -> 'bench' ->> 'anchor_status') || '|' || (t.ms(:'bk') -> 'bench' ->> 'lost_reason'),
  'reposition|lost|no_magnet', '… e a bancada fica em reposicionar, com o motivo guardado');
select t.eq(t.ms(:'bk') -> 'bench' ->> 'percent', null, 'sem percentual: nenhum 0 % no lugar da leitura');
select t.near((t.ms(:'bk') -> 'bench' -> 'last_ok' ->> 'percent')::numeric, 66.95, 0.09, 'a última leitura boa (66,95 %) fica preservada');
select t.ok((t.ms(:'bk') -> 'bench' -> 'last_ok' ->> 'at') is not null, '… com o horário');
select t.anon();
select t.eq(t.ct(:'bk', 146.95, '{"session":"bbbb0002","origin":1672,"loss":"no_magnet"}') ->> 'bench_state', 'reposition',
  'ímã de volta NO MESMO ângulo, sessão nova: reposicionar (a posição não é reaproveitada)');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') ->> 'reason', 'bench_reposition', 'motivo bench_reposition');
select t.eq(t.bp(:'bk'), 'reposition', 'sem percentual até nova referência');
select t.anon();
select t.eq(t.bench_anchor(:'bk', 119.44, '{"session":"bbbb0002","origin":1672}') ->> 'bench_state', 'ok', 'Reposicionar para retomar: eixo em 119,44°, confirmação nova na sessão vigente');
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 39.44, 0.09, 'retomado: 39,44 %');
-- Reinício da placa (boot novo, sessão nova).
select t.anon();
select t.eq(t.ct(:'bk', 119.44, '{"boot":"cccccccccccccccc0000000000000003","session":"cccc0003","origin":1359,"loss":"boot"}') ->> 'bench_state', 'reposition', 'reinício da placa (retorno de energia): reposicionar');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'lost_reason', 'boot', 'motivo guardado: boot');
select t.anon();
select t.bench_anchor(:'bk', 119.44, '{"boot":"cccccccccccccccc0000000000000003","session":"cccc0003","origin":1359}') \g /dev/null
-- Lacuna de aquisição, velocidade acima da garantida e meia volta ambígua, detectadas pela placa.
select t.eq(t.ct(:'bk', 125, '{"boot":"cccccccccccccccc0000000000000003","session":"dddd0004","origin":1422,"loss":"gap","gap":131}') ->> 'bench_state', 'reposition', 'lacuna acima do limite (sessão nova, motivo gap): reposicionar');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'bench' ->> 'lost_reason', 'gap', 'motivo guardado: gap');
select t.eq(t.ms(:'bk') -> 'reading' -> 'ct' ->> 'gap_ms', '131', 'a maior lacuna medida acompanha a leitura');
select t.anon();
select t.bench_anchor(:'bk', 125, '{"boot":"cccccccccccccccc0000000000000003","session":"dddd0004","origin":1422}') \g /dev/null
select t.eq(t.ct(:'bk', 140, '{"boot":"cccccccccccccccc0000000000000003","session":"eeee0005","origin":1593,"loss":"speed","step":1300}') ->> 'bench_state', 'reposition', 'rotação além da velocidade garantida (motivo speed): reposicionar');
select t.bench_anchor(:'bk', 140, '{"boot":"cccccccccccccccc0000000000000003","session":"eeee0005","origin":1593}') \g /dev/null
select t.eq(t.ct(:'bk', 150, '{"boot":"cccccccccccccccc0000000000000003","session":"ffff0006","origin":1707,"loss":"ambiguous"}') ->> 'bench_state', 'reposition', 'meia volta ambígua (motivo ambiguous): reposicionar');
select t.bench_anchor(:'bk', 150, '{"boot":"cccccccccccccccc0000000000000003","session":"ffff0006","origin":1707}') \g /dev/null
select t.eq(t.ct(:'bk', 151, '{"boot":"cccccccccccccccc0000000000000003","session":"ffff0006","origin":1707,"extra":{"ct_raw":9}}') ->> 'bench_state', 'reposition', 'pacote incoerente durante a bancada: reposicionar (não confia na contagem)');
select t.bench_anchor(:'bk', 151, '{"boot":"cccccccccccccccc0000000000000003","session":"ffff0006","origin":1707}') \g /dev/null
select t.eq(t.ct(:'bk', 151, '{"boot":"cccccccccccccccc0000000000000003","bus":"no_ack","loss":"bus"}') ->> 'bench_state', 'reposition', 'falha de I²C: reposicionar');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') ->> 'reason', 'bus_no_ack', '… e o motivo exibido é a falha de barramento');
-- Firmware antigo no meio do ensaio: sem contagem, sem número, sem perder a âncora.
select t.anon();
select t.bench_anchor(:'bk', 160, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0007","origin":1820}') \g /dev/null
select t.eq(t.ct(:'bk', 160, '{"boot":"cccccccccccccccc0000000000000003","fw44":true}') ->> 'bench_state', 'no_continuity', 'pacote sem contagem (firmware 4.4.0) com a bancada ativa: sem número, estado no_continuity');
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') ->> 'reason', 'bench_no_continuity', 'motivo bench_no_continuity');
-- Confirmação que vence sem leitura válida.
select public.gaxeta_mag_bench_confirm(:'bk', gen_random_uuid()) \g /dev/null
select t.root();
update gaxeta_private.mag_bench_modes set anchor_expires_at = clock_timestamp() - interval '1 second' where sensor_id = :'bk' and status = 'active';
select t.anon(); select t.ct(:'bk', 160, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0007","origin":1820}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'bk') -> 'bench' ->> 'anchor_status') || '|' || (t.ms(:'bk') -> 'bench' ->> 'anchor_note'), 'none|expired', 'confirmação vencida volta a "início não confirmado", com o motivo');

-- ---------------------------------------------------------------------------
-- F. Outros extremos: sentido invertido e faixa que cruza o zero
-- ---------------------------------------------------------------------------
select t.eq(public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 350, 250, -1) ->> 'span_deg', '100.000', 'troca de extremos: 350° = 0 %, 250° = 100 %, decrescente');
select t.eq(t.bench_rows(:'bk'), 'ended:none:reconfigured,active:none', 'a configuração anterior é encerrada (versionada por período) e a nova começa');
select t.anon();
select t.bench_anchor(:'bk', 300, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0008","origin":3413}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 50, 0.09, 'sentido invertido: 300° entre 350° e 250° = 50 %');
select t.anon(); select t.ct(:'bk', 260, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0008","origin":3413}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 90, 0.09, 'sentido invertido: 260° → 90 %');
select t.anon(); select t.ct(:'bk', 240, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0008","origin":3413}') \g /dev/null
select t.login(t.id('uA_campo')); select t.eq(t.bp(:'bk'), '100.00', 'sentido invertido: 240° → 100 % (passou do teto)');
select t.anon(); select t.ct(:'bk', 355, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0008","origin":3413}') \g /dev/null
select t.login(t.id('uA_campo')); select t.eq(t.bp(:'bk'), '0.00', 'sentido invertido: 355° → 0 % (abaixo do piso)');
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 320, 60, 1) \g /dev/null
select t.anon();
select t.bench_anchor(:'bk', 359, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 39, 0.09, 'referência perto de 359° numa faixa 320° → 60°: 39 %');
select t.anon(); select t.ct(:'bk', 380, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'bench' ->> 'percent')::numeric, 60, 0.09, '… 21° adiante (chip em 20°): 60 %, sem salto na passagem pelo zero');

-- ---------------------------------------------------------------------------
-- G. Independência dos históricos
-- ---------------------------------------------------------------------------
select t.root();
select t.eq((select count(*) from gaxeta_private.mag_movements), :mm0::bigint, 'bancada não criou nenhuma mudança de 5 p.p. de campo');
select t.eq((select count(*) from gaxeta_private.mag_services), :sv0::bigint, 'bancada não criou nenhuma referência de engaxetamento');
select t.eq((select count(*) from public.gaxeta_movements), :mv0::bigint, 'bancada não criou nenhum movimento elétrico');
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'bk' and (remaining_percent is not null or service_id is not null)), 0::bigint,
  'nenhuma leitura de bancada recebeu curso restante');
select t.login(t.id('uA_campo'));
select t.ok(jsonb_array_length(public.gaxeta_mag_history(:'bk', now() - interval '1 hour', now() + interval '10 minutes') -> 'benches') = 3, 'histórico traz os três períodos de bancada (configuração por período)');
select t.ok((select count(*) from jsonb_array_elements(public.gaxeta_mag_history(:'bk', now() - interval '1 hour', now() + interval '10 minutes') -> 'history') h where h ->> 'bench_percent' is not null) >= 1,
  'histórico traz a Posição de bancada (%) por intervalo');
select t.eq(jsonb_array_length(public.gaxeta_mag_history(:'bk', now() - interval '1 hour', now() + interval '10 minutes') -> 'movements'), 0, 'histórico de bancada sem mudanças de campo');
select t.ok((select bool_and(h ->> 'remaining_percent' is null) from jsonb_array_elements(public.gaxeta_mag_history(:'bk', now() - interval '1 hour', now() + interval '10 minutes') -> 'history') h),
  'nenhum intervalo de bancada aparece como curso restante');
-- Sensores elétricos antigos continuam aparecendo, sem campo magnético.
select t.login(t.id('adm1'));
select (select sensor_id from public.gaxeta_devices where origin = 'esp32' and last_modality is distinct from 'as5600_i2c' and last_percent is not null order by sensor_id limit 1) as pot_id \gset
select t.ok((public.gaxeta_telemetry_summary(array[:'pot_id']) -> 'items' -> 0 ->> 'percent') is not null, 'sensor elétrico (potenciômetro) continua com a posição elétrica no resumo de telemetria');
select t.eq(jsonb_array_length(public.gaxeta_mag_summary(array[:'pot_id']) -> 'items'), 0, '… e não aparece no resumo magnético');

-- Sair do Modo bancada.
select t.login(t.id('uA_all'));
select t.throws($$select public.gaxeta_mag_bench_stop('ESP32-BANCADA00001')$$, '42501', 'conta de consulta não desliga o Modo bancada');
select t.login(t.id('uA_campo'));
select t.eq(public.gaxeta_mag_bench_stop(:'bk') ->> 'changed', 'true', 'operador sai do Modo bancada');
select t.eq(public.gaxeta_mag_bench_stop(:'bk') ->> 'changed', 'false', 'sair de novo não altera nada');
select t.eq(t.ms(:'bk') ->> 'reason', 'no_geometry', 'fora da bancada o spot volta ao estado de campo (sem geometria)');
select t.anon(); select coalesce(t.ct(:'bk', 100, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') ->> 'bench_state', '') as after_stop \gset
select t.root();
select t.eq(:'after_stop'::text, ''::text, 'leitura depois de sair: a resposta à placa não traz estado de bancada');
select t.eq((select bench_id is null from public.gaxeta_readings where sensor_id = :'bk' order by id desc limit 1), true, '… e a leitura não pertence a nenhuma bancada');

-- Desvincular com a bancada ativa e associar a outro spot.
select t.login(t.id('uA_campo'));
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80, 180, 1) \g /dev/null
select t.login(t.id('adm1'));
select (select count(*) from public.gaxeta_readings where sensor_id = :'bk') as n_unlink \gset
select t.ok(public.gaxeta_unlink_sensor(:'bk', 'suíte 87') ->> 'measurement_point_id' is null, 'ADM desvincula o sensor: volta à fila');
select t.root();
select t.ok(t.bench_rows(:'bk') like '%,ended:none:link_closed', 'desvincular encerra o Modo bancada do vínculo');
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'bk'), :n_unlink::bigint, 'desvincular preserva todas as leituras');
select t.login(t.id('adm1'));
select t.eq(t.ms(:'bk') ->> 'reason', 'no_link', 'sem vínculo: ângulo absoluto, sem bancada e sem curso');
select t.ok(public.gaxeta_link_sensor(:'bk', t.id('bk_pt2'), 'suíte 87, outro spot') ->> 'measurement_point_id' = t.id('bk_pt2')::text, 'o mesmo sensor é associado a outro spot (LOA)');
select t.anon(); select t.ct(:'bk', 100, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('adm1'));
select t.eq(t.ms(:'bk') -> 'bench', 'null'::jsonb, 'o novo vínculo não herda a bancada do anterior');
select t.ok((public.gaxeta_mag_history(:'bk', now() - interval '1 hour', now() + interval '10 minutes') -> 'stats' ->> 'count')::int >= :n_unlink, 'o histórico anterior continua consultável depois da transferência');

-- ---------------------------------------------------------------------------
-- H. Curso disponível típico: TAG, exceção no spot, origem do valor
-- ---------------------------------------------------------------------------
select t.login(t.id('uA_campo'));
select t.eq(public.gaxeta_mag_asset_setup(t.id('bk_eq')) ->> 'can_edit_course', 'true', 'quem edita o TAG pode cadastrar o curso típico');
select t.eq(public.gaxeta_mag_asset_setup(t.id('bk_eq')) ->> 'can_edit_geometry', 'false', '… mas não a revisão da montagem (engenharia)');
select t.eq(public.gaxeta_mag_set_equipment_defaults(t.id('bk_eq'), null, 20, null) ->> 'suggested_course_mm', '20.00', 'curso típico de 20 mm no TAG, sem porte (metadado opcional)');
select t.eq(string_agg((public.gaxeta_mag_set_equipment_defaults(t.id('bk_eq'), null, v, null) ->> 'suggested_course_mm'), ',' order by v), '2.00,5.00,15.00,20.00,150.00',
  'aplicações de 2, 5, 15, 20 e 150 mm aceitas') from unnest(array[2, 5, 15, 20, 150]::numeric[]) v;
select t.throws(format($$select public.gaxeta_mag_set_equipment_defaults(%L, null, 0, null)$$, t.id('bk_eq')), '23514', 'curso zero é recusado');
select t.throws(format($$select public.gaxeta_mag_set_equipment_defaults(%L, null, -5, null)$$, t.id('bk_eq')), '23514', 'curso negativo é recusado');
select t.throws(format($$select public.gaxeta_mag_set_equipment_defaults(%L, null, 1000.5, null)$$, t.id('bk_eq')), '23514', 'curso acima de 1000 mm é recusado');
select public.gaxeta_mag_set_equipment_defaults(t.id('bk_eq'), 'medium', 20, null) \g /dev/null
select t.eq((public.gaxeta_mag_asset_setup(t.id('bk_pt')) -> 'effective' ->> 'suggested_course_mm') || '|' || (public.gaxeta_mag_asset_setup(t.id('bk_pt')) -> 'effective' ->> 'course_source'),
  '20.00|equipment', 'spot sem valor próprio herda os 20 mm do TAG, com a origem informada');
select t.eq(public.gaxeta_mag_set_point_course(t.id('bk_pt'), 15.5) ->> 'suggested_course_mm', '15.50', 'exceção no spot: 15,5 mm (decimal)');
select t.eq((public.gaxeta_mag_asset_setup(t.id('bk_pt')) -> 'effective' ->> 'course_source') || '|' || (public.gaxeta_mag_asset_setup(t.id('bk_pt')) -> 'own' ->> 'suggested_course_mm')
  || '|' || (public.gaxeta_mag_asset_setup(t.id('bk_pt')) -> 'tag' ->> 'suggested_course_mm'), 'point|15.50|20.00', 'o formulário do spot mostra o valor próprio e o do TAG');
select t.eq((public.gaxeta_mag_asset_setup(t.id('bk_pt2')) -> 'effective' ->> 'suggested_course_mm'), '20.00', 'o outro spot do mesmo TAG continua herdando 20 mm');
select t.throws(format($$select public.gaxeta_mag_set_point_course(%L, 0)$$, t.id('bk_pt')), '22023', 'curso zero no spot é recusado');
select t.throws(format($$select public.gaxeta_mag_set_point_course(%L, 12.345)$$, t.id('bk_pt')), '22023', 'mais de duas casas decimais é recusado');
select t.eq(public.gaxeta_mag_set_point_course(t.id('bk_pt'), null) ->> 'course_source', 'equipment', 'herdar do TAG de novo: a exceção sai e a origem volta a ser o TAG');
select public.gaxeta_mag_set_point_course(t.id('bk_pt2'), 12) \g /dev/null
select t.login(t.id('uA_all'));
select t.throws(format($$select public.gaxeta_mag_set_point_course(%L, 10)$$, t.id('bk_pt')), '42501', 'conta de consulta não altera o curso do spot');
select t.throws(format($$select public.gaxeta_mag_set_equipment_defaults(%L, null, 10, null)$$, t.id('bk_eq')), '42501', 'conta de consulta não altera o curso do TAG');
select t.eq(public.gaxeta_mag_asset_setup(t.id('bk_pt2')) ->> 'can_edit_course', 'false', 'a conta de consulta lê o cadastro, sem poder editar');
select t.login(t.id('uB_all'));
select t.throws(format($$select public.gaxeta_mag_asset_setup(%L)$$, t.id('bk_pt')), '42501', 'outra corporação não lê o cadastro deste spot');
select t.throws(format($$select public.gaxeta_mag_set_point_course(%L, 10)$$, t.id('bk_pt')), '42501', 'outra corporação não altera o curso deste spot');
select t.login(t.id('adm3'));
select t.throws(format($$select public.gaxeta_mag_set_point_course(%L, 10)$$, t.id('bk_pt')), '42501', 'ADM nível 3 (leitura) não altera o curso');
-- Cadastro de curso e validação da mecânica são independentes.
select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'bk') -> 'setup' ->> 'suggested_course_mm') || '|' || (t.ms(:'bk') -> 'setup' ->> 'course_source'), '12.00|point', 'spot com curso próprio e sem geometria: o resumo traz o curso e a origem');
select t.eq((t.ms(:'bk') -> 'config' -> 'missing')::text, '["geometry"]', 'falta só a geometria: o curso já está cadastrado');
select t.eq((t.ms(:'bk') -> 'config' ->> 'can_course') || '|' || (t.ms(:'bk') -> 'config' ->> 'can_geometry'), 'true|false', 'o operador sabe o que pode configurar e o que é da engenharia');
select t.throws(format($$select public.gaxeta_mag_set_point_geometry(%L, %s, null, null)$$, t.id('bk_pt2'), t.id_text('g_a')), '42501', 'operador não vincula revisão de montagem');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-BANCADA00001', gen_random_uuid(), 12, 'estimated')$$, 'PT409', 'sem geometria o engaxetamento com referência é recusado (não inicia escala fictícia)');

-- ---------------------------------------------------------------------------
-- I. Registro de manutenção sem referência
-- ---------------------------------------------------------------------------
select t.put('mn1', gen_random_uuid()::text);
select t.eq(public.gaxeta_mag_record_maintenance(:'bk', t.id('mn1'), 'troca de anéis') ->> 'reason', 'no_geometry', 'sem geometria, o mecânico registra o FATO do engaxetamento e a hora');
select t.eq(public.gaxeta_mag_record_maintenance(:'bk', t.id('mn1'), 'troca de anéis') ->> 'duplicate', 'true', 'toque duplo não duplica o registro');
select t.eq((t.ms(:'bk') -> 'maintenance' ->> 'reason') || '|' || (t.ms(:'bk') -> 'maintenance' ->> 'mine'), 'no_geometry|true', 'o resumo mostra o registro de manutenção');
select t.eq(t.ms(:'bk') ->> 'reason', 'no_geometry', '… e o cálculo de campo continua indisponível, com o motivo');
select t.eq(t.ms(:'bk') -> 'service', 'null'::jsonb, 'o registro não é referência operacional (nenhum engaxetamento ativo)');
select t.login(t.id('uA_all'));
select t.throws($$select public.gaxeta_mag_record_maintenance('ESP32-BANCADA00001', gen_random_uuid(), null)$$, '42501', 'conta de consulta não registra manutenção');
select t.ok((t.ms(:'bk') -> 'maintenance' ->> 'noted_at') is not null, 'a conta de consulta vê o registro');

-- ---------------------------------------------------------------------------
-- J. Engenharia vincula a revisão; um toque com o curso do cadastro; faixas de ajuste
-- ---------------------------------------------------------------------------
select t.login(t.id('adm2'));
select t.eq(public.gaxeta_mag_set_point_geometry(t.id('bk_pt2'), t.id_text('g_a')::bigint, null, 'suíte 87') ->> 'geometry_source', 'point', 'engenharia vincula a revisão validada ao spot');
select t.eq(public.gaxeta_mag_set_point_geometry(t.id('bk_pt2'), t.id_text('g_a')::bigint, null, null) ->> 'suggested_course_mm', '12.00', 'vincular a geometria preserva o curso típico do spot');
select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'bk') -> 'config' -> 'missing')::text, '[]', 'com curso e geometria validada não falta nada no cadastro');
select t.eq(t.ms(:'bk') ->> 'reason', 'no_reference', 'novo vínculo com geometria: pede a referência (Engaxetamento realizado)');
select t.throws($$select public.gaxeta_mag_record_maintenance('ESP32-BANCADA00001', gen_random_uuid(), null)$$, 'PT409', 'com montagem validada o caminho é o engaxetamento com referência');
-- Um toque, com o curso típico do cadastro: origem "estimado".
select public.gaxeta_mag_request_service(:'bk', gen_random_uuid(), 12, 'estimated') \g /dev/null
select t.root(); select t.mag_ago(:'bk', 10);
select t.anon(); select t.ct(:'bk', 359.2, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'bk') -> 'service' ->> 'course_origin') || '|' || (t.ms(:'bk') -> 'service' ->> 'course_mm') || '|' || (t.ms(:'bk') -> 'service' ->> 'band') || '|' || (t.ms(:'bk') -> 'service' ->> 'stable_shown'),
  'estimated|12.000|high|100.00', 'referência capturada perto de 359°: curso estimado de 12 mm, 100,00 %, Alto ajuste');
-- 12 mm a 0,25 mm/°: 48° de curso. Avanço de 3 mm = 12° adiante, cruzando o zero do chip.
select t.anon(); select t.ct(:'bk', 371.2, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.near((t.ms(:'bk') -> 'computed' ->> 'remaining_percent')::numeric, 75, 0.2, 'avanço de 3 mm em 12 mm, cruzando 0°: 75 % de curso restante');
select t.eq(t.ms(:'bk') -> 'service' ->> 'band', 'high', '75 %: Alto ajuste');
select t.anon(); select t.ct(:'bk', 383.2, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'bk') -> 'service' ->> 'band', 'medium', '50 %: Médio ajuste');
-- Alteração futura no TAG ou no spot não altera o ciclo já registrado.
select public.gaxeta_mag_set_point_course(t.id('bk_pt2'), 150) \g /dev/null
select public.gaxeta_mag_set_equipment_defaults(t.id('bk_eq'), 'large', 150, null) \g /dev/null
select t.eq(t.ms(:'bk') -> 'service' ->> 'course_mm', '12.000', 'mudar o curso do TAG e do spot depois não altera o ciclo em andamento');
select t.eq(t.ms(:'bk') -> 'setup' ->> 'suggested_course_mm', '150.00', '… só o valor proposto para o próximo engaxetamento');
-- Faixas: fronteiras com a mesma precisão do número exibido.
select t.root();
select t.eq(string_agg(v || '=' || gaxeta_private.mag_band(v), ' ' order by o), '0=none 29=none 29.99=none 29.994=none 29.995=low 30=low 49.99=low 49.995=medium 50=medium 72.99=medium 72.995=high 73=high 100=high 104.2=high -3.1=none',
  'faixas: sem ajuste < 30 ≤ baixo < 50 ≤ médio < 73 ≤ alto, decididas sobre o valor com duas casas')
  from unnest(array[0, 29, 29.99, 29.994, 29.995, 30, 49.99, 49.995, 50, 72.99, 72.995, 73, 100, 104.2, -3.1]::numeric[]) with ordinality q(v, o);
select t.eq(gaxeta_private.mag_band(null), null, 'sem valor estabilizado não há faixa (nunca "sem ajuste" por falta de leitura)');
-- Limiar de 5 pontos: 4,99 não registra, 5,00 registra, nos dois sentidos; deriva e imobilidade.
select t.eq(gaxeta_private.mag_stabilize(100, 95.01), 100::numeric, 'variação de 4,99 p.p. não muda a linha estabilizada');
select t.eq(gaxeta_private.mag_stabilize(100, 95.00), 95.00, 'variação de 5,00 p.p. muda');
select t.eq(gaxeta_private.mag_stabilize(50, 54.99), 50::numeric, 'no outro sentido: +4,99 p.p. não muda');
select t.eq(gaxeta_private.mag_stabilize(50, 55), 55::numeric, '… e +5,00 p.p. muda');
with recursive walk(i, raw, stable, changes) as (
  select 0, 100::numeric, 100::numeric, 0
  union all
  select i + 1, raw - 1, gaxeta_private.mag_stabilize(stable, raw - 1), changes + (gaxeta_private.mag_stabilize(stable, raw - 1) <> stable)::int from walk where i < 12)
select t.eq((select changes || '|' || stable from walk where i = 12), '2|90', 'deriva em passos de 1 p.p. (100 → 88): registra em 95 e em 90, pelo acumulado desde o último valor estabilizado');
with recursive walk(i, raw, stable, changes) as (
  select 0, 95::numeric, 95::numeric, 0
  union all
  select i + 1, raw + 1.25, gaxeta_private.mag_stabilize(stable, raw + 1.25), changes + (gaxeta_private.mag_stabilize(stable, raw + 1.25) <> stable)::int from walk where i < 4)
select t.eq((select changes || '|' || stable from walk where i = 4), '1|100.00', 'reversão (95 → 100 em passos de 1,25): um registro, ao completar 5 p.p.');
select t.root();
select (select count(*) from gaxeta_private.mag_movements where sensor_id = :'bk') as mv_bk \gset
select t.anon();
select t.ct(:'bk', 383.2, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.ct(:'bk', 383.3, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.ct(:'bk', 383.2, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.root();
select t.eq((select count(*) from gaxeta_private.mag_movements where sensor_id = :'bk'), :mv_bk::bigint, 'imobilidade prolongada (três leituras no mesmo ponto): nenhum evento, e a telemetria bruta continua entrando');
-- Ligar a bancada com referência de campo ativa encerra a referência, sem evento falso.
select t.login(t.id('uA_campo'));
select t.eq(public.gaxeta_mag_bench_preview(:'bk', 80, 180, 1) ->> 'ends_reference', 'true', 'a prévia avisa que ligar a bancada encerra a referência de campo vigente');
select public.gaxeta_mag_bench_start(:'bk', gen_random_uuid(), 80, 180, 1) \g /dev/null
select t.root();
select t.ok(t.svc(:'bk') like '%superseded:bench_mode', 'ligar o Modo bancada encerra a referência de campo (motivo bench_mode)');
select t.anon(); select t.ct(:'bk', 100, '{"boot":"cccccccccccccccc0000000000000003","session":"abab0009","origin":4084}') \g /dev/null
select t.root();
select t.eq((select count(*) from gaxeta_private.mag_movements where sensor_id = :'bk'), :mv_bk::bigint, 'troca de modo não gera evento de campo, mesmo com o eixo em outra posição');
select t.login(t.id('uA_campo'));
select public.gaxeta_mag_bench_stop(:'bk') \g /dev/null
select t.eq(t.ms(:'bk') ->> 'reason', 'no_reference', 'ao sair da bancada o spot pede novo engaxetamento (a referência antiga não volta)');

-- ---------------------------------------------------------------------------
-- K. Privilégio mínimo
-- ---------------------------------------------------------------------------
select t.root();
select t.eq((select count(*) from pg_policies where schemaname = 'gaxeta_private' and tablename in ('mag_bench_modes', 'mag_maintenance_notes')), 0::bigint, 'tabelas novas sem política (só as funções chegam a elas)');
select t.eq((select bool_and(relrowsecurity) from pg_class where oid in ('gaxeta_private.mag_bench_modes'::regclass, 'gaxeta_private.mag_maintenance_notes'::regclass)), true, 'RLS ligada nas tabelas novas');
select t.eq((select string_agg(p.proname, ',' order by p.proname) from pg_proc p where p.pronamespace = 'public'::regnamespace
  and p.proname in ('gaxeta_mag_bench_preview', 'gaxeta_mag_bench_start', 'gaxeta_mag_bench_confirm', 'gaxeta_mag_bench_stop', 'gaxeta_mag_set_point_course', 'gaxeta_mag_set_point_geometry', 'gaxeta_mag_asset_setup', 'gaxeta_mag_record_maintenance')
  and has_function_privilege('anon', p.oid, 'execute')), null, 'nenhuma função nova é executável por anônimo');
select t.eq((select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace
  and p.proname in ('gaxeta_mag_bench_preview', 'gaxeta_mag_bench_start', 'gaxeta_mag_bench_confirm', 'gaxeta_mag_bench_stop', 'gaxeta_mag_set_point_course', 'gaxeta_mag_set_point_geometry', 'gaxeta_mag_asset_setup', 'gaxeta_mag_record_maintenance')
  and has_function_privilege('authenticated', p.oid, 'execute')), 8::bigint, 'as oito funções novas são executáveis por usuário autenticado');
select t.eq((select count(*) from pg_proc p where p.pronamespace = 'gaxeta_private'::regnamespace and p.proname in ('mag_bench_u', 'mag_bench_eval', 'mag_band', 'mag_bench_check')
  and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))), 0::bigint, 'funções internas novas fechadas para a API');
select t.ok(has_function_privilege('anon', 'public.gaxeta_ingest_v4(text, jsonb)', 'execute'), 'a placa (papel anon) continua podendo enviar');

commit;
select rpad(suite, 40) || ' ok=' || count(*) filter (where ok) || ' falhas=' || count(*) filter (where not ok) from t.results where suite = current_setting('t.suite') group by suite;
select 'FALHA | ' || name || ' | ' || coalesce(detail, '') from t.results where suite = current_setting('t.suite') and not ok;
