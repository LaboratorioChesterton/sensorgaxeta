# Estado da produção — SensorGaxeta

Conferido em 12/11/2026 às 11:37 (horário de Brasília). Projeto **SensorGaxeta**, PostgreSQL 17.11. O ambiente hospedado é o piloto em uso e continua em teste.

## Migrações: sete de sete aplicadas

Aplicadas pelo conector do Supabase, em ordem. O SQL gravado no histórico tem o mesmo MD5 dos arquivos de `supabase/migrations/` (comparação feita no banco, coluna `statements`).

| # | Arquivo | Versão no histórico | Aplicada em |
|---|---|---|---|
| 01 | `20261111173402_estrutura_hierarquia.sql` | `20261111173402` | 11/11 14:34 |
| 02 | `20261111173649_papeis_escopos.sql` | `20261111173649` | 11/11 14:36 |
| 03 | `20261111175423_cadastro_rpcs.sql` | `20261111175423` | 11/11 14:54 |
| 04 | `20261111175551_usuarios_convites.sql` | `20261111175551` | 11/11 14:55 |
| 05 | `20261111175624_corte_acesso.sql` | `20261111175624` | 11/11 14:56 |
| 06 | `20261111175658_telemetria_consultas.sql` | `20261111175658` | 11/11 14:56 |
| 07 | `20261112143031_ficha_equipamento_spots.sql` | `20261112143031` | 12/11 11:30 |

## Migração 07 (refinamento de 12/11/2026)

Aditiva. O que criou ou alterou:

| Objeto | O que é |
|---|---|
| `public.gaxeta_equipment_types` | Catálogo de tipos de equipamento (14 linhas). Leitura para contas com acesso. |
| `public.gaxeta_equipment_details` | Ficha técnica, 1:1 com o ativo `equipment`. Leitura só com acesso efetivo ao TAG; escrita só pela RPC. |
| `public.gaxeta_save_equipment(...)` | Grava TAG e ficha numa transação, reutilizando `gaxeta_save_asset`. |
| `public.gaxeta_equipment_overview(uuid)` | TAG, ficha, spots e sensores numa chamada (vale a política de quem chama). |
| Gatilho `gaxeta_asset_point_name` | Spot novo ou renomeado só aceita LOA, LA ou UNICO. Nome anterior é mantido enquanto não for trocado. |
| `public.gaxeta_devices_page(...)` | **Corpo substituído**: a busca passa a encontrar também pelo TAG. Mesma assinatura e mesma resposta. |
| `gaxeta_private.*` | Funções auxiliares (`spot_name_canonical`, `point_name_guard`, `equipment_details_guard`, `detail_text`, `detail_count`). |

Nenhum dado existente foi alterado: o único spot do banco já se chamava `LOA`; nenhuma ficha foi criada para os TAGs existentes (`L2-955` e `L2-956` aparecem com “Tipo não informado” até alguém preencher).

Conferido logo depois da aplicação:

- `gaxeta_ingest`, `gaxeta_ingest_v3`, `gaxeta_private.stabilize`, `gaxeta_history`, `gaxeta_save_asset` e `gaxeta_validate_asset` com o mesmo hash de antes.
- Leitura do sensor `ESP32-54CE2CDC5194` (Refinador, spot LOA de L2-955) às 11:30:36, oito segundos depois da aplicação; 30 leituras nos cinco minutos seguintes.
- Tabelas novas com RLS ligada e política de leitura; `anon` sem privilégio.
- Consultor de segurança do Supabase: nenhum aviso novo de outro tipo. `gaxeta_save_equipment` entra na lista das funções `SECURITY DEFINER` chamáveis por conta autenticada, como as demais RPCs de escrita (a autorização é feita dentro da função).

## Passada de aceite de 12/11 (build novo rodando sobre a origem do site, sessão de nível 1)

- Sensores: leitura avançou de 11:37:35 para 11:37:45 com a tela aberta.
- Ativos: corporação de teste com duas empresas, área, TAG direto na área com ficha, dois spots; edição da ficha e troca de nome de spot conferidas na tela e no banco.
- Usuários: prévia de corporação vazia com acesso amplo e de duas empresas (uma liberada, outra bloqueada). Nenhum convite foi enviado e nenhum usuário foi gravado.
- Telemetria: 5 min, 7 dias, 1 mês, clique rápido entre filtros, ampliação e volta.

## O que os testes deixaram no banco

A corporação “ZZ Teste Refinamento” e tudo abaixo dela foram criados e excluídos pela própria interface. Ficaram só 18 linhas na trilha de auditoria (criações, alterações e exclusões do teste). Contagens depois do teste: 9 ativos, 0 fichas, 3 usuários, 2 convites, 1 concessão — as mesmas de antes.

Da etapa anterior continuam: 22 linhas de auditoria e 1 convite revogado para um endereço fictício em `example.com`.

## Ingestão e placa

Nada foi enviado à placa. Firmware, rede, endpoints, tokens, cadência, deduplicação, estabilização e alertas não foram tocados.

## Função de envio de convites

`gaxeta-invite` implantada (versão 1), sem alteração nesta revisão. **Envio real de e-mail não testado.**

## Configuração pendente no painel do Supabase

1. **Auth → URL Configuration → Redirect URLs**: incluir `https://laboratoriochesterton.github.io/sensorgaxeta/acesso.html`.
2. **Auth → SMTP**: configurar remetente próprio. É a configuração que falta para o envio real de convites.
3. Cadastro público: **continua aberto**, como combinado, até convite e recuperação serem comprovados com e-mail real.
4. Opcional (aviso do consultor): ligar a proteção contra senhas vazadas em Auth.

## Limites conhecidos

- A tela não consegue ler os dados de contato de uma corporação já gravada (não há RPC de leitura). Proposta, não aplicada, em `supabase/propostas/`.
- Excluir uma corporação que tenha convites (mesmo revogados) falha por chave estrangeira, sem mensagem amigável.
- O filtro “Transmitindo / Sem atualização” de Sensores vale para a página carregada, não para o total.
- A prévia de acesso com conta real de corporação (entrar com a conta e ver só o ramo liberado) não foi refeita nesta revisão; a regra é a mesma da etapa anterior e está coberta pela suíte do banco.
- Suíte de banco rodou em PostgreSQL 16 local (247 verificações); em 17 houve a aplicação real e as checagens acima.
- Sem backup recuperável confirmado (plano gratuito).
- Limpeza de leituras: não executada.

## Reversão

Aplicar os arquivos de `supabase/rollback/` em ordem inversa (07 → 01) e remover as linhas correspondentes de `supabase_migrations.schema_migrations`. A reversão da 07 descarta as fichas técnicas; a da 02 descarta cadastros de usuários, concessões e convites. O frontend novo depende das sete; para voltar o site, basta restaurar os cinco arquivos do Pages do commit `eb76200`, que continuam compatíveis com o banco atual.
