-- =============================================================================
-- 04 · Administração de usuários, pré-cadastro, convites e ativação
-- Aditiva. Tudo por RPC com autorização explícita no servidor:
--   adm1: tudo, inclusive papéis globais e exclusão;
--   adm2: cadastra/convida e ajusta usuários de corporação; não toca em contas
--         com papel global (pares e superiores), não promove, não exclui;
--   adm3 e usuários de corporação: nenhuma operação administrativa.
-- O envio do e-mail fica fora do banco (serviço com chave administrativa), que
-- informa o resultado por gaxeta_service_invite_result (somente service_role).
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- Valida e normaliza concessões [{asset_id, mode}] dentro de uma corporação.
-- Remove entradas redundantes (mesmo efeito do que já seria herdado), para que
-- "Nenhum" e "Todos" gravados sempre signifiquem o que mostram.
create function gaxeta_private.normalize_grants(p_corporation_id uuid, p_grants jsonb)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare v jsonb; n_in integer; n_ok integer;
begin
  if p_grants is null or jsonb_typeof(p_grants) <> 'array' then raise exception 'Concessões inválidas'; end if;
  select count(*) into n_in from jsonb_array_elements(p_grants);
  with g as (
    select (e ->> 'asset_id')::uuid as asset_id, e ->> 'mode' as mode from jsonb_array_elements(p_grants) e
  ), j as (
    select g.asset_id, g.mode, a.path from g join public.gaxeta_assets a on a.id = g.asset_id
     where a.corporation_id = p_corporation_id and g.mode in ('all', 'none')
  ), e as (
    select j.asset_id, j.mode, j.path,
           coalesce((select o.mode from j o where o.asset_id <> j.asset_id and o.asset_id = any (j.path)
                      order by array_position(j.path, o.asset_id) desc limit 1), 'none') as inherited
      from j
  )
  select (select count(distinct asset_id) from j),
         coalesce(jsonb_agg(jsonb_build_object('asset_id', asset_id, 'mode', mode) order by cardinality(path), asset_id)
                  filter (where mode <> inherited), '[]'::jsonb)
    into n_ok, v from e;
  if n_ok <> n_in then
    raise exception 'Concessões inválidas: ativo repetido, inexistente, de outra corporação ou modo desconhecido';
  end if;
  return v;
end $function$;

create function gaxeta_private.replace_grants(p_user_id uuid, p_corporation_id uuid, p_grants jsonb)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v jsonb := gaxeta_private.normalize_grants(p_corporation_id, p_grants);
begin
  delete from gaxeta_private.access_grants where user_id = p_user_id;
  insert into gaxeta_private.access_grants (user_id, asset_id, mode, created_by)
  select p_user_id, (e ->> 'asset_id')::uuid, e ->> 'mode', auth.uid() from jsonb_array_elements(v) e;
  return v;
end $function$;

-- Autoridade administrativa de quem chama sobre um alvo com/sem papel global.
create function gaxeta_private.require_user_admin(p_target_is_global boolean)
 returns text language plpgsql stable security definer set search_path to '' as $function$
declare r text := gaxeta_authz.my_role();
begin
  if r = 'adm1' then return r; end if;
  if r = 'adm2' and not p_target_is_global then return r; end if;
  raise insufficient_privilege;
end $function$;

revoke all on function gaxeta_private.normalize_grants(uuid, jsonb), gaxeta_private.replace_grants(uuid, uuid, jsonb),
  gaxeta_private.require_user_admin(boolean) from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Contexto de quem está logado (para a interface decidir o que mostrar)
-- ---------------------------------------------------------------------------
create function public.gaxeta_my_context()
 returns jsonb language sql stable security definer set search_path to '' as $$
  select jsonb_build_object(
    'user_id', auth.uid(),
    'role', r.role,
    'corporation_id', p.corporation_id,
    'can_write', coalesce(p.can_write, false),
    'display_name', p.display_name,
    'has_pending_invite', r.role is null and exists (
      select 1 from gaxeta_private.invites i join auth.users u on u.id = auth.uid()
       where i.status in ('pending', 'sent', 'failed') and (i.auth_user_id = u.id or (i.auth_user_id is null and i.email = lower(u.email)))),
    'capabilities', jsonb_build_object(
      'manage_users', coalesce(r.role in ('adm1', 'adm2'), false),
      'manage_global_roles', coalesce(r.role = 'adm1', false),
      'delete_records', coalesce(r.role = 'adm1', false),
      'manage_corporations', coalesce(r.role = 'adm1', false),
      'manage_companies', coalesce(r.role in ('adm1', 'adm2'), false),
      'manage_gateways', coalesce(r.role in ('adm1', 'adm2'), false),
      'association_queue', coalesce(r.role in ('adm1', 'adm2'), false),
      'edit_tree', coalesce(r.role in ('adm1', 'adm2') or (r.role = 'corp' and p.can_write), false)))
    from (select gaxeta_authz.my_role() as role) r
    left join gaxeta_private.user_profiles p on p.user_id = auth.uid() and r.role is not null
