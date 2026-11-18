\set ON_ERROR_STOP 1
-- Migração 11: cadastro com a leitura no teto do ADC, substituição de cadastro pendente, diagnóstico do
-- bloco, idade da leitura ao confirmar, leitura intermediária × marca superior, comissionamento em dois
-- pontos (15 mm = 100 %, 3 mm = 0 %), nova troca com outras medidas e modo só elétrico.
-- Roda depois da suíte 76 (usa t.ing, t.gs, t.gev2, t.confirm, t.cyc, t.priv e a árvore sintética).
-- As leituras entram pela rota real de ingestão. Nada aqui toca dados de produção.
select set_config('t.suite', '77 comissionamento em dois pontos', false);

\set d1 'ESP32-DESTR0000001'
\set d2 'ESP32-DESTR0000002'
\set d3 'ESP32-DESTR0000003'
select md5(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)
        || pg_get_functiondef('public.gaxeta_ingest(text,jsonb)'::regprocedure) || pg_get_functiondef('public.gaxeta_record_gland_event(text,text,text,uuid,text,numeric,numeric)'::regprocedure)) as core_hash \gset
-- Recua no tempo uma leitura (e o estado do dispositivo): simula o técnico que demorou a clicar.
create or replace function t.age_reading(p_sensor text, p_seconds numeric) returns void language plpgsql security definer set search_path to '' as $$
begin
  update public.gaxeta_readings r set received_at = r.received_at - make_interval(secs => p_seconds), sampled_at = r.sampled_at - make_interval(secs => p_seconds)
    from public.gaxeta_devices d where d.sensor_id = p_sensor and r.sensor_id = d.sensor_id and r.boot_id = d.last_boot_id and r.sequence = d.last_sequence;
  update public.gaxeta_devices set last_received_at = last_received_at - make_interval(secs => p_seconds) where sensor_id = p_sensor;
end $$;
-- Recua no tempo tudo o que já aconteceu com o sensor (leituras, estado e eventos da instalação
-- vigente), mantendo a ordem: simula um engaxetamento registrado há mais tempo.
create or replace function t.age_all(p_sensor text, p_seconds numeric) returns void language plpgsql security definer set search_path to '' as $$
begin
  update public.gaxeta_readings set received_at = received_at - make_interval(secs => p_seconds), sampled_at = sampled_at - make_interval(secs => p_seconds) where sensor_id = p_sensor;
  update public.gaxeta_devices set last_received_at = last_received_at - make_interval(secs => p_seconds) where sensor_id = p_sensor;
  update gaxeta_private.gland_events e set recorded_at = e.recorded_at - make_interval(secs => p_seconds)
    from gaxeta_private.device_links l where l.id = e.link_id and l.sensor_id = p_sensor and l.unlinked_at is null;
end $$;
grant execute on function t.age_reading(text, numeric), t.age_all(text, numeric) to public;
-- Bloco inteiro no teto do ADC, como a placa de bancada enviou (4095–4095).
\set teto '{"adc_min":4095,"adc_max":4095,"noise":0}'

