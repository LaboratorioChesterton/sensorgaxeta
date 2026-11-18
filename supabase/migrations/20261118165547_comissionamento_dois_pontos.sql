-- Migração 11: comissionamento em dois pontos, idade da leitura ao confirmar e diagnóstico do bloco.
--
-- O que muda (tudo aditivo; ingestão, estabilização, registro de eventos e permissões não mudam):
--   1. Diagnóstico do bloco de amostras (gland_block): separa o bloco estável inteiro no teto do
--      ADC ("ceiling": limite da medição, 100 % da escala elétrica) do bloco misto ("mixed_high":
--      amostras no teto junto com amostras muito diferentes, a investigar) e do bloco instável.
--      A elegibilidade para calibrar (gland_quality) continua a mesma: teto e instável não calibram.
--   2. Dois tempos por leitura: transporte (amostra → chegada, já limitado a 30 s) e idade
--      (chegada → agora). A confirmação pelo técnico passa a exigir leitura de agora: no máximo
--      um intervalo de envio da placa (1,25 × cadência + 15 s, entre 45 s e 240 s).
--   3. Leitura intermediária não vira topo sem declaração: se, depois do registro, o sensor já
--      mostrou posição estável mais alta (inclusive o teto do ADC), a confirmação exige a
--      declaração explícita do técnico (p_ack_lower), registrada na auditoria.
--   4. Comissionamento em dois pontos: com a referência aprovada no topo (V100, D100) e uma
--      conferência válida no mesmo ciclo (no fim de ajuste: V0, D0; ou em outra posição
--      conhecida), um administrador de nível 1 ou 2 grava a razão medida no perfil versionado da
--      instalação (gaxeta_commission_gland). Os ciclos seguintes da mesma instalação, com o mesmo
--      método de aquisição, reaproveitam a marca superior e a razão: basta registrar as medidas.
--   5. Reconciliação do cadastro: gaxeta_gland_status devolve, só a quem registrou, a chave de
--      idempotência de cada evento, para a tela confirmar um envio cuja resposta se perdeu.
--
-- Substituição de um cadastro pendente: continua sendo um novo registro (gaxeta_record_gland_event).
-- O evento anterior fica no histórico, sem referência aprovada; nada é apagado nem editado.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 1. Perfil: origem do comissionamento (nula nos perfis informados manualmente)
-- ---------------------------------------------------------------------------
alter table gaxeta_private.gland_profiles add column origin jsonb;
comment on column gaxeta_private.gland_profiles.origin is
  'Preenchida quando a versão do perfil nasce de um comissionamento em dois pontos: ciclo e conferência de origem, D100/V100, segunda medida (D2/V2), D0/V0 calculado e se a segunda medida foi feita no fim de ajuste.';

-- ---------------------------------------------------------------------------
-- 2. Diagnóstico do bloco, cadência e limite de idade para confirmar
-- ---------------------------------------------------------------------------
-- ceiling    : bloco inteiro em 4095. É o limite do ADC: tensões acima do teto ficam indistinguíveis.
-- touch_high : alguma amostra em 4095, bloco pouco disperso: a posição encosta no teto.
-- mixed_high : amostras em 4095 junto com amostras muito diferentes (mais de 400 contagens de
--              amplitude ou dispersão acima de 25): contato, movimento na aquisição ou circuito.
-- floor / touch_low / mixed_low: o mesmo no limite inferior.
-- unstable   : sem tocar os limites, mas disperso demais para calibrar.
create function gaxeta_private.gland_block(p_adc numeric, p_noise numeric, p_min integer, p_max integer)
 returns text language sql immutable set search_path = '' as $$
  select case
    when p_adc is null then 'missing'
    when coalesce(p_min, case when p_adc >= 4095 then 4095 end) >= 4095 then 'ceiling'
    when coalesce(p_max, case when p_adc <= 0 then 0 end) <= 0 then 'floor'
    when p_max >= 4095 and (p_max - p_min > 400 or coalesce(p_noise, 0) > 25) then 'mixed_high'
    when p_min <= 0 and (p_max - p_min > 400 or coalesce(p_noise, 0) > 25) then 'mixed_low'
    when p_max >= 4095 or p_adc >= 4095 then 'touch_high'
    when p_min <= 0 or p_adc <= 0 then 'touch_low'
    when p_noise is null then 'missing'
    when p_noise > 25 or p_max - p_min > 400 then 'unstable'
    else 'ok' end
$$;

