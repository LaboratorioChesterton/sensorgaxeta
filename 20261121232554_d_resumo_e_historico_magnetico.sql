-- Migração 15, parte d de 4 (resumo e histórico). Ver o cabeçalho da parte a.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 8. Consultas: estado atual (com Modo bancada, faixa de ajuste e origem do curso) e histórico
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_mag_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype; r public.gaxeta_readings%rowtype;
  s gaxeta_private.mag_services%rowtype; p gaxeta_private.mag_services%rowtype; g gaxeta_private.mag_geometries%rowtype;
  b gaxeta_private.mag_bench_modes%rowtype; n gaxeta_private.mag_maintenance_notes%rowtype;
  win tstzmultirange; items jsonb := '[]'::jsonb; v_link bigint; v_setup jsonb; v_reason text; v_now timestamptz := pg_catalog.clock_timestamp();
  v_role text := gaxeta_authz.my_role(); v_bench jsonb; v_bstate text; v_eval jsonb; v_missing jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and last_modality = 'as5600_i2c' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    r := null; s := null; p := null; g := null; b := null; n := null; v_link := null; v_setup := null; v_bench := null; v_bstate := null; v_eval := null;
    select * into r from public.gaxeta_readings
      where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence and received_at <@ win;
    if d.measurement_point_id is not null then
      select l.id into v_link from gaxeta_private.device_links l
        where l.sensor_id = d.sensor_id and l.point_id = d.measurement_point_id and l.unlinked_at is null;
      v_setup := gaxeta_private.mag_setup(d.measurement_point_id);
      if v_setup->>'geometry_id' is not null then
        select * into g from gaxeta_private.mag_geometries where id = (v_setup->>'geometry_id')::bigint;
      end if;
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'active';
      select * into p from gaxeta_private.mag_services where link_id = v_link and status = 'pending';
      select * into b from gaxeta_private.mag_bench_modes where link_id = v_link and status = 'active';
      select * into n from gaxeta_private.mag_maintenance_notes where link_id = v_link order by noted_at desc limit 1;
    end if;
    -- Modo bancada: o estado vem da leitura atual quando ela pertence a esta configuração; antes
    -- da primeira leitura depois de ligar, vem da âncora.
    if b.id is not null then
      v_bstate := case when r.bench_id = b.id then r.bench_state
                       when b.anchor_status = 'lost' then 'reposition' else 'awaiting_start' end;
      if v_bstate = 'ok' then v_eval := gaxeta_private.mag_bench_eval(b.span_deg, r.bench_u_deg); end if;
      v_bench := jsonb_build_object('id', b.id::text, 'zero_deg', b.zero_deg, 'full_deg', b.full_deg, 'direction', b.direction, 'span_deg', b.span_deg,
        'started_at', b.started_at, 'mine', b.started_by = auth.uid(), 'state', v_bstate,
        'anchor_status', b.anchor_status, 'anchor_at', b.anchor_at, 'anchor_note', b.anchor_note,
        'pending', case when b.anchor_status = 'pending' then jsonb_build_object('requested_at', b.anchor_requested_at, 'expires_at', b.anchor_expires_at,
          'expired', v_now > b.anchor_expires_at, 'mine', b.anchor_requested_by = auth.uid()) end,
        'lost_reason', b.lost_reason, 'lost_at', b.lost_at,
        'percent', (v_eval->>'percent')::numeric, 'u_deg', (v_eval->>'u_deg')::numeric, 'over_deg', (v_eval->>'over_deg')::numeric, 'limit', v_eval->>'limit',
        -- Posição contínua no referencial do chip: pode passar de 360° ou ficar negativa.
        'continuous_deg', case when v_eval is not null then round(b.zero_deg + b.direction * (v_eval->>'u_deg')::numeric, 3) end,
        'turns', case when v_eval is not null then floor((b.zero_deg + b.direction * (v_eval->>'u_deg')::numeric) / 360)::integer end,
        'last_ok', case when b.last_ok_at is not null then jsonb_build_object('percent', b.last_ok_percent, 'u_deg', b.last_ok_u_deg, 'at', b.last_ok_at,
          'over_deg', (gaxeta_private.mag_bench_eval(b.span_deg, b.last_ok_u_deg)->>'over_deg')::numeric) end);
    end if;
    -- O que falta no cadastro para o cálculo de campo, e quem resolve.
    v_missing := '[]'::jsonb
      || case when v_link is not null and (v_setup is null or v_setup->>'suggested_course_mm' is null) then '["course"]'::jsonb else '[]'::jsonb end
      || case when v_link is not null and g.id is null then '["geometry"]'::jsonb else '[]'::jsonb end
      || case when g.id is not null and g.status <> 'validated' then '["validation"]'::jsonb else '[]'::jsonb end;
    -- Por que não há curso restante agora (código; a interface traduz em texto de ação).
    v_reason := case
      when r.id is null then 'no_reading'
      when gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status) is not null then gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status)
      when v_link is null then 'no_link'
      when b.id is not null then case v_bstate when 'ok' then 'bench' else 'bench_' || v_bstate end
      when g.id is null then 'no_geometry'
      when s.id is null and p.id is not null then 'awaiting_reference'
      when s.id is null then 'no_reference'
      when r.service_id is distinct from s.id or r.remaining_percent is null then 'not_computed'
      when r.range_state = 'out_of_range' then 'out_of_range' end;
    items := items || jsonb_build_object(
      'sensor_id', d.sensor_id, 'modality', 'as5600_i2c', 'linked', v_link is not null, 'link_id', v_link::text,
      'can_operate', d.measurement_point_id is not null and gaxeta_authz.can_operate_point(d.measurement_point_id),
      'interval_s', d.send_period_s, 'firmware_version', d.firmware_version,
      'reading', case when r.id is not null then jsonb_build_object(
        'id', r.id::text, 'boot_id', r.boot_id, 'sequence', r.sequence, 'sampled_at', r.sampled_at, 'received_at', r.received_at,
        'raw_angle', r.raw_angle, 'angle_deg', round(r.raw_angle * 360.0 / 4096, 3), 'angle_pp', r.angle_pp,
        'bus_status', r.bus_status, 'mag_status', r.mag_status, 'agc', r.agc, 'magnitude', r.magnitude, 'rssi', r.rssi,
        'transport_s', round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1),
        'ct', case when r.ct_session is not null or r.ct_loss is not null then jsonb_build_object('session', r.ct_session, 'count', r.ct_count,
          'origin', r.ct_origin, 'loss', r.ct_loss, 'step', r.ct_step, 'gap_ms', r.ct_gap_ms,
          'continuous_deg', round((r.ct_origin + r.ct_count) * 360.0 / 4096, 3)) end) end,
      'last_valid', case when d.last_valid_at is not null and d.last_valid_at <@ win then jsonb_build_object(
        'raw_angle', d.last_valid_raw_angle, 'angle_deg', round(d.last_valid_raw_angle * 360.0 / 4096, 3), 'at', d.last_valid_at) end,
      'setup', case when g.id is not null then jsonb_build_object('source', v_setup->>'source', 'geometry_id', g.id::text,
        'key', g.key, 'revision', g.revision, 'label', g.label, 'status', g.status, 'model_kind', g.model_kind,
        'min_course_mm', g.min_course_mm, 'max_course_mm', g.max_course_mm, 'tolerance_mm', g.tolerance_mm,
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class',
        'course_source', v_setup->>'course_source', 'geometry_source', v_setup->>'geometry_source')
        when v_setup is not null then jsonb_build_object('source', v_setup->>'source',
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class',
        'course_source', v_setup->>'course_source') end,
      'config', case when v_link is not null then jsonb_build_object('missing', v_missing,
        'can_course', gaxeta_authz.can_write_tree('point', d.measurement_point_id),
        'can_geometry', coalesce(v_role in ('adm1', 'adm2'), false),
        'point_id', d.measurement_point_id) end,
      'pending', case when p.id is not null then jsonb_build_object('id', p.id::text, 'requested_at', p.requested_at,
        'expires_at', p.expires_at, 'expired', v_now > p.expires_at, 'mine', p.actor_id = auth.uid(),
        'course_mm', p.course_mm, 'course_origin', p.course_origin) end,
      'service', case when s.id is not null then jsonb_build_object('id', s.id::text, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'capture_rule', s.capture_rule, 'course_mm', s.course_mm, 'course_origin', s.course_origin,
        'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'geometry_current', g.id is not distinct from s.geometry_id,
        'ref_raw_angle', s.ref_raw_angle, 'ref_angle_deg', round(s.ref_raw_angle * 360.0 / 4096, 3), 'ref_sampled_at', s.ref_sampled_at,
        'stable_remaining', s.stable_remaining, 'stable_since', s.stable_since,
        -- Valor estabilizado como a tela mostra (duas casas) e a faixa decidida sobre ele.
        'stable_shown', round(s.stable_remaining, 2), 'band', gaxeta_private.mag_band(s.stable_remaining)) end,
      'computed', case when s.id is not null and r.service_id = s.id and r.remaining_percent is not null then jsonb_build_object(
        'advance_mm', r.advance_mm, 'remaining_mm', r.remaining_mm, 'remaining_percent', r.remaining_percent,
        'range_state', r.range_state) end,
      'bench', v_bench,
      'maintenance', case when n.id is not null and n.noted_at <@ win then jsonb_build_object('id', n.id::text, 'noted_at', n.noted_at,
        'mine', n.actor_id = auth.uid(), 'reason', n.reason, 'note', n.note) end,
      'reason', v_reason);
  end loop;
  return jsonb_build_object('server_time', v_now, 'items', items);
