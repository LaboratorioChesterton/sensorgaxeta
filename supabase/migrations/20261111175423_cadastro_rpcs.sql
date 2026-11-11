-- =============================================================================
-- 03 · Contratos de escrita: ativos, sensores e gateways
-- Mantém nome, assinatura e formato de resposta de gaxeta_save_asset e
-- gaxeta_configure_sensor (usados pelo pacote publicado). Autoriza por papel e
-- escopo (migração 02). Acrescenta operações explícitas de vínculo, desvínculo,
-- gateway e exclusão. A ingestão não é tocada.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- Núcleo único de configuração de sensor (não exposto pela API)
-- ---------------------------------------------------------------------------
create function gaxeta_private.set_sensor(
  p_sensor_id text, p_label text,
  p_change_point boolean, p_point_id uuid,
  p_change_gateway boolean, p_gateway_id uuid,
  p_reason text)
 returns public.gaxeta_devices language plpgsql security definer set search_path to '' as $function$
declare d public.gaxeta_devices%rowtype; pt public.gaxeta_assets%rowtype; old_pt public.gaxeta_assets%rowtype;
        v_role text := gaxeta_authz.my_role(); v_point uuid; v_gateway uuid; v_gw_company uuid;
begin
  if v_role is null then raise insufficient_privilege; end if;
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32' for update;
  if not found then raise exception 'Sensor não registrado: aguarde a primeira transmissão'; end if;

  v_point := case when p_change_point then p_point_id else d.measurement_point_id end;
  v_gateway := case when p_change_gateway then p_gateway_id else d.gateway_id end;

  -- Autorização: administradores 1 e 2 operam qualquer sensor, inclusive a fila sem
  -- vínculo. Usuário de corporação com edição só opera sensor já instalado num spot
  -- do seu escopo e só o move para outro spot do seu escopo.
  if v_role not in ('adm1', 'adm2') then
    if not gaxeta_authz.can_operate_point(d.measurement_point_id) then raise insufficient_privilege; end if;
    -- Desvincular devolve o sensor à fila de associação, que é dos administradores.
    if v_point is null then raise insufficient_privilege; end if;
    if v_point is not null and v_point is distinct from d.measurement_point_id
       and not gaxeta_authz.can_operate_point(v_point) then raise insufficient_privilege; end if;
  end if;

  if p_label is not null and p_label !~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then
    raise exception 'Nome: 3 a 24 caracteres, letras sem acento, números, espaço, ponto, hífen ou sublinhado';
  end if;

  if v_point is not null then
    select * into pt from public.gaxeta_assets where id = v_point;
    if pt.kind is distinct from 'point' then raise exception 'Selecione um ponto de medição'; end if;
    if d.measurement_point_id is not null and d.measurement_point_id <> v_point then
      select * into old_pt from public.gaxeta_assets where id = d.measurement_point_id;
      if old_pt.corporation_id <> pt.corporation_id then
        raise exception 'Transferência entre corporações não é permitida: desvincule o sensor antes';
      end if;
    end if;
  end if;

  if v_gateway is not null then
    select company_id into v_gw_company from public.gaxeta_gateways where id = v_gateway;
    if v_gw_company is null then raise exception 'Gateway inexistente'; end if;
    if v_point is null then raise exception 'Vincule o sensor a um spot antes de associar um gateway'; end if;
    if not (pt.path @> array[v_gw_company]) then
      if p_change_gateway then raise exception 'Gateway e ponto devem pertencer à mesma empresa';
      else raise exception 'Desvincule o gateway antes de mover o sensor para outra empresa'; end if;
    end if;
  end if;

  perform set_config('gaxeta.reason', coalesce(p_reason, ''), true);
  update public.gaxeta_devices
     set label = coalesce(p_label, label), desired_label = coalesce(p_label, desired_label),
         measurement_point_id = v_point, gateway_id = v_gateway, config_updated_at = now()
   where sensor_id = p_sensor_id returning * into d;
  perform set_config('gaxeta.reason', '', true);
  return d;
