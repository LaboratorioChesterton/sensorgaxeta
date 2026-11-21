\set ON_ERROR_STOP 1
-- Migração 14: contrato magnético (AS5600). Ingestão por modalidade, saúde sem posição fictícia,
-- geometria por revisão, engaxetamento com um clique, captura da referência, curso restante,
-- limiar de 5 p.p., vínculo e tempo, convivência com o potenciômetro, histórico e autorização.
-- Roda depois da suíte 78/79 e da migração 14. As leituras entram pelas rotas reais de ingestão.
-- SIMULAÇÃO em banco local: nenhum ângulo aqui veio de sensor físico. Nada toca produção.
select set_config('t.suite', '84 contrato magnético AS5600', false);

\set m1 'ESP32-MAGNE0000001'
\set m2 'ESP32-MAGNE0000002'
\set m3 'ESP32-MAGNE0000003'
\set m4 'ESP32-MAGNE0000004'
\set mb 'ESP32-MAGNE00000B1'

create or replace function t.priv(p_sql text) returns text language plpgsql security definer set search_path to '' as $$
declare v text; begin execute p_sql into v; return v; end $$;
grant execute on function t.priv(text) to public;

-- Envia uma leitura magnética (schema 4). p_raw nulo = sem ângulo. Opções: boot, seq, pp, mag, bus,
-- age (segundos atrás no relógio da placa), sampled:'none' (sem relógio), capture, extra, drop.
create or replace function t.mag(p_sensor text, p_raw integer, p_opts jsonb default '{}') returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare v_boot text := coalesce(p_opts ->> 'boot', md5(p_sensor || 'mag')); v_seq bigint; v_now timestamptz := clock_timestamp(); v jsonb;
        v_bus text := coalesce(p_opts ->> 'bus', 'ok'); v_mag text;
begin
  -- A rota exige 750 ms entre leituras do mesmo sensor; o ensaio recua o relógio da última em vez de esperar.
  update public.gaxeta_devices set last_received_at = last_received_at - interval '2 seconds' where sensor_id = p_sensor;
  v_seq := coalesce((p_opts ->> 'seq')::bigint, (select coalesce(max(sequence), 0) + 1 from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot));
  v_mag := case when v_bus = 'ok' then coalesce(p_opts ->> 'mag', 'ok') end;
  v := jsonb_build_object('schema_version', 4, 'modality', 'as5600_i2c', 'sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', v_seq,
    'origin', 'esp32', 'raw_angle', p_raw, 'angle_pp', case when p_raw is not null then coalesce((p_opts ->> 'pp')::int, 1) end,
    'mag_status', v_mag, 'bus_status', v_bus, 'agc', case when v_bus = 'ok' then 61 end, 'magnitude', case when v_bus = 'ok' then 1850 end,
    'rssi', -50, 'uptime_ms', v_seq * 1000, 'send_period_s', 30, 'firmware_version', '4.4.0-mag30', 'acq_method', 'as5600-i2c-n20-circ',
    'sampled_at', case when p_opts ->> 'sampled' = 'none' then null
       else to_char((v_now - make_interval(secs => coalesce((p_opts ->> 'age')::numeric, 0))) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end);
  if p_opts ? 'capture' then v := v || jsonb_build_object('capture', p_opts ->> 'capture'); end if;
  if p_opts ? 'extra' then v := v || (p_opts -> 'extra'); end if;
  if p_opts ? 'drop' then v := v - (p_opts ->> 'drop'); end if;
  return public.gaxeta_ingest_v4('dev-token-0123456789abcdef0123456789abcdef', v);
end $$;
grant execute on function t.mag(text, integer, jsonb) to public;
-- Pacote do potenciômetro como o firmware 4.3.2 envia (valores da leitura real 105997 da C3 de bancada).
create or replace function t.pot(p_sensor text, p_percent numeric, p_opts jsonb default '{}') returns jsonb
 language plpgsql security definer set search_path to '' as $$
declare v_boot text := coalesce(p_opts ->> 'boot', md5(p_sensor || 'pot')); v_seq bigint; v jsonb;
begin
  update public.gaxeta_devices set last_received_at = last_received_at - interval '2 seconds' where sensor_id = p_sensor;
  v_seq := (select coalesce(max(sequence), 0) + 1 from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot);
  v := jsonb_build_object('sensor_id', p_sensor, 'boot_id', v_boot, 'sequence', v_seq, 'origin', 'esp32', 'wifi_mac', '44:BD:8D:29:70:40',
    'travel_percent', p_percent, 'position_mm', round(p_percent / 2, 3), 'voltage_v', round(p_percent * 0.033, 4), 'adc_raw', round(p_percent * 40.95, 3),
    'rssi', -57, 'uptime_ms', v_seq * 5000, 'sampled_at', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'device_name', 'GAXETA-ESP32', 'ble_mac', '44:bd:8d:29:70:42', 'firmware_version', coalesce(p_opts ->> 'fw', '4.3.2-cont30'), 'adc_noise', 2.5,
    'voltage_mv', round(p_percent * 30.4), 'adc_min', greatest(0, floor(p_percent * 40.95)::int - 4), 'adc_max', least(4095, ceil(p_percent * 40.95)::int + 4),
    'acq_method', 'a1-12db-n20-cf-c3');
  if p_opts ? 'extra' then v := v || (p_opts -> 'extra'); end if;
  if p_opts ? 'drop' then v := v - (p_opts ->> 'drop'); end if;
  return public.gaxeta_ingest('dev-token-0123456789abcdef0123456789abcdef', v);
end $$;
grant execute on function t.pot(text, numeric, jsonb) to public;
-- Estado magnético atual de um sensor, como a interface recebe.
create or replace function t.ms(p_sensor text) returns jsonb language sql as $$
  select public.gaxeta_mag_summary(array[p_sensor]) -> 'items' -> 0 $$;
-- Faz o clique parecer ter ocorrido há p_secs segundos (o ensaio não espera o relógio).
create or replace function t.mag_ago(p_sensor text, p_secs numeric) returns void language sql security definer set search_path to '' as $$
  update gaxeta_private.mag_services set requested_at = requested_at - make_interval(secs => p_secs) where sensor_id = p_sensor and status = 'pending' $$;
grant execute on function t.mag_ago(text, numeric) to public;
create or replace function t.svc(p_sensor text) returns text language sql security definer set search_path to '' as $$
  select string_agg(status || coalesce(':' || end_reason, ''), ',' order by id) from gaxeta_private.mag_services where sensor_id = p_sensor $$;
grant execute on function t.svc(text) to public;
create or replace function t.mmov(p_sensor text) returns bigint language sql security definer set search_path to '' as $$
  select count(*) from gaxeta_private.mag_movements where sensor_id = p_sensor $$;
grant execute on function t.mmov(text) to public;

select (select count(*) from gaxeta_private.gland_events) as ev0, (select count(*) from gaxeta_private.gland_anchors) as an0,
       (select count(*) from gaxeta_private.gland_profiles) as pf0, (select count(*) from public.gaxeta_movements) as mv0,
       (select count(*) from public.gaxeta_readings) as rd0 \gset
select t.priv('update gaxeta_private.ingest_keys set max_devices = 40 returning max_devices::text') as dev_limit \gset

-- ---------- 1. Contrato e compatibilidade ----------
select t.eq((select count(*) from public.gaxeta_readings where modality <> 'adc_pot'), 0::bigint, 'todas as leituras anteriores ficaram como adc_pot (discriminador por leitura)');
select t.eq((select count(*) from public.gaxeta_readings where travel_percent is null or voltage_v is null), 0::bigint, 'nenhuma leitura elétrica perdeu percentual ou tensão');
select t.eq(md5(regexp_replace((select prosrc from pg_proc where oid = 'gaxeta_private.stabilize(numeric,numeric)'::regprocedure), '\s+', '', 'g')),
            md5(regexp_replace('select case when p_raw is null or p_raw not between 0 and 100 then p_previous when p_previous is null or abs(p_raw-p_previous)>=5 then p_raw else p_previous end', '\s+', '', 'g')),
            'gaxeta_private.stabilize (limiar elétrico de 5 p.p.) intocada');
select t.ok(pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure) !~* 'mag_|modality', 'gaxeta_ingest_v3 intocada pela migração 14');
select t.eq((select string_agg(distinct g.grantee::regrole::text, ',' order by g.grantee::regrole::text) from pg_proc p, aclexplode(p.proacl) g where p.oid = 'public.gaxeta_ingest(text,jsonb)'::regprocedure),
            'anon,authenticated,postgres,service_role', 'permissões de gaxeta_ingest preservadas');
