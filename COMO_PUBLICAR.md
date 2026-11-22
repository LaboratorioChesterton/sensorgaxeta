# Como publicar — Demonstração do L2-956: faixas simuladas da bancada, prévia automática e Bluetooth (22/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit publicado `cf792a3` (21/11; `app.js` com MD5 `989d97ef…468f`, igual ao do site). **Tudo já está no repositório e no ar**; este arquivo fica como registro do que entrou e de como reverter.

## Estado em 22/11/2026, 12:35

| Passo | Estado | Compatibilidade |
|---|---|---|
| **1. Banco, migração 16** (`20261122130446_faixas_simuladas_da_bancada.sql`) | **Aplicada em produção em 22/11 às 10:04:46**, pelo conector do Supabase, na primeira tentativa. Ver `supabase/ESTADO_PRODUCAO.md`. | O site publicado hoje (`cf792a3`) continua funcionando com ela: 118 verificações, 0 falhas. |
| **2. Site** | **Publicado em 22/11 às 10:36:52** (commit `9ed071a`; no ar às 10:37:44). Às **12:28:19** entrou a correção da tela do celular (commit `5850fc6`; no ar às 12:29:00). Os cinco arquivos servidos são byte a byte os do build ensaiado. Feito pelo Claude no navegador do Ítalo, a pedido dele, em dez commits por pasta (`8236801` a `9ed071a`). | O site novo também funciona com o banco na migração 15 (guarda a preferência só no aparelho): 8 verificações, 0 falhas. |
| **3. Aplicativo Android 1.8.2** | **Instalado em 22/11 às 12:23 no Galaxy S23 do Ítalo (Android 17), pelo cabo USB (`adb`).** Tocando no arquivo, esse aparelho recusa a instalação; pelo cabo instala. | Embarca este mesmo build (o de 12:28). |
| **Firmware** | Sem alteração: a C3 do L2-956 segue no `4.5.0-cont30`. | — |

**Não reaplique a migração 15 nem a 16. Não aplique a 13 (`20261119142500`).**

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** (seletor "Árvore de ativos" no telefone, quadro do Bluetooth) |
| `app.js` | **Substituir** (de 519 KB para 587 KB) |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual: faixas simuladas, Alterar faixa da bancada, Bluetooth, árvore no telefone) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz | Iguais aos atuais |

