# Estado da produção — SensorGaxeta

## 22/11/2026, 10:40: migração 16 APLICADA (faixas simuladas da bancada) e site novo PUBLICADO; APK 1.8.0 ainda não instalado

Aplicada em 22/11/2026 pelo conector do Supabase, com a autorização dada no pedido da demonstração. Conferido às 10:10 (horário de Brasília).

| # | Arquivo | Versão no histórico | Aplicada às |
|---|---|---|---|
| 13 | `20261119142500_desativa_calibracao_mecanica.sql` | — | **Não aplicada**, como antes. |
| 15a–d | quatro arquivos de 21/11 | `20261121232208` a `20261121232554` | 21/11. **Não reaplicadas.** |
| 16 | `20261122130446_faixas_simuladas_da_bancada.sql` | `20261122130446` | 22/11, 10:04:46, na primeira tentativa |

- Histórico de migrações: 18 linhas. SQL gravado: 8.503 bytes, MD5 `8184b492…3d15`, byte a byte o arquivo enviado. O arquivo do repositório difere em uma linha de comentário (a linha 22 cita o arquivo de reversão, que ganhou a versão definitiva; MD5 do arquivo `dd34931e…7c01`). Nenhuma instrução difere.
- O que entrou: tabela `gaxeta_private.mag_bench_prefs` (preferência de apresentação por vínculo sensor–spot; RLS ligada, nenhuma política, nenhum privilégio para `anon`, `authenticated` e `service_role`; 0 linhas), função `public.gaxeta_mag_bench_set_bands(text, boolean)` (só `authenticated`; confere `can_operate_point`) e um acréscimo pontual em duas funções da migração 15.
- Antes da aplicação, `gaxeta_mag_bench_start` e `gaxeta_mag_summary` tinham em produção o corpo da migração 15 (`e724ac7c…fd82`, `29fdba4b…1887`), com o trecho de encaixe presente uma única vez. Depois: `9f055939…dcbc` e `dd9fdc37…aed`; a função nova, `f19a3057…87f1`. São os mesmos hashes do banco local em que as 1079 verificações rodaram. Permissões e configuração (`search_path`, tempo máximo de 5 s do resumo) iguais às de antes.
- As outras 122 funções dos esquemas `public`, `gaxeta_private` e `gaxeta_authz` (corpo e permissões): mesma impressão agregada antes e depois (`fd59f9e5…7ddc`). `gaxeta_ingest`, `gaxeta_ingest_v3` e `gaxeta_ingest_v4` não foram tocadas.
- Ingestão durante a aplicação: a placa `ESP32-4070298DBD44` (L2-956, `4.5.0-cont30`) entrou às 10:03:40, 10:04:10, 10:04:40, 10:05:10, 10:05:40 e seguiu a cada 30 s até 10:09:10 (leituras 107262 a 107273). Maior intervalo em 15 min: 30,5 s. Nenhum envio perdido.
- Bancada do piloto (configuração 3 do vínculo 7, 80° = 0 %, 180° = 100 %, crescente): igual antes e depois. Ativa, início confirmado às 08:26:04, âncora na leitura 107067 (contagem −420, sessão `d881360c`), última posição 42,6076 %. A migração não abriu sessão, não pediu referência e não reescreveu histórico.
- Contagens antes e depois: 3 configurações de bancada, 0 movimentos de campo, 0 engaxetamentos, 0 registros de manutenção, 99 linhas de auditoria.
- Resumo lido com a identidade de nível 1, sem gravar nada: `bench_bands = true` (padrão, sem linha na tabela), Posição de bancada 42,608 %, estado `ok`.
- Consultor de segurança do Supabase depois da aplicação: nenhum item de nível ERRO. Os avisos são dos mesmos tipos de antes, agora também para os dois objetos novos (tabela privada com RLS e sem política, intencional; função `security definer` chamável por conta autenticada, que confere o escopo). Continua o aviso de proteção contra senha vazada desligada no Auth.
- Não exercitado em produção: ninguém chamou `gaxeta_mag_bench_set_bands` (a tabela está vazia) nem reenviou a mesma faixa a `gaxeta_mag_bench_start`. Os dois caminhos estão cobertos pela suíte 88 no banco local, com as funções no mesmo hash.
- Site: **publicado em 22/11 às 10:36:52** (commit `9ed071a`; os commits `8236801` a `139ac21`, das 10:29 às 10:36, levaram testes, migração, reversão e fonte). No ar às 10:37:44: `index.html`, `acesso.html`, `app.js`, `styles.css` e `operacao.html` baixados do endereço público são byte a byte os do build ensaiado (`app.js` MD5 `bee4d636…c0f7`). Aberto com a sessão do Ítalo às 10:38: o cartão do L2-956 mostra 42,61 % · Baixo ajuste, atualizado às 10:37:41; a Telemetria de 1 hora mostra 120 leituras válidas de 120. Nenhuma ação foi feita na tela além de abrir Sensores e o histórico.
- Aplicativo Android 1.8.0 (código 9): montado e assinado, **não instalado em nenhum aparelho**.
- Firmware: sem alteração.