select t.eq((select string_agg(distinct g.grantee::regrole::text, ',' order by g.grantee::regrole::text) from pg_proc p, aclexplode(p.proacl) g where p.oid = 'public.gaxeta_ingest_v4(text,jsonb)'::regprocedure),
            'anon,authenticated,postgres,service_role', 'gaxeta_ingest_v4 com as mesmas permissões da rota antiga');
select t.eq((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace, aclexplode(p.proacl) g
              where n.nspname = 'public' and p.proname like 'gaxeta_mag%' and g.grantee::regrole::text in ('anon', 'public')), 0::bigint,
            'nenhuma RPC magnética de leitura ou comando é executável sem login');
select t.eq((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'gaxeta_private' and c.relname like 'mag_%' and c.relkind = 'r' and not c.relrowsecurity), 0::bigint,
            'tabelas magnéticas com RLS ligada e sem política (acesso só pelas RPCs)');

begin; select t.anon();
select t.eq((t.mag(:'m1', 3072) - 'id' - 'received_at')::text, '{"ok": true, "duplicate": false}', 'pacote magnético (schema 4) aceito com a credencial de envio existente');
select t.eq((t.pot(:'m4', 16.90) - 'id' - 'received_at')::text, '{"ok": true, "duplicate": false}', 'pacote do 4.3.2 (com position_mm) continua aceito na rota antiga');
select t.eq((t.pot(:'m4', 17.10, '{"fw":"4.3.1-cont30"}') ->> 'ok'), 'true', 'pacote do 4.3.1 continua aceito');
select t.eq((t.pot(:'m4', 17.20, '{"fw":"4.3.3-cont30","drop":"position_mm","extra":{"percent_scale":"mv-140-2400"}}') ->> 'ok'), 'true', 'pacote da proposta 4.3.3 (sem mm, com escala) continua aceito');
select t.throws($$select t.pot('ESP32-MAGNE0000004', 17.3, '{"extra":{"modality":"as5600_i2c"}}')$$, '22023', 'rota antiga recusa pacote que se declara magnético');
select t.throws($$select t.pot('ESP32-MAGNE0000004', 17.3, '{"drop":"travel_percent"}')$$, '22023', 'rota antiga continua exigindo travel_percent');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 3072, '{"extra":{"schema_version":3}}')$$, '22023', 'rota magnética recusa schema diferente de 4');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 3072, '{"extra":{"modality":"adc_pot"}}')$$, '22023', 'rota magnética recusa modalidade elétrica');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 3072, '{"extra":{"travel_percent":0}}')$$, '22023', 'rota magnética recusa travel_percent, mesmo 0 (sem valor sentinela)');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 3072, '{"extra":{"voltage_v":0}}')$$, '22023', 'rota magnética recusa voltage_v 0');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 3072, '{"extra":{"position_mm":0}}')$$, '22023', 'rota magnética recusa position_mm 0');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 4096)$$, '22023', 'ângulo bruto 4096 recusado (12 bits: 0 a 4095)');
select t.throws($$select t.mag('ESP32-MAGNE0000001', -1)$$, '22023', 'ângulo bruto negativo recusado');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 100, '{"mag":"no_magnet"}')$$, '22023', 'ímã ausente com ângulo é incoerente: recusado');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 100, '{"bus":"no_ack"}')$$, '22023', 'barramento sem resposta com ângulo é incoerente: recusado');
select t.throws($$select t.mag('ESP32-MAGNE0000001', null)$$, '22023', 'leitura dita válida sem ângulo é recusada');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 100, '{"mag":"otimo"}')$$, '22023', 'qualidade magnética desconhecida recusada');
select t.throws($$select t.mag('ESP32-MAGNE0000001', 100, '{"extra":{"raw_angle":"100"}}')$$, '22023', 'ângulo em texto recusado');
select t.throws($$select public.gaxeta_ingest_v4('token-errado-0123456789abcdef0123456789abcdef', '{}'::jsonb)$$, 'PT401', 'credencial inválida recusada na rota magnética');
select t.eq((t.mag(:'m1', 0) ->> 'ok'), 'true', 'ângulo 0 é leitura válida (não é ausência)');
select t.eq((t.mag(:'m1', 4095) ->> 'ok'), 'true', 'ângulo 4095 é válido');
select t.eq((t.mag(:'m1', 3072, '{"seq":1}') ->> 'duplicate'), 'true', 'reenvio da mesma amostra (sensor/boot/sequência) devolve duplicata');
commit;
select t.eq((select count(*) from public.gaxeta_readings where sensor_id = :'m1'), 3::bigint, 'duplicata e pacotes recusados não criam linha');
select t.eq((select modality || '|' || coalesce(travel_percent::text, 'nulo') || '|' || coalesce(voltage_v::text, 'nulo') || '|' || coalesce(position_mm::text, 'nulo') || '|' || raw_angle
               from public.gaxeta_readings where sensor_id = :'m1' and sequence = 1), 'as5600_i2c|nulo|nulo|nulo|3072',
            'leitura magnética: percentual, tensão e mm NULOS; ângulo bruto 3072 preservado');
select t.throws($$insert into public.gaxeta_readings (sensor_id, boot_id, sequence, modality, bus_status, mag_status, raw_angle, travel_percent)
                  values ('ESP32-MAGNE0000001', md5('x'), 99, 'as5600_i2c', 'ok', 'ok', 10, 0)$$, '23514', 'restrição: leitura magnética não aceita percentual elétrico, nem zero');
select t.throws($$insert into public.gaxeta_readings (sensor_id, boot_id, sequence, voltage_v) values ('ESP32-MAGNE0000004', md5('x'), 99, 1)$$, '23514',
                'restrição: leitura elétrica continua exigindo travel_percent');

-- ---------- 2. Sensor magnético sem vínculo: ângulo absoluto e saúde, sem curso ----------
begin; select t.anon(); select t.mag(:'m1', 3072); commit;
select t.eq((select last_modality || '|' || coalesce(last_percent::text, 'nulo') || '|' || coalesce(last_voltage_v::text, 'nulo') || '|' || coalesce(stable_percent::text, 'nulo') || '|' || last_raw_angle || '|' || send_period_s
               from public.gaxeta_devices where sensor_id = :'m1'), 'as5600_i2c|nulo|nulo|nulo|3072|30', 'sensor: modalidade magnética, campos elétricos nulos, cadência anunciada');
