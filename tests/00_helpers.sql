-- Utilitários de teste (somente desenvolvimento). Simulam o que a API faz:
-- papel 'authenticated' + claims do JWT com o UUID do Auth.
create schema if not exists t;
grant usage on schema t to public;
create table if not exists t.results (id bigint generated always as identity primary key, suite text, name text, ok boolean, detail text);
create table if not exists t.ids (k text primary key, v text);

create or replace function t.log(p_ok boolean, p_name text, p_detail text default null) returns text
 language plpgsql security definer set search_path to '' as $$
begin
  insert into t.results (suite, name, ok, detail) values (current_setting('t.suite', true), p_name, coalesce(p_ok, false), p_detail);
  return case when coalesce(p_ok, false) then 'ok   ' else 'FALHA' end || ' | ' || p_name || coalesce(' | ' || p_detail, '');
end $$;

create or replace function t.login(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;
create or replace function t.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end $$;
create or replace function t.service() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'service_role')::text, true);
  perform set_config('role', 'service_role', true);
end $$;

create or replace function t.ok(p_cond boolean, p_name text) returns text language sql as $$ select t.log(p_cond, p_name) $$;
create or replace function t.eq(p_got anyelement, p_want anyelement, p_name text) returns text language sql as $$
  select t.log(p_got is not distinct from p_want, p_name,
    case when p_got is distinct from p_want then 'obtido=' || coalesce(p_got::text, 'NULL') || ' esperado=' || coalesce(p_want::text, 'NULL') end) $$;
-- Executa SQL com o papel atual e espera erro cujo SQLSTATE ou mensagem case com p_expect.
create or replace function t.throws(p_sql text, p_expect text, p_name text) returns text language plpgsql as $$
declare v_state text; v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate, v_msg = message_text;
    return t.log(v_state = p_expect or v_msg ~* p_expect, p_name, v_state || ': ' || v_msg);
  end;
  return t.log(false, p_name, 'nenhum erro');
end $$;
-- Conta linhas de um SELECT com o papel atual.
create or replace function t.n(p_sql text) returns bigint language plpgsql as $$
declare v bigint; begin execute 'select count(*) from (' || p_sql || ') q' into v; return v; end $$;
create or replace function t.id(p_k text) returns uuid language sql security definer set search_path to '' as $$ select v::uuid from t.ids where k = p_k $$;
create or replace function t.put(p_k text, p_v text) returns text language sql security definer set search_path to '' as $$
  insert into t.ids values (p_k, p_v) on conflict (k) do update set v = excluded.v returning v $$;
grant execute on all functions in schema t to public;

-- Gerador de telemetria sintética: aplica a MESMA regra de estabilização do banco
-- (gaxeta_private.stabilize) e grava movimentos como o invólucro de ingestão faz.
create or replace function t.gen_sensor(p_sensor text, p_n integer, p_start timestamptz, p_step interval, p_seed double precision default 0.42)
 returns void language plpgsql as $$
declare v_raw numeric := 50; v_stable numeric; v_next numeric; v_ts timestamptz := p_start; v_id bigint; v_boot text := md5(p_sensor);
        v_since timestamptz; i integer; v_seq0 bigint;
begin
  perform setseed(p_seed);
  insert into public.gaxeta_devices (sensor_id, origin, wifi_mac) values (p_sensor, 'esp32', 'AA:BB:CC:00:00:01') on conflict do nothing;
  select coalesce(max(sequence), 0), max(stable_percent) filter (where false) into v_seq0, v_stable from public.gaxeta_readings where sensor_id = p_sensor;
  select stable_percent, stable_since into v_stable, v_since from public.gaxeta_devices where sensor_id = p_sensor;
  for i in 1..p_n loop
    v_raw := round(greatest(0, least(100, v_raw + (random() - 0.5) * 3 + case when random() < 0.002 then (random() - 0.5) * 60 else 0 end))::numeric, 2);
    v_next := gaxeta_private.stabilize(v_stable, v_raw);
    insert into public.gaxeta_readings (sensor_id, boot_id, sequence, received_at, sampled_at, travel_percent, position_mm, voltage_v, adc_raw, rssi, uptime_ms, adc_noise, stable_percent)
    values (p_sensor, v_boot, v_seq0 + i * 2, v_ts, v_ts - interval '3 seconds', v_raw, round(v_raw * 0.5, 3), round(v_raw * 0.033, 4), round(v_raw * 40.95, 3), -60, least(i::bigint * 10000, 4294967295), 1.5, v_next)
    returning id into v_id;
    if v_next is distinct from v_stable then
      insert into public.gaxeta_movements (reading_id, sensor_id, received_at, previous_percent, stable_percent) values (v_id, p_sensor, v_ts, v_stable, v_next);
      v_since := v_ts;
    end if;
    v_stable := v_next;
    v_ts := v_ts + p_step;
  end loop;
  update public.gaxeta_devices set reading_count = reading_count + p_n, last_received_at = v_ts - p_step, last_sampled_at = v_ts - p_step - interval '3 seconds',
    last_boot_id = v_boot, last_sequence = v_seq0 + p_n * 2, last_percent = v_raw, last_position_mm = round(v_raw * 0.5, 3), last_voltage_v = round(v_raw * 0.033, 4),
    last_rssi = -60, stable_percent = v_stable, stable_since = v_since, firmware_version = '4.0.0' where sensor_id = p_sensor;
end $$;
