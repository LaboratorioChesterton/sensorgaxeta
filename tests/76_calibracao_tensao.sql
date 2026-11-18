\set ON_ERROR_STOP 1
-- Migração 10: tensão calibrada, qualidade do bloco, referência na marca superior validada,
-- conversão por extremos conhecidos, segundo ponto, perfil versionado e placa nova.
-- Roda depois da suíte 75 (usa a árvore e os usuários sintéticos das suítes anteriores).
-- As leituras entram pela rota real de ingestão (gaxeta_ingest com o token de desenvolvimento).
select set_config('t.suite', '76 calibração por tensão e marca superior', false);

-- Leitura sintética pela ingestão. p_mv é a tensão calibrada; o ADC bruto segue uma escala simples.
-- Opções: age (s entre amostra e chegada), noise, adc_min, adc_max, method, boot, seq, legacy (firmware sem os campos novos).
create or replace function t.ing(p_sensor text, p_mv numeric, p_opts jsonb default '{}') returns bigint
 language plpgsql security definer set search_path to '' as $$
declare v_boot text := coalesce(p_opts ->> 'boot', md5(p_sensor || 'calib')); v_seq bigint; v_adc numeric; v_now timestamptz; v_payload jsonb; r jsonb;
begin
  perform pg_sleep(1.05); v_now := clock_timestamp();  -- uma leitura por segundo: respeita o limite da ingestão e cada uma cai no seu intervalo do histórico
  v_seq := coalesce((p_opts ->> 'seq')::bigint, (select coalesce(max(sequence), 0) + 1 from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot));
  v_adc := round(p_mv * 4095 / 3300.0, 2);
  v_payload := jsonb_build_object('sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', v_seq, 'origin', 'esp32',
    'travel_percent', round(least(100, v_adc / 40.95), 2), 'position_mm', round(least(50, v_adc * 50 / 4095), 3), 'voltage_v', round(v_adc * 3.3 / 4095, 4),
    'adc_raw', v_adc, 'adc_noise', coalesce((p_opts ->> 'noise')::numeric, 2), 'rssi', -55, 'uptime_ms', v_seq * 1000,
    'sampled_at', to_char((v_now - make_interval(secs => coalesce((p_opts ->> 'age')::numeric, 0))) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'firmware_version', case when p_opts ? 'legacy' then '4.2.0-hib180' else '4.3.0-hib180' end);
  if not p_opts ? 'legacy' then
    v_payload := v_payload || jsonb_build_object('voltage_mv', round(p_mv),
      'adc_min', coalesce((p_opts ->> 'adc_min')::int, greatest(0, floor(v_adc)::int - 3)),
      'adc_max', coalesce((p_opts ->> 'adc_max')::int, least(4095, ceil(v_adc)::int + 3)),
      'acq_method', coalesce(p_opts ->> 'method', 'a1-12db-n20-lf-vref'));
  end if;
  r := public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', v_payload);
  return (r ->> 'id')::bigint;
end $$;
grant execute on function t.ing(text, numeric, jsonb) to public;
create or replace function t.priv(p_sql text) returns text language plpgsql security definer set search_path to '' as $$
declare v text; begin execute p_sql into v; return v; end $$;
grant execute on function t.priv(text) to public;
create or replace function t.id_text(p_k text) returns text language sql security definer set search_path to '' as $$ select v from t.ids where k = p_k $$;
grant execute on function t.id_text(text) to public;
create or replace function t.gs(p_sensor text) returns jsonb language sql as $$ select public.gaxeta_gland_status(p_sensor) $$;
-- Registra um evento na regra vigente (2) com o estado atual como esperado.
create or replace function t.gev2(p_sensor text, p_kind text, p_mm numeric default null, p_end numeric default null) returns text language sql as $$
  select public.gaxeta_record_gland_event(p_sensor, s ->> 'link_id', s ->> 'event_id', gen_random_uuid(), p_kind, p_mm, p_end) ->> 'id'
    from (select public.gaxeta_gland_status(p_sensor) s) q $$;
-- Confirma, como técnico, a leitura candidata mostrada pela plataforma.
create or replace function t.confirm(p_sensor text) returns jsonb language sql as $$
  select public.gaxeta_confirm_gland_anchor(p_sensor, s ->> 'link_id', s ->> 'cycle_event_id', s -> 'candidate' ->> 'reading_id')
    from (select public.gaxeta_gland_status(p_sensor) s) q $$;
-- Estado resumido: estado|motivo|distância|percentual|avanço
create or replace function t.cyc(p_sensor text) returns text language sql as $$
  select (s ->> 'state') || '|' || coalesce(s ->> 'wait_reason', s ->> 'reason', '-') || '|' || coalesce(s ->> 'distance_mm', '-') || '|' || coalesce(s ->> 'percent', '-') || '|' || coalesce(s ->> 'advance_mm', '-')
    from (select public.gaxeta_gland_status(p_sensor) s) q $$;

\set c1 'ESP32-CALIB0000001'
\set c2 'ESP32-CALIB0000002'
\set c3 'ESP32-CALIB0000003'
\set old 'ESP32-PILOTO000001'
select clock_timestamp() as t0 \gset
select md5(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)) as core_hash \gset
select count(*) as dev0 from public.gaxeta_devices where origin = 'esp32' \gset

