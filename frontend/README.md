# Frontend — Gaxeta Gestão de Ativos

Fonte editável do site publicado no GitHub Pages e do bundle embarcado no app Android.

## De onde veio esta fonte

O repositório só tinha o pacote gerado (minificado). O código original não foi localizado. Esta fonte foi montada assim:

- **Bibliotecas** (`src/js/00-*`, `05-*`, `06-*`): trechos do pacote publicado, mantidos como estavam (supabase-js, núcleo do Capacitor, cliente Bluetooth LE, ícones Lucide). Não editar.
- **Código herdado** (`20-ble.js`, parte de `10-core.js`, `90-ble-ui.js`): lógica do pacote publicado com nomes legíveis restaurados por ferramenta. Regras de medição, faixas de condição, CSV e Bluetooth não mudaram.
- **Código novo**: casca e navegação, árvore sob demanda, sensores, ativos e ficha do TAG, telemetria (reescrita no refinamento de 12/11/2026, com as mesmas regras de cálculo e os mesmos limites de consulta), gateways, usuários, entrada/convite/recuperação, Manual dentro do aplicativo, estilos.

## Estrutura

```
frontend/
├── build.mjs            build sem dependências (Node 18+)
├── package.json
├── README.site.md       vira o README.md do pacote publicado
└── src/
    ├── index.html       acesso.html é gerado a partir dele
    ├── operacao.html    Manual
    ├── styles/          fonts.css + app.css → styles.css
    ├── static/          ícone, logo, fontes, módulos web-*.js do Capacitor
    └── js/              concatenados em ordem numérica → app.js
        ├── 00, 05, 06   bibliotecas (não editar)
        ├── 10-core      configuração, cliente Supabase, utilitários
        ├── 20-ble       Bluetooth local
        ├── 40-shell     estado, permissões, navegação, atualização periódica
        ├── 50-tree      árvore de ativos por ramo, busca
        ├── 60-sensors   lista paginada e painel lateral
        ├── 62-gland     ciclo de gaxeta: estado, registro na marca superior, confirmação da leitura, conferência, manutenção, painel na Telemetria
        ├── 65-assets    ficha do nível, TAG + ficha técnica, spots do TAG, Excluir equipamento, vínculo sensor–spot
        ├── 70-telemetry identidade, histórico por contexto, gráfico por condição, CSV
        ├── 75-gateways  cadastro e edição
        ├── 80-users     usuários, três escolhas de escopo, regra por ramo, convites, auditoria
        ├── 85-auth      entrada explícita, convite, recuperação
        ├── 88-manual    Manual dentro do aplicativo (lê operacao.html)
        ├── 90-ble-ui    diálogo de Bluetooth (só no aplicativo nativo)
        ├── 95-boot      inicialização
        └── 99-exports   exportações usadas pelos módulos web-*.js
```

Os arquivos de `src/js` formam **um único módulo**: compartilham o mesmo escopo. Use nomes com quatro letras ou mais em código novo, para não colidir com os nomes curtos das bibliotecas. Um nome duplicado só aparece como erro ao carregar a página (ou no build com `--minify`).

## Web × aplicativo Android

A plataforma é decidida pelo runtime, nunca pela largura da tela (`isNativeApp()` e `bleAvailable()` em `10-core.js`):

| | Web (qualquer largura, inclusive navegador de celular) | Aplicativo nativo (Capacitor) |
|---|---|---|
| Bluetooth | Não existe: a entrada do trilho e o diálogo são removidos do documento em `95-boot.js` | Entrada no trilho e “Encontrar sensor”; o diálogo só abre por toque e fecha ao trocar de tela; nenhuma busca começa sozinha |
| Estrutura de ativos | Criar, editar e excluir níveis, conforme o papel | Só navegação e escolha de destino (`allowedChildKinds` e `canEditAsset` devolvem vazio) |
| Vínculo sensor → spot | Sim, conforme o papel | Sim, conforme o papel |

