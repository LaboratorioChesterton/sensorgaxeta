# Como publicar — sensor magnético AS5600 e curso de ajuste restante (21/11/2026)

Este pacote espelha a raiz do repositório `LaboratorioChesterton/sensorgaxeta`, a partir do commit publicado hoje (`acef2d6`, entrega de 19/11; `app.js` com MD5 `0eb71544…4190`, igual ao do site). Extraia sobre a cópia local do repositório, confira com `git status` e faça o commit.

## Ordem

1. **Banco, migração 14** (`20261121154407_as5600_contrato_magnetico`): **já aplicada** em 21/11/2026 às 12:44. O site publicado continua funcionando com ela.
2. **Placa piloto C3** (`ESP32-4070298DBD44`): **já gravada** com o firmware 4.4.0 e enviando leitura magnética desde 13:11.
3. **Site**: o seu commit e o push (item 3 abaixo). Até lá, o site publicado mostra a placa magnética como **Sem leitura** na posição elétrica, sem zero falso e sem erro. O ângulo, a saúde do sensor e o botão **Engaxetamento realizado** só aparecem depois do push.
4. **APK**: não foi remontado nesta entrega. O aplicativo instalado continua valendo para as placas de potenciômetro; para ele mostrar o sensor magnético, o pacote precisa ser remontado a partir de `frontend/dist` e assinado com a sua chave.
5. **Banco, migração 13** (`20261119142500_desativa_calibracao_mecanica`): continua **não aplicada**, pela mesma condição de 19/11 (site e APK daquela entrega em uso). A migração 14 não depende dela.

## 1. Arquivos servidos pelo Pages (raiz do repositório)

| Arquivo | Ação |
|---|---|
| `index.html` | **Substituir** (rótulos da Telemetria passam a ter identificador; seletor de série) |
| `app.js` | **Substituir** (de 395 KB para 446 KB: entram os módulos do sensor magnético) |
| `styles.css` | **Substituir** |
| `operacao.html` | **Substituir** (Manual: seção Sensor magnético e curso restante) |
| `acesso.html` | **Substituir** (gerado a partir do `index.html`) |
| `COMO_PUBLICAR.md` | **Substituir** (este arquivo) |
| Demais arquivos da raiz (`README.md`, `config.js`, ícone, logo, `web-*.js`, fontes) | Iguais aos atuais |

## 2. Fonte, banco e testes

| Arquivo | Ação |
|---|---|
| `frontend/src/js/63-magnetic.js` | **Novo** (cartão, diagnóstico, Engaxetamento realizado, curso de ajuste restante) |
| `frontend/src/js/72-telemetry-mag.js` | **Novo** (telemetria magnética, CSV por referência) |
| `frontend/src/js/62-gland.js` | **Apagar** (ainda estava no repositório; o build não o usa desde 19/11) |
| `frontend/src/js/10-core.js` | Substituir (`isMagnetic`, `magView`, motivos de indisponibilidade, formatação de graus e mm) |
| `frontend/src/js/40-shell.js` | Substituir (estado magnético, `gaxeta_mag_summary`) |
| `frontend/src/js/50-tree.js`, `65-assets.js` | Substituir (unidade conforme a modalidade) |
| `frontend/src/js/60-sensors.js` | Substituir (cartão e Detalhes por modalidade) |
| `frontend/src/js/70-telemetry.js` | Substituir (escolha da série e da consulta por modalidade) |
| `frontend/src/js/90-ble-ui.js` | Substituir (pacote Bluetooth magnético) |
| `frontend/src/index.html`, `frontend/src/operacao.html`, `frontend/src/styles/app.css` | Substituir |
| `frontend/README.md` | Substituir |
| `supabase/migrations/20261121154407_as5600_contrato_magnetico.sql` | **Novo** (já aplicada) |
| `supabase/rollback/20261121154407_as5600_contrato_magnetico.down.sql` | **Novo** (recusa reverter se houver leitura magnética gravada) |
| `supabase/propostas/indice_duplicado_leituras.sql` | **Novo** (proposta, não aplicada) |
| `supabase/ESTADO_PRODUCAO.md` | Substituir |
| `tests/84_contrato_magnetico.sql` | **Novo** (168 verificações) |
| `tests/85_concorrencia_magnetica.sh` | **Novo** (6 verificações com sessões paralelas) |
| `tests/86_capacidade_15_dias.sh` | **Novo** (carga de 15 dias em cópia isolada) |
| `dev/run_all.sh` | Substituir (migração 14 e suítes 84 e 85) |

