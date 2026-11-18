# Como publicar — destravar a calibração: cadastro 15/3, comissionamento em dois pontos e série elétrica (18/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit da calibração por tensão (o que está publicado hoje, deploy Pages nº 13). Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

**Banco:** o banco já está pronto. A migração 11 (`20261118165547_comissionamento_dois_pontos`) foi aplicada no projeto SensorGaxeta em 18/11/2026 às 13:55, com o mesmo MD5 deste arquivo. Só falta publicar os arquivos do site.

A ordem entre o banco e o site é livre. Foi conferido no banco local: o site publicado hoje funciona com a migração 11 aplicada, e o site novo funciona com o banco ainda na migração 10 (nesse caso sem o comissionamento gravado no perfil e sem a reconciliação pelo registro, que dependem da migração).

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual: cadastro × leitura apta, comissionamento em dois pontos, limite do ADC) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz (`README.md`, `config.js`, ícone, logo, `web-*.js`, fontes) | Iguais aos atuais |

Nada precisa ser apagado.

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/README.md` | Substituir |
| `frontend/src/index.html` | Substituir (diálogo de registro; topo e legendas da Telemetria como série elétrica) |
| `frontend/src/operacao.html` | Substituir |
| `frontend/src/styles/app.css` | Substituir |
| `frontend/src/js/10-core.js` | Substituir (posição elétrica, diagnóstico do bloco, cadência do firmware, textos dos estados) |
| `frontend/src/js/40-shell.js` | Substituir (variação bruta entre dois envios) |
| `frontend/src/js/50-tree.js` | Substituir (árvore: ajuste do ciclo ou posição elétrica rotulada) |
| `frontend/src/js/60-sensors.js` | Substituir (bloco fixo em Detalhes; diagnóstico elétrico) |
| `frontend/src/js/62-gland.js` | Substituir (caixa da marca superior, salvamento e reconciliação, leitura candidata, comissionamento em dois pontos) |
| `frontend/src/js/65-assets.js` | Substituir (rótulo elétrico no spot) |
| `frontend/src/js/70-telemetry.js` | Substituir (mesma leitura de Detalhes, série elétrica sem classificação mecânica, CSV) |
| `supabase/migrations/20261118165547_comissionamento_dois_pontos.sql` | **Novo** (já aplicada) |
| `supabase/rollback/20261118165547_comissionamento_dois_pontos.down.sql` | **Novo** |
| `supabase/README.md`, `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/77_comissionamento_dois_pontos.sql` | **Novo** (85 verificações) |
| `tests/76_calibracao_tensao.sql` | Substituir (a confirmação depois de uma leitura mais alta passa a levar a declaração; assinatura nova da função) |
| `tests/90_base_limpa_e_reversao.sh` | Substituir (contagem de sensores com a suíte 77) |
| `dev/run_all.sh` | Substituir (inclui a suíte 77) |

Total: 22 arquivos alterados e 3 novos. O firmware, o APK e as evidências ficam fora do repositório, na pasta da entrega.

## 3. Commit

Mensagem sugerida (está em `MENSAGEM_DO_COMMIT.txt`, ao lado da pasta do repositório):

```
Destravar a calibração: cadastro com leitura no limite do ADC, comissionamento em dois pontos e série elétrica
```

Pela linha de comando, com o pacote extraído sobre o repositório:

```bash
git status                      # deve listar os arquivos das tabelas acima
git add -A
git commit -F ../MENSAGEM_DO_COMMIT.txt
git push
```

Alternativa, a partir de um clone no commit publicado:

```bash
git am ../destravar-calibracao-2026-11-18.patch      # cria o commit já com a mensagem
git push
```

Pelo site do GitHub: em cada pasta, **Add file → Upload files** e arraste os arquivos correspondentes. Comece pela raiz (cinco arquivos do Pages).

## 4. Depois do push

1. Abrir o site, tocar em **Continuar** e recarregar sem cache (Cmd+Shift+R).
2. **Sensores**: sem ciclo calculado, o cartão do G1-432 mostra a posição elétrica como **% elétrico** e, se a leitura estiver no teto, **Limite do ADC**.
3. **Detalhes** do G1-432: quatro quadros fixos (**Posição elétrica do sensor (%)**, **Tensão (V)**, **Distância atual (mm)**, **Ajuste do ciclo (%)**), o horário da leitura com a cadência da placa e a linha do **Ciclo vigente** com as medidas cadastradas.
4. **Registrar engaxetamento**: com a caixa desmarcada, a mensagem é “Marque a caixa para confirmar que você colocou o potenciômetro na marca superior.” e nada é enviado. Com a caixa marcada, 15 e 3 são salvos e a tela mostra o número do registro e **Medidas salvas · aguardando leitura apta**.
5. **Telemetria**: os mesmos quatro números de Detalhes; o gráfico principal com **Leitura atual** e **Linha estabilizada (5 p.p.)**, sem “Sem ajuste”; CSV com a coluna `escala_dos_percentuais` ao final.
6. `…/sensorgaxeta/operacao.html`: seção **Ciclo da gaxeta** com o **Comissionamento em dois pontos**.

## 5. Voltar atrás

- **Site**: restaurar `index.html`, `app.js`, `styles.css`, `operacao.html` e `acesso.html` do commit anterior. O pacote anterior funciona com o banco na migração 10 ou na 11.
- **Banco**: `supabase/rollback/20261118165547_comissionamento_dois_pontos.down.sql` devolve o estado, a consulta, o resumo e a confirmação do ciclo à forma da migração 10. Eventos, referências, perfis e leituras ficam.
- **Firmware**: `GAXETA_BENCH_PROFILE 0` em `GaxetaConfig.h` e gravar de novo devolve a placa à hibernação de 180 s (`4.3.1-hib180`). O 4.3.0 da entrega anterior também continua aceito.

## Estado das migrações

Onze aplicadas em produção, com os números que aparecem nos nomes dos arquivos de `supabase/migrations/`. Detalhes em `supabase/ESTADO_PRODUCAO.md`.
