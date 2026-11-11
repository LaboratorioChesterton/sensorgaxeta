-- =============================================================================
-- REVERSÃO da migração 01 · estrutura da hierarquia
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- ATENÇÃO: descarta o histórico de vínculos e a trilha de auditoria (exportar antes).
-- A regra antiga exige subárea: se já houver equipamento direto na área, a reversão
-- é recusada, porque esses TAGs ficariam fora do que a regra e a interface antigas aceitam.
do $$
begin
  if exists (select 1 from public.gaxeta_assets e join public.gaxeta_assets p on p.id = e.parent_id
              where e.kind = 'equipment' and p.kind = 'area') then
    raise exception 'Reversão recusada: há equipamentos direto na área. Mova-os para uma subárea antes.';
  end if;
end $$;
drop trigger gaxeta_gateway_audit on public.gaxeta_gateways;
drop trigger gaxeta_asset_audit on public.gaxeta_assets;
drop trigger gaxeta_device_config_audit on public.gaxeta_devices;
drop function gaxeta_private.gateway_changed();
drop function gaxeta_private.asset_changed();
drop function gaxeta_private.device_config_changed();
drop table gaxeta_private.device_links;
drop index public.gaxeta_devices_gateway_idx;
drop index public.gaxeta_gateways_company_idx;
-- Corpos de produção de 11/11/2026.
create or replace function public.gaxeta_validate_asset()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
declare expected text; actual text;
begin
 expected := case new.kind when 'company' then 'corporation' when 'area' then 'company'
 when 'subarea' then 'area' when 'equipment' then 'subarea' when 'point' then 'equipment' end;
 if tg_op='UPDATE' and new.kind<>old.kind then raise exception 'O nível do ativo não pode ser alterado'; end if;
 if expected is not null then
   select kind into actual from public.gaxeta_assets where id=new.parent_id;
   if actual is distinct from expected then raise exception 'Nível superior incompatível: esperado %',expected; end if;
 end if;
 return new;
end $function$;
create or replace function public.gaxeta_validate_asset_links()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
 if exists(
 with recursive paths as (
 select d.sensor_id,d.gateway_id,a.id,a.parent_id,a.kind from public.gaxeta_devices d join public.gaxeta_assets a on a.id=d.measurement_point_id where d.gateway_id is not null
 union all select p.sensor_id,p.gateway_id,a.id,a.parent_id,a.kind from paths p join public.gaxeta_assets a on a.id=p.parent_id
 ) select 1 from paths p join public.gaxeta_gateways g on g.id=p.gateway_id where p.kind='company' and p.id<>g.company_id
 ) then raise exception 'Desvincule o gateway antes de mover o sensor para outra empresa'; end if;
 return new;
end $function$;
create or replace function public.gaxeta_validate_gateway()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
 if (select kind from public.gaxeta_assets where id=new.company_id) is distinct from 'company' then
 raise exception 'O gateway precisa pertencer a uma empresa'; end if;
 return new;
end $function$;
alter table public.gaxeta_assets drop constraint gaxeta_assets_path_check;
drop index public.gaxeta_assets_path_gin;
drop index public.gaxeta_assets_corporation_idx;
alter table public.gaxeta_assets drop column path, drop column corporation_id;
drop function gaxeta_private.audit(text, text, text, uuid, jsonb);
drop table gaxeta_private.audit_log;
commit;
