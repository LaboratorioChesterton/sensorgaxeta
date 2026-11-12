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
        ├── 65-assets    ficha do nível, TAG + ficha técnica, spots do TAG, exclusão, vínculo sensor–spot
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
