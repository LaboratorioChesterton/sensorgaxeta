\set ON_ERROR_STOP 1
-- Migrações 08 e 09: ciclos de gaxeta, referência por engaxetamento, escala e exclusão de equipamento.
-- Desde a migração 10 este é o comportamento da regra 1, preservado para os ciclos antigos.
-- Roda depois das suítes 30, 40, 60 e 70 (usa a árvore, os sensores e os usuários sintéticos delas).
select set_config('t.suite', '75 ciclos de gaxeta e referência', false);

-- Leitura sintética "agora" (colhida e recebida depois do evento anterior), como a ingestão grava.
create or replace function t.reading(p_sensor text, p_adc numeric, p_noise numeric default 2) returns bigint
 language plpgsql security definer set search_path to '' as $$
declare v_id bigint; v_seq bigint; v_boot text := md5(p_sensor || 'ciclo'); v_now timestamptz;
begin
  perform pg_sleep(1.05); v_now := clock_timestamp();  -- uma leitura por segundo: cada uma no seu intervalo do histórico
  select coalesce(max(sequence), 0) + 1 into v_seq from public.gaxeta_readings where sensor_id = p_sensor and boot_id = v_boot;
  insert into public.gaxeta_readings (sensor_id, boot_id, sequence, received_at, sampled_at, travel_percent, position_mm, voltage_v, adc_raw, rssi, uptime_ms, adc_noise, stable_percent)
  values (p_sensor, v_boot, v_seq, v_now, v_now, round(p_adc / 40.95, 2), round(p_adc * 50 / 4095, 3), round(p_adc * 3.3 / 4095, 4), p_adc, -60, v_seq * 1000, p_noise, round(p_adc / 40.95, 2))
  returning id into v_id;
  update public.gaxeta_devices set last_received_at = v_now, last_sampled_at = v_now, last_boot_id = v_boot, last_sequence = v_seq,
    last_percent = round(p_adc / 40.95, 2), reading_count = reading_count + 1 where sensor_id = p_sensor;
  return v_id;
end $$;
grant execute on function t.reading(text, numeric, numeric) to public;
create or replace function t.id_text(p_k text) returns text language sql security definer set search_path to '' as $$ select v from t.ids where k = p_k $$;
grant execute on function t.id_text(text) to public;
-- Consulta de conferência em tabelas privadas (os papéis da API não as leem).
create or replace function t.priv(p_sql text) returns text language plpgsql security definer set search_path to '' as $$
declare v text; begin execute p_sql into v; return v; end $$;
grant execute on function t.priv(text) to public;
create or replace function t.op_view(p_sensor text) returns text language plpgsql as $$
declare v jsonb;
begin
  v := public.gaxeta_gland_status(p_sensor);
  return (v ->> 'state') || '|' || (v ->> 'can_operate');
exception when insufficient_privilege then return 'negado';
end $$;
create or replace function t.gs(p_sensor text) returns jsonb language sql as $$ select public.gaxeta_gland_status(p_sensor) $$;
-- Esta suíte cobre a regra 1 (ciclos anteriores à migração 10: referência em qualquer posição e
-- curso nominal do firmware). Os eventos novos nascem na regra 2; aqui são devolvidos à regra 1
-- logo depois do registro, para o cálculo preservado continuar verificado. A regra 2 é a suíte 76.
create or replace function t.rule1() returns void language sql security definer set search_path to '' as $$
  update gaxeta_private.gland_events set rule_version = 1 where rule_version = 2 $$;
grant execute on function t.rule1() to public;
-- Registra um evento com o estado atual como esperado e devolve o id.
create or replace function t.gev(p_sensor text, p_kind text, p_mm numeric default null, p_end numeric default null) returns text language plpgsql as $$
declare v_id text;
begin
  select public.gaxeta_record_gland_event(p_sensor, s ->> 'link_id', s ->> 'event_id', gen_random_uuid(), p_kind, p_mm, p_end) ->> 'id' into v_id
    from (select public.gaxeta_gland_status(p_sensor) s) q;
  perform t.rule1();
  return v_id;
end $$;

