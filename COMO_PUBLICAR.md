# Como publicar — ciclo de gaxeta e Excluir equipamento (17/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit `c480a26` (o que está publicado hoje). Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

**O banco já está pronto.** A migração 08 (`20261117210000_ciclos_gaxeta`) já estava aplicada e a 09 (`20261117222922_referencia_gaxeta`) foi aplicada no projeto SensorGaxeta em 17/11/2026 às 19:29. Só falta publicar os arquivos do site.

Até o push, o site publicado continua funcionando como antes: ele não chama as funções novas.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual com a seção Ciclo da gaxeta) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| `README.md`, `config.js`, `icon.svg`, `chesterton-logo.jpg` | Iguais aos atuais |
| `web-8iTD2sZM.js`, `web-BfBGDy75.js`, `web-DEeSqGRi.js` | Iguais aos atuais |
| 12 arquivos `barlow-*.woff` / `.woff2` | Iguais aos atuais |

Nada precisa ser apagado.

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/README.md` | Substituir |
| `frontend/src/index.html` | Substituir (diálogo de registro, painel do ciclo na Telemetria) |
| `frontend/src/operacao.html` | Substituir |
| `frontend/src/styles/app.css` | Substituir |
| `frontend/src/js/10-core.js` | Substituir (situação de transmissão pela cadência, regras de apresentação do ciclo) |
| `frontend/src/js/40-shell.js` | Substituir |
| `frontend/src/js/60-sensors.js` | Substituir |
| `frontend/src/js/65-assets.js` | Substituir (Excluir equipamento) |
| `frontend/src/js/70-telemetry.js` | Substituir |
| `frontend/src/js/62-gland.js` | **Novo** (ciclo de gaxeta) |
| `supabase/migrations/20261117210000_ciclos_gaxeta.sql` | **Novo** (já estava aplicada; o arquivo foi escrito a partir do histórico do banco) |
| `supabase/migrations/20261117222922_referencia_gaxeta.sql` | **Novo** (já aplicada) |
| `supabase/rollback/20261117210000_ciclos_gaxeta.down.sql` | **Novo** |
| `supabase/rollback/20261117222922_referencia_gaxeta.down.sql` | **Novo** |
| `supabase/README.md`, `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/75_ciclos_gaxeta.sql` | **Novo** |
| `dev/run_all.sh` | Substituir (inclui a suíte 75) |

Total: 18 arquivos alterados e 6 novos. Os demais arquivos do repositório não mudaram. O firmware e o APK ficam fora do repositório, na pasta da entrega.

## 3. Commit

Mensagem sugerida (está em `MENSAGEM_DO_COMMIT.txt`, ao lado da pasta do repositório):

```
Ciclo de gaxeta: referência por engaxetamento, conferência de medida e Excluir equipamento
```

Pela linha de comando, com o pacote extraído sobre o repositório:

```bash
git status                      # deve listar os arquivos das tabelas acima
git add -A
git commit -F ../MENSAGEM_DO_COMMIT.txt
git push
```

Pelo site do GitHub (como nos commits anteriores): em cada pasta, **Add file → Upload files** e arraste os arquivos correspondentes. Comece pela raiz (cinco arquivos do Pages) e não esqueça o arquivo novo `frontend/src/js/62-gland.js`.

## 4. Depois do push

1. Abrir o site e tocar em **Continuar**. Em **Sensores**, o L2-955 deve aparecer como **Sem referência**, com a posição do sensor em % da escala.
2. **Detalhes** do sensor: seção **Ciclo da gaxeta** com **Registrar engaxetamento** e **Iniciar manutenção**.
3. Em **Ativos**, selecionar um TAG: botão **Excluir equipamento**. No L2-955 a plataforma deve bloquear e explicar (1 spot, 1 sensor, 1 registro de instalação). Cancelar não altera nada.
4. **Telemetria**: o topo mostra a condição pelo ciclo; o painel do ciclo aparece depois do primeiro registro.
5. Abrir `…/sensorgaxeta/operacao.html`: seção **Ciclo da gaxeta** no índice.
6. Se o navegador mostrar a versão anterior, recarregar sem cache (Cmd+Shift+R).

## 5. Voltar atrás

- **Site**: restaurar `index.html`, `app.js`, `styles.css`, `operacao.html` e `acesso.html` do commit `c480a26`. O pacote anterior funciona com o banco atual.
- **Banco**: `supabase/rollback/20261117222922_referencia_gaxeta.down.sql` devolve as funções à forma da migração 08 e descarta as conferências e as distâncias de fim de ajuste. `supabase/rollback/20261117210000_ciclos_gaxeta.down.sql`, aplicada depois, remove os eventos do ciclo. Nenhuma das duas toca em ativos, vínculos, leituras, movimentos ou ingestão. Reverter o banco exige reverter o site antes; se o site novo ficar no ar sem as funções, ele volta sozinho à apresentação anterior.

## Estado das migrações

Nove aplicadas em produção, com os números que aparecem nos nomes dos arquivos de `supabase/migrations/`. Detalhes em `supabase/ESTADO_PRODUCAO.md`.
