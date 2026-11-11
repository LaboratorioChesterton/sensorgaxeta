-- =============================================================================
-- 05 · CORTE: acesso por papel e escopo
-- Troca, numa única transação, a verificação global por e-mail pelo modelo de
-- papel + concessão por ramo. As políticas antigas (member_*) são removidas no
-- mesmo passo: políticas permissivas se combinam por OR e reabririam a leitura
-- geral. Não toca em gaxeta_ingest, gaxeta_ingest_v3 nem em seus privilégios.
-- =============================================================================
begin;
set local lock_timeout = '5s';

do $$
begin
  if not exists (select 1 from gaxeta_private.user_profiles where global_role = 'adm1' and status = 'active') then
    raise exception 'Corte abortado: não há administrador de nível 1 ativo mapeado por UUID';
  end if;
end $$;

-- Contrato de abertura de sessão do cliente atual: mesma função, mesmo retorno
-- booleano; agora responde pelo cadastro ativo de quem chama (auth.uid()).
create or replace function public.gaxeta_has_access()
 returns boolean language sql stable security definer set search_path to '' as $function$
  select gaxeta_authz.my_role() is not null
$function$;
revoke execute on function public.gaxeta_has_access() from public, anon;

-- ---------------------------------------------------------------------------
-- Exclusão definitiva: autoridade de nível 1, validada no servidor também para
-- o DELETE direto que o pacote publicado ainda faz. Sem JWT (manutenção pelo
-- dono do banco), o gatilho não interfere.
-- ---------------------------------------------------------------------------
create function gaxeta_private.delete_guard()
 returns trigger language plpgsql security definer set search_path to '' as $function$
begin
  if auth.uid() is not null and gaxeta_authz.my_role() is distinct from 'adm1' then
    raise insufficient_privilege;
  end if;
  return old;
end $function$;
revoke all on function gaxeta_private.delete_guard() from public, anon, authenticated, service_role;
create trigger gaxeta_asset_delete_guard before delete on public.gaxeta_assets
  for each row execute function gaxeta_private.delete_guard();
create trigger gaxeta_gateway_delete_guard before delete on public.gaxeta_gateways
  for each row execute function gaxeta_private.delete_guard();

-- ---------------------------------------------------------------------------
-- Políticas
-- ---------------------------------------------------------------------------
drop policy member_assets on public.gaxeta_assets;
drop policy member_gateways on public.gaxeta_gateways;
drop policy member_devices on public.gaxeta_devices;
drop policy member_readings on public.gaxeta_readings;
drop policy member_movements on public.gaxeta_movements;

-- Ativos: administradores veem tudo; usuário de corporação vê o que tem acesso e
-- os ancestrais que servem de caminho. Escrita só por RPC (sem INSERT/UPDATE direto).
create policy scope_assets_select on public.gaxeta_assets for select to authenticated
  using ((select gaxeta_authz.is_global_reader()) or id in (select gaxeta_authz.visible_asset_ids()));
create policy scope_assets_delete on public.gaxeta_assets for delete to authenticated
  using ((select gaxeta_authz.is_global_reader()) or id in (select gaxeta_authz.visible_asset_ids()));

-- Gateways: dados da empresa; exigem acesso efetivo à empresa.
create policy scope_gateways_select on public.gaxeta_gateways for select to authenticated
  using ((select gaxeta_authz.is_global_reader()) or company_id in (select gaxeta_authz.accessible_asset_ids()));
create policy scope_gateways_insert on public.gaxeta_gateways for insert to authenticated
  with check ((select gaxeta_authz.my_role()) in ('adm1', 'adm2'));
create policy scope_gateways_delete on public.gaxeta_gateways for delete to authenticated
  using ((select gaxeta_authz.is_global_reader()));

-- Dispositivos: fila sem vínculo só para administradores.
create policy scope_devices_select on public.gaxeta_devices for select to authenticated
  using (origin = 'esp32'::text and ((select gaxeta_authz.is_global_reader())
         or measurement_point_id in (select gaxeta_authz.accessible_asset_ids())));

-- Leituras e movimentos: administradores como hoje; usuário de corporação, só o
-- período em que o sensor esteve num spot do seu escopo. O teste por conjunto
-- (hash) descarta de imediato sensores fora do escopo; a janela decide o resto.
create policy scope_readings_select on public.gaxeta_readings for select to authenticated
  using (((select gaxeta_authz.is_global_reader())
          and exists (select 1 from public.gaxeta_devices d where d.sensor_id = gaxeta_readings.sensor_id and d.origin = 'esp32'::text))
      or (sensor_id in (select w.sensor_id from gaxeta_authz.visible_link_windows() w)
          and exists (select 1 from gaxeta_authz.visible_link_windows() w
                  where w.sensor_id = gaxeta_readings.sensor_id and gaxeta_readings.received_at >= w.from_ts
                    and (w.to_ts is null or gaxeta_readings.received_at < w.to_ts))));
create policy scope_movements_select on public.gaxeta_movements for select to authenticated
  using (((select gaxeta_authz.is_global_reader())
          and exists (select 1 from public.gaxeta_devices d where d.sensor_id = gaxeta_movements.sensor_id and d.origin = 'esp32'::text))
      or (sensor_id in (select w.sensor_id from gaxeta_authz.visible_link_windows() w)
          and exists (select 1 from gaxeta_authz.visible_link_windows() w
                  where w.sensor_id = gaxeta_movements.sensor_id and gaxeta_movements.received_at >= w.from_ts
                    and (w.to_ts is null or gaxeta_movements.received_at < w.to_ts))));

-- ---------------------------------------------------------------------------
-- Privilégios de tabela: só o necessário para a API
-- ---------------------------------------------------------------------------
revoke all on public.gaxeta_assets, public.gaxeta_gateways, public.gaxeta_devices,
  public.gaxeta_readings, public.gaxeta_movements from anon, authenticated;
grant select, delete on public.gaxeta_assets to authenticated;
grant select, insert, delete on public.gaxeta_gateways to authenticated;
grant select on public.gaxeta_devices, public.gaxeta_readings, public.gaxeta_movements to authenticated;

commit;
