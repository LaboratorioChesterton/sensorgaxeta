\set ON_ERROR_STOP 1
-- Migração 12: posição elétrica. Ingestão sem referência mecânica, leitura só elétrica (sem
-- position_mm), regra dos 5 p.p., duplicata, reinício, atraso, isolamento entre sensores, troca de
-- escala elétrica, placa nova sem spot e resumo de telemetria (cadência de 30 s e de 180 s).
-- Roda depois da suíte 77 e da migração 12. As leituras entram pela rota real de ingestão.
-- Nada aqui toca dados de produção.
select set_config('t.suite', '78 posição elétrica', false);

\set e1 'ESP32-ELETR0000001'
\set e2 'ESP32-ELETR0000002'
\set e3 'ESP32-ELETR0000003'
\set e4 'ESP32-ELETR0000004'
\set tok 'dev-token-0123456789abcdef0123456789abcdef'

-- Envia uma leitura com o percentual indicado. Sem 'legacy', o pacote é o elétrico novo (sem
-- position_mm). Com 'legacy', é o pacote do firmware 4.3.2, com position_mm nominal.
create or replace function t.ingp(p_sensor text, p_percent numeric, p_opts jsonb default '{}') returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare v_boot text := coalesce(p_opts ->> 'boot', md5(p_sensor || 'eletrica')); v_seq bigint; v_adc numeric; v_now timestamptz; v_payload jsonb;
begin
  perform pg_sleep(0.8); v_now := clock_timestamp();
  v_seq := coalesce((p_opts ->> 'seq')::bigint, (select coalesce(max(sequence), 0) + 1 from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot));
  v_adc := round(p_percent * 40.95, 2);
  v_payload := jsonb_build_object('sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', v_seq, 'origin', 'esp32',
    'travel_percent', p_percent, 'voltage_v', round(v_adc * 3.3 / 4095, 4),
    'adc_raw', v_adc, 'adc_noise', coalesce((p_opts ->> 'noise')::numeric, 2), 'rssi', -50, 'uptime_ms', v_seq * 1000,
    'sampled_at', to_char(v_now at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'firmware_version', case when p_opts ? 'legacy' then '4.3.2-cont30' else '4.3.3-cont30' end,
    'voltage_mv', round(v_adc * 3100 / 4095),
    'adc_min', coalesce((p_opts ->> 'adc_min')::int, greatest(0, floor(v_adc)::int - 3)),
    'adc_max', coalesce((p_opts ->> 'adc_max')::int, least(4095, ceil(v_adc)::int + 3)),
    'acq_method', 'a1-12db-n20-cf-c3');
  if p_opts ? 'legacy' then v_payload := v_payload || jsonb_build_object('position_mm', round(p_percent / 2, 3)); end if;
  if p_opts ? 'scale' then v_payload := v_payload || jsonb_build_object('percent_scale', p_opts ->> 'scale'); end if;
  if p_opts ? 'extra' then v_payload := v_payload || (p_opts -> 'extra'); end if;
  if p_opts ? 'drop' then v_payload := v_payload - (p_opts ->> 'drop'); end if;
  return public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', v_payload);
end $$;
grant execute on function t.ingp(text, numeric, jsonb) to public;
-- Estado do filtro de um sensor: estável|atual|movimentos
create or replace function t.est(p_sensor text) returns text language sql security definer set search_path to '' as $$
  select d.stable_percent || '|' || d.last_percent || '|' || (select count(*) from public.gaxeta_movements m where m.sensor_id = d.sensor_id)
    from public.gaxeta_devices d where d.sensor_id = p_sensor $$;
grant execute on function t.est(text) to public;
-- Espaça as quatro últimas leituras de um sensor com o intervalo indicado (simula a cadência da placa).
create or replace function t.cadencia(p_sensor text, p_seconds numeric) returns void language plpgsql security definer set search_path to '' as $$
begin
  update public.gaxeta_readings r set received_at = q.ts, sampled_at = q.ts - interval '3 seconds'
    from (select id, clock_timestamp() - make_interval(secs => p_seconds * (row_number() over (order by received_at desc, id desc) - 1)) as ts
            from public.gaxeta_readings where sensor_id = p_sensor order by received_at desc, id desc limit 4) q
   where r.id = q.id;
  update public.gaxeta_devices set last_received_at = clock_timestamp() where sensor_id = p_sensor;
end $$;
grant execute on function t.cadencia(text, numeric) to public;

select (select count(*) from gaxeta_private.gland_events) as ev0, (select count(*) from gaxeta_private.gland_anchors) as an0,
       (select count(*) from gaxeta_private.gland_profiles) as pf0, (select count(*) from gaxeta_private.device_links) as lk0,
       (select count(*) from public.gaxeta_devices where origin = 'esp32') as dev0 \gset
select t.priv('update gaxeta_private.ingest_keys set max_devices = 30 returning max_devices::text') as dev_limit \gset

-- ---------- 1. Contrato da ingestão ----------
select t.ok(pg_get_functiondef('public.gaxeta_ingest(text,jsonb)'::regprocedure) !~* 'gland', 'gaxeta_ingest não chama mais nenhuma rotina do ciclo de gaxeta');
select t.ok(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) !~* 'gland', 'gaxeta_ingest_v3 sem rotina do ciclo de gaxeta');
select t.eq(md5(regexp_replace((select prosrc from pg_proc where oid = 'gaxeta_private.stabilize(numeric,numeric)'::regprocedure), '\s+', '', 'g')),
            md5(regexp_replace('select case when p_raw is null or p_raw not between 0 and 100 then p_previous when p_previous is null or abs(p_raw-p_previous)>=5 then p_raw else p_previous end', '\s+', '', 'g')),
            'gaxeta_private.stabilize intocada (limiar de 5 p.p.)');