-- Intervalo típico entre envios da placa (mediana dos três últimos intervalos), em segundos.
create function gaxeta_private.gland_cadence(p_sensor_id text)
 returns numeric language sql stable set search_path = '' as $$
  select round(percentile_disc(0.5) within group (order by extract(epoch from g.gap))::numeric, 1) from (
    select q.received_at - pg_catalog.lag(q.received_at) over (order by q.received_at) as gap from (
      select r.received_at from public.gaxeta_readings r
       where r.sensor_id = p_sensor_id order by r.received_at desc limit 4) q) g
   where g.gap is not null
$$;

-- Idade máxima (chegada → agora) de uma leitura para o técnico confirmá-la como referência.
create function gaxeta_private.gland_confirm_max_age(p_cadence_s numeric)
 returns numeric language sql immutable set search_path = '' as $$
  select least(240, greatest(45, round(1.25 * coalesce(p_cadence_s, 0) + 15)))
$$;

-- Posição estável mais alta lida desde um instante (últimos 7 dias), fora a leitura indicada.
create function gaxeta_private.gland_peak(p_sensor_id text, p_since timestamptz, p_reading_id bigint)
 returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('reading_id', x.id::text, 'adc', x.adc_raw, 'voltage_mv', x.voltage_mv,
           'sampled_at', x.sampled_at, 'received_at', x.received_at, 'block', x.block,
           'electric_percent', case when x.block = 'ceiling' then 100 else round(least(100, x.adc_raw * 100 / 4095), 1) end)
    from (select r.id, r.adc_raw, r.voltage_mv, r.sampled_at, r.received_at,
                 gaxeta_private.gland_block(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max) as block
            from public.gaxeta_readings r
           where r.sensor_id = p_sensor_id and r.received_at >= p_since
             and r.received_at >= pg_catalog.clock_timestamp() - interval '7 days'
             and r.sampled_at >= p_since and r.id <> p_reading_id) x
   where x.block in ('ok', 'ceiling', 'touch_high')
   order by x.adc_raw desc, x.id desc limit 1
$$;

-- ---------------------------------------------------------------------------
-- 3. Rascunho do comissionamento em dois pontos do ciclo vigente
-- ---------------------------------------------------------------------------
-- Existe quando o ciclo vigente tem a referência aprovada (V100 em D100) e a inclinação em uso
-- vem de uma conferência válida deste mesmo ciclo (segunda medida). Nulo nos demais casos,
-- inclusive depois de gravado no perfil (a inclinação passa a vir do perfil).
create function gaxeta_private.gland_commission_draft(p_link_id bigint, p_cycle_id bigint)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  e gaxeta_private.gland_events%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  c gaxeta_private.gland_events%rowtype;
  ca gaxeta_private.gland_anchors%rowtype;
  m jsonb;
begin
  if p_link_id is null or p_cycle_id is null then return null; end if;
  select * into e from gaxeta_private.gland_events
    where id = p_cycle_id and link_id = p_link_id and kind in ('replacement', 'adjustment') and rule_version >= 2;
  if e.id is null or exists (select 1 from gaxeta_private.gland_events g
                              where g.link_id = p_link_id and g.kind <> 'check' and g.id > e.id) then
    return null;
  end if;
  select * into a from gaxeta_private.gland_anchors where event_id = e.id;
  if a.event_id is null then return null; end if;
  m := gaxeta_private.gland_model(p_link_id, e.id, pg_catalog.clock_timestamp());
  if m ->> 'source' is distinct from 'measured' or coalesce((m ->> 'source_event_id')::bigint, 0) <= e.id then
    return null;
  end if;
  select * into c from gaxeta_private.gland_events where id = (m ->> 'source_event_id')::bigint;
  select * into ca from gaxeta_private.gland_anchors where event_id = c.id;
  return jsonb_build_object(
    'quantity', a.quantity, 'acq_method', a.acq_method,
    'high_value', a.value, 'high_tolerance', case when a.quantity = 'mv' then 60 else 75 end,
    'valid_lo', m -> 'valid_lo', 'valid_hi', m -> 'valid_hi', 'mm_per_unit', round((m ->> 'k')::numeric, 8),
    'origin', jsonb_build_object('cycle_event_id', e.id::text, 'check_event_id', c.id::text,
      'd100_mm', e.initial_mm, 'v100', a.value, 'd2_mm', c.initial_mm, 'v2', ca.value,
      'd0_mm', e.end_mm, 'v0', m -> 'v0', 'end_ok', m -> 'end_ok',
      'at_end', e.end_mm is not null and c.initial_mm = e.end_mm,
      'points', m -> 'points', 'max_residual_mm', m -> 'max_residual_mm', 'resolution_mm', m -> 'resolution_mm'));