begin; select t.login(t.id('adm1'));
select t.eq((select (i ->> 'modality') || '|' || coalesce(i ->> 'percent', 'nulo') || '|' || coalesce(i ->> 'voltage_mv', 'nulo') || '|' || coalesce(i ->> 'voltage_source', 'nulo') || '|' || (i ->> 'block')
               from jsonb_array_elements(public.gaxeta_telemetry_summary(array[:'m1']) -> 'items') i), 'as5600_i2c|nulo|nulo|nulo|magnetic',
            'resumo de telemetria: placa magnética sem percentual e sem tensão (nulos, não zero)');
select t.eq((select (i ->> 'modality') || '|' || (i ->> 'block') from jsonb_array_elements(public.gaxeta_telemetry_summary(array[:'m4']) -> 'items') i), 'adc_pot|ok',
            'resumo de telemetria: placa elétrica segue com modalidade adc_pot e diagnóstico do bloco');
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || (t.ms(:'m1') -> 'reading' ->> 'angle_deg') || '|' || (t.ms(:'m1') ->> 'linked') || '|' || coalesce(t.ms(:'m1') ->> 'computed', 'nulo'),
            'no_link|270.000|false|nulo', 'sem vínculo: mostra 270° absolutos e saúde; nenhum avanço ou curso');
select t.eq(t.ms(:'m4'), null::jsonb, 'resumo magnético não lista placa elétrica');
commit;

-- ---------- 3. Saúde: falha de I²C, ímã ausente e campo fora da faixa ----------
begin; select t.anon();
select t.eq((t.mag(:'m1', null, '{"bus":"no_ack"}') ->> 'ok'), 'true', 'módulo sem resposta entra como telemetria de saúde');
commit;
select t.eq((select coalesce(last_raw_angle::text, 'nulo') || '|' || last_bus_status || '|' || coalesce(last_mag_status, 'nulo') || '|' || last_valid_raw_angle || '|' || (last_received_at > clock_timestamp() - interval '5 seconds')
               from public.gaxeta_devices where sensor_id = :'m1'), 'nulo|no_ack|nulo|3072|true',
            'falha de I²C: placa segue online, sem ângulo atual; último válido (3072) guardado à parte');
begin; select t.login(t.id('adm1'));
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || coalesce(t.ms(:'m1') -> 'reading' ->> 'raw_angle', 'nulo') || '|' || (t.ms(:'m1') -> 'last_valid' ->> 'raw_angle'), 'bus_no_ack|nulo|3072',
            'resumo: motivo explícito (barramento), posição atual nula, último válido com rótulo próprio');
commit;
begin; select t.anon();
select t.mag(:'m1', null, '{"mag":"no_magnet"}'); commit;
begin; select t.login(t.id('adm1'));
select t.eq(t.ms(:'m1') ->> 'reason', 'no_magnet', 'ímã ausente: motivo no_magnet, sem posição'); commit;
begin; select t.anon(); select t.mag(:'m1', 3080, '{"mag":"weak"}'); commit;
begin; select t.login(t.id('adm1'));
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || (t.ms(:'m1') -> 'reading' ->> 'raw_angle') || '|' || (t.ms(:'m1') -> 'last_valid' ->> 'raw_angle'), 'field_weak|3080|3072',
            'campo fraco: ângulo mostrado como diagnóstico, mas não vira último válido'); commit;
begin; select t.anon(); select t.mag(:'m1', 3081, '{"mag":"strong"}'); commit;
begin; select t.login(t.id('adm1'));
select t.eq(t.ms(:'m1') ->> 'reason', 'field_strong', 'campo forte (saturação): motivo field_strong'); commit;
begin; select t.anon(); select t.mag(:'m1', null, '{"bus":"timeout"}'); select t.mag(:'m1', null, '{"bus":"read_error"}'); select t.mag(:'m1', 3072); commit;
select t.eq((select string_agg(bus_status || '/' || coalesce(mag_status, '-'), ',' order by id) from public.gaxeta_readings where sensor_id = :'m1' and sequence between 5 and 11),
            'no_ack/-,ok/no_magnet,ok/weak,ok/strong,timeout/-,read_error/-,ok/ok', 'série bruta guarda cada estado de saúde, um por leitura');

-- ---------- 4. Geometria por revisão: só engenharia, com evidência ----------
begin; select t.login(t.id('adm1'));
select t.put('mag_eq', public.gaxeta_save_asset(null, t.id('A1_cald'), 'equipment', 'Bomba magnética', 'B-MAG', '') ->> 'id');
select t.put('mag_s1', public.gaxeta_save_asset(null, t.id('mag_eq'), 'point', 'LA', '', 'lado acoplado') ->> 'id');
select t.put('mag_s2', public.gaxeta_save_asset(null, t.id('mag_eq'), 'point', 'LOA', '', 'lado oposto') ->> 'id');
select t.put('mag_eqB', public.gaxeta_save_asset(null, t.id('B1_bombas'), 'equipment', 'Bomba magnética B', 'B-MAGB', '') ->> 'id');
select t.put('mag_sB', public.gaxeta_save_asset(null, t.id('mag_eqB'), 'point', 'LA', '', '') ->> 'id');
commit;
begin; select t.anon(); select t.mag(:'m2', 1000); select t.mag(:'m3', 2000); select t.mag(:'mb', 500); commit;
begin; select t.login(t.id('adm1'));
select public.gaxeta_link_sensor(:'m1', t.id('mag_s1'), 'ensaio magnético') ->> 'ok';
select public.gaxeta_link_sensor(:'m2', t.id('mag_s2'), 'ensaio magnético') ->> 'ok';
select public.gaxeta_link_sensor(:'mb', t.id('mag_sB'), 'ensaio magnético') ->> 'ok';
commit;
-- Quem só lê pelo vínculo enxerga as leituras recebidas depois dele: uma leitura nova por sensor.
begin; select t.anon(); select t.mag(:'m1', 3072); select t.mag(:'m2', 1000); select t.mag(:'mb', 500); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'m1') ->> 'reason', 'no_geometry', 'vinculado sem geometria: motivo no_geometry');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, 'PT409', 'engaxetamento recusado enquanto o spot não tem geometria');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"x","label":"x","model_kind":"linear","direction":1,"mm_per_deg":0.25,"unique_arc_deg":200,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":40}')$$,
                '42501', 'operador de campo não cadastra geometria');