select t.eq((select string_agg(distinct g.grantee::regrole::text, ',' order by g.grantee::regrole::text) from pg_proc p, aclexplode(p.proacl) g where p.oid = 'public.gaxeta_ingest(text,jsonb)'::regprocedure),
            'anon,authenticated,postgres,service_role', 'permissões de gaxeta_ingest preservadas');
select t.eq((select string_agg(distinct g.grantee::regrole::text, ',' order by g.grantee::regrole::text) from pg_proc p, aclexplode(p.proacl) g where p.oid = 'public.gaxeta_ingest_v3(text,jsonb)'::regprocedure),
            'postgres,service_role', 'permissões de gaxeta_ingest_v3 preservadas (sem acesso anônimo direto)');

begin; select t.anon();
select t.eq((t.ingp(:'e1', 26.1, '{"legacy":true}') - 'id' - 'received_at')::text, '{"ok": true, "duplicate": false}', 'firmware 4.3.2 (com position_mm) continua aceito, com a mesma resposta');
select t.eq((t.ingp(:'e2', 40.0) - 'id' - 'received_at')::text, '{"ok": true, "duplicate": false}', 'pacote elétrico novo, sem position_mm, é aceito');
select t.eq((t.ingp(:'e2', 40.1, '{"extra":{"position_mm":null}}') ->> 'ok'), 'true', 'position_mm nulo é aceito');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 40.2, '{"extra":{"position_mm":"12"}}')$$, '22023', 'position_mm em texto é rejeitado');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 40.2, '{"extra":{"position_mm":-1}}')$$, '22023', 'position_mm negativo continua rejeitado');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 40.2, '{"drop":"travel_percent"}')$$, '22023', 'sem travel_percent a leitura continua rejeitada');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 40.2, '{"drop":"voltage_v"}')$$, '22023', 'sem voltage_v a leitura continua rejeitada');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 140)$$, '22023', 'percentual acima de 100 continua rejeitado');
select t.throws($$select t.ingp('ESP32-ELETR0000002', 40.2, '{"scale":"MV 0-2400"}')$$, '22023', 'escala do percentual fora do formato é rejeitada');
select t.throws($$select public.gaxeta_ingest('token-errado-0123456789abcdef0123456789abcdef', '{}'::jsonb)$$, 'PT401', 'credencial inválida continua recusada');
commit;
select t.eq((select position_mm::text || '|' || (voltage_mv is not null) from public.gaxeta_readings where sensor_id = :'e1' order by id desc limit 1), '13.050|true', 'pacote antigo: position_mm legado é guardado como veio, com a tensão calibrada');
select t.eq((select count(*) filter (where position_mm is null) || '/' || count(*) from public.gaxeta_readings where sensor_id = :'e2'), '2/2', 'pacote elétrico: nenhuma medida em mm é gravada (position_mm nulo)');
select t.eq((select coalesce(last_position_mm::text, 'nulo') || '|' || last_percent || '|' || last_voltage_mv from public.gaxeta_devices where sensor_id = :'e2'), 'nulo|40.1|1243', 'leitura atual do sensor: percentual e tensão, sem mm');