-- s1 e s2 não têm leituras futuras na fixture; s3 só entra nos testes de escopo.
\set s1 'ESP32-PILOTO000001'
\set s2 'ESP32-BORDA0000001'
\set s3 'ESP32-A00000000003'
select clock_timestamp() as t0 \gset
select md5(pg_get_functiondef('public.gaxeta_ingest(text,jsonb)'::regprocedure) || pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure)
        || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)) as ingest_hash \gset
select count(*) as mov0 from public.gaxeta_movements \gset

-- ---------- Estado inicial e validações ----------
begin; select t.login(t.id('adm1'));
-- Árvore própria da suíte (o estado deixado pelas suítes 40 e 50 varia com a concorrência):
-- s1 e s2 em TAGs novos no ramo do operador de campo (Caldeiraria); s3 em área fora desse ramo.
select t.put('cg_eq1', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-CICLO-1', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cg_sp1', public.gaxeta_save_asset(null, t.id('cg_eq1'), 'point', 'LOA', '', '') ->> 'id');
select t.put('cg_eq2', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-CICLO-2', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cg_sp2', public.gaxeta_save_asset(null, t.id('cg_eq2'), 'point', 'LA', '', '') ->> 'id');
select t.put('cg_area', public.gaxeta_save_asset(null, t.id('A1'), 'area', 'ZZ Área 75', '', '') ->> 'id');
select t.put('cg_eq3', public.gaxeta_save_equipment(null, t.id('cg_area'), 'ZZ-CICLO-3', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('cg_sp3', public.gaxeta_save_asset(null, t.id('cg_eq3'), 'point', 'UNICO', '', '') ->> 'id');
select case when t.priv('select measurement_point_id::text from public.gaxeta_devices where sensor_id = ''' || x || '''') is not null
            then public.gaxeta_unlink_sensor(x, 'teste 75') ->> 'sensor_id' end
  from unnest(array[:'s1', :'s2', :'s3']) x;
select t.eq(public.gaxeta_link_sensor(:'s1', t.id('cg_sp1'), 'teste 75') ->> 'measurement_point_id', t.id('cg_sp1')::text, 's1 instalado no spot de teste');
select t.eq(public.gaxeta_link_sensor(:'s2', t.id('cg_sp2'), 'teste 75') ->> 'measurement_point_id', t.id('cg_sp2')::text, 's2 instalado no spot de teste');
select t.eq(public.gaxeta_link_sensor(:'s3', t.id('cg_sp3'), 'teste 75') ->> 'measurement_point_id', t.id('cg_sp3')::text, 's3 instalado fora do ramo do operador');
select t.eq(t.gs(:'s1') ->> 'state', 'no_reference', 'sensor vinculado sem evento: sem referência');
select t.eq(t.gs(:'s1') ->> 'can_operate', 'true', 'adm1 pode operar');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'check', 25)$$, 'antes de conferir', 'conferência sem ciclo ativo é recusada');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'replacement', 0)$$, '22023', 'distância zero é recusada');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'replacement', 30.1234)$$, '22023', 'mais de três casas decimais é recusado');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'replacement', 30, 30)$$, '22023', 'fim de ajuste igual à distância medida é recusado');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'replacement', 30, -1)$$, '22023', 'fim de ajuste negativo é recusado');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'maintenance', 30)$$, '22023', 'início de manutenção não recebe medida');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'outro', 30)$$, '22023', 'operação desconhecida é recusada');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-PILOTO000001', '999999', null, gen_random_uuid(), 'replacement', 30, 10)$$, 'PT409', 'vínculo desatualizado é recusado');
select t.eq(t.priv('select count(*) from gaxeta_private.gland_events'), '0', 'nenhuma recusa deixou evento gravado');
commit;

-- ---------- Registro, idempotência e concorrência ----------
begin; select t.login(t.id('adm1'));
select t.gs(:'s1') ->> 'link_id' as link1 \gset
select '11111111-1111-4111-8111-111111111111'::uuid as req1 \gset
select t.put('g_ev1', public.gaxeta_record_gland_event(:'s1', :'link1', null, :'req1', 'replacement', 30, 10) ->> 'id');
select t.rule1();
select t.eq(public.gaxeta_record_gland_event(:'s1', :'link1', null, :'req1', 'replacement', 30, 10) ->> 'duplicate', 'true', 'mesma solicitação reenviada: devolve o evento, sem duplicar');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-PILOTO000001', (select t.gs('ESP32-PILOTO000001') ->> 'link_id'), null, '11111111-1111-4111-8111-111111111111', 'replacement', 31, 10)$$, 'PT409', 'mesma solicitação com outra medida é recusada');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-PILOTO000001', (select t.gs('ESP32-PILOTO000001') ->> 'link_id'), null, gen_random_uuid(), 'replacement', 30, 10)$$, 'PT409', 'registro repetido com estado desatualizado é recusado');
select t.eq(t.priv('select count(*) from gaxeta_private.gland_events'), '1', 'um único evento gravado');
select t.eq(t.gs(:'s1') ->> 'state', 'waiting', 'referência registrada sem leitura posterior: aguardando');
select t.eq(t.gs(:'s1') ->> 'percent', null, 'aguardando: nenhum percentual é apresentado');
commit;

-- Leitura ruidosa não vira referência; a primeira leitura boa vira.
select t.reading(:'s1', 1800, 80) \gset bad_
begin; select t.login(t.id('adm1'));
select t.eq(t.gs(:'s1') ->> 'state', 'waiting', 'leitura ruidosa depois do registro não forma referência');
commit;
select t.reading(:'s1', 2000) \gset a_
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'state') || '|' || (t.gs(:'s1') ->> 'percent') || '|' || (t.gs(:'s1') ->> 'distance_mm') || '|' || (t.gs(:'s1') -> 'scale' ->> 'source'),
            'active|100.0|30.00|nominal', 'primeira leitura boa: 100 % na distância medida, escala nominal');
select t.eq(t.gs(:'s1') -> 'anchor' ->> 'adc', '2000.000', 'referência associada ao ADC daquele momento');
commit;

-- Avanço do preme-gaxeta: 409,5 contagens a menos = 5 mm a menos na escala nominal (50 mm / 4095).
select t.reading(:'s1', 1590.5) \gset b_
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'distance_mm') || '|' || (t.gs(:'s1') ->> 'percent'), '25.00|75.0', 'distância e percentual acompanham o ADC (30→25 mm, fim em 10 mm: 75 %)');
commit;
select t.reading(:'s1', 1590.5, 80) \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'state') || '|' || coalesce(t.gs(:'s1') ->> 'percent', 'NULL'), 'unusable|NULL', 'última leitura ruidosa: estado inutilizável, sem percentual');
commit;
select t.reading(:'s1', 3900) \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'out_of_range') || '|' || (t.gs(:'s1') ->> 'near_limit'), 'true|true', 'leitura acima da referência e perto do batente é sinalizada');
commit;

-- ---------- Conferência com paquímetro: escala medida ----------
select t.reading(:'s1', 1590.5) \gset
begin; select t.login(t.id('adm1'));
select t.put('g_chk', t.gev(:'s1', 'check', 26));
select t.eq(t.gs(:'s1') -> 'scale' ->> 'source', 'nominal', 'conferência sem leitura posterior ainda não muda a escala');
commit;
select t.reading(:'s1', 1590.5) \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') -> 'scale' ->> 'source') || '|' || (t.gs(:'s1') -> 'scale' ->> 'mm_per_count') || '|' || (t.gs(:'s1') ->> 'distance_mm') || '|' || (t.gs(:'s1') ->> 'percent'),
            'measured|0.009768|26.00|80.0', 'escala medida: (26−30) mm / (1590,5−2000) contagens; a distância passa a bater com o paquímetro');
select t.eq(t.gs(:'s1') ->> 'cycle_event_id', t.id_text('g_ev1'), 'a conferência não abre ciclo novo');
commit;

-- Conferência com variação pequena de ADC não vale como escala.
begin; select t.login(t.id('adm1'));
select t.put('g_ev_s2', t.gev(:'s2', 'replacement', 40, 20));
commit;
select t.reading(:'s2', 1000) \gset
begin; select t.login(t.id('adm1'));
select t.gev(:'s2', 'check', 39.5) \gset
commit;
select t.reading(:'s2', 1050) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.gs(:'s2') -> 'scale' ->> 'source', 'nominal', 'conferência com menos de 100 contagens de diferença não define escala');
select t.eq((t.gs(:'s2') ->> 'distance_mm') || '|' || (t.gs(:'s2') ->> 'percent'), '40.61|103.1', 'cada sensor usa a própria referência (s2: 40 mm, fim 20 mm)');
select t.eq((t.gs(:'s1') ->> 'initial_mm') || '|' || (t.gs(:'s1') ->> 'end_mm'), '30.000|10.000', 'a referência de um sensor não altera a de outro');
commit;

-- ---------- Manutenção e novo ciclo: histórico preservado ----------
begin; select t.login(t.id('adm1'));
select t.put('g_mnt', t.gev(:'s1', 'maintenance'));
select t.eq(t.gs(:'s1') ->> 'state', 'maintenance', 'manutenção iniciada');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'maintenance')$$, 'já está em manutenção', 'manutenção repetida é recusada');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'check', 20)$$, 'antes de conferir', 'conferência durante a manutenção é recusada');
commit;
select t.reading(:'s1', 300) \gset
select t.reading(:'s1', 3500) \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'state') || '|' || coalesce(t.gs(:'s1') ->> 'percent', 'NULL'), 'maintenance|NULL', 'leituras durante a manutenção não viram percentual');
select t.put('g_ev2', t.gev(:'s1', 'adjustment', 22));
commit;
select t.reading(:'s1', 3000) \gset
begin; select t.login(t.id('adm1'));
select t.eq((t.gs(:'s1') ->> 'state') || '|' || (t.gs(:'s1') ->> 'distance_mm') || '|' || coalesce(t.gs(:'s1') ->> 'percent', 'NULL') || '|' || (t.gs(:'s1') -> 'anchor' ->> 'adc'),
            'active|22.00|NULL|3000.000', 'novo ciclo: referência nova no ADC atual (posição diferente da anterior); sem fim de ajuste não há percentual');
select t.eq(t.gs(:'s1') -> 'scale' ->> 'source', 'measured', 'a escala medida continua valendo na mesma instalação');
commit;
select t.reading(:'s1', 2795.25) \gset
begin; select t.login(t.id('adm1'));
select t.eq(t.gs(:'s1') ->> 'distance_mm', '20.00', 'novo ciclo usa a escala medida: −204,75 contagens = −2 mm');
select t.eq(jsonb_array_length(t.gs(:'s1') -> 'events'), 4, 'histórico de eventos completo (troca, conferência, manutenção, reajuste)');
select t.eq((select string_agg(e ->> 'kind', ',' order by (e ->> 'id')::bigint) from jsonb_array_elements(t.gs(:'s1') -> 'events') e), 'replacement,check,maintenance,adjustment', 'ordem dos eventos preservada');
select t.eq((select e -> 'anchor' ->> 'adc' from jsonb_array_elements(t.gs(:'s1') -> 'events') e where e ->> 'id' = t.id_text('g_ev1')), '2000.000', 'referência do ciclo anterior permanece a mesma');
-- Histórico por ciclo: leituras antigas com a referência antiga, novas com a nova.
select t.eq((select string_agg((p ->> 'distance_mm') || '/' || coalesce(p ->> 'percent', '-'), ' ' order by p ->> 'received_at')
               from jsonb_array_elements(public.gaxeta_gland_history(:'s1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'points') p),
            '30.00/100.0 25.00/75.0 53.20/216.0 25.00/75.0 26.00/80.0 22.00/- 20.00/-',
            'histórico: cada leitura com a referência e a escala da sua época; manutenção e ruído ficam de fora');
select t.eq(jsonb_array_length(public.gaxeta_gland_history(:'s1', :'t0'::timestamptz, clock_timestamp() + interval '1 minute') -> 'events'), 4, 'histórico devolve os eventos do período');
select t.eq(t.priv('select count(*) from gaxeta_private.gland_events where id = ' || t.id_text('g_ev1') || ' and initial_mm = 30 and end_mm = 10'), '1', 'evento antigo intacto depois do novo ciclo');
select t.throws($$update gaxeta_private.gland_events set initial_mm = 1$$, '42501', 'eventos não são editáveis pela API');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'gland.', 'ESP32-PILOTO000001', null)) >= 4, 'eventos do ciclo ficam na auditoria');
commit;

-- ---------- Resumo para listas ----------
begin; select t.login(t.id('adm1'));
select t.eq((select string_agg((i ->> 'sensor_id') || ':' || (i ->> 'state'), ' ' order by i ->> 'sensor_id')
               from jsonb_array_elements(public.gaxeta_gland_summary(array[:'s1', :'s2', :'s3', 'NAO-EXISTE']) -> 'items') i),
            'ESP32-A00000000003:no_reference ESP32-BORDA0000001:active ESP32-PILOTO000001:active', 'resumo: estado por sensor, ignorando identificador desconhecido');
select t.ok((select (i ->> 'interval_s')::numeric >= 0 from jsonb_array_elements(public.gaxeta_gland_summary(array[:'s1']) -> 'items') i), 'resumo traz a cadência observada');
commit;

-- ---------- Autorização ----------
begin; select t.login(t.id('adm2'));
select t.eq(t.gs(:'s1') ->> 'can_operate', 'true', 'adm2 pode operar');
commit;
begin; select t.login(t.id('adm3'));
select t.eq(t.gs(:'s1') ->> 'can_operate', 'false', 'adm3 consulta, sem operar');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'maintenance')$$, '42501', 'adm3: registro negado no servidor');
commit;
begin; select t.login(t.id('uA_campo'));
select t.eq(t.gs(:'s2') ->> 'can_operate', 'true', 'operador com edição no ramo pode operar o sensor do ramo');
select t.put('g_chk2', t.gev(:'s2', 'check', 39.9));
-- Conforme o que as suítes anteriores deixaram, o operador pode ter uma janela antiga deste sensor
-- (vínculo passado no seu ramo). Nos dois casos ele não vê o ciclo atual nem pode operar.
select t.ok(t.op_view('ESP32-A00000000003') in ('negado', 'unlinked|false'), 'operador: sensor da mesma corporação fora do ramo concedido não expõe o ciclo atual');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-A00000000003', '1', null, gen_random_uuid(), 'maintenance', null)$$, '42501', 'operador: registro fora do ramo concedido é negado');
select t.throws($$select public.gaxeta_gland_status('ESP32-B00000000001')$$, '42501', 'operador: sensor de outra corporação é invisível');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-B00000000001', '4', null, gen_random_uuid(), 'maintenance', null)$$, '42501', 'operador: registro em sensor de outra corporação é negado');
select t.throws($$select public.gaxeta_gland_history('ESP32-B00000000001', now() - interval '1 hour', now())$$, '42501', 'operador: histórico por ciclo de outra corporação é negado');
select t.eq(jsonb_array_length(public.gaxeta_gland_summary(array['ESP32-B00000000001']) -> 'items'), 0, 'operador: resumo não devolve sensor de outra corporação');
commit;
begin; select t.login(t.id('uA_all'));
select t.eq(t.gs(:'s1') ->> 'can_operate', 'false', 'usuário sem edição consulta o ciclo, sem operar');
select t.throws($$select t.gev('ESP32-PILOTO000001', 'maintenance')$$, '42501', 'usuário sem edição: registro negado');
commit;
begin; select t.login(t.id('uB_all'));
select t.throws($$select public.gaxeta_gland_status('ESP32-PILOTO000001')$$, '42501', 'outra corporação: estado do ciclo negado');
commit;
begin; select t.anon();
select t.throws($$select public.gaxeta_gland_status('ESP32-PILOTO000001')$$, '42501', 'anônimo: sem acesso às funções do ciclo');
select t.throws($$select public.gaxeta_gland_summary(array['ESP32-PILOTO000001'])$$, '42501', 'anônimo: sem acesso ao resumo');
commit;

-- ---------- Desvínculo e nova instalação ----------
begin; select t.login(t.id('adm1'));
select public.gaxeta_unlink_sensor(:'s2', 'teste 75') ->> 'sensor_id' as un \gset
select t.eq(t.gs(:'s2') ->> 'state', 'unlinked', 'sensor desvinculado: sem ciclo ativo');
select t.throws($$select public.gaxeta_record_gland_event('ESP32-BORDA0000001', '7', null, gen_random_uuid(), 'maintenance', null)$$, '42501', 'sensor sem vínculo não recebe evento');
select t.eq(public.gaxeta_link_sensor(:'s2', t.id('cg_sp2'), 'teste 75: reinstalação') ->> 'sensor_id', :'s2', 'sensor reinstalado no mesmo spot');
select t.eq(t.gs(:'s2') ->> 'state', 'no_reference', 'nova instalação começa sem referência (a anterior não é reaproveitada)');
select t.eq(jsonb_array_length(t.gs(:'s2') -> 'events'), 3, 'eventos da instalação anterior continuam no histórico');
commit;

-- ---------- Exclusão de equipamento ----------
begin; select t.login(t.id('adm1'));
select t.put('eq_desc', public.gaxeta_save_equipment(null, t.id('A1_cald'), 'ZZ-DESCARTE', '{"equipment_type":"agitador"}') ->> 'id');
select t.put('eq_desc_s', public.gaxeta_save_asset(null, t.id('eq_desc'), 'point', 'LOA', '', '') ->> 'id');
select t.eq((public.gaxeta_asset_dependencies(t.id('eq_desc')) ->> 'children')::int, 1, 'dependências: equipamento com um spot');
select t.throws($$select public.gaxeta_delete_asset(t.id('eq_desc'), 'teste')$$, '23503', 'equipamento com spot: exclusão bloqueada no servidor');
select t.throws($$select public.gaxeta_delete_asset(t.id('cg_sp1'), 'teste')$$, '23503', 'spot com sensor vinculado e histórico de instalação: exclusão bloqueada');
select t.throws($$select public.gaxeta_delete_asset(t.id('cg_eq1'), 'teste')$$, '23503', 'equipamento com spot, sensor e histórico: exclusão bloqueada');
select t.eq((select count(*) from public.gaxeta_assets where id in (t.id('eq_desc'), t.id('cg_eq1'), t.id('cg_sp1'))), 3::bigint, 'bloqueio preserva os equipamentos');
commit;
begin; select t.login(t.id('adm2'));
select t.throws($$select public.gaxeta_delete_asset(t.id('eq_desc_s'), 'teste')$$, '42501', 'adm2: exclusão negada');
commit;
begin; select t.login(t.id('uA_campo'));
select t.throws($$select public.gaxeta_delete_asset(t.id('eq_desc_s'), 'teste')$$, '42501', 'operador com edição: exclusão negada');
commit;
begin; select t.login(t.id('adm1'));
select t.eq(public.gaxeta_delete_asset(t.id('eq_desc_s'), 'teste 75') ->> 'deleted', t.id('eq_desc_s')::text, 'adm1: spot vazio excluído');
select t.eq(public.gaxeta_delete_asset(t.id('eq_desc'), 'teste 75') ->> 'deleted', t.id('eq_desc')::text, 'adm1: equipamento sem dependências excluído');
select t.eq((select count(*) from public.gaxeta_assets where id in (t.id('eq_desc'), t.id('eq_desc_s'))), 0::bigint, 'exclusão persistida');
select t.eq((select count(*) from public.gaxeta_equipment_details where asset_id = t.id('eq_desc')), 0::bigint, 'ficha técnica excluída junto');
select t.ok(jsonb_array_length(public.gaxeta_admin_audit(50, 0, 'asset.', t.id('eq_desc')::text, null)) >= 1, 'exclusão registrada na auditoria');
commit;

-- ---------- Ingestão e medição intocadas ----------
select t.eq(md5(pg_get_functiondef('public.gaxeta_ingest(text,jsonb)'::regprocedure) || pg_get_functiondef('public.gaxeta_ingest_v3(text,jsonb)'::regprocedure)
        || pg_get_functiondef('gaxeta_private.stabilize(numeric,numeric)'::regprocedure)), :'ingest_hash', 'ingestão e estabilização sem alteração');
select t.eq((select count(*) from public.gaxeta_movements), :mov0::bigint, 'nenhum movimento criado ou removido pelos eventos do ciclo');
