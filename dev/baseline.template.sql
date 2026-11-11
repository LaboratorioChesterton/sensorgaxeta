-- =============================================================================
-- Gaxeta Gestão de Ativos — BASELINE dos objetos do aplicativo
-- Capturada do catálogo de produção (projeto SensorGaxeta) em 11/11/2026.
--
-- Contém somente estrutura e contratos do aplicativo: schemas public (objetos
-- gaxeta_*) e gaxeta_private. Não contém dados, hashes de ingestão, usuários,
-- sessões ou segredos. Componentes gerenciados pelo Supabase (auth, storage,
-- realtime, extensions, papéis, privilégios padrão) NÃO fazem parte deste arquivo.
--
-- Uso: base limpa (branch/local) para reproduzir a produção antes das migrações.
-- NÃO reaplicar em produção: lá os objetos já existem. Para adotar, registrar a
-- versão como aplicada (ver docs/ADOCAO_BASELINE.md).
-- Corpos de função: texto idêntico ao da produção, com quebras de linha em LF.
-- =============================================================================
begin;

create schema gaxeta_private;
revoke all on schema gaxeta_private from public;

-- ----------------------------------------------------------------------------
-- Tabelas privadas
-- ----------------------------------------------------------------------------
create table gaxeta_private.ingest_keys (
  token_hash bytea not null,
  label text not null,
  enabled boolean not null default true,
  max_devices integer not null default 10,
  created_at timestamp with time zone not null default now(),
  constraint ingest_keys_pkey primary key (token_hash),
  constraint ingest_keys_max_devices_check check (max_devices >= 1 and max_devices <= 100)
);
create table gaxeta_private.platform_members (
  email text not null,
  enabled boolean not null default true,
  constraint platform_members_pkey primary key (email),
  constraint platform_members_email_check check (email = lower(email))
);
alter table gaxeta_private.ingest_keys enable row level security;
alter table gaxeta_private.platform_members enable row level security;

-- ----------------------------------------------------------------------------
-- Tabelas públicas
-- ----------------------------------------------------------------------------
create table public.gaxeta_assets (
  id uuid not null default gen_random_uuid(),
  parent_id uuid,
  kind text not null,
  name text not null,
  tag text not null default ''::text,
  "position" text not null default ''::text,
  created_at timestamp with time zone not null default now(),
  constraint gaxeta_assets_pkey primary key (id),
  constraint gaxeta_assets_parent_id_fkey foreign key (parent_id) references public.gaxeta_assets(id) on delete restrict,
  constraint gaxeta_assets_check check ((kind = 'corporation'::text) = (parent_id is null)),
  constraint gaxeta_assets_kind_check check (kind = any (array['corporation'::text, 'company'::text, 'area'::text, 'subarea'::text, 'equipment'::text, 'point'::text])),
  constraint gaxeta_assets_name_check check (length(trim(both from name)) >= 1 and length(trim(both from name)) <= 100),
  constraint gaxeta_assets_position_check check (length("position") <= 100),
  constraint gaxeta_assets_tag_check check (length(tag) <= 48)
);
create index gaxeta_assets_parent_idx on public.gaxeta_assets using btree (parent_id);

create table public.gaxeta_gateways (
  id uuid not null default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  identifier text not null,
  created_at timestamp with time zone not null default now(),
  constraint gaxeta_gateways_pkey primary key (id),
  constraint gaxeta_gateways_identifier_key unique (identifier),
  constraint gaxeta_gateways_company_id_fkey foreign key (company_id) references public.gaxeta_assets(id) on delete restrict,
  constraint gaxeta_gateways_identifier_check check (length(trim(both from identifier)) >= 1 and length(trim(both from identifier)) <= 64),
  constraint gaxeta_gateways_name_check check (length(trim(both from name)) >= 1 and length(trim(both from name)) <= 100)
);