-- ---------- 2. Placa nova entra sem vínculo e já mostra a posição elétrica ----------
select t.eq((select count(*) from public.gaxeta_devices where origin = 'esp32'), :dev0::bigint + 2, 'duas placas novas viraram dois sensores, com identificadores distintos');
select t.eq((select string_agg(coalesce(measurement_point_id::text, 'sem vínculo'), ',') from public.gaxeta_devices where sensor_id in (:'e1', :'e2')), 'sem vínculo,sem vínculo', 'placa nova entra sem vínculo');
select t.eq((select count(*) from gaxeta_private.device_links), :lk0::bigint, 'a ingestão não cria vínculo: a associação ao spot continua manual');
begin; select t.login(t.id('adm1'));
select t.eq((select string_agg((i ->> 'sensor_id') || ':' || (i ->> 'linked') || ':' || (i ->> 'percent') || ':' || (i ->> 'voltage_mv') || ':' || (i ->> 'voltage_source') || ':' || (i ->> 'block'), ' ' order by i ->> 'sensor_id')
               from jsonb_array_elements(public.gaxeta_telemetry_summary(array[:'e1', :'e2']) -> 'items') i),
            'ESP32-ELETR0000001:false:26.10:809:calibrated:ok ESP32-ELETR0000002:false:40.10:1243:calibrated:ok',
            'resumo de telemetria: sensor sem vínculo já tem posição elétrica (%) e tensão (mV calibrados)');
select t.ok(not (public.gaxeta_telemetry_summary(array[:'e1']) -> 'items' -> 0) ?| array['state', 'distance_mm', 'initial_mm', 'end_mm', 'advance_mm', 'cycle_event_id', 'anchored'],
            'resumo de telemetria não traz nenhum campo mecânico (estado do ciclo, mm, avanço)');
select t.throws($$select public.gaxeta_telemetry_summary(array(select 'S' || g from generate_series(1, 201) g))$$, '22023', 'resumo limitado a 200 sensores por chamada');
commit;
begin; select t.login(t.id('uA_all'));
select t.eq(jsonb_array_length(public.gaxeta_telemetry_summary(array[:'e1', :'e2']) -> 'items'), 0, 'usuário de corporação não lê sensor sem vínculo no seu ramo');
commit;
begin; select t.anon();
select t.throws($$select public.gaxeta_telemetry_summary(array['ESP32-ELETR0000001'])$$, '42501', 'resumo de telemetria negado sem login');
commit;

-- ---------- 3. Regra dos 5 p.p. (última posição estabilizada) ----------
select t.eq(t.est(:'e1'), '26.1|26.1|1', 'primeira leitura inicializa a linha estabilizada (um registro inicial)');
begin; select t.anon();
select t.ok((t.ingp(:'e1', 26.2) ->> 'ok')::boolean, '26,1 → 26,2');
commit;
select t.eq(t.est(:'e1'), '26.1|26.2|1', '26,1 → 26,2: mesma posição estável, nenhuma mudança no histórico');
begin; select t.anon(); select t.ok((t.ingp(:'e1', 31.0) ->> 'ok')::boolean, '→ 31,0'); commit;
select t.eq(t.est(:'e1'), '26.1|31.0|1', 'saindo de 26,1, 31,0 (4,9 p.p.) ainda mantém o estável');
begin; select t.anon(); select t.ok((t.ingp(:'e1', 31.1) ->> 'ok')::boolean, '→ 31,1'); commit;
select t.eq(t.est(:'e1'), '31.1|31.1|2', '31,1 (5,0 p.p.) registra a mudança');
select t.eq((select previous_percent || '→' || stable_percent from public.gaxeta_movements where sensor_id = :'e1' order by received_at desc, reading_id desc limit 1), '26.1→31.1', 'a mudança guarda o estável anterior e o novo');
begin; select t.anon(); select t.ok((t.ingp(:'e1', 26.2) ->> 'ok')::boolean, '→ 26,2'); commit;
select t.eq(t.est(:'e1'), '31.1|26.2|2', 'na descida, 4,9 p.p. também mantém o estável');
begin; select t.anon(); select t.ok((t.ingp(:'e1', 26.1) ->> 'ok')::boolean, '→ 26,1'); commit;
select t.eq(t.est(:'e1'), '26.1|26.1|3', 'na descida, 5,0 p.p. registra a mudança (as duas direções)');
select t.eq((select stable_percent::text from public.gaxeta_readings where sensor_id = :'e1' order by id desc limit 1), '26.1', 'cada leitura guarda a linha estabilizada vigente');

