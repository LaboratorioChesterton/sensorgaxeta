# Como publicar — posição elétrica e cartões (19/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit publicado hoje (entrega de 18/11, “destravar a calibração”: `app.js` com MD5 `8dafaa59…4f31`). Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

## Ordem

1. **Banco, migração 12** (`20261119141626_posicao_eletrica`): **já aplicada** em 19/11/2026 às 11:16. O site publicado continua funcionando com ela.
2. **Site**: o seu commit e o push (item 3).
3. **APK 1.7.0** nos celulares (pasta `android/` da entrega).
4. **Banco, migração 13** (`20261119142500_desativa_calibracao_mecanica`): **só depois** dos itens 2 e 3. Ela nega as sete funções do antigo ciclo de gaxeta; o site e o APK anteriores ainda chamam duas delas a cada atualização. Não apliquei.

O site novo exige a migração 12 (usa `gaxeta_telemetry_summary`). Sem ela, a tela abre, mas a cadência vem só do sufixo do firmware.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** (de 471 KB para 395 KB: saiu o módulo do ciclo de gaxeta) |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual: seção Posição elétrica no lugar do Ciclo da gaxeta) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz (`README.md`, `config.js`, ícone, logo, `web-*.js`, fontes) | Iguais aos atuais |

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/src/js/62-gland.js` | **Apagar** (fluxo de calibração mecânica) |
| `frontend/src/js/10-core.js` | Substituir (`electricInfo`, `electricView`, condição do sinal, escala do percentual; saem `cycleView`, `adjustmentInfo` e os textos do ciclo) |
| `frontend/src/js/40-shell.js` | Substituir (`gaxeta_telemetry_summary`, cadência medida ou declarada) |
| `frontend/src/js/50-tree.js`, `65-assets.js` | Substituir (posição elétrica na árvore e no spot) |
| `frontend/src/js/60-sensors.js` | Substituir (cartão e Detalhes só elétricos; marcação do cartão) |
| `frontend/src/js/70-telemetry.js` | Substituir (topo, gráfico e CSV só elétricos) |
| `frontend/src/index.html`, `frontend/src/operacao.html` | Substituir |
| `frontend/src/styles/app.css` | Substituir (contenção dos cartões; sai o CSS do ciclo) |
| `frontend/README.md` | Substituir |
| `supabase/migrations/20261119141626_posicao_eletrica.sql` | **Novo** (já aplicada) |
| `supabase/migrations/20261119142500_desativa_calibracao_mecanica.sql` | **Novo** (não aplicada) |
| `supabase/rollback/20261119141626_posicao_eletrica.down.sql`, `…142500_desativa_calibracao_mecanica.down.sql` | **Novos** |
| `supabase/README.md`, `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/78_posicao_eletrica.sql` | **Novo** (77 verificações) |
| `tests/79_ciclo_fora_de_operacao.sql` | **Novo** (22 verificações) |
| `tests/90_base_limpa_e_reversao.sh` | Substituir (não depende mais de contagem fixa de sensores nem de hash fixo da ingestão) |
| `dev/run_all.sh`, `dev/rebuild.sh` | Substituir (suítes 75 a 77 antes das migrações 12 e 13; suítes 78 e 79 depois) |

Nenhum arquivo traz chave, token, hash de ingestão, senha ou e-mail real. O firmware, o APK e as evidências ficam fora do repositório, na pasta da entrega.

## 3. Commit

```bash
cd <sua cópia do repositório, no commit publicado>
unzip -o "<pasta da entrega>/SensorGaxeta_posicao_eletrica_commit.zip"
git rm -q --cached frontend/src/js/62-gland.js 2>/dev/null; rm -f frontend/src/js/62-gland.js   # o ZIP não apaga arquivo
git status
git add -A && git commit -F "<pasta da entrega>/MENSAGEM_DO_COMMIT.txt" && git push
```

ou, a partir de um clone no commit publicado: `git am "<pasta da entrega>/posicao-eletrica-2026-11-19.patch" && git push` (o patch já apaga o `62-gland.js`).

Conferir o build e os testes:

```bash
cd frontend && node build.mjs && for f in index.html acesso.html app.js styles.css operacao.html; do cmp dist/$f ../$f; done
PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh        # 638 verificações + reversão
```

## 4. Depois do push

1. Abrir o site, tocar em **Continuar** e recarregar sem cache (Cmd+Shift+R).
2. **Sensores**: cada cartão mostra **Posição elétrica** em %, a condição do sinal, **Tensão** em V com a origem e **Estável**. A placa C3 sem potenciômetro aparece em **Sem vínculo · fila de associação**, com **Sinal instável**. Nenhum texto atravessa a borda do cartão.
3. **Detalhes**: quatro quadros (**Posição elétrica (%)**, **Tensão (V)**, **Linha estabilizada (%)**, **Sinal**). Não há **Registrar engaxetamento**, manutenção, confirmação nem conferência.
4. **Telemetria**: topo com posição elétrica, tensão e linha estabilizada; um gráfico só; CSV sem coluna em mm.
5. **Manual**: seção **Posição elétrica**.

## 5. Migração 13, depois do site e do APK

No SQL Editor do projeto SensorGaxeta, cole o conteúdo de `supabase/migrations/20261119142500_desativa_calibracao_mecanica.sql` e execute, ou me peça para aplicar. Depois, renomeie o arquivo e a reversão com a versão que o Supabase gravar no histórico, como nas migrações anteriores. Reversão: `supabase/rollback/20261119142500_desativa_calibracao_mecanica.down.sql` (um `grant`; nenhum dado é apagado pela migração).
