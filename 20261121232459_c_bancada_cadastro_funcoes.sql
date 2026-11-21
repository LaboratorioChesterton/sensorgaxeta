-- Migração 15, parte c de 4 (cadastro, Modo bancada e manutenção). Ver o cabeçalho da parte a.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 5. Cadastro: curso típico e revisão da montagem por spot; leitura para os formulários
-- ---------------------------------------------------------------------------
-- Curso disponível típico específico do spot (exceção ao TAG). Nulo = herdar o do TAG.
-- Quem edita o spot na árvore pode gravar; não mexe na geometria nem nos ciclos já registrados.
create function public.gaxeta_mag_set_point_course(p_point_id uuid, p_course_mm numeric)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.gaxeta_assets%rowtype; c gaxeta_private.mag_point_setups%rowtype; v_now timestamptz := clock_timestamp();
begin
  select * into a from public.gaxeta_assets where id = p_point_id and kind = 'point';
  if not found or not gaxeta_authz.can_write_tree('point', p_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para editar este spot.';
  end if;
  if p_course_mm is not null and (p_course_mm = 'NaN'::numeric or not (p_course_mm > 0 and p_course_mm <= 1000) or p_course_mm <> round(p_course_mm, 2)) then
    raise invalid_parameter_value using message = 'Informe o curso disponível típico em mm: positivo, até 1000, com até duas casas decimais.';
  end if;
  select * into c from gaxeta_private.mag_point_setups where point_id = p_point_id and valid_to is null for update;
  if c.suggested_course_mm is not distinct from p_course_mm then return gaxeta_private.mag_setup(p_point_id); end if;
  update gaxeta_private.mag_point_setups set valid_to = v_now where point_id = p_point_id and valid_to is null;
  if c.geometry_id is not null or p_course_mm is not null then
    insert into gaxeta_private.mag_point_setups (point_id, geometry_id, datum_raw, suggested_course_mm, note, set_by, valid_from)
      values (p_point_id, c.geometry_id, c.datum_raw, p_course_mm, c.note, auth.uid(), v_now);
  end if;
  perform gaxeta_private.audit('mag.setup.point_course', 'asset', p_point_id::text, a.corporation_id,
    jsonb_build_object('suggested_course_mm', p_course_mm, 'previous', c.suggested_course_mm));
  return gaxeta_private.mag_setup(p_point_id);
end $$;

-- Revisão da montagem vinculada ao spot (engenharia). Nula = usar a sugerida no TAG. Mantém o
-- curso típico do spot. Trocar o mecanismo encerra a referência vigente: o próximo
-- engaxetamento recomeça a linha.
create function public.gaxeta_mag_set_point_geometry(p_point_id uuid, p_geometry_id bigint, p_datum_raw integer default null, p_note text default null)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare a public.gaxeta_assets%rowtype; g gaxeta_private.mag_geometries%rowtype; c gaxeta_private.mag_point_setups%rowtype;
  v_now timestamptz := clock_timestamp(); l bigint;
begin
  select * into a from public.gaxeta_assets where id = p_point_id and kind = 'point';
  if not found or gaxeta_authz.my_role() is null or gaxeta_authz.my_role() not in ('adm1', 'adm2') then
    raise insufficient_privilege using message = 'Só a engenharia (ADM 1 ou 2) define a montagem do spot.';
  end if;
  if p_geometry_id is not null then
    select * into g from gaxeta_private.mag_geometries where id = p_geometry_id;
    if not found or g.status = 'retired' then raise invalid_parameter_value using message = 'Geometria inexistente ou retirada.'; end if;
    if g.model_kind = 'table' and coalesce(p_datum_raw, g.datum_raw::integer) is null then
      raise invalid_parameter_value using message = 'Curva exige o ângulo do datum mecânico (da geometria ou desta instalação).';
    end if;
  end if;
  if p_datum_raw is not null and not (p_datum_raw between 0 and 4095) then
    raise invalid_parameter_value using message = 'Datum mecânico: ângulo bruto de 0 a 4095.';
  end if;
  select * into c from gaxeta_private.mag_point_setups where point_id = p_point_id and valid_to is null for update;
  update gaxeta_private.mag_point_setups set valid_to = v_now where point_id = p_point_id and valid_to is null;
  if p_geometry_id is not null or c.suggested_course_mm is not null then
    insert into gaxeta_private.mag_point_setups (point_id, geometry_id, datum_raw, suggested_course_mm, note, set_by, valid_from)
      values (p_point_id, p_geometry_id, case when p_geometry_id is not null then p_datum_raw end, c.suggested_course_mm, left(p_note, 500), auth.uid(), v_now);
  end if;
  for l in select id from gaxeta_private.device_links where point_id = p_point_id and unlinked_at is null loop
    perform gaxeta_private.mag_close_services(l, 'setup_changed', v_now);
  end loop;
  perform gaxeta_private.audit('mag.setup.point_geometry', 'asset', p_point_id::text, a.corporation_id,
    jsonb_build_object('geometry_id', p_geometry_id, 'previous', c.geometry_id, 'datum_raw', p_datum_raw));
  return gaxeta_private.mag_setup(p_point_id);
end $$;

-- O que o formulário do TAG e o do spot mostram: valor próprio, valor herdado, valor efetivo
-- com a origem, e o que a conta pode editar.
create function public.gaxeta_mag_asset_setup(p_asset_id uuid)
 returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare a public.gaxeta_assets%rowtype; e gaxeta_private.mag_equipment_defaults%rowtype; c gaxeta_private.mag_point_setups%rowtype;
  v_role text := gaxeta_authz.my_role(); v_eff jsonb; v_tag public.gaxeta_assets%rowtype;
  v_geom jsonb;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into a from public.gaxeta_assets where id = p_asset_id and kind in ('equipment', 'point');
  if not found or gaxeta_authz.asset_access(p_asset_id) is null then
    raise insufficient_privilege using message = 'Ativo não encontrado ou fora do seu escopo.';
  end if;
  if a.kind = 'equipment' then
    select * into e from gaxeta_private.mag_equipment_defaults where asset_id = p_asset_id;
    return jsonb_build_object('kind', 'equipment', 'asset_id', p_asset_id,
      'suggested_course_mm', e.suggested_course_mm, 'size_class', e.size_class, 'updated_at', e.updated_at,
      'geometry', (select gaxeta_private.mag_geometry_snapshot(g) from gaxeta_private.mag_geometries g where g.id = e.geometry_id),
      'can_edit_course', gaxeta_authz.can_write_tree('equipment', p_asset_id),
      'can_edit_geometry', coalesce(v_role in ('adm1', 'adm2'), false));
  end if;
  select * into c from gaxeta_private.mag_point_setups where point_id = p_asset_id and valid_to is null;
  select * into v_tag from public.gaxeta_assets where id = a.parent_id;
  select d.* into e from gaxeta_private.mag_equipment_defaults d
    where d.asset_id = any (a.path) order by array_position(a.path, d.asset_id) desc limit 1;
  v_eff := gaxeta_private.mag_setup(p_asset_id);
  select gaxeta_private.mag_geometry_snapshot(g) || jsonb_build_object('min_course_mm', g.min_course_mm, 'max_course_mm', g.max_course_mm)
    into v_geom from gaxeta_private.mag_geometries g where g.id = (v_eff->>'geometry_id')::bigint;
  return jsonb_build_object('kind', 'point', 'asset_id', p_asset_id,
    'own', jsonb_build_object('suggested_course_mm', c.suggested_course_mm, 'geometry_id', c.geometry_id::text, 'datum_raw', c.datum_raw, 'note', c.note, 'valid_from', c.valid_from),
    'tag', jsonb_build_object('asset_id', v_tag.id, 'tag', coalesce(v_tag.tag, v_tag.name), 'suggested_course_mm', e.suggested_course_mm,
      'size_class', e.size_class, 'geometry_id', e.geometry_id::text),
    'effective', jsonb_build_object('suggested_course_mm', (v_eff->>'suggested_course_mm')::numeric, 'course_source', v_eff->>'course_source',
      'geometry', v_geom, 'geometry_source', v_eff->>'geometry_source'),
    'active_reference', exists (select 1 from gaxeta_private.mag_services s join gaxeta_private.device_links l on l.id = s.link_id
       where l.point_id = p_asset_id and l.unlinked_at is null and s.status = 'active'),
    'can_edit_course', gaxeta_authz.can_write_tree('point', p_asset_id),
    'can_edit_geometry', coalesce(v_role in ('adm1', 'adm2'), false));
end $$;

-- ---------------------------------------------------------------------------
-- 6. Modo bancada: prévia, ativação, confirmação do início e saída
-- ---------------------------------------------------------------------------
-- Valida a faixa e devolve a prévia: quanto a leitura atual valeria e alguns pontos de exemplo.
-- Não grava nada.
create function gaxeta_private.mag_bench_check(p_zero numeric, p_full numeric, p_direction integer)
 returns numeric language plpgsql immutable set search_path = '' as $$
declare v_span numeric;
begin
  if p_zero is null or p_full is null or p_zero = 'NaN'::numeric or p_full = 'NaN'::numeric
     or not (p_zero >= 0 and p_zero < 360 and p_full >= 0 and p_full < 360)
     or p_zero <> round(p_zero, 3) or p_full <> round(p_full, 3) then
    raise invalid_parameter_value using message = 'Informe os dois ângulos em graus, de 0 a 359,999, com até três casas decimais.';
  end if;
  if p_direction is null or p_direction not in (-1, 1) then
    raise invalid_parameter_value using message = 'Informe o sentido: crescente ou decrescente.';
  end if;
  v_span := gaxeta_private.mag_bench_u(p_zero, p_direction, p_full);
  if v_span < 5 or v_span > 355 then
    raise invalid_parameter_value using message = 'A faixa entre 0 % e 100 % precisa ter de 5° a 355° no sentido escolhido (esta tem '
      || trim(to_char(v_span, 'FM990.0##')) || '°).';
  end if;
  return round(v_span, 3);
end $$;

create function public.gaxeta_mag_bench_preview(p_sensor_id text, p_zero_deg numeric, p_full_deg numeric, p_direction integer)
 returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; r public.gaxeta_readings%rowtype; v_span numeric; v_u numeric; v_deg numeric;
  v_marks jsonb := '[]'::jsonb; f numeric; v_at numeric;
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32';
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  v_span := gaxeta_private.mag_bench_check(p_zero_deg, p_full_deg, p_direction);
  foreach f in array array[0, 0.25, 0.5, 0.75, 1] loop
    v_at := ((p_zero_deg + p_direction * v_span * f) % 360 + 360) % 360;
    v_marks := v_marks || jsonb_build_object('angle_deg', round(v_at, 3), 'percent', round(100 * f, 2));
  end loop;
  select * into r from public.gaxeta_readings where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  if r.raw_angle is not null and r.bus_status = 'ok' and r.mag_status = 'ok' then
    v_deg := r.raw_angle * 360.0 / 4096;
    v_u := gaxeta_private.mag_bench_u(p_zero_deg, p_direction, v_deg);
  end if;
  return jsonb_build_object('zero_deg', p_zero_deg, 'full_deg', p_full_deg, 'direction', p_direction, 'span_deg', v_span, 'marks', v_marks,
    'current', case when v_deg is not null then jsonb_build_object('angle_deg', round(v_deg, 3), 'raw_angle', r.raw_angle, 'sampled_at', r.sampled_at,
      'inside', v_u <= v_span, 'percent', case when v_u <= v_span then round(100 * v_u / v_span, 2) end) end,
    'continuity', r.ct_session is not null, 'firmware_version', d.firmware_version,
    'ends_reference', exists (select 1 from gaxeta_private.mag_services s join gaxeta_private.device_links l on l.id = s.link_id
       where l.sensor_id = d.sensor_id and l.unlinked_at is null and s.status in ('active', 'pending')));
end $$;

-- Liga o Modo bancada (ou troca os extremos: a configuração anterior é encerrada e a nova começa).
-- A referência de campo do vínculo é encerrada: a bancada não continua nem altera a série de campo.
create function public.gaxeta_mag_bench_start(p_sensor_id text, p_request_id uuid, p_zero_deg numeric, p_full_deg numeric, p_direction integer)
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

-- "Confirmar início" (e "Reposicionar para retomar"): com o eixo parado DENTRO da faixa, a
-- primeira leitura nova, válida, estável e com contagem contínua passa a ser a referência da
-- posição. Fora da faixa a solicitação continua aguardando e o motivo aparece.
create function public.gaxeta_mag_bench_confirm(p_sensor_id text, p_request_id uuid)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; b gaxeta_private.mag_bench_modes%rowtype; v_now timestamptz := clock_timestamp(); v_wait integer;
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  if p_request_id is null then raise invalid_parameter_value using message = 'Operação inválida.'; end if;
  select b0.* into b from gaxeta_private.mag_bench_modes b0 join gaxeta_private.device_links l on l.id = b0.link_id
    where l.sensor_id = d.sensor_id and l.point_id = d.measurement_point_id and l.unlinked_at is null and b0.status = 'active' for update of b0;
  if not found then raise sqlstate 'PT409' using message = 'O Modo bancada não está ativo neste sensor.'; end if;
  if b.anchor_request_id = p_request_id then
    return jsonb_build_object('id', b.id::text, 'anchor_status', b.anchor_status, 'duplicate', true, 'expires_at', b.anchor_expires_at);
  end if;
  if b.anchor_status = 'pending' and v_now <= b.anchor_expires_at then
    raise sqlstate 'PT409' using message = 'Já existe uma confirmação aguardando leitura neste sensor.';
  end if;
  v_wait := least(3600, greatest(120, 4 * coalesce(d.send_period_s, 30) + 30));
  update gaxeta_private.mag_bench_modes set anchor_status = 'pending', anchor_request_id = p_request_id, anchor_requested_at = v_now,
      anchor_requested_by = auth.uid(), anchor_expires_at = v_now + make_interval(secs => v_wait),
      anchor_capture = substr(replace(gen_random_uuid()::text, '-', ''), 1, 8), anchor_note = null
    where id = b.id returning * into b;
  perform gaxeta_private.audit('mag.bench.confirm', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = b.point_id), jsonb_build_object('bench_id', b.id));
  return jsonb_build_object('id', b.id::text, 'anchor_status', b.anchor_status, 'duplicate', false, 'expires_at', b.anchor_expires_at,
    'wait_s', coalesce(d.send_period_s, 30));