$$;

-- ---------------------------------------------------------------------------
-- Pré-cadastro / convite
-- ---------------------------------------------------------------------------
create function public.gaxeta_admin_invite_user(p_email text, p_display_name text, p_global_role text, p_corporation_id uuid, p_can_write boolean default false, p_grants jsonb default '[]'::jsonb)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v_email text := lower(trim(p_email)); u auth.users%rowtype; i gaxeta_private.invites%rowtype; v_grants jsonb := '[]'::jsonb; v_new boolean; v_id uuid;
begin
  perform gaxeta_private.require_user_admin(p_global_role is not null);
  if (p_global_role is not null) = (p_corporation_id is not null) then
    raise exception 'Informe um papel global ou uma corporação, não ambos';
  end if;
  if p_global_role is not null and (p_can_write or jsonb_array_length(coalesce(p_grants, '[]'::jsonb)) > 0) then
    raise exception 'Papéis globais não usam concessões por ramo';
  end if;
  if p_corporation_id is not null then
    if (select kind from public.gaxeta_assets where id = p_corporation_id) is distinct from 'corporation' then
      raise exception 'Corporação não encontrada';
    end if;
    v_grants := gaxeta_private.normalize_grants(p_corporation_id, coalesce(p_grants, '[]'::jsonb));
  end if;
  if exists (select 1 from gaxeta_private.user_profiles where email = v_email) then
    raise exception 'Este e-mail já tem cadastro. Ajuste o acesso do usuário existente.' using errcode = '23505';
  end if;

  select * into u from auth.users where lower(email) = v_email and deleted_at is null and not is_anonymous;
  if found and u.email_confirmed_at is not null and coalesce(u.encrypted_password, '') <> '' then
    -- Identidade existente e verificada: vincula sem recriar conta nem redefinir senha.
    insert into gaxeta_private.user_profiles (user_id, email, display_name, global_role, corporation_id, can_write, status, activated_at, created_by, updated_by)
    values (u.id, v_email, trim(p_display_name), p_global_role, p_corporation_id, coalesce(p_can_write, false), 'active', now(), auth.uid(), auth.uid());
    if p_corporation_id is not null then perform gaxeta_private.replace_grants(u.id, p_corporation_id, v_grants); end if;
    update gaxeta_private.invites set status = 'accepted', accepted_at = now(), auth_user_id = u.id, updated_at = now()
     where email = v_email and status in ('pending', 'sent', 'failed');
    perform gaxeta_private.audit('user.link_existing', 'user', u.id::text, p_corporation_id,
      jsonb_build_object('role', coalesce(p_global_role, 'corp'), 'can_write', coalesce(p_can_write, false), 'grants', v_grants));
    return jsonb_build_object('kind', 'linked', 'user_id', u.id, 'status', 'active');
  end if;

  insert into gaxeta_private.invites (email, display_name, global_role, corporation_id, can_write, grants, status, auth_user_id, created_by)
  values (v_email, trim(p_display_name), p_global_role, p_corporation_id, coalesce(p_can_write, false), v_grants, 'pending', u.id, auth.uid())
  on conflict (email) where status in ('pending', 'sent', 'failed') do update
    set display_name = excluded.display_name, global_role = excluded.global_role, corporation_id = excluded.corporation_id,
        can_write = excluded.can_write, grants = excluded.grants, status = 'pending', last_error = null, updated_at = now()
  returning id, (xmax = 0) into v_id, v_new;
  select * into i from gaxeta_private.invites where id = v_id;
  perform gaxeta_private.audit(case when v_new then 'invite.create' else 'invite.update' end, 'invite', i.id::text, p_corporation_id,
    jsonb_build_object('role', coalesce(p_global_role, 'corp'), 'can_write', i.can_write, 'grants', v_grants));
  return jsonb_build_object('kind', 'invite', 'invite_id', i.id, 'status', i.status, 'created', v_new);
