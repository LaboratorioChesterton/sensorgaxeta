-- =============================================================================
-- 01 · Estrutura da hierarquia, proveniência de vínculos e trilha de auditoria
-- Aditiva. Não altera ingestão, leituras, movimentos nem políticas de acesso.
--   * equipamento passa a aceitar pai 'area' OU 'subarea' (subárea opcional);
--   * caminho materializado (path) e corporação derivada no servidor;
--   * escrita estrutural serializada por corporação (sem ciclos nem caminhos
--     inconsistentes sob movimentações concorrentes);
--   * histórico de vínculos sensor–spot e trilha de auditoria por gatilho.
-- =============================================================================
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- ---------------------------------------------------------------------------
-- Trilha de auditoria (privada; leitura somente por RPC administrativa)
-- ---------------------------------------------------------------------------
create table gaxeta_private.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default clock_timestamp(),
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id text,
  corporation_id uuid,
  details jsonb not null default '{}'::jsonb
);
create index audit_log_at_idx on gaxeta_private.audit_log (at desc);
create index audit_log_target_idx on gaxeta_private.audit_log (target_type, target_id);
create index audit_log_corp_idx on gaxeta_private.audit_log (corporation_id, at desc);
alter table gaxeta_private.audit_log enable row level security;
revoke all on gaxeta_private.audit_log from public, anon, authenticated, service_role;

create function gaxeta_private.audit(p_action text, p_target_type text, p_target_id text, p_corporation_id uuid, p_details jsonb)
 returns void language sql security definer set search_path to '' as $$
  insert into gaxeta_private.audit_log(actor_id, action, target_type, target_id, corporation_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_corporation_id,
          coalesce(p_details, '{}'::jsonb)
          || case when nullif(current_setting('gaxeta.reason', true), '') is null then '{}'::jsonb
                  else jsonb_build_object('reason', current_setting('gaxeta.reason', true)) end);
$$;
revoke all on function gaxeta_private.audit(text, text, text, uuid, jsonb) from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Caminho materializado e corporação derivada
-- ---------------------------------------------------------------------------
alter table public.gaxeta_assets add column path uuid[], add column corporation_id uuid;

with recursive t as (
  select id, array[id] as path from public.gaxeta_assets where parent_id is null
  union all
  select a.id, t.path || a.id from public.gaxeta_assets a join t on a.parent_id = t.id
)
update public.gaxeta_assets a set path = t.path, corporation_id = t.path[1] from t where a.id = t.id;

do $$
begin
  if exists (select 1 from public.gaxeta_assets where path is null) then
    raise exception 'Backfill incompleto: há ativos sem caminho até uma corporação (órfãos ou ciclo)';
  end if;
end $$;

alter table public.gaxeta_assets
  alter column path set not null,
  alter column corporation_id set not null,
  add constraint gaxeta_assets_path_check check (path[cardinality(path)] = id and path[1] = corporation_id);
create index gaxeta_assets_path_gin on public.gaxeta_assets using gin (path);
create index gaxeta_assets_corporation_idx on public.gaxeta_assets (corporation_id);

-- Validação de hierarquia (mesmo gatilho gaxeta_asset_hierarchy; corpo substituído).
create or replace function public.gaxeta_validate_asset()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare p public.gaxeta_assets%rowtype; ok boolean;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id then raise exception 'O identificador do ativo não pode ser alterado'; end if;
    if new.kind <> old.kind then raise exception 'O nível do ativo não pode ser alterado'; end if;
    if new.parent_id is not distinct from old.parent_id then
      -- Campos derivados só mudam pela cascata interna (gatilho aninhado).
      if pg_trigger_depth() = 1 then new.path := old.path; new.corporation_id := old.corporation_id; end if;
      return new;
    end if;
  end if;
  if new.kind = 'corporation' then
    if new.parent_id is not null then raise exception 'Corporação não pode ter nível superior'; end if;
    new.path := array[new.id]; new.corporation_id := new.id;
    return new;
  end if;
  if new.parent_id is null then raise exception 'Informe o nível superior'; end if;
  select * into p from public.gaxeta_assets where id = new.parent_id;
  if not found then raise exception 'Nível superior inexistente'; end if;
  if tg_op = 'UPDATE' and p.corporation_id <> old.corporation_id then
    raise exception 'Transferência entre corporações não é permitida nesta etapa';
  end if;
  -- Serializa escritas estruturais da mesma corporação e relê o pai já sob o bloqueio.
  perform pg_advisory_xact_lock(hashtextextended('gaxeta_tree:' || p.corporation_id::text, 0));
  select * into p from public.gaxeta_assets where id = new.parent_id;
  if not found then raise exception 'Nível superior inexistente'; end if;
  ok := case new.kind
          when 'company'   then p.kind = 'corporation'
          when 'area'      then p.kind = 'company'
          when 'subarea'   then p.kind = 'area'
          when 'equipment' then p.kind in ('area', 'subarea')
          when 'point'     then p.kind = 'equipment'
        end;
  if not coalesce(ok, false) then
    raise exception 'Nível superior incompatível: % não pode ficar sob %', new.kind, p.kind;
  end if;
  if tg_op = 'UPDATE' then
    if p.corporation_id <> old.corporation_id then
      raise exception 'Transferência entre corporações não é permitida nesta etapa';
    end if;
    if p.path @> array[new.id] then raise exception 'A movimentação criaria um ciclo'; end if;
  end if;
  new.path := p.path || new.id;
  new.corporation_id := p.corporation_id;
  return new;