end $$;

create function public.gaxeta_mag_bench_stop(p_sensor_id text)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; b gaxeta_private.mag_bench_modes%rowtype; v_now timestamptz := clock_timestamp();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select b0.* into b from gaxeta_private.mag_bench_modes b0 join gaxeta_private.device_links l on l.id = b0.link_id
    where l.sensor_id = d.sensor_id and l.unlinked_at is null and b0.status = 'active' for update of b0;
  if not found then return jsonb_build_object('changed', false); end if;
  update gaxeta_private.mag_bench_modes set status = 'ended', ended_at = v_now, ended_by = auth.uid(), end_reason = 'user_stopped' where id = b.id;
  perform gaxeta_private.audit('mag.bench.stop', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = b.point_id), jsonb_build_object('bench_id', b.id));
  return jsonb_build_object('id', b.id::text, 'changed', true);
end $$;

-- ---------------------------------------------------------------------------
-- 7. Registro de manutenção sem referência (spot sem geometria validada)
-- ---------------------------------------------------------------------------
create function public.gaxeta_mag_record_maintenance(p_sensor_id text, p_request_id uuid, p_note text default null)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; l gaxeta_private.device_links%rowtype; n gaxeta_private.mag_maintenance_notes%rowtype;
  r public.gaxeta_readings%rowtype; g gaxeta_private.mag_geometries%rowtype; v_setup jsonb; v_reason text;
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null for update;
  if not found then raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.'; end if;
  if p_request_id is null then raise invalid_parameter_value using message = 'Operação inválida.'; end if;
  if p_note is not null and length(p_note) > 300 then raise invalid_parameter_value using message = 'Observação: até 300 caracteres.'; end if;
  select * into n from gaxeta_private.mag_maintenance_notes where link_id = l.id and request_id = p_request_id;
  if found then return jsonb_build_object('id', n.id::text, 'noted_at', n.noted_at, 'duplicate', true); end if;
  v_setup := gaxeta_private.mag_setup(l.point_id);
  if v_setup->>'geometry_id' is not null then
    select * into g from gaxeta_private.mag_geometries where id = (v_setup->>'geometry_id')::bigint;
  end if;
  v_reason := case when g.id is null then 'no_geometry' when g.status = 'draft' then 'geometry_draft' when g.status = 'retired' then 'geometry_retired' end;
  -- Com geometria validada o caminho é o engaxetamento com referência, não este registro.
  if v_reason is null then
    raise sqlstate 'PT409' using message = 'Este spot tem montagem validada: use Engaxetamento realizado, que captura a referência.';
  end if;
  select * into r from public.gaxeta_readings where sensor_id = d.sensor_id and boot_id = d.last_boot_id and sequence = d.last_sequence;
  insert into gaxeta_private.mag_maintenance_notes (link_id, point_id, sensor_id, request_id, actor_id, reason, reading_id, raw_angle, note)
    values (l.id, l.point_id, d.sensor_id, p_request_id, auth.uid(), v_reason, r.id,
      case when r.bus_status = 'ok' and r.mag_status = 'ok' then r.raw_angle end, nullif(btrim(p_note), ''))
    returning * into n;
  perform gaxeta_private.audit('mag.maintenance.note', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id),
    jsonb_build_object('note_id', n.id, 'link_id', l.id, 'reason', v_reason));
  return jsonb_build_object('id', n.id::text, 'noted_at', n.noted_at, 'duplicate', false, 'reason', v_reason);