MD5 do build no ar (12:28): `index.html` `c9426f2f…2115e`, `acesso.html` `695559d7…0c16b`, `app.js` `beecd4a3…6f8f1`, `styles.css` `7915d7b5…d169f`, `operacao.html` `2f0fca4e…6e0ec`. O build de 10:36 tinha `app.js` `bee4d636…c0f7`.

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/src/js/10-core.js` | Substituir: tabela única das faixas simuladas (`BENCH_SIM`), `benchShown`, `benchSimOf`, preferência por sensor (`benchBandsOn`), `magView` com a faixa simulada |
| `frontend/src/js/63-magnetic.js` | Substituir: cartão de bancada (percentual, faixa, barra, horário, última leitura válida) |
| `frontend/src/js/64-bench.js` | Substituir: "Alterar faixa da bancada…" com prévia automática, faixa em uso, progresso da confirmação e a preferência "Mostrar faixas simuladas da bancada" |
| `frontend/src/js/50-tree.js`, `65-assets.js` | Substituir: faixa no item do sensor, na linha do spot e no cartão do spot; árvore em tela cheia no telefone |
| `frontend/src/js/70-telemetry.js`, `72-telemetry-mag.js` | Substituir: curva colorida pela altura de cada trecho, legenda, leitura por toque, interrupções, CSV com a faixa |
| `frontend/src/js/20-ble.js`, `90-ble-ui.js` | Substituir: "Buscar sensor por Bluetooth" com estados, cancelar e repetir, leitura local ao lado da leitura da nuvem |
| `frontend/src/js/40-shell.js`, `60-sensors.js`, `95-boot.js` | Substituir: botão Voltar do Android fecha a camada aberta, ação de busca na página Sensores |
| `frontend/src/index.html`, `frontend/src/operacao.html`, `frontend/src/styles/app.css` | Substituir |
| `supabase/migrations/20261122130446_faixas_simuladas_da_bancada.sql` | **Novo** (já com a versão gravada no histórico) |
| `supabase/rollback/20261122130446_faixas_simuladas_da_bancada.down.sql` | **Novo** |
| `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/88_faixas_simuladas.sql` | **Novo** (71 verificações) |
| `tests/ui/faixas_fronteiras.mjs` | **Novo** (36 verificações das fronteiras, sem navegador: `node tests/ui/faixas_fronteiras.mjs`) |
| `dev/run_all.sh` | Substituir (migração 16 e suíte 88) |
| `frontend/README.md` | Substituir (seção das faixas simuladas) |

Nenhum arquivo traz chave, token, hash de ingestão, senha, PIN ou e-mail real. `frontend/dist/` não entra no commit.

## 3. Commit — já feito

Enviado pelo site do GitHub ("Add files via upload"), uma pasta por commit, em 22/11 das 10:29 às 10:36:

| Commit | Pasta | Arquivos |
|---|---|---|
| `8236801` | `tests/ui/` | `faixas_fronteiras.mjs` |
| `0e875ea` | `tests/` | `88_faixas_simuladas.sql` |
| `6b7bfdd` | `supabase/migrations/` | migração 16 |
| `a8744db` | `supabase/rollback/` | reversão da migração 16 |
| `2c5ce1a` | `dev/` | `run_all.sh` |
| `7715c3a` | `frontend/` | `README.md` |
| `cd5e7d7` | `frontend/src/` | `index.html`, `operacao.html` |
| `5aad0fd` | `frontend/src/styles/` | `app.css` |
| `139ac21` | `frontend/src/js/` | os 12 módulos da tabela 2 |
| `9ed071a` | raiz | `index.html`, `acesso.html`, `app.js`, `styles.css`, `operacao.html` |

Correção da tela do celular, das 12:27 às 12:28 (com um TAG selecionado, o caminho comprido alargava a página além do aparelho; telefone deitado ganhou desenho próprio; ícones escuros na barra de status do aplicativo):

| Commit | Pasta | Arquivos |
|---|---|---|
| `fd50c53` | `frontend/src/js/` | `10-core.js`, `95-boot.js` |
| `9235cf5` | `frontend/src/styles/` | `app.css` |
| `8db70db` | `frontend/src/` | `index.html`, `operacao.html` |
| `5850fc6` | raiz | `index.html`, `acesso.html`, `app.js`, `styles.css`, `operacao.html` |

Este arquivo e o `supabase/ESTADO_PRODUCAO.md` entraram em seguida, já com este estado. A árvore resultante é a do pacote `SensorGaxeta_demonstracao_commit.zip` da entrega, com esses dois arquivos atualizados.

Conferir o build e os testes:

```bash
cd frontend && node build.mjs && for f in index.html acesso.html app.js styles.css operacao.html; do cmp dist/$f ../$f; done
node tests/ui/faixas_fronteiras.mjs                              # 36 verificações
PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh          # 1079 verificações + reversão
```

## 4. Migração 16 — já aplicada

Nada a fazer. Para conferir no SQL Editor:

```sql
select version, name from supabase_migrations.schema_migrations order by version desc limit 1;   -- 20261122130446 faixas_simuladas_da_bancada
select md5(prosrc) from pg_proc where proname = 'gaxeta_mag_bench_start';   -- 9f0559390c44afce6559847335ecdcbc
select md5(prosrc) from pg_proc where proname = 'gaxeta_mag_summary';       -- dd9fdc37068f82c73fc5567cfa0deaed
select count(*) from gaxeta_private.mag_bench_prefs;                        -- 0 enquanto ninguém desligar as faixas
```

O arquivo do repositório difere do SQL gravado no histórico em uma linha de comentário (a linha 22 cita o arquivo de reversão, que ganhou a versão definitiva). Nenhuma instrução difere.

## 5. Conferido depois da publicação

- Os cinco arquivos baixados do endereço público têm o MD5 do build (item 1).
- Com a sessão do Ítalo, às 10:38: **Sensores** mostra o L2-956 com **42,61 % · Baixo ajuste** (laranja), a barra com as marcas e "Atualizado às 10:37:41"; **Telemetria** (1 hora) mostra a curva laranja em 42,6 %, a legenda das quatro faixas e 120 leituras válidas de 120.
- Depois da correção das 12:28: os cinco arquivos no ar têm o MD5 do novo build; Sensores aberto às 12:29 mostra o L2-956 com 22,92 % · Sem ajuste, atualizado às 12:28:51.
- Se o navegador ainda mostrar a tela antiga, recarregue sem cache (Cmd+Shift+R).
- Roteiro da demonstração: `ROTEIRO_DA_APRESENTACAO.md`, na pasta da entrega.

## 6. Reversão

- **Site**: `git revert` dos commits `5850fc6` e `9ed071a` (os cinco arquivos da raiz). O site anterior funciona com a migração 16.
- **Aplicativo**: o 1.7.0 não é reinstalável por cima do 1.8.0 (o Android não aceita código de versão menor). Para voltar, gere um APK com código maior a partir do build anterior.
- **Banco**: `supabase/rollback/20261122130446_faixas_simuladas_da_bancada.down.sql` remove a função e a tabela da preferência e devolve `gaxeta_mag_bench_start` e `gaxeta_mag_summary` à forma da migração 15. A escolha de cada sensor (ligado ou desligado) é descartada; leituras, sessões, âncoras e histórico não são tocados.