-- ---------- 1. Diagnóstico do bloco e limite de idade ----------
select t.eq(t.priv('select gaxeta_private.gland_block(4095, 0, 4095, 4095)'), 'ceiling', 'bloco 4095–4095: limite do ADC (teto estável)');
select t.eq(t.priv('select gaxeta_private.gland_block(4095, 0, null, null)'), 'ceiling', 'firmware antigo com média 4095: também é o teto');
select t.eq(t.priv('select gaxeta_private.gland_block(2662, 900, 1229, 4095)'), 'mixed_high', 'bloco 1229–4095 com alta dispersão: bloco misto, não é o teto estável');
select t.eq(t.priv('select gaxeta_private.gland_block(4082, 5, 4079, 4095)'), 'touch_high', 'bloco 4079–4095: encosta no teto');
select t.eq(t.priv('select gaxeta_private.gland_block(2145.15, 7.4, 2131, 2158)'), 'ok', 'bloco 2131–2158: bom');
select t.eq(t.priv('select gaxeta_private.gland_block(2846.95, 10.12, 2832, 2866)'), 'ok', 'bloco 2832–2866 com dispersão 10,12: bom');
select t.eq(t.priv('select gaxeta_private.gland_block(2000, 60, 1900, 2100)'), 'unstable', 'dispersão acima de 25 sem tocar os limites: instável');
select t.eq(t.priv('select gaxeta_private.gland_block(0, 0, 0, 0)'), 'floor', 'bloco inteiro em zero: limite inferior');
select t.eq(t.priv('select gaxeta_private.gland_block(500, 300, 0, 1000)'), 'mixed_low', 'zeros junto com amostras muito diferentes: bloco misto no limite inferior');
select t.eq(t.priv('select gaxeta_private.gland_block(2000, 2, 1997, 2003) || ''|'' || gaxeta_private.gland_quality(2000, 2, 1997, 2003, null) || '' '' || gaxeta_private.gland_block(4095, 0, 4095, 4095) || ''|'' || gaxeta_private.gland_quality(4095, 0, 4095, 4095, null) || '' '' || gaxeta_private.gland_block(2662, 900, 1229, 4095) || ''|'' || gaxeta_private.gland_quality(2662, 900, 1229, 4095, null)'),
            'ok|ok ceiling|saturated_high mixed_high|saturated_high', 'o diagnóstico novo não muda a elegibilidade: teto e bloco misto continuam fora da calibração');
select t.eq(t.priv('select concat_ws('','', gaxeta_private.gland_confirm_max_age(null), gaxeta_private.gland_confirm_max_age(10), gaxeta_private.gland_confirm_max_age(30), gaxeta_private.gland_confirm_max_age(60), gaxeta_private.gland_confirm_max_age(180), gaxeta_private.gland_confirm_max_age(21600))'),
            '45,45,53,90,240,240', 'idade máxima para confirmar: 45 s no mínimo, um intervalo de envio (30 s → 53 s; 180 s → 240 s), 240 s no máximo');

