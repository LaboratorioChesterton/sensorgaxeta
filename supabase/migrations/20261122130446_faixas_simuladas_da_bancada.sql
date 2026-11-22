-- Migração 16: faixas simuladas da bancada (preferência de apresentação por vínculo sensor–spot).
--
-- Para a demonstração do L2-956: a tela mostra, junto do percentual de bancada, o nome e a cor da
-- FAIXA SIMULADA (Sem ajuste, Baixo, Médio, Alto). Ligadas por padrão; quem opera o spot desliga
-- e liga. A escolha vale para todos os clientes (site e aplicativo) e não vaza entre sensores.
--
-- Aditiva e fora do caminho da placa:
--   * tabela nova gaxeta_private.mag_bench_prefs (uma linha por vínculo, só quando alguém muda o
--     padrão). Nenhuma coluna nova em gaxeta_devices, gaxeta_readings ou mag_bench_modes; a
--     ingestão (gaxeta_ingest_v4) não é tocada e nada é gravado por amostra;
--   * função nova gaxeta_mag_bench_set_bands (mesmo escopo de operação do Modo bancada);
--   * gaxeta_mag_summary ganha a chave bench_bands (leitura para quem já pode ver o sensor);
--   * gaxeta_mag_bench_start deixa de encerrar a bancada quando recebe a MESMA faixa vigente.
-- Mudar a preferência não abre sessão, não pede referência, não reescreve histórico e não cria
-- movimento, evento ou registro de manutenção. A bancada ativa conserva a âncora.
--
-- As duas funções que mudam NÃO são reescritas aqui: o bloco do item 3 lê a definição que está
-- no banco (a da migração 15), confere que o trecho de encaixe existe exatamente uma vez e grava
-- a mesma função com o acréscimo. Fora desse acréscimo, nenhum caractere muda; se a função no
-- banco não estiver na forma esperada, a migração inteira é desfeita. Os corpos resultantes estão
-- por extenso, para leitura, na reversão (forma anterior) e nos testes (tests/88).
-- Reversão: supabase/rollback/20261122130446_faixas_simuladas_da_bancada.down.sql
begin;
set local lock_timeout = '3s';

-- ---------------------------------------------------------------------------
-- 1. Preferência por vínculo
-- ---------------------------------------------------------------------------
create table gaxeta_private.mag_bench_prefs (
  link_id bigint primary key references gaxeta_private.device_links(id),
  show_bands boolean not null default true,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid
);
comment on table gaxeta_private.mag_bench_prefs is
  'Preferências de APRESENTAÇÃO do Modo bancada por vínculo sensor–spot. show_bands: mostrar, junto do percentual de bancada, o nome e a cor da faixa simulada (Sem ajuste < 30, Baixo 30 a < 50, Médio 50 a < 73, Alto >= 73, sobre o valor com duas casas). Sem linha = padrão (ligadas). Não participa de nenhum cálculo: não altera leitura, âncora, sessão nem histórico.';
alter table gaxeta_private.mag_bench_prefs enable row level security;
revoke all on gaxeta_private.mag_bench_prefs from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Ligar ou desligar as faixas simuladas da bancada deste sensor (do vínculo vigente)
-- ---------------------------------------------------------------------------
-- Quem pode: quem opera o spot, como nas demais ações do Modo bancada. Não bloqueia a linha do
-- sensor: a ingestão não espera por esta chamada.
create function public.gaxeta_mag_bench_set_bands(p_sensor_id text, p_show boolean)
 returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.gaxeta_devices%rowtype; l gaxeta_private.device_links%rowtype; v_before boolean; v_now timestamptz := clock_timestamp();