end $function$;

create function public.gaxeta_admin_resend_invite(p_invite_id uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare i gaxeta_private.invites%rowtype;
begin
  select * into i from gaxeta_private.invites where id = p_invite_id for update;
  if not found then raise exception 'Convite não encontrado'; end if;
  perform gaxeta_private.require_user_admin(i.global_role is not null);
  if i.status not in ('pending', 'sent', 'failed') then raise exception 'Convite encerrado (%)', i.status; end if;
  update gaxeta_private.invites set status = 'pending', last_error = null, updated_at = now() where id = p_invite_id;
  perform gaxeta_private.audit('invite.resend', 'invite', i.id::text, i.corporation_id, '{}'::jsonb);
  return jsonb_build_object('invite_id', i.id, 'status', 'pending');
end $function$;

create function public.gaxeta_admin_revoke_invite(p_invite_id uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare i gaxeta_private.invites%rowtype;
begin
  select * into i from gaxeta_private.invites where id = p_invite_id for update;
  if not found then raise exception 'Convite não encontrado'; end if;
  perform gaxeta_private.require_user_admin(i.global_role is not null);
  if i.status not in ('pending', 'sent', 'failed') then raise exception 'Convite encerrado (%)', i.status; end if;
  update gaxeta_private.invites set status = 'revoked', revoked_at = now(), revoked_by = auth.uid(), updated_at = now() where id = p_invite_id;
  perform gaxeta_private.audit('invite.revoke', 'invite', i.id::text, i.corporation_id, '{}'::jsonb);
  return jsonb_build_object('invite_id', i.id, 'status', 'revoked');
end $function$;

-- Resultado do envio, informado pelo serviço que fala com o Auth Admin e o e-mail.
-- Idempotente por convite; nunca cria acesso.
create function public.gaxeta_service_invite_result(p_invite_id uuid, p_ok boolean, p_auth_user_id uuid default null, p_error text default null, p_expires_at timestamptz default null)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare i gaxeta_private.invites%rowtype;
begin
  update gaxeta_private.invites
     set status = case when p_ok then 'sent' else 'failed' end,
         auth_user_id = coalesce(p_auth_user_id, auth_user_id),
         send_attempts = send_attempts + 1,
         last_error = case when p_ok then null else left(coalesce(p_error, 'falha não informada'), 500) end,
         sent_at = case when p_ok then now() else sent_at end,
         expires_at = case when p_ok then p_expires_at else expires_at end,
         updated_at = now()
   where id = p_invite_id and status in ('pending', 'sent', 'failed') returning * into i;
  if not found then return jsonb_build_object('invite_id', p_invite_id, 'updated', false); end if;
  perform gaxeta_private.audit(case when p_ok then 'invite.sent' else 'invite.failed' end, 'invite', i.id::text, i.corporation_id,
    jsonb_build_object('attempt', i.send_attempts));
  return jsonb_build_object('invite_id', i.id, 'updated', true, 'status', i.status, 'attempts', i.send_attempts);
end $function$;

-- Ativação pelo próprio convidado, depois de concluir a credencial. Exige sessão do
-- UUID do Auth, e-mail verificado, senha definida no Auth e convite correspondente.
-- Usa o vínculo pré-cadastrado imediatamente, sem segunda aprovação. Idempotente.
create function public.gaxeta_activate_invite()
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare u auth.users%rowtype; i gaxeta_private.invites%rowtype; v_grants jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  select * into u from auth.users where id = auth.uid() and deleted_at is null and not is_anonymous;
  if not found or u.email_confirmed_at is null then raise insufficient_privilege; end if;
  if exists (select 1 from gaxeta_private.user_profiles where user_id = u.id) then
    return jsonb_build_object('status', 'already_registered', 'role', gaxeta_authz.my_role());
  end if;
  select * into i from gaxeta_private.invites
   where status in ('pending', 'sent', 'failed')
     and (auth_user_id = u.id or (auth_user_id is null and email = lower(u.email)))
   order by created_at desc limit 1 for update;
  if not found then raise exception 'Não há convite pendente para esta conta'; end if;
  if lower(u.email) <> i.email then raise insufficient_privilege; end if;
  if coalesce(u.encrypted_password, '') = '' then
    raise exception 'Defina a senha antes de ativar o acesso';
  end if;
  insert into gaxeta_private.user_profiles (user_id, email, display_name, global_role, corporation_id, can_write, status, activated_at, created_by, updated_by)
  values (u.id, i.email, i.display_name, i.global_role, i.corporation_id, i.can_write, 'active', now(), i.created_by, i.created_by);
  if i.corporation_id is not null then
    -- Ativos removidos desde o pré-cadastro são ignorados; o restante vale como gravado.
    select coalesce(jsonb_agg(e), '[]'::jsonb) into v_grants from jsonb_array_elements(i.grants) e
     where exists (select 1 from public.gaxeta_assets a where a.id = (e ->> 'asset_id')::uuid and a.corporation_id = i.corporation_id);
    v_grants := gaxeta_private.replace_grants(u.id, i.corporation_id, v_grants);
  end if;
  update gaxeta_private.invites set status = 'accepted', accepted_at = now(), auth_user_id = u.id, updated_at = now() where id = i.id;
  perform gaxeta_private.audit('invite.accept', 'user', u.id::text, i.corporation_id,
    jsonb_build_object('invite_id', i.id, 'role', coalesce(i.global_role, 'corp'), 'grants', v_grants));
  return jsonb_build_object('status', 'activated', 'role', coalesce(i.global_role, 'corp'), 'corporation_id', i.corporation_id);
end $function$;

-- ---------------------------------------------------------------------------
-- Ajustes em usuários existentes
-- ---------------------------------------------------------------------------
create function public.gaxeta_admin_set_access(p_user_id uuid, p_can_write boolean, p_grants jsonb)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare p gaxeta_private.user_profiles%rowtype; v jsonb;
begin
  select * into p from gaxeta_private.user_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Usuário não encontrado'; end if;
  perform gaxeta_private.require_user_admin(p.global_role is not null);
  if p.corporation_id is null then raise exception 'Papéis globais não usam concessões por ramo'; end if;
  update gaxeta_private.user_profiles set can_write = coalesce(p_can_write, can_write), updated_by = auth.uid() where user_id = p_user_id;
  v := gaxeta_private.replace_grants(p_user_id, p.corporation_id, coalesce(p_grants, '[]'::jsonb));
  perform gaxeta_private.audit('user.set_access', 'user', p_user_id::text, p.corporation_id,
    jsonb_build_object('can_write', coalesce(p_can_write, p.can_write), 'grants', v));
  return jsonb_build_object('user_id', p_user_id, 'can_write', coalesce(p_can_write, p.can_write), 'grants', v);
end $function$;

-- Papel global (somente nível 1). Promover usuário de corporação remove vínculo e concessões.
create function public.gaxeta_admin_set_role(p_user_id uuid, p_global_role text)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare p gaxeta_private.user_profiles%rowtype;
begin
  if gaxeta_authz.my_role() is distinct from 'adm1' then raise insufficient_privilege; end if;
  if p_global_role is null or p_global_role not in ('adm1', 'adm2', 'adm3') then raise exception 'Papel global inválido'; end if;
  select * into p from gaxeta_private.user_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Usuário não encontrado'; end if;
  delete from gaxeta_private.access_grants where user_id = p_user_id;
  update gaxeta_private.user_profiles set global_role = p_global_role, corporation_id = null, can_write = false, updated_by = auth.uid()
   where user_id = p_user_id;
  perform gaxeta_private.audit('user.set_role', 'user', p_user_id::text, p.corporation_id,
    jsonb_build_object('from', coalesce(p.global_role, 'corp'), 'to', p_global_role));
  return jsonb_build_object('user_id', p_user_id, 'role', p_global_role);
end $function$;

create function public.gaxeta_admin_set_status(p_user_id uuid, p_status text)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare p gaxeta_private.user_profiles%rowtype;
begin
  if p_status is null or p_status not in ('active', 'disabled') then raise exception 'Status inválido'; end if;
  select * into p from gaxeta_private.user_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Usuário não encontrado'; end if;
  perform gaxeta_private.require_user_admin(p.global_role is not null);
  update gaxeta_private.user_profiles set status = p_status, updated_by = auth.uid() where user_id = p_user_id;
  perform gaxeta_private.audit('user.set_status', 'user', p_user_id::text, p.corporation_id,
    jsonb_build_object('from', p.status, 'to', p_status));
  return jsonb_build_object('user_id', p_user_id, 'status', p_status);
end $function$;

-- Exclusão do cadastro de acesso (somente nível 1). A identidade no Auth é removida
-- à parte, pelo serviço administrativo.
create function public.gaxeta_admin_delete_user(p_user_id uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare p gaxeta_private.user_profiles%rowtype;
begin
  if gaxeta_authz.my_role() is distinct from 'adm1' then raise insufficient_privilege; end if;
  select * into p from gaxeta_private.user_profiles where user_id = p_user_id for update;
  if not found then raise exception 'Usuário não encontrado'; end if;
  delete from gaxeta_private.user_profiles where user_id = p_user_id;
  perform gaxeta_private.audit('user.delete', 'user', p_user_id::text, p.corporation_id,
    jsonb_build_object('role', coalesce(p.global_role, 'corp')));
  return jsonb_build_object('user_id', p_user_id, 'deleted', true, 'auth_identity_removed', false);
end $function$;

-- ---------------------------------------------------------------------------
-- Consulta: listagem paginada, detalhe, prévia de acesso e auditoria
-- ---------------------------------------------------------------------------
create function public.gaxeta_admin_users(p_search text default null, p_role text default null, p_status text default null, p_corporation_id uuid default null, p_company_id uuid default null, p_limit integer default 25, p_offset integer default 0)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare v jsonb; v_limit integer := least(greatest(coalesce(p_limit, 25), 1), 100); v_q text := nullif(lower(trim(p_search)), '');
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  with rows as (
    select 'user' as kind, p.user_id::text as id, p.email, p.display_name, coalesce(p.global_role, 'corp') as role,
           p.status, p.corporation_id, p.can_write, p.created_at, p.activated_at, null::integer as send_attempts, null::text as last_error
      from gaxeta_private.user_profiles p
    union all
    select 'invite', i.id::text, i.email, i.display_name, coalesce(i.global_role, 'corp'),
           case when i.status in ('pending', 'sent') and i.expires_at is not null and i.expires_at < now() then 'invite_expired'
                else 'invite_' || i.status end,
           i.corporation_id, i.can_write, i.created_at, null, i.send_attempts, i.last_error
      from gaxeta_private.invites i where i.status in ('pending', 'sent', 'failed')
  ), f as (
    select r.*, c.name as corporation_name from rows r left join public.gaxeta_assets c on c.id = r.corporation_id
     where (v_q is null or r.email like '%' || v_q || '%' or lower(r.display_name) like '%' || v_q || '%')
       and (p_role is null or r.role = p_role)
       and (p_status is null or r.status = p_status)
       and (p_corporation_id is null or r.corporation_id = p_corporation_id)
       and (p_company_id is null or (r.kind = 'user' and exists (
              select 1 from gaxeta_private.access_grants g join public.gaxeta_assets ga on ga.id = g.asset_id
               where g.user_id::text = r.id and g.mode = 'all'
                 and (ga.path @> array[p_company_id] or (select path from public.gaxeta_assets where id = p_company_id) @> array[ga.id]))))
  )
  select jsonb_build_object('total', (select count(*) from f), 'limit', v_limit, 'offset', greatest(coalesce(p_offset, 0), 0),
           'items', coalesce((select jsonb_agg(to_jsonb(x)) from (
              select * from f order by lower(display_name), email limit v_limit offset greatest(coalesce(p_offset, 0), 0)) x), '[]'::jsonb))
    into v;
  return v;
end $function$;

create function public.gaxeta_admin_user_detail(p_user_id uuid)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare p gaxeta_private.user_profiles%rowtype;
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  select * into p from gaxeta_private.user_profiles where user_id = p_user_id;
  if not found then raise exception 'Usuário não encontrado'; end if;
  return jsonb_build_object('user_id', p.user_id, 'email', p.email, 'display_name', p.display_name,
    'role', coalesce(p.global_role, 'corp'), 'status', p.status, 'corporation_id', p.corporation_id, 'can_write', p.can_write,
    'activated_at', p.activated_at,
    'grants', coalesce((select jsonb_agg(jsonb_build_object('asset_id', g.asset_id, 'mode', g.mode, 'kind', a.kind, 'name', a.name, 'tag', a.tag,
                 'path', (select jsonb_agg(x.name order by t.ord) from unnest(a.path) with ordinality t(id, ord) join public.gaxeta_assets x on x.id = t.id))
                 order by cardinality(a.path), a.name)
               from gaxeta_private.access_grants g join public.gaxeta_assets a on a.id = g.asset_id where g.user_id = p.user_id), '[]'::jsonb));
end $function$;

-- Prévia do acesso efetivo de um conjunto de concessões, um nível por vez.
-- state: 'full' (acesso), 'path' (só caminho de navegação) ou 'none'.
create function public.gaxeta_admin_preview_access(p_corporation_id uuid, p_grants jsonb, p_parent_id uuid default null)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare v_grants jsonb; v jsonb;
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  v_grants := gaxeta_private.normalize_grants(p_corporation_id, coalesce(p_grants, '[]'::jsonb));
  with g as (
    select (e ->> 'asset_id')::uuid as asset_id, e ->> 'mode' as mode, a.path
      from jsonb_array_elements(v_grants) e join public.gaxeta_assets a on a.id = (e ->> 'asset_id')::uuid
  ), eff as (
    select a.id, a.kind, a.name, a.tag, a.parent_id, a.path,
           coalesce((select g.mode from g where g.asset_id = any (a.path) order by array_position(a.path, g.asset_id) desc limit 1), 'none') = 'all' as full_access
      from public.gaxeta_assets a where a.corporation_id = p_corporation_id
  ), st as (
    select e.*, case when e.full_access then 'full'
                     when exists (select 1 from g where g.mode = 'all' and g.path @> array[e.id]) then 'path' else 'none' end as state
      from eff e
  )
  select jsonb_build_object(
    'normalized_grants', v_grants,
    'totals', (select coalesce(jsonb_object_agg(kind, n), '{}'::jsonb) from (select kind, count(*) n from st where state = 'full' group by kind) t),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'name', name, 'tag', tag, 'state', state,
                 'has_children', exists (select 1 from st c where c.parent_id = st.id)) order by kind, name)
               from st where (p_parent_id is null and parent_id is null) or parent_id = p_parent_id), '[]'::jsonb))
    into v;
  return v;