commit;
begin; select t.login(t.id('adm2'));
-- lin-a: 0,25 mm/° (4°/mm), arco único de 200°. lin-b: 0,256 mm/° (1 contagem = 0,0225 mm). lin-inv: sentido invertido.
select t.put('g_a', public.gaxeta_mag_save_geometry('{"key":"lin-a","label":"Haste A 4 graus/mm","model_kind":"linear","direction":1,"mm_per_deg":0.25,"unique_arc_deg":200,"back_margin_deg":15,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":50}') ->> 'id');
select t.put('g_b', public.gaxeta_mag_save_geometry('{"key":"lin-b","label":"Haste B","model_kind":"linear","direction":1,"mm_per_deg":0.256,"unique_arc_deg":200,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":50}') ->> 'id');
select t.put('g_inv', public.gaxeta_mag_save_geometry('{"key":"lin-inv","label":"Haste invertida","model_kind":"linear","direction":-1,"mm_per_deg":0.25,"unique_arc_deg":200,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":50}') ->> 'id');
-- Curva de exemplo MATEMÁTICO (braço ideal de 100 mm, x = L·sen θ): não é dimensão do protótipo.
select t.put('g_tab', public.gaxeta_mag_save_geometry('{"key":"alavanca","label":"Alavanca ideal 100 mm","model_kind":"table","direction":1,"datum_raw":0,
  "curve":[[45,70.7107],[55,81.9152],[65,90.6308],[75,96.5926],[85,99.6195]],"unique_arc_deg":90,"tolerance_mm":0.3,"min_course_mm":2,"max_course_mm":28}') ->> 'id');
select t.eq((select string_agg(key || ' r' || revision || ' ' || status, ', ' order by id) from jsonb_to_recordset(public.gaxeta_mag_geometries()) as x(id bigint, key text, revision int, status text)),
            'lin-a r1 draft, lin-b r1 draft, lin-inv r1 draft, alavanca r1 draft', 'quatro geometrias cadastradas como rascunho, revisão 1');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"ruim","label":"x","model_kind":"table","direction":1,"datum_raw":0,"curve":[[10,1],[20,1]],"unique_arc_deg":90,"tolerance_mm":0.3,"min_course_mm":1,"max_course_mm":2}')$$,
                '22023', 'curva com trecho plano (não monotônica) é recusada');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"ruim","label":"x","model_kind":"table","direction":1,"datum_raw":0,"curve":[[20,1],[10,2]],"unique_arc_deg":90,"tolerance_mm":0.3,"min_course_mm":1,"max_course_mm":2}')$$,
                '22023', 'curva com graus fora de ordem é recusada');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"multi","label":"x","model_kind":"linear","direction":1,"mm_per_deg":0.05,"unique_arc_deg":300,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":50}')$$,
                '22023', 'geometria cujo maior curso exige mais de um arco único é recusada (50 mm a 0,05 mm/° = 1000°)');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"volta","label":"x","model_kind":"linear","direction":1,"mm_per_deg":0.25,"unique_arc_deg":350,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":50}')$$,
                '23514', 'arco único acima de 330° é recusado (precisa de folga em torno da origem)');
select t.throws(format($$select public.gaxeta_mag_set_geometry_status(%s, 'validated', '{"report":"sem números"}')$$, t.id_text('g_a')), '22023', 'validar exige evidência numérica do ensaio');
select public.gaxeta_mag_set_point_setup(t.id('mag_s1'), t.id_text('g_a')::bigint, null, 30, 'ensaio') ->> 'source';
commit;
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || (t.ms(:'m1') -> 'setup' ->> 'status') || '|' || (t.ms(:'m1') -> 'setup' ->> 'suggested_course_mm'), 'no_reference|draft|30.00',
            'spot com geometria em rascunho: sem referência; curso típico aparece como sugestão');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, 'PT409', 'técnico não registra engaxetamento com geometria ainda não validada');
commit;
begin; select t.login(t.id('adm2'));
select t.eq(public.gaxeta_mag_set_geometry_status(t.id_text('g_a')::bigint, 'validated', '{"max_error_mm":0.2,"max_error_pp":0.7,"backlash_mm":0.1,"report":"SIMULADO: suíte 84"}') ->> 'status', 'validated', 'engenharia valida a revisão com evidência');
select public.gaxeta_mag_set_geometry_status(t.id_text('g_b')::bigint, 'validated', '{"max_error_mm":0.2,"max_error_pp":0.7,"backlash_mm":0.1,"report":"SIMULADO: suíte 84"}') ->> 'status';
select public.gaxeta_mag_set_geometry_status(t.id_text('g_inv')::bigint, 'validated', '{"max_error_mm":0.2,"max_error_pp":0.7,"backlash_mm":0.1,"report":"SIMULADO: suíte 84"}') ->> 'status';
select public.gaxeta_mag_set_geometry_status(t.id_text('g_tab')::bigint, 'validated', '{"max_error_mm":0.2,"max_error_pp":0.7,"backlash_mm":0.1,"report":"SIMULADO: suíte 84"}') ->> 'status';
select t.throws(format($$select public.gaxeta_mag_set_geometry_status(%s, 'draft', null)$$, t.id_text('g_a')), 'PT409', 'revisão validada não volta a rascunho');
select public.gaxeta_mag_set_point_setup(t.id('mag_sB'), t.id_text('g_a')::bigint, null, null, null) ->> 'source';
commit;

-- ---------- 5. Um clique: autorização, idempotência e concorrência ----------
select t.put('req1', gen_random_uuid()::text);
begin; select t.anon();
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, '42501', 'sem login (credencial de envio da placa) não cria referência');
commit;
begin; select t.login(t.id('uA_all'));
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, '42501', 'usuário somente leitura não cria referência');
select t.eq(t.ms(:'m1') ->> 'can_operate', 'false', 'somente leitura vê o sensor, sem permissão de operar');
commit;
begin; select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, '42501', 'usuário de outra corporação não cria referência');
select t.eq(t.ms(:'m1'), null::jsonb, 'usuário de outra corporação não lê o sensor');
select t.eq(jsonb_array_length(public.gaxeta_mag_history(:'m1', now() - interval '1 hour', now() + interval '1 hour') -> 'history'), 0, 'nem o histórico magnético');
commit;
begin; select t.login(t.id('uA_campo'));
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), null)$$, '22023', 'curso nulo é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 0)$$, '22023', 'curso zero é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), -3)$$, '22023', 'curso negativo é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 'NaN')$$, '22023', 'curso não finito é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 4.9)$$, '22023', 'curso abaixo do menor curso validado (5 mm) é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 50.1)$$, '22023', 'curso acima do maior curso validado é recusado');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30, 'chute')$$, '22023', 'origem do curso só medido ou estimado');
select t.eq(public.gaxeta_mag_request_service(:'m1', t.id('req1'), 30, 'measured') ->> 'status', 'pending', 'técnico informa 30 mm medidos e toca em Engaxetamento realizado: solicitação pendente');
select t.eq((public.gaxeta_mag_request_service(:'m1', t.id('req1'), 30, 'measured') ->> 'duplicate'), 'true', 'duplo clique (mesma solicitação) devolve a mesma, sem criar outra');
select t.throws(format($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', %L, 31, 'measured')$$, t.id_text('req1')), 'PT409', 'mesma solicitação com outra medida é recusada');
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || (t.ms(:'m1') -> 'pending' ->> 'mine') || '|' || (t.ms(:'m1') -> 'pending' ->> 'course_mm'), 'awaiting_reference|true|30.000', 'estado: Aguardando leitura');
commit;
begin; select t.login(t.id('adm2'));
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 28, 'measured')$$, 'PT409', 'segundo operador, com outra solicitação, recebe pendência explícita');
select t.eq(t.ms(:'m1') -> 'pending' ->> 'mine', 'false', 'o segundo operador vê a pendência do primeiro');
commit;
select t.eq(t.svc(:'m1'), 'pending', 'exatamente uma solicitação para o vínculo');