end $$;
comment on function public.gaxeta_mag_summary(text[]) is
  'Estado atual dos sensores magnéticos que o usuário pode ler: ângulo absoluto e saúde (medidos), montagem do spot com a origem do curso e da geometria, o que falta no cadastro, solicitação pendente, referência vigente com a faixa de ajuste, curso restante (calculado), Modo bancada (posição de bancada, continuidade, última leitura boa) e o último registro de manutenção. reason explica, em código, por que não há curso restante.';

create or replace function public.gaxeta_mag_history(p_sensor_id text, p_from timestamptz, p_to timestamptz)
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '8s' as $$
declare result jsonb; bucket_seconds numeric; v_win tstzmultirange;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to - p_from < interval '1 second' or p_to - p_from > interval '366 days' then
    raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
  bucket_seconds := greatest(1, extract(epoch from (p_to - p_from)) / 600);
  v_win := gaxeta_authz.sensor_read_windows(p_sensor_id);
  with rows as (
    select * from public.gaxeta_readings
     where sensor_id = p_sensor_id and modality = 'as5600_i2c' and received_at >= p_from and received_at <= p_to and received_at <@ v_win
  ), buckets as (
    -- Um intervalo por referência e por configuração de bancada: a linha quebra na troca de
    -- engaxetamento e ao entrar ou sair do Modo bancada. O ângulo é média CIRCULAR (não se faz
    -- média aritmética através de 0°); curso restante e posição de bancada são médias físicas.
    select floor(extract(epoch from (received_at - p_from)) / bucket_seconds) b, service_id, bench_id,
      min(received_at) received_at, max(received_at) last_at, count(*) samples,
      count(*) filter (where bus_status = 'ok' and mag_status = 'ok') valid,
      count(*) filter (where bus_status <> 'ok') bus_fail,
      count(*) filter (where mag_status = 'no_magnet') no_magnet,
      count(*) filter (where mag_status in ('weak', 'strong')) field_out,
      avg(sin(radians(raw_angle * 360.0 / 4096))) filter (where bus_status = 'ok' and mag_status = 'ok') sy,
      avg(cos(radians(raw_angle * 360.0 / 4096))) filter (where bus_status = 'ok' and mag_status = 'ok') cx,
      avg(remaining_percent) filter (where range_state = 'ok') rem, min(remaining_percent) filter (where range_state = 'ok') rem_min,
      max(remaining_percent) filter (where range_state = 'ok') rem_max,
      avg(remaining_mm) filter (where range_state = 'ok') rem_mm, avg(advance_mm) filter (where range_state = 'ok') adv_mm,
      count(*) filter (where range_state = 'out_of_range') out_of_range,
      (max(array[extract(epoch from received_at), id::numeric, stable_remaining]))[3] stable_remaining,
      avg(bench_percent) bench, min(bench_percent) bench_min, max(bench_percent) bench_max,
      min(bench_u_deg) bench_u_min, max(bench_u_deg) bench_u_max,
      count(*) filter (where bench_state = 'ok') bench_ok,
      count(*) filter (where bench_state = 'reposition') bench_reposition,
      count(*) filter (where bench_state in ('awaiting_start', 'no_continuity')) bench_waiting,
      max(ct_step) ct_step, max(ct_gap_ms) ct_gap_ms
    from rows group by 1, 2, 3
  ), svc as (
    select s.* from gaxeta_private.mag_services s
     where s.sensor_id = p_sensor_id and s.status in ('active', 'superseded')
       and s.captured_at <= p_to and coalesce(s.ended_at, 'infinity') >= p_from and s.captured_at <@ v_win
  ), bench as (
    select m.* from gaxeta_private.mag_bench_modes m
     where m.sensor_id = p_sensor_id and m.started_at <= p_to and coalesce(m.ended_at, 'infinity') >= p_from and m.started_at <@ v_win
  ), events as (
    select m.* from gaxeta_private.mag_movements m
     where m.sensor_id = p_sensor_id and m.received_at >= p_from and m.received_at <= p_to and m.received_at <@ v_win
     order by m.received_at, m.reading_id limit 5001
  )
  select jsonb_build_object(
    'history', coalesce((select jsonb_agg(jsonb_build_object('received_at', b.received_at, 'last_at', b.last_at,
        'service_id', b.service_id::text, 'samples', b.samples, 'valid', b.valid, 'bus_fail', b.bus_fail,
        'no_magnet', b.no_magnet, 'field_out', b.field_out, 'out_of_range', b.out_of_range,
        'angle_deg', case when b.valid > 0 and (b.sy <> 0 or b.cx <> 0)
           then round((degrees(atan2(b.sy, b.cx))::numeric + 360) % 360, 3) end,
        'remaining_percent', round(b.rem, 4), 'min_remaining', b.rem_min, 'max_remaining', b.rem_max,
        'remaining_mm', round(b.rem_mm, 4), 'advance_mm', round(b.adv_mm, 4), 'stable_remaining', b.stable_remaining,
        'bench_id', b.bench_id::text, 'bench_percent', round(b.bench, 4), 'min_bench', b.bench_min, 'max_bench', b.bench_max,
        'min_bench_u_deg', b.bench_u_min, 'max_bench_u_deg', b.bench_u_max,
        'bench_ok', b.bench_ok, 'bench_reposition', b.bench_reposition, 'bench_waiting', b.bench_waiting,
        'ct_step', b.ct_step, 'ct_gap_ms', b.ct_gap_ms)
        order by b.received_at) from buckets b), '[]'::jsonb),
    'services', coalesce((select jsonb_agg(jsonb_build_object('id', s.id::text, 'status', s.status, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'ended_at', s.ended_at, 'end_reason', s.end_reason, 'course_mm', s.course_mm,
        'course_origin', s.course_origin, 'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'model_kind', s.geometry->>'model_kind', 'direction', (s.geometry->>'direction')::integer,
        'ref_raw_angle', s.ref_raw_angle, 'ref_reading_id', s.ref_reading_id::text) order by s.captured_at) from svc s), '[]'::jsonb),
    'benches', coalesce((select jsonb_agg(jsonb_build_object('id', m.id::text, 'started_at', m.started_at, 'ended_at', m.ended_at,
        'end_reason', m.end_reason, 'zero_deg', m.zero_deg, 'full_deg', m.full_deg, 'direction', m.direction, 'span_deg', m.span_deg,
        'anchor_at', m.anchor_at) order by m.started_at) from bench m), '[]'::jsonb),
    'movements', coalesce((select jsonb_agg(jsonb_build_object('reading_id', e.reading_id::text, 'service_id', e.service_id::text,
        'received_at', e.received_at, 'previous_remaining', e.previous_remaining, 'stable_remaining', e.stable_remaining,
        'rule_version', e.rule_version) order by e.received_at, e.reading_id) from events e), '[]'::jsonb),
    'movements_truncated', (select count(*) > 5000 from events),
    'stats', (select jsonb_build_object('count', coalesce(sum(samples), 0), 'valid', coalesce(sum(valid), 0),
        'last_received_at', max(last_at)) from buckets),
    'from', p_from, 'to', p_to, 'bucket_seconds', bucket_seconds, 'modality', 'as5600_i2c', 'rule_version', 1) into result;
  return result;
end $$;
comment on function public.gaxeta_mag_history(text, timestamptz, timestamptz) is
  'Histórico magnético agregado (até 600 intervalos), separado por referência e por configuração de bancada: ângulo absoluto em média circular, curso restante e avanço em média física, Posição de bancada (%) com mínimo e máximo, contagem de amostras inválidas por motivo, referências e períodos de bancada do intervalo e mudanças estabilizadas de 5 p.p. (só de campo). Limitado ao período que o usuário pode ler.';

notify pgrst, 'reload schema';
commit;