end $function$;

create function public.gaxeta_admin_audit(p_limit integer default 50, p_offset integer default 0, p_action_prefix text default null, p_target_id text default null, p_corporation_id uuid default null)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare v jsonb; v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 200);
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) into v from (
    select l.id, l.at, l.actor_id, (select email from gaxeta_private.user_profiles where user_id = l.actor_id) as actor_email,
           l.action, l.target_type, l.target_id, l.corporation_id, l.details
      from gaxeta_private.audit_log l
     where (p_action_prefix is null or l.action like p_action_prefix || '%')
       and (p_target_id is null or l.target_id = p_target_id)
       and (p_corporation_id is null or l.corporation_id = p_corporation_id)
     order by l.id desc limit v_limit offset greatest(coalesce(p_offset, 0), 0)) x;
  return v;
end $function$;

-- ---------------------------------------------------------------------------
-- Privilégios
-- ---------------------------------------------------------------------------
revoke all on function
  public.gaxeta_my_context(), public.gaxeta_admin_invite_user(text, text, text, uuid, boolean, jsonb),
  public.gaxeta_admin_resend_invite(uuid), public.gaxeta_admin_revoke_invite(uuid),
  public.gaxeta_service_invite_result(uuid, boolean, uuid, text, timestamptz), public.gaxeta_activate_invite(),
  public.gaxeta_admin_set_access(uuid, boolean, jsonb), public.gaxeta_admin_set_role(uuid, text),
  public.gaxeta_admin_set_status(uuid, text), public.gaxeta_admin_delete_user(uuid),
  public.gaxeta_admin_users(text, text, text, uuid, uuid, integer, integer), public.gaxeta_admin_user_detail(uuid),
  public.gaxeta_admin_preview_access(uuid, jsonb, uuid), public.gaxeta_admin_audit(integer, integer, text, text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function
  public.gaxeta_my_context(), public.gaxeta_admin_invite_user(text, text, text, uuid, boolean, jsonb),
  public.gaxeta_admin_resend_invite(uuid), public.gaxeta_admin_revoke_invite(uuid), public.gaxeta_activate_invite(),
  public.gaxeta_admin_set_access(uuid, boolean, jsonb), public.gaxeta_admin_set_role(uuid, text),
  public.gaxeta_admin_set_status(uuid, text), public.gaxeta_admin_delete_user(uuid),
  public.gaxeta_admin_users(text, text, text, uuid, uuid, integer, integer), public.gaxeta_admin_user_detail(uuid),
  public.gaxeta_admin_preview_access(uuid, jsonb, uuid), public.gaxeta_admin_audit(integer, integer, text, text, uuid)
  to authenticated;
grant execute on function public.gaxeta_service_invite_result(uuid, boolean, uuid, text, timestamptz) to service_role;

commit;