-- ---------- 6. Captura: só a primeira amostra nova, válida, estável e posterior ao clique ----------
select t.mag_ago(:'m1', 10);
begin; select t.anon();
select t.ok(t.mag(:'m1', 3072, '{"age":60}') ? 'capture', 'pacote represado (amostrado antes do clique) não ancora; a resposta traz o identificador de captura');
select t.ok(t.mag(:'m1', 3072, '{"sampled":"none"}') ? 'capture', 'amostra sem relógio confiável não ancora');
select t.ok(t.mag(:'m1', null, '{"mag":"no_magnet"}') ? 'capture', 'ímã ausente não ancora');
select t.ok(t.mag(:'m1', 3072, '{"pp":40}') ? 'capture', 'amostra instável (haste em movimento: 40 contagens no bloco) não ancora');
select t.ok(t.mag(:'m1', 3070, '{"boot":"aaaaaaaaaaaaaaaa1111111111111111","age":300}') ? 'capture' is false, 'pacote atrasado de boot anterior não é leitura atual, não ancora e não recebe captura');
commit;
select t.eq(t.svc(:'m1'), 'pending', 'depois de cinco amostras impróprias a solicitação continua pendente, sem zero enganoso');
begin; select t.anon();
select t.ok(not (t.mag(:'m1', 3072) ? 'capture'), 'primeira amostra nova, válida e estável depois do clique: capturada');
commit;
select t.eq(t.svc(:'m1'), 'active', 'referência ativada');
select t.eq((select ref_raw_angle || '|' || capture_rule || '|' || course_mm || '|' || course_origin || '|' || (geometry ->> 'key') || ' r' || (geometry ->> 'revision') || '|' || stable_remaining || '|' || (actor_id = t.id('uA_campo'))
               from gaxeta_private.mag_services where sensor_id = :'m1'), '3072|clock|30.000|measured|lin-a r1|100.0000|true',
            'evento guarda autor, D, origem, revisão, leitura de referência (3072 = 270°) e regra de captura');
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') -> 'reading' ->> 'angle_deg') || '|' || (t.ms(:'m1') -> 'computed' ->> 'advance_mm') || '|' || (t.ms(:'m1') -> 'computed' ->> 'remaining_percent') || '|' || (t.ms(:'m1') -> 'computed' ->> 'remaining_mm') || '|' || coalesce(t.ms(:'m1') ->> 'reason', 'ok'),
            '270.000|0.0000|100.0000|30.0000|ok', 'origem arbitrária: ângulo absoluto 270°, avanço 0, curso restante 100 % (30 mm)');
commit;
select t.eq(t.mmov(:'m1'), 0::bigint, 'registrar a referência não gera movimento');

-- ---------- 7. Avanço e curso restante (linear, 0,25 mm/°, D = 30 mm) ----------
begin; select t.anon(); select t.mag(:'m1', 3413); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') -> 'reading' ->> 'angle_deg') || '|' || round((t.ms(:'m1') -> 'computed' ->> 'advance_mm')::numeric / 0.25, 3) || '|' || (t.ms(:'m1') -> 'computed' ->> 'advance_mm') || '|' || round((t.ms(:'m1') -> 'computed' ->> 'remaining_percent')::numeric, 2),
            '299.971|29.971|7.4927|75.02', '270° → ~300°: +29,971° = 7,49 mm de avanço; restam 75,02 %');
commit;
begin; select t.anon(); select t.mag(:'m1', 3755); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq(round((t.ms(:'m1') -> 'computed' ->> 'remaining_percent')::numeric, 1)::text, '50.0', 'metade do curso (60° = 15 mm): 50 %'); commit;
-- Cruzamento da origem do sensor: 3755 → 4095 → 0 → 341 (270° + 120° = 30°).
begin; select t.anon(); select t.mag(:'m1', 4095); select t.mag(:'m1', 0); select t.mag(:'m1', 341); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') -> 'reading' ->> 'angle_deg') || '|' || round((t.ms(:'m1') -> 'computed' ->> 'remaining_percent')::numeric, 1) || '|' || (t.ms(:'m1') -> 'computed' ->> 'range_state'),
            '29.971|0.0|ok', 'fim do curso depois de cruzar 4095 → 0: 0 %, sem salto');
commit;
select t.eq((select string_agg(round(stable_remaining, 1)::text, ' > ' order by received_at, reading_id) from gaxeta_private.mag_movements where sensor_id = :'m1'),
            '75.0 > 50.0 > 25.1 > 0.0', 'linha estabilizada desce em degraus de 5 p.p. ou mais; 4095 → 0 (25,07 % → 25,00 %) não gera evento falso');
-- Excesso além da tolerância (0,5 mm = 2°): fora da faixa validada; a linha não muda.
begin; select t.anon(); select t.mag(:'m1', 400); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || ((t.ms(:'m1') -> 'computed' ->> 'remaining_percent')::numeric < 0) || '|' || (t.ms(:'m1') -> 'service' ->> 'stable_remaining'),
            'out_of_range|true|0.0244', 'excesso: Fora da faixa validada; resultado assinado (negativo) guardado; linha estabilizada intacta');
commit;
-- Recuo: pequeno (dentro da tolerância) é válido e passa de 100 %; grande é fora da faixa.
begin; select t.anon(); select t.mag(:'m1', 3060); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') -> 'computed' ->> 'range_state') || '|' || ((t.ms(:'m1') -> 'computed' ->> 'advance_mm')::numeric < 0) || '|' || round((t.ms(:'m1') -> 'computed' ->> 'remaining_percent')::numeric, 2),
            'ok|true|100.88', 'recuo de 12 contagens (0,26 mm): válido, avanço negativo, 100,88 %');
commit;
begin; select t.anon(); select t.mag(:'m1', 2990); commit;
begin; select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'m1') ->> 'reason', 'out_of_range', 'recuo de 82 contagens (1,8 mm, além da tolerância): fora da faixa validada'); commit;

-- ---------- 8. Limiar inclusivo de 5 p.p., sem arredondar antes (lin-b: D = 45 mm = 2000 contagens) ----------
-- Com 12 bits em menos de uma volta, 1 contagem = 0,05 p.p. neste curso: 95,01 % não é posição física
-- representável. A regra pura é conferida com 95,01 e 95,00; o caminho completo, com 95,05 e 95,00.
select t.eq(gaxeta_private.mag_stabilize(100, 95.01), 100::numeric, 'regra pura: com referência em 100 %, 95,01 % mantém a linha');
select t.eq(gaxeta_private.mag_stabilize(100, 95.00), 95.00::numeric, 'regra pura: 95,00 % gera mudança (limiar inclusivo)');
select t.eq(gaxeta_private.mag_stabilize(100, 95.004999), 100::numeric, 'regra pura: 95,004999 % não é arredondado para 95,00 antes da decisão');
select t.eq(gaxeta_private.mag_stabilize(95, 100.00), 100.00::numeric, 'regra pura: subida de 5,00 p.p. também gera mudança');
select t.eq(gaxeta_private.mag_stabilize(95, 99.99), 95::numeric, 'regra pura: subida de 4,99 p.p. mantém a linha');
begin; select t.login(t.id('adm2'));
select public.gaxeta_mag_set_point_setup(t.id('mag_s2'), t.id_text('g_b')::bigint, null, null, null) ->> 'source';
select public.gaxeta_mag_request_service(:'m2', gen_random_uuid(), 45, 'measured') ->> 'status';
commit;
select t.mag_ago(:'m2', 10);
begin; select t.anon(); select t.mag(:'m2', 1000); select t.mag(:'m2', 1099); commit;
select t.eq((select remaining_percent::text || '|' || stable_remaining from public.gaxeta_readings where sensor_id = :'m2' order by id desc limit 1) || '|' || t.mmov(:'m2'),
            '95.0500|100.0000|0', '99 contagens: 95,05 % mantém a linha em 100 % (nenhum movimento)');