end $$;

-- ---------------------------------------------------------------------------
-- 4. Estado atual do ciclo: bloco, posição elétrica, tempos da leitura e candidata a referência
-- ---------------------------------------------------------------------------
create or replace function gaxeta_private.gland_state(d public.gaxeta_devices, win tstzmultirange)
 returns jsonb language plpgsql stable set search_path = '' as $$
declare
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  v_last_id bigint; anchor jsonb; scale jsonb; val jsonb; model jsonb; w jsonb; cur jsonb; cand jsonb;
  status text := 'no_reference'; v_wait text; v_reason text; v_quality text; v_fresh boolean; v_value numeric;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_block text; v_age numeric; v_transport numeric; v_cadence numeric; v_max_age numeric; v_peak jsonb; v_below boolean;
begin
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and unlinked_at is null and linked_at <@ win;
  if l.id is null then
    return jsonb_build_object('state', 'unlinked', 'can_operate', false);
  end if;
  select id into v_last_id from gaxeta_private.gland_events where link_id = l.id order by id desc limit 1;
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  select * into r from public.gaxeta_readings
    where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  p := gaxeta_private.gland_profile_at(l.id, v_now);
  v_quality := gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, p.noise_max);
  v_fresh := coalesce(r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds', false);
  -- Diagnóstico do bloco (teto estável, bloco misto, instável) e os dois tempos da leitura:
  -- transporte (da amostra à chegada) e idade (da chegada até agora).
  v_block := gaxeta_private.gland_block(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max);
  v_age := round(extract(epoch from v_now - r.received_at)::numeric, 1);
  v_transport := round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1);
  v_cadence := gaxeta_private.gland_cadence(d.sensor_id);
  v_max_age := gaxeta_private.gland_confirm_max_age(v_cadence);
  -- Leitura atual com a origem de cada grandeza: tensão calibrada quando o firmware envia,
  -- senão a estimativa adc × 3,3 / 4095 de sempre.
  cur := case when r.id is null then null else jsonb_build_object(
    'reading_id', r.id::text, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
    'adc', r.adc_raw, 'adc_min', r.adc_min, 'adc_max', r.adc_max, 'noise', r.adc_noise,
    'voltage_mv', coalesce(r.voltage_mv, round(r.voltage_v * 1000)::integer),
    'voltage_source', case when r.voltage_mv is not null then 'calibrated' else 'estimated' end,
    'acq_method', r.acq_method, 'quality', v_quality, 'fresh', v_fresh,
    'block', v_block, 'at_ceiling', v_block = 'ceiling',
    'electric_percent', case when v_block = 'ceiling' then 100 else round(least(100, greatest(0, r.adc_raw * 100 / 4095)), 1) end,
    'age_s', v_age, 'transport_s', v_transport) end;

  if e.kind = 'maintenance' then
    status := 'maintenance';

  elsif e.id is not null and e.rule_version < 2 then
    -- Regra 1 (ciclos anteriores a esta migração): cálculo preservado, estimativa nominal.
    anchor := gaxeta_private.gland_anchor(d.sensor_id, e.recorded_at, 'infinity'::timestamptz);
    status := 'waiting';
    if anchor is not null then
      status := 'unusable';
      scale := gaxeta_private.gland_scale(d.sensor_id, l.id, v_now);
      if r.sampled_at >= (anchor ->> 'sampled_at')::timestamptz
         and r.sampled_at <= r.received_at and r.received_at - r.sampled_at <= interval '30 seconds'
         and gaxeta_private.gland_sample_ok(r.adc_raw, r.adc_noise) then
        status := 'active';
        val := gaxeta_private.gland_value(e.initial_mm, e.end_mm, anchor,
                 (scale ->> 'mm_per_count')::numeric, r.adc_raw, r.position_mm);
      end if;
    end if;
    return jsonb_build_object('state', status, 'rule', 1, 'calibrated', false, 'link_id', l.id::text,
      'event_id', v_last_id::text, 'cycle_event_id', e.id::text, 'kind', e.kind,
      'can_operate', gaxeta_authz.can_operate_point(l.point_id),
      'initial_mm', e.initial_mm, 'end_mm', e.end_mm, 'recorded_at', e.recorded_at,
      'anchor', anchor, 'scale', scale, 'current', cur,
      'current_adc', case when val is not null then r.adc_raw end,
      'current_sampled_at', case when val is not null then r.sampled_at end,
      'delta_adc', case when val is not null then r.adc_raw - (anchor ->> 'adc')::numeric end,
      'distance_mm', val -> 'distance_mm', 'percent', val -> 'percent',
      'advance_mm', case when val is not null then e.initial_mm - (val ->> 'distance_mm')::numeric end,
      'out_of_range', coalesce((val ->> 'percent')::numeric not between -5 and 105, false),
      'near_limit', coalesce(val is not null and (r.adc_raw <= 205 or r.adc_raw >= 3890), false));

  elsif e.id is not null then
    -- Regra 2: referência na marca superior validada.
    select * into a from gaxeta_private.gland_anchors where event_id = e.id;
    if a.event_id is null then
      status := 'waiting';
      w := gaxeta_private.gland_window(l.id, v_now);
      if r.id is null or r.sampled_at is null or r.sampled_at < e.recorded_at
         or d.last_received_at < e.recorded_at then
        v_wait := 'no_sample';
      elsif v_quality <> 'ok' then
        v_wait := v_quality;
      elsif not v_fresh then
        v_wait := 'stale';
      elsif v_age > v_max_age then
        -- A leitura é boa, mas já não é de agora: não é oferecida para confirmação.
        v_wait := 'aged';
      else
        v_value := case when w is null then coalesce(r.voltage_mv::numeric, r.adc_raw)
                        else gaxeta_private.gland_qvalue(w ->> 'quantity', w ->> 'acq_method', r.adc_raw, r.voltage_mv, r.acq_method) end;
        v_wait := case when w is null then 'needs_confirmation'
                       when v_value is null then 'method_changed'
                       else 'outside_window' end;
        -- Leitura que o técnico pode confirmar com a marca superior fisicamente mantida.
        -- Maior posição estável lida desde o registro: se ela está acima da candidata, o
        -- potenciômetro já esteve mais alto e a candidata pode ser uma posição intermediária.
        v_peak := gaxeta_private.gland_peak(d.sensor_id, e.recorded_at, r.id);
        v_below := coalesce((v_peak ->> 'adc')::numeric - r.adc_raw > 75, false);
        cand := jsonb_build_object('reading_id', r.id::text, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
          'age_s', v_age, 'transport_s', v_transport, 'max_age_s', v_max_age,
          'electric_percent', round(least(100, greatest(0, r.adc_raw * 100 / 4095)), 1),
          'below_peak', v_below, 'peak', case when v_below then v_peak end,
          'quantity', case when r.voltage_mv is not null then 'mv' else 'adc' end,
          'value', coalesce(r.voltage_mv::numeric, r.adc_raw), 'adc', r.adc_raw, 'voltage_mv', r.voltage_mv, 'noise', r.adc_noise);
      end if;
    else
      anchor := jsonb_build_object('id', a.reading_id::text, 'sampled_at', a.sampled_at, 'approved_at', a.approved_at,
        'mode', a.mode, 'quantity', a.quantity, 'value', a.value, 'adc', a.adc_raw, 'voltage_mv', a.voltage_mv,
        'noise', a.adc_noise, 'percent', 100, 'window_lo', a.window_lo, 'window_hi', a.window_hi,
        'actor', (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = a.approved_by));
      model := gaxeta_private.gland_model(l.id, e.id, v_now);
      w := gaxeta_private.gland_window(l.id, v_now);
      v_value := gaxeta_private.gland_qvalue(a.quantity, a.acq_method, r.adc_raw, r.voltage_mv, r.acq_method);
      if r.id is null or r.sampled_at < a.sampled_at or v_quality <> 'ok' or not v_fresh then
        status := 'unusable';
        v_reason := case when v_quality <> 'ok' then v_quality when not v_fresh then 'stale' else 'no_sample' end;
      elsif v_value is null then
        status := 'no_scale'; v_reason := 'method_changed';
      elsif model ->> 'k' is null then
        status := 'no_scale'; v_reason := model ->> 'reason';
      else
        val := gaxeta_private.gland_eval(model, v_value);
        status := case when not (val ->> 'in_range')::boolean then 'out_of_range'
                       when not (model ->> 'end_ok')::boolean then 'no_end'
                       else 'active' end;
        v_reason := case when status = 'out_of_range' then val ->> 'side'
                         when status = 'no_end' then case when e.end_mm is null then 'missing' else 'outside_validated' end end;
      end if;
      scale := case when model ->> 'k' is null
        then jsonb_build_object('source', 'none', 'reason', model ->> 'reason', 'unit', model ->> 'unit')
        else jsonb_build_object('source', model ->> 'source', 'mm_per_unit', model -> 'mm_per_unit', 'unit', model ->> 'unit',
          'event_id', model ->> 'source_event_id', 'recorded_at', model -> 'source_at', 'profile_version', model -> 'profile_version',
          'valid_lo', model -> 'valid_lo', 'valid_hi', model -> 'valid_hi', 'v0', model -> 'v0', 'end_ok', model -> 'end_ok',
          'resolution_mm', model -> 'resolution_mm', 'points', model -> 'points', 'max_residual_mm', model -> 'max_residual_mm') end;
    end if;
  end if;

  return jsonb_build_object('state', status, 'rule', e.rule_version,
    'calibrated', status = 'active', 'link_id', l.id::text,
    'event_id', v_last_id::text, 'cycle_event_id', e.id::text, 'kind', e.kind,
    'can_operate', gaxeta_authz.can_operate_point(l.point_id),
    'initial_mm', e.initial_mm, 'end_mm', e.end_mm, 'recorded_at', e.recorded_at,
    'anchor', anchor, 'scale', scale, 'current', cur, 'window', w, 'candidate', cand,
    'wait_reason', v_wait, 'reason', v_reason, 'confirm_max_age_s', v_max_age, 'cadence_s', v_cadence, 'unit', coalesce(model ->> 'unit', case when w ->> 'quantity' = 'adc' then 'contagens' when w is not null then 'mV' end),
    'value', v_value,
    'current_adc', case when val is not null then r.adc_raw end,
    'current_sampled_at', case when val is not null then r.sampled_at end,
    'delta_adc', case when val is not null then r.adc_raw - a.adc_raw end,
    'distance_mm', val -> 'distance_mm', 'percent', val -> 'percent', 'advance_mm', val -> 'advance_mm',
    'out_of_range', coalesce(status = 'out_of_range', false),
    'near_limit', coalesce((r.adc_raw <= 205 or r.adc_raw >= 3890) and e.kind <> 'maintenance', false));