end $function$;
revoke all on function gaxeta_private.set_sensor(text, text, boolean, uuid, boolean, uuid, text) from public, anon, authenticated, service_role;

-- Contrato antigo: o formulário envia nome, ponto e gateway explicitamente.
create or replace function public.gaxeta_configure_sensor(p_sensor_id text, p_label text, p_point_id uuid default null::uuid, p_gateway_id uuid default null::uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  if p_label is null then raise exception 'Nome: 3 a 24 caracteres, letras sem acento, números, espaço, ponto, hífen ou sublinhado'; end if;
  return to_jsonb(gaxeta_private.set_sensor(p_sensor_id, p_label, true, p_point_id, true, p_gateway_id, 'configure_sensor'));
end $function$;

create function public.gaxeta_link_sensor(p_sensor_id text, p_point_id uuid, p_reason text default null)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  if p_point_id is null then raise exception 'Selecione um ponto de medição'; end if;
  return to_jsonb(gaxeta_private.set_sensor(p_sensor_id, null, true, p_point_id, false, null, coalesce(p_reason, 'link_sensor')));
end $function$;

-- Desvínculo explícito: o sensor volta à fila de associação e perde o gateway.
create function public.gaxeta_unlink_sensor(p_sensor_id text, p_reason text default null)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  return to_jsonb(gaxeta_private.set_sensor(p_sensor_id, null, true, null, true, null, coalesce(p_reason, 'unlink_sensor')));
end $function$;

-- p_gateway_id nulo = desvincular o gateway (ação explícita).
create function public.gaxeta_set_sensor_gateway(p_sensor_id text, p_gateway_id uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  return to_jsonb(gaxeta_private.set_sensor(p_sensor_id, null, false, null, true, p_gateway_id, 'set_sensor_gateway'));
end $function$;

create function public.gaxeta_rename_sensor(p_sensor_id text, p_label text)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
begin
  if p_label is null then raise exception 'Informe o nome do sensor'; end if;
  return to_jsonb(gaxeta_private.set_sensor(p_sensor_id, p_label, false, null, false, null, 'rename_sensor'));
end $function$;

-- ---------------------------------------------------------------------------
-- Ativos
-- ---------------------------------------------------------------------------
create or replace function public.gaxeta_save_asset(p_id uuid, p_parent_id uuid, p_kind text, p_name text, p_tag text, p_position text, p_sensor_id text default null::text, p_sensor_label text default null::text)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare a public.gaxeta_assets%rowtype; o public.gaxeta_assets%rowtype; d public.gaxeta_devices%rowtype; v_corp uuid;
begin
  if gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  if nullif(trim(p_name), '') is null then raise exception 'Informe o nome do ativo'; end if;
  -- Mesmo bloqueio por corporação usado pelo gatilho, tomado antes de travar linhas
  -- (ordem fixa: corporação, depois linhas), para movimentações concorrentes não se cruzarem.
  select corporation_id into v_corp from public.gaxeta_assets where id = coalesce(p_id, p_parent_id);
  if v_corp is not null then perform pg_advisory_xact_lock(hashtextextended('gaxeta_tree:' || v_corp::text, 0)); end if;
  if p_id is null then
    if not gaxeta_authz.can_write_tree(p_kind, p_parent_id) then raise insufficient_privilege; end if;
    insert into public.gaxeta_assets (parent_id, kind, name, tag, "position")
    values (p_parent_id, p_kind, trim(p_name), coalesce(p_tag, ''), coalesce(p_position, '')) returning * into a;
  else
    select * into o from public.gaxeta_assets where id = p_id for update;
    if not found then raise exception 'Ativo não encontrado'; end if;
    if not gaxeta_authz.can_write_tree(o.kind, o.id) then raise insufficient_privilege; end if;
    if p_parent_id is distinct from o.parent_id and not gaxeta_authz.can_write_tree(o.kind, p_parent_id) then
      raise insufficient_privilege;
    end if;
    update public.gaxeta_assets
       set parent_id = p_parent_id, kind = p_kind, name = trim(p_name), tag = coalesce(p_tag, ''), "position" = coalesce(p_position, '')
     where id = p_id returning * into a;
  end if;
  if p_sensor_id is not null then
    if a.kind <> 'point' then raise exception 'O sensor deve ser vinculado a um ponto de medição'; end if;
    select * into d from public.gaxeta_devices where sensor_id = p_sensor_id;
    if not found then raise exception 'Sensor não encontrado'; end if;
    -- O formulário de ativo não trata de gateway: o vínculo atual é preservado.
    perform gaxeta_private.set_sensor(p_sensor_id, coalesce(nullif(trim(p_sensor_label), ''), d.desired_label, d.label),
                                      true, a.id, false, null, 'save_asset');
  end if;
  return to_jsonb(a);
end $function$;

create function public.gaxeta_asset_dependencies(p_id uuid)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
begin
  if gaxeta_authz.asset_access(p_id) is distinct from 'full' then raise insufficient_privilege; end if;
  return jsonb_build_object(
    'children', (select count(*) from public.gaxeta_assets where parent_id = p_id),
    'descendants', (select count(*) from public.gaxeta_assets where path @> array[p_id] and id <> p_id),
    'linked_sensors', (select count(*) from public.gaxeta_devices d join public.gaxeta_assets pt on pt.id = d.measurement_point_id where pt.path @> array[p_id]),
    'gateways', (select count(*) from public.gaxeta_gateways g join public.gaxeta_assets c on c.id = g.company_id where c.path @> array[p_id]),
    'link_history', (select count(*) from gaxeta_private.device_links l join public.gaxeta_assets pt on pt.id = l.point_id where pt.path @> array[p_id]),
    'access_grants', (select count(*) from gaxeta_private.access_grants g join public.gaxeta_assets ga on ga.id = g.asset_id where ga.path @> array[p_id]),
    'users', (select count(*) from gaxeta_private.user_profiles where corporation_id = p_id));
end $function$;

-- Exclusão definitiva: somente nível 1, somente ativo sem dependências. Ativos com
-- histórico de instalação ou telemetria vinculada não são excluídos.
create function public.gaxeta_delete_asset(p_id uuid, p_reason text default null)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare a public.gaxeta_assets%rowtype; deps jsonb;
begin
  if gaxeta_authz.my_role() is distinct from 'adm1' then raise insufficient_privilege; end if;
  select * into a from public.gaxeta_assets where id = p_id for update;
  if not found then raise exception 'Ativo não encontrado'; end if;
  deps := public.gaxeta_asset_dependencies(p_id);
  if (deps ->> 'children')::int > 0 or (deps ->> 'linked_sensors')::int > 0 or (deps ->> 'gateways')::int > 0
     or (deps ->> 'link_history')::int > 0 or (deps ->> 'users')::int > 0 then
    raise exception 'Este ativo possui dependências e não pode ser excluído' using errcode = '23503', detail = deps::text;
  end if;
  perform set_config('gaxeta.reason', coalesce(p_reason, ''), true);
  delete from public.gaxeta_assets where id = p_id;
  perform set_config('gaxeta.reason', '', true);
  return jsonb_build_object('deleted', p_id, 'dependencies', deps);
end $function$;

-- Dados cadastrais da corporação (nível 1). A raiz pode existir sem eles.
create function public.gaxeta_save_corporation(p_id uuid, p_name text, p_contact_email text, p_responsible_name text, p_phone text default null, p_slug text default null)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare a public.gaxeta_assets%rowtype; c gaxeta_private.corporations%rowtype;
begin
  if gaxeta_authz.my_role() is distinct from 'adm1' then raise insufficient_privilege; end if;
  if nullif(trim(p_name), '') is null then raise exception 'Informe o nome da corporação'; end if;
  if p_id is null then
    insert into public.gaxeta_assets (parent_id, kind, name) values (null, 'corporation', trim(p_name)) returning * into a;
  else
    update public.gaxeta_assets set name = trim(p_name) where id = p_id and kind = 'corporation' returning * into a;
    if not found then raise exception 'Corporação não encontrada'; end if;
  end if;
  insert into gaxeta_private.corporations (asset_id, slug, contact_email, responsible_name, phone)
  values (a.id, nullif(lower(trim(p_slug)), ''), nullif(lower(trim(p_contact_email)), ''), nullif(trim(p_responsible_name), ''), nullif(trim(p_phone), ''))
  on conflict (asset_id) do update set slug = coalesce(excluded.slug, gaxeta_private.corporations.slug),
    contact_email = excluded.contact_email, responsible_name = excluded.responsible_name, phone = excluded.phone, updated_at = now()
  returning * into c;
  perform gaxeta_private.audit('corporation.save', 'asset', a.id::text, a.id,
    jsonb_build_object('name', a.name, 'slug', c.slug, 'has_contact', c.contact_email is not null));
  return to_jsonb(a) || jsonb_build_object('slug', c.slug, 'contact_email', c.contact_email,
    'responsible_name', c.responsible_name, 'phone', c.phone,
    'complete', c.contact_email is not null and c.responsible_name is not null);
end $function$;

-- ---------------------------------------------------------------------------
-- Gateways: cadastro e edição reais, sempre sob empresa
-- ---------------------------------------------------------------------------
create function public.gaxeta_save_gateway(p_id uuid, p_company_id uuid, p_name text, p_identifier text)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare g public.gaxeta_gateways%rowtype;
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  if nullif(trim(p_name), '') is null or nullif(trim(p_identifier), '') is null then
    raise exception 'Informe nome e identificação do gateway';
  end if;
  if p_id is null then
    insert into public.gaxeta_gateways (company_id, name, identifier)
    values (p_company_id, trim(p_name), trim(p_identifier)) returning * into g;
  else
    update public.gaxeta_gateways set company_id = p_company_id, name = trim(p_name), identifier = trim(p_identifier)
     where id = p_id returning * into g;
    if not found then raise exception 'Gateway inexistente'; end if;
  end if;
  return to_jsonb(g);
end $function$;

create function public.gaxeta_delete_gateway(p_id uuid)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare n integer;
begin
  if gaxeta_authz.my_role() is distinct from 'adm1' then raise insufficient_privilege; end if;
  select count(*) into n from public.gaxeta_devices where gateway_id = p_id;
  if n > 0 then raise exception 'Há % sensor(es) vinculados a este gateway', n using errcode = '23503'; end if;
  delete from public.gaxeta_gateways where id = p_id;
  if not found then raise exception 'Gateway inexistente'; end if;
  return jsonb_build_object('deleted', p_id);
end $function$;

-- ---------------------------------------------------------------------------
-- Privilégios das funções novas (as antigas mantêm os que já tinham)
-- ---------------------------------------------------------------------------
revoke all on function
  public.gaxeta_link_sensor(text, uuid, text), public.gaxeta_unlink_sensor(text, text),
  public.gaxeta_set_sensor_gateway(text, uuid), public.gaxeta_rename_sensor(text, text),
  public.gaxeta_asset_dependencies(uuid), public.gaxeta_delete_asset(uuid, text),
  public.gaxeta_save_corporation(uuid, text, text, text, text, text),
  public.gaxeta_save_gateway(uuid, uuid, text, text), public.gaxeta_delete_gateway(uuid)
  from public, anon;
grant execute on function
  public.gaxeta_link_sensor(text, uuid, text), public.gaxeta_unlink_sensor(text, text),
  public.gaxeta_set_sensor_gateway(text, uuid), public.gaxeta_rename_sensor(text, text),
  public.gaxeta_asset_dependencies(uuid), public.gaxeta_delete_asset(uuid, text),
  public.gaxeta_save_corporation(uuid, text, text, text, text, text),
  public.gaxeta_save_gateway(uuid, uuid, text, text), public.gaxeta_delete_gateway(uuid)
  to authenticated, service_role;

commit;
