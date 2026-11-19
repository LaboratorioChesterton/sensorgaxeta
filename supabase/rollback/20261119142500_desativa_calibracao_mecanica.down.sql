-- Reversão da migração 13: devolve à interface as sete operações do ciclo de gaxeta.
-- Nenhum dado foi apagado pela migração 13; a reversão só repõe a permissão e os comentários.
begin;
set local lock_timeout = '3s';

grant execute on function
  public.gaxeta_record_gland_event(text, text, text, uuid, text, numeric, numeric),
  public.gaxeta_confirm_gland_anchor(text, text, text, text, boolean),
  public.gaxeta_commission_gland(text, text, uuid),
  public.gaxeta_save_gland_profile(text, text, uuid, jsonb),
  public.gaxeta_gland_history(text, timestamptz, timestamptz),
  public.gaxeta_gland_status(text, text),
  public.gaxeta_gland_summary(text[])
  to authenticated;

comment on table gaxeta_private.gland_events is
  'Eventos imutáveis do ciclo de gaxeta por instalação (vínculo sensor–spot). maintenance: serviço em andamento; replacement/adjustment: nova referência de 100 % com a distância medida (initial_mm) e, se informada, a distância de fim de ajuste (end_mm); check: conferência com paquímetro, que mede a escala mm por contagem.';
comment on table gaxeta_private.gland_anchors is
  'Amostra que confirmou cada evento do ciclo de gaxeta (regra 2). window: aprovada sozinha, dentro da faixa elétrica esperada da marca superior; confirmed: confirmada pelo técnico com a marca mantida; check: leitura associada a uma conferência de medida. Os valores são copiados da leitura no momento da aprovação: pacote atrasado, nova conferência ou recálculo não trocam a referência.';
comment on table gaxeta_private.gland_profiles is
  'Perfil elétrico e mecânico medido de uma instalação, versionado. high_value ± high_tolerance: faixa esperada da marca superior (100 %); low_value: valor elétrico da marca de fim de ajuste (0 %); valid_lo..valid_hi: faixa em que a resposta foi comprovada linear; mm_per_unit: razão de transmissão medida e documentada (note). Cada versão vale da sua criação em diante; leituras anteriores continuam com a versão da época.';

notify pgrst, 'reload schema';
commit;