Reversão: `supabase/rollback/20261122130446_faixas_simuladas_da_bancada.down.sql` (catálogo idêntico ao da migração 15, conferido no banco local). A escolha de cada sensor é descartada; leituras, sessões, âncoras e histórico ficam.

## 21/11/2026, 21:10: migração 15 APLICADA, site novo publicado, firmware 4.5.0 gravado e bancada ensaiada

Aplicada em 21/11/2026 com autorização do Ítalo, pelo conector do Supabase, uma parte por vez. Conferido às 20:26 (horário de Brasília).

| # | Arquivo | Versão no histórico | Aplicada às |
|---|---|---|---|
| 13 | `20261119142500_desativa_calibracao_mecanica.sql` | — | **Não aplicada**, como antes. |
| 15a | `20261121232208_a_modo_bancada_estrutura.sql` | `20261121232208` | 20:22:08 |
| 15b | `20261121232341_b_ingestao_contagem_continua.sql` | `20261121232341` | 20:23:41 |
| 15c | `20261121232459_c_bancada_cadastro_funcoes.sql` | `20261121232459` | 20:24:59 |
| 15d | `20261121232554_d_resumo_e_historico_magnetico.sql` | `20261121232554` | 20:25:54 |

- Histórico de migrações: 17 linhas. As quatro entraram na primeira tentativa (a trava da parte a não coincidiu com envio da placa).
- SQL gravado no histórico: partes b, c e d byte a byte iguais aos arquivos (28.436, 23.407 e 17.869 bytes; MD5 `56f79d60…038c`, `82fdd6e5…dd81`, `c7a2c444…acf7`). Parte a: o histórico tem o mesmo SQL do arquivo a partir do `begin;`, com um cabeçalho de comentário de duas linhas no lugar do de 29 (14.681 bytes, MD5 `07dcc08d…4945`; o arquivo tem 16.789 bytes). Nenhuma instrução difere.
- Impressão do resultado: as 149 linhas de conferência (33 funções com corpo e permissões, 64 colunas, 43 restrições, 7 índices, RLS das 2 tabelas novas) são iguais em produção e no banco local em que as 1008 verificações rodaram (mesma impressão agregada, `8fd267d9…1f40`).
- Ingestão durante a aplicação: a placa `ESP32-4070298DBD44` (firmware `4.4.0-cont30`) entrou às 20:21:52, 20:22:22, 20:22:53, 20:23:23, 20:23:52, 20:24:23, 20:24:53, 20:25:23, 20:25:52 e 20:26:22, sempre com campo e barramento `ok`, bruto 1673 e transporte de cerca de 3 s. Nenhum intervalo perdido. Com o 4.4.0 as colunas novas ficam nulas (`ct_session`, `bench_state`), como previsto.
- Tabelas novas `gaxeta_private.mag_bench_modes` e `mag_maintenance_notes`: vazias, RLS ligada e nenhuma política. Funções novas `gaxeta_mag_*`: só o papel `authenticated`. `gaxeta_ingest_v4` continua aceitando `anon`, como antes.
- Consultor de segurança do Supabase depois da aplicação: nenhum item de nível ERRO. Os avisos são os de antes, agora também para os objetos novos (tabelas privadas com RLS e sem política, intencional; funções `security definer` expostas, cada uma conferindo papel e escopo). Continua o aviso antigo de proteção contra senha vazada desligada no Auth.
- Site: `frontend/src/js/62-gland.js` apagado no commit `4fc7bc5` (20:04) e 21 arquivos enviados no commit `52e1baf` (20:08). `index.html`, `acesso.html`, `app.js`, `styles.css` e `operacao.html` baixados do endereço público são byte a byte os do build ensaiado (`app.js` MD5 `989d97ef…468f`).
- Firmware 4.5.0 gravado na C3 do L2-956 às 20:46 (Arduino IDE, janela `Sensor_Gaxeta_AS5600`; 1.416.221 bytes). Primeira leitura às 20:46:47: `4.5.0-cont30`, método `as5600-i2c-n20-circ-ct5`, sessão `8d8b4dd9`. O binário do 4.4.0 foi exportado antes e está guardado fora do repositório.
- Modo bancada ligado no vínculo 7 às 20:52 (80° = 0 %, 180° = 100 %, crescente), início confirmado às 20:52:47 em 147,04° = 67,04 %. Ensaio manual até 21:06: 100 % com o eixo 20,9° além do extremo, 0 % com 19,2° aquém, retorno medido do ponto real, e queda de Wi-Fi de 5 min 35 s com giro durante a queda. 42 leituras sem salto de sequência, uma sessão, nenhuma inválida; contagem contínua e ângulo absoluto com diferença máxima de 1 contagem; maior lacuna 13 ms, maior passo 24 contagens. Nenhuma referência ou movimento de campo criado.
- Não ensaiado na placa: mais de uma volta além do extremo, reinício e ímã ausente. Cadastro magnético: 0 geometrias, 0 cursos, 0 engaxetamentos.