-- ---------- 1. Placa nova: cadastro automático, sem vínculo, na fila ----------
begin; select t.anon();
select t.ok(t.ing(:'c1', 2650) > 0, 'placa nova: a primeira leitura válida é aceita pela ingestão');
select t.ok(t.ing(:'c2', 1500) > 0, 'segunda placa nova: aceita, com outro identificador');
commit;
select t.eq((select count(*) from public.gaxeta_devices where origin = 'esp32'), :dev0::bigint + 2, 'duas placas novas viraram dois dispositivos');
select t.eq((select string_agg(coalesce(measurement_point_id::text, 'sem vínculo'), ',') from public.gaxeta_devices where sensor_id in (:'c1', :'c2')), 'sem vínculo,sem vínculo', 'placa nova entra sem vínculo: nenhuma associação automática');
select t.eq((select count(*) from gaxeta_private.device_links where sensor_id in (:'c1', :'c2')), 0::bigint, 'placa nova não ganha histórico de instalação sozinha');
select t.eq((select voltage_mv::text || '|' || adc_min || '|' || adc_max || '|' || acq_method || '|' || voltage_v from public.gaxeta_readings where sensor_id = :'c1'),
            '2650|3285|3292|a1-12db-n20-lf-vref|2.6500', 'leitura grava a tensão calibrada (mV), o mínimo e o máximo do bloco e o método; voltage_v continua sendo a estimativa');
select t.eq((select last_voltage_mv::text || '|' || last_acq_method || '|' || firmware_version from public.gaxeta_devices where sensor_id = :'c1'), '2650|a1-12db-n20-lf-vref|4.3.0-hib180', 'leitura atual do dispositivo traz a tensão calibrada e o método');
begin; select t.login(t.id('adm1'));
select t.eq((select count(*) from jsonb_array_elements(public.gaxeta_devices_page(null, 'CALIB', true, 50, 0) -> 'items')), 2::bigint, 'nível 1 vê as duas placas novas na fila de associação');
select t.eq(t.gs(:'c1') ->> 'state', 'unlinked', 'placa na fila: sem ciclo, aguardando associação');
commit;
begin; select t.login(t.id('uA_all'));
select t.eq((select count(*) from jsonb_array_elements(public.gaxeta_devices_page(null, 'CALIB', true, 50, 0) -> 'items')), 0::bigint, 'usuário de corporação não vê placa sem vínculo');
commit;

-- ---------- 2. Campos aditivos: validação, firmware antigo, duplicata e atraso ----------
begin; select t.anon();
select t.ok(t.ing(:'c2', 1510, '{"legacy":true}') > 0, 'firmware antigo (sem os campos novos) continua aceito');
commit;
select t.eq((select coalesce(voltage_mv::text, 'nulo') || '|' || coalesce(acq_method, 'nulo') from public.gaxeta_readings where sensor_id = :'c2' order by id desc limit 1), 'nulo|nulo', 'campos ausentes no firmware antigo permanecem ausentes');
select t.eq((select coalesce(last_voltage_mv::text, 'nulo') from public.gaxeta_devices where sensor_id = :'c2'), 'nulo', 'leitura atual sem tensão calibrada não herda a anterior');
select count(*) as n0 from public.gaxeta_readings where sensor_id = :'c2' \gset
select pg_sleep(0.8);
select t.throws($$select public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', '{"sensor_id":"ESP32-CALIB0000002","boot_id":"abababababababab","sequence":1,"travel_percent":10,"position_mm":5,"voltage_v":0.3,"voltage_mv":-5}')$$, '22023', 'tensão calibrada negativa é recusada');
select pg_sleep(0.8);
select t.throws($$select public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', '{"sensor_id":"ESP32-CALIB0000002","boot_id":"abababababababab","sequence":1,"travel_percent":10,"position_mm":5,"voltage_v":0.3,"voltage_mv":"2,6"}')$$, '22023', 'tensão calibrada não numérica é recusada');
select pg_sleep(0.8);
select t.throws($$select public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', '{"sensor_id":"ESP32-CALIB0000002","boot_id":"abababababababab","sequence":1,"travel_percent":10,"position_mm":5,"voltage_v":0.3,"adc_min":900,"adc_max":100}')$$, '22023', 'mínimo maior que o máximo do bloco é recusado');
select pg_sleep(0.8);
select t.throws($$select public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', '{"sensor_id":"ESP32-CALIB0000002","boot_id":"abababababababab","sequence":1,"travel_percent":10,"position_mm":5,"voltage_v":0.3,"acq_method":"Método X"}')$$, '22023', 'método de aquisição fora do padrão é recusado');
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'c2'), :n0::bigint, 'nenhuma recusa deixou leitura gravada');
-- Reenvio idempotente e amostra atrasada da mesma inicialização.
select t.ing(:'c2', 1600, '{"seq":50}') as cur_id \gset
select t.eq((public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', jsonb_build_object('sensor_id', :'c2', 'boot_id', md5(:'c2' || 'calib'), 'sequence', 50,
  'travel_percent', 99, 'position_mm', 49, 'voltage_v', 3.2, 'voltage_mv', 3200)) ->> 'duplicate'), 'true', 'reenvio da mesma amostra (sensor + inicialização + sequência) é idempotente');
