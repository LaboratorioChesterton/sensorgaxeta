-- =============================================================================
-- 07 · Ficha técnica do equipamento (TAG), nomes padronizados de Spot e busca
--      de sensores por TAG
-- Aditiva. Não toca ingestão, leituras, movimentos, estabilização, alertas,
-- políticas existentes nem os contratos usados pelo pacote já publicado.
--   * gaxeta_equipment_types: catálogo de tipos (chave estável + rótulo).
--   * gaxeta_equipment_details: extensão 1:1 de gaxeta_assets (kind = equipment).
--     Leitura pelo mesmo escopo dos ativos, só com acesso efetivo ("só caminho"
--     não lê a ficha). Escrita apenas por RPC.
--   * gaxeta_save_equipment: TAG + ficha numa única transação, reutilizando
--     gaxeta_save_asset (autorização, bloqueio por corporação e auditoria).
--   * gaxeta_equipment_overview: TAG, ficha, spots e sensores numa chamada.
--   * Spot: nomes novos ou alterados só LOA, LA ou UNICO (validado no servidor,
--     também para o cliente anterior). Nomes legados são preservados.
--   * gaxeta_devices_page: a busca passa a encontrar também pelo TAG do
--     equipamento. Mesma assinatura e mesmo formato de resposta.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- Catálogo de tipos de equipamento
-- ---------------------------------------------------------------------------
create table public.gaxeta_equipment_types (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,39}$'),
  label text not null check (length(trim(label)) between 1 and 60),
  sort_order integer not null default 0
);
insert into public.gaxeta_equipment_types (key, label, sort_order) values
  ('bomba_centrifuga',     'Bomba centrífuga',        10),
  ('bomba_biapoiada',      'Bomba biapoiada',         20),
  ('agitador',             'Agitador',                30),
  ('misturador',           'Misturador',              40),
  ('refinador',            'Refinador',               50),
  ('digestor',             'Digestor',                60),
  ('depurador',            'Depurador',               70),
  ('vaso_pressao',         'Vaso de pressão',         80),
  ('bomba_magnetica',      'Bomba magnética',         90),
  ('bomba_hermetica',      'Bomba hermética',        100),
  ('bomba_vacuo',          'Bomba de vácuo',         110),
  ('compressor',           'Compressor',             120),
  ('bomba_alta_pressao',   'Bomba de alta pressão',  130),
  ('bomba_baixa_pressao',  'Bomba de baixa pressão', 140);

alter table public.gaxeta_equipment_types enable row level security;
revoke all on public.gaxeta_equipment_types from public, anon, authenticated;
grant select on public.gaxeta_equipment_types to authenticated;
create policy equipment_types_select on public.gaxeta_equipment_types for select to authenticated
  using ((select gaxeta_authz.my_role()) is not null);

-- ---------------------------------------------------------------------------
-- Ficha técnica (1:1 com o ativo do tipo equipment). Campo vazio = ausência.
-- Dimensões aceitam a unidade no próprio texto (mm, pol). Quantidades são
-- inteiros não negativos. A regra de montagem é descritiva: não entra em cálculo.
-- ---------------------------------------------------------------------------
create table public.gaxeta_equipment_details (
  asset_id uuid primary key references public.gaxeta_assets(id) on delete cascade,
  equipment_type text references public.gaxeta_equipment_types(key) on update cascade,
  -- Processo
  fluid text,
  fluid_temperature text,
  density text,
  characteristics text,
  -- Equipamento e montagem
  manufacturer text,
  model text,
  shaft_size text,
  sleeve_size text,
  stud_size text,
  stud_diameter text,
  gland_bolt_count integer check (gland_bolt_count >= 0),
  -- Gaxeta
  ring_count integer check (ring_count >= 0),
  packing_type text,
  packing_model text,
  assembly_rule text,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint gaxeta_equipment_details_text_check check (
    coalesce(length(fluid), 0) <= 120 and coalesce(length(fluid_temperature), 0) <= 60
    and coalesce(length(density), 0) <= 60 and coalesce(length(characteristics), 0) <= 1000
    and coalesce(length(manufacturer), 0) <= 120 and coalesce(length(model), 0) <= 120
    and coalesce(length(shaft_size), 0) <= 60 and coalesce(length(sleeve_size), 0) <= 60
    and coalesce(length(stud_size), 0) <= 60 and coalesce(length(stud_diameter), 0) <= 60
    and coalesce(length(packing_type), 0) <= 120 and coalesce(length(packing_model), 0) <= 120
    and coalesce(length(assembly_rule), 0) <= 1000)
);
create index gaxeta_equipment_details_type_idx on public.gaxeta_equipment_details (equipment_type)
  where equipment_type is not null;

