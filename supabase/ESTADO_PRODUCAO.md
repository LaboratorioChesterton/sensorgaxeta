# Estado da produção — SensorGaxeta

Conferido em 17/11/2026 às 19:49 (horário de Brasília). Projeto **SensorGaxeta**, PostgreSQL 17. O ambiente hospedado é o piloto em uso e continua em teste.

## Migrações: nove de nove aplicadas

O SQL gravado no histórico tem o mesmo MD5 dos arquivos de `supabase/migrations/` (comparação feita no banco, coluna `statements`; para a 08, o arquivo foi escrito a partir do que está gravado, com fim de linha LF).

| # | Arquivo | Versão no histórico | Aplicada em |
|---|---|---|---|
| 01 | `20261111173402_estrutura_hierarquia.sql` | `20261111173402` | 11/11 14:34 |
| 02 | `20261111173649_papeis_escopos.sql` | `20261111173649` | 11/11 14:36 |
| 03 | `20261111175423_cadastro_rpcs.sql` | `20261111175423` | 11/11 14:54 |
| 04 | `20261111175551_usuarios_convites.sql` | `20261111175551` | 11/11 14:55 |
| 05 | `20261111175624_corte_acesso.sql` | `20261111175624` | 11/11 14:56 |
| 06 | `20261111175658_telemetria_consultas.sql` | `20261111175658` | 11/11 14:56 |
| 07 | `20261112143031_ficha_equipamento_spots.sql` | `20261112143031` | 12/11 11:30 |
| 08 | `20261117210000_ciclos_gaxeta.sql` | `20261117210000` | 17/11, antes desta revisão |
| 09 | `20261117222922_referencia_gaxeta.sql` | `20261117222922` | 17/11 19:29 |

## Migrações 08 e 09 (ciclo de gaxeta, 17/11/2026)

A 08 já estava no banco quando esta revisão começou e não tinha arquivo no repositório nem tela que a usasse. Ela criou os eventos do ciclo e a escolha da leitura de referência. A 09 completa o cálculo. As duas são aditivas.

| Objeto | O que é |
|---|---|
| `gaxeta_private.gland_events` | Eventos imutáveis por instalação (vínculo sensor–spot): `maintenance`, `replacement`, `adjustment` e, na 09, `check` (conferência). Guarda a distância medida (`initial_mm`) e, na 09, a distância de fim de ajuste (`end_mm`). Sem acesso direto pela API. |
| `gaxeta_private.gland_sample_ok`, `gland_anchor` | Leitura apta (ADC entre 1 e 4094, ruído até 25 contagens) e primeira leitura apta depois do evento, que vira a referência. Na 09 a referência traz também a posição nominal enviada pelo firmware. |
| `gaxeta_private.gland_stop`, `gland_scale`, `gland_value`, `gland_state` (09) | Fim de validade de um evento; escala em mm por contagem medida por conferência (mínimo de 100 contagens de diferença) ou nominal do firmware; distância e percentual de uma leitura; estado atual do ciclo. |
| `public.gaxeta_record_gland_event(...)` | Registro com autorização no servidor (`can_operate_point`), idempotente por solicitação e com controle de concorrência. A 09 substitui a versão de seis parâmetros pela de sete (`p_end_mm`), aceita `check`, deixa a manutenção prévia opcional e grava auditoria (`gland.*`). |
| `public.gaxeta_gland_status(text, text)` | Estado e histórico de eventos de um sensor. Mesma assinatura da 08; a 09 acrescenta distância, percentual, escala e avisos. |
| `public.gaxeta_gland_summary(text[])` (09) | Estado do ciclo e cadência observada de vários sensores numa chamada, para os cartões. |
| `public.gaxeta_gland_history(text, timestamptz, timestamptz)` (09) | Distância e percentual por período, cada leitura com a referência e a escala da sua época. |