end $$;

-- ---------------------------------------------------------------------------
-- 9. Permissões: privilégio mínimo
-- ---------------------------------------------------------------------------
revoke all on function gaxeta_private.mag_bench_check(numeric, numeric, integer) from public, anon, authenticated, service_role;
revoke all on function
  public.gaxeta_mag_set_point_course(uuid, numeric), public.gaxeta_mag_set_point_geometry(uuid, bigint, integer, text),
  public.gaxeta_mag_asset_setup(uuid),
  public.gaxeta_mag_bench_preview(text, numeric, numeric, integer), public.gaxeta_mag_bench_start(text, uuid, numeric, numeric, integer),
  public.gaxeta_mag_bench_confirm(text, uuid), public.gaxeta_mag_bench_stop(text),
  public.gaxeta_mag_record_maintenance(text, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function
  public.gaxeta_mag_set_point_course(uuid, numeric), public.gaxeta_mag_set_point_geometry(uuid, bigint, integer, text),
  public.gaxeta_mag_asset_setup(uuid),
  public.gaxeta_mag_bench_preview(text, numeric, numeric, integer), public.gaxeta_mag_bench_start(text, uuid, numeric, numeric, integer),
  public.gaxeta_mag_bench_confirm(text, uuid), public.gaxeta_mag_bench_stop(text),
  public.gaxeta_mag_record_maintenance(text, uuid, text)
  to authenticated;

notify pgrst, 'reload schema';
commit;
