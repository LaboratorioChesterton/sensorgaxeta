-- Reversão da migração 15 INTEIRA (as quatro partes: a, b, c e d). Devolve as funções à forma da migração 14 e remove os
-- objetos novos. As leituras ficam; a contagem contínua e o resultado de bancada gravados nelas
-- são descartados com as colunas. Recusa rodar se houver spot com curso próprio e sem geometria
-- (a coluna geometry_id voltaria a ser obrigatória) — nesse caso, remova a exceção do spot antes.
begin;
set local lock_timeout = '3s';
lock table public.gaxeta_devices, public.gaxeta_readings in access exclusive mode nowait;
do $$ begin
  if exists (select 1 from gaxeta_private.mag_point_setups where geometry_id is null) then
    raise exception 'Há spot com curso típico próprio e sem geometria: grave "herdar do TAG" nesses spots antes de reverter.';
  end if;
end $$;

drop function public.gaxeta_mag_set_point_course(uuid, numeric);
drop function public.gaxeta_mag_set_point_geometry(uuid, bigint, integer, text);
drop function public.gaxeta_mag_asset_setup(uuid);
drop function public.gaxeta_mag_bench_preview(text, numeric, numeric, integer);
drop function public.gaxeta_mag_bench_start(text, uuid, numeric, numeric, integer);
drop function public.gaxeta_mag_bench_confirm(text, uuid);
drop function public.gaxeta_mag_bench_stop(text);
drop function public.gaxeta_mag_record_maintenance(text, uuid, text);

create or replace function gaxeta_private.mag_setup(p_point_id uuid)
 returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('source', q.source, 'geometry_id', q.geometry_id, 'datum_raw', q.datum_raw,
           'suggested_course_mm', q.course, 'size_class', q.size_class)
    from (
      select 'point' source, s.geometry_id, s.datum_raw,
             coalesce(s.suggested_course_mm, (select e.suggested_course_mm from gaxeta_private.mag_equipment_defaults e
               join public.gaxeta_assets a on a.id = p_point_id where e.asset_id = any (a.path)
               order by array_position(a.path, e.asset_id) desc limit 1)) course,
             (select e.size_class from gaxeta_private.mag_equipment_defaults e
               join public.gaxeta_assets a on a.id = p_point_id where e.asset_id = any (a.path)
               order by array_position(a.path, e.asset_id) desc limit 1) size_class, 1 o
        from gaxeta_private.mag_point_setups s where s.point_id = p_point_id and s.valid_to is null
      union all
      select 'equipment', e.geometry_id, null::smallint, e.suggested_course_mm, e.size_class, 2
        from gaxeta_private.mag_equipment_defaults e join public.gaxeta_assets a on a.id = p_point_id
       where e.asset_id = any (a.path)
       order by o limit 1) q
$$;

create or replace function gaxeta_private.mag_close_services(p_link_id bigint, p_reason text, p_at timestamptz)
 returns void language sql set search_path = '' as $$
  update gaxeta_private.mag_services
     set status = case status when 'pending' then 'cancelled' else 'superseded' end,
         ended_at = p_at, end_reason = p_reason
   where link_id = p_link_id and status in ('pending', 'active')
$$;