Nenhum dado existente foi alterado. `gland_events` estava vazia antes e continua vazia: nenhum engaxetamento foi registrado em produção por esta revisão.

Conferido logo depois da aplicação da 09 (17/11, 19:29):

- `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_private.stabilize`, `gaxeta_history` e `gaxeta_delete_asset` com o mesmo hash de antes.
- As dez funções do ciclo com o mesmo corpo do banco local em que as 330 verificações foram executadas.
- Leitura do sensor `ESP32-80D0BBE0F908` 5,6 s depois da aplicação, no ritmo de 10 s.
- Consulta com a identidade de nível 1, sem gravar nada: `ESP32-54CE2CDC5194` (L2-955, LOA) em `no_reference`, com permissão de registro; `ESP32-80D0BBE0F908` em `unlinked` (sem vínculo). Com a identidade do usuário de corporação da Klabin: nenhum sensor devolvido.
- Consultor de segurança do Supabase: nenhum aviso de tipo novo. As quatro RPCs do ciclo entram na lista das funções `SECURITY DEFINER` chamáveis por conta autenticada, como as demais (a autorização é feita dentro da função).

Limite conhecido: enquanto um ciclo aguarda a primeira leitura apta, cada consulta percorre as leituras do sensor desde o registro. Com sinal ruidoso por semanas a 10 s de cadência, a consulta do painel fica mais lenta (tempo máximo de 5 s). Nenhum índice foi criado em `gaxeta_readings`.

## Exclusão de equipamento

`gaxeta_asset_dependencies` e `gaxeta_delete_asset` existem em produção desde a migração 03 e não foram alteradas. Só nível 1 exclui; a exclusão é recusada com filhos, sensores vinculados, gateways, histórico de instalação ou usuários. Em 17/11: `L2-956` não tem dependências; `L2-955` tem 1 spot, 1 sensor vinculado e 1 registro de instalação. Nada foi excluído em produção.

## Sensores em 17/11/2026

| Sensor | Firmware | Vínculo | Última leitura |
|---|---|---|---|
| `ESP32-80D0BBE0F908` (placa de reposição) | 4.1.0, contínuo, 10 s | Sem vínculo, na fila de associação | 17/11 19:48, transmitindo |
| `ESP32-54CE2CDC5194` (placa anterior) | 4.0.0 | L2-955 / LOA (vínculo nº 1, preservado) | 16/11 22:15 |

## Migração 07 (refinamento de 12/11/2026)

Aditiva. O que criou ou alterou:

| Objeto | O que é |
|---|---|
| `public.gaxeta_equipment_types` | Catálogo de tipos de equipamento (14 linhas). Leitura para contas com acesso. |
| `public.gaxeta_equipment_details` | Ficha técnica, 1:1 com o ativo `equipment`. Leitura só com acesso efetivo ao TAG; escrita só pela RPC. |
| `public.gaxeta_save_equipment(...)` | Grava TAG e ficha numa transação, reutilizando `gaxeta_save_asset`. |
| `public.gaxeta_equipment_overview(uuid)` | TAG, ficha, spots e sensores numa chamada (vale a política de quem chama). |
| Gatilho `gaxeta_asset_point_name` | Spot novo ou renomeado só aceita LOA, LA ou UNICO. Nome anterior é mantido enquanto não for trocado. |
| `public.gaxeta_devices_page(...)` | **Corpo substituído**: a busca passa a encontrar também pelo TAG. Mesma assinatura e mesma resposta. |
| `gaxeta_private.*` | Funções auxiliares (`spot_name_canonical`, `point_name_guard`, `equipment_details_guard`, `detail_text`, `detail_count`). |

Nenhum dado existente foi alterado: o único spot do banco já se chamava `LOA`; nenhuma ficha foi criada para os TAGs existentes (`L2-955` e `L2-956` aparecem com “Tipo não informado” até alguém preencher).

Conferido logo depois da aplicação:

- `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_private.stabilize`, `gaxeta_history`, `gaxeta_save_asset` e `gaxeta_validate_asset` com o mesmo hash de antes.
- Leitura do sensor `ESP32-54CE2CDC5194` (Refinador, spot LOA de L2-955) às 11:30:36, oito segundos depois da aplicação; 30 leituras nos cinco minutos seguintes.
- Tabelas novas com RLS ligada e política de leitura; `anon` sem privilégio.
- Consultor de segurança do Supabase: nenhum aviso novo de outro tipo. `gaxeta_save_equipment` entra na lista das funções `SECURITY DEFINER` chamáveis por conta autenticada, como as demais RPCs de escrita (a autorização é feita dentro da função).

## Passada de aceite de 12/11 (build novo rodando sobre a origem do site, sessão de nível 1)

- Sensores: leitura avançou de 11:37:35 para 11:37:45 com a tela aberta.
- Ativos: corporação de teste com duas empresas, área, TAG direto na área com ficha, dois spots; edição da ficha e troca de nome de spot conferidas na tela e no banco.
- Usuários: prévia de corporação vazia com acesso amplo e de duas empresas (uma liberada, outra bloqueada). Nenhum convite foi enviado e nenhum usuário foi gravado.
- Telemetria: 5 min, 7 dias, 1 mês, clique rápido entre filtros, ampliação e volta.

## O que os testes deixaram no banco

A corporação “ZZ Teste Refinamento” e tudo abaixo dela foram criados e excluídos pela própria interface. Ficaram só 18 linhas na trilha de auditoria (criações, alterações e exclusões do teste). Contagens depois do teste: 9 ativos, 0 fichas, 3 usuários, 2 convites, 1 concessão — as mesmas de antes.

Da etapa anterior continuam: 22 linhas de auditoria e 1 convite revogado para um endereço fictício em `example.com`.

## Ingestão e placa

Nada foi enviado à placa. Firmware, rede, endpoints, tokens, cadência, deduplicação, estabilização e alertas não foram tocados.

## Função de envio de convites

`gaxeta-invite` implantada (versão 1), sem alteração nesta revisão. **Envio real de e-mail não testado.**

## Configuração pendente no painel do Supabase

1. **Auth → URL Configuration → Redirect URLs**: incluir `https://laboratoriochesterton.github.io/sensorgaxeta/acesso.html`.
2. **Auth → SMTP**: configurar remetente próprio. É a configuração que falta para o envio real de convites.
3. Cadastro público: **continua aberto**, como combinado, até convite e recuperação serem comprovados com e-mail real.
4. Opcional (aviso do consultor): ligar a proteção contra senhas vazadas em Auth.

## Limites conhecidos

- A tela não consegue ler os dados de contato de uma corporação já gravada (não há RPC de leitura). Proposta, não aplicada, em `supabase/propostas/`.
- Excluir uma corporação que tenha convites (mesmo revogados) falha por chave estrangeira, sem mensagem amigável.
- O filtro “Transmitindo / Sem atualização” de Sensores vale para a página carregada, não para o total.
- A prévia de acesso com conta real de corporação (entrar com a conta e ver só o ramo liberado) não foi refeita nesta revisão; a regra é a mesma da etapa anterior e está coberta pela suíte do banco.
- Suíte de banco rodou em PostgreSQL 16 local (247 verificações); em 17 houve a aplicação real e as checagens acima.
- Sem backup recuperável confirmado (plano gratuito).
- Limpeza de leituras: não executada.

## Reversão

Aplicar os arquivos de `supabase/rollback/` em ordem inversa (07 → 01) e remover as linhas correspondentes de `supabase_migrations.schema_migrations`. A reversão da 07 descarta as fichas técnicas; a da 02 descarta cadastros de usuários, concessões e convites. O frontend novo depende das sete; para voltar o site, basta restaurar os cinco arquivos do Pages do commit `eb76200`, que continuam compatíveis com o banco atual.
