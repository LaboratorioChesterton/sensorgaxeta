// =============================================================================
// Árvore de ativos: carregada por ramo (gaxeta_assets_children), com paginação
// e busca no servidor (gaxeta_assets_search). Nunca baixa a árvore inteira.
// =============================================================================
const tree = { kids: new Map(), open: new Set(), searchRun: 0 };
const kidsKey = (parentId) => parentId || "root";
function resetTree() {
  tree.kids.clear();
  tree.open.clear();
  tree.searchRun++;
  if ($id("treeSearch")) $id("treeSearch").value = "";
  if ($id("treeResults")) $id("treeResults").hidden = true;
}
async function loadKids(parentId, { more = false, force = false } = {}) {
  const key = kidsKey(parentId);
  const known = tree.kids.get(key);
  if (known && !more && !force) return known;
  const offset = more && known ? known.ids.length : 0;
  const result = await callRpc("gaxeta_assets_children", { p_parent_id: parentId || null, p_limit: 100, p_offset: offset });
  rememberAssets(result.items);
  const ids = result.items.map((asset) => asset.id);
  const entry = { ids: more && known ? [...known.ids, ...ids.filter((id) => !known.ids.includes(id))] : ids, total: result.total };
  tree.kids.set(key, entry);
  if (parentId && assetIndex.has(parentId)) assetIndex.get(parentId).has_children = entry.total > 0;
  return entry;
}
async function ensureTreeRoot() {
  await loadKids(null);
  renderTree();
  renderIcons();
}
// Próxima criação por nível selecionado (a mesma regra vale no gatilho do servidor):
//   raiz → Corporação · Corporação → Empresa · Empresa → Área · Área → TAG ou Subárea ·
//   Subárea → TAG · TAG → Spot · Spot → vínculo de sensor existente.
// A estrutura é administrada na web: no aplicativo nativo a árvore serve para navegar e
// escolher o destino, sem criar nem editar níveis (o vínculo sensor → spot continua lá).
function allowedChildKinds(asset) {
  if (isNativeApp()) return [];
  const kinds = asset ? KIND_CHILDREN[asset.kind] || [] : ["corporation"];
  const role = myRole();
  return kinds.filter((kind) => {
    if (kind === "corporation") return role === "adm1";
    if (role === "adm1" || role === "adm2") return true;
    return role === "corp" && state.ctx.can_write && kind !== "company" && asset.access === "full";
  });
}
function canEditAsset(asset) {
  if (isNativeApp()) return false;
  const role = myRole();
  if (role === "adm1") return true;
  if (role === "adm2") return asset.kind !== "corporation";
  return role === "corp" && state.ctx.can_write && ["area", "subarea", "equipment", "point"].includes(asset.kind) && asset.access === "full";
}
// Valor ao lado do sensor na árvore: a posição elétrica do potenciômetro (leitura atual, em %).
function treeSensorValue(sensor) {
  const view = deviceView(sensor);
  // Modo bancada: "L2-956 · 67,83 % · Médio ajuste", com a origem simulada identificada. Leitura
  // atrasada aparece como última leitura válida, com o horário, e não como atual.
  if (view.bench) {
    const face = benchFace(sensor, view);
    return (
      `<span class="tree-sep">·</span><strong class="tree-electric tree-bench${face.stale ? " is-stale" : ""}" title="Posição de bancada: ${esc(view.label)} · ${esc(view.note)}">${face.has ? esc(view.value) + " %" : "—"}</strong>` +
      (face.has && view.sim ? `<span class="tree-sep">·</span>` + benchSimChip(view.sim) : !face.has ? `<span class="tree-sep">·</span><small class="tree-state">${esc(view.label)}</small>` : "") +
      `<small class="tree-bench-tag" title="Série de bancada: demonstração em mesa, não é curso de campo">${face.stale ? "bancada · última válida " + esc(fmtClock(face.at)) : "bancada"}</small>`
    );
  }
  // Sensor magnético: a árvore diz a série (bancada, curso estimado) e a faixa, além do número.
  const tag = view.bench ? " · bancada" : view.estimated ? " · estimado" : "";
  const band = view.magnetic && !view.bench && view.computed && MAG_BAND[view.band] ? ` ${MAG_BAND[view.band].label}` : view.magnetic && view.value === "—" ? ` ${view.label}` : "";
  return `<strong class="tree-electric health-${esc(view.key)}" title="${esc(view.kicker || "Posição elétrica")}: ${esc(view.label)} · ${esc(view.note)}">${esc(view.value)}${esc(view.unit || "")}<small>${esc(band + tag)}</small></strong>`;
}
function treeBranch(parentId) {
  const entry = tree.kids.get(kidsKey(parentId));
  if (!entry) return "";
  let html = '<ul role="group">';
  for (const id of entry.ids) {
    const asset = assetIndex.get(id);
    if (!asset) continue;
    const open = tree.open.has(id);
    const selected = state.assetId === id;
    const label = assetLabel(asset);
    const sensor = asset.kind === "point" ? state.devices.find((device) => device.measurement_point_id === id) : null;
    const addKinds = allowedChildKinds(asset).map((kind) => KIND_LABEL[kind]).join(" ou ");
    html +=
      `<li role="treeitem" class="kind-${asset.kind}" aria-selected="${selected}"${asset.has_children ? ` aria-expanded="${open}"` : ""}>` +
      `<div class="tree-row${selected ? " selected" : ""}${asset.access === "path" ? " path-only" : ""}">` +
      // Expandir e selecionar são ações separadas: a seta abre o ramo, o nome seleciona.
      `<button class="tree-toggle" data-toggle="${id}" aria-label="${open ? "Recolher" : "Expandir"} ${esc(label)}"${asset.has_children ? "" : " disabled"}>${asset.has_children ? glyph(open ? "chevron-down" : "chevron-right") : ""}</button>` +
      `<button class="tree-node" data-asset="${id}" title="${esc(KIND_LABEL[asset.kind] + ": " + label)}">${kindIcon(asset.kind)}<span><small>${KIND_LABEL[asset.kind]}</small>${esc(label)}</span></button>` +
      (addKinds
        ? `<button class="tree-action" data-add-child="${id}" aria-label="Adicionar ${esc(addKinds)} em ${esc(label)}" title="Adicionar ${esc(addKinds)}">+</button>`
        : "") +
      "</div>" +
      (sensor
        ? `<button class="tree-sensor" data-tree-sensor="${esc(sensor.sensor_id)}">${icon("radio")}<span class="tree-sensor-name">${esc(deviceLabel(sensor))}</span> ${treeSensorValue(sensor)}</button>`
        : "") +
      (open ? treeBranch(id) : "") +
      "</li>";
  }
  if (entry.total > entry.ids.length)
    html += `<li><button class="tree-more" data-more="${parentId || ""}">Carregar mais (${entry.total - entry.ids.length} restantes)</button></li>`;
  return html + "</ul>";
}
// Telefone: caminho resumido do que está selecionado, ao lado do seletor "Árvore de ativos".
function renderTreePick() {
  const box = $id("treePickPath");
  if (!box) return;
  const asset = assetIndex.get(state.assetId);
  const names = asset ? assetPath(state.assetId, state.assets).map(assetLabel) : [];
  box.querySelector("small").textContent = asset ? KIND_LABEL[asset.kind] + " selecionado" : state.page === "assets" ? "Nenhum nível selecionado" : "Mostrando";
  box.querySelector("b").textContent = asset ? (names.length > 3 ? "… / " + names.slice(-3).join(" / ") : names.join(" / ") || assetLabel(asset)) : state.page === "assets" ? "Toque para escolher na árvore" : "Todos os ativos";
  box.title = names.join(" / ");
  $id("treeDone").textContent = asset ? `Ver ${KIND_LABEL[asset.kind]}: ${assetLabel(asset)}` : "Fechar a árvore";
}
function renderTree() {
  renderTreePick();
  const root = tree.kids.get("root");
  const box = $id("tree");
  if (!root) {
    box.innerHTML = '<div class="tree-empty">Carregando…</div>';
    return;
  }
  if (!root.ids.length) {
    box.innerHTML =
      myRole() === "adm1"
        ? '<div class="tree-empty"><strong>Nenhuma corporação cadastrada.</strong><p>Comece pela corporação; depois empresa, área, TAG e spot. A subárea é opcional.</p>' +
          (isNativeApp() ? "<p>A estrutura de ativos é criada na versão web.</p>" : '<button class="secondary compact" data-add-child="">Criar corporação</button>') +
          "</div>"
        : '<div class="tree-empty"><strong>Nenhum ativo disponível.</strong><p>Sua conta ainda não tem ramos concedidos, ou a estrutura não foi cadastrada.</p></div>';
    return;
  }
  box.innerHTML = treeBranch(null);
}
async function selectAsset(id) {
  state.assetId = id || "";
  renderTree();
  if (state.page === "sensors") {
    state.sensors.offset = 0;
    await loadSensors();
    setTreeDrawer(false);
  } else if (state.page === "assets") {
    const asset = assetIndex.get(state.assetId);
    if (isNarrow() && asset && !["equipment", "point"].includes(asset.kind)) {
      // Telefone, nível acima do TAG: a árvore continua aberta e o ramo se abre, para seguir descendo.
      if (asset.has_children && !tree.open.has(asset.id)) {
        tree.open.add(asset.id);
        await loadKids(asset.id).catch(() => {});
        renderTree();
      }
    } else if (isNarrow()) setTreeDrawer(false); // TAG ou spot: volta para a ficha, com o caminho resumido
    await renderInspector();
  }
  renderIcons();
}
// Abre os ancestrais de um ativo e o deixa visível na árvore.
async function revealAsset(id) {
  await ensureAssets([id]);
  const asset = assetIndex.get(id);
  if (!asset) return;
  await loadKids(null);
  for (const ancestorId of (asset.path || []).slice(0, -1)) {
    await loadKids(ancestorId);
    tree.open.add(ancestorId);
  }
  const entry = tree.kids.get(kidsKey(asset.parent_id));
  if (entry && !entry.ids.includes(id)) entry.ids.push(id);
}
// Árvore por cima do conteúdo (telefone). Ramos abertos, seleção e busca ficam como estavam.
function setTreeDrawer(open) {
  const was = document.body.classList.contains("tree-open");
  document.body.classList.toggle("tree-open", !!open);
  $id("treePickOpen")?.setAttribute("aria-expanded", String(!!open));
  if (open && !was && isNarrow()) pushBackLayer("tree", () => setTreeDrawer(false));
  if (!open && was) dropBackLayer("tree");
}