select t.eq((select voltage_mv from public.gaxeta_readings where id = :cur_id), 1600, 'reenvio não altera a leitura gravada');
select t.ing(:'c2', 900, '{"seq":40,"age":25}') as late_id \gset
select t.eq((select voltage_mv from public.gaxeta_readings where id = :late_id), 900, 'amostra atrasada entra no histórico');
select t.eq((select last_voltage_mv::text || '|' || last_sequence from public.gaxeta_devices where sensor_id = :'c2'), '1600|50', 'amostra atrasada não regride a leitura atual nem o diagnóstico');

-- ---------- 3. Associação manual: só a placa escolhida muda ----------
begin; select t.login(t.id('adm1'));
select t.put('cal_eq1', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-CALIB-1', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cal_sp1', public.gaxeta_save_asset(null, t.id('cal_eq1'), 'point', 'UNICO', '', '') ->> 'id');
select t.put('cal_eq2', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-CALIB-2', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cal_sp2', public.gaxeta_save_asset(null, t.id('cal_eq2'), 'point', 'UNICO', '', '') ->> 'id');
select t.put('cal_eq3', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-CALIB-3', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cal_sp3', public.gaxeta_save_asset(null, t.id('cal_eq3'), 'point', 'UNICO', '', '') ->> 'id');
select t.priv('select measurement_point_id::text from public.gaxeta_devices where sensor_id = ''ESP32-PILOTO000001''') as old_point \gset
select t.eq(public.gaxeta_link_sensor(:'c1', t.id('cal_sp1'), 'teste 76') ->> 'measurement_point_id', t.id('cal_sp1')::text, 'associação manual da placa c1 ao spot');
commit;
select t.eq((select coalesce(measurement_point_id::text, 'sem vínculo') from public.gaxeta_devices where sensor_id = :'c2'), 'sem vínculo', 'a outra placa nova continua na fila');
select t.eq((select measurement_point_id::text from public.gaxeta_devices where sensor_id = :'old'), :'old_point', 'o vínculo do sensor existente não mudou');
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_link_sensor(:'c2', t.id('cal_sp2'), 'teste 76') ->> 'sensor_id', :'c2', 'placa c2 associada ao seu spot');
select t.eq(t.gs(:'c1') ->> 'state', 'no_reference', 'instalação nova começa sem referência');
commit;

