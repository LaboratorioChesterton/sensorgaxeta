-- Migração 15, parte b de 4 (ingestão magnética). Ver o cabeçalho da parte a.
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 4. Ingestão magnética: contagem contínua e Modo bancada (corpo da migração 14 com os acréscimos)
-- ---------------------------------------------------------------------------
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
  -- Migração 15: contagem contínua (firmware 4.5.0) e Modo bancada.
  b gaxeta_private.mag_bench_modes%rowtype;
  v_ct_capable boolean; v_ct_session text; v_ct_count bigint; v_ct_origin integer; v_ct_raw integer;
  v_ct_loss text; v_ct_step integer; v_ct_gap integer; v_ct_ok boolean;
  v_bench_state text; v_u numeric; v_pct numeric; v_reply_bench jsonb := '{}'::jsonb;
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
  foreach k in array array['raw_angle','angle_pp','agc','magnitude','rssi','uptime_ms','send_period_s',
      'ct_count','ct_origin','ct_raw','ct_step','ct_gap_ms','ct_samples','ct_period_ms','ct_gap_limit_ms'] loop
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
  -- Contagem contínua: campos opcionais. O firmware que a suporta envia sempre ct_period_ms; sem
  -- sessão aberta naquele instante, ct_session vem nula e ct_loss diz o motivo.
  v_ct_capable := pg_catalog.jsonb_typeof(p_reading->'ct_period_ms') is not distinct from 'number';
  v_ct_session := p_reading->>'ct_session'; v_ct_loss := p_reading->>'ct_loss';
  v_ct_count := (p_reading->>'ct_count')::bigint; v_ct_origin := (p_reading->>'ct_origin')::integer;
  v_ct_raw := (p_reading->>'ct_raw')::integer;
  v_ct_step := least(4095, (p_reading->>'ct_step')::bigint)::integer;
  v_ct_gap := least(65535, (p_reading->>'ct_gap_ms')::bigint)::integer;
  if (p_reading ? 'ct_session' and pg_catalog.jsonb_typeof(p_reading->'ct_session') not in ('string','null'))
      or (v_ct_session is not null and v_ct_session !~ '^[a-f0-9]{8}$')
      or (p_reading ? 'ct_loss' and pg_catalog.jsonb_typeof(p_reading->'ct_loss') not in ('string','null'))
      or (v_ct_loss is not null and v_ct_loss not in ('boot','no_magnet','field','bus','gap','speed','ambiguous'))
      or (v_ct_count is not null and not (v_ct_count between -2147483648 and 2147483647))
      or (v_ct_origin is not null and not (v_ct_origin between 0 and 4095))
      or (v_ct_raw is not null and not (v_ct_raw between 0 and 4095))
      or (v_ct_step is not null and v_ct_step < 0) or (v_ct_gap is not null and v_ct_gap < 0) then
    raise exception using errcode='22023',message='Contagem contínua fora da faixa permitida';
  end if;
  if not v_ct_capable then
    v_ct_session := null; v_ct_count := null; v_ct_origin := null; v_ct_raw := null; v_ct_loss := null; v_ct_step := null; v_ct_gap := null;
  elsif v_ct_session is not null and (v_ct_count is null or v_ct_origin is null or v_ct_raw is null
      or (((v_ct_origin + v_ct_count) % 4096) + 4096) % 4096 <> v_ct_raw) then
    -- Sessão declarada, mas origem + contagem não cai sobre a última amostra: a contagem deste
    -- pacote não é usada (a leitura do ângulo continua valendo).
    v_ct_session := null; v_ct_count := null; v_ct_origin := null; v_ct_loss := 'incoherent';
  elsif v_ct_session is null then
    v_ct_count := null; v_ct_origin := null;
  end if;
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
      modality,schema_version,raw_angle,angle_pp,mag_status,bus_status,agc,magnitude,capture,
      ct_session,ct_count,ct_origin,ct_loss,ct_step,ct_gap_ms)
    values(v_id,v_boot,v_seq,v_now,v_sampled,v_rssi,v_uptime,v_method,
      'as5600_i2c',4,v_raw,v_pp,v_ms,v_bus,v_agc,v_mag,v_capture,
      v_ct_session,v_ct_count::integer,v_ct_origin,v_ct_loss,v_ct_step,v_ct_gap)
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
      -- Modo bancada (migração 15). Enquanto está ligado não existe referência de campo neste
      -- vínculo (a ativação a encerra e novas solicitações são recusadas): nada abaixo deste
      -- bloco calcula curso restante nem grava movimento.
      select * into b from gaxeta_private.mag_bench_modes where link_id = v_link and status = 'active' for update;
      if found then
        v_ct_ok := v_valid and v_ct_session is not null;
        if b.anchor_status = 'pending' then
          if v_now > b.anchor_expires_at then
            update gaxeta_private.mag_bench_modes set anchor_status = 'none', anchor_note = 'expired' where id = b.id returning * into b;
          else
            -- Posterior ao toque: mesmo critério do engaxetamento (horário com margem, ou o
            -- identificador de captura repetido pela placa).
            v_rule := case
              when v_capture is not distinct from b.anchor_capture then 'echo'
              when v_sampled is not null and v_sampled >= b.anchor_requested_at + interval '2 seconds'
                   and v_received - v_sampled between interval '-5 seconds' and interval '120 seconds' then 'clock' end;
            if v_ct_ok and v_rule is not null and coalesce(v_pp, 0) <= 6 then
              -- Origem inequívoca: o eixo tem de estar DENTRO da faixa (uma única volta possível).
              v_u := gaxeta_private.mag_bench_u(b.zero_deg, b.direction, v_ct_raw * 360.0 / 4096);
              if v_u <= b.span_deg then
                update gaxeta_private.mag_bench_modes set anchor_status = 'set', anchor_session = v_ct_session, anchor_count = v_ct_count::integer,
                    anchor_u_deg = v_u, anchor_reading_id = v_row_id, anchor_at = v_now, anchor_rule = v_rule, anchor_note = null,
                    lost_reason = null, lost_at = null
                  where id = b.id returning * into b;
              else
                update gaxeta_private.mag_bench_modes set anchor_note = 'outside_range' where id = b.id returning * into b;
                v_reply_capture := b.anchor_capture;
              end if;
            else
              update gaxeta_private.mag_bench_modes set anchor_note = case
                  when not v_valid then 'invalid_sample' when not v_ct_capable then 'no_continuity'
                  when v_ct_session is null then 'no_session' when coalesce(v_pp, 0) > 6 then 'moving' else 'waiting_new_sample' end
                where id = b.id returning * into b;
              v_reply_capture := b.anchor_capture;
            end if;
          end if;
        end if;
        if b.anchor_status = 'set' then
          if v_ct_ok and v_ct_session = b.anchor_session then
            -- Mesma sessão da confirmação: posição contínua pela contagem absoluta da placa.
            v_u := b.anchor_u_deg + b.direction * (v_ct_count - b.anchor_count) * 360.0 / 4096;
            v_pct := least(100, greatest(0, 100 * v_u / b.span_deg));
            v_bench_state := 'ok';
            update gaxeta_private.mag_bench_modes set last_ok_reading_id = v_row_id, last_ok_percent = v_pct, last_ok_u_deg = v_u, last_ok_at = coalesce(v_sampled, v_now)
              where id = b.id;
          elsif not v_ct_capable then
            v_bench_state := 'no_continuity';
          else
            -- A sessão da placa mudou ou acabou (reinício, ímã ausente, falha, lacuna, velocidade):
            -- a posição deixa de ser conhecida até uma nova referência. A última boa fica guardada.
            update gaxeta_private.mag_bench_modes set anchor_status = 'lost', lost_at = v_now,
                lost_reason = coalesce(v_ct_loss, gaxeta_private.mag_invalid_reason(v_bus, v_ms), 'session_changed')
              where id = b.id returning * into b;
            v_bench_state := 'reposition';
          end if;
        elsif b.anchor_status = 'lost' then
          v_bench_state := 'reposition';
        else
          v_bench_state := case when v_ct_capable then 'awaiting_start' else 'no_continuity' end;
        end if;
        update public.gaxeta_readings set bench_id = b.id, bench_state = v_bench_state,
            bench_u_deg = case when v_bench_state = 'ok' then v_u end, bench_percent = case when v_bench_state = 'ok' then v_pct end
          where id = v_row_id;
        -- Espelho para o monitor local da placa: mesma conta, mesmos números.
        v_reply_bench := pg_catalog.jsonb_build_object('bench_state',
            case when v_bench_state = 'awaiting_start' and b.anchor_status = 'pending' then 'pending' else v_bench_state end)
          || case when v_bench_state = 'ok' then pg_catalog.jsonb_build_object('bench_s', b.anchor_session, 'bench_c', b.anchor_count,
               'bench_u', b.anchor_u_deg, 'bench_span', b.span_deg, 'bench_dir', b.direction) else '{}'::jsonb end;
      end if;
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
    || case when v_reply_capture is not null then pg_catalog.jsonb_build_object('capture',v_reply_capture) else '{}'::jsonb end
    || v_reply_bench;
end
$function$;
comment on function public.gaxeta_ingest_v4(text, jsonb) is
  'Ingestão magnética (schema_version 4, modality as5600_i2c). Mesma credencial, deduplicação por sensor/boot/sequência, regra de leitura atual e intervalo mínimo de gaxeta_ingest. Falha de I²C, ímã ausente e campo fora da faixa são telemetria de saúde: a leitura entra sem posição operacional. Recusa qualquer campo elétrico. Migração 15: aceita a contagem contínua opcional do firmware 4.5.0 (ct_*), calcula a Posição de bancada quando o Modo bancada está ligado no vínculo e devolve à placa o estado da bancada.';

-- Engaxetamento realizado: corpo da migração 14 com a recusa enquanto o Modo bancada está ativo.
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
  -- Migração 15: a bancada não se mistura com a série de campo.
  if exists (select 1 from gaxeta_private.mag_bench_modes where link_id = l.id and status = 'active') then
    raise sqlstate 'PT409' using message = 'O Modo bancada está ativo neste sensor. Saia do Modo bancada para registrar o engaxetamento.';
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

notify pgrst, 'reload schema';
commit;
