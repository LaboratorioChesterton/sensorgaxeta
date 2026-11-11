# Como publicar — lista do que copiar

Este ZIP espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`. Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** |
| `app.js` | **Substituir** |
| `styles.css` | **Substituir** |
| `README.md` | **Substituir** (é o README do site, atualizado) |
| `acesso.html` | **Novo** — retorno de convite e recuperação |
| `operacao.html` | **Novo** — Manual (corrige o link que dava 404) |
| `config.js`, `icon.svg`, `chesterton-logo.jpg` | Iguais aos atuais |
| `web-8iTD2sZM.js`, `web-BfBGDy75.js`, `web-DEeSqGRi.js` | Iguais aos atuais |
| 12 arquivos `barlow-*.woff` / `.woff2` | Iguais aos atuais |

Nada precisa ser apagado.

## 2. Pastas novas

| Pasta | Conteúdo |
|---|---|
| `frontend/` | Fonte editável e build (`frontend/README.md`) |
| `supabase/` | Migrações aplicadas, reversões, baseline, função de convite, estado da produção |
| `dev/`, `tests/`, `limpeza/` | Ambiente local, testes do banco e ferramenta da limpeza (não executada) |

O Pages publica a raiz inteira, então essas pastas também ficam acessíveis por URL. Não há segredo nelas.

## 3. Depois do push

1. Abrir o site, tocar em **Continuar** e conferir Sensores e Telemetria de 5 minutos.
2. Abrir `…/sensorgaxeta/operacao.html` e `…/sensorgaxeta/acesso.html`.
3. No Supabase: incluir a Redirect URL de `acesso.html` e configurar o SMTP (detalhes em `supabase/ESTADO_PRODUCAO.md`).

## 4. Voltar atrás

Restaurar `index.html`, `app.js` e `styles.css` do commit anterior. O pacote antigo continua funcionando com o banco atual.

## Estado das migrações

As seis estão aplicadas em produção, com os números que aparecem nos nomes dos arquivos de `supabase/migrations/`. Não há nada a aplicar no banco para publicar este pacote.
