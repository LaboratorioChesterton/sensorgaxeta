-- Mede gaxeta_history com o corpo e as políticas ATUAIS de produção (baseline), como
-- membro autorizado, em volume comparável ao real (66 mil leituras a cada 10 s) e em
-- volume de 90 dias (777,6 mil). Uso: base só com shim + baseline + helpers.
\set ON_ERROR_STOP 1
\timing off
insert into auth.users (id, email, encrypted_password, email_confirmed_at) values ('00000000-0000-4000-a000-000000000001', 'admin.um@dev.test', 'x', now()) on conflict do nothing;
insert into gaxeta_private.platform_members (email) values ('admin.um@dev.test') on conflict do nothing;
select t.gen_sensor('ESP32-PERF00066K', 66000, date_trunc('minute', now()) - interval '66000 seconds' * 10, interval '10 seconds', 0.5);
select t.gen_sensor('ESP32-PERF00780K', 777600, date_trunc('minute', now()) - interval '90 days', interval '10 seconds', 0.6);
analyze public.gaxeta_readings; analyze public.gaxeta_movements; analyze public.gaxeta_devices;
create table if not exists t.timing (label text, sensor text, win text, ms numeric, outcome text, readings bigint);
create or replace function t.time_history(p_label text, p_user uuid, p_sensor text, p_win interval) returns text language plpgsql as $$
declare t0 timestamptz; j jsonb; v_ms numeric; v_out text := 'ok'; v_n bigint;
begin
  perform t.login(p_user);
  t0 := clock_timestamp();
  begin
    j := public.gaxeta_history(p_sensor, date_trunc('minute', now()) - p_win, date_trunc('minute', now()));
    v_n := (j -> 'stats' ->> 'count')::bigint;
  exception when query_canceled then v_out := 'TIMEOUT 8s (57014)';
  end;
  v_ms := round(extract(epoch from clock_timestamp() - t0) * 1000, 1);
  perform set_config('role', 'postgres', true);
  insert into t.timing values (p_label, p_sensor, p_win::text, v_ms, v_out, v_n);
  return p_label || ' | ' || p_sensor || ' | ' || p_win || ' | ' || v_ms || ' ms | ' || v_out || ' | leituras=' || coalesce(v_n::text, '-');
end $$;