-- ---------- 2. Cadastro 15/3 aceito com a leitura no teto; referência pendente ----------
-- A chave de ingestão de desenvolvimento aceita 10 placas e as suítes anteriores já usam 9: o ensaio
-- amplia o limite só nesta base de teste (a produção continua com 10; nada lá é alterado).
select t.priv('update gaxeta_private.ingest_keys set max_devices = 20 where max_devices = 10 returning max_devices::text') as dev_limit \gset
begin; select t.anon();
select t.ok(t.ing(:'d1', 3300, :'teto') > 0, 'placa de bancada: leitura no teto do ADC é aceita pela ingestão');
select t.ok(t.ing(:'d2', 2000) > 0 and t.ing(:'d3', 2300) > 0, 'outras duas placas do ensaio');
commit;
begin; select t.login(t.id('adm1'));
select t.put('des_eq1', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-DESTR-1', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('des_sp1', public.gaxeta_save_asset(null, t.id('des_eq1'), 'point', 'UNICO', '', '') ->> 'id');
select t.put('des_eq2', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-DESTR-2', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('des_sp2', public.gaxeta_save_asset(null, t.id('des_eq2'), 'point', 'UNICO', '', '') ->> 'id');
select t.put('des_eq3', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-DESTR-3', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('des_sp3', public.gaxeta_save_asset(null, t.id('des_eq3'), 'point', 'UNICO', '', '') ->> 'id');
select t.ok(public.gaxeta_link_sensor(:'d1', t.id('des_sp1'), 'teste 77') ->> 'sensor_id' = :'d1' and public.gaxeta_link_sensor(:'d2', t.id('des_sp2'), 'teste 77') ->> 'sensor_id' = :'d2'
        and public.gaxeta_link_sensor(:'d3', t.id('des_sp3'), 'teste 77') ->> 'sensor_id' = :'d3', 'três placas associadas aos seus spots');
select t.eq((t.gs(:'d1') ->> 'state') || '|' || (t.gs(:'d1') -> 'current' ->> 'block') || '|' || (t.gs(:'d1') -> 'current' ->> 'electric_percent') || '|' || (t.gs(:'d1') -> 'current' ->> 'at_ceiling'),
            'no_reference|ceiling|100|true', 'sem ciclo: a posição elétrica já aparece (100 % no limite do ADC)');
-- O cadastro anterior, de 16 mm, sem fim de ajuste (como o de produção).
select t.put('d_ev16', t.gev2(:'d1', 'replacement', 16));
select t.eq(t.cyc(:'d1'), 'waiting|no_sample|-|-|-', 'cadastro de 16 mm aceito com a última leitura no teto');
commit;
select t.ing(:'d1', 3300, :'teto') \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'d1'), 'waiting|saturated_high|-|-|-', 'leitura posterior no teto: referência pendente, motivo explícito');
select t.eq((t.gs(:'d1') -> 'current' ->> 'block') || '|' || coalesce(t.gs(:'d1') ->> 'candidate', 'sem candidata'), 'ceiling|sem candidata', 'teto estável: diagnóstico "limite do ADC", sem leitura candidata');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-DESTR0000001') -> 'current' ->> 'reading_id'))$$, 'saturada', 'leitura no teto não é aceita como referência');
commit;

-- ---------- 3. Substituição controlada do cadastro pendente: novo registro 15/3, nada apagado ----------
select '33333333-3333-4333-8333-333333333333'::uuid as req153 \gset
begin; select t.login(t.id('adm3'));
select t.throws($$select public.gaxeta_record_gland_event('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'event_id'), gen_random_uuid(), 'replacement', 15, 3)$$, '42501', 'adm3 (consulta) não substitui o cadastro');
commit;
begin; select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_record_gland_event('ESP32-DESTR0000001', '1', '1', gen_random_uuid(), 'replacement', 15, 3)$$, '42501', 'outra corporação não registra neste sensor');
commit;
begin; select t.login(t.id('uA_campo'));
select t.put('d_ev153', public.gaxeta_record_gland_event(:'d1', t.gs(:'d1') ->> 'link_id', t.gs(:'d1') ->> 'event_id', :'req153', 'replacement', 15, 3) ->> 'id');
select t.eq(t.gs(:'d1') ->> 'cycle_event_id', t.id_text('d_ev153'), 'caixa marcada e 15/3: o registro novo passa a ser o ciclo vigente, com a leitura ainda no teto');
select t.eq((t.gs(:'d1') ->> 'initial_mm') || '|' || (t.gs(:'d1') ->> 'end_mm') || '|' || (t.gs(:'d1') ->> 'state') || '|' || (t.gs(:'d1') ->> 'wait_reason'), '15.000|3.000|waiting|no_sample', '15 mm e 3 mm salvos; referência elétrica pendente');
select t.eq((public.gaxeta_record_gland_event(:'d1', t.gs(:'d1') ->> 'link_id', t.id_text('d_ev16'), :'req153', 'replacement', 15, 3) ->> 'id') || '|' || (public.gaxeta_record_gland_event(:'d1', t.gs(:'d1') ->> 'link_id', t.id_text('d_ev16'), :'req153', 'replacement', 15, 3) ->> 'duplicate'),
            t.id_text('d_ev153') || '|true', 'reenvio do mesmo cadastro (mesma chave) devolve o registro já gravado, sem duplicar');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'event_id'), '33333333-3333-4333-8333-333333333333', 'replacement', 15, 4)$$, 'PT409', 'a mesma chave com outras medidas é recusada');
select t.eq((select e ->> 'request_id' from jsonb_array_elements(t.gs(:'d1') -> 'events') e where e ->> 'id' = t.id_text('d_ev153')), :'req153', 'quem registrou recebe a chave do próprio registro: a tela reconcilia um envio cuja resposta se perdeu');
select t.eq((select coalesce(e ->> 'request_id', 'oculta') from jsonb_array_elements(t.gs(:'d1') -> 'events') e where e ->> 'id' = t.id_text('d_ev16')), 'oculta', 'a chave do registro de outra pessoa não é mostrada');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((select string_agg((e ->> 'id') || ':' || (e ->> 'initial_mm') || '/' || coalesce(e ->> 'end_mm', '-') || ':' || case when e -> 'anchor' = 'null'::jsonb or e -> 'anchor' is null then 'sem referência' else 'com referência' end, ' ' order by (e ->> 'id')::bigint)
               from jsonb_array_elements(t.gs(:'d1') -> 'events') e),
            t.id_text('d_ev16') || ':16.000/-:sem referência ' || t.id_text('d_ev153') || ':15.000/3.000:sem referência', 'o cadastro de 16 mm continua no histórico, sem referência; nada foi apagado nem editado');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'gland.replacement', :'d1', null)) = 2, 'os dois cadastros ficam na auditoria');
