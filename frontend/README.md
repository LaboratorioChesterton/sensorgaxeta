# Frontend — Gaxeta Gestão de Ativos

Fonte editável do site publicado no GitHub Pages e do bundle embarcado no app Android.

## De onde veio esta fonte

O repositório só tinha o pacote gerado (minificado). O código original não foi localizado. Esta fonte foi montada assim:

- **Bibliotecas** (`src/js/00-*`, `05-*`, `06-*`): trechos do pacote publicado, mantidos como estavam (supabase-js, núcleo do Capacitor, cliente Bluetooth LE, ícones Lucide). Não editar.
- **Código herdado** (`20-ble.js`, parte de `10-core.js`, `70-telemetria`, `90-ble-ui.js`): lógica do pacote publicado com nomes legíveis restaurados por ferramenta. Regras de medição, gráfico, zoom, CSV e Bluetooth não mudaram.
- **Código novo**: casca e navegação, árvore sob demanda, sensores, ativos, gateways, usuários, entrada/convite/recuperação, estilos, Manual.

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
        ├── 65-assets    inspetor, formulários, exclusão, vínculo sensor–spot
        ├── 70-telemetry histórico, gráfico, CSV
        ├── 75-gateways  cadastro e edição
        ├── 80-users     usuários, escopo por ramo, convites, auditoria
        ├── 85-auth      entrada explícita, convite, recuperação
        ├── 90-ble-ui    diálogo de Bluetooth
        ├── 95-boot      inicialização
        └── 99-exports   exportações usadas pelos módulos web-*.js
```

Os arquivos de `src/js` formam **um único módulo**: compartilham o mesmo escopo. Use nomes com quatro letras ou mais em código novo, para não colidir com os nomes curtos das bibliotecas. Um nome duplicado só aparece como erro ao carregar a página (ou no build com `--minify`).

## Build

```bash
cd frontend
node build.mjs              # gera dist/ (legível) — foi este o build testado
node build.mjs --minify     # opcional; exige `npm i -D esbuild`. Não foi testado.
```

`dist/` contém exatamente o que o Pages serve. Copie o conteúdo de `dist/` para a raiz do repositório.

## Testar antes de publicar

```bash
npm run preview             # http://localhost:4173
```

Este preview local não foi usado nos testes: a validação foi feita no Chrome, rodando este mesmo build sobre a origem do Pages com a sessão existente. Os links de convite e recuperação apontam sempre para o endereço público (`CONFIG.publicBaseUrl` em `10-core.js`).

## Configuração

Tudo em `CONFIG`, no início de `src/js/10-core.js`: URL do projeto, chave publicável, endereço público, página de retorno, nome da função de convite, intervalo de atualização e tamanho de página. Nenhuma chave administrativa fica no frontend.

## App Android

O app é Capacitor e embarca este mesmo bundle. O projeto nativo não estava disponível, então **nenhum APK foi gerado**. Para atualizar o app:

1. No projeto nativo, apontar `webDir` para o `dist/` gerado aqui (ou copiar `dist/` para a pasta web do projeto).
2. `npx cap copy android` e gerar o APK assinado no Android Studio.
3. Conferir no aparelho: entrada com "Continuar", barra inferior, árvore pelo botão, Bluetooth (busca, conexão, identificação), CSV pela folha de compartilhamento.

As versões das bibliotecas do Capacitor são as do pacote publicado, para casar com o nativo já instalado.
