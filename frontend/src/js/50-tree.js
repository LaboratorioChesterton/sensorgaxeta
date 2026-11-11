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
function allowedChildKinds(asset) {
  const kinds = asset ? KIND_CHILDREN[asset.kind] || [] : ["corporation"];
  const role = myRole();
  return kinds.filter((kind) => {
    if (kind === "corporation") return role === "adm1";
    // Corporações e empresas são criadas no desktop (o servidor valida de qualquer forma).
    if (kind === "company" && (isNarrow() || isNativeApp())) return false;
    if (role === "adm1" || role === "adm2") return true;
    return role === "corp" && state.ctx.can_write && kind !== "company" && asset.access === "full";
  });
}
function canEditAsset(asset) {
  const role = myRole();
  if (role === "adm1") return true;
  if (role === "adm2") return asset.kind !== "corporation";
  return role === "corp" && state.ctx.can_write && ["area", "subarea", "equipment", "point"].includes(asset.kind) && asset.access === "full";
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
    const label = asset.tag ? `${asset.name} · ${asset.tag}` : asset.name;
    const sensor = asset.kind === "point" ? state.devices.find((device) => device.measurement_point_id === id) : null;
    html +=
      `<li role="treeitem" aria-selected="${selected}"${asset.has_children ? ` aria-expanded="${open}"` : ""}>` +
      `<div class="tree-row${selected ? " selected" : ""}${asset.access === "path" ? " path-only" : ""}">` +
      `<button class="tree-toggle" data-toggle="${id}" aria-label="${open ? "Recolher" : "Expandir"} ${esc(asset.name)}"${asset.has_children ? "" : " disabled"}>${asset.has_children ? (open ? "▾" : "▸") : ""}</button>` +
      `<button class="tree-node" data-asset="${id}" title="${esc(KIND_LABEL[asset.kind] + ": " + label)}">${icon(KIND_ICON[asset.kind])}<span><small>${KIND_LABEL[asset.kind]}</small>${esc(label)}</span></button>` +
      (allowedChildKinds(asset).length
        ? `<button class="tree-action" data-add-child="${id}" aria-label="Adicionar abaixo de ${esc(asset.name)}" title="Adicionar abaixo">+</button>`
        : "") +
      "</div>" +
      (sensor
        ? `<button class="tree-sensor" data-tree-sensor="${esc(sensor.sensor_id)}">${icon("radio")}${esc(deviceLabel(sensor))} <strong>${fmtNum(sensor.stable_percent)}%</strong></button>`
        : "") +
      (open ? treeBranch(id) : "") +
      "</li>";
  }
  if (entry.total > entry.ids.length)
    html += `<li><button class="tree-more" data-more="${parentId || ""}">Carregar mais (${entry.total - entry.ids.length} restantes)</button></li>`;
  return html + "</ul>";
}
function renderTree() {
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
          (isNarrow() || isNativeApp() ? "<p>A criação de corporações é feita no computador.</p>" : '<button class="secondary compact" data-add-child="">Criar corporação</button>') +
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
    await renderInspector();
    if (isNarrow()) setTreeDrawer(false);
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
function setTreeDrawer(open) {
  document.body.classList.toggle("tree-open", !!open);
}

$id("tree").onclick = async (event) => {
  const pick = (name) => event.target.closest(`[data-${name}]`);
  try {
    if (pick("tree-sensor")) {
      state.sensorId = pick("tree-sensor").dataset.treeSensor;
      showPage("telemetry");
    } else if (pick("add-child")) {
      openAssetForm({ parentId: pick("add-child").dataset.addChild || null });
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
$id("toggleTree").onclick = () => {
  if (isNarrow()) setTreeDrawer(!document.body.classList.contains("tree-open"));
  else {
    const collapsed = document.body.classList.toggle("tree-collapsed");
    $id("toggleTree").setAttribute("aria-expanded", String(!collapsed));
  }
};
$id("closeTree").onclick = () => setTreeDrawer(false);

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
              `<button data-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(row.tag ? row.name + " · " + row.tag : row.name)}</strong><span>${esc((row.path_names || []).slice(0, -1).join(" / "))}</span></button>`,
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