begin; select t.anon(); select t.mag(:'m2', 1100); commit;
select t.eq((select remaining_percent::text || '|' || stable_remaining from public.gaxeta_readings where sensor_id = :'m2' order by id desc limit 1) || '|' || t.mmov(:'m2'),
            '95.0000|95.0000|1', '100 contagens: exatamente 95,00 % gera uma mudança');
begin; select t.anon(); select t.mag(:'m2', 1099); select t.mag(:'m2', 1101); select t.mag(:'m2', 1100); select t.mag(:'m2', 1001); commit;
select t.eq(t.mmov(:'m2'), 1::bigint, 'ruído perto do limiar (95,05 / 94,95 / 95,00) e subida de 4,95 p.p. não geram novos movimentos');
begin; select t.anon(); select t.mag(:'m2', 1000); commit;
select t.eq((select string_agg(previous_remaining::text || '>' || stable_remaining, ' ' order by reading_id) from gaxeta_private.mag_movements where sensor_id = :'m2'),
            '100.0000>95.0000 95.0000>100.0000', 'subida de exatamente 5,00 p.p. gera a segunda mudança');
select t.eq((select count(*) from public.gaxeta_movements where sensor_id like 'ESP32-MAGNE00000_' and sensor_id <> :'m4'), 0::bigint, 'nenhum movimento magnético cai em gaxeta_movements (série elétrica)');

-- ---------- 9. Sentido invertido, outro ângulo inicial e identificador de captura (eco) ----------
begin; select t.login(t.id('adm2'));
select public.gaxeta_link_sensor(:'m3', t.id('A1_tq200_s2'), 'ensaio magnético') ->> 'ok';
select public.gaxeta_mag_set_point_setup(t.id('A1_tq200_s2'), t.id_text('g_inv')::bigint, null, null, null) ->> 'source';
select public.gaxeta_mag_request_service(:'m3', gen_random_uuid(), 20, 'estimated') ->> 'status';
commit;
select (select capture from gaxeta_private.mag_services where sensor_id = :'m3' and status = 'pending') as cap3 \gset
begin; select t.anon();
select t.eq(t.mag(:'m3', 114, '{"sampled":"none"}') ->> 'capture', :'cap3', 'relógio por sincronizar: a resposta entrega o identificador de captura');
select t.ok(t.mag(:'m3', 114, '{"sampled":"none","capture":"00000000"}') ? 'capture', 'identificador errado não ancora');
select t.ok(not (t.mag(:'m3', 114, format('{"sampled":"none","capture":"%s"}', :'cap3')::jsonb) ? 'capture'), 'amostra que repete o identificador ancora mesmo sem horário');
select t.mag(:'m3', 4096 + 114 - 228);
commit;
select t.eq((select capture_rule || '|' || ref_raw_angle || '|' || course_origin from gaxeta_private.mag_services where sensor_id = :'m3' and status = 'active'), 'echo|114|estimated', 'referência em 10° (114), capturada por eco; curso marcado como estimado');
select t.eq((select round(advance_mm, 2)::text || '|' || round(remaining_percent, 1) from public.gaxeta_readings where sensor_id = :'m3' order by id desc limit 1), '5.01|75.0',
            'sentido invertido: de 10° para 350° (−20,04° brutos) é AVANÇO de 5,01 mm; restam 75,0 % de 20 mm');

-- ---------- 10. Articulação: curva de bancada (exemplo matemático) ----------
select t.eq(round(gaxeta_private.mag_curve_eval('[[45,70.7107],[55,81.9152],[65,90.6308],[75,96.5926],[85,99.6195]]', 55) - gaxeta_private.mag_curve_eval('[[45,70.7107],[55,81.9152],[65,90.6308],[75,96.5926],[85,99.6195]]', 45), 2),
            11.20, 'braço ideal de 100 mm: 10° de 45° a 55° projetam 11,20 mm');
select t.eq(round(gaxeta_private.mag_curve_eval('[[45,70.7107],[55,81.9152],[65,90.6308],[75,96.5926],[85,99.6195]]', 85) - gaxeta_private.mag_curve_eval('[[45,70.7107],[55,81.9152],[65,90.6308],[75,96.5926],[85,99.6195]]', 75), 2),
            3.03, 'os mesmos 10° de 75° a 85° projetam 3,03 mm (ganho não é constante)');
select t.eq(gaxeta_private.mag_curve_eval('[[45,70.7107],[55,81.9152]]', 44.9), null::numeric, 'fora dos limites da curva não há extrapolação');
select t.eq(round((gaxeta_private.mag_compute((select geometry from (select gaxeta_private.mag_geometry_snapshot(g) geometry from gaxeta_private.mag_geometries g where key = 'alavanca') q), 0, 512, 626, 25) ->> 'advance_mm')::numeric, 2),
            11.22, 'curva + fase mecânica: avanço = f(55,02°) − f(45°) = 11,22 mm, com datum em 0');
select t.eq(gaxeta_private.mag_compute((select gaxeta_private.mag_geometry_snapshot(g) from gaxeta_private.mag_geometries g where key = 'alavanca'), 0, 512, 1100, 25) ->> 'range_state',
            'out_of_range', 'ângulo além da curva caracterizada (96,7°): fora da faixa validada, sem valor extrapolado');
select t.eq(gaxeta_private.mag_compute((select gaxeta_private.mag_geometry_snapshot(g) from gaxeta_private.mag_geometries g where key = 'alavanca'), null, 512, 626, 25), null::jsonb,
            'curva sem datum mecânico conhecido: nada é calculado');

-- ---------- 11. Ambiguidade: o que o arco único resolve e o que é bloqueado ----------
select t.eq(gaxeta_private.mag_compute((select gaxeta_private.mag_geometry_snapshot(g) from gaxeta_private.mag_geometries g where key = 'lin-a'), null, 3072, 1024, 50) ->> 'rel_deg',
            '180.0000000000000000', '270° → 90° numa geometria de arco único de 200° e sentido conhecido: +180°, uma só leitura possível');
select t.eq(gaxeta_private.mag_compute((select gaxeta_private.mag_geometry_snapshot(g) from gaxeta_private.mag_geometries g where key = 'lin-a'), null, 3072, 1820, 50) ->> 'range_state',
            'out_of_range', 'além do arco único (250°): fora da faixa validada, sem promessa de mm');
begin; select t.login(t.id('adm2'));
select t.put('g_curto', public.gaxeta_mag_save_geometry('{"key":"lin-curto","label":"Arco curto","model_kind":"linear","direction":1,"mm_per_deg":0.25,"unique_arc_deg":100,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":25}') ->> 'id');
select t.throws($$select public.gaxeta_mag_save_geometry('{"key":"lin-curto2","label":"x","model_kind":"linear","direction":1,"mm_per_deg":0.25,"unique_arc_deg":100,"tolerance_mm":0.5,"min_course_mm":5,"max_course_mm":30}')$$,
                '22023', 'curso de 30 mm a 4°/mm pede 120°: não cabe num arco único de 100° e a inferência é bloqueada no cadastro');
commit;

-- ---------- 12. Vínculo e tempo ----------
-- 12a. Reinício e Wi-Fi fora: a posição volta pela fase, sem movimento falso.
begin; select t.anon(); select t.mag(:'m2', 1400); commit;
select t.eq((select remaining_percent::text from public.gaxeta_readings where sensor_id = :'m2' order by id desc limit 1), '80.0000', 'antes do reinício: 80 %');
select t.mmov(:'m2') as mv2 \gset
begin; select t.anon(); select t.mag(:'m2', 1400, '{"boot":"bbbbbbbbbbbbbbbb2222222222222222"}'); commit;
select t.eq((select remaining_percent::text || '|' || (service_id is not null) from public.gaxeta_readings where sensor_id = :'m2' order by id desc limit 1) || '|' || (t.mmov(:'m2') - :mv2),
            '80.0000|true|0', 'depois de desligar e religar (boot novo), a mesma fase dá os mesmos 80 %, sem movimento');
