# Banco de dados — Gaxeta Gestão de Ativos

Estado atual em produção: `ESTADO_PRODUCAO.md` (seis migrações aplicadas).

| Pasta | Conteúdo |
|---|---|
| `baseline/` | Objetos do aplicativo como estavam em produção antes das migrações. Só para montar bases limpas. |
| `migrations/` | As seis migrações, com o número gravado no histórico do Supabase. A quinta é o corte de acesso. |
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
dev/run_all.sh                     # suíte funcional completa: 209 verificações + reversão
tests/82_telemetria.sh             # tempos, planos e equivalência do histórico
tests/83_volume_tenants.sh         # 10.000 corporações
tests/95_limpeza_ensaio.sh         # ensaio da limpeza
```

Os scripts foram ajustados aos novos nomes de arquivo depois da última execução completa; a sintaxe foi conferida, a suíte não foi reexecutada.

Nenhum arquivo traz chave, token, hash de ingestão, senha ou e-mail real.
