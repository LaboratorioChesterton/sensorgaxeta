# Como publicar — Modo bancada, Configurar montagem e faixas de ajuste (21/11/2026, entrega da noite)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit publicado `9f3505b` (entrega AS5600 de 21/11; `app.js` com MD5 `5e1b484c…6d8`, igual ao do site). Extraia sobre a cópia local, confira com `git status` e faça o commit.

## Ordem

A ordem entre os três passos é livre: cada combinação foi ensaiada.

| Passo | Estado em 21/11, 21:10 | Compatibilidade |
|---|---|---|
| **1. Banco, migração 15** (quatro arquivos, versões `20261121232208`, `…232341`, `…232459` e `…232554`) | **Aplicada em produção em 21/11, das 20:22 às 20:25**, com autorização do Ítalo. As 149 impressões de funções, colunas, restrições, índices e RLS são iguais às do banco ensaiado; a placa não perdeu nenhum envio. Ver `supabase/ESTADO_PRODUCAO.md`. | O site publicado antes e o firmware 4.4.0 continuaram aceitos. |
| **2. Site** | **Publicado em 21/11 às 20:08** (commit `52e1baf`, depois da exclusão do `62-gland.js` no `4fc7bc5`). Os cinco arquivos servidos são byte a byte os do build ensaiado. | Com a migração 15 aplicada, as telas novas respondem. |
| **3. Firmware 4.5.0** na C3 piloto | **Gravado em 21/11 às 20:46**; bancada ensaiada na placa até 21:06 (extremos e queda de Wi-Fi). Ver `supabase/ESTADO_PRODUCAO.md`. | O banco grava a contagem contínua e calcula a Posição de bancada. |