commit;
select t.eq(t.priv('select count(*) from gaxeta_private.gland_anchors a join gaxeta_private.gland_events e on e.id = a.event_id join gaxeta_private.device_links l on l.id = e.link_id where l.sensor_id = ''ESP32-DESTR0000001'''), '0', 'nenhuma referência aprovada com a leitura no teto');

-- ---------- 4. Bloco misto instável: diagnóstico próprio, sem calibrar ----------
select t.ing(:'d1', 2100, '{"adc_min":1229,"adc_max":4095,"noise":900}') \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'d1') ->> 'wait_reason') || '|' || (t.gs(:'d1') -> 'current' ->> 'block') || '|' || coalesce(t.gs(:'d1') ->> 'candidate', 'sem candidata'), 'saturated_high|mixed_high|sem candidata', 'bloco 1229–4095: inelegível, identificado como bloco misto (não como teto estável)');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-DESTR0000001') -> 'current' ->> 'reading_id'))$$, '22023', 'bloco misto não é confirmado como referência');
commit;

-- ---------- 5. Leitura intermediária não é confundida com o topo ----------
select t.ing(:'d1', 3300, :'teto') \gset
select t.ing(:'d1', 2436) as r_mid \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'waiting|needs_confirmation|-|-|-', 'leitura estável de 2,436 V depois do teto: candidata técnica');
select t.eq((t.gs(:'d1') -> 'candidate' ->> 'below_peak') || '|' || (t.gs(:'d1') -> 'candidate' -> 'peak' ->> 'block') || '|' || (t.gs(:'d1') -> 'candidate' -> 'peak' ->> 'electric_percent') || '|' || (t.gs(:'d1') -> 'candidate' ->> 'electric_percent'),
            'true|ceiling|100|73.8', 'a candidata vem marcada: desde o registro o sensor já esteve no limite do ADC (100 %), acima dos 73,8 % dela');
select t.throws($$select t.confirm('ESP32-DESTR0000001')$$, 'posição mais alta', 'sem a declaração do técnico, a leitura intermediária não vira marca superior');
commit;
select t.eq(t.priv('select count(*) from gaxeta_private.gland_anchors a join gaxeta_private.gland_events e on e.id = a.event_id join gaxeta_private.device_links l on l.id = e.link_id where l.sensor_id = ''ESP32-DESTR0000001'''), '0', 'a recusa não gravou referência');
-- Em outra instalação: o técnico declara que a posição mais baixa é mesmo a marca superior.
begin; select t.login(t.id('uA_campo'));
select t.put('d2_ev', t.gev2(:'d2', 'replacement', 20, 8));
commit;
select t.ing(:'d2', 3000) \gset
select t.ing(:'d2', 2500) as r_low \gset
begin; select t.login(t.id('uA_campo'));
select t.throws($$select t.confirm('ESP32-DESTR0000002')$$, 'posição mais alta', 'd2: 2,5 V depois de 3,0 V pede a declaração');
select t.eq(public.gaxeta_confirm_gland_anchor(:'d2', t.gs(:'d2') ->> 'link_id', t.gs(:'d2') ->> 'cycle_event_id', :'r_low', true) ->> 'duplicate', 'false', 'com a declaração, o técnico assume a posição mais baixa como marca superior');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((public.gaxeta_admin_audit(50, 0, 'gland.anchor', :'d2', null) -> 0 -> 'details' ->> 'ack_lower') || '|' || (public.gaxeta_admin_audit(50, 0, 'gland.anchor', :'d2', null) -> 0 -> 'details' -> 'higher_since_record' ->> 'voltage_mv'),
            'true|3000', 'a declaração e a leitura mais alta ficam na auditoria');
