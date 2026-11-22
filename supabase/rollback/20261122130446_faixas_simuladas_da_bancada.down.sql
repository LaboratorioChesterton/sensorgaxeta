-- Reversão da migração 16 (faixas simuladas da bancada). Devolve gaxeta_mag_bench_start e
-- gaxeta_mag_summary à forma da migração 15 e remove a função e a tabela novas. As preferências
-- gravadas são descartadas (o site antigo não as usa). Leituras, bancadas e âncoras ficam.
begin;
set local lock_timeout = '3s';

drop function public.gaxeta_mag_bench_set_bands(text, boolean);

create or replace function public.gaxeta_mag_bench_start(p_sensor_id text, p_request_id uuid, p_zero_deg numeric, p_full_deg numeric, p_direction integer)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; l gaxeta_private.device_links%rowtype; b gaxeta_private.mag_bench_modes%rowtype;
  v_span numeric; v_now timestamptz := clock_timestamp();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null for update;
  if not found then raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.'; end if;
  if p_request_id is null then raise invalid_parameter_value using message = 'Operação inválida.'; end if;
  v_span := gaxeta_private.mag_bench_check(p_zero_deg, p_full_deg, p_direction);
  select * into b from gaxeta_private.mag_bench_modes where link_id = l.id and request_id = p_request_id;
  if found then
    if b.zero_deg <> p_zero_deg or b.full_deg <> p_full_deg or b.direction <> p_direction then
      raise sqlstate 'PT409' using message = 'A solicitação já foi usada para outra configuração.';
    end if;
    return jsonb_build_object('id', b.id::text, 'status', b.status, 'duplicate', true);
  end if;
  if d.last_modality is distinct from 'as5600_i2c' then
    raise sqlstate 'PT409' using message = 'Este sensor não está enviando leitura magnética.';
  end if;
  update gaxeta_private.mag_bench_modes set status = 'ended', ended_at = v_now, ended_by = auth.uid(), end_reason = 'reconfigured'
    where link_id = l.id and status = 'active';
  perform gaxeta_private.mag_close_services(l.id, 'bench_mode', v_now);
  insert into gaxeta_private.mag_bench_modes (link_id, point_id, sensor_id, request_id, started_by, started_at, zero_deg, full_deg, direction, span_deg)
    values (l.id, l.point_id, d.sensor_id, p_request_id, auth.uid(), v_now, p_zero_deg, p_full_deg, p_direction, v_span)
    returning * into b;
  perform gaxeta_private.audit('mag.bench.start', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id),
    jsonb_build_object('bench_id', b.id, 'link_id', l.id, 'zero_deg', p_zero_deg, 'full_deg', p_full_deg, 'direction', p_direction, 'span_deg', v_span));
  return jsonb_build_object('id', b.id::text, 'status', b.status, 'duplicate', false, 'span_deg', v_span);
end $$;

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

drop table gaxeta_private.mag_bench_prefs;

notify pgrst, 'reload schema';
commit;
