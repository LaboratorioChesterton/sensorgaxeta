# Como publicar — calibração por tensão e marca superior (18/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit `b70fd06` (o que está publicado hoje). Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

**O banco já está pronto.** A migração 10 (`20261118132114_calibracao_tensao`) foi aplicada no projeto SensorGaxeta em 18/11/2026 às 10:21. Só falta publicar os arquivos do site.

Até o push, o site publicado continua funcionando: ele lê os mesmos nomes de função. A diferença é a apresentação. O site antigo não conhece os estados novos e mostra **Sem referência** para um ciclo registrado na regra nova. Publique antes de registrar o próximo engaxetamento.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual com a seção Ciclo da gaxeta reescrita) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz (`README.md`, `config.js`, ícone, logo, `web-*.js`, fontes) | Iguais aos atuais |

Nada precisa ser apagado.

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/README.md` | Substituir |
| `frontend/src/index.html` | Substituir (diálogo de registro com a marca superior; topo da Telemetria com distância, percentual e tensão) |
| `frontend/src/operacao.html` | Substituir |
| `frontend/src/styles/app.css` | Substituir |
| `frontend/src/js/10-core.js` | Substituir (estados do ciclo, tensão com origem, classificação só em ciclo calibrado) |
| `frontend/src/js/60-sensors.js` | Substituir (cartões e painel com mm, % e V; diagnóstico elétrico) |
| `frontend/src/js/62-gland.js` | Substituir (registro na marca superior, confirmação da leitura, conferência, gráfico do ciclo) |
| `frontend/src/js/70-telemetry.js` | Substituir (topo, tabela e CSV com tensão calibrada e colunas do ciclo) |
| `supabase/migrations/20261118132114_calibracao_tensao.sql` | **Novo** (já aplicada) |
| `supabase/rollback/20261118132114_calibracao_tensao.down.sql` | **Novo** |
| `supabase/README.md`, `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/76_calibracao_tensao.sql` | **Novo** |
| `tests/75_ciclos_gaxeta.sql` | Substituir (passa a cobrir a regra 1, preservada) |
| `tests/20_pos_migracao.sql`, `tests/70_ficha_spots.sql`, `tests/90_base_limpa_e_reversao.sh` | Substituir (hash novo do invólucro de ingestão; contagem de sensores) |
| `dev/run_all.sh` | Substituir (inclui a suíte 76) |

Total: 21 arquivos alterados e 3 novos. O firmware e o APK ficam fora do repositório, na pasta da entrega.

## 3. Commit

Mensagem sugerida (está em `MENSAGEM_DO_COMMIT.txt`, ao lado da pasta do repositório):

```
Calibração por tensão: referência na marca superior, tensão calibrada e ciclo em mm, % e V
```

Pela linha de comando, com o pacote extraído sobre o repositório:

```bash
git status                      # deve listar os arquivos das tabelas acima
git add -A
git commit -F ../MENSAGEM_DO_COMMIT.txt
git push
```

Alternativa, a partir de um clone em `b70fd06`:

```bash
git am ../calibracao-tensao-2026-11-18.patch      # cria o commit já com a mensagem
git push
```

Pelo site do GitHub: em cada pasta, **Add file → Upload files** e arraste os arquivos correspondentes. Comece pela raiz (cinco arquivos do Pages).

## 4. Depois do push

1. Abrir o site, tocar em **Continuar** e recarregar sem cache (Cmd+Shift+R).
2. **Sensores**: o cartão do G1-432 mostra a tensão com a palavra **calibrada** (firmware 4.3.0). O ciclo registrado em 17/11 aparece como **Estimativa nominal**, sem faixa de ajuste.
3. **Detalhes** do G1-432: três quadros no topo, **Ajuste do ciclo (%)**, **Distância atual (mm)** e **Tensão (V)**. Em **Leitura elétrica (diagnóstico)**: ADC bruto, bloco, dispersão e método `a1-12db-n20-lf-vref`.
4. **Registrar engaxetamento**: o diálogo pede para marcar que o potenciômetro está na marca superior.
5. **Telemetria**: no topo, distância, ajuste do ciclo e tensão calibrada; **CSV** com as colunas novas ao final.
6. `…/sensorgaxeta/operacao.html`: seção **Ciclo da gaxeta** com a tabela de estados.

## 5. Voltar atrás

- **Site**: restaurar `index.html`, `app.js`, `styles.css`, `operacao.html` e `acesso.html` do commit `b70fd06`. O pacote anterior funciona com o banco atual.
- **Banco**: `supabase/rollback/20261118132114_calibracao_tensao.down.sql` devolve a ingestão, o histórico e as funções do ciclo à forma das migrações 06 e 09 e descarta a tensão calibrada, as referências aprovadas e os perfis. Eventos, vínculos e leituras ficam. O firmware 4.3.0 continua aceito depois da reversão: os campos novos são ignorados.
- **Firmware**: regravar o 4.2.0 (pasta `ENTREGA_2026-11-17_CICLO_GAXETA/firmware`). O banco aceita as duas versões.

## Estado das migrações

Dez aplicadas em produção, com os números que aparecem nos nomes dos arquivos de `supabase/migrations/`. Detalhes em `supabase/ESTADO_PRODUCAO.md`.
