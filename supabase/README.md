# Banco de dados — Gaxeta Gestão de Ativos

Estado atual em produção: `ESTADO_PRODUCAO.md`.

| Pasta | Conteúdo |
|---|---|
| `baseline/` | Objetos do aplicativo como estavam em produção antes das migrações. Só para montar bases limpas. |
| `migrations/` | As migrações, com o número gravado no histórico do Supabase. A quinta é o corte de acesso; a sétima traz a ficha do TAG, os nomes de Spot e a busca de sensores por TAG; a oitava e a nona trazem o ciclo de gaxeta (eventos, referência por engaxetamento, escala, percentual); a décima traz a tensão calibrada, a qualidade do bloco e a referência na marca superior validada (regra 2), com perfil versionado por instalação. |
| `rollback/` | Uma reversão por migração, para aplicar em ordem inversa. |
| `functions/gaxeta-invite/` | Edge Function que envia o convite de acesso. |
| `propostas/` | SQL sugerido e **não aplicado**. |
| `../dev/` | Emulação mínima do Supabase e scripts do ambiente local. Nunca aplicar em projeto Supabase. |
| `../tests/` | Fixtures sintéticas e suítes (e-mails fictícios `@dev.test`). |
| `../limpeza/` | Ferramenta da limpeza única de leituras. Não é migração e não foi executada. |

## Reproduzir os testes do banco

Requer PostgreSQL 16 ou 17 local com `pg_trgm` e `auto_explain`, e `psql`.

```bash
export PGHOST=/tmp PGPORT=54329 PGUSER=postgres   # ajuste ao seu servidor local
dev/run_all.sh                     # suíte funcional completa: 539 verificações + reversão
tests/82_telemetria.sh             # tempos, planos e equivalência do histórico
tests/83_volume_tenants.sh         # 10.000 corporações
tests/95_limpeza_ensaio.sh         # ensaio da limpeza
```

Última execução completa de `dev/run_all.sh`: 18/11/2026, PostgreSQL 16 local, 539 verificações sem falhas, com as migrações 08 a 11 e as reversões delas incluídas (a reversão completa devolve o catálogo ao da baseline; a reversão só da 11 devolve o catálogo ao da migração 10). A suíte 75 cobre a regra 1 do ciclo de gaxeta e a exclusão de equipamento; a suíte 76 cobre a migração 10 (124 verificações); a suíte 77 cobre a migração 11 (85 verificações: cadastro com a leitura no limite do ADC, substituição de cadastro pendente, bloco misto, leitura intermediária, idade da leitura, comissionamento em dois pontos, nova troca com outras medidas e modo só elétrico). As suítes 76 e 77 gravam uma leitura por segundo pela rota real de ingestão; a 77 amplia, só na base de teste, o limite de placas da chave de desenvolvimento. As suítes 82, 83 e 95 não foram reexecutadas.

Nenhum arquivo traz chave, token, hash de ingestão, senha ou e-mail real.
