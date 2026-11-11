# Estado da produção — SensorGaxeta

Conferido em 11/11/2026 às 15:32 (horário de Brasília). Projeto confirmado antes de cada aplicação: **SensorGaxeta**, PostgreSQL 17.11.

## Migrações: seis de seis aplicadas

Aplicadas pelo conector do Supabase, em ordem. O SQL gravado no histórico tem o mesmo MD5 dos arquivos de `supabase/migrations/` (comparação feita no banco, coluna `statements`).

| # | Arquivo | Versão no histórico | Aplicada em |
|---|---|---|---|
| 01 | `20261111173402_estrutura_hierarquia.sql` | `20261111173402` | 14:34 |
| 02 | `20261111173649_papeis_escopos.sql` | `20261111173649` | 14:36 |
| 03 | `20261111175423_cadastro_rpcs.sql` | `20261111175423` | 14:54 |
| 04 | `20261111175551_usuarios_convites.sql` | `20261111175551` | 14:55 |
| 05 | `20261111175624_corte_acesso.sql` | `20261111175624` | 14:56 |
| 06 | `20261111175658_telemetria_consultas.sql` | `20261111175658` | 14:56 |

Antes da 05, as duas contas existentes estavam mapeadas como nível 1, ativas e confirmadas.

## Checagem depois das seis (site publicado, pacote antigo)

- 14:57 — **Sensores** abriu; a leitura da L2-991 avançou de 14:57:36 para 14:57:56 com a tela aberta.
- 14:58 — **Telemetria, 5 min**: 30 leituras, de 14:53:13 a 14:58:13.
- 14:58 — **Telemetria, 1 mês**: carregou 66.729 leituras (antes estourava o tempo).
- Políticas: só as oito `scope_*`; nenhuma `member_*`. `anon` sem privilégio nas cinco tabelas.

## Ingestão e placa

Nada foi enviado à placa. Às 15:32: 30 leituras da L2-991 nos últimos 5 minutos, a última às 15:32:38. `gaxeta_ingest`, `gaxeta_ingest_v3` e `gaxeta_private.stabilize` com o mesmo hash de antes das migrações; privilégios de execução da ingestão inalterados.

## Função de envio de convites

`gaxeta-invite` implantada (versão 1), código em `supabase/functions/gaxeta-invite/index.ts`. A verificação de JWT do gateway está desligada porque a função autentica por conta própria (confere a sessão e a autoridade no banco antes de qualquer envio). Testado pelo navegador: sem sessão → 401; token inválido → 401; convite inexistente → 404; corpo inválido → 400. **Envio real de e-mail não testado.**

## O que os testes do frontend deixaram no banco

Os testes da interface nova gravaram e depois removeram, pela própria interface, uma corporação de teste com empresa, área, subárea, dois TAGs, dois spots e um gateway. Ficaram:

- 22 linhas na trilha de auditoria (criações e exclusões do teste, um convite criado e revogado);
- 1 convite **revogado**, de nível 3, para um endereço fictício em `example.com` (nenhum e-mail foi enviado e nenhuma conta foi criada no Auth).

A L2-991 continua sem vínculo, na fila de associação. Auth segue com as duas contas.

## Configuração pendente no painel do Supabase

1. **Auth → URL Configuration → Redirect URLs**: incluir `https://laboratoriochesterton.github.io/sensorgaxeta/acesso.html`. Sem isso, os links de e-mail caem na página inicial, que também trata o retorno.
2. **Auth → SMTP**: configurar remetente próprio. O serviço de e-mail padrão do Supabase só entrega a endereços da equipe do projeto e tem limite baixo por hora. É a configuração que falta para o envio real.
3. Cadastro público: **continua aberto**, como combinado, até convite e recuperação serem comprovados com e-mail real.

## Limites conhecidos

- A tela não consegue ler os dados de contato de uma corporação já gravada (não há RPC de leitura). Proposta, não aplicada, em `supabase/propostas/`.
- Excluir uma corporação que tenha convites (mesmo revogados) falha por chave estrangeira, sem mensagem amigável.
- O filtro "Transmitindo / Sem atualização" de Sensores vale para a página carregada, não para o total.
- Suíte de banco rodou em PostgreSQL 16 local; em 17 só houve a aplicação real e as checagens acima.
- Sem backup recuperável confirmado (plano gratuito).
- Limpeza de leituras: não executada.

## Reversão

Aplicar os arquivos de `supabase/rollback/` em ordem inversa (06 → 01) e remover as linhas correspondentes de `supabase_migrations.schema_migrations`. A reversão da 02 descarta cadastros de usuários, concessões e convites. O frontend novo depende das seis; para voltar o site, basta restaurar os três arquivos antigos (`index.html`, `app.js`, `styles.css`), que continuam compatíveis com o banco novo.