## 21/11/2026, 19:45: antes da aplicação — migração 15 escrita e ensaiada, ainda não aplicada

Conferido em 21/11/2026 entre 18:34 e 19:45 (horário de Brasília), só com leitura.

| # | Arquivo | Versão no histórico | Situação |
|---|---|---|---|
| 13 | `20261119142500_desativa_calibracao_mecanica.sql` | — | **Não aplicada**, como antes. |
| 14 | `20261121154407_as5600_contrato_magnetico.sql` | `20261121154407` | Aplicada (12:44). Última linha do histórico. |
| 15a–d | `20261121230001_a_…` a `20261121230004_d_…` | a definir na aplicação | **Não aplicadas.** A aplicação pelo Claude foi barrada pelo controle de permissões da sessão. |

- Histórico de migrações em produção: 13 linhas, de `20261111173402` a `20261121154407`. Nenhuma linha nova desde as 12:44.
- As 15 funções que a migração 15 substitui ou das quais depende (`gaxeta_ingest_v4`, `gaxeta_mag_request_service`, `gaxeta_mag_summary`, `gaxeta_mag_history`, `mag_setup`, `mag_close_services`, `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_history`, `gaxeta_telemetry_summary`, `mag_compute`, `mag_stabilize`, `gaxeta_unlink_sensor`, `gaxeta_mag_set_equipment_defaults`, `gaxeta_mag_set_point_setup`) têm em produção o mesmo hash do banco local montado na forma da produção (migrações 01–12 e 14, sem a 13). Nenhuma alteração manual.
- Nesse banco local, com a migração 15 aplicada por cima: suíte 84, 168 de 168; suíte 85, 6 de 6; suíte 87, 196 de 196.
- Site publicado: commit `9f3505b` (21/11, 13:29). `index.html`, `acesso.html`, `app.js`, `styles.css` e `operacao.html` são byte a byte os da entrega AS5600. Esse build passa as 52 verificações dele contra o banco com a migração 15.
- Piloto: `ESP32-4070298DBD44`, firmware `4.4.0-cont30`, vinculado desde 13:33 ao spot UNICO do L2-956 (vínculo 7). Leitura a cada 30 s; às 18:34:47, sequência 433, bruto 1672 (146,953°), dispersão 1, campo e barramento `ok`, AGC 66, magnitude 2117. 647 leituras magnéticas no total.
- Cadastro magnético em produção: 0 geometrias, 0 montagens de spot, 0 sugestões de TAG, 0 engaxetamentos, 0 mudanças. O L2-956 mostra "Sem geometria".
- Banco: 65 MB, 106.633 leituras.