end $function$;

-- Após mover um nó: propaga o caminho aos descendentes e valida gateways da empresa
-- (mesmo gatilho gaxeta_asset_link_consistency; corpo substituído).
create or replace function public.gaxeta_validate_asset_links()
 returns trigger language plpgsql security definer set search_path to '' as $function$
begin
  update public.gaxeta_assets c
     set path = new.path || c.path[array_position(c.path, new.id) + 1 :],
         corporation_id = new.corporation_id
   where c.path @> array[new.id] and c.id <> new.id;
  if exists (
    select 1 from public.gaxeta_devices d
      join public.gaxeta_assets pt on pt.id = d.measurement_point_id
      join public.gaxeta_gateways g on g.id = d.gateway_id
     where pt.path @> array[new.id] and not (pt.path @> array[g.company_id])
  ) then
    raise exception 'Desvincule o gateway antes de mover o sensor para outra empresa';
  end if;
  return new;
end $function$;

-- Gateway sempre sob empresa; mudança de empresa não pode deixar sensores em outra.
create or replace function public.gaxeta_validate_gateway()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare c public.gaxeta_assets%rowtype; o public.gaxeta_assets%rowtype;
begin
  select * into c from public.gaxeta_assets where id = new.company_id;
  if c.kind is distinct from 'company' then raise exception 'O gateway precisa pertencer a uma empresa'; end if;
  if tg_op = 'UPDATE' and new.company_id <> old.company_id then
    select * into o from public.gaxeta_assets where id = old.company_id;
    if o.corporation_id <> c.corporation_id then
      raise exception 'Transferência entre corporações não é permitida nesta etapa';
    end if;
    if exists (select 1 from public.gaxeta_devices d join public.gaxeta_assets pt on pt.id = d.measurement_point_id
                where d.gateway_id = new.id and not (pt.path @> array[new.company_id])) then
      raise exception 'Há sensores de outra empresa vinculados a este gateway';
    end if;
  end if;
  return new;
end $function$;

-- ---------------------------------------------------------------------------
-- Histórico de vínculos sensor–spot (proveniência)
-- ---------------------------------------------------------------------------
create table gaxeta_private.device_links (
  id bigint generated always as identity primary key,
  sensor_id text not null references public.gaxeta_devices(sensor_id),
  point_id uuid not null references public.gaxeta_assets(id) on delete restrict,
  linked_at timestamptz not null default clock_timestamp(),
  unlinked_at timestamptz,
  linked_by uuid,
  unlinked_by uuid,
  link_reason text,
  unlink_reason text,
  constraint device_links_period_check check (unlinked_at is null or unlinked_at >= linked_at)
);
create unique index device_links_open_sensor_key on gaxeta_private.device_links (sensor_id) where unlinked_at is null;
create unique index device_links_open_point_key on gaxeta_private.device_links (point_id) where unlinked_at is null;
create index device_links_point_idx on gaxeta_private.device_links (point_id);
create index device_links_sensor_idx on gaxeta_private.device_links (sensor_id, linked_at);
alter table gaxeta_private.device_links enable row level security;
revoke all on gaxeta_private.device_links from public, anon, authenticated, service_role;

-- Vínculos existentes entram no histórico a partir de agora (leituras anteriores
-- ao primeiro vínculo permanecem restritas aos administradores).
insert into gaxeta_private.device_links (sensor_id, point_id, linked_at, link_reason)
select d.sensor_id, d.measurement_point_id, coalesce(d.config_updated_at, now()), 'backfill da migração 01'
  from public.gaxeta_devices d where d.measurement_point_id is not null;

-- Dispara somente quando o UPDATE cita measurement_point_id, label, desired_label ou
-- gateway_id. As funções de ingestão não citam essas colunas: o gatilho não é enfileirado.
create function gaxeta_private.device_config_changed()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_now timestamptz := clock_timestamp(); v_reason text := nullif(current_setting('gaxeta.reason', true), '');
        v_corp uuid;
