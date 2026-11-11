-- =============================================================================
-- REVERSÃO da migração 03 · contratos de escrita
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

drop function public.gaxeta_link_sensor(text, uuid, text);
drop function public.gaxeta_unlink_sensor(text, text);
drop function public.gaxeta_set_sensor_gateway(text, uuid);
drop function public.gaxeta_rename_sensor(text, text);
drop function public.gaxeta_delete_asset(uuid, text);
drop function public.gaxeta_asset_dependencies(uuid);
drop function public.gaxeta_save_corporation(uuid, text, text, text, text, text);
drop function public.gaxeta_save_gateway(uuid, uuid, text, text);
drop function public.gaxeta_delete_gateway(uuid);
-- Corpos de produção de 11/11/2026 (inclusive o defeito conhecido: salvar ponto apaga o gateway).
create or replace function public.gaxeta_configure_sensor(p_sensor_id text, p_label text, p_point_id uuid default null::uuid, p_gateway_id uuid default null::uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare d public.gaxeta_devices%rowtype; point_company uuid; gateway_company uuid;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if p_label !~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then raise exception 'Nome: 3 a 24 caracteres, letras sem acento, números, espaço, ponto, hífen ou sublinhado'; end if;
 if p_point_id is not null then
 if (select kind from public.gaxeta_assets where id=p_point_id) is distinct from 'point' then raise exception 'Selecione um ponto de medição'; end if;
 with recursive ancestors as (
 select id,parent_id,kind from public.gaxeta_assets where id=p_point_id
 union all select a.id,a.parent_id,a.kind from public.gaxeta_assets a join ancestors b on a.id=b.parent_id
 ) select id into point_company from ancestors where kind='company';
 end if;
 if p_gateway_id is not null then
 select company_id into gateway_company from public.gaxeta_gateways where id=p_gateway_id;
 if gateway_company is null then raise exception 'Gateway inexistente'; end if;
 if point_company is not null and gateway_company<>point_company then raise exception 'Gateway e ponto devem pertencer à mesma empresa'; end if;
 end if;
 update public.gaxeta_devices set label=p_label,desired_label=p_label,measurement_point_id=p_point_id,
 gateway_id=p_gateway_id,config_updated_at=now() where sensor_id=p_sensor_id and origin='esp32' returning * into d;
 if not found then raise exception 'Sensor não registrado: aguarde a primeira transmissão'; end if;
 return to_jsonb(d);
end $function$;
create or replace function public.gaxeta_save_asset(p_id uuid, p_parent_id uuid, p_kind text, p_name text, p_tag text, p_position text, p_sensor_id text default null::text, p_sensor_label text default null::text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare a public.gaxeta_assets%rowtype; d public.gaxeta_devices%rowtype;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if nullif(trim(p_name),'') is null then raise exception 'Informe o nome do ativo'; end if;
 if p_id is null then
 insert into public.gaxeta_assets(parent_id,kind,name,tag,position) values(p_parent_id,p_kind,trim(p_name),coalesce(p_tag,''),coalesce(p_position,'')) returning * into a;
 else
 update public.gaxeta_assets set parent_id=p_parent_id,kind=p_kind,name=trim(p_name),tag=coalesce(p_tag,''),position=coalesce(p_position,'') where id=p_id returning * into a;
 if not found then raise exception 'Ativo não encontrado'; end if;
 end if;
 if p_sensor_id is not null then
 if a.kind<>'point' then raise exception 'O sensor deve ser vinculado a um ponto de medição'; end if;
 select * into d from public.gaxeta_devices where sensor_id=p_sensor_id for update;
 if not found then raise exception 'Sensor não encontrado'; end if;
 perform public.gaxeta_configure_sensor(p_sensor_id,coalesce(nullif(trim(p_sensor_label),''),d.desired_label,d.label),a.id,null);
 end if;
 return to_jsonb(a);
end $function$;
drop function gaxeta_private.set_sensor(text, text, boolean, uuid, boolean, uuid, text);
commit;