create function gaxeta_private.equipment_details_guard()
 returns trigger language plpgsql security definer set search_path to '' as $function$
begin
  if (select kind from public.gaxeta_assets where id = new.asset_id) is distinct from 'equipment' then
    raise exception 'A ficha técnica só existe para TAG (equipamento)';
  end if;
  new.updated_at := now();
  return new;
end $function$;
revoke all on function gaxeta_private.equipment_details_guard() from public, anon, authenticated, service_role;
create trigger gaxeta_equipment_details_guard before insert or update on public.gaxeta_equipment_details
  for each row execute function gaxeta_private.equipment_details_guard();

alter table public.gaxeta_equipment_details enable row level security;
revoke all on public.gaxeta_equipment_details from public, anon, authenticated;
grant select on public.gaxeta_equipment_details to authenticated;
-- Só com acesso efetivo ao TAG: um ancestral ou TAG visível apenas como caminho não lê a ficha.
create policy scope_equipment_details_select on public.gaxeta_equipment_details for select to authenticated
  using ((select gaxeta_authz.is_global_reader()) or asset_id in (select gaxeta_authz.accessible_asset_ids()));

-- ---------------------------------------------------------------------------
-- Spot: LOA, LA ou UNICO
-- ---------------------------------------------------------------------------
-- Equivalências inequívocas (maiúsculas/minúsculas, espaços e acento de ÚNICO).
create function gaxeta_private.spot_name_canonical(p_name text)
 returns text language sql immutable set search_path to '' as $$
  select case s.v when 'LOA' then 'LOA' when 'LA' then 'LA' when 'UNICO' then 'UNICO' end
    from (select translate(upper(regexp_replace(coalesce(p_name, ''), '\s+', '', 'g')), 'ÚúÙùÛûÜü', 'UUUUUUUU') as v) s
$$;
revoke all on function gaxeta_private.spot_name_canonical(text) from public, anon, authenticated, service_role;

-- Vale para qualquer caminho de escrita (RPC nova, RPC antiga ou manutenção).
-- Nome legado fora do padrão continua como está enquanto não for trocado: editar
-- só a posição não exige renomear.
create function gaxeta_private.point_name_guard()
 returns trigger language plpgsql security definer set search_path to '' as $function$
declare v text;
begin
  if new.kind <> 'point' then return new; end if;
  if tg_op = 'UPDATE' and new.name is not distinct from old.name then return new; end if;
  v := gaxeta_private.spot_name_canonical(new.name);
  if v is null then raise exception 'Nome do spot: escolha LOA, LA ou UNICO'; end if;
  new.name := v;
  return new;
end $function$;
revoke all on function gaxeta_private.point_name_guard() from public, anon, authenticated, service_role;
create trigger gaxeta_asset_point_name before insert or update of name on public.gaxeta_assets
  for each row execute function gaxeta_private.point_name_guard();

-- Normaliza só o que é equivalente sem dúvida (ex.: "loa", " Único "). O resto fica como está.
update public.gaxeta_assets
   set name = gaxeta_private.spot_name_canonical(name)
 where kind = 'point'
   and gaxeta_private.spot_name_canonical(name) is not null
   and name <> gaxeta_private.spot_name_canonical(name);

-- ---------------------------------------------------------------------------
-- Gravação atômica de TAG + ficha técnica
-- ---------------------------------------------------------------------------
create function gaxeta_private.detail_text(p_details jsonb, p_key text, p_label text, p_max integer)
 returns text language plpgsql immutable set search_path to '' as $function$
declare v text := nullif(trim(p_details ->> p_key), '');
begin
  if length(v) > p_max then raise exception '%: no máximo % caracteres', p_label, p_max; end if;
  return v;
end $function$;
create function gaxeta_private.detail_count(p_details jsonb, p_key text, p_label text)
 returns integer language plpgsql immutable set search_path to '' as $function$
declare v text := nullif(trim(p_details ->> p_key), '');
begin
  if v is null then return null; end if;
  if v !~ '^[0-9]{1,4}$' then raise exception '%: informe um número inteiro, sem sinal', p_label; end if;
  return v::integer;
end $function$;
revoke all on function gaxeta_private.detail_text(jsonb, text, text, integer), gaxeta_private.detail_count(jsonb, text, text)
  from public, anon, authenticated, service_role;

-- p_id nulo = novo TAG sob p_parent_id (área ou subárea). O TAG é o identificador
-- do equipamento: fica em `tag` e, para os clientes anteriores, também em `name`.
-- Registro legado com nome distinto do código mantém o nome.
create function public.gaxeta_save_equipment(p_id uuid, p_parent_id uuid, p_tag text, p_details jsonb default '{}'::jsonb)
 returns jsonb language plpgsql security definer set search_path to '' as $function$