begin; select t.anon(); select t.mag(:'m2', 1390, '{"age":3600}'); commit;
select t.eq((select coalesce(remaining_percent::text, 'nulo') || '|' || coalesce(service_id::text, 'nulo') from public.gaxeta_readings where sensor_id = :'m2' order by id desc limit 1) || '|' || (select last_raw_angle from public.gaxeta_devices where sensor_id = :'m2') || '|' || (t.mmov(:'m2') - :mv2),
            'nulo|nulo|1400|0', 'leitura antiga recebida depois (fila do boot anterior): entra no histórico, não muda a posição atual nem gera movimento');
-- 12b. Solicitação que vence sem amostra válida.
begin; select t.login(t.id('adm2')); select public.gaxeta_mag_request_service(:'mb', gen_random_uuid(), 30, 'measured') ->> 'status'; commit;
select t.priv($$update gaxeta_private.mag_services set expires_at = clock_timestamp() - interval '1 second' where sensor_id = 'ESP32-MAGNE00000B1' and status = 'pending' returning id::text$$) is not null as expirada \gset
begin; select t.login(t.id('adm2'));
select t.eq(t.ms(:'mb') -> 'pending' ->> 'expired', 'true', 'pendência vencida aparece como expirada'); commit;
begin; select t.anon(); select t.mag(:'mb', 500); commit;
select t.eq(t.svc(:'mb'), 'expired:no_valid_sample', 'solicitação vencida não ancora leitura tardia');
-- 12c. Cancelar e repetir (a pessoa moveu a haste durante a espera).
begin; select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE00000B1', gen_random_uuid(), 30)$$, '42501', 'usuário somente leitura da corporação B não opera o sensor da própria corporação');
commit;
begin; select t.login(t.id('adm2'));
select t.put('svcb', public.gaxeta_mag_request_service(:'mb', gen_random_uuid(), 30, 'measured') ->> 'id');
select t.eq(public.gaxeta_mag_cancel_service(:'mb', t.id_text('svcb')) ->> 'status', 'cancelled', 'pendência cancelada pelo operador');
select t.eq(public.gaxeta_mag_cancel_service(:'mb', t.id_text('svcb')) ->> 'changed', 'false', 'cancelar de novo não muda nada');
select t.eq(public.gaxeta_mag_request_service(:'mb', gen_random_uuid(), 30, 'measured') ->> 'status', 'pending', 'e a solicitação pode ser repetida');
commit;
select t.mag_ago(:'mb', 10);
begin; select t.anon(); select t.mag(:'mb', 600); select t.mag(:'mb', 941); commit;
select t.eq(t.svc(:'mb'), 'expired:no_valid_sample,cancelled:user_cancelled,active', 'três solicitações: vencida, cancelada e a que ancorou');
-- 12d. Novo engaxetamento substitui o anterior, atomicamente, com rastreabilidade.
begin; select t.login(t.id('adm2')); select public.gaxeta_mag_request_service(:'mb', gen_random_uuid(), 25, 'measured') ->> 'status'; commit;
select t.eq(t.svc(:'mb'), 'expired:no_valid_sample,cancelled:user_cancelled,active,pending', 'a referência anterior continua valendo enquanto a nova aguarda leitura');
select (select remaining_percent from public.gaxeta_readings where sensor_id = :'mb' order by id desc limit 1) as antes \gset
select t.mag_ago(:'mb', 10);
begin; select t.anon(); select t.mag(:'mb', 941); commit;
select t.eq(t.svc(:'mb'), 'expired:no_valid_sample,cancelled:user_cancelled,superseded:new_service,active', 'ativação atômica: a anterior vira substituída no mesmo instante');
select t.eq((select (superseded_by = (select id from gaxeta_private.mag_services where sensor_id = 'ESP32-MAGNE00000B1' and status = 'active'))::text || '|' || ref_raw_angle || '|' || course_mm
               from gaxeta_private.mag_services where sensor_id = :'mb' and status = 'superseded'), 'true|600|30.000', 'a referência anterior guarda quem a substituiu, o ângulo e a medida originais');
select t.eq((select remaining_percent::text || '|' || stable_remaining from public.gaxeta_readings where sensor_id = :'mb' order by id desc limit 1) || '|' || t.mmov(:'mb'),
            '100.0000|100.0000|1', 'troca de referência: a linha recomeça em 100 % sem gerar ajuste fictício (segue o único movimento da referência anterior)');
-- 12e. Mudança de perfil do spot: serviço histórico mantém revisão e medida; a referência vigente é encerrada.
begin; select t.login(t.id('adm2'));
select public.gaxeta_mag_set_point_setup(t.id('mag_sB'), t.id_text('g_curto')::bigint, null, null, 'troca de haste') ->> 'source';
select t.eq(t.ms(:'mb') ->> 'reason', 'no_reference', 'depois de trocar a geometria do spot: sem referência (peça novo engaxetamento)');
commit;
select t.eq((select string_agg(status || ':' || (geometry ->> 'key') || ':' || course_mm, ',' order by id) from gaxeta_private.mag_services where sensor_id = :'mb' and ref_reading_id is not null),
            'superseded:lin-a:30.000,superseded:lin-a:25.000', 'serviços históricos mantêm a revisão (lin-a) e as medidas originais');
begin; select t.anon(); select t.mag(:'mb', 950); commit;
select t.eq((select coalesce(remaining_percent::text, 'nulo') from public.gaxeta_readings where sensor_id = :'mb' order by id desc limit 1), 'nulo', 'sem referência vigente nenhum curso é calculado');
-- 12f. Troca de spot: a referência não acompanha o sensor.
begin; select t.login(t.id('adm1'));
select public.gaxeta_unlink_sensor(:'m2', 'troca de ponto') ->> 'ok';
commit;
select t.eq((select status || ':' || end_reason from gaxeta_private.mag_services where sensor_id = :'m2' order by id desc limit 1), 'superseded:link_closed', 'desvincular encerra a referência do vínculo');
begin; select t.login(t.id('adm1'));
select public.gaxeta_link_sensor(:'m2', t.id('mag_s2'), 'volta ao ponto') ->> 'ok';
commit;
begin; select t.anon(); select t.mag(:'m2', 1400, '{"boot":"bbbbbbbbbbbbbbbb2222222222222222"}'); commit;
begin; select t.login(t.id('adm1'));
select t.eq((t.ms(:'m2') ->> 'reason') || '|' || coalesce(t.ms(:'m2') ->> 'computed', 'nulo'), 'no_reference|nulo', 'vínculo novo (mesmo spot): exige referência coerente com o novo vínculo'); commit;

-- ---------- 13. Rollback para o potenciômetro no mesmo ID, e volta ----------
select (select count(*) from public.gaxeta_movements where sensor_id = :'m1') as mvm1 \gset
begin; select t.anon(); select t.eq(t.pot(:'m1', 42.5) ->> 'ok', 'true', 'mesmo sensor volta a enviar o pacote do potenciômetro (4.3.2)'); commit;
select t.eq((select last_modality || '|' || last_percent || '|' || stable_percent || '|' || coalesce(last_raw_angle::text, 'nulo') || '|' || coalesce(last_mag_status, 'nulo') from public.gaxeta_devices where sensor_id = :'m1'),
            'adc_pot|42.5|42.5|nulo|nulo', 'rollback: modalidade elétrica, filtro recomeça em 42,5 %, nenhuma grandeza magnética como leitura atual');
