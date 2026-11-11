-- =============================================================================
-- PROPOSTA — NÃO APLICADA. Não está no histórico de migrações.
-- Resolve dois limites conhecidos da interface:
--   1. ler os dados de contato de uma corporação (hoje só há gravação);
--   2. permitir excluir corporação que só tenha convites encerrados.
-- Revisar e testar em desenvolvimento antes de virar migração.
-- =============================================================================
begin;
set local lock_timeout = '5s';

create function public.gaxeta_corporation_detail(p_id uuid)
 returns jsonb language plpgsql stable security definer set search_path to '' as $function$
declare c gaxeta_private.corporations%rowtype;
begin
  if gaxeta_authz.my_role() not in ('adm1', 'adm2') or gaxeta_authz.my_role() is null then raise insufficient_privilege; end if;
  select * into c from gaxeta_private.corporations where asset_id = p_id;
  return jsonb_build_object('asset_id', p_id, 'slug', c.slug, 'contact_email', c.contact_email,
    'responsible_name', c.responsible_name, 'phone', c.phone,
    'complete', c.contact_email is not null and c.responsible_name is not null);
end $function$;
revoke all on function public.gaxeta_corporation_detail(uuid) from public, anon;
grant execute on function public.gaxeta_corporation_detail(uuid) to authenticated;

-- 2. Convites e exclusão de corporação (decisão pendente, sem SQL aqui):
--    hoje invites.corporation_id é RESTRICT, então um convite revogado ou aceito
--    impede excluir a corporação. Opções: gaxeta_delete_asset passar a contar os
--    convites abertos como dependência e apagar os encerrados na mesma transação;
--    ou trocar a chave por ON DELETE CASCADE só para convites encerrados (via gatilho).

commit;