declare v_tag text := trim(coalesce(p_tag, '')); v_d jsonb := coalesce(p_details, '{}'::jsonb);
        o public.gaxeta_assets%rowtype; old_d public.gaxeta_equipment_details%rowtype; new_d public.gaxeta_equipment_details%rowtype;
        v_type text; v_name text; v_asset jsonb; v_id uuid; v_before jsonb; v_after jsonb;
begin
  if gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  if jsonb_typeof(v_d) <> 'object' then raise exception 'Ficha técnica inválida'; end if;
  if v_tag = '' then raise exception 'Informe o TAG do equipamento'; end if;
  if length(v_tag) > 48 then raise exception 'TAG: no máximo 48 caracteres'; end if;
  v_type := nullif(trim(v_d ->> 'equipment_type'), '');
  if v_type is not null and not exists (select 1 from public.gaxeta_equipment_types t where t.key = v_type) then
    raise exception 'Tipo de equipamento desconhecido';
  end if;

  if p_id is null then
    if not gaxeta_authz.can_write_tree('equipment', p_parent_id) then raise insufficient_privilege; end if;
    if v_type is null then raise exception 'Selecione o tipo de equipamento'; end if;
    v_name := v_tag;
  else
    if not gaxeta_authz.can_write_tree('equipment', p_id) then raise insufficient_privilege; end if;
    select * into o from public.gaxeta_assets where id = p_id;
    if not found or o.kind <> 'equipment' then raise exception 'Equipamento não encontrado'; end if;
    select * into old_d from public.gaxeta_equipment_details where asset_id = p_id;
    -- Legado sem tipo pode continuar sem tipo; depois de informado, não volta a ficar vazio.
    if v_type is null and old_d.equipment_type is not null then raise exception 'Selecione o tipo de equipamento'; end if;
    v_name := case when o.tag <> '' and o.name <> o.tag then o.name else v_tag end;
  end if;

  -- Autorização por escopo, bloqueio por corporação, hierarquia e auditoria: os mesmos do contrato existente.
  v_asset := public.gaxeta_save_asset(p_id, coalesce(p_parent_id, o.parent_id), 'equipment', v_name, v_tag, '', null, null);
  v_id := (v_asset ->> 'id')::uuid;

  insert into public.gaxeta_equipment_details as d (
    asset_id, equipment_type, fluid, fluid_temperature, density, characteristics,
    manufacturer, model, shaft_size, sleeve_size, stud_size, stud_diameter, gland_bolt_count,
    ring_count, packing_type, packing_model, assembly_rule, updated_by)
  values (
    v_id, v_type,
    gaxeta_private.detail_text(v_d, 'fluid', 'Produto/fluido', 120),
    gaxeta_private.detail_text(v_d, 'fluid_temperature', 'Temperatura do fluido', 60),
    gaxeta_private.detail_text(v_d, 'density', 'Densidade', 60),
    gaxeta_private.detail_text(v_d, 'characteristics', 'Características', 1000),
    gaxeta_private.detail_text(v_d, 'manufacturer', 'Fabricante', 120),
    gaxeta_private.detail_text(v_d, 'model', 'Modelo', 120),
    gaxeta_private.detail_text(v_d, 'shaft_size', 'Tamanho do eixo', 60),
    gaxeta_private.detail_text(v_d, 'sleeve_size', 'Tamanho da luva', 60),
    gaxeta_private.detail_text(v_d, 'stud_size', 'Tamanho do prisioneiro', 60),
    gaxeta_private.detail_text(v_d, 'stud_diameter', 'Diâmetro do prisioneiro', 60),
    gaxeta_private.detail_count(v_d, 'gland_bolt_count', 'Parafusos do preme-gaxeta'),
    gaxeta_private.detail_count(v_d, 'ring_count', 'Quantidade de anéis'),
    gaxeta_private.detail_text(v_d, 'packing_type', 'Tipo de gaxeta', 120),
    gaxeta_private.detail_text(v_d, 'packing_model', 'Modelo de gaxeta', 120),
    gaxeta_private.detail_text(v_d, 'assembly_rule', 'Regra de montagem', 1000),
    auth.uid())
  on conflict (asset_id) do update set
    equipment_type = excluded.equipment_type, fluid = excluded.fluid, fluid_temperature = excluded.fluid_temperature,
    density = excluded.density, characteristics = excluded.characteristics, manufacturer = excluded.manufacturer,
    model = excluded.model, shaft_size = excluded.shaft_size, sleeve_size = excluded.sleeve_size,
    stud_size = excluded.stud_size, stud_diameter = excluded.stud_diameter, gland_bolt_count = excluded.gland_bolt_count,
    ring_count = excluded.ring_count, packing_type = excluded.packing_type, packing_model = excluded.packing_model,
    assembly_rule = excluded.assembly_rule, updated_by = excluded.updated_by
  returning d.* into new_d;

  v_before := jsonb_strip_nulls(to_jsonb(old_d) - 'asset_id' - 'updated_at' - 'updated_by');
  v_after := jsonb_strip_nulls(to_jsonb(new_d) - 'asset_id' - 'updated_at' - 'updated_by');
  if v_before is distinct from v_after then
    perform gaxeta_private.audit('equipment.details', 'asset', v_id::text, (v_asset ->> 'corporation_id')::uuid,
      jsonb_build_object('tag', v_tag, 'before', v_before, 'after', v_after));
  end if;

  return v_asset || jsonb_build_object(
    'details', to_jsonb(new_d) - 'asset_id',
    'equipment_type_label', (select t.label from public.gaxeta_equipment_types t where t.key = new_d.equipment_type));