## 21/11/2026: migração 14 (contrato magnético AS5600) aplicada; migração 13 continua pendente

Conferido em 21/11/2026 às 13:12 (horário de Brasília).

| # | Arquivo | Versão no histórico | Situação |
|---|---|---|---|
| 13 | `20261119142500_desativa_calibracao_mecanica.sql` | a definir na aplicação | **Não aplicada.** Continua dependendo de o site e o APK de 19/11 estarem em uso. A migração 14 não depende dela (testada nas duas ordens). |
| 14 | `20261121154407_as5600_contrato_magnetico.sql` | `20261121154407` | **Aplicada** em 21/11 às 12:44. SQL gravado no histórico byte a byte igual ao arquivo: 83.187 bytes, MD5 `10110a22d64c3b950ad2bec400c68a5c`. |

- As 23 funções novas ou alteradas (`gaxeta_ingest_v4`, `gaxeta_ingest`, `gaxeta_telemetry_summary`, `gaxeta_history`, as nove `gaxeta_mag_*` públicas e as nove `gaxeta_private.mag_*`) e as sete tabelas tocadas (`gaxeta_readings`, `gaxeta_devices` e as cinco `mag_*`) têm em produção o mesmo hash do banco local em que as 812 verificações rodaram. `gaxeta_ingest_v3` ficou com o hash de antes.
- Antes da aplicação, `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_telemetry_summary` e `gaxeta_history` estavam em produção com o corpo da migração 12, sem alteração manual.
- As cinco tabelas `gaxeta_private.mag_*` têm RLS ligada e nenhuma política: só as funções `security definer` chegam a elas. `gaxeta_ingest_v4` aceita o papel `anon` (a placa usa a chave publicável e a credencial de envio, como na rota antiga); as funções `gaxeta_mag_*` aceitam só `authenticated`.
- Consultor de segurança do Supabase depois da aplicação: nenhum item de nível ERRO. Os avisos são os mesmos de antes, agora também para os objetos novos: tabelas privadas com RLS e sem política (intencional) e funções `security definer` expostas (cada uma confere o papel e o escopo do usuário). Aviso que já existia e continua: proteção contra senha vazada desligada no Auth.
- Primeira leitura magnética real em produção: placa `ESP32-4070298DBD44`, firmware `4.4.0-cont30`, leitura `106008`, 13:11:22, sequência 1, ângulo bruto 1347 (118,389°), dispersão 0, campo `ok`, barramento `ok`, AGC 66, magnitude 2105; campos elétricos nulos. A leitura seguinte, `106009`, entrou 30 s depois. No sensor, `last_modality = as5600_i2c` e todos os campos elétricos atuais nulos.
- A placa está sem vínculo com spot e não existe geometria cadastrada: o curso de ajuste restante fica indisponível, com o motivo explícito, até a engenharia caracterizar a montagem.
- Tamanho em 21/11: banco 65 MB; `gaxeta_readings` 51 MB com índices (105.986 leituras desde 02/11).

## 19/11/2026: migração 12 aplicada, migração 13 pendente

Conferido em 19/11/2026 às 11:17 (horário de Brasília).

| # | Arquivo | Versão no histórico | Situação |
|---|---|---|---|
| 12 | `20261119141626_posicao_eletrica.sql` | `20261119141626` | **Aplicada** em 19/11 às 11:16. MD5 do SQL gravado igual ao do arquivo (`ab72fb22…c738`). |
| 13 | `20261119142500_desativa_calibracao_mecanica.sql` | a definir na aplicação | **Não aplicada.** Só depois de publicar o site e instalar o APK desta entrega. |