create or replace function public.gaxeta_ingest_v4(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare
  v_key gaxeta_private.ingest_keys%rowtype;
  d public.gaxeta_devices%rowtype;
  s gaxeta_private.mag_services%rowtype;
  v_id text; v_boot text; v_origin text; v_seq bigint;
  v_rssi integer; v_uptime bigint; v_sampled timestamptz; v_period integer;
  v_raw integer; v_pp integer; v_agc integer; v_mag integer;
  v_bus text; v_ms text; v_method text; v_capture text; v_name text; k text;
  v_row_id bigint; v_received timestamptz; v_now timestamptz := pg_catalog.clock_timestamp();
  v_current boolean := false; v_valid boolean; v_link bigint; v_calc jsonb;
  v_rem numeric; v_next numeric; v_rule text; v_reply_capture text;
begin
  if p_token is null or pg_catalog.length(p_token) < 32 or pg_catalog.length(p_token) > 256 then
    raise sqlstate 'PT401' using message='Credencial de envio inválida';
  end if;
  -- Mesma credencial da rota antiga. Bloqueio compartilhado: placas com a mesma credencial não
  -- ficam em fila uma atrás da outra; a ordem por sensor vem do bloqueio da linha do sensor.
  select * into v_key from gaxeta_private.ingest_keys
    where token_hash = pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')) and enabled for share;
  if not found then raise sqlstate 'PT401' using message='Credencial de envio inválida'; end if;
  if p_reading is null or pg_catalog.jsonb_typeof(p_reading) <> 'object'
      or pg_catalog.octet_length(p_reading::text) > 3000 then
    raise exception using errcode='22023',message='Mensagem inválida';
  end if;
  if pg_catalog.jsonb_typeof(p_reading->'schema_version') is distinct from 'number' or (p_reading->>'schema_version')::numeric <> 4
      or p_reading->>'modality' is distinct from 'as5600_i2c' then
    raise exception using errcode='22023',message='Esta rota aceita só schema_version 4 com modality as5600_i2c';
  end if;
  -- Nenhum campo elétrico entra pela rota magnética, nem como zero.
  foreach k in array array['travel_percent','voltage_v','position_mm','voltage_mv','adc_raw','adc_min','adc_max','adc_noise','percent_scale'] loop
    if p_reading ? k and pg_catalog.jsonb_typeof(p_reading->k) <> 'null' then
      raise exception using errcode='22023',message='Campo elétrico não pertence à modalidade magnética: ' || k;
    end if;
  end loop;
  v_id := p_reading->>'sensor_id'; v_boot := p_reading->>'boot_id';
  v_origin := coalesce(p_reading->>'origin','esp32');
  if v_id is null or v_id !~ '^[A-Z0-9-]{6,48}$' or v_boot is null or v_boot !~ '^[a-f0-9]{16,64}$'
      or v_origin not in ('esp32','integration_test') then
    raise exception using errcode='22023',message='Identidade da amostra inválida';
  end if;
  if pg_catalog.jsonb_typeof(p_reading->'sequence') is distinct from 'number'
     or (p_reading->>'sequence')::numeric <> pg_catalog.trunc((p_reading->>'sequence')::numeric) then
    raise exception using errcode='22023',message='Sequência deve ser inteira';
  end if;
  v_seq := (p_reading->>'sequence')::bigint;
  foreach k in array array['raw_angle','angle_pp','agc','magnitude','rssi','uptime_ms','send_period_s'] loop
    if p_reading ? k and pg_catalog.jsonb_typeof(p_reading->k) not in ('number','null') then
      raise exception using errcode='22023',message='Campo numérico inválido: ' || k;
    end if;
    if pg_catalog.jsonb_typeof(p_reading->k) = 'number' and (p_reading->>k)::numeric <> pg_catalog.trunc((p_reading->>k)::numeric) then
      raise exception using errcode='22023',message='Campo deve ser inteiro: ' || k;
    end if;
  end loop;
  v_raw := (p_reading->>'raw_angle')::integer; v_pp := (p_reading->>'angle_pp')::integer;
  v_agc := (p_reading->>'agc')::integer; v_mag := (p_reading->>'magnitude')::integer;
  v_rssi := (p_reading->>'rssi')::integer; v_uptime := (p_reading->>'uptime_ms')::bigint;
  v_period := (p_reading->>'send_period_s')::integer;
  v_sampled := (p_reading->>'sampled_at')::timestamptz;
  v_bus := p_reading->>'bus_status'; v_ms := p_reading->>'mag_status';
  v_method := p_reading->>'acq_method'; v_capture := p_reading->>'capture';
  if not (v_seq between 1 and 4294967295)
      or v_bus is null or v_bus not in ('ok','no_ack','read_error','timeout')
      or (v_bus = 'ok' and (v_ms is null or v_ms not in ('ok','no_magnet','weak','strong')))
      or (v_bus <> 'ok' and v_ms is not null)
      or ((v_raw is not null) <> (v_bus = 'ok' and v_ms in ('ok','weak','strong')))
      or (v_raw is not null and not (v_raw between 0 and 4095))
      or (v_pp is not null and (v_raw is null or not (v_pp between 0 and 4095)))
      or (v_agc is not null and not (v_agc between 0 and 255))
      or (v_mag is not null and not (v_mag between 0 and 4095))
      or (v_rssi is not null and not (v_rssi between -127 and 0))
      or (v_uptime is not null and not (v_uptime between 0 and 4294967295))
      or (v_period is not null and not (v_period between 5 and 86400))
      or (v_method is not null and v_method !~ '^[a-z0-9][a-z0-9._-]{0,31}$')
      or (v_capture is not null and v_capture !~ '^[a-f0-9]{8}$')
      or (v_sampled is not null and (not pg_catalog.isfinite(v_sampled) or v_sampled > v_now + interval '10 minutes' or v_sampled < '2025-01-01'::timestamptz)) then
    raise exception using errcode='22023',message='Leitura magnética fora da faixa permitida';
  end if;
  -- Reenvio da mesma amostra: não cria linha, não altera a leitura atual, não ancora referência.
  select id, received_at into v_row_id, v_received from public.gaxeta_readings
    where sensor_id=v_id and boot_id=v_boot and sequence=v_seq;
  if found then return pg_catalog.jsonb_build_object('ok',true,'duplicate',true,'id',v_row_id,'received_at',v_received); end if;
  select * into d from public.gaxeta_devices where sensor_id=v_id for update;
  if not found then
    if v_origin='esp32' then
      -- Limite de sensores da credencial: só a criação de sensor novo é serializada.
      perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('gaxeta_new_device'));
      if (select pg_catalog.count(*) from public.gaxeta_devices where origin='esp32') >= v_key.max_devices then
        raise sqlstate 'PT429' using message='Limite de sensores do piloto atingido';
      end if;
    end if;
    insert into public.gaxeta_devices(sensor_id,origin,wifi_mac)
      values(v_id,v_origin,pg_catalog.left(p_reading->>'wifi_mac',32))
      on conflict (sensor_id) do nothing;
    select * into d from public.gaxeta_devices where sensor_id=v_id for update;
  else
    if d.origin <> v_origin then raise exception using errcode='22023',message='Origem incompatível com o sensor'; end if;
    if d.last_received_at > v_now - interval '750 milliseconds' then
      raise sqlstate 'PT429' using message='Aguarde antes da próxima leitura';
    end if;
  end if;
  -- Corrida entre dois envios da mesma amostra: o segundo espera a linha do sensor e cai aqui.
  select id, received_at into v_row_id, v_received from public.gaxeta_readings
    where sensor_id=v_id and boot_id=v_boot and sequence=v_seq;
  if found then return pg_catalog.jsonb_build_object('ok',true,'duplicate',true,'id',v_row_id,'received_at',v_received); end if;

  insert into public.gaxeta_readings(sensor_id,boot_id,sequence,received_at,sampled_at,rssi,uptime_ms,acq_method,
      modality,schema_version,raw_angle,angle_pp,mag_status,bus_status,agc,magnitude,capture)
    values(v_id,v_boot,v_seq,v_now,v_sampled,v_rssi,v_uptime,v_method,
      'as5600_i2c',4,v_raw,v_pp,v_ms,v_bus,v_agc,v_mag,v_capture)
    returning id,received_at into v_row_id,v_received;
  -- Mesma regra da rota antiga: amostra atrasada entra no histórico sem virar a leitura atual.
  v_current := d.last_boot_id is null
    or (d.last_boot_id=v_boot and v_seq>d.last_sequence)
    or (d.last_boot_id<>v_boot and (v_sampled is null or d.last_sampled_at is null or v_sampled>=d.last_sampled_at));
  v_valid := v_bus = 'ok' and v_ms = 'ok';
  v_name := p_reading->>'device_name';

  if v_current then
    select l.id into v_link from gaxeta_private.device_links l
      where l.sensor_id = v_id and l.point_id = d.measurement_point_id and l.unlinked_at is null;
    if v_link is not null then
      -- Solicitação pendente: vence sozinha; senão tenta capturar esta amostra como referência.
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'pending' for update;
      if found then
        if v_now > s.expires_at then
          update gaxeta_private.mag_services set status='expired', ended_at=v_now, end_reason='no_valid_sample' where id = s.id;
        else
          -- Posterior ao clique: horário sincronizado com margem (e transporte plausível), ou o
          -- identificador de captura repetido pela placa. Estável: bloco com até 6 contagens.
          v_rule := case
            when v_capture is not distinct from s.capture then 'echo'
            when v_sampled is not null and v_sampled >= s.requested_at + interval '2 seconds'
                 and v_received - v_sampled between interval '-5 seconds' and interval '120 seconds' then 'clock' end;
          if v_valid and v_rule is not null and coalesce(v_pp, 0) <= 6 then
            v_calc := gaxeta_private.mag_compute(s.geometry, s.datum_raw, v_raw, v_raw, s.course_mm);
            if v_calc is null or v_calc->>'range_state' <> 'ok' then
              update gaxeta_private.mag_services set status='rejected', ended_at=v_now, end_reason='outside_geometry' where id = s.id;
            else
              update gaxeta_private.mag_services set status='superseded', ended_at=v_now, end_reason='new_service', superseded_by=s.id
                where link_id = v_link and status = 'active';
              update gaxeta_private.mag_services set status='active', ref_reading_id=v_row_id, ref_raw_angle=v_raw,
                  ref_sampled_at=v_sampled, captured_at=v_now, capture_rule=v_rule,
                  stable_remaining=(v_calc->>'remaining_percent')::numeric, stable_since=v_now
                where id = s.id;
            end if;
          else
            v_reply_capture := s.capture;
          end if;
        end if;
      end if;
      -- Referência vigente: avanço e curso restante desta amostra; linha estabilizada de 5 p.p.
      select * into s from gaxeta_private.mag_services where link_id = v_link and status = 'active' for update;
      if found and v_valid then
        v_calc := gaxeta_private.mag_compute(s.geometry, s.datum_raw, s.ref_raw_angle, v_raw, s.course_mm);
        if v_calc is not null and v_calc->>'remaining_percent' is not null then
          v_rem := (v_calc->>'remaining_percent')::numeric;
          v_next := s.stable_remaining;
          if v_calc->>'range_state' = 'ok' and s.ref_reading_id <> v_row_id then
            v_next := gaxeta_private.mag_stabilize(s.stable_remaining, v_rem);
            if v_next is distinct from s.stable_remaining then
              insert into gaxeta_private.mag_movements(reading_id,service_id,sensor_id,received_at,previous_remaining,stable_remaining)
                values(v_row_id,s.id,v_id,v_received,s.stable_remaining,v_next);
              update gaxeta_private.mag_services set stable_remaining=v_next, stable_since=v_received where id = s.id;
            end if;
          end if;
          update public.gaxeta_readings set service_id=s.id, advance_mm=(v_calc->>'advance_mm')::numeric,
              remaining_mm=(v_calc->>'remaining_mm')::numeric, remaining_percent=v_rem,
              range_state=v_calc->>'range_state', stable_remaining=v_next
            where id = v_row_id;
        end if;
      end if;
    end if;
    -- Leitura atual do sensor. Os campos elétricos são zerados para NULO: nenhuma tensão ou
    -- percentual do potenciômetro fica como leitura atual de uma placa magnética.
    update public.gaxeta_devices set
      reading_count=reading_count+1,
      last_received_at=v_now,last_sampled_at=v_sampled,last_boot_id=v_boot,last_sequence=v_seq,last_rssi=v_rssi,
      last_percent=null,last_position_mm=null,last_voltage_v=null,last_voltage_mv=null,
      last_adc_raw=null,last_adc_min=null,last_adc_max=null,adc_noise=null,last_percent_scale=null,
      stable_percent=null,stable_since=null,
      last_modality='as5600_i2c',last_acq_method=v_method,
      last_raw_angle=v_raw,last_angle_pp=v_pp,last_mag_status=v_ms,last_bus_status=v_bus,last_agc=v_agc,last_magnitude=v_mag,
      last_valid_raw_angle=case when v_valid then v_raw else last_valid_raw_angle end,
      last_valid_at=case when v_valid then coalesce(v_sampled,v_now) else last_valid_at end,
      send_period_s=coalesce(v_period,send_period_s),
      applied_label=case when v_name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then v_name else applied_label end,
      ble_mac=coalesce(pg_catalog.left(p_reading->>'ble_mac',32),ble_mac),
      firmware_version=coalesce(pg_catalog.left(p_reading->>'firmware_version',32),firmware_version),
      transport='direct_wifi'
      where sensor_id=v_id;
  else
    update public.gaxeta_devices set reading_count=reading_count+1 where sensor_id=v_id;
  end if;
  return pg_catalog.jsonb_build_object('ok',true,'duplicate',false,'id',v_row_id,'received_at',v_received)
    || case when v_reply_capture is not null then pg_catalog.jsonb_build_object('capture',v_reply_capture) else '{}'::jsonb end;