Nenhum arquivo traz chave, token, hash de ingestão, senha, PIN ou e-mail real. O firmware, o binário gravado e as evidências ficam fora do repositório, na pasta da entrega; o binário e o backup, em pasta privada.

## 3. Commit

```bash
cd <sua cópia do repositório, no commit acef2d6>
unzip -o "<pasta da entrega>/repositorio/SensorGaxeta_as5600_commit.zip"
git rm -q --cached frontend/src/js/62-gland.js 2>/dev/null; rm -f frontend/src/js/62-gland.js   # o ZIP não apaga arquivo
git status
git add -A && git commit -F "<pasta da entrega>/MENSAGEM_DO_COMMIT.txt" && git push
```

ou, a partir de um clone no commit publicado: `git am "<pasta da entrega>/repositorio/as5600-piloto-2026-11-21.patch" && git push` (o patch já apaga o `62-gland.js`).

Conferir o build e os testes:

```bash
cd frontend && node build.mjs && for f in index.html acesso.html app.js styles.css operacao.html; do cmp dist/$f ../$f; done
PGHOST=/tmp PGPORT=54329 PGUSER=postgres dev/run_all.sh        # 812 verificações + reversão
PGHOST=/tmp PGPORT=54329 PGUSER=postgres tests/86_capacidade_15_dias.sh 10
```

## 4. Depois do push

1. Abrir o site, tocar em **Continuar** e recarregar sem cache (Cmd+Shift+R).
2. **Sensores**: a placa `ESP32-4070298DBD44` aparece em **Sem vínculo · fila de associação** com **Ângulo do sensor** em graus, campo magnético e barramento. Nenhum quadro de tensão ou posição elétrica nela. As placas de potenciômetro continuam como antes.
3. **Detalhes** da placa magnética: ângulo medido, campo, barramento, AGC e magnitude, último ângulo válido. Sem vínculo e sem geometria, o curso de ajuste restante aparece indisponível com o motivo.
4. **Telemetria** da placa magnética: gráfico do ângulo absoluto; o seletor de série mostra **Curso restante (%)** só quando houver engaxetamento registrado.
5. **Manual**: seção **Sensor magnético e curso de ajuste restante**.

## 5. Para o curso de ajuste restante aparecer

Depende de três passos que não são de software:

1. **Vincular** a placa a um spot (Sensores → Editar).
2. **Caracterizar a geometria** da montagem em bancada e cadastrá-la (`gaxeta_mag_save_geometry`, `gaxeta_mag_set_geometry_status`, `gaxeta_mag_set_point_setup`; só ADM 1 ou 2). O ensaio de 21/11 mostrou giro de 2,55° em 10 mm, não linear e com repetibilidade de 4 contagens: a montagem atual precisa de mais giro por milímetro antes de ser caracterizada. Detalhe em `evidencias/BANCADA_AS5600.md`, na pasta da entrega.
3. No campo, medir o curso disponível e tocar em **Engaxetamento realizado**.

## 6. Reversão

- **Placa**: gravar de volta o firmware 4.3.2 pelo backup privado (`PRIVADO_BACKUP_2026-11-21_POTENCIOMETRO_4.3.2/LEIA_RESTAURAR.md`) e religar o potenciômetro. A rota antiga recomeça o filtro elétrico sem movimento falso e encerra a referência magnética.
- **Banco**: `supabase/rollback/20261121154407_as5600_contrato_magnetico.down.sql`. Ele se recusa a rodar enquanto existirem leituras magnéticas gravadas, para não apagar histórico; nesse caso, mantenha a migração e reverta só a placa.