select t.eq((select count(*) from public.gaxeta_movements where sensor_id = :'m1') - :mvm1, 0::bigint, 'a volta ao potenciômetro não registra movimento');
select t.eq((select status || ':' || end_reason from gaxeta_private.mag_services where sensor_id = :'m1' order by id desc limit 1), 'superseded:modality_change', 'referência magnética encerrada por troca de modalidade');
begin; select t.login(t.id('uA_campo'));
select t.eq(t.ms(:'m1'), null::jsonb, 'resumo magnético deixa de listar o sensor');
select t.eq((select (i ->> 'modality') || '|' || (i ->> 'percent') || '|' || (i ->> 'stable_percent') from jsonb_array_elements(public.gaxeta_telemetry_summary(array[:'m1']) -> 'items') i), 'adc_pot|42.50|42.5',
            'resumo de telemetria: posição elétrica, sem porcentagem mecânica herdada');
select t.throws($$select public.gaxeta_mag_request_service('ESP32-MAGNE0000001', gen_random_uuid(), 30)$$, 'PT409', 'engaxetamento magnético recusado em placa que está no potenciômetro');
commit;
begin; select t.anon(); select t.pot(:'m1', 48.0); select t.mag(:'m1', 3200, '{"boot":"cccccccccccccccc3333333333333333"}'); commit;
select t.eq((select count(*) from public.gaxeta_movements where sensor_id = :'m1') - :mvm1, 1::bigint, 'na modalidade elétrica o limiar de 5 p.p. segue valendo (42,5 → 48,0)');
select t.eq((select last_modality || '|' || coalesce(last_percent::text, 'nulo') || '|' || coalesce(stable_percent::text, 'nulo') from public.gaxeta_devices where sensor_id = :'m1'), 'as5600_i2c|nulo|nulo', 'de volta ao magnético: nada elétrico como leitura atual');
begin; select t.login(t.id('uA_campo'));
select t.eq((t.ms(:'m1') ->> 'reason') || '|' || coalesce(t.ms(:'m1') ->> 'computed', 'nulo'), 'no_reference|nulo', 'e a referência antiga não é reaproveitada'); commit;

-- ---------- 14. Histórico: por modalidade, por referência, média circular ----------
begin; select t.anon();
select t.mag(:'m4', 4090, '{"boot":"dddddddddddddddd4444444444444444"}'); select t.mag(:'m4', 6, '{"boot":"dddddddddddddddd4444444444444444"}');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((select (h ->> 'angle_deg')::numeric < 1 or (h ->> 'angle_deg')::numeric > 359 from jsonb_array_elements(public.gaxeta_mag_history(:'m4', now() - interval '10 minutes', now() + interval '1 minute') -> 'history') h limit 1), true,
            'média circular: amostras em 359,5° e 0,5° dão ~0° (a média aritmética daria 180°)');
select t.eq((public.gaxeta_history(:'m4', now() - interval '10 minutes', now() + interval '1 minute') -> 'stats' ->> 'count'), '3', 'histórico elétrico conta só as 3 leituras elétricas (as magnéticas ficam fora da média de %)');
select t.eq((public.gaxeta_mag_history(:'m4', now() - interval '10 minutes', now() + interval '1 minute') -> 'stats' ->> 'count'), '2', 'histórico magnético conta só as 2 magnéticas');
select t.eq((select count(distinct h ->> 'service_id') from jsonb_array_elements(public.gaxeta_mag_history(:'mb', now() - interval '10 minutes', now() + interval '1 minute') -> 'history') h where h ->> 'service_id' is not null), 2::bigint,
            'histórico separa os intervalos por referência (a linha quebra na troca)');
select t.eq(jsonb_array_length(public.gaxeta_mag_history(:'mb', now() - interval '10 minutes', now() + interval '1 minute') -> 'services') || '|' || jsonb_array_length(public.gaxeta_mag_history(:'mb', now() - interval '10 minutes', now() + interval '1 minute') -> 'movements'),
            '2|1', 'histórico traz as referências do período e as mudanças de 5 p.p.');
select t.ok((select bool_and((h ->> 'samples')::int = (h ->> 'valid')::int + (h ->> 'bus_fail')::int + (h ->> 'no_magnet')::int + (h ->> 'field_out')::int)
               from jsonb_array_elements(public.gaxeta_mag_history(:'m1', now() - interval '10 minutes', now() + interval '1 minute') -> 'history') h),
            'cada intervalo informa quantas amostras foram válidas e quantas falharam, por motivo');
commit;
begin; select t.anon();
select t.throws($$select public.gaxeta_mag_summary(array['ESP32-MAGNE0000001'])$$, '42501', 'resumo magnético negado sem login');
select t.throws($$select public.gaxeta_mag_history('ESP32-MAGNE0000001', now() - interval '1 hour', now())$$, '42501', 'histórico magnético negado sem login');
select t.throws($$select * from gaxeta_private.mag_services$$, '42501', 'tabela de serviços inacessível pela API');
commit;
begin; select t.login(t.id('uA_campo'));
select t.throws($$select * from gaxeta_private.mag_geometries$$, '42501', 'tabela de geometrias inacessível a usuário autenticado');
select t.throws($$select public.gaxeta_mag_set_point_setup(t.id('mag_s1'), 1, null, null, null)$$, '42501', 'operador de campo não troca a geometria do spot');
select t.eq(public.gaxeta_mag_set_equipment_defaults(t.id('mag_eq'), 'medium', 32, null) ->> 'size_class', 'medium', 'quem edita a ficha da TAG registra porte e curso típico (sugestão)');
select t.throws(format($$select public.gaxeta_mag_set_equipment_defaults(t.id('mag_eq'), 'medium', 32, %s)$$, t.id_text('g_a')), '42501', 'mas não sugere geometria (engenharia)');
commit;
begin; select t.login(t.id('adm1'));
select t.eq((t.ms(:'m2') -> 'setup' ->> 'suggested_course_mm') || '|' || (t.ms(:'m2') -> 'setup' ->> 'size_class'), '32.00|medium', 'sugestão da TAG aparece no spot sem sugestão própria, como estimativa');
commit;

-- ---------- 15. Nada do antigo ciclo foi tocado ----------
select t.eq((select count(*) from gaxeta_private.gland_events) || '/' || (select count(*) from gaxeta_private.gland_anchors) || '/' || (select count(*) from gaxeta_private.gland_profiles),
            :ev0 || '/' || :an0 || '/' || :pf0, 'arquivo do ciclo mecânico anterior intacto (eventos/referências/perfis)');
select t.eq((select count(*) from public.gaxeta_movements) - :mv0, 2::bigint, 'gaxeta_movements só recebeu os dois movimentos elétricos deste ensaio (primeira leitura do m4 e 42,5 → 48,0 do m1)');
select t.eq((select count(*) from public.gaxeta_readings where modality = 'as5600_i2c' and (travel_percent is not null or voltage_v is not null or position_mm is not null or adc_raw is not null)), 0::bigint,
            'nenhuma leitura magnética carrega campo elétrico');
select t.eq((select count(*) from gaxeta_private.audit_log where action like 'mag.%') > 10, true, 'comandos magnéticos ficam na auditoria');
