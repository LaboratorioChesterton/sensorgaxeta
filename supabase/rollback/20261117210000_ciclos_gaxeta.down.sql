-- Reversão da migração 08 (ciclos de gaxeta). Aplicar depois da reversão da 09.
-- Descarta os eventos de manutenção, troca e reajuste. Vínculos, leituras, movimentos
-- e ingestão ficam intactos.
begin;
set local lock_timeout = '3s';
drop function public.gaxeta_gland_status(text, text);
drop function public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric);
drop function gaxeta_private.gland_anchor(text, timestamptz, timestamptz);
drop function gaxeta_private.gland_sample_ok(numeric, numeric);
drop table gaxeta_private.gland_events;
notify pgrst, 'reload schema';
commit;