end
$function$;
comment on function public.gaxeta_ingest_v4(text, jsonb) is
  'Ingestão magnética (schema_version 4, modality as5600_i2c). Mesma credencial, deduplicação por sensor/boot/sequência, regra de leitura atual e intervalo mínimo de gaxeta_ingest. Falha de I²C, ímã ausente e campo fora da faixa são telemetria de saúde: a leitura entra sem posição operacional. Recusa qualquer campo elétrico.';

create or replace function public.gaxeta_mag_request_service(p_sensor_id text, p_request_id uuid, p_course_mm numeric, p_course_origin text default 'measured')
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.gaxeta_devices%rowtype; l gaxeta_private.device_links%rowtype;
  s gaxeta_private.mag_services%rowtype; g gaxeta_private.mag_geometries%rowtype;
  v_setup jsonb; v_now timestamptz := clock_timestamp(); v_wait integer; v_snap jsonb; v_role text := gaxeta_authz.my_role();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null for update;
  if not found then raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.'; end if;
  if p_request_id is null then raise invalid_parameter_value using message = 'Operação inválida.'; end if;
  if p_course_mm is null or p_course_mm = 'NaN'::numeric or not (p_course_mm > 0 and p_course_mm <= 1000) or p_course_mm <> round(p_course_mm, 3) then
    raise invalid_parameter_value using message = 'Informe o curso disponível em mm: positivo, até 1000, com até três casas decimais.';
  end if;
  if p_course_origin is null or p_course_origin not in ('measured', 'estimated') then
    raise invalid_parameter_value using message = 'Informe se o curso foi medido ou estimado.';
  end if;

  -- Reenvio da mesma solicitação (toque duplo, resposta perdida): devolve a que já existe.
  select * into s from gaxeta_private.mag_services where link_id = l.id and request_id = p_request_id;
  if found then
    if s.actor_id <> auth.uid() or s.course_mm <> p_course_mm or s.course_origin <> p_course_origin then
      raise sqlstate 'PT409' using message = 'A solicitação já foi usada para outra operação.';
    end if;
    return jsonb_build_object('id', s.id::text, 'status', s.status, 'duplicate', true, 'requested_at', s.requested_at, 'expires_at', s.expires_at);
  end if;

  if d.last_modality is distinct from 'as5600_i2c' then
    raise sqlstate 'PT409' using message = 'Este sensor não está enviando leitura magnética.';
  end if;
  v_setup := gaxeta_private.mag_setup(l.point_id);
  if v_setup is null or v_setup->>'geometry_id' is null then
    raise sqlstate 'PT409' using message = 'Este spot ainda não tem geometria de montagem. A engenharia precisa vincular a revisão caracterizada.';
  end if;
  select * into g from gaxeta_private.mag_geometries where id = (v_setup->>'geometry_id')::bigint;
  if g.status = 'retired' then
    raise sqlstate 'PT409' using message = 'A geometria deste spot foi retirada. A engenharia precisa vincular a revisão atual.';
  end if;
  -- Geometria ainda em caracterização: só a engenharia registra, e o resultado sai como provisório.
  if g.status = 'draft' and v_role not in ('adm1', 'adm2') then
    raise sqlstate 'PT409' using message = 'A geometria deste spot ainda não foi validada pela engenharia.';
  end if;
  if p_course_mm < g.min_course_mm or p_course_mm > g.max_course_mm then
    raise invalid_parameter_value using message = 'Curso fora da faixa validada para esta montagem ('
      || trim(to_char(g.min_course_mm, 'FM9990.0##')) || ' a ' || trim(to_char(g.max_course_mm, 'FM9990.0##')) || ' mm).';
  end if;
  if g.model_kind = 'linear' and p_course_mm / g.mm_per_deg > g.unique_arc_deg then
    raise invalid_parameter_value using message = 'Este curso exige mais giro do que o arco único da montagem: a posição ficaria indeterminada.';
  end if;

  -- Outra solicitação aguardando leitura (outro técnico ou outro aparelho).
  select * into s from gaxeta_private.mag_services where link_id = l.id and status = 'pending' for update;
  if found then
    if v_now > s.expires_at then
      update gaxeta_private.mag_services set status = 'expired', ended_at = v_now, end_reason = 'no_valid_sample' where id = s.id;
    else
      raise sqlstate 'PT409' using message = 'Já existe um engaxetamento aguardando leitura neste sensor. Aguarde a confirmação ou cancele a solicitação.';
    end if;
  end if;

  -- Espera estimada pela cadência anunciada (ou medida): até quatro envios mais folga.
  v_wait := least(3600, greatest(120, 4 * coalesce(d.send_period_s, gaxeta_private.gland_cadence(d.sensor_id)::integer, 30) + 30));
  v_snap := gaxeta_private.mag_geometry_snapshot(g);
  insert into gaxeta_private.mag_services (link_id, point_id, sensor_id, request_id, actor_id, requested_at, expires_at,
      course_mm, course_origin, geometry_id, geometry, provisional, datum_raw, capture)
    values (l.id, l.point_id, d.sensor_id, p_request_id, auth.uid(), v_now, v_now + make_interval(secs => v_wait),
      p_course_mm, p_course_origin, g.id, v_snap, g.status <> 'validated',
      coalesce((v_setup->>'datum_raw')::smallint, g.datum_raw), substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
    returning * into s;
  perform gaxeta_private.audit('mag.service.request', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id),
    jsonb_build_object('service_id', s.id, 'link_id', l.id, 'point_id', l.point_id, 'course_mm', p_course_mm,
      'course_origin', p_course_origin, 'geometry_id', g.id, 'geometry', g.key || ' r' || g.revision));
  return jsonb_build_object('id', s.id::text, 'status', s.status, 'duplicate', false, 'requested_at', s.requested_at, 'expires_at', s.expires_at,
    'wait_s', coalesce(d.send_period_s, 30));