Para o Modo bancada mostrar percentual são necessários os três.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** (botão "Ver todos os sensores") |
| `app.js` | **Substituir** (de 446 KB para 519 KB) |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual: faixas, Configurar montagem, um toque, Modo bancada, desvincular) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz | Iguais aos atuais |

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/src/js/64-bench.js` | **Novo**: Modo bancada (prévia, ativar, confirmar início, reposicionar, sair, simulação das faixas) |
| `frontend/src/js/66-mag-setup.js` | **Novo**: Configurar montagem (curso no TAG e no spot, revisões e ensaio) e campos do formulário de Ativos |
| `frontend/src/js/62-gland.js` | **Apagado** do repositório em 21/11 (commit `4fc7bc5`). Com ele presente, `node build.mjs` gerava um `app.js` com erro de sintaxe (`newRequestId` declarado duas vezes). |
| `frontend/src/js/10-core.js` | Substituir (faixas, motivos de bancada, `magView` com série e estabilizado em duas casas) |
| `frontend/src/js/63-magnetic.js` | Substituir (cartão com selo de série e botão Configurar; um toque com o curso do cadastro; registro sem referência) |
| `frontend/src/js/60-sensors.js` | Substituir (Ver todos, Desvincular em Detalhes com TAG, equipamento e spot) |
| `frontend/src/js/50-tree.js`, `65-assets.js`, `72-telemetry-mag.js` | Substituir (árvore com série e faixa; curso no formulário do TAG e do spot; gráfico e CSV da bancada) |
| `frontend/src/index.html`, `frontend/src/operacao.html`, `frontend/src/styles/app.css` | Substituir |
| `supabase/migrations/20261121232208_a_modo_bancada_estrutura.sql` | **Novo** |
| `supabase/migrations/20261121232341_b_ingestao_contagem_continua.sql` | **Novo** |
| `supabase/migrations/20261121232459_c_bancada_cadastro_funcoes.sql` | **Novo** |
| `supabase/migrations/20261121232554_d_resumo_e_historico_magnetico.sql` | **Novo** |
| `supabase/rollback/20261121232208_a_modo_bancada_estrutura.down.sql` | **Novo**: reverte as quatro partes de uma vez |
| `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/87_modo_bancada.sql` | **Novo** (196 verificações) |
| `tests/85_concorrencia_magnetica.sh` | Substituir (horário da amostra com milissegundos: tirava uma falha intermitente do ensaio) |
| `tests/86_capacidade_15_dias.sh` | Substituir (carga com a contagem contínua) |
| `dev/run_all.sh` | Substituir (migração 15 e suíte 87) |

Os quatro arquivos e o `.down.sql` já estão com as versões que o Supabase gravou no histórico ao aplicar (21/11, 20:22 a 20:25).

Nenhum arquivo traz chave, token, hash de ingestão, senha, PIN ou e-mail real.

## 3. Commit

```bash
cd <sua cópia do repositório, no commit 9f3505b>
unzip -o "<pasta da entrega>/repositorio/SensorGaxeta_bancada_commit.zip"
git rm -q frontend/src/js/62-gland.js      # o ZIP não apaga arquivo
git status
git add -A && git commit -F "<pasta da entrega>/MENSAGEM_DO_COMMIT.txt" && git push
```

ou `git am "<pasta da entrega>/repositorio/modo-bancada-2026-11-21.patch" && git push` (o patch já apaga o `62-gland.js`).

Pelo site do GitHub ("Add files via upload"): envie os arquivos da tabela 1 na raiz e os da tabela 2 nas pastas indicadas, e apague `frontend/src/js/62-gland.js` pela própria página do arquivo.

Conferir o build e os testes:

```bash
cd frontend && node build.mjs && for f in index.html acesso.html app.js styles.css operacao.html; do cmp dist/$f ../$f; done
PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh        # 1008 verificações + reversão
PGHOST=/tmp PGPORT=54329 PGUSER=postgres tests/86_capacidade_15_dias.sh 10
```

## 4. Aplicar a migração 15

No SQL Editor do Supabase (projeto SensorGaxeta), cole e execute **um arquivo por vez, na ordem a, b, c, d**. Cada um é uma transação: ou entra inteiro, ou nada muda. O primeiro toma `gaxeta_devices` e `gaxeta_readings` sem espera; se coincidir com uma leitura chegando, ele falha sem alterar nada: execute de novo.

Antes: o histórico deve terminar em `20261121154407 as5600_contrato_magnetico`. **Não reaplique a migração 14, não aplique a 13 (`20261119142500`), o script de reversão nem a proposta de remoção de índice.**

Depois, confira:

```sql
select count(*) from pg_proc where proname in ('gaxeta_mag_bench_preview','gaxeta_mag_bench_start','gaxeta_mag_bench_confirm','gaxeta_mag_bench_stop',
  'gaxeta_mag_set_point_course','gaxeta_mag_set_point_geometry','gaxeta_mag_asset_setup','gaxeta_mag_record_maintenance');   -- 8
select count(*) from information_schema.columns where table_name = 'gaxeta_readings' and column_name ~ '^(ct_|bench_)';     -- 10
```

## 5. Depois do push

1. Abra o site, toque em **Continuar** e recarregue sem cache (Cmd+Shift+R).
2. **Sensores**: o L2-956 aparece com **Sem geometria** e o botão **Configurar** no cartão.
3. Siga o `COMO_USAR_ROTEIRO_ITALO.md` da pasta da entrega.

## 6. Reversão

- **Site**: `git revert` do commit.
- **Placa**: gravar de volta o 4.4.0 (binário exportado antes da gravação do 4.5.0; ver `firmware/LEIA_FIRMWARE.md`). O banco aceita os dois.
- **Banco**: `supabase/rollback/20261121232208_a_modo_bancada_estrutura.down.sql` devolve as funções à forma da migração 14 e remove tabelas, colunas e funções novas. As leituras ficam; a contagem contínua e o resultado de bancada gravados nelas são descartados com as colunas. Recusa rodar se houver spot com curso próprio e sem geometria.