- As cinco funções da migração 12 (`gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_history`, `gaxeta_telemetry_summary`, `gaxeta_private.adc_block`) têm em produção o mesmo hash do banco local em que as 638 verificações rodaram.
- A primeira tentativa de aplicação foi desfeita pelo próprio banco (impasse com uma leitura que chegava naquele instante); nada foi alterado. A migração passou a tomar as duas tabelas de uma vez, sem espera, e a segunda tentativa entrou.
- Ingestão durante a aplicação: a placa `ESP32-4070298DBD44` (ESP32-C3, firmware 4.3.2-cont30) enviou às 11:14:38, 11:15:08, 11:15:38, 11:16:08 e 11:16:38, sem falha e sem intervalo perdido. O pacote antigo, com `position_mm`, continua aceito.
- Permissões de `gaxeta_ingest` e `gaxeta_ingest_v3` iguais às anteriores. Eventos, referências e perfis do antigo ciclo: 6, 1 e 0, sem alteração. Mudanças de 5 p.p.: 115, sem alteração.
- O site publicado (entrega de 18/11) continua funcionando com a migração 12: ele ainda chama `gaxeta_gland_summary`, que só sai de operação na migração 13.


Conferido em 18/11/2026 às 14:05 (horário de Brasília). Projeto **SensorGaxeta**, PostgreSQL 17. O ambiente hospedado é o piloto em uso e continua em teste.

## Migrações: onze de onze aplicadas

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
| 08 | `20261117210000_ciclos_gaxeta.sql` | `20261117210000` | 17/11, antes da revisão de 17/11 |
| 09 | `20261117222922_referencia_gaxeta.sql` | `20261117222922` | 17/11 19:29 |
| 10 | `20261118132114_calibracao_tensao.sql` | `20261118132114` | 18/11 10:21 |
| 11 | `20261118165547_comissionamento_dois_pontos.sql` | `20261118165547` | 18/11 13:55 |

## Migração 11 (comissionamento em dois pontos, 18/11/2026) — aplicada

Arquivo `supabase/migrations/20261118165547_comissionamento_dois_pontos.sql`, reversão em `supabase/rollback/`. Aditiva: não toca `gaxeta_ingest`, `gaxeta_ingest_v3`, a estabilização, `gaxeta_record_gland_event`, o histórico, as permissões nem dados existentes.

| Objeto | O que é |
|---|---|
| `gaxeta_private.gland_profiles.origin` | Coluna nova (jsonb, nula nos perfis manuais): ciclo e conferência de origem, D100/V100, segunda medida e V0 de um comissionamento em dois pontos. |
| `gaxeta_private.gland_block` | Diagnóstico do bloco: `ceiling` (bloco inteiro em 4095, limite do ADC), `touch_high`, `mixed_high` (4095 junto com amostras muito diferentes), `floor`, `touch_low`, `mixed_low`, `unstable`, `ok`. A elegibilidade para calibrar (`gland_quality`) não muda. |
| `gaxeta_private.gland_cadence`, `gland_confirm_max_age` | Intervalo típico entre envios e idade máxima (chegada → agora) de uma leitura para o técnico confirmar: 1,25 × cadência + 15 s, entre 45 s e 240 s. |
| `gaxeta_private.gland_peak` | Posição estável mais alta lida desde o registro (últimos 7 dias). |
| `gaxeta_private.gland_commission_draft` | Rascunho do comissionamento do ciclo vigente: referência aprovada e conferência válida do mesmo ciclo. |
| `gaxeta_private.gland_state` | **Corpo substituído.** A leitura atual ganha `block`, `at_ceiling`, `electric_percent`, `age_s` e `transport_s`; a candidata ganha idade, transporte, limite e `below_peak`/`peak`; motivo de espera novo `aged`. Os campos anteriores não mudam. |
| `public.gaxeta_confirm_gland_anchor(text, text, text, text, boolean)` | Substitui a versão de quatro parâmetros (o quinto, `p_ack_lower`, é opcional: a chamada do site anterior continua válida). Recusa leitura mais velha que o limite (`PT409`) e, sem a declaração, leitura abaixo de uma posição já mostrada depois do registro. A auditoria `gland.anchor` guarda idade, transporte e a declaração. |
| `public.gaxeta_commission_gland(text, text, uuid)` | Grava o comissionamento em dois pontos como nova versão do perfil (razão medida, faixa validada, marca superior). Níveis 1 e 2, idempotente, auditoria `gland.commission`. |
| `public.gaxeta_gland_status`, `gaxeta_gland_summary` | **Corpos substituídos**, mesmas assinaturas. Novos e aditivos: `request_id` de cada evento só para o autor, `profile.origin`, `commission`; no resumo, `block`, `electric_percent`, `cycle_event_id` e `anchored`. |

