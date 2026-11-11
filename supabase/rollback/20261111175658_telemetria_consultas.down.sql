-- =============================================================================
-- REVERSÃO da migração 06 · telemetria e consultas
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

drop function public.gaxeta_devices_status(text[]);
drop function public.gaxeta_assets_children(uuid, integer, integer);
drop function public.gaxeta_assets_search(text, integer);
drop function public.gaxeta_devices_page(uuid, text, boolean, integer, integer);
drop index public.gaxeta_assets_name_trgm;
drop index public.gaxeta_assets_tag_trgm;
drop index public.gaxeta_assets_roots_idx;
-- Corpo de produção de 11/11/2026 (SECURITY INVOKER; a leitura volta a depender só das políticas).
create or replace function public.gaxeta_history(p_sensor_id text, p_from timestamp with time zone, p_to timestamp with time zone)
 returns jsonb
 language plpgsql
 stable
 set search_path to ''
 set statement_timeout to '8s'
as $function$
declare result jsonb; bucket_seconds numeric;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to-p_from<interval '1 second' or p_to-p_from>interval '366 days' then
 raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
 bucket_seconds:=greatest(1,extract(epoch from(p_to-p_from))/600);
 with source as (
 select *,floor(extract(epoch from(received_at-p_from))/bucket_seconds) bucket
 from public.gaxeta_readings where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to
 ), buckets as (
 select min(received_at) received_at,avg(travel_percent) travel_percent,min(travel_percent) min_percent,
 max(travel_percent) max_percent,avg(position_mm) position_mm,avg(voltage_v) voltage_v,
 (array_agg(stable_percent order by received_at desc,id desc))[1] stable_percent,count(*) samples
 from source group by bucket
 ), events as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to
 order by received_at,reading_id limit 5001
 ), seed as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at<p_from order by received_at desc,reading_id desc limit 1
 ) select jsonb_build_object(
 'history',coalesce((select jsonb_agg(to_jsonb(b) order by received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',count(*),'min',min(travel_percent),'max',max(travel_percent),'last_received_at',max(received_at)) from source),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;
drop function gaxeta_authz.sensor_read_windows(text);
-- A extensão pg_trgm permanece instalada (inofensiva); remover à parte se desejado.
commit;