commit;

-- ---------- 6. Amostra atrasada (transporte) × leitura antiga (idade ao clicar) ----------
begin; select t.login(t.id('uA_campo'));
select t.put('d1_ev_b', t.gev2(:'d1', 'replacement', 15, 3));   -- depois do ajuste do circuito, o topo fica mensurável: novo registro
commit;
select t.ing(:'d1', 2950, '{"age":45}') \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'waiting|no_sample|-|-|-', 'amostra colhida 45 s antes (fila da placa) não serve: é anterior ao registro');
commit;
select t.age_all(:'d1', 120);
select t.ing(:'d1', 2950, '{"age":45}') \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1') || '|' || coalesce(t.gs(:'d1') ->> 'candidate', 'sem candidata'), 'waiting|stale|-|-|-|sem candidata', 'amostra atrasada: 45 s de transporte, sem candidata');
select t.ok((t.gs(:'d1') -> 'current' ->> 'transport_s')::numeric between 44 and 47 and (t.gs(:'d1') -> 'current' ->> 'age_s')::numeric < 5, 'os dois tempos aparecem separados: transporte de 45 s, idade de poucos segundos');
commit;
select t.ing(:'d1', 2950) as r_top0 \gset
begin; select t.login(t.id('uA_campo'));
select t.eq((t.gs(:'d1') ->> 'wait_reason') || '|' || (t.gs(:'d1') -> 'candidate' ->> 'reading_id') || '|' || (t.gs(:'d1') -> 'candidate' ->> 'below_peak') || '|' || (t.gs(:'d1') ->> 'confirm_max_age_s'),
            'needs_confirmation|' || :'r_top0' || '|false|45', 'leitura nova na marca superior: candidata, sem posição mais alta desde o registro, limite de 45 s para confirmar');
commit;
select t.age_reading(:'d1', 90);
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1') || '|' || coalesce(t.gs(:'d1') ->> 'candidate', 'sem candidata'), 'waiting|aged|-|-|-|sem candidata', 'o técnico demorou 90 s: a leitura deixa de ser oferecida');
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'cycle_event_id'), (select t.gs('ESP32-DESTR0000001') -> 'current' ->> 'reading_id'))$$, 'PT409', 'confirmar a leitura antiga é recusado, com as medidas preservadas');
select t.eq((t.gs(:'d1') ->> 'initial_mm') || '|' || (t.gs(:'d1') ->> 'end_mm'), '15.000|3.000', 'as medidas cadastradas continuam salvas depois da recusa');
commit;