Compatibilidade conferida no banco local: o site publicado (build do commit anterior) passa as suas 32 verificações com a migração 11 aplicada; o site novo passa as mesmas 32 com o banco ainda na migração 10. A ordem entre aplicar a migração e publicar o site é livre.

Conferido depois da aplicação (18/11, 13:55):

- MD5 do SQL gravado no histórico igual ao do arquivo (`a0012b03883aa9c3810abd3f41fa6f2f`). Os corpos das 20 funções do ciclo e da ingestão em produção têm o mesmo hash do banco local em que as 539 verificações foram executadas; `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_record_gland_event`, `gaxeta_gland_history`, `gland_model`, `gland_eval`, `gland_quality`, `gland_try_anchor` e `gland_window` ficaram com o hash de antes.
- Funções novas fechadas para anônimo; as internas não são chamáveis pela API.
- Estado do G1-432 logo depois da aplicação, lido no banco: cadastro de 16 mm (evento 9) aguardando; a leitura de 2,446 V aparece como candidata **marcada como abaixo de uma posição mais alta já mostrada depois do registro** (bloco no limite do ADC às 12:35). É o caso que motivou a mudança: sem a declaração do técnico, ela não vira marca superior.
- Nenhum evento, referência ou perfil foi criado, alterado ou apagado: `gland_anchors` e `gland_profiles` continuam vazias; os cinco eventos da instalação 6 estão como estavam.
- Firmware `4.3.1-cont30` gravado às 14:01: sete leituras seguidas (ids 104184 a 104190, sequências 1 a 37 de 6 em 6), uma a cada 29,7 a 30,3 s.

Reversão: `supabase/rollback/20261118165547_comissionamento_dois_pontos.down.sql` devolve estado, consulta, resumo e confirmação à forma da migração 10 (catálogo idêntico, conferido). As versões de perfil gravadas ficam; a coluna `origin` é descartada.

## Migração 10 (tensão calibrada e marca superior validada, 18/11/2026)

Aditiva. MD5 do arquivo igual ao gravado no histórico (`e4d36c6104017c8017676e7d77a7a879`). Os corpos das 23 funções do ciclo e da ingestão em produção têm o mesmo hash do banco local em que as 454 verificações foram executadas.