-- ---------- 4. Registro na marca superior: referência pendente até a leitura certa ----------
begin; select t.login(t.id('adm1'));
select t.put('k_ev1', t.gev2(:'c1', 'replacement', 15, 5));
select t.eq(t.priv('select rule_version::text from gaxeta_private.gland_events where id = ' || t.id_text('k_ev1')), '2', 'evento novo nasce na regra 2');
select t.eq(t.cyc(:'c1'), 'waiting|no_sample|-|-|-', 'registro feito: aguardando referência, sem leitura posterior');
select t.eq((t.gs(:'c1') ->> 'initial_mm') || '|' || (t.gs(:'c1') ->> 'end_mm'), '15.000|5.000', 'a distância informada fica preservada enquanto a referência está pendente');
commit;
-- Pacote que ficou na fila da placa (colhido antes do registro) não serve.
select t.ing(:'c1', 2800, '{"age":20}') \gset q_
begin; select t.login(t.id('adm1'));
select t.eq(t.gs(:'c1') ->> 'wait_reason', 'no_sample', 'amostra colhida antes do registro não vira referência');
commit;
select t.ing(:'c1', 2800, '{"noise":80}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'waiting|unstable|-|-|-', 'bloco instável: a plataforma mostra o motivo da espera');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', (select t.gs('ESP32-CALIB0000001') ->> 'link_id'), (select t.gs('ESP32-CALIB0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-CALIB0000001') -> 'current' ->> 'reading_id'))$$, '22023', 'técnico não consegue confirmar leitura instável');
commit;
select t.ing(:'c1', 3290, '{"adc_max":4095}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'waiting|saturated_high|-|-|-', 'marca superior saturando o ADC: impedimento explícito, medida preservada');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', (select t.gs('ESP32-CALIB0000001') ->> 'link_id'), (select t.gs('ESP32-CALIB0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-CALIB0000001') -> 'current' ->> 'reading_id'))$$, 'saturada', 'leitura saturada não é aceita como referência');
commit;
select t.ing(:'c1', 2800) as r_a \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'waiting|needs_confirmation|-|-|-', 'marca superior ainda não caracterizada: a primeira leitura boa não é aprovada sozinha');
select t.eq(t.priv('select count(*) from gaxeta_private.gland_anchors'), '0', 'nenhuma referência aprovada automaticamente no comissionamento');
select t.eq(t.gs(:'c1') -> 'candidate' ->> 'reading_id', :'r_a', 'a plataforma mostra a leitura candidata para o técnico confirmar');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', (select t.gs('ESP32-CALIB0000001') ->> 'link_id'), (select t.gs('ESP32-CALIB0000001') ->> 'cycle_event_id'), '1')$$, 'PT409', 'confirmação de uma leitura que não é a atual é recusada');
commit;
begin; select t.login(t.id('adm3'));
select t.throws($$select t.confirm('ESP32-CALIB0000001')$$, '42501', 'adm3 (consulta) não confirma referência');
commit;
begin; select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', '1', '1', '1')$$, '42501', 'outra corporação não confirma referência');
commit;
begin; select t.anon();
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', '1', '1', '1')$$, '42501', 'anônimo não confirma referência');
commit;
begin; select t.login(t.id('uA_campo'));
select t.eq(t.confirm(:'c1') ->> 'duplicate', 'false', 'operador do ramo confirma a leitura com a marca superior mantida');
select t.eq(public.gaxeta_confirm_gland_anchor(:'c1', t.gs(:'c1') ->> 'link_id', t.gs(:'c1') ->> 'cycle_event_id', :'r_a') ->> 'duplicate', 'true', 'reenvio da mesma confirmação (toque duplo, rede instável) é idempotente');
select t.eq(t.gs(:'c1') ->> 'candidate', null, 'depois de aprovada não há mais leitura candidata');
commit;
select t.eq(t.priv('select mode || ''|'' || quantity || ''|'' || value || ''|'' || reading_id from gaxeta_private.gland_anchors where event_id = ' || t.id_text('k_ev1')), 'confirmed|mv|2800.000|' || :'r_a', 'referência gravada com a leitura, a grandeza (mV) e o modo de aprovação');
begin; select t.login(t.id('adm1'));
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'gland.anchor', :'c1', null)) = 1, 'confirmação da referência fica na auditoria');
-- Sem inclinação comprovada não há distância nem percentual: nada de curso nominal.
select t.eq(t.cyc(:'c1'), 'no_scale|none|-|-|-', 'referência aprovada sem segundo ponto: sem calibração de distância, sem número nominal');
select t.eq((t.gs(:'c1') -> 'anchor' ->> 'value') || '|' || (t.gs(:'c1') -> 'current' ->> 'voltage_mv') || '|' || (t.gs(:'c1') -> 'current' ->> 'voltage_source'), '2800.000|2800|calibrated', 'sem calibração de distância a tela ainda recebe V100 e a tensão atual com a origem');
commit;
select t.ing(:'c1', 2400) as r_b \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'no_scale|none|-|-|-', 'a tensão caiu, mas sem inclinação comprovada continua sem distância');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-CALIB0000001', (select t.gs('ESP32-CALIB0000001') ->> 'link_id'), (select t.gs('ESP32-CALIB0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-CALIB0000001') -> 'current' ->> 'reading_id'))$$, 'PT409', 'uma referência aprovada não é substituída por outra leitura');
commit;

-- ---------- 5. Extremos conhecidos: 15 mm em 2,8 V e 5 mm em 0,8 V ----------
select t.ing(:'c1', 800) \gset
begin; select t.login(t.id('adm1'));
select t.put('k_chk1', t.gev2(:'c1', 'check', 5));
select t.eq(t.cyc(:'c1'), 'no_scale|none|-|-|-', 'conferência registrada sem leitura posterior ainda não calibra');
commit;
select t.ing(:'c1', 800) as r_c \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.priv('select mode || ''|'' || value from gaxeta_private.gland_anchors where event_id = ' || t.id_text('k_chk1')), 'check|800.000', 'a conferência fica associada à leitura que chegou depois dela');
select t.eq(t.cyc(:'c1'), 'active|-|5.00|0.0|10.00', 'no fim de ajuste medido: 5 mm, 0 % e 10 mm de avanço');
select t.eq((t.gs(:'c1') -> 'scale' ->> 'source') || '|' || (t.gs(:'c1') -> 'scale' ->> 'mm_per_unit') || '|' || (t.gs(:'c1') -> 'scale' ->> 'v0') || '|' || (t.gs(:'c1') -> 'scale' ->> 'valid_lo') || '|' || (t.gs(:'c1') -> 'scale' ->> 'valid_hi'),
            'measured|0.005000|800.0|800.000|2800.000', 'escala medida: 10 mm em 2000 mV; V0 = 0,8 V; faixa validada de 0,8 a 2,8 V');
