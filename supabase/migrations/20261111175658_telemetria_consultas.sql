-- =============================================================================
-- 06 · Telemetria e consultas paginadas
--   * gaxeta_history: mesma assinatura, mesmos limites e mesma resposta; corpo
--     reescrito para autorizar uma vez por chamada e agregar numa única passada.
--   * Consultas novas e enxutas para a interface futura (o pacote publicado segue
--     usando gaxeta_snapshot e as leituras diretas, que continuam válidas).
-- Não altera ingestão, estabilização, movimentos nem os índices existentes.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- Janelas de leitura de UM sensor para quem chama: administradores leem tudo de
-- sensores esp32; usuário de corporação, os períodos em que o sensor esteve num
-- spot do seu escopo. Mesma regra das políticas de gaxeta_readings/movements.
create function gaxeta_authz.sensor_read_windows(p_sensor_id text) returns tstzmultirange
 language sql stable security definer set search_path to '' as $$
  select case
    when gaxeta_authz.is_global_reader() then
      case when exists (select 1 from public.gaxeta_devices d where d.sensor_id = p_sensor_id and d.origin = 'esp32')
           then '{(,)}'::tstzmultirange else '{}'::tstzmultirange end
    when gaxeta_authz.my_role() = 'corp' then
      coalesce((select range_agg(tstzrange(l.linked_at, l.unlinked_at, '[)'))
                  from gaxeta_private.device_links l
                 where l.sensor_id = p_sensor_id and gaxeta_authz.asset_access(l.point_id) = 'full'), '{}'::tstzmultirange)
    else '{}'::tstzmultirange
  end
$$;
revoke all on function gaxeta_authz.sensor_read_windows(text) from public, anon;
grant execute on function gaxeta_authz.sensor_read_windows(text) to authenticated, service_role;

create or replace function public.gaxeta_history(p_sensor_id text, p_from timestamp with time zone, p_to timestamp with time zone)
 returns jsonb
 language plpgsql
 stable security definer
 set search_path to ''
 set statement_timeout to '8s'
as $function$
declare result jsonb; bucket_seconds numeric; v_win tstzmultirange;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to-p_from<interval '1 second' or p_to-p_from>interval '366 days' then
 raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
 bucket_seconds:=greatest(1,extract(epoch from(p_to-p_from))/600);
 v_win:=gaxeta_authz.sensor_read_windows(p_sensor_id);
 with buckets as (
 select min(received_at) received_at,avg(travel_percent) travel_percent,min(travel_percent) min_percent,
 max(travel_percent) max_percent,avg(position_mm) position_mm,avg(voltage_v) voltage_v,
 -- última leitura do intervalo por (received_at,id), sem ordenar o grupo
 (max(array[extract(epoch from received_at),id::numeric,stable_percent]))[3] stable_percent,count(*) samples,
 max(received_at) last_at
 from public.gaxeta_readings
 where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to and received_at <@ v_win
 group by floor(extract(epoch from(received_at-p_from))/bucket_seconds)
 ), events as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to and received_at <@ v_win
 order by received_at,reading_id limit 5001
 ), seed as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at<p_from and received_at <@ v_win
 order by received_at desc,reading_id desc limit 1
 ) select jsonb_build_object(
 'history',coalesce((select jsonb_agg(jsonb_build_object('received_at',b.received_at,'travel_percent',b.travel_percent,
   'min_percent',b.min_percent,'max_percent',b.max_percent,'position_mm',b.position_mm,'voltage_v',b.voltage_v,
   'stable_percent',b.stable_percent,'samples',b.samples) order by b.received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',coalesce(sum(samples),0),'min',min(min_percent),'max',max(max_percent),'last_received_at',max(last_at)) from buckets),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;

-- As consultas abaixo são SECURITY INVOKER (valem as políticas de quem chama) e usam
-- plano por chamada, para que filtros opcionais não impeçam o uso dos índices.

-- Estado atual dos dispositivos visíveis, sem histórico nem estatísticas.
-- Mesmo formato de cada item de gaxeta_snapshot().devices.
create function public.gaxeta_devices_status(p_sensor_ids text[] default null)
 returns jsonb language plpgsql stable set search_path to '' set plan_cache_mode to force_custom_plan as $function$
declare v jsonb;
begin
  if p_sensor_ids is null then
    select coalesce(jsonb_agg(to_jsonb(d) order by d.last_received_at desc nulls last), '[]'::jsonb) into v
      from public.gaxeta_devices d where d.origin = 'esp32';
  else
    select coalesce(jsonb_agg(to_jsonb(d) order by d.last_received_at desc nulls last), '[]'::jsonb) into v
      from public.gaxeta_devices d where d.origin = 'esp32' and d.sensor_id = any (p_sensor_ids);
  end if;
  return jsonb_build_object('server_time', now(), 'devices', v);
end $function$;

-- Árvore sob demanda: filhos de um nó (ou as raízes visíveis), paginados.
create function public.gaxeta_assets_children(p_parent_id uuid default null, p_limit integer default 100, p_offset integer default 0)
 returns jsonb language plpgsql stable set search_path to '' set plan_cache_mode to force_custom_plan as $function$
declare v_total bigint; v_items jsonb; v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 500); v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  -- Pagina primeiro; colunas caras (filhos, decisão de acesso) só para a página devolvida.
  if p_parent_id is null then
    select count(*) into v_total from public.gaxeta_assets a where a.parent_id is null;
    select coalesce(jsonb_agg(to_jsonb(x) order by x.kind, lower(x.name), x.id), '[]'::jsonb) into v_items from (
      select pg.*, exists (select 1 from public.gaxeta_assets k where k.parent_id = pg.id) as has_children, gaxeta_authz.asset_access(pg.id) as access
        from (select a.id, a.parent_id, a.kind, a.name, a.tag, a."position", a.corporation_id from public.gaxeta_assets a
               where a.parent_id is null order by a.kind, lower(a.name), a.id limit v_limit offset v_offset) pg) x;
  else
    select count(*) into v_total from public.gaxeta_assets a where a.parent_id = p_parent_id;
    select coalesce(jsonb_agg(to_jsonb(x) order by x.kind, lower(x.name), x.id), '[]'::jsonb) into v_items from (
      select pg.*, exists (select 1 from public.gaxeta_assets k where k.parent_id = pg.id) as has_children, gaxeta_authz.asset_access(pg.id) as access
        from (select a.id, a.parent_id, a.kind, a.name, a.tag, a."position", a.corporation_id from public.gaxeta_assets a
               where a.parent_id = p_parent_id order by a.kind, lower(a.name), a.id limit v_limit offset v_offset) pg) x;
  end if;
  return jsonb_build_object('total', v_total, 'items', v_items);
end $function$;

-- Busca por nome ou TAG dentro do que quem chama pode ver.
create function public.gaxeta_assets_search(p_query text, p_limit integer default 50)
 returns jsonb language plpgsql stable set search_path to '' set plan_cache_mode to force_custom_plan as $function$
declare v jsonb; v_q text := trim(coalesce(p_query, ''));
begin
  if length(v_q) < 2 then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by lower(x.name), x.id), '[]'::jsonb) into v from (
    select m.id, m.parent_id, m.kind, m.name, m.tag, m.corporation_id,
           (select jsonb_agg(p.name order by o.ord) from unnest(m.path) with ordinality o(id, ord)
              join public.gaxeta_assets p on p.id = o.id) as path_names
      from (select a.* from public.gaxeta_assets a
             where a.name ilike '%' || v_q || '%' or a.tag ilike '%' || v_q || '%'
             order by lower(a.name), a.id limit least(greatest(coalesce(p_limit, 50), 1), 200)) m) x;
  return v;
end $function$;

-- Sensores paginados por ramo, busca e fila sem vínculo (esta, só administradores veem).
create function public.gaxeta_devices_page(p_asset_id uuid default null, p_search text default null, p_unlinked boolean default false, p_limit integer default 50, p_offset integer default 0)
 returns jsonb language plpgsql stable set search_path to '' set plan_cache_mode to force_custom_plan as $function$
declare v_total bigint; v_items jsonb; v_q text := nullif(trim(coalesce(p_search, '')), '');
        v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 200); v_offset integer := greatest(coalesce(p_offset, 0), 0);
        v_sql text := $q$ from public.gaxeta_devices d where d.origin = 'esp32'$q$;