-- ---------- 7. Topo válido e referência aprovada ----------
select t.ing(:'d1', 2950) as r_top \gset
begin; select t.login(t.id('uA_campo'));
select t.throws($$select public.gaxeta_confirm_gland_anchor('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), (select t.gs('ESP32-DESTR0000001') ->> 'cycle_event_id'), '1')$$, 'PT409', 'a confirmação vale só para a leitura atual');
select t.eq(t.confirm(:'d1') ->> 'reading_id', :'r_top', 'topo dentro da faixa mensurável: referência confirmada pela chamada de quatro parâmetros (site anterior continua compatível)');
select t.eq(t.cyc(:'d1'), 'no_scale|none|-|-|-', 'modo só elétrico: referência aprovada, sem distância nem percentual até o segundo ponto');
select t.eq((t.gs(:'d1') -> 'current' ->> 'electric_percent') || '|' || (t.gs(:'d1') -> 'current' ->> 'voltage_mv') || '|' || (t.gs(:'d1') -> 'current' ->> 'voltage_source') || '|' || (t.gs(:'d1') -> 'current' ->> 'block') || '|' || (t.gs(:'d1') ->> 'initial_mm') || '|' || (t.gs(:'d1') ->> 'end_mm'),
            '89.4|2950|calibrated|ok|15.000|3.000', 'modo só elétrico: posição elétrica (%), tensão com origem e condição, e as medidas cadastradas');
select t.eq(coalesce(t.gs(:'d1') ->> 'commission', 'sem rascunho'), 'sem rascunho', 'sem segunda medida ainda não há comissionamento a gravar');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((select (i ->> 'state') || '|' || (i ->> 'block') || '|' || (i ->> 'electric_percent') || '|' || (i ->> 'anchored') || '|' || coalesce(i ->> 'distance_mm', '-') || '|' || coalesce(i ->> 'percent', '-') || '|' || (i ->> 'initial_mm') || '|' || (i ->> 'end_mm')
               from jsonb_array_elements(public.gaxeta_gland_summary(array[:'d1']) -> 'items') i), 'no_scale|ok|89.4|true|-|-|15.000|3.000', 'resumo da lista no modo só elétrico: posição elétrica e cadastro, ciclo e milímetros indisponíveis');
commit;

-- ---------- 8. Primeiro avanço de 1–2 mm ----------
select t.ing(:'d1', 2733) \gset
begin; select t.login(t.id('uA_campo'));
select t.put('d1_chk14', t.gev2(:'d1', 'check', 14));
commit;
select t.ing(:'d1', 2733) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'no_end|outside_validated|14.00|-|1.00', 'primeiro avanço de 1 mm conferido (217 mV): 14,00 mm e 1,00 mm de avanço; percentual só quando o fim de ajuste for validado');
select t.ok((t.gs(:'d1') -> 'scale' ->> 'resolution_mm')::numeric between 0.001 and 0.2, 'a plataforma informa o menor movimento distinguível (resolução em mm)');
commit;
select t.ing(:'d1', 2516) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'out_of_range|below|13.00|-|2.00', 'avanço de 2 mm: 13,00 mm calculados, sinalizados como além do trecho já conferido');
commit;

-- ---------- 9. Fim de ajuste: 3 mm é 0 % do ciclo ----------
select t.ing(:'d1', 350) \gset
begin; select t.login(t.id('uA_campo'));
select t.put('d1_chk3', t.gev2(:'d1', 'check', 3));
commit;
select t.ing(:'d1', 350) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'active|-|3.00|0.0|12.00', 'no fim de ajuste medido: 3 mm, 0 % do ciclo e 12 mm de avanço (o zero do ciclo não é 0 mm nem 0 V)');
select t.eq((t.gs(:'d1') -> 'scale' ->> 'source') || '|' || (t.gs(:'d1') -> 'scale' ->> 'v0') || '|' || (t.gs(:'d1') -> 'scale' ->> 'points') || '|' || (t.gs(:'d1') -> 'scale' ->> 'end_ok'), 'measured|350.0|2|true', 'dois pontos medidos (1 mm e fim de ajuste) fecham a reta; V0 = 0,35 V');
commit;
select t.ing(:'d1', 1650) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'active|-|9.00|50.0|6.00', 'exemplo do roteiro: D100 = 15 mm, D0 = 3 mm, V100 = 2,95 V, V0 = 0,35 V; em 1,65 V → 9 mm, 50 % e 6 mm de avanço');
select t.eq((t.gs(:'d1') -> 'commission' -> 'origin' ->> 'at_end') || '|' || (t.gs(:'d1') -> 'commission' -> 'origin' ->> 'd100_mm') || '|' || (t.gs(:'d1') -> 'commission' -> 'origin' ->> 'v100') || '|' || (t.gs(:'d1') -> 'commission' -> 'origin' ->> 'd2_mm') || '|' || (t.gs(:'d1') -> 'commission' -> 'origin' ->> 'v2') || '|' || (t.gs(:'d1') -> 'commission' ->> 'mm_per_unit'),
            'true|15.000|2950.000|3.000|350.000|0.00461538', 'rascunho do comissionamento: V100/D100, V0/D0 no fim de ajuste e 12 mm em 2,6 V');
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), gen_random_uuid())$$, '42501', 'operador de campo não grava o perfil da instalação');
commit;

