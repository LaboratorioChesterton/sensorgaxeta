-- =============================================================================
-- REVERSÃO da migração 05 · corte de acesso
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- Volta à verificação global do piloto. Só acessa quem está em gaxeta_private.platform_members
-- (as contas administrativas mapeadas). Usuários de corporação ficam SEM acesso: a reversão
-- fecha, não abre leitura entre corporações.
drop policy scope_assets_select on public.gaxeta_assets;
drop policy scope_assets_delete on public.gaxeta_assets;
drop policy scope_gateways_select on public.gaxeta_gateways;
drop policy scope_gateways_insert on public.gaxeta_gateways;
drop policy scope_gateways_delete on public.gaxeta_gateways;
drop policy scope_devices_select on public.gaxeta_devices;
drop policy scope_readings_select on public.gaxeta_readings;
drop policy scope_movements_select on public.gaxeta_movements;
drop trigger gaxeta_asset_delete_guard on public.gaxeta_assets;
drop trigger gaxeta_gateway_delete_guard on public.gaxeta_gateways;
drop function gaxeta_private.delete_guard();

create or replace function public.gaxeta_has_access()
 returns boolean
 language sql
 stable security definer
 set search_path to ''
as $function$
 select exists(select 1 from auth.users u join gaxeta_private.platform_members m on m.email=lower(u.email)
 where u.id=auth.uid() and u.email_confirmed_at is not null and m.enabled)
$function$;
grant execute on function public.gaxeta_has_access() to anon;

create policy member_assets on public.gaxeta_assets for all to authenticated
  using (public.gaxeta_has_access()) with check (public.gaxeta_has_access());
create policy member_gateways on public.gaxeta_gateways for all to authenticated
  using (public.gaxeta_has_access()) with check (public.gaxeta_has_access());
create policy member_devices on public.gaxeta_devices for select to authenticated
  using (public.gaxeta_has_access() and origin = 'esp32'::text);
create policy member_readings on public.gaxeta_readings for select to authenticated
  using (public.gaxeta_has_access() and exists (select 1 from public.gaxeta_devices d
    where d.sensor_id = gaxeta_readings.sensor_id and d.origin = 'esp32'::text));
create policy member_movements on public.gaxeta_movements for select to authenticated
  using (public.gaxeta_has_access() and exists (select 1 from public.gaxeta_devices d
    where d.sensor_id = gaxeta_movements.sensor_id and d.origin = 'esp32'::text));

revoke all on public.gaxeta_assets, public.gaxeta_gateways, public.gaxeta_devices,
  public.gaxeta_readings, public.gaxeta_movements from anon, authenticated;
grant all on public.gaxeta_assets, public.gaxeta_gateways to authenticated;
grant select on public.gaxeta_devices, public.gaxeta_readings to anon, authenticated;
grant select on public.gaxeta_movements to authenticated;
commit;