| Objeto | O que é |
|---|---|
| `public.gaxeta_readings`: `voltage_mv`, `adc_min`, `adc_max`, `acq_method` | Campos novos e opcionais do firmware 4.3.0: tensão no pino em mV calibrada pelo ADC (mesmas amostras do bloco bruto), menor e maior amostra do bloco e identificador do método de aquisição. Nulos em firmware anterior. `voltage_v`, `adc_raw`, `travel_percent` e `position_mm` não mudam. |
| `public.gaxeta_devices`: `last_voltage_mv`, `last_adc_raw`, `last_adc_min`, `last_adc_max`, `last_acq_method` | Diagnóstico da leitura atual, com a mesma proteção contra envio atrasado ou fora de ordem. |
| `public.gaxeta_ingest(text, jsonb)` | **Corpo substituído** (invólucro). Valida e grava os campos novos e aprova a amostra de referência do ciclo. `gaxeta_ingest_v3` e `gaxeta_private.stabilize` têm o mesmo hash de antes. Identidade idempotente continua `sensor_id + boot_id + sequence`. |
| `gaxeta_private.gland_events.rule_version` | 1 para os eventos que já existiam, 2 para os novos. |
| `gaxeta_private.gland_anchors` | Amostra de referência aprovada de cada evento (regra 2): gravada uma vez, com os valores copiados da leitura, o modo (`window`, `confirmed`, `check`) e quem confirmou. Não é substituída. |
| `gaxeta_private.gland_profiles` | Perfil versionado por instalação: faixa elétrica da marca superior, marca de fim de ajuste, faixa validada, razão de transmissão documentada. Vale da criação em diante. |
| `gaxeta_private.gland_quality`, `gland_qvalue`, `gland_profile_at`, `gland_window`, `gland_try_anchor`, `gland_model`, `gland_eval` | Qualidade do bloco (instável, saturado), grandeza comparável (mV só entre leituras do mesmo método), faixa esperada da marca superior, aprovação na chegada da leitura, modelo de conversão válido num instante e cálculo de distância, percentual e avanço. |
| `gaxeta_private.gland_state` | **Corpo substituído.** Regra 1 com o cálculo preservado e marcada como não calibrada; regra 2 sem recurso ao curso nominal. |
| `public.gaxeta_confirm_gland_anchor(text, text, text, text)` | Confirmação, pelo técnico, da leitura colhida com o sensor na marca superior. Mesma autorização do registro (`can_operate_point`), auditoria `gland.anchor`. |
| `public.gaxeta_save_gland_profile(text, text, uuid, jsonb)` | Nova versão do perfil da instalação. Níveis 1 e 2. Auditoria `gland.profile`. Sem tela nesta entrega. |
| `public.gaxeta_gland_status`, `gaxeta_gland_summary`, `gaxeta_gland_history` | **Corpos substituídos**, mesmas assinaturas. Campos novos são aditivos: regra, calibrado, avanço, motivo da espera, tensão e origem, qualidade, faixa esperada, leitura candidata, perfil. |
| `public.gaxeta_history(text, timestamptz, timestamptz)` | **Corpo substituído**: cada intervalo ganha `voltage_mv` (média calibrada) e `adc_raw`. As chaves antigas não mudam. |

Estados do ciclo na regra 2: `waiting` (aguardando referência, com `wait_reason`), `no_scale` (sem calibração de distância, com `reason`), `no_end` (fim de ajuste não informado ou fora da faixa validada), `out_of_range` (fora da faixa calibrada), `active`, `unusable`, `maintenance`, `no_reference`, `unlinked`.

Nenhum dado existente foi alterado. Os quatro eventos que existiam (instalação 6 do sensor `ESP32-80D0BBE0F908`, registrados em 17/11 pela interface) ficaram na regra 1. `gland_anchors` e `gland_profiles` estão vazias.

Conferido depois da aplicação (18/11, 10:21):

- Leitura do firmware 4.2.0 às 10:23:32, dois minutos depois da aplicação, com os campos novos nulos.
- Firmware 4.3.0 gravado às 10:33: leituras 104114 a 104117 (sequências 1 a 4, a cada 174 a 183 s) com `voltage_mv` de 2733 a 2747, `adc_min`/`adc_max` e `acq_method = a1-12db-n20-lf-vref`; `gaxeta_devices` mostra `4.3.0-hib180` e os campos `last_*`.
- Limite de dispositivos da chave de ingestão: 10, com 2 em uso.

Limites conhecidos desta migração:

- A aprovação da referência roda dentro da ingestão. Uma falha nela vira aviso no registro do banco e não rejeita a leitura.
- As tolerâncias sem perfil (±60 mV ou ±75 contagens em torno da marca superior confirmada, 100 mV de amplitude mínima numa conferência, 0,3 mm ou 5 % de desvio de linearidade, 2 % de tolerância nos extremos da faixa) são provisórias: saem das poucas leituras de bancada e precisam do ensaio com multímetro e paquímetro.
- Reverter a migração descarta as referências aprovadas e os perfis; os eventos ficam e voltam a ser calculados pela regra anterior.

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

## Sensores em 18/11/2026

| Sensor | Firmware | Vínculo | Última leitura |
|---|---|---|---|
| `ESP32-80D0BBE0F908` (placa de reposição, nome G1-432) | 4.3.0-hib180, hibernação de 180 s | Vinculado em 17/11 22:55 ao spot UNICO (instalação 6), pela interface | 18/11 10:42, transmitindo |
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