$id("tree").onclick = async (event) => {
  const pick = (name) => event.target.closest(`[data-${name}]`);
  try {
    if (pick("tree-sensor")) {
      openHistoryFor(pick("tree-sensor").dataset.treeSensor);
    } else if (pick("add-child")) {
      await openAssetForm({ parentId: pick("add-child").dataset.addChild || null });
    } else if (pick("more")) {
      await loadKids(pick("more").dataset.more || null, { more: true });
      renderTree();
      renderIcons();
    } else if (pick("toggle")) {
      const id = pick("toggle").dataset.toggle;
      if (tree.open.has(id)) tree.open.delete(id);
      else {
        tree.open.add(id);
        await loadKids(id);
      }
      renderTree();
      renderIcons();
      $id("tree").querySelector(`[data-toggle="${id}"]`)?.focus();
    } else if (pick("asset")) {
      await selectAsset(pick("asset").dataset.asset);
    }
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("clearAsset").onclick = () => selectAsset("").catch((error) => showMessage(errorText(error), "error"));
// Recolhe e reabre a árvore sem tocar em seleção, ramos abertos, busca ou filtro da lista.
$id("toggleTree").onclick = () => {
  if (isNarrow()) {
    const open = !document.body.classList.contains("tree-open");
    setTreeDrawer(open);
    $id("toggleTree").setAttribute("aria-expanded", String(open));
  } else {
    const collapsed = document.body.classList.toggle("tree-collapsed");
    $id("toggleTree").setAttribute("aria-expanded", String(!collapsed));
  }
};
$id("closeTree").onclick = () => setTreeDrawer(false);
$id("treeDone").onclick = () => setTreeDrawer(false);
$id("treePickOpen").onclick = $id("treePickPath").onclick = () => {
  setTreeDrawer(true);
  ensureTreeRoot().catch((error) => showMessage(errorText(error), "error"));
};

// Busca por nome ou TAG, no servidor, dentro do que a conta pode ver.
$id("treeSearch").oninput = debounce(async () => {
  const query = $id("treeSearch").value.trim();
  const box = $id("treeResults");
  const run = ++tree.searchRun;
  if (query.length < 2) {
    box.hidden = true;
    return;
  }
  try {
    const rows = await callRpc("gaxeta_assets_search", { p_query: query, p_limit: 30 });
    if (run !== tree.searchRun) return;
    box.hidden = false;
    box.innerHTML = rows.length
      ? rows
          .map(
            (row) =>
              `<button data-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(assetLabel(row))}</strong><span>${esc((row.path_names || []).slice(0, -1).join(" / "))}</span></button>`,
          )
          .join("")
      : '<p class="tree-empty">Nenhum ativo encontrado.</p>';
  } catch (error) {
    showMessage(errorText(error), "error");
  }
}, 300);
$id("treeResults").onclick = async (event) => {
  const button = event.target.closest("[data-result]");
  if (!button) return;
  try {
    await revealAsset(button.dataset.result);
    $id("treeResults").hidden = true;
    $id("treeSearch").value = "";
    await selectAsset(button.dataset.result);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
