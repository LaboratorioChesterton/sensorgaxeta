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
        ├── 63-magnetic  sensor magnético AS5600: cartão, diagnóstico, Engaxetamento realizado, curso de ajuste restante
        ├── 65-assets    ficha do nível, TAG + ficha técnica, spots do TAG, Excluir equipamento, vínculo sensor–spot
        ├── 70-telemetry identidade, histórico por contexto, gráfico por condição, CSV
        ├── 72-telemetry-mag  telemetria magnética: curso restante e ângulo, CSV por referência
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

## Posição elétrica (migrações 12 e 13)

A plataforma mostra uma única medida de posição: a posição elétrica do potenciômetro, em %, e a tensão, em V. O fluxo de calibração mecânica (registrar engaxetamento, manutenção, confirmar marca, conferir medida, comissionamento, perfil, mm, avanço, ciclo) foi retirado e o módulo `62-gland.js` não existe mais.

- `electricInfo()` e `electricView()` (`10-core.js`): o número de todo cartão, da árvore, de Detalhes e da Telemetria é `last_percent` do sensor, a leitura atual em % da escala elétrica da placa. Bloco estável no teto aparece como 100 % com **Limite do ADC**.
- Condição do sinal (`BLOCK_QUALITY`): `electric` (leitura boa), `limit` (saturação do ADC), `warn` (bloco misto ou instável: cursor solto, entrada sem potenciômetro ou giro durante a leitura) e `unknown` (sem leitura). Não há classificação mecânica nem recomendação de intervenção. `blockOf()` repete no navegador a regra de `gaxeta_private.adc_block`.
- Escala do percentual (`scaleText()`): `last_percent_scale` nulo é o ADC bruto de 0 a 4095; `mv-140-2400` e `adc-180-3170` são limites fixos definidos no firmware da placa.
- Resumo por sensor: `loadTelemetrySummary()` (`40-shell.js`) chama `gaxeta_telemetry_summary` e guarda em `state.live`. Se o banco ainda não tiver a função (`PGRST202`), `state.liveMissing` liga e a tela segue só com os campos do sensor.
- Cadência (`deviceInterval()`): a medida nos últimos envios (`interval_s` do resumo) ou, sem ela, a declarada pelo firmware no sufixo da versão (`-cont30`, `-hib180`).
- Linha estabilizada: `stable_percent` vem do servidor (`gaxeta_private.stabilize`, 5 p.p.). O navegador não aplica outro filtro.
- CSV de intervalos: `posicao_eletrica_estabilizada_pct`, `_media_pct`, `_min_pct`, `_max_pct`, `tensao_v`, `origem_da_tensao`, `tensao_estimada_v`, `adc_bruto`, `leituras` e `escala_do_percentual`. Não há coluna em mm nem de ciclo.
- Cartões de sensor (`app.css`): a coluna interna é `minmax(0, 1fr)`, todo filho pode encolher e cabeçalho, situação e rodapé quebram de linha. O conteúdo não atravessa a borda de 320 px a 1470 px.
- Situação de transmissão: `connectionStatus()` usa a cadência de `deviceInterval()`. Até 12 s vale a regra original de 25 s / 65 s.

## Faixas simuladas da bancada (migração 16)

No Modo bancada, o percentual aparece com o nome e a cor de uma faixa **simulada**. Uma única função alimenta Sensores, Detalhes, Ativos, Telemetria e o quadro do Bluetooth.

- `benchShown(percent)` (`10-core.js`): confere nulo, texto vazio e tipo **antes** da conversão numérica, exige 0 a 100 e arredonda para as duas casas exibidas. Zero é valor válido.
- `benchSimOf(percent)`: aplica a regra de `magBandOf` ao valor arredondado e devolve a entrada de `BENCH_SIM`.

| Faixa | Valor exibido | Cor |
|---|---|---|
| Sem ajuste | 0,00 a 29,99 % | vermelho |
| Baixo ajuste | 30,00 a 49,99 % | laranja |
| Médio ajuste | 50,00 a 72,99 % | amarelo, com texto escuro |
| Alto ajuste | 73,00 a 100,00 % | verde |

- Cores só da simulação: classes `health-sim-*` (`app.css`). O lilás continua identificando o Modo bancada e o ponto de transmissão é independente.
- Preferência por sensor: `benchBandsOn(sensorId, mag)` usa `bench_bands` do resumo (`gaxeta_mag_summary`). Grava com `gaxeta_mag_bench_set_bands`; sem a migração 16, guarda só no aparelho (`localStorage`). Desligada, a bancada volta à apresentação neutra.
- Gráfico (`benchChartSvg`, `72-telemetry-mag.js`): cada trecho é cortado em 30, 50 e 73 % e pintado pela própria altura. O corte é só gráfico; dica, tabela e CSV mostram os valores recebidos. A linha é interrompida em leitura inválida, lacuna de tempo e troca de configuração.
- Conferir as fronteiras sem navegador: `node tests/ui/faixas_fronteiras.mjs`.

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

Conferir no aparelho: entrada com “Continuar”, barra inferior, árvore pelo botão e sem ações de criar/editar níveis, Bluetooth só por toque (botão **Buscar sensor por Bluetooth** em Sensores, ou **Bluetooth** na barra inferior → “Buscar sensores”), botão Voltar fechando a camada aberta, vínculo sensor → spot, CSV pela folha de compartilhamento.

As versões das bibliotecas do Capacitor são as do pacote publicado, para casar com o nativo já instalado.