-- ---------- 10. Comissionamento em dois pontos gravado no perfil ----------
select '44444444-4444-4444-8444-444444444444'::uuid as reqcom \gset
begin; select t.login(t.id('adm3'));
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), gen_random_uuid())$$, '42501', 'adm3 não grava o perfil');
commit;
begin; select t.anon();
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000001', '1', gen_random_uuid())$$, '42501', 'anônimo não grava o perfil');
commit;
begin; select t.login(t.id('adm2'));
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000003', (select t.gs('ESP32-DESTR0000003') ->> 'link_id'), gen_random_uuid())$$, 'PT409', 'instalação sem os dois pontos: comissionamento recusado');
select t.eq(public.gaxeta_commission_gland(:'d1', t.gs(:'d1') ->> 'link_id', :'reqcom') ->> 'version', '1', 'adm2 grava o comissionamento como versão 1 do perfil');
select t.eq(public.gaxeta_commission_gland(:'d1', t.gs(:'d1') ->> 'link_id', :'reqcom') ->> 'duplicate', 'true', 'reenvio do mesmo comissionamento não cria outra versão');
select t.eq((t.gs(:'d1') -> 'profile' ->> 'version') || '|' || (t.gs(:'d1') -> 'profile' ->> 'high_value') || '|' || (t.gs(:'d1') -> 'profile' ->> 'valid_lo') || '|' || (t.gs(:'d1') -> 'profile' ->> 'valid_hi') || '|' || (t.gs(:'d1') -> 'profile' ->> 'mm_per_unit') || '|' || (t.gs(:'d1') -> 'profile' -> 'origin' ->> 'check_event_id'),
            '1|2950.000|350.000|2950.000|0.00461538|' || t.id_text('d1_chk3'), 'perfil com a marca superior, a faixa validada, a razão medida e a origem (ciclo e conferência)');
select t.ok(t.gs(:'d1') -> 'profile' ->> 'note' like 'Comissionamento em dois pontos%15.000 mm em 2950.000 mV; 3.000 mm em 350.000 mV (fim de ajuste).', 'a observação do perfil documenta os dois pontos');
select t.eq(t.cyc(:'d1') || '|' || (t.gs(:'d1') -> 'scale' ->> 'source') || '|' || (t.gs(:'d1') -> 'scale' ->> 'profile_version'), 'active|-|9.00|50.0|6.00|ratio|1', 'depois de gravado, o cálculo vem do perfil e dá os mesmos 9 mm, 50 % e 6 mm');
select t.eq(coalesce(t.gs(:'d1') ->> 'commission', 'sem rascunho'), 'sem rascunho', 'gravado o perfil, não há comissionamento pendente');
select t.throws($$select public.gaxeta_commission_gland('ESP32-DESTR0000001', (select t.gs('ESP32-DESTR0000001') ->> 'link_id'), gen_random_uuid())$$, 'PT409', 'sem conferência nova não há outra versão a gravar');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'gland.commission', :'d1', null)) = 1, 'o comissionamento fica na auditoria');
commit;

