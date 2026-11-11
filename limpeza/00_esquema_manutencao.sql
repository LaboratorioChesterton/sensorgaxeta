-- =============================================================================
-- LIMPEZA ÚNICA DE LEITURAS BRUTAS — ferramenta de manutenção
-- NÃO é migração, cron nem retenção. Só entra no banco na janela do procedimento,
-- aplicada à mão pelo responsável, e pode ser removida depois (drop schema).
-- Recorte: as PRIMEIRAS N leituras do sensor por (received_at, id); desse conjunto
-- saem as protegidas. As leituras seguintes ficam fora do lote. Movimentos nunca
-- são apagados; reading_count (acumulado) não é alterado.
-- =============================================================================
begin;
create schema gaxeta_maint;
revoke all on schema gaxeta_maint from public;

create table gaxeta_maint.cleanup_runs (
  id bigint generated always as identity primary key,
  sensor_id text not null,
  requested_count integer not null,
  dedupe_window interval not null,
  created_at timestamptz not null default now(),
  created_by text not null default session_user,
  first_n integer, protected_by_movement integer, protected_as_reference integer, protected_by_dedupe integer,
  manifest_count integer, manifest_checksum text,
  first_received_at timestamptz, last_received_at timestamptz,
  status text not null default 'frozen' check (status in ('frozen', 'running', 'done', 'aborted', 'restored')),
  note text
);
create table gaxeta_maint.cleanup_manifest (
  run_id bigint not null references gaxeta_maint.cleanup_runs(id),
  reading_id bigint not null,
  received_at timestamptz not null,
  batch_no integer,
  deleted_at timestamptz,
  primary key (run_id, reading_id)
);
create index cleanup_manifest_pending_idx on gaxeta_maint.cleanup_manifest (run_id, received_at, reading_id) where deleted_at is null;
-- Cópia restaurável: mesmas colunas e tipos de gaxeta_readings (sem identidade).
create table gaxeta_maint.readings_backup (run_id bigint not null, like public.gaxeta_readings);
alter table gaxeta_maint.readings_backup add primary key (run_id, id);

-- Conjunto candidato e proteções. Somente leitura; serve à simulação e ao congelamento.
create function gaxeta_maint.candidates(p_sensor_id text, p_n integer, p_dedupe interval)
 returns table (id bigint, received_at timestamptz, protection text)
 language sql stable set search_path to '' as $$
  with first_n as (
    select r.id, r.received_at, r.boot_id, r.sequence,
           row_number() over (order by r.received_at desc, r.id desc) as from_end
      from (select * from public.gaxeta_readings where sensor_id = p_sensor_id order by received_at asc, id asc limit p_n) r
  ), dev as (select last_boot_id, last_sequence from public.gaxeta_devices where sensor_id = p_sensor_id)
  select f.id, f.received_at,
         case when exists (select 1 from public.gaxeta_movements m where m.reading_id = f.id) then 'movimento'
              when f.from_end = 1 then 'referencia'      -- última leitura do recorte: estado na fronteira do período retido
              when exists (select 1 from dev where dev.last_boot_id = f.boot_id and dev.last_sequence = f.sequence) then 'referencia'
              when f.received_at >= now() - p_dedupe then 'deduplicacao'
         end
    from first_n f
$$;

