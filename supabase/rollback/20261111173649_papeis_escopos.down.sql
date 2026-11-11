-- =============================================================================
-- REVERSÃO da migração 02 · papéis e escopos
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

-- ATENÇÃO: descarta cadastros de usuários, concessões, convites e dados de corporação.
-- Exportar antes, se houver algo a preservar. Falha (de propósito) se a migração 05
-- ainda estiver aplicada, pois as políticas dependem do schema gaxeta_authz.
drop function gaxeta_authz.can_operate_point(uuid);
drop function gaxeta_authz.can_write_tree(text, uuid);
drop function gaxeta_authz.visible_link_windows();
drop function gaxeta_authz.asset_access(uuid);
drop function gaxeta_authz.visible_asset_ids();
drop function gaxeta_authz.accessible_asset_ids();
drop function gaxeta_authz.my_corporation();
drop function gaxeta_authz.is_global_reader();
drop function gaxeta_authz.my_role();
drop schema gaxeta_authz;
drop table gaxeta_private.corporations;
drop table gaxeta_private.invites;
drop table gaxeta_private.access_grants;
drop table gaxeta_private.user_profiles;
drop function gaxeta_private.grant_guard();
drop function gaxeta_private.profile_guard();
commit;
