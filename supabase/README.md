# Banco de dados — Gaxeta Gestão de Ativos

Estado atual em produção: `ESTADO_PRODUCAO.md`.

| Pasta | Conteúdo |
|---|---|
| `baseline/` | Objetos do aplicativo como estavam em produção antes das migrações. Só para montar bases limpas. |
| `migrations/` | As migrações, com o número gravado no histórico do Supabase. A quinta é o corte de acesso; a sétima traz a ficha do TAG, os nomes de Spot e a busca de sensores por TAG. |
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
dev/run_all.sh                     # suíte funcional completa: 247 verificações + reversão
tests/82_telemetria.sh             # tempos, planos e equivalência do histórico
tests/83_volume_tenants.sh         # 10.000 corporações
tests/95_limpeza_ensaio.sh         # ensaio da limpeza
```

Última execução completa de `dev/run_all.sh`: 12/11/2026, PostgreSQL 16 local, 247 verificações sem falhas, com a migração 07 e a reversão dela incluídas (a reversão completa devolve o catálogo ao da baseline). As suítes 82, 83 e 95 tiveram só os nomes de spot ajustados para LOA/LA e não foram reexecutadas.

Nenhum arquivo traz chave, token, hash de ingestão, senha ou e-mail real.