end $function$;

-- ---------------------------------------------------------------------------
-- Resumo do TAG: ficha, spots e sensores vinculados numa única chamada.
-- SECURITY INVOKER: valem as políticas de quem chama. Quem vê o TAG só como
-- caminho recebe apenas os spots que pode ver, sem a ficha.
-- ---------------------------------------------------------------------------
create function public.gaxeta_equipment_overview(p_id uuid)
 returns jsonb language plpgsql stable set search_path to '' set plan_cache_mode to force_custom_plan as $function$
declare v_asset jsonb; v_details jsonb; v_spots jsonb; v_total bigint; v_sensors bigint;
begin
  select to_jsonb(x) into v_asset from (
    select e.id, e.parent_id, e.kind, e.name, e.tag, e.corporation_id, gaxeta_authz.asset_access(e.id) as access
      from public.gaxeta_assets e where e.id = p_id and e.kind = 'equipment') x;
  if v_asset is null then raise exception 'Equipamento não encontrado'; end if;

  select to_jsonb(x) - 'asset_id' into v_details from (
    select d.*, t.label as equipment_type_label
      from public.gaxeta_equipment_details d left join public.gaxeta_equipment_types t on t.key = d.equipment_type
     where d.asset_id = p_id) x;

  select count(*), count(d.sensor_id),
         coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'name', s.name, 'position', s."position",
           'standard_name', s.name in ('LOA', 'LA', 'UNICO'),
           'sensor', case when d.sensor_id is null then null else to_jsonb(d) end)
           order by array_position(array['LOA', 'LA', 'UNICO'], s.name) nulls last, lower(s.name), s.id), '[]'::jsonb)
    into v_total, v_sensors, v_spots
    from (select a.id, a.name, a."position" from public.gaxeta_assets a
           where a.parent_id = p_id and a.kind = 'point' order by lower(a.name), a.id limit 500) s
    left join public.gaxeta_devices d on d.measurement_point_id = s.id and d.origin = 'esp32';

  return jsonb_build_object('server_time', now(), 'asset', v_asset, 'details', v_details,
    'spots', v_spots, 'spot_count', v_total, 'sensor_count', v_sensors);
end $function$;

revoke all on function public.gaxeta_save_equipment(uuid, uuid, text, jsonb), public.gaxeta_equipment_overview(uuid) from public, anon;
grant execute on function public.gaxeta_save_equipment(uuid, uuid, text, jsonb), public.gaxeta_equipment_overview(uuid)
  to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Sensores: a busca encontra também pelo TAG (ou nome legado) do equipamento
-- em que o sensor está instalado. Demais filtros, ordem e resposta inalterados.
-- ---------------------------------------------------------------------------
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
    v_sql := v_sql || $q$ and (d.sensor_id ilike '%' || $2 || '%' or d.label ilike '%' || $2 || '%' or d.wifi_mac ilike '%' || $2 || '%' or d.ble_mac ilike '%' || $2 || '%'
      or d.measurement_point_id in (select pt.id from public.gaxeta_assets pt join public.gaxeta_assets eq on eq.id = pt.parent_id
                                     where pt.kind = 'point' and eq.kind = 'equipment'
                                       and (eq.tag ilike '%' || $2 || '%' or eq.name ilike '%' || $2 || '%')))$q$;
  end if;
  execute 'select count(*)' || v_sql into v_total using p_asset_id, v_q;
  execute $q$select coalesce(jsonb_agg(to_jsonb(x) order by x.label, x.sensor_id), '[]'::jsonb) from (select d.*$q$ || v_sql
       || ' order by d.label, d.sensor_id limit $3 offset $4) x' into v_items using p_asset_id, v_q, v_limit, v_offset;
  return jsonb_build_object('server_time', now(), 'total', v_total, 'items', v_items);
end $function$;

commit;