end $$;

create or replace function public.gaxeta_mag_summary(p_sensor_ids text[])
 returns jsonb language plpgsql stable security definer set search_path = '' set statement_timeout = '5s' as $$
declare
  d public.gaxeta_devices%rowtype; r public.gaxeta_readings%rowtype;
  s gaxeta_private.mag_services%rowtype; p gaxeta_private.mag_services%rowtype; g gaxeta_private.mag_geometries%rowtype;
  win tstzmultirange; items jsonb := '[]'::jsonb; v_link bigint; v_setup jsonb; v_reason text; v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
  if p_sensor_ids is null or pg_catalog.cardinality(p_sensor_ids) > 200 then
    raise invalid_parameter_value using message = 'Informe até 200 sensores.';
  end if;
  for d in select * from public.gaxeta_devices
            where origin = 'esp32' and last_modality = 'as5600_i2c' and sensor_id = any (p_sensor_ids) order by sensor_id loop
    win := gaxeta_authz.sensor_read_windows(d.sensor_id);
    continue when win = '{}'::tstzmultirange;
    r := null; s := null; p := null; g := null; v_link := null; v_setup := null;
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
    end if;
    -- Por que não há curso restante agora (código; a interface traduz em texto de ação).
    v_reason := case
      when r.id is null then 'no_reading'
      when gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status) is not null then gaxeta_private.mag_invalid_reason(r.bus_status, r.mag_status)
      when v_link is null then 'no_link'
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
        'transport_s', round(extract(epoch from r.received_at - r.sampled_at)::numeric, 1)) end,
      'last_valid', case when d.last_valid_at is not null and d.last_valid_at <@ win then jsonb_build_object(
        'raw_angle', d.last_valid_raw_angle, 'angle_deg', round(d.last_valid_raw_angle * 360.0 / 4096, 3), 'at', d.last_valid_at) end,
      'setup', case when g.id is not null then jsonb_build_object('source', v_setup->>'source', 'geometry_id', g.id::text,
        'key', g.key, 'revision', g.revision, 'label', g.label, 'status', g.status, 'model_kind', g.model_kind,
        'min_course_mm', g.min_course_mm, 'max_course_mm', g.max_course_mm, 'tolerance_mm', g.tolerance_mm,
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class')
        when v_setup is not null then jsonb_build_object('source', v_setup->>'source',
        'suggested_course_mm', (v_setup->>'suggested_course_mm')::numeric, 'size_class', v_setup->>'size_class') end,
      'pending', case when p.id is not null then jsonb_build_object('id', p.id::text, 'requested_at', p.requested_at,
        'expires_at', p.expires_at, 'expired', v_now > p.expires_at, 'mine', p.actor_id = auth.uid(),
        'course_mm', p.course_mm, 'course_origin', p.course_origin) end,
      'service', case when s.id is not null then jsonb_build_object('id', s.id::text, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'capture_rule', s.capture_rule, 'course_mm', s.course_mm, 'course_origin', s.course_origin,
        'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'geometry_current', g.id is not distinct from s.geometry_id,
        'ref_raw_angle', s.ref_raw_angle, 'ref_angle_deg', round(s.ref_raw_angle * 360.0 / 4096, 3), 'ref_sampled_at', s.ref_sampled_at,
        'stable_remaining', s.stable_remaining, 'stable_since', s.stable_since) end,
      'computed', case when s.id is not null and r.service_id = s.id and r.remaining_percent is not null then jsonb_build_object(
        'advance_mm', r.advance_mm, 'remaining_mm', r.remaining_mm, 'remaining_percent', r.remaining_percent,
        'range_state', r.range_state) end,
      'reason', v_reason);
  end loop;
  return jsonb_build_object('server_time', v_now, 'items', items);