begin
  -- Só os filtros pedidos entram no SQL (valores sempre por parâmetro).
  if coalesce(p_unlinked, false) then v_sql := v_sql || ' and d.measurement_point_id is null'; end if;
  if p_asset_id is not null then
    v_sql := v_sql || ' and d.measurement_point_id in (select a.id from public.gaxeta_assets a where a.path @> array[$1])';
  end if;
  if v_q is not null then
    v_sql := v_sql || $q$ and (d.sensor_id ilike '%' || $2 || '%' or d.label ilike '%' || $2 || '%' or d.wifi_mac ilike '%' || $2 || '%' or d.ble_mac ilike '%' || $2 || '%')$q$;
  end if;
  execute 'select count(*)' || v_sql into v_total using p_asset_id, v_q;
  execute $q$select coalesce(jsonb_agg(to_jsonb(x) order by x.label, x.sensor_id), '[]'::jsonb) from (select d.*$q$ || v_sql
       || ' order by d.label, d.sensor_id limit $3 offset $4) x' into v_items using p_asset_id, v_q, v_limit, v_offset;
  return jsonb_build_object('server_time', now(), 'total', v_total, 'items', v_items);
end $function$;

-- Busca textual em grande volume (nome e TAG de ativos). Nenhum índice novo em
-- gaxeta_devices, gaxeta_readings ou gaxeta_movements.
create extension if not exists pg_trgm with schema extensions;
create index gaxeta_assets_name_trgm on public.gaxeta_assets using gin (name extensions.gin_trgm_ops);
create index gaxeta_assets_tag_trgm on public.gaxeta_assets using gin (tag extensions.gin_trgm_ops);
create index gaxeta_assets_roots_idx on public.gaxeta_assets (kind, lower(name), id) where parent_id is null;

revoke all on function public.gaxeta_devices_status(text[]), public.gaxeta_assets_children(uuid, integer, integer),
  public.gaxeta_assets_search(text, integer), public.gaxeta_devices_page(uuid, text, boolean, integer, integer) from public, anon;
grant execute on function public.gaxeta_devices_status(text[]), public.gaxeta_assets_children(uuid, integer, integer),
  public.gaxeta_assets_search(text, integer), public.gaxeta_devices_page(uuid, text, boolean, integer, integer) to authenticated, service_role;

commit;
