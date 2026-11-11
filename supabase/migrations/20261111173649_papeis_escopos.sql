-- =============================================================================
-- 02 · Papéis, vínculo com corporação e concessões por ramo
-- Aditiva. Cria o modelo de autorização por auth.uid(); ainda NÃO troca as
-- políticas de leitura (isso acontece na migração 05, o corte).
--   Papéis globais: adm1, adm2, adm3. Usuário comum: vinculado a uma corporação.
--   Concessão por ramo: 'all' (Todos: o nó e descendentes atuais e futuros) ou
--   'none' (Nenhum). Vale a concessão do ancestral mais próximo; sem concessão,
--   o acesso é negado. "Selecionar" = concessões 'all' nos filhos escolhidos.
-- =============================================================================
begin;
set local lock_timeout = '5s';

create table gaxeta_private.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (email = lower(email)),
  display_name text not null default '',
  global_role text check (global_role in ('adm1', 'adm2', 'adm3')),
  corporation_id uuid references public.gaxeta_assets(id) on delete restrict,
  can_write boolean not null default false,
  status text not null default 'active' check (status in ('active', 'disabled')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint user_profiles_kind_check check ((global_role is not null) <> (corporation_id is not null)),
  constraint user_profiles_admin_write_check check (global_role is null or can_write = false)
);
create index user_profiles_corporation_idx on gaxeta_private.user_profiles (corporation_id);
create index user_profiles_email_idx on gaxeta_private.user_profiles (email);

create table gaxeta_private.access_grants (
  user_id uuid not null references gaxeta_private.user_profiles(user_id) on delete cascade,
  asset_id uuid not null references public.gaxeta_assets(id) on delete cascade,
  mode text not null check (mode in ('all', 'none')),
  created_at timestamptz not null default now(),
  created_by uuid,
  primary key (user_id, asset_id)
);
create index access_grants_asset_idx on gaxeta_private.access_grants (asset_id);

create table gaxeta_private.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  global_role text check (global_role in ('adm1', 'adm2', 'adm3')),
  corporation_id uuid references public.gaxeta_assets(id) on delete restrict,
  can_write boolean not null default false,
  grants jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'accepted', 'revoked')),
  auth_user_id uuid,
  send_attempts integer not null default 0,
  last_error text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid,
  constraint invites_kind_check check ((global_role is not null) <> (corporation_id is not null))
);
create unique index invites_open_email_key on gaxeta_private.invites (email) where status in ('pending', 'sent', 'failed');
create index invites_corporation_idx on gaxeta_private.invites (corporation_id);