begin
  select * into d from public.gaxeta_devices where sensor_id = p_sensor_id and origin = 'esp32';
  if not found or d.measurement_point_id is null or not gaxeta_authz.can_operate_point(d.measurement_point_id) then
    raise insufficient_privilege using message = 'Sem permissão para operar neste sensor vinculado.';
  end if;
  if p_show is null then
    raise invalid_parameter_value using message = 'Informe se as faixas simuladas ficam ligadas ou desligadas.';
  end if;
  select * into l from gaxeta_private.device_links
    where sensor_id = d.sensor_id and point_id = d.measurement_point_id and unlinked_at is null;
  if not found then raise sqlstate 'PT409' using message = 'A instalação do sensor mudou. Abra os detalhes novamente.'; end if;
  v_before := coalesce((select f.show_bands from gaxeta_private.mag_bench_prefs f where f.link_id = l.id), true);
  if v_before = p_show then return jsonb_build_object('show_bands', p_show, 'changed', false); end if;
  insert into gaxeta_private.mag_bench_prefs (link_id, show_bands, updated_at, updated_by) values (l.id, p_show, v_now, auth.uid())
    on conflict (link_id) do update set show_bands = excluded.show_bands, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  perform gaxeta_private.audit('mag.bench.bands', 'sensor', d.sensor_id,
    (select a.corporation_id from public.gaxeta_assets a where a.id = l.point_id), jsonb_build_object('link_id', l.id, 'show_bands', p_show));
  return jsonb_build_object('show_bands', p_show, 'changed', true);
end $$;
comment on function public.gaxeta_mag_bench_set_bands(text, boolean) is
  'Preferência de apresentação: mostrar ou não as faixas simuladas da bancada deste sensor. Só quem opera o spot. Não altera leitura, âncora, sessão nem histórico.';
revoke all on function public.gaxeta_mag_bench_set_bands(text, boolean) from public, anon, authenticated, service_role;
grant execute on function public.gaxeta_mag_bench_set_bands(text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Acréscimos pontuais em duas funções da migração 15 (definição lida do próprio banco)
-- ---------------------------------------------------------------------------
do $m16$
declare v_def text; v_at text; v_add text;
begin
  -- 3a. gaxeta_mag_bench_start: mesmos extremos e mesmo sentido da configuração vigente não trocam nada.
  v_def := pg_get_functiondef('public.gaxeta_mag_bench_start(text, uuid, numeric, numeric, integer)'::regprocedure);
  v_at := $at$    return jsonb_build_object('id', b.id::text, 'status', b.status, 'duplicate', true);
  end if;
$at$;
  v_add := $add$  -- Mesmos extremos e mesmo sentido da configuração vigente: não há o que trocar. A sessão, a
  -- âncora e o histórico ficam como estão (antes, a bancada era encerrada e pedia novo início).
  select * into b from gaxeta_private.mag_bench_modes where link_id = l.id and status = 'active';
  if found and b.zero_deg = p_zero_deg and b.full_deg = p_full_deg and b.direction = p_direction then
    return jsonb_build_object('id', b.id::text, 'status', b.status, 'duplicate', false, 'unchanged', true, 'span_deg', b.span_deg);
  end if;
$add$;
  if (length(v_def) - length(replace(v_def, v_at, ''))) <> length(v_at) or position('unchanged' in v_def) > 0 then
    raise exception 'gaxeta_mag_bench_start não está na forma da migração 15: nada foi alterado.';
  end if;
  execute replace(v_def, v_at, v_at || v_add);

  -- 3b. gaxeta_mag_summary: uma chave a mais (bench_bands), lida de uma tabela que a ingestão não conhece.
  v_def := pg_get_functiondef('public.gaxeta_mag_summary(text[])'::regprocedure);
  v_at := $at$      'bench', v_bench,
$at$;
  v_add := $add$      -- Preferência de apresentação do vínculo: faixas simuladas da bancada (padrão: ligadas).
      'bench_bands', case when v_link is not null then coalesce((select f.show_bands from gaxeta_private.mag_bench_prefs f where f.link_id = v_link), true) end,
$add$;
  if (length(v_def) - length(replace(v_def, v_at, ''))) <> length(v_at) or position('bench_bands' in v_def) > 0 then
    raise exception 'gaxeta_mag_summary não está na forma da migração 15: nada foi alterado.';
  end if;
  execute replace(v_def, v_at, v_at || v_add);
end $m16$;
comment on function public.gaxeta_mag_summary(text[]) is
  'Estado atual dos sensores magnéticos que o usuário pode ler: ângulo absoluto e saúde (medidos), montagem do spot com a origem do curso e da geometria, o que falta no cadastro, solicitação pendente, referência vigente com a faixa de ajuste, curso restante (calculado), Modo bancada (posição de bancada, continuidade, última leitura boa) e o último registro de manutenção. reason explica, em código, por que não há curso restante. bench_bands: preferência de apresentação das faixas simuladas da bancada (padrão: ligadas).';

notify pgrst, 'reload schema';
commit;