begin
  if new.measurement_point_id is distinct from old.measurement_point_id then
    if old.measurement_point_id is not null then
      update gaxeta_private.device_links set unlinked_at = v_now, unlinked_by = auth.uid(), unlink_reason = v_reason
       where sensor_id = new.sensor_id and unlinked_at is null;
    end if;
    if new.measurement_point_id is not null then
      insert into gaxeta_private.device_links (sensor_id, point_id, linked_at, linked_by, link_reason)
      values (new.sensor_id, new.measurement_point_id, v_now, auth.uid(), v_reason);
    end if;
    select corporation_id into v_corp from public.gaxeta_assets
     where id = coalesce(new.measurement_point_id, old.measurement_point_id);
    perform gaxeta_private.audit(
      case when old.measurement_point_id is null then 'sensor.link'
           when new.measurement_point_id is null then 'sensor.unlink' else 'sensor.move' end,
      'sensor', new.sensor_id, v_corp,
      jsonb_build_object('from_point', old.measurement_point_id, 'to_point', new.measurement_point_id));
  end if;
  if new.gateway_id is distinct from old.gateway_id then
    select corporation_id into v_corp from public.gaxeta_assets where id = new.measurement_point_id;
    perform gaxeta_private.audit('sensor.gateway', 'sensor', new.sensor_id, v_corp,
      jsonb_build_object('from_gateway', old.gateway_id, 'to_gateway', new.gateway_id));
  end if;
  if new.label is distinct from old.label or new.desired_label is distinct from old.desired_label then
    select corporation_id into v_corp from public.gaxeta_assets where id = new.measurement_point_id;
    perform gaxeta_private.audit('sensor.rename', 'sensor', new.sensor_id, v_corp,
      jsonb_build_object('from_label', old.label, 'to_label', new.label));
  end if;
  return null;
end $function$;
revoke all on function gaxeta_private.device_config_changed() from public, anon, authenticated, service_role;
create trigger gaxeta_device_config_audit
  after update of measurement_point_id, gateway_id, label, desired_label on public.gaxeta_devices
  for each row execute function gaxeta_private.device_config_changed();

-- Auditoria de ativos e gateways (cobre RPCs e escrita direta pela API).
create function gaxeta_private.asset_changed()
 returns trigger language plpgsql security definer set search_path to '' as $function$
begin
  if tg_op = 'INSERT' then
    perform gaxeta_private.audit('asset.create', 'asset', new.id::text, new.corporation_id,
      jsonb_build_object('kind', new.kind, 'name', new.name, 'tag', new.tag, 'parent_id', new.parent_id));
  elsif tg_op = 'DELETE' then
    perform gaxeta_private.audit('asset.delete', 'asset', old.id::text, old.corporation_id,
      jsonb_build_object('kind', old.kind, 'name', old.name, 'tag', old.tag, 'parent_id', old.parent_id));
  elsif pg_trigger_depth() = 1 and (new.name, new.tag, new."position", new.parent_id)
        is distinct from (old.name, old.tag, old."position", old.parent_id) then
    perform gaxeta_private.audit(case when new.parent_id is distinct from old.parent_id then 'asset.move' else 'asset.update' end,
      'asset', new.id::text, new.corporation_id,
      jsonb_build_object('kind', new.kind,
        'before', jsonb_build_object('name', old.name, 'tag', old.tag, 'position', old."position", 'parent_id', old.parent_id),
        'after',  jsonb_build_object('name', new.name, 'tag', new.tag, 'position', new."position", 'parent_id', new.parent_id)));
  end if;
  return null;
end $function$;
revoke all on function gaxeta_private.asset_changed() from public, anon, authenticated, service_role;
create trigger gaxeta_asset_audit after insert or update or delete on public.gaxeta_assets
  for each row execute function gaxeta_private.asset_changed();

create function gaxeta_private.gateway_changed()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_corp uuid;
begin
  select corporation_id into v_corp from public.gaxeta_assets
   where id = case when tg_op = 'DELETE' then old.company_id else new.company_id end;
  if tg_op = 'INSERT' then
    perform gaxeta_private.audit('gateway.create', 'gateway', new.id::text, v_corp,
      jsonb_build_object('name', new.name, 'identifier', new.identifier, 'company_id', new.company_id));
  elsif tg_op = 'DELETE' then
    perform gaxeta_private.audit('gateway.delete', 'gateway', old.id::text, v_corp,
      jsonb_build_object('name', old.name, 'identifier', old.identifier, 'company_id', old.company_id));
  elsif (new.name, new.identifier, new.company_id) is distinct from (old.name, old.identifier, old.company_id) then
    perform gaxeta_private.audit('gateway.update', 'gateway', new.id::text, v_corp,
      jsonb_build_object('before', jsonb_build_object('name', old.name, 'identifier', old.identifier, 'company_id', old.company_id),
                         'after',  jsonb_build_object('name', new.name, 'identifier', new.identifier, 'company_id', new.company_id)));
  end if;
  return null;
end $function$;
revoke all on function gaxeta_private.gateway_changed() from public, anon, authenticated, service_role;
create trigger gaxeta_gateway_audit after insert or update or delete on public.gaxeta_gateways
  for each row execute function gaxeta_private.gateway_changed();

-- Índices das FKs apontadas pelo consultor de desempenho.
create index gaxeta_devices_gateway_idx on public.gaxeta_devices (gateway_id) where gateway_id is not null;
create index gaxeta_gateways_company_idx on public.gaxeta_gateways (company_id);

commit;