create table public.gaxeta_devices (
  sensor_id text not null,
  label text not null default 'Sensor de gaxeta'::text,
  origin text not null,
  wifi_mac text,
  created_at timestamp with time zone not null default now(),
  last_received_at timestamp with time zone,
  last_sampled_at timestamp with time zone,
  last_boot_id text,
  last_sequence bigint,
  last_percent numeric,
  last_position_mm numeric,
  last_voltage_v numeric,
  last_rssi integer,
  reading_count bigint not null default 0,
  measurement_point_id uuid,
  gateway_id uuid,
  desired_label text,
  applied_label text,
  ble_mac text,
  firmware_version text,
  adc_noise numeric,
  transport text not null default 'direct_wifi'::text,
  config_updated_at timestamp with time zone,
  stable_percent numeric,
  stable_since timestamp with time zone,
  constraint gaxeta_devices_pkey primary key (sensor_id),
  constraint gaxeta_devices_measurement_point_id_key unique (measurement_point_id),
  constraint gaxeta_devices_measurement_point_id_fkey foreign key (measurement_point_id) references public.gaxeta_assets(id) on delete restrict,
  constraint gaxeta_devices_gateway_id_fkey foreign key (gateway_id) references public.gaxeta_gateways(id) on delete restrict,
  constraint gaxeta_devices_origin_check check (origin = any (array['esp32'::text, 'integration_test'::text])),
  constraint gaxeta_devices_sensor_id_check check (sensor_id ~ '^[A-Z0-9-]{6,48}$'::text)
);

create table public.gaxeta_readings (
  id bigint generated always as identity,
  sensor_id text not null,
  boot_id text not null,
  sequence bigint not null,
  received_at timestamp with time zone not null default now(),
  sampled_at timestamp with time zone,
  travel_percent numeric(5,2) not null,
  position_mm numeric(9,3) not null,
  voltage_v numeric(7,4) not null,
  adc_raw numeric(8,3),
  rssi integer,
  uptime_ms bigint,
  adc_noise numeric,
  stable_percent numeric,
  constraint gaxeta_readings_pkey primary key (id),
  constraint gaxeta_readings_sensor_id_boot_id_sequence_key unique (sensor_id, boot_id, sequence),
  constraint gaxeta_readings_sensor_id_fkey foreign key (sensor_id) references public.gaxeta_devices(sensor_id),
  constraint gaxeta_readings_adc_raw_check check (adc_raw >= 0::numeric and adc_raw <= 4095::numeric),
  constraint gaxeta_readings_boot_id_check check (boot_id ~ '^[a-f0-9]{16,64}$'::text),
  constraint gaxeta_readings_position_mm_check check (position_mm >= 0::numeric and position_mm <= 10000::numeric),
  constraint gaxeta_readings_rssi_check check (rssi >= '-127'::integer and rssi <= 0),
  constraint gaxeta_readings_sequence_check check (sequence >= 1 and sequence <= '4294967295'::bigint),
  constraint gaxeta_readings_travel_percent_check check (travel_percent >= 0::numeric and travel_percent <= 100::numeric),
  constraint gaxeta_readings_uptime_ms_check check (uptime_ms >= 0 and uptime_ms <= '4294967295'::bigint),
  constraint gaxeta_readings_voltage_v_check check (voltage_v >= 0::numeric and voltage_v <= 5::numeric)
);
create index gaxeta_readings_sensor_time on public.gaxeta_readings using btree (sensor_id, received_at desc);
create index gaxeta_readings_sensor_time_idx on public.gaxeta_readings using btree (sensor_id, received_at);

create table public.gaxeta_movements (
  reading_id bigint not null,
  sensor_id text not null,
  received_at timestamp with time zone not null,
  previous_percent numeric,
  stable_percent numeric not null,
  rule_version integer not null default 1,
  constraint gaxeta_movements_pkey primary key (reading_id),
  constraint gaxeta_movements_reading_id_fkey foreign key (reading_id) references public.gaxeta_readings(id) on delete restrict,
  constraint gaxeta_movements_sensor_id_fkey foreign key (sensor_id) references public.gaxeta_devices(sensor_id),
  constraint gaxeta_movements_stable_percent_check check (stable_percent >= 0::numeric and stable_percent <= 100::numeric)
);
create index gaxeta_movements_sensor_time on public.gaxeta_movements using btree (sensor_id, received_at, reading_id);

-- ----------------------------------------------------------------------------
-- Funções
-- ----------------------------------------------------------------------------
create function gaxeta_private.stabilize(p_previous numeric, p_raw numeric)
 returns numeric
 language sql
 immutable
 set search_path to ''
as $function$
 select case when p_raw is null or p_raw not between 0 and 100 then p_previous
 when p_previous is null or abs(p_raw-p_previous)>=5 then p_raw else p_previous end
$function$;

create function public.gaxeta_has_access()
 returns boolean
 language sql
 stable security definer
 set search_path to ''
as $function$
 select exists(select 1 from auth.users u join gaxeta_private.platform_members m on m.email=lower(u.email)
 where u.id=auth.uid() and u.email_confirmed_at is not null and m.enabled)