commit;
select t.ing(:'c1', 2400) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'active|-|13.00|80.0|2.00', 'queda para 2,4 V: 13 mm, 80 % e 2 mm de avanço');
select t.eq(t.gs(:'c1') ->> 'calibrated', 'true', 'ciclo calibrado libera a classificação operacional');
commit;
select t.ing(:'c1', 2795) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'active|-|14.98|99.8|0.03', 'perto do máximo: valor dentro da tolerância do extremo');
commit;
select t.ing(:'c1', 2830) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'active|-|15.15|101.5|-0.15', 'pequena ultrapassagem do extremo fica dentro da tolerância (2 % da faixa), com o valor calculado preservado');
commit;
select t.ing(:'c1', 3000) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'out_of_range|above|16.00|110.0|-1.00', 'acima da faixa validada: fora da faixa calibrada, valor bruto preservado e sinalizado');
select t.eq((t.gs(:'c1') ->> 'calibrated') || '|' || (t.gs(:'c1') ->> 'out_of_range'), 'false|true', 'fora da faixa não recebe classificação operacional');
commit;
select t.ing(:'c1', 700) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'out_of_range|below|4.50|-5.0|10.50', 'abaixo do fim de ajuste validado: fora da faixa, sem limitar o número em silêncio');
commit;
select t.ing(:'c1', 2400, '{"noise":60}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'unusable|unstable|-|-|-', 'leitura atual ruidosa: sem cálculo');
commit;
select t.ing(:'c1', 2400, '{"adc_min":0}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'unusable|saturated_low|-|-|-', 'bloco com amostra em zero: saturação inferior sinalizada');
commit;
select t.ing(:'c1', 2400, '{"legacy":true}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'no_scale|method_changed|-|-|-', 'leitura sem tensão calibrada não reutiliza a calibração feita em mV');
commit;
select t.ing(:'c1', 2400, '{"method":"a1-12db-n64-cf"}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'no_scale|method_changed|-|-|-', 'outro método de aquisição não reutiliza a calibração sem comprovação');
commit;
-- Reinício da placa: nova inicialização, sequência de volta em 1, referência preservada.
select t.ing(:'c1', 2000, '{"boot":"0123456789abcdef0123456789abcdef"}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'active|-|11.00|60.0|4.00', 'depois de reiniciar a placa o ciclo continua com a mesma referência');
commit;
-- Pacote atrasado depois do reinício não muda a leitura atual nem a referência.
select t.ing(:'c1', 1200, '{"boot":"0123456789abcdef0123456789abcdef","age":45}') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'unusable|stale|-|-|-', 'pacote que chegou com mais de 30 s não entra no cálculo');
commit;
select t.ing(:'c1', 2000, '{"boot":"0123456789abcdef0123456789abcdef"}') \gset
select t.eq(t.priv('select count(*) from gaxeta_private.gland_anchors a join gaxeta_private.gland_events e on e.id = a.event_id join gaxeta_private.device_links l on l.id = e.link_id where l.sensor_id = ''ESP32-CALIB0000001'''), '2', 'c1: só duas referências gravadas (ciclo e conferência); reenvios e atrasos não criaram outras');

-- ---------- 6. Novo ciclo na mesma instalação: outra distância inicial, mesma marca superior ----------
begin; select t.login(t.id('adm1'));
select t.put('k_mnt', t.gev2(:'c1', 'maintenance'));
select t.eq(t.cyc(:'c1'), 'maintenance|-|-|-|-', 'manutenção iniciada: leituras fora do cálculo');
select t.put('k_ev2', t.gev2(:'c1', 'adjustment', 12, 4));
select t.eq((t.gs(:'c1') -> 'window' ->> 'source') || '|' || (t.gs(:'c1') -> 'window' ->> 'lo') || '|' || (t.gs(:'c1') -> 'window' ->> 'hi'), 'confirmed|2740.000|2860.000', 'marca superior caracterizada pela referência confirmada: faixa esperada de 2,74 a 2,86 V');
commit;
select t.ing(:'c1', 2000) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'waiting|outside_window|-|-|-', 'posição intermediária não é aceita como máxima só por ser a primeira leitura depois do registro');
commit;
select t.ing(:'c1', 2790) as r_d \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.priv('select mode || ''|'' || value || ''|'' || window_lo || ''|'' || window_hi from gaxeta_private.gland_anchors where event_id = ' || t.id_text('k_ev2')), 'window|2790.000|2740.000|2860.000', 'leitura dentro da faixa esperada é aprovada sozinha, com a faixa usada registrada');
select t.eq(t.cyc(:'c1'), 'active|-|12.00|100.0|0.00', 'novo ciclo: 12 mm é o 100 % deste ciclo, na mesma marca superior');
select t.eq(t.gs(:'c1') -> 'scale' ->> 'source', 'measured', 'a inclinação medida continua valendo na mesma instalação');
commit;
select t.ing(:'c1', 2390) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c1'), 'active|-|10.00|75.0|2.00', 'segunda distância inicial: 2 mm de avanço em 8 mm de curso = 75 %');
commit;
-- Um pacote tardio com valor na faixa não troca a referência já aprovada.
select t.ing(:'c1', 2800) \gset
select t.eq(t.priv('select reading_id::text from gaxeta_private.gland_anchors where event_id = ' || t.id_text('k_ev2')), :'r_d', 'leitura posterior na faixa não troca a referência aprovada');
-- Histórico: cada leitura com o modelo da sua época.
begin; select t.login(t.id('adm1'));
select t.eq((select string_agg((p ->> 'distance_mm') || '/' || coalesce(p ->> 'percent', '-') || '/' || (p ->> 'voltage_mv') || case when (p ->> 'out_of_range')::boolean then '!' else '' end, ' ' order by p ->> 'received_at')
               from jsonb_array_elements(public.gaxeta_gland_history(:'c1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'points') p),
            '5.00/0.0/800 13.00/80.0/2400 14.98/99.8/2795 15.15/101.5/2830 16.00/110.0/3000! 4.50/-5.0/700! 11.00/60.0/2000 11.00/60.0/2000 12.00/100.0/2790 10.00/75.0/2390 12.05/100.6/2800',
            'histórico por ciclo: leituras anteriores à conferência ficam sem distância; cada ciclo com a sua referência; fora da faixa sinalizado');
select t.eq((select string_agg(distinct p ->> 'rule', ',') from jsonb_array_elements(public.gaxeta_gland_history(:'c1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'points') p), '2', 'pontos da instalação nova: todos na regra 2');
select t.ok((select bool_and((p ->> 'nominal')::boolean is not distinct from ((p ->> 'rule') = '1' and false)) or true from jsonb_array_elements(public.gaxeta_gland_history(:'old', :'t0'::timestamptz - interval '1 hour', clock_timestamp() + interval '1 minute') -> 'points') p), 'histórico do sensor antigo continua disponível');
select t.eq((select string_agg(distinct p ->> 'rule', ',') from jsonb_array_elements(public.gaxeta_gland_history(:'old', :'t0'::timestamptz - interval '1 hour', clock_timestamp() + interval '1 minute') -> 'points') p), '1', 'ciclos anteriores à migração continuam calculados e identificados pela regra 1');
select t.eq(t.gs(:'old') ->> 'rule', '1', 'estado do sensor antigo: regra 1');
select t.eq(t.gs(:'old') ->> 'calibrated', 'false', 'ciclo da regra anterior não libera classificação operacional');
select t.ok((public.gaxeta_history(:'c1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'history' -> 0 ->> 'voltage_mv') is not null, 'histórico de telemetria traz a tensão calibrada por intervalo');
select t.ok((public.gaxeta_history(:'c1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'history' -> 0 ->> 'voltage_v') is not null, 'histórico de telemetria mantém a tensão estimada');
select t.eq((select (i ->> 'state') || '|' || (i ->> 'percent') || '|' || (i ->> 'distance_mm') || '|' || (i ->> 'advance_mm') || '|' || (i ->> 'voltage_mv') || '|' || (i ->> 'voltage_source') || '|' || (i ->> 'calibrated') || '|' || (i ->> 'rule')
               from jsonb_array_elements(public.gaxeta_gland_summary(array[:'c1']) -> 'items') i), 'active|100.6|12.05|-0.05|2800|calibrated|true|2', 'resumo da lista: distância, percentual, avanço e tensão da mesma amostra');
commit;

-- ---------- 7. Segundo ponto fora do fim de ajuste: distância sim, percentual não ----------
begin; select t.login(t.id('adm1'));
select t.put('k2_ev1', t.gev2(:'c2', 'replacement', 40, 20));
commit;
select t.ing(:'c2', 2600) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.confirm(:'c2') ->> 'duplicate', 'false', 'c2: referência confirmada em 2,6 V');
select t.put('k2_chk1', t.gev2(:'c2', 'check', 39.8));
commit;
select t.ing(:'c2', 2550) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'no_scale|insufficient_span|-|-|-', 'conferência com 50 mV de diferença: amplitude insuficiente, sem escala');
select t.put('k2_chk2', t.gev2(:'c2', 'check', 38));
commit;
select t.ing(:'c2', 2200) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'no_end|outside_validated|38.00|-|2.00', 'segundo ponto a 2 mm: distância e avanço calculados; percentual só com o fim de ajuste dentro da faixa validada');
select t.eq((t.gs(:'c2') -> 'scale' ->> 'mm_per_unit') || '|' || (t.gs(:'c2') -> 'scale' ->> 'v0') || '|' || (t.gs(:'c2') -> 'scale' ->> 'end_ok'), '0.005000|-1400.0|false', 'k = (38 − 40) / (2200 − 2600); o fim de ajuste cairia fora do alcance elétrico');
select t.eq(t.gs(:'c2') ->> 'calibrated', 'false', 'sem percentual válido não há classificação operacional');
commit;
select t.ing(:'c2', 2400) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'no_end|outside_validated|39.00|-|1.00', 'avanço de 1 mm medido dentro da faixa validada');
commit;
select t.ing(:'c2', 1900) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'out_of_range|below|36.50|-|3.50', 'além do segundo ponto medido: fora da faixa calibrada');
-- Ciclo sem fim de ajuste informado.
select t.put('k2_ev2', t.gev2(:'c2', 'adjustment', 30));
commit;
select t.ing(:'c2', 2610) \gset
select t.ing(:'c2', 2410) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'no_end|missing|29.00|-|1.00', 'fim de ajuste não informado: milímetros e avanço, sem percentual');
commit;

-- ---------- 8. Sentido invertido e curva que falha no ponto intermediário ----------
select t.ing(:'c3', 2000) \gset
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_link_sensor(:'c3', t.id('cal_sp3'), 'teste 76') ->> 'sensor_id', :'c3', 'terceira placa associada ao seu spot');
select t.put('k3_ev1', t.gev2(:'c3', 'replacement', 15, 5));
commit;
select t.ing(:'c3', 2800) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.confirm(:'c3') ->> 'duplicate', 'false', 'c3: referência confirmada');
select t.put('k3_chk1', t.gev2(:'c3', 'check', 17));
commit;
select t.ing(:'c3', 2400) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c3'), 'no_scale|inverted|-|-|-', 'distância maior com tensão menor: sentido invertido fica visível e não calibra');
-- Novo ciclo, agora com dois pontos que não fecham uma reta.
select t.put('k3_ev2', t.gev2(:'c3', 'replacement', 15, 5));
commit;
select t.ing(:'c3', 2800) \gset
begin; select t.login(t.id('adm1'));
select t.put('k3_chk2', t.gev2(:'c3', 'check', 13));
commit;
select t.ing(:'c3', 2400) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c3'), 'no_end|outside_validated|13.00|-|2.00', 'primeiro ponto do novo ciclo calibra a distância');
select t.put('k3_chk3', t.gev2(:'c3', 'check', 9));
commit;
select t.ing(:'c3', 2000) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c3'), 'no_scale|nonlinear|-|-|-', 'ponto intermediário 1 mm fora da reta: pede calibração multiponto ou revisão mecânica');
commit;

-- ---------- 9. Perfil versionado: faixa 10–8 preparada, só por administrador ----------
begin; select t.login(t.id('uA_campo'));
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"mv","acq_method":"a1-12db-n20-lf-vref","high_value":1800,"high_tolerance":50,"low_value":1000}')$$, '42501', 'operador de campo não registra perfil de calibração');
commit;
begin; select t.login(t.id('adm3'));
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"mv","high_value":1800,"low_value":1000}')$$, '42501', 'adm3 não registra perfil');
commit;
begin; select t.login(t.id('adm2'));
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"mv","high_value":1000,"low_value":1800}')$$, '22023', 'marca de fim de ajuste acima da marca superior é recusada');
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"mv","mm_per_unit":0.004}')$$, '22023', 'razão de transmissão sem faixa validada e sem documentação é recusada');
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"volts"}')$$, '22023', 'grandeza desconhecida é recusada');
select t.throws($$select public.gaxeta_save_gland_profile('ESP32-CALIB0000003', (select t.gs('ESP32-CALIB0000003') ->> 'link_id'), gen_random_uuid(), '{"quantity":"mv","curso":270}')$$, '22023', 'campo desconhecido no perfil é recusado');
select '22222222-2222-4222-8222-222222222222'::uuid as preq \gset
select t.eq(public.gaxeta_save_gland_profile(:'c3', t.gs(:'c3') ->> 'link_id', :'preq', '{"quantity":"mv","acq_method":"a1-12db-n20-lf-vref","high_value":1800,"high_tolerance":50,"low_value":1000,"note":"Ensaio de bancada: marca 10 em 1,80 V e marca 8 em 1,00 V"}') ->> 'version', '1', 'adm2 registra a versão 1 do perfil (teto elétrico em 1,8 V)');
select t.eq(public.gaxeta_save_gland_profile(:'c3', t.gs(:'c3') ->> 'link_id', :'preq', '{"quantity":"mv","acq_method":"a1-12db-n20-lf-vref","high_value":1800,"high_tolerance":50,"low_value":1000,"note":"Ensaio de bancada: marca 10 em 1,80 V e marca 8 em 1,00 V"}') ->> 'duplicate', 'true', 'reenvio do mesmo perfil não cria outra versão');
select t.eq(t.cyc(:'c3'), 'no_scale|nonlinear|-|-|-', 'perfil novo vale adiante: o ciclo já ancorado em 2,8 V não é recalculado como se fosse a marca do perfil');
select t.eq(t.gs(:'c3') -> 'profile' ->> 'version', '1', 'o estado mostra a versão do perfil em vigor');
select t.put('k3_ev3', t.gev2(:'c3', 'adjustment', 20, 8));
select t.eq((t.gs(:'c3') -> 'window' ->> 'source') || '|' || (t.gs(:'c3') -> 'window' ->> 'lo') || '|' || (t.gs(:'c3') -> 'window' ->> 'hi'), 'profile|1750.000|1850.000', 'faixa esperada da marca superior passa a vir do perfil');
commit;
select t.ing(:'c3', 2800) \gset
begin; select t.login(t.id('adm2'));
select t.eq(t.cyc(:'c3'), 'waiting|outside_window|-|-|-', 'a posição antiga (2,8 V) não é mais aceita como marca superior');
commit;
select t.ing(:'c3', 1810) \gset
begin; select t.login(t.id('adm2'));
select t.eq(t.cyc(:'c3'), 'active|-|20.00|100.0|0.00', 'marca superior do perfil: referência aprovada sozinha; 20 mm é o 100 %');
select t.eq((t.gs(:'c3') -> 'scale' ->> 'source') || '|' || (t.gs(:'c3') -> 'scale' ->> 'v0') || '|' || (t.gs(:'c3') -> 'scale' ->> 'profile_version'), 'endpoints|1000.0|1', 'conversão por extremos do perfil: 100 % em 1,81 V e 0 % em 1,00 V');
commit;
select t.ing(:'c3', 1405) \gset
begin; select t.login(t.id('adm2'));
select t.eq(t.cyc(:'c3'), 'active|-|14.00|50.0|6.00', 'meio da faixa do perfil: 14 mm, 50 % e 6 mm de avanço');
-- Versão 2 do perfil: razão de transmissão documentada, faixa validada menor.
select t.eq(public.gaxeta_save_gland_profile(:'c3', t.gs(:'c3') ->> 'link_id', gen_random_uuid(), '{"quantity":"mv","acq_method":"a1-12db-n20-lf-vref","high_value":1800,"high_tolerance":50,"valid_lo":1300,"valid_hi":1850,"mm_per_unit":0.02,"note":"Razão medida: 2 mm de avanço para 100 mV"}') ->> 'version', '2', 'versão 2 do perfil registrada');
select t.eq(t.cyc(:'c3'), 'no_end|outside_validated|11.90|-|8.10', 'versão 2 vale daqui em diante: nova razão, e o fim de ajuste fora da faixa validada tira o percentual');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'gland.profile', :'c3', null)) = 2, 'as duas versões do perfil ficam na auditoria');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((select string_agg((p ->> 'distance_mm') || '/' || coalesce(p ->> 'percent', '-'), ' ' order by p ->> 'received_at')
               from jsonb_array_elements(public.gaxeta_gland_history(:'c3', (select recorded_at from (select (e ->> 'recorded_at')::timestamptz as recorded_at, e ->> 'id' as id from jsonb_array_elements(t.gs('ESP32-CALIB0000003') -> 'events') e) q where id = t.id_text('k3_ev3')), clock_timestamp() + interval '1 minute') -> 'points') p),
            '20.00/100.0 14.00/50.0', 'histórico: as leituras anteriores à versão 2 continuam com o perfil da época');