end $$;

-- ---------------------------------------------------------------------------
-- 5. Confirmação da referência pelo técnico: leitura de agora e declaração para posição mais baixa
-- ---------------------------------------------------------------------------
-- A versão de quatro parâmetros é substituída pela de cinco (o quinto é opcional): as chamadas
-- existentes, por nome, continuam válidas.
drop function public.gaxeta_confirm_gland_anchor(text, text, text, text);
create function public.gaxeta_confirm_gland_anchor(
  p_sensor_id text, p_link_id text, p_event_id text, p_reading_id text, p_ack_lower boolean default false
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  e gaxeta_private.gland_events%rowtype;
  r public.gaxeta_readings%rowtype;
  a gaxeta_private.gland_anchors%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  w jsonb; v_quality text; v_quantity text; v_age numeric; v_max_age numeric; v_peak jsonb;
begin
  select * into d from public.gaxeta_devices
    where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null
     or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if not found or l.id::text is distinct from p_link_id then
    raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.';
  end if;
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  if e.id is null or e.id::text is distinct from p_event_id or e.kind = 'maintenance' or e.rule_version < 2 then
    raise sqlstate 'PT409' using message = 'O ciclo mudou. Revise o estado atual e tente novamente.';
  end if;
  select * into a from gaxeta_private.gland_anchors where event_id = e.id;
  if found then
    if a.reading_id::text = p_reading_id then
      return jsonb_build_object('event_id', e.id::text, 'reading_id', a.reading_id::text, 'duplicate', true);
    end if;
    raise sqlstate 'PT409' using message = 'A referência deste ciclo já foi aprovada e não é substituída. Para outra referência, registre um novo engaxetamento.';
  end if;
  select * into r from public.gaxeta_readings
    where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  if r.id is null or r.id::text is distinct from p_reading_id then
    raise sqlstate 'PT409' using message = 'Chegou uma leitura mais nova. Confira o valor e confirme de novo.';
  end if;
  p := gaxeta_private.gland_profile_at(l.id, pg_catalog.clock_timestamp());
  v_quality := gaxeta_private.gland_quality(r.adc_raw, r.adc_noise, r.adc_min, r.adc_max, p.noise_max);
  if r.sampled_at is null or r.sampled_at < e.recorded_at then
    raise invalid_parameter_value using message = 'A leitura é anterior ao registro. Mantenha o sensor na marca superior e aguarde a próxima leitura.';
  elsif r.sampled_at > r.received_at or r.received_at - r.sampled_at > interval '30 seconds' then
    raise invalid_parameter_value using message = 'A leitura chegou com atraso e não serve de referência. Aguarde a próxima.';
  elsif v_quality = 'saturated_high' then
    raise invalid_parameter_value using message = 'A leitura está no limite superior do ADC (saturada). Nesta placa a marca superior fica fora da faixa mensurável: a medida informada foi preservada, mas a calibração depende de ajuste no circuito.';
  elsif v_quality <> 'ok' then
    raise invalid_parameter_value using message = 'A leitura não está estável o bastante para servir de referência. Confira a fixação e aguarde a próxima.';
  end if;
  -- Idade ao confirmar (diferente do tempo de transporte): a leitura tem de ser de agora,
  -- dentro de um intervalo de envio da placa, para corresponder à marca física presente.
  v_age := extract(epoch from pg_catalog.clock_timestamp() - r.received_at);
  v_max_age := gaxeta_private.gland_confirm_max_age(gaxeta_private.gland_cadence(d.sensor_id));
  if v_age > v_max_age then
    raise sqlstate 'PT409' using message = 'A leitura mostrada já tem ' || round(v_age) || ' s (limite de ' || v_max_age || ' s para confirmar). Mantenha o sensor na marca superior, aguarde a próxima leitura e confirme de novo. As medidas cadastradas continuam salvas.';
  end if;
  -- Desde o registro o sensor já mostrou uma posição mais alta: a leitura pode ser intermediária.
  v_peak := gaxeta_private.gland_peak(d.sensor_id, e.recorded_at, r.id);
  if (v_peak ->> 'adc')::numeric - r.adc_raw > 75 and not coalesce(p_ack_lower, false) then
    raise invalid_parameter_value using message = 'Depois do registro o sensor já mostrou uma posição mais alta ('
      || case when v_peak ->> 'block' = 'ceiling' then 'limite do ADC' else round((v_peak ->> 'adc')::numeric * 100 / 4095, 1) || ' % da escala elétrica' end
      || ') do que a desta leitura (' || round(r.adc_raw * 100 / 4095, 1) || ' %). Ela só serve de referência se esta for mesmo a marca superior da montagem: confira a marca física e confirme a declaração no painel.';
  end if;
  v_quantity := case when r.voltage_mv is not null then 'mv' else 'adc' end;
  w := gaxeta_private.gland_window(l.id, pg_catalog.clock_timestamp());
  insert into gaxeta_private.gland_anchors (event_id, reading_id, approved_by, mode, quantity, acq_method, value,
      adc_raw, voltage_mv, adc_noise, sampled_at, received_at, window_lo, window_hi)
  values (e.id, r.id, auth.uid(), 'confirmed', v_quantity, case when v_quantity = 'mv' then r.acq_method end,
      case when v_quantity = 'mv' then r.voltage_mv::numeric else r.adc_raw end,
      r.adc_raw, r.voltage_mv, r.adc_noise, r.sampled_at, r.received_at, (w ->> 'lo')::numeric, (w ->> 'hi')::numeric);
  perform gaxeta_private.audit('gland.anchor', 'sensor', d.sensor_id,
    (select x.corporation_id from public.gaxeta_assets x where x.id = l.point_id),
    jsonb_build_object('event_id', e.id, 'link_id', l.id, 'reading_id', r.id, 'quantity', v_quantity,
      'value', case when v_quantity = 'mv' then r.voltage_mv::numeric else r.adc_raw end,
      'adc_raw', r.adc_raw, 'expected', w, 'age_s', round(v_age, 1),
      'transport_s', round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1),
      'ack_lower', coalesce(p_ack_lower, false), 'higher_since_record', case when (v_peak ->> 'adc')::numeric - r.adc_raw > 75 then v_peak end));
  return jsonb_build_object('event_id', e.id::text, 'reading_id', r.id::text, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- 6. Consulta do ciclo (mesma assinatura): chave de idempotência do próprio autor, origem do
--    perfil e rascunho do comissionamento
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_gland_status(p_sensor_id text, p_history_before text default null)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  win tstzmultirange;
  events jsonb; st jsonb; profile jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32';
  win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  if d.sensor_id is null or win = '{}'::tstzmultirange then raise insufficient_privilege; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', h.id::text, 'link_id', h.link_id::text, 'kind', h.kind, 'rule', h.rule_version,
    'initial_mm', h.initial_mm, 'end_mm', h.end_mm, 'recorded_at', h.recorded_at,
    'actor', (select nullif(p.display_name, '') from gaxeta_private.user_profiles p where p.user_id = h.actor_id),
    -- Chave de idempotência, só para quem fez o registro: a tela reconcilia um envio cuja resposta se perdeu.
    'request_id', case when h.actor_id = auth.uid() then h.request_id end,
    'anchor', case
      when h.kind = 'maintenance' then null
      when h.rule_version >= 2 and h.cycle_rule >= 2 then
        (select jsonb_build_object('id', x.reading_id::text, 'sampled_at', x.sampled_at, 'approved_at', x.approved_at,
            'mode', x.mode, 'quantity', x.quantity, 'value', x.value, 'adc', x.adc_raw, 'voltage_mv', x.voltage_mv, 'noise', x.adc_noise,
            'actor', (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = x.approved_by))
           from gaxeta_private.gland_anchors x where x.event_id = h.id)
      else gaxeta_private.gland_anchor(d.sensor_id, h.recorded_at, gaxeta_private.gland_stop(h.link_id, h.id)) end
    ) order by h.id desc), '[]'::jsonb) into events
  from (
    select g.*, coalesce((select c.rule_version from gaxeta_private.gland_events c
                           where c.link_id = g.link_id and c.kind <> 'check' and c.id <= g.id order by c.id desc limit 1), g.rule_version) as cycle_rule
      from gaxeta_private.device_links dl
      join gaxeta_private.gland_events g on g.link_id = dl.id
     where dl.sensor_id = d.sensor_id and g.recorded_at <@ win
       and (p_history_before is null or g.id < p_history_before::bigint)
     order by g.id desc limit 20
  ) h;

  st := gaxeta_private.gland_state(d, win);
  select to_jsonb(q) into profile from (
    select p.version, p.created_at, p.quantity, p.acq_method, p.high_value, p.high_tolerance, p.low_value,
           p.valid_lo, p.valid_hi, p.mm_per_unit, p.noise_max, p.note, p.origin,
           (select nullif(u.display_name, '') from gaxeta_private.user_profiles u where u.user_id = p.created_by) as actor
      from gaxeta_private.gland_profiles p
     where p.link_id = (st ->> 'link_id')::bigint order by p.version desc limit 1) q;
  return st || jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'events', events, 'profile', profile,
    'commission', gaxeta_private.gland_commission_draft((st ->> 'link_id')::bigint, (st ->> 'cycle_event_id')::bigint),
    'can_profile', coalesce((st ->> 'can_operate')::boolean, false) and coalesce(gaxeta_authz.my_role(), '') in ('adm1', 'adm2'));