create function gaxeta_maint.simulate(p_sensor_id text, p_n integer default 60000, p_dedupe interval default '24 hours')
 returns jsonb language sql stable set search_path to '' as $$
  with c as (select * from gaxeta_maint.candidates(p_sensor_id, p_n, p_dedupe)),
       tot as (select count(*) n, min(received_at) f, max(received_at) l from public.gaxeta_readings where sensor_id = p_sensor_id)
  select jsonb_build_object(
    'sensor_id', p_sensor_id, 'simulated_at', now(),
    'total_readings', (select n from tot), 'oldest', (select f from tot), 'newest', (select l from tot),
    'first_n', (select count(*) from c), 'first_n_from', (select min(received_at) from c), 'first_n_to', (select max(received_at) from c),
    'protected_by_movement', (select count(*) from c where protection = 'movimento'),
    'protected_as_reference', (select count(*) from c where protection = 'referencia'),
    'protected_by_dedupe', (select count(*) from c where protection = 'deduplicacao'),
    'would_delete', (select count(*) from c where protection is null),
    'would_remain', (select n from tot) - (select count(*) from c where protection is null),
    'remaining_raw_after_cut', (select n from tot) - (select count(*) from c),
    'retained_window_starts', (select min(r.received_at) from public.gaxeta_readings r where r.sensor_id = p_sensor_id and r.received_at > (select max(received_at) from c)),
    'movements_total', (select count(*) from public.gaxeta_movements where sensor_id = p_sensor_id),
    'reading_count_accumulated', (select reading_count from public.gaxeta_devices where sensor_id = p_sensor_id))
$$;

-- Congela a lista exata e faz a cópia restaurável na mesma transação.
create function gaxeta_maint.freeze(p_sensor_id text, p_n integer default 60000, p_dedupe interval default '24 hours', p_note text default null)
 returns bigint language plpgsql set search_path to '' as $function$
declare v_run bigint;
begin
  if exists (select 1 from gaxeta_maint.cleanup_runs where sensor_id = p_sensor_id and status in ('frozen', 'running')) then
    raise exception 'Já existe uma operação aberta para este sensor';
  end if;
  insert into gaxeta_maint.cleanup_runs (sensor_id, requested_count, dedupe_window, note) values (p_sensor_id, p_n, p_dedupe, p_note) returning id into v_run;
  create temp table _c on commit drop as select * from gaxeta_maint.candidates(p_sensor_id, p_n, p_dedupe);
  insert into gaxeta_maint.cleanup_manifest (run_id, reading_id, received_at) select v_run, id, received_at from _c where protection is null;
  insert into gaxeta_maint.readings_backup select v_run, r.* from public.gaxeta_readings r join gaxeta_maint.cleanup_manifest m on m.run_id = v_run and m.reading_id = r.id;
  update gaxeta_maint.cleanup_runs set
    first_n = (select count(*) from _c),
    protected_by_movement = (select count(*) from _c where protection = 'movimento'),
    protected_as_reference = (select count(*) from _c where protection = 'referencia'),
    protected_by_dedupe = (select count(*) from _c where protection = 'deduplicacao'),
    manifest_count = (select count(*) from gaxeta_maint.cleanup_manifest where run_id = v_run),
    manifest_checksum = (select md5(string_agg(md5(b::text), '' order by b.id)) from gaxeta_maint.readings_backup b where b.run_id = v_run),
    first_received_at = (select min(received_at) from gaxeta_maint.cleanup_manifest where run_id = v_run),
    last_received_at = (select max(received_at) from gaxeta_maint.cleanup_manifest where run_id = v_run)
  where id = v_run;
  return v_run;
end $function$;

-- Um lote por chamada (uma transação por lote). Retomável: sempre os mesmos IDs.
-- Interrompe se a ingestão do sensor atrasar ou se alguma proteção mudar.
create function gaxeta_maint.run_batch(p_run bigint, p_batch integer default 2000, p_max_ingest_lag interval default '60 seconds')
 returns jsonb language plpgsql set search_path to '' as $function$