O servidor valida papéis e escopos nos dois casos; a diferença acima é só de interface.

## Regras que valem igual no frontend e no servidor

- Próxima criação por nível: `KIND_CHILDREN` (`10-core.js`) e o gatilho `gaxeta_validate_asset()`. TAG só sob Área ou Subárea.
- Nome de spot: `SPOT_NAMES` (`10-core.js`) e o gatilho `gaxeta_asset_point_name` (migração 07).
- Tipos de equipamento: tabela `gaxeta_equipment_types`. A cópia em `equipCatalog` é o catálogo inicial e é substituída pela leitura do servidor ao entrar.
- Campos da ficha técnica: `EQUIP_GROUPS` (`10-core.js`) e a tabela `gaxeta_equipment_details`.

## Ciclo de gaxeta (migrações 08 a 11)

- Distância (mm), percentual (%) e avanço vêm do servidor: `gaxeta_gland_summary` (lista), `gaxeta_gland_status` (painel) e `gaxeta_gland_history` (gráfico e CSV). A tela não calcula: só aplica as faixas de `adjustmentInfo` e limita a exibição a 0–100 %, mantendo o aviso de fora da faixa.
- `cycleView()` em `10-core.js` decide o que mostrar por estado (`active`, `waiting`, `no_scale`, `no_end`, `out_of_range`, `unusable`, `maintenance`, `no_reference`, `unlinked`). Só um ciclo calibrado da regra 2 recebe faixa e recomendação. Ciclo da regra anterior aparece como **Estimativa nominal**, sem classificação. Sem referência, o número é rotulado como escala elétrica (diagnóstico).
- `voltageInfo()` devolve a tensão com a origem: **calibrada** (`last_voltage_mv`, firmware 4.3.0+) ou **estimada** (`last_voltage_v`). A tensão nunca aparece sem a origem.
- Registro: o diálogo exige marcar que o potenciômetro está na marca superior. Enquanto a marca da instalação não tem faixa elétrica, o painel mostra a leitura candidata e o botão **Confirmar leitura na marca superior** (`gaxeta_confirm_gland_anchor`).
- O registro usa `gaxeta_record_gland_event` com um identificador de solicitação gerado ao abrir o diálogo: reenviar depois de uma queda de rede não duplica. Conflito (`PT409`) relê o estado e pede nova confirmação.
- Se o banco ainda não tiver as funções (`PGRST202`), `state.glandMissing` liga e a tela volta à apresentação anterior, sem erro.
- **Cadastro × leitura** (migração 11): a caixa da marca superior é a declaração física do técnico e continua obrigatória. Desmarcada, nada é enviado, os valores ficam e o foco vai para a caixa. Marcada, o cadastro é gravado mesmo com a leitura no limite do ADC; a tela mostra o número e o horário do registro e **Medidas salvas · aguardando leitura apta**. Se a resposta se perder, `reconcileGlandRequest()` procura o registro pela mesma chave (`request_id`, devolvida por `gaxeta_gland_status` só ao autor) antes de oferecer outro envio. A tela só mostra como cadastrado o que o servidor devolveu.
- **Posição elétrica** (`electricInfo()`): leitura atual em % da escala do ADC. Bloco estável no teto aparece como 100 % com o rótulo **Limite do ADC**. `blockOf()` repete no navegador a regra de `gaxeta_private.gland_block` (teto estável, bloco misto, instável), para a tela funcionar igual com o banco na migração 10. Sem ciclo calculado, `cycleView()` mostra a posição elétrica como **% elétrico** e `glandMissingStep()` dá o passo que falta para a distância e para o percentual.
- **Bloco fixo em Detalhes** (`updateDrawerLive()`): posição elétrica, tensão com origem e condição, distância e ajuste do ciclo, horário, variação bruta desde o envio anterior (`rawDeltaText()`), cadência do firmware (`firmwareCadence()`, sufixos `-hibNNN` e `-contNN`) e medidas cadastradas. A Telemetria usa os mesmos dados (`state.devices` e `state.gland`), atualizados a cada ciclo de 5 s.
- **Série elétrica na Telemetria**: o gráfico principal mostra a leitura atual (média bruta por intervalo, `.chart-raw`) e a linha estabilizada de 5 p.p. (`.chart-electric`), sem as cores e os nomes das faixas de ajuste. A árvore (`treeSensorValue()`) mostra o ajuste do ciclo quando há ciclo calculado e, nos demais casos, a posição elétrica rotulada. Os CSV mantêm as colunas e ganham `escala_dos_percentuais`.
- **Confirmação da referência**: a leitura candidata traz idade, transporte e o limite para confirmar. Se o sensor já mostrou posição mais alta depois do registro, a confirmação exige a declaração do técnico (`p_ack_lower`); o parâmetro só é enviado nesse caso, para a chamada continuar válida no banco da migração 10.
- **Comissionamento em dois pontos** (`glandSteps()`, `commissionGland()`): topo aprovado, conferência no fim de ajuste (botão **Estou no fim de ajuste**), ponto intermediário e **Gravar no perfil da instalação** (`gaxeta_commission_gland`, níveis 1 e 2).
- Situação de transmissão: `connectionStatus()` usa a cadência observada (`interval_s` do resumo). Até 12 s vale a regra original de 25 s / 65 s.