-- ---------- 4. Duplicata, atraso, reinício e isolamento ----------
select (select max(sequence) from public.gaxeta_readings where sensor_id = :'e1') as seq1 \gset
select (select count(*) from public.gaxeta_readings where sensor_id = :'e1') as n1 \gset
begin; select t.anon();
select t.eq(t.ingp(:'e1', 90, jsonb_build_object('seq', :seq1)) ->> 'duplicate', 'true', 'reenvio do mesmo sensor_id + boot_id + sequence é reconhecido como duplicata');
commit;
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'e1'), :n1::bigint, 'duplicata não cria leitura');
select t.eq(t.est(:'e1'), '26.1|26.1|3', 'duplicata não altera a leitura atual, o estável nem o histórico de mudanças');
begin; select t.anon();
select t.ok((t.ingp(:'e1', 80, jsonb_build_object('seq', :seq1 + 5)) ->> 'ok')::boolean, 'sequência adiantada (a placa amostra mais do que envia)');
select t.eq(t.ingp(:'e1', 10, jsonb_build_object('seq', :seq1 + 2)) ->> 'duplicate', 'false', 'amostra atrasada da mesma inicialização entra no histórico');
commit;
select t.eq(t.est(:'e1'), '80|80|4', 'amostra atrasada não regride a leitura atual nem gera mudança');
begin; select t.anon();
select t.ok((t.ingp(:'e1', 81.5, '{"boot":"aaaaaaaaaaaaaaaabbbbbbbbbbbbbbbb","seq":1}') ->> 'ok')::boolean, 'reinício: nova inicialização, sequência volta a 1');
commit;
select t.eq(t.est(:'e1'), '80|81.5|4', 'depois do reinício o filtro continua comparando com o último estável (sem mudança falsa)');
select t.eq((select last_boot_id || '|' || last_sequence from public.gaxeta_devices where sensor_id = :'e1'), 'aaaaaaaaaaaaaaaabbbbbbbbbbbbbbbb|1', 'a leitura atual é a da nova inicialização');
select t.eq(t.est(:'e2'), '40.0|40.1|1', 'o outro sensor não foi afetado: filtros independentes por sensor_id');

-- ---------- 5. Troca de escala elétrica (limites fixos na placa) ----------
begin; select t.anon(); select t.ok((t.ingp(:'e3', 50.0) ->> 'ok')::boolean and (t.ingp(:'e3', 51.0) ->> 'ok')::boolean, 'placa na escala do ADC bruto'); commit;
select t.eq(t.est(:'e3'), '50.0|51.0|1', 'antes da troca: estável em 50');
begin; select t.anon(); select t.ok((t.ingp(:'e3', 68.0, '{"scale":"mv-140-2400"}') ->> 'ok')::boolean, 'mesma posição física, agora em mV com limites fixos'); commit;
select t.eq(t.est(:'e3'), '68.0|68.0|1', 'troca de escala: a referência do filtro recomeça no valor novo, sem registrar mudança');
select t.eq((select last_percent_scale from public.gaxeta_devices where sensor_id = :'e3'), 'mv-140-2400', 'o sensor passa a informar a escala vigente');
begin; select t.anon(); select t.ok((t.ingp(:'e3', 72.9, '{"scale":"mv-140-2400"}') ->> 'ok')::boolean, '+4,9 na escala nova'); commit;
select t.eq(t.est(:'e3'), '68.0|72.9|1', 'na escala nova, 4,9 p.p. mantém o estável');
begin; select t.anon(); select t.ok((t.ingp(:'e3', 73.0, '{"scale":"mv-140-2400"}') ->> 'ok')::boolean, '+5,0 na escala nova'); commit;
select t.eq(t.est(:'e3'), '73.0|73.0|2', 'na escala nova, 5,0 p.p. registra a mudança');
select t.eq((select string_agg(coalesce(percent_scale, 'adc bruto'), ',' order by id) from public.gaxeta_readings where sensor_id = :'e3'), 'adc bruto,adc bruto,mv-140-2400,mv-140-2400,mv-140-2400', 'cada leitura guarda a escala em que foi calculada: o histórico antigo continua interpretável');
begin; select t.login(t.id('adm1'));
select t.eq((select bool_and(b ? 'percent_scale' and b ? 'scale_mixed') || '|' || bool_or((b ->> 'percent_scale') = 'mv-140-2400') || '|' || bool_or((b ->> 'scale_mixed')::boolean or b ->> 'percent_scale' is null)
               from jsonb_array_elements(public.gaxeta_history(:'e3', now() - interval '1 hour', now() + interval '1 minute') -> 'history') b),
            'true|true|true', 'histórico informa a escala de cada intervalo e marca o intervalo em que a escala mudou');