declare r gaxeta_maint.cleanup_runs%rowtype; v_ids bigint[]; v_del integer; v_batch integer; v_lag interval;
begin
  perform set_config('lock_timeout', '2s', true);
  perform set_config('statement_timeout', '20s', true);
  select * into r from gaxeta_maint.cleanup_runs where id = p_run for update;
  if not found or r.status not in ('frozen', 'running') then raise exception 'Operação % não está aberta', p_run; end if;
  if p_max_ingest_lag is not null then
    select now() - last_received_at into v_lag from public.gaxeta_devices where sensor_id = r.sensor_id;
    if v_lag is null or v_lag > p_max_ingest_lag then
      raise exception 'Ingestão atrasada (%): lote não executado', v_lag;
    end if;
  end if;
  select array_agg(reading_id) into v_ids from (
    select reading_id from gaxeta_maint.cleanup_manifest where run_id = p_run and deleted_at is null
     order by received_at, reading_id limit p_batch) s;
  if v_ids is null then
    update gaxeta_maint.cleanup_runs set status = 'done' where id = p_run;
    return jsonb_build_object('run', p_run, 'status', 'done', 'deleted', 0);
  end if;
  if exists (select 1 from public.gaxeta_movements m where m.reading_id = any (v_ids)) then
    raise exception 'Proteção mudou: há leitura do lote referenciada por movimento';
  end if;
  if exists (select 1 from public.gaxeta_devices d join public.gaxeta_readings x on x.sensor_id = d.sensor_id and x.boot_id = d.last_boot_id and x.sequence = d.last_sequence
              where d.sensor_id = r.sensor_id and x.id = any (v_ids)) then
    raise exception 'Proteção mudou: o lote contém a leitura que sustenta o estado atual';
  end if;
  delete from public.gaxeta_readings where id = any (v_ids) and sensor_id = r.sensor_id;
  get diagnostics v_del = row_count;
  if v_del <> cardinality(v_ids) then raise exception 'Lote divergente: % de % linhas encontradas', v_del, cardinality(v_ids); end if;
  select coalesce(max(batch_no), 0) + 1 into v_batch from gaxeta_maint.cleanup_manifest where run_id = p_run;
  update gaxeta_maint.cleanup_manifest set deleted_at = clock_timestamp(), batch_no = v_batch where run_id = p_run and reading_id = any (v_ids);
  update gaxeta_maint.cleanup_runs set status = 'running' where id = p_run;
  return jsonb_build_object('run', p_run, 'status', 'running', 'batch', v_batch, 'deleted', v_del,
    'pending', (select count(*) from gaxeta_maint.cleanup_manifest where run_id = p_run and deleted_at is null));
end $function$;

-- Restauração a partir da cópia: preserva IDs; não sobrescreve nada que exista.
create function gaxeta_maint.restore(p_run bigint)
 returns jsonb language plpgsql set search_path to '' as $function$
declare v_ins integer; v_id integer; v_uq integer;
begin
  select count(*) into v_id from gaxeta_maint.readings_backup b where b.run_id = p_run and exists (select 1 from public.gaxeta_readings r where r.id = b.id);
  select count(*) into v_uq from gaxeta_maint.readings_backup b where b.run_id = p_run and not exists (select 1 from public.gaxeta_readings r where r.id = b.id)
     and exists (select 1 from public.gaxeta_readings r where r.sensor_id = b.sensor_id and r.boot_id = b.boot_id and r.sequence = b.sequence);
  insert into public.gaxeta_readings (id, sensor_id, boot_id, sequence, received_at, sampled_at, travel_percent, position_mm, voltage_v, adc_raw, rssi, uptime_ms, adc_noise, stable_percent)
  overriding system value
  select b.id, b.sensor_id, b.boot_id, b.sequence, b.received_at, b.sampled_at, b.travel_percent, b.position_mm, b.voltage_v, b.adc_raw, b.rssi, b.uptime_ms, b.adc_noise, b.stable_percent
    from gaxeta_maint.readings_backup b where b.run_id = p_run
  on conflict do nothing;
  get diagnostics v_ins = row_count;
  update gaxeta_maint.cleanup_manifest set deleted_at = null, batch_no = null where run_id = p_run;
  update gaxeta_maint.cleanup_runs set status = 'restored' where id = p_run;
  return jsonb_build_object('run', p_run, 'restored', v_ins, 'already_present_by_id', v_id, 'skipped_same_boot_sequence', v_uq,
    'backup_rows', (select count(*) from gaxeta_maint.readings_backup where run_id = p_run));
end $function$;
commit;
