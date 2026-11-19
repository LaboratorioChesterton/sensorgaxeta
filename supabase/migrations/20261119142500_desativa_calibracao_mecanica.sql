-- Migração 13: o ciclo de gaxeta (calibração mecânica) sai de operação.
--
-- APLICAR SÓ DEPOIS de publicar o site e instalar o APK da entrega de 19/11/2026. O site e o
-- APK anteriores chamam gaxeta_gland_summary a cada atualização e gaxeta_gland_status ao abrir
-- Detalhes; com esta migração essas chamadas passam a ser negadas.
--
-- O que muda: as sete operações públicas do ciclo deixam de ser executáveis pela interface
-- (registrar engaxetamento/manutenção, confirmar marca, conferir medida, comissionar, gravar
-- perfil, histórico e estado do ciclo, resumo mecânico).
--
-- O que fica, como arquivo: as tabelas gaxeta_private.gland_events, gland_anchors e
-- gland_profiles, com todas as linhas, e as funções internas. Nada é apagado nem editado, de
-- modo que a reversão (um grant) devolve tudo como estava. Elas já não são alcançadas por
-- nenhuma consulta operacional: a ingestão não as usa desde a migração 12 e o esquema
-- gaxeta_private não é exposto pela API.
--
-- Fora do escopo, intocados: sensores, vínculos, equipamentos, spots, leituras elétricas,
-- mudanças de 5 p.p. (gaxeta_movements) e auditoria de acesso.
begin;
set local lock_timeout = '3s';

revoke execute on function
  public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric, numeric),
  public.gaxeta_confirm_gland_anchor(text, text, text, text, boolean),
  public.gaxeta_commission_gland(text, text, uuid),
  public.gaxeta_save_gland_profile(text, text, uuid, jsonb),
  public.gaxeta_gland_history(text, timestamptz, timestamptz),
  public.gaxeta_gland_status(text, text),
  public.gaxeta_gland_summary(text[])
  from public, anon, authenticated, service_role;

comment on table gaxeta_private.gland_events is
  'ARQUIVO (fora de operação desde a migração 13, 19/11/2026). Registros de engaxetamento, manutenção e conferência de medida do antigo ciclo de gaxeta. Somente leitura para auditoria; nenhuma rotina operacional consulta ou grava aqui.';
comment on table gaxeta_private.gland_anchors is
  'ARQUIVO (fora de operação desde a migração 13, 19/11/2026). Amostras que serviram de referência no antigo ciclo de gaxeta.';
comment on table gaxeta_private.gland_profiles is
  'ARQUIVO (fora de operação desde a migração 13, 19/11/2026). Perfis de instalação do antigo comissionamento em dois pontos.';

notify pgrst, 'reload schema';
commit;