commit;

-- ---------- 6. Qualidade elétrica: saturação, bloco instável e cursor desconectado ----------
begin; select t.anon();
select t.ok((t.ingp(:'e4', 100, '{"adc_min":4095,"adc_max":4095,"noise":0}') ->> 'ok')::boolean, 'bloco inteiro em 4095');
commit;
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array[:'e4']) -> 'items' -> 0 ->> 'block', 'ceiling', 'bloco 4095–4095: limite do ADC (100 % da escala elétrica)');
commit;
begin; select t.anon(); select t.ok((t.ingp(:'e4', 17.1, '{"adc_min":281,"adc_max":1145,"noise":190}') ->> 'ok')::boolean, 'entrada flutuando (como a C3 sem potenciômetro)'); commit;
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array[:'e4']) -> 'items' -> 0 ->> 'block', 'unstable', 'bloco muito disperso sem tocar os limites: instável (cursor solto ou giro na aquisição), não é posição');
commit;
begin; select t.anon(); select t.ok((t.ingp(:'e4', 74.0, '{"adc_min":968,"adc_max":4095,"noise":1211}') ->> 'ok')::boolean, 'amostras em 4095 junto com amostras baixas'); commit;
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array[:'e4']) -> 'items' -> 0 ->> 'block', 'mixed_high', 'bloco misto no limite superior: diagnóstico próprio, diferente do platô');
commit;
select t.eq(t.priv('select concat_ws('','', gaxeta_private.adc_block(0,0,0,0), gaxeta_private.adc_block(2000,2,1997,2003), gaxeta_private.adc_block(4082,5,4079,4095), gaxeta_private.adc_block(2000,null,null,null), gaxeta_private.adc_block(null,null,null,null))'),
            'floor,ok,touch_high,unknown,missing', 'diagnóstico do bloco: piso, bom, encosta no teto, firmware sem diagnóstico e sem leitura');

-- ---------- 7. Cadência: 30 s (bancada) e 180 s (variante em uso) ----------
begin; select t.anon(); select t.ok((t.ingp(:'e2', 40.2) ->> 'ok')::boolean and (t.ingp(:'e2', 40.3) ->> 'ok')::boolean, 'mais duas leituras para medir a cadência'); commit;
select t.cadencia(:'e2', 30);
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array[:'e2']) -> 'items' -> 0 ->> 'interval_s', '30', 'cadência de bancada reconhecida: 30 s');
commit;
select t.cadencia(:'e2', 180);
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array[:'e2']) -> 'items' -> 0 ->> 'interval_s', '180', 'cadência de 180 s continua reconhecida');
select t.eq(public.gaxeta_telemetry_summary(array[:'e2']) -> 'items' -> 0 ->> 'transport_s', '3.0', 'tempo de transporte (amostra → chegada) informado à parte');
commit;

-- ---------- 8. Nenhuma operação cria ciclo, referência ou perfil ----------
select t.eq((select count(*) from gaxeta_private.gland_events), :ev0::bigint, 'nenhum evento de gaxeta criado pela ingestão ou pelas consultas');
select t.eq((select count(*) from gaxeta_private.gland_anchors), :an0::bigint, 'nenhuma referência aprovada pela ingestão');
select t.eq((select count(*) from gaxeta_private.gland_profiles), :pf0::bigint, 'nenhum perfil de instalação criado');

-- ---------- 9. Sensor vinculado: a leitura atual também não aprova referência ----------
-- Na suíte 77 o sensor ESP32-DESTR0000002 ficou vinculado. Uma leitura nova dele não pode gerar referência.
begin; select t.anon();
select t.ok(t.ing('ESP32-DESTR0000002', 2100) > 0, 'sensor vinculado continua enviando pela mesma rota');
commit;
select t.eq((select count(*) from gaxeta_private.gland_anchors), :an0::bigint, 'leitura de sensor vinculado não aprova referência mecânica');
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_telemetry_summary(array['ESP32-DESTR0000002']) -> 'items' -> 0 ->> 'linked', 'true', 'sensor vinculado aparece no mesmo resumo elétrico, identificado como vinculado');
commit;