end $$;
comment on function public.gaxeta_mag_summary(text[]) is
  'Estado atual dos sensores magnéticos que o usuário pode ler: ângulo absoluto e saúde (medidos), montagem do spot, solicitação pendente, referência vigente e curso restante (calculado). reason explica, em código, por que não há curso restante.';

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
    -- Um intervalo por referência: a linha quebra na troca de engaxetamento. O ângulo é média
    -- CIRCULAR (não se faz média aritmética através de 0°); o curso restante é média física.
    select floor(extract(epoch from (received_at - p_from)) / bucket_seconds) b, service_id,
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
      (max(array[extract(epoch from received_at), id::numeric, stable_remaining]))[3] stable_remaining
    from rows group by 1, 2
  ), svc as (
    select s.* from gaxeta_private.mag_services s
     where s.sensor_id = p_sensor_id and s.status in ('active', 'superseded')
       and s.captured_at <= p_to and coalesce(s.ended_at, 'infinity') >= p_from and s.captured_at <@ v_win
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
        'remaining_mm', round(b.rem_mm, 4), 'advance_mm', round(b.adv_mm, 4), 'stable_remaining', b.stable_remaining)
        order by b.received_at) from buckets b), '[]'::jsonb),
    'services', coalesce((select jsonb_agg(jsonb_build_object('id', s.id::text, 'status', s.status, 'requested_at', s.requested_at,
        'captured_at', s.captured_at, 'ended_at', s.ended_at, 'end_reason', s.end_reason, 'course_mm', s.course_mm,
        'course_origin', s.course_origin, 'provisional', s.provisional, 'geometry', (s.geometry->>'key') || ' r' || (s.geometry->>'revision'),
        'model_kind', s.geometry->>'model_kind', 'direction', (s.geometry->>'direction')::integer,
        'ref_raw_angle', s.ref_raw_angle, 'ref_reading_id', s.ref_reading_id::text) order by s.captured_at) from svc s), '[]'::jsonb),
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
  'Histórico magnético agregado (até 600 intervalos), separado por referência: ângulo absoluto em média circular, curso restante e avanço em média física, contagem de amostras inválidas por motivo, referências do período e mudanças estabilizadas de 5 p.p. Limitado ao período que o usuário pode ler.';

