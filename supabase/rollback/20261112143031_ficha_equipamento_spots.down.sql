-- =============================================================================
-- REVERSÃO da migração 07 · ficha de equipamento, nomes de Spot e busca por TAG
-- Pontual: não mexe em ativos, vínculos, leituras, usuários nem concessões.
-- ATENÇÃO: descarta as fichas técnicas gravadas (gaxeta_equipment_details).
-- TAGs e spots criados continuam na árvore; nomes de spot já normalizados
-- (LOA, LA, UNICO) permanecem como estão. O site novo depende desta migração
-- para a ficha do TAG; o pacote anterior segue funcionando sem ela.
-- Depois de aplicar, remover a linha da versão em supabase_migrations.schema_migrations.
-- =============================================================================
begin;
set local lock_timeout = '5s';

drop function public.gaxeta_equipment_overview(uuid);
drop function public.gaxeta_save_equipment(uuid, uuid, text, jsonb);
drop function gaxeta_private.detail_text(jsonb, text, text, integer);
drop function gaxeta_private.detail_count(jsonb, text, text);

drop trigger gaxeta_asset_point_name on public.gaxeta_assets;
drop function gaxeta_private.point_name_guard();
drop function gaxeta_private.spot_name_canonical(text);

drop table public.gaxeta_equipment_details;
drop function gaxeta_private.equipment_details_guard();
drop table public.gaxeta_equipment_types;

-- Corpo da migração 06 (busca só por identificador, nome e MAC do sensor).
create or replace function public.gaxeta_devices_page(p_asset_id uuid default null, p_search text default null, p_unlinked boolean default false, p_limit integer default 50, p_offset integer default 0)
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

commit;