-- Dados cadastrais da corporação (1:1 com o ativo raiz). Opcionais: a raiz pode
-- nascer como rascunho só com o nome.
create table gaxeta_private.corporations (
  asset_id uuid primary key references public.gaxeta_assets(id) on delete cascade,
  slug text unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$'),
  contact_email text check (contact_email is null or contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  responsible_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table gaxeta_private.user_profiles enable row level security;
alter table gaxeta_private.access_grants enable row level security;
alter table gaxeta_private.invites enable row level security;
alter table gaxeta_private.corporations enable row level security;
revoke all on gaxeta_private.user_profiles, gaxeta_private.access_grants, gaxeta_private.invites,
  gaxeta_private.corporations from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Integridade do modelo
-- ---------------------------------------------------------------------------
create function gaxeta_private.profile_guard()
 returns trigger language plpgsql security definer set search_path to '' as $function$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    if new.corporation_id is not null
       and (select kind from public.gaxeta_assets where id = new.corporation_id) is distinct from 'corporation' then
      raise exception 'O vínculo do usuário deve apontar para uma corporação';
    end if;
    if tg_op = 'UPDATE' and new.corporation_id is distinct from old.corporation_id then
      delete from gaxeta_private.access_grants where user_id = new.user_id;
    end if;
    new.updated_at := now();
  end if;
  -- Nunca fica sem um nível 1 ativo.
  if tg_op in ('UPDATE', 'DELETE') and old.global_role = 'adm1' and old.status = 'active'
     and (tg_op = 'DELETE' or new.global_role is distinct from 'adm1' or new.status <> 'active') then
    perform pg_advisory_xact_lock(hashtextextended('gaxeta_adm1', 0));
    if not exists (select 1 from gaxeta_private.user_profiles
                    where global_role = 'adm1' and status = 'active' and user_id <> old.user_id) then
      raise exception 'Não é possível remover o último administrador de nível 1 ativo';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $function$;
create trigger user_profiles_guard before insert or update or delete on gaxeta_private.user_profiles
  for each row execute function gaxeta_private.profile_guard();

create function gaxeta_private.grant_guard()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_corp uuid; v_asset_corp uuid;
begin
  select corporation_id into v_corp from gaxeta_private.user_profiles where user_id = new.user_id;
  if v_corp is null then raise exception 'Concessões por ramo só se aplicam a usuários de corporação'; end if;
  select corporation_id into v_asset_corp from public.gaxeta_assets where id = new.asset_id;
  if v_asset_corp is distinct from v_corp then
    raise exception 'A concessão precisa estar dentro da corporação do usuário';
  end if;
  return new;
end $function$;
create trigger access_grants_guard before insert or update on gaxeta_private.access_grants
  for each row execute function gaxeta_private.grant_guard();
revoke all on function gaxeta_private.profile_guard(), gaxeta_private.grant_guard() from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Funções de decisão (schema próprio, usável por 'authenticated' para que as
-- políticas possam chamá-las; não é exposto pela API, que só publica 'public').
-- ---------------------------------------------------------------------------
create schema gaxeta_authz;
revoke all on schema gaxeta_authz from public;
grant usage on schema gaxeta_authz to authenticated, service_role;

-- Papel efetivo de quem chama: 'adm1' | 'adm2' | 'adm3' | 'corp' | null (sem acesso).
create function gaxeta_authz.my_role() returns text
 language sql stable security definer set search_path to '' as $$
  select coalesce(p.global_role, 'corp')
    from gaxeta_private.user_profiles p join auth.users u on u.id = p.user_id
   where p.user_id = auth.uid() and p.status = 'active'
     and u.email_confirmed_at is not null and u.deleted_at is null
     and (u.banned_until is null or u.banned_until <= now())
$$;

create function gaxeta_authz.is_global_reader() returns boolean
 language sql stable security definer set search_path to '' as $$
  select coalesce(gaxeta_authz.my_role() in ('adm1', 'adm2', 'adm3'), false)
$$;

create function gaxeta_authz.my_corporation() returns uuid
 language sql stable security definer set search_path to '' as $$
  select p.corporation_id from gaxeta_private.user_profiles p
   where p.user_id = auth.uid() and gaxeta_authz.my_role() = 'corp'
$$;

-- Ativos com acesso efetivo (ancestral mais próximo com concessão = 'all').
create function gaxeta_authz.accessible_asset_ids() returns setof uuid
 language sql stable security definer set search_path to '' as $$
  select c.id
    from public.gaxeta_assets c
   where gaxeta_authz.my_role() = 'corp'
     and c.path && (select coalesce(array_agg(g.asset_id), '{}'::uuid[]) from gaxeta_private.access_grants g
                     where g.user_id = auth.uid() and g.mode = 'all')
     and (select g.mode from gaxeta_private.access_grants g
           where g.user_id = auth.uid() and g.asset_id = any (c.path)
           order by array_position(c.path, g.asset_id) desc limit 1) = 'all'
$$;

-- Ativos visíveis: acesso efetivo + ancestrais que servem só de caminho de navegação.
create function gaxeta_authz.visible_asset_ids() returns setof uuid
 language sql stable security definer set search_path to '' as $$
  select gaxeta_authz.accessible_asset_ids()
  union
  select unnest(ga.path)
    from gaxeta_private.access_grants g join public.gaxeta_assets ga on ga.id = g.asset_id
   where gaxeta_authz.my_role() = 'corp' and g.user_id = auth.uid() and g.mode = 'all'
$$;

-- Decisão para um ativo: 'full' (acesso), 'path' (só caminho) ou null (negado).
create function gaxeta_authz.asset_access(p_asset_id uuid) returns text
 language sql stable security definer set search_path to '' as $$
  select case
    when r.role in ('adm1', 'adm2', 'adm3') then 'full'
    when r.role is distinct from 'corp' or a.path is null then null
    when (select g.mode from gaxeta_private.access_grants g
           where g.user_id = auth.uid() and g.asset_id = any (a.path)
           order by array_position(a.path, g.asset_id) desc limit 1) = 'all' then 'full'
    when exists (select 1 from gaxeta_private.access_grants g join public.gaxeta_assets ga on ga.id = g.asset_id
                  where g.user_id = auth.uid() and g.mode = 'all' and ga.path @> array[p_asset_id]) then 'path'
  end
  from (select gaxeta_authz.my_role() as role) r
  left join public.gaxeta_assets a on a.id = p_asset_id
$$;

-- Janelas de leitura por proveniência: o usuário de corporação lê as leituras do
-- período em que o sensor esteve vinculado a um spot ao qual ele tem acesso.
create function gaxeta_authz.visible_link_windows()
 returns table (sensor_id text, from_ts timestamptz, to_ts timestamptz)
 language sql stable security definer set search_path to '' as $$
  select l.sensor_id, l.linked_at, l.unlinked_at
    from gaxeta_private.device_links l
   where l.point_id in (select gaxeta_authz.accessible_asset_ids())
$$;

-- Escrita na árvore. p_scope_asset_id: o pai (criação) ou o próprio ativo (edição).
-- Nunca devolve NULL: ausência de decisão é negação.
create function gaxeta_authz.can_write_tree(p_kind text, p_scope_asset_id uuid) returns boolean
 language sql stable security definer set search_path to '' as $$
  select coalesce(case gaxeta_authz.my_role()
    when 'adm1' then true
    when 'adm2' then p_kind <> 'corporation'
    when 'corp' then p_kind in ('area', 'subarea', 'equipment', 'point')
                     and (select can_write from gaxeta_private.user_profiles where user_id = auth.uid())
                     and gaxeta_authz.asset_access(p_scope_asset_id) = 'full'
    else false end, false)
$$;

-- Operação de campo num spot (vincular, renomear, trocar gateway do sensor ali instalado).
create function gaxeta_authz.can_operate_point(p_point_id uuid) returns boolean
 language sql stable security definer set search_path to '' as $$
  select coalesce(case gaxeta_authz.my_role()
    when 'adm1' then true
    when 'adm2' then true
    when 'corp' then p_point_id is not null
                     and (select can_write from gaxeta_private.user_profiles where user_id = auth.uid())
                     and gaxeta_authz.asset_access(p_point_id) = 'full'
    else false end, false)
$$;

revoke all on all functions in schema gaxeta_authz from public, anon;
grant execute on all functions in schema gaxeta_authz to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Titulares iniciais: contas existentes e confirmadas da lista do piloto viram
-- nível 1, por UUID. Idempotente. Conferir os UUIDs no roteiro de rollout.
-- ---------------------------------------------------------------------------
insert into gaxeta_private.user_profiles (user_id, email, display_name, global_role, status, activated_at)
select u.id, lower(u.email), coalesce(nullif(u.raw_user_meta_data ->> 'name', ''), split_part(u.email, '@', 1)),
       'adm1', 'active', now()
  from auth.users u join gaxeta_private.platform_members m on m.email = lower(u.email) and m.enabled
 where u.email_confirmed_at is not null
on conflict (user_id) do nothing;

do $$
declare n integer;
begin
  select count(*) into n from gaxeta_private.user_profiles where global_role = 'adm1' and status = 'active';
  raise notice 'Administradores de nível 1 ativos após o backfill: %', n;
end $$;

commit;