## Manual

`src/operacao.html` é a fonte única. Aberto direto, é uma página comum. Dentro da plataforma, `88-manual.js` lê o mesmo arquivo e mostra o índice (`data-manual-nav`) e o conteúdo (`data-manual-content`) na rota `#manual`, sem sair da sessão; o botão Voltar devolve à tela de origem. Ao editar o Manual, mantenha esses dois atributos e os `id` das seções.

## Build

```bash
cd frontend
node build.mjs              # gera dist/ (legível) — foi este o build testado
node build.mjs --minify     # opcional; exige `npm i -D esbuild`. Não foi testado.
```

`dist/` contém exatamente o que o Pages serve. Copie o conteúdo de `dist/` para a raiz do repositório (não é preciso versionar `frontend/dist/`).

## Testar antes de publicar

```bash
npm run preview             # http://localhost:4173
```

Este preview local não foi usado nos testes: a validação foi feita no Chrome, rodando este mesmo build sobre a origem do Pages com a sessão existente. Os links de convite e recuperação apontam sempre para o endereço público (`CONFIG.publicBaseUrl` em `10-core.js`).

## Configuração

Tudo em `CONFIG`, no início de `src/js/10-core.js`: URL do projeto, chave publicável, endereço público, página de retorno, nome da função de convite, intervalo de atualização e tamanho de página. Nenhuma chave administrativa fica no frontend.

## App Android

O app é Capacitor e embarca este mesmo bundle (`dist/`, sem `README.md` e `config.js`). O projeto nativo não está no repositório. Há dois caminhos:

1. **Com o projeto nativo**: apontar `webDir` para o `dist/` gerado aqui (ou copiar `dist/` para a pasta web do projeto), `npx cap copy android` e gerar o APK assinado no Android Studio.
2. **Sem o projeto nativo**: trocar só o pacote web dentro de um APK anterior e assinar de novo com a **mesma chave do APK instalado** (script `build_apk.py`, entregue fora do repositório junto com o APK). Com chave diferente, o Android recusa a atualização por cima.

Conferir no aparelho: entrada com “Continuar”, barra inferior, árvore pelo botão e sem ações de criar/editar níveis, Bluetooth só por toque (trilho ou “Encontrar sensor” → “Buscar sensores”), vínculo sensor → spot, CSV pela folha de compartilhamento.

As versões das bibliotecas do Capacitor são as do pacote publicado, para casar com o nativo já instalado.
