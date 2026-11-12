# Como publicar — refinamento de 12/11/2026

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit `eb76200`. Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

**O banco já está pronto.** A migração 07 (`20261112143031_ficha_equipamento_spots`) foi aplicada no projeto SensorGaxeta em 12/11/2026 às 11:30. Só falta publicar os arquivos do site.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual com índice lateral) |
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
| `frontend/src/index.html` | Substituir |
| `frontend/src/operacao.html` | Substituir |
| `frontend/src/styles/app.css` | Substituir |
| `frontend/src/js/10-core.js` | Substituir |
| `frontend/src/js/40-shell.js` | Substituir |
| `frontend/src/js/50-tree.js` | Substituir |
| `frontend/src/js/60-sensors.js` | Substituir |
| `frontend/src/js/65-assets.js` | Substituir |
| `frontend/src/js/70-telemetry.js` | Substituir |
| `frontend/src/js/80-users.js` | Substituir |
| `frontend/src/js/85-auth.js` | Substituir |
| `frontend/src/js/90-ble-ui.js` | Substituir |
| `frontend/src/js/95-boot.js` | Substituir |
| `frontend/src/js/88-manual.js` | **Novo** |
| `supabase/migrations/20261112143031_ficha_equipamento_spots.sql` | **Novo** (já aplicado) |
| `supabase/rollback/20261112143031_ficha_equipamento_spots.down.sql` | **Novo** |
| `supabase/README.md`, `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/70_ficha_spots.sql` | **Novo** |
| `tests/30_tenants.sql`, `tests/40_matriz_acesso.sql`, `tests/50_concorrencia.sh`, `tests/82_telemetria.sh`, `tests/83_volume_tenants.sh` | Substituir (spots de teste com nomes LOA/LA) |
| `dev/run_all.sh` | Substituir (inclui a suíte 70) |

Total: 28 arquivos alterados e 4 novos. Os demais arquivos do repositório não mudaram.

## 3. Commit

Mensagem sugerida:

```
Refinamento: ficha do TAG, spots LOA/LA/UNICO, telemetria por condição, acesso por ramo

- Ativos: TAG obrigatório com tipo de equipamento e ficha técnica; resumo de spots e sensores no TAG
- Spot: nome por seleção (LOA, LA, UNICO), validado no servidor; nomes anteriores preservados
- Telemetria: TAG · tipo na frente, cabeçalho enxuto, linha colorida pela condição, uma consulta por período
- Usuários: Toda a corporação / Selecionar ramos / Sem acesso; revisão fiel à prévia do servidor
- Bluetooth só no aplicativo nativo; diálogo fechado fora do layout
- Manual com índice lateral, também dentro da plataforma (Voltar à tela de origem)
- Banco: migração 20261112143031 (já aplicada) e reversão
```

Pela linha de comando, com o pacote extraído sobre o repositório:

```bash
git status                      # deve listar os arquivos das tabelas acima
git add -A
git commit -F ../MENSAGEM_DO_COMMIT.txt   # arquivo entregue ao lado da pasta do repositório; ou cole a mensagem acima
git push
```

Pelo site do GitHub (como nos commits anteriores): em cada pasta, **Add file → Upload files** e arraste os arquivos correspondentes. Comece pela raiz (cinco arquivos do Pages).

## 4. Depois do push

1. Abrir o site, tocar em **Continuar** e conferir Sensores (cartão com `TAG · tipo · spot`) e Telemetria.
2. Em **Ativos**, selecionar um TAG: devem aparecer o resumo de spots e a ficha técnica.
3. Abrir `…/sensorgaxeta/operacao.html`: índice lateral.
4. Se o navegador mostrar a versão anterior, recarregar sem cache (Cmd+Shift+R).

## 5. Voltar atrás

- **Site**: restaurar `index.html`, `app.js`, `styles.css`, `operacao.html` e `acesso.html` do commit `eb76200`. O pacote anterior funciona com o banco atual (a única diferença para ele é que spots novos precisam se chamar LOA, LA ou UNICO).
- **Banco**: `supabase/rollback/20261112143031_ficha_equipamento_spots.down.sql`. Descarta as fichas técnicas gravadas; ativos, vínculos, leituras e usuários não são tocados. Reverter o banco exige reverter o site antes.

## Estado das migrações

Sete aplicadas em produção, com os números que aparecem nos nomes dos arquivos de `supabase/migrations/`. Detalhes em `supabase/ESTADO_PRODUCAO.md`.