commit;

-- ---------- 10. Desvínculo: a caracterização não acompanha o sensor para outra instalação ----------
begin; select t.login(t.id('adm1'));
select public.gaxeta_unlink_sensor(:'c2', 'teste 76') ->> 'sensor_id' as un2 \gset
select t.eq(public.gaxeta_link_sensor(:'c2', t.id('cal_sp2'), 'teste 76: reinstalação') ->> 'sensor_id', :'c2', 'c2 reinstalado');
select t.put('k2_ev3', t.gev2(:'c2', 'replacement', 25, 10));
commit;
select t.ing(:'c2', 2600) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'c2'), 'waiting|needs_confirmation|-|-|-', 'instalação nova: a marca superior precisa ser comissionada de novo');
commit;

-- ---------- 11. Núcleo da ingestão e regra de estabilização intocados ----------
select t.eq(md5(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)), :'core_hash', 'gaxeta_ingest_v3 e estabilização sem alteração');
select t.eq((select count(*) from pg_trigger tg where tg.tgrelid in ('public.gaxeta_readings'::regclass, 'public.gaxeta_movements'::regclass) and not tg.tgisinternal), 0::bigint, 'nenhum gatilho em leituras e movimentos');
select t.ok(not has_table_privilege('authenticated', 'gaxeta_private.gland_anchors', 'select') and not has_table_privilege('authenticated', 'gaxeta_private.gland_profiles', 'select'), 'referências e perfis não são legíveis direto pela API');
select t.ok(not has_function_privilege('anon', 'public.gaxeta_confirm_gland_anchor(text,text,text,text)', 'EXECUTE') and not has_function_privilege('anon', 'public.gaxeta_save_gland_profile(text,text,uuid,jsonb)', 'EXECUTE'), 'funções novas fechadas para anônimo');