alter table public.gaxeta_readings
  drop constraint gaxeta_readings_ct_check, drop constraint gaxeta_readings_bench_check, drop constraint gaxeta_readings_ct_modality_check,
  drop column ct_session, drop column ct_count, drop column ct_origin, drop column ct_loss, drop column ct_step, drop column ct_gap_ms,
  drop column bench_id, drop column bench_state, drop column bench_u_deg, drop column bench_percent;
drop table gaxeta_private.mag_bench_modes;
drop table gaxeta_private.mag_maintenance_notes;
drop function gaxeta_private.mag_bench_check(numeric, numeric, integer);
drop function gaxeta_private.mag_bench_eval(numeric, numeric);
drop function gaxeta_private.mag_bench_u(numeric, integer, numeric);
drop function gaxeta_private.mag_band(numeric);
alter table gaxeta_private.mag_point_setups drop constraint mag_point_setups_content_check;
alter table gaxeta_private.mag_point_setups alter column geometry_id set not null;
comment on table gaxeta_private.mag_point_setups is
  'Geometria vigente em cada spot (ponto de medição), com histórico. datum_raw: ângulo bruto no datum mecânico desta instalação (curvas table sem porta-ímã indexado). suggested_course_mm: estimativa de curso, nunca tratada como medida.';

notify pgrst, 'reload schema';
commit;