end $$;

-- ---------------------------------------------------------------------------
-- 7. Resumo para listas (mesma assinatura; campos novos são aditivos)
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_gland_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype;
  win tstzmultirange; st jsonb; v_gap numeric; items jsonb := '[]'::jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    st := gaxeta_private.gland_state(d, win);
    select percentile_disc(0.5) within group (order by extract(epoch from g.gap)) into v_gap from (
      select q.received_at - pg_catalog.lag(q.received_at) over (order by q.received_at) as gap from (
        select r.received_at from public.gaxeta_readings r
         where r.sensor_id = d.sensor_id and r.received_at <@ win
         order by r.received_at desc limit 4) q) g where g.gap is not null;
    items := items || jsonb_build_object('sensor_id', d.sensor_id, 'state', st -> 'state',
      'percent', st -> 'percent', 'distance_mm', st -> 'distance_mm',
      'initial_mm', st -> 'initial_mm', 'end_mm', st -> 'end_mm', 'recorded_at', st -> 'recorded_at',
      'scale_source', st -> 'scale' -> 'source', 'out_of_range', st -> 'out_of_range',
      'near_limit', st -> 'near_limit',
      'interval_s', round(v_gap),
      'rule', st -> 'rule', 'calibrated', st -> 'calibrated', 'advance_mm', st -> 'advance_mm',
      'wait_reason', st -> 'wait_reason', 'reason', st -> 'reason', 'unit', st -> 'unit',
      'voltage_mv', st -> 'current' -> 'voltage_mv', 'voltage_source', st -> 'current' -> 'voltage_source',
      'quality', st -> 'current' -> 'quality', 'adc', st -> 'current' -> 'adc',
      'sampled_at', st -> 'current' -> 'sampled_at',
      'block', st -> 'current' -> 'block', 'electric_percent', st -> 'current' -> 'electric_percent',
      'cycle_event_id', st -> 'cycle_event_id', 'anchored', st -> 'anchor' is not null and st -> 'anchor' <> 'null'::jsonb);
  end loop;
  return jsonb_build_object('server_time', pg_catalog.clock_timestamp(), 'items', items);