-- ---------- 11. Nova troca com medidas diferentes: sem repetir o comissionamento ----------
begin; select t.login(t.id('uA_campo'));
select t.put('d1_mnt', t.gev2(:'d1', 'maintenance'));
select t.put('d1_ev_c', t.gev2(:'d1', 'replacement', 12, 2));
select t.eq((t.gs(:'d1') -> 'window' ->> 'source') || '|' || (t.gs(:'d1') -> 'window' ->> 'lo') || '|' || (t.gs(:'d1') -> 'window' ->> 'hi'), 'profile|2890.000|3010.000', 'a marca superior esperada vem do perfil comissionado (2,95 V ± 60 mV)');
commit;
select t.ing(:'d1', 2436) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'waiting|outside_window|-|-|-', 'com a marca caracterizada, 2,436 V não é aceito como topo');
commit;
select t.ing(:'d1', 2960) as r_auto \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.priv('select mode || ''|'' || reading_id from gaxeta_private.gland_anchors where event_id = ' || t.id_text('d1_ev_c')), 'window|' || :'r_auto', 'leitura na marca superior do perfil: referência aprovada sozinha, sem confirmação manual');
select t.eq(t.cyc(:'d1') || '|' || (t.gs(:'d1') -> 'scale' ->> 'source'), 'active|-|12.00|100.0|0.00|ratio', 'novo ciclo: 12 mm é o 100 % e 2 mm o 0 %, com a razão do perfil');
commit;
select t.ing(:'d1', 1960) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'active|-|7.38|53.8|4.62', 'medidas diferentes, mesma instalação: 1,0 V a menos = 4,62 mm de avanço em 10 mm de curso');
commit;
select t.ing(:'d1', 794) \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'active|-|2.00|0.0|10.00', 'fim de ajuste do novo ciclo: 2 mm é 0 %');
commit;
-- Método elétrico diferente não reaproveita o perfil.
select t.ing(:'d1', 1960, '{"method":"a1-12db-n64-cf"}') \gset
begin; select t.login(t.id('uA_campo'));
select t.eq(t.cyc(:'d1'), 'no_scale|method_changed|-|-|-', 'outro método de aquisição: o perfil não é reaproveitado sem nova comprovação');
commit;
select t.ing(:'d1', 1960) \gset
-- Reinstalação (outro vínculo): o perfil não acompanha o sensor.
begin; select t.login(t.id('adm1'));
select public.gaxeta_unlink_sensor(:'d2', 'teste 77') ->> 'sensor_id' as un2 \gset
select t.eq(public.gaxeta_link_sensor(:'d2', t.id('des_sp2'), 'teste 77: reinstalação') ->> 'sensor_id', :'d2', 'd2 reinstalado');
select t.put('d2_ev2', t.gev2(:'d2', 'replacement', 20, 8));
commit;
select t.ing(:'d2', 2500) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.cyc(:'d2'), 'waiting|needs_confirmation|-|-|-', 'montagem nova: o comissionamento é refeito');
commit;

-- ---------- 12. Modo só elétrico sem nenhum cadastro ----------
select t.ing(:'d3', 2300, '{"legacy":true}') \gset
begin; select t.login(t.id('uA_campo'));
select t.eq((t.gs(:'d3') ->> 'state') || '|' || (t.gs(:'d3') -> 'current' ->> 'electric_percent') || '|' || (t.gs(:'d3') -> 'current' ->> 'voltage_source') || '|' || (t.gs(:'d3') -> 'current' ->> 'block') || '|' || coalesce(t.gs(:'d3') ->> 'distance_mm', '-'),
            'no_reference|69.7|estimated|ok|-', 'sem cadastro e com firmware antigo: posição elétrica e tensão estimada, sem milímetros');
commit;

-- ---------- 13. Núcleo intocado e privilégios ----------
select t.eq(md5(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)
        || pg_get_functiondef('public.gaxeta_ingest(text,jsonb)'::regprocedure) || pg_get_functiondef('public.gaxeta_record_gland_event(text,text,text,uuid,text,numeric,numeric)'::regprocedure)), :'core_hash', 'ingestão, estabilização e registro de eventos sem alteração');
select t.ok(not has_function_privilege('anon', 'public.gaxeta_confirm_gland_anchor(text,text,text,text,boolean)', 'EXECUTE') and not has_function_privilege('anon', 'public.gaxeta_commission_gland(text,text,uuid)', 'EXECUTE')
        and has_function_privilege('authenticated', 'public.gaxeta_commission_gland(text,text,uuid)', 'EXECUTE'), 'funções novas: fechadas para anônimo, abertas para contas autenticadas (a permissão é decidida dentro)');
select t.ok(not has_function_privilege('authenticated', 'gaxeta_private.gland_block(numeric,numeric,integer,integer)', 'EXECUTE') and not has_function_privilege('authenticated', 'gaxeta_private.gland_peak(text,timestamptz,bigint)', 'EXECUTE')
        and not has_function_privilege('authenticated', 'gaxeta_private.gland_commission_draft(bigint,bigint)', 'EXECUTE'), 'funções internas não são chamáveis pela API');
select t.eq((select count(*) from pg_proc where proname = 'gaxeta_confirm_gland_anchor'), 1::bigint, 'uma única versão da confirmação (sem sobrecarga ambígua para a API)');