$function$;

create function public.gaxeta_ingest_v3(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$@@INGEST_V3_BODY@@$function$;

create function public.gaxeta_ingest(p_token text, p_reading jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
 set statement_timeout to '4s'
as $function$
declare result jsonb; name text; noise numeric; d public.gaxeta_devices%rowtype; next_value numeric;
begin
 result:=public.gaxeta_ingest_v3(p_token,p_reading);
 if coalesce((result->>'duplicate')::boolean,false) then return result; end if;
 name:=p_reading->>'device_name';
 if p_reading ? 'adc_noise' then
 noise:=(p_reading->>'adc_noise')::numeric;
 if noise not between 0 and 4095 then raise exception 'Ruído ADC inválido'; end if;
 end if;
 select * into d from public.gaxeta_devices where sensor_id=p_reading->>'sensor_id' for update;
 if d.last_boot_id=p_reading->>'boot_id' and d.last_sequence=(p_reading->>'sequence')::bigint then
 next_value:=gaxeta_private.stabilize(d.stable_percent,d.last_percent);
 if next_value is distinct from d.stable_percent then
 insert into public.gaxeta_movements(reading_id,sensor_id,received_at,previous_percent,stable_percent)
 values((result->>'id')::bigint,d.sensor_id,(result->>'received_at')::timestamptz,d.stable_percent,next_value);
 d.stable_since:=(result->>'received_at')::timestamptz;
 end if;
 d.stable_percent:=next_value;
 update public.gaxeta_devices set stable_percent=d.stable_percent,stable_since=d.stable_since,
 applied_label=case when name ~ '^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$' then name else applied_label end,
 ble_mac=coalesce(left(p_reading->>'ble_mac',32),ble_mac),
 firmware_version=coalesce(left(p_reading->>'firmware_version',32),firmware_version),
 adc_noise=coalesce(noise,adc_noise),transport='direct_wifi' where sensor_id=d.sensor_id;
 end if;
 update public.gaxeta_readings set adc_noise=noise,stable_percent=d.stable_percent where id=(result->>'id')::bigint;
 return result;
end $function$;

create function public.gaxeta_snapshot(p_sensor_id text default null::text, p_minutes integer default 60)
 returns jsonb
 language plpgsql
 stable
 set search_path to ''
 set statement_timeout to '4s'
as $function$@@SNAPSHOT_BODY@@$function$;

create function public.gaxeta_history(p_sensor_id text, p_from timestamp with time zone, p_to timestamp with time zone)
 returns jsonb
 language plpgsql
 stable
 set search_path to ''
 set statement_timeout to '8s'
as $function$
declare result jsonb; bucket_seconds numeric;
begin
 if not public.gaxeta_has_access() then raise insufficient_privilege; end if;
 if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to-p_from<interval '1 second' or p_to-p_from>interval '366 days' then
 raise exception 'Selecione um intervalo entre 1 segundo e 366 dias'; end if;
 bucket_seconds:=greatest(1,extract(epoch from(p_to-p_from))/600);
 with source as (
 select *,floor(extract(epoch from(received_at-p_from))/bucket_seconds) bucket
 from public.gaxeta_readings where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to
 ), buckets as (
 select min(received_at) received_at,avg(travel_percent) travel_percent,min(travel_percent) min_percent,
 max(travel_percent) max_percent,avg(position_mm) position_mm,avg(voltage_v) voltage_v,
 (array_agg(stable_percent order by received_at desc,id desc))[1] stable_percent,count(*) samples
 from source group by bucket
 ), events as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at>=p_from and received_at<=p_to
 order by received_at,reading_id limit 5001
 ), seed as (
 select * from public.gaxeta_movements where sensor_id=p_sensor_id and received_at<p_from order by received_at desc,reading_id desc limit 1
 ) select jsonb_build_object(
 'history',coalesce((select jsonb_agg(to_jsonb(b) order by received_at) from buckets b),'[]'::jsonb),
 'movements',coalesce((select jsonb_agg(to_jsonb(e) order by received_at,reading_id) from events e),'[]'::jsonb),
 'seed',(select to_jsonb(s) from seed s),'movements_truncated',(select count(*)>5000 from events),
 'stats',(select jsonb_build_object('count',count(*),'min',min(travel_percent),'max',max(travel_percent),'last_received_at',max(received_at)) from source),
 'from',p_from,'to',p_to,'bucket_seconds',bucket_seconds,'rule_version',1) into result;
 return result;
end $function$;

create function public.gaxeta_configure_sensor(p_sensor_id text, p_label text, p_point_id uuid default null::uuid, p_gateway_id uuid default null::uuid)
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

create function public.gaxeta_save_asset(p_id uuid, p_parent_id uuid, p_kind text, p_name text, p_tag text, p_position text, p_sensor_id text default null::text, p_sensor_label text default null::text)
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

create function public.gaxeta_validate_asset()
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

create function public.gaxeta_validate_asset_links()
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

create function public.gaxeta_validate_gateway()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
 if (select kind from public.gaxeta_assets where id=new.company_id) is distinct from 'company' then
 raise exception 'O gateway precisa pertencer a uma empresa'; end if;
 return new;
end $function$;

comment on function public.gaxeta_ingest_v3(text, jsonb) is 'Piloto: escrita autenticada com token SHA-256 privado; chave publicável não autoriza escrita por si só.';
comment on function public.gaxeta_snapshot(text, integer) is 'Piloto público de bancada: exclui validações de integração e limita pontos do gráfico.';

-- ----------------------------------------------------------------------------
-- Gatilhos
-- ----------------------------------------------------------------------------
create trigger gaxeta_asset_hierarchy before insert or update on public.gaxeta_assets
  for each row execute function public.gaxeta_validate_asset();
create trigger gaxeta_asset_link_consistency after update of parent_id on public.gaxeta_assets
  for each row execute function public.gaxeta_validate_asset_links();
create trigger gaxeta_gateway_company before insert or update on public.gaxeta_gateways
  for each row execute function public.gaxeta_validate_gateway();

-- ----------------------------------------------------------------------------
-- RLS e políticas (estado de produção em 11/11/2026)
-- ----------------------------------------------------------------------------
alter table public.gaxeta_assets enable row level security;
alter table public.gaxeta_devices enable row level security;
alter table public.gaxeta_gateways enable row level security;
alter table public.gaxeta_movements enable row level security;
alter table public.gaxeta_readings enable row level security;

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

-- ----------------------------------------------------------------------------
-- Privilégios: reproduz as ACLs efetivas, independentemente dos padrões do schema
-- ----------------------------------------------------------------------------
revoke all on gaxeta_private.ingest_keys, gaxeta_private.platform_members from public, anon, authenticated, service_role;

revoke all on public.gaxeta_assets, public.gaxeta_gateways, public.gaxeta_devices,
  public.gaxeta_readings, public.gaxeta_movements from public, anon, authenticated, service_role;
grant all on public.gaxeta_assets, public.gaxeta_gateways to authenticated, service_role;
grant all on public.gaxeta_devices, public.gaxeta_readings, public.gaxeta_movements to service_role;
grant select on public.gaxeta_devices, public.gaxeta_readings to anon, authenticated;
grant select on public.gaxeta_movements to authenticated;

revoke all on sequence public.gaxeta_readings_id_seq from public, anon, authenticated, service_role;
grant all on sequence public.gaxeta_readings_id_seq to service_role;

revoke all on function gaxeta_private.stabilize(numeric, numeric) from public, anon, authenticated, service_role;

revoke all on function public.gaxeta_has_access() from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_has_access() to anon, authenticated, service_role;

revoke all on function public.gaxeta_ingest(text, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_ingest(text, jsonb) to anon, authenticated, service_role;

revoke all on function public.gaxeta_ingest_v3(text, jsonb) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_ingest_v3(text, jsonb) to service_role;

revoke all on function public.gaxeta_snapshot(text, integer) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_snapshot(text, integer) to authenticated, service_role;

revoke all on function public.gaxeta_history(text, timestamptz, timestamptz) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_history(text, timestamptz, timestamptz) to authenticated, service_role;

revoke all on function public.gaxeta_configure_sensor(text, text, uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_configure_sensor(text, text, uuid, uuid) to authenticated, service_role;

revoke all on function public.gaxeta_save_asset(uuid, uuid, text, text, text, text, text, text) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_save_asset(uuid, uuid, text, text, text, text, text, text) to authenticated, service_role;

-- Funções de gatilho mantêm os privilégios padrão observados (PUBLIC e papéis da API).
grant execute on function public.gaxeta_validate_asset(), public.gaxeta_validate_asset_links(),
  public.gaxeta_validate_gateway() to public, anon, authenticated, service_role;

commit;