end $$;

-- ---------------------------------------------------------------------------
-- 8. Gravar o comissionamento em dois pontos no perfil da instalação (níveis 1 e 2)
-- ---------------------------------------------------------------------------
create function public.gaxeta_commission_gland(p_sensor_id text, p_link_id text, p_request_id uuid)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype;
  l gaxeta_private.device_links%rowtype;
  p gaxeta_private.gland_profiles%rowtype;
  e gaxeta_private.gland_events%rowtype;
  dr jsonb; o jsonb; v_version integer; v_unit text;
begin
  select * into d from public.gaxeta_devices
    where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null
     or coalesce(gaxeta_authz.my_role(), '') not in ('adm1', 'adm2')
     or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'O perfil de calibração é registrado por administradores de nível 1 ou 2.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if not found or l.id::text is distinct from p_link_id then
    raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.';
  end if;
  if p_request_id is null then
    raise invalid_parameter_value using message = 'Operação inválida.';
  end if;
  select * into p from gaxeta_private.gland_profiles where link_id = l.id and request_id = p_request_id;
  if found then return jsonb_build_object('id', p.id::text, 'version', p.version, 'duplicate', true); end if;
  select * into e from gaxeta_private.gland_events
    where link_id = l.id and kind <> 'check' order by id desc limit 1;
  dr := gaxeta_private.gland_commission_draft(l.id, e.id);
  if dr is null then
    raise sqlstate 'PT409' using message = 'O comissionamento em dois pontos ainda não está completo: falta a referência aprovada na marca superior ou uma conferência válida neste ciclo.';
  end if;
  o := dr -> 'origin';
  v_unit := case when dr ->> 'quantity' = 'mv' then ' mV' else ' contagens' end;
  select coalesce(max(version), 0) + 1 into v_version from gaxeta_private.gland_profiles where link_id = l.id;
  insert into gaxeta_private.gland_profiles (link_id, version, created_by, request_id, quantity, acq_method,
      high_value, high_tolerance, valid_lo, valid_hi, mm_per_unit, note, origin)
  values (l.id, v_version, auth.uid(), p_request_id, dr ->> 'quantity', dr ->> 'acq_method',
      (dr ->> 'high_value')::numeric, (dr ->> 'high_tolerance')::numeric,
      (dr ->> 'valid_lo')::numeric, (dr ->> 'valid_hi')::numeric, (dr ->> 'mm_per_unit')::numeric,
      'Comissionamento em dois pontos (ciclo ' || (o ->> 'cycle_event_id') || ', conferência ' || (o ->> 'check_event_id') || '): '
        || (o ->> 'd100_mm')::numeric::text || ' mm em ' || (o ->> 'v100')::numeric::text || v_unit || '; '
        || (o ->> 'd2_mm')::numeric::text || ' mm em ' || (o ->> 'v2')::numeric::text || v_unit
        || case when (o ->> 'at_end')::boolean then ' (fim de ajuste)' else '' end || '.',
      o)
  returning * into p;
  perform gaxeta_private.audit('gland.commission', 'sensor', d.sensor_id,
    (select x.corporation_id from public.gaxeta_assets x where x.id = l.point_id),
    jsonb_build_object('profile_id', p.id, 'link_id', l.id, 'version', p.version) || (dr - 'origin') || o);
  return jsonb_build_object('id', p.id::text, 'version', p.version, 'duplicate', false);
end $$;

-- ---------------------------------------------------------------------------
-- 9. Privilégios
-- ---------------------------------------------------------------------------
revoke all on function
  gaxeta_private.gland_block(numeric, numeric, integer, integer),
  gaxeta_private.gland_cadence(text),
  gaxeta_private.gland_confirm_max_age(numeric),
  gaxeta_private.gland_peak(text, timestamptz, bigint),
  gaxeta_private.gland_commission_draft(bigint, bigint)
  from public, anon, authenticated, service_role;
revoke all on function
  public.gaxeta_confirm_gland_anchor(text, text, text, text, boolean),
  public.gaxeta_commission_gland(text, text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function
  public.gaxeta_confirm_gland_anchor(text, text, text, text, boolean),
  public.gaxeta_commission_gland(text, text, uuid)
  to authenticated;

notify pgrst, 'reload schema';
commit;
