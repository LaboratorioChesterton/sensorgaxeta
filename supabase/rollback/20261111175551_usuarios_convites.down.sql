-- =============================================================================
-- REVERSÃO da migração 04 · usuários e convites
-- Aplicar em ordem inversa (06 → 01). Cada arquivo é independente do frontend.
-- =============================================================================
begin;
set local lock_timeout = '5s';

drop function public.gaxeta_my_context();
drop function public.gaxeta_admin_invite_user(text, text, text, uuid, boolean, jsonb);
drop function public.gaxeta_admin_resend_invite(uuid);
drop function public.gaxeta_admin_revoke_invite(uuid);
drop function public.gaxeta_service_invite_result(uuid, boolean, uuid, text, timestamptz);
drop function public.gaxeta_activate_invite();
drop function public.gaxeta_admin_set_access(uuid, boolean, jsonb);
drop function public.gaxeta_admin_set_role(uuid, text);
drop function public.gaxeta_admin_set_status(uuid, text);
drop function public.gaxeta_admin_delete_user(uuid);
drop function public.gaxeta_admin_users(text, text, text, uuid, uuid, integer, integer);
drop function public.gaxeta_admin_user_detail(uuid);
drop function public.gaxeta_admin_preview_access(uuid, jsonb, uuid);
drop function public.gaxeta_admin_audit(integer, integer, text, text, uuid);
drop function gaxeta_private.replace_grants(uuid, uuid, jsonb);
drop function gaxeta_private.normalize_grants(uuid, jsonb);
drop function gaxeta_private.require_user_admin(boolean);
commit;
