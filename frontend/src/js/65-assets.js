// =============================================================================
// Ativos: ficha do nível selecionado, formulários persistentes (RPCs com
// autorização no servidor), exclusão com dependências e vínculo sensor–spot.
//   * TAG: um campo obrigatório (o identificador do equipamento), tipo de
//     equipamento e ficha técnica gravados numa operação (gaxeta_save_equipment).
//   * Ao selecionar um TAG: TAG · tipo, contagem e lista de spots com sensor,
//     condição e transmissão, lidos do banco numa chamada (gaxeta_equipment_overview).
//   * Spot: nome por seleção (LOA, LA, UNICO); posição de montagem em texto livre.
// =============================================================================
const HIERARCHY_GUIDE =
  '<ol class="hierarchy-guide"><li>Corporação</li><li>Empresa</li><li>Área</li><li>Subárea <em>(opcional)</em></li><li>TAG (equipamento)</li><li>Spot → sensor</li></ol>' +
  '<div class="table-wrap rule-table"><table><thead><tr><th>Nível selecionado</th><th>Próxima criação</th></tr></thead><tbody>' +
  "<tr><td>Corporação</td><td>Empresa</td></tr><tr><td>Empresa</td><td>Área</td></tr><tr><td>Área</td><td>TAG ou Subárea</td></tr>" +
  "<tr><td>Subárea</td><td>TAG</td></tr><tr><td>TAG</td><td>Spot</td></tr><tr><td>Spot</td><td>Vínculo de um sensor existente</td></tr></tbody></table></div>" +
  "<p>A área é obrigatória e a subárea é opcional: o TAG fica direto na área ou dentro de uma subárea, nunca sob a empresa. O gateway é cadastrado na empresa, pela tela Gateways.</p>";

// A ficha e o resumo do TAG dependem da migração 07. Sem ela, a tela diz o que falta em vez de falhar calada.
const isMissingFeature = (error) => error?.code === "PGRST202" || error?.code === "42883" || error?.code === "PGRST205" || error?.code === "42P01";
const MISSING_FEATURE_TEXT = "Esta função depende da atualização do banco desta revisão (migração 07), que ainda não foi aplicada.";

// "Corporação gravada", "TAG gravado": concordância com o nível.
const kindDone = (kind, verb) => verb + (["corporation", "company", "area", "subarea"].includes(kind) ? "a" : "o");
const canLinkAt = (access) => isAdminWriter() || (myRole() === "corp" && state.ctx.can_write && access === "full");
const healthBadge = (percent) => {
  const health = adjustmentInfo(percent);
  return `<span class="adjustment-badge health-${health.key}">${health.label}</span>`;
};
const connBadge = (device) => {
  const status = deviceStatus(device);
  return `<span class="conn"><i class="dot ${status.className}"></i>${status.label}</span>`;
};

function inspectorActions(asset, childKinds) {
  return (
    `<div class="inspector-actions">` +
    childKinds.map((kind) => `<button class="primary compact" data-act="add" data-kind="${kind}">${icon("plus")}${KIND_LABEL[kind]}</button>`).join("") +
    (canEditAsset(asset) ? `<button class="secondary compact" data-act="edit">Editar</button>` : "") +
    (asset.kind === "company" ? `<button class="secondary compact" data-act="gateways">Gateways da empresa</button>` : "") +
    (hasCap("delete_records") && !isNativeApp() ? `<button class="text-button danger-text" data-act="delete">Excluir…</button>` : "") +
    `</div>`
  );
}
// Caminho até o nível acima, em uma linha discreta (o nome do próprio nível já é o título).
function parentPathLine(asset) {
  const parents = assetPath(asset.parent_id, state.assets).map(assetLabel);
  return parents.length ? `<p class="inspector-path" title="${esc(parents.join(" / "))}">${esc(parents.join(" / "))}</p>` : "";
}

function equipmentInspector(asset, overview, problem) {
  const details = overview?.details || null;
  const type = equipCatalog.get(details?.equipment_type) || details?.equipment_type_label || "";
  const access = overview?.asset?.access || asset.access;
  const spots = overview?.spots || [];
  const tag = equipTag(asset);
  const linkable = canLinkAt(access);
  const spotRows = spots
    .map((spot) => {
      const sensor = spot.sensor;
      return (
        `<li class="spot-row${sensor ? "" : " empty"}">` +
        `<button class="spot-name" data-act="open-spot" data-spot="${spot.id}" title="Abrir o spot na árvore">${icon("map-pin")}<b>${esc(spot.name)}</b>${spot.standard_name ? "" : '<em class="legacy-flag" title="Nome anterior à padronização (LOA, LA, UNICO)">nome anterior</em>'}</button>` +
        `<span class="spot-position">${esc(spot.position || "Posição não informada")}</span>` +
        (sensor
          ? `<span class="spot-sensor"><b>${esc(deviceLabel(sensor))}</b><span class="spot-reading">${fmtNum(sensor.stable_percent)} %</span>${healthBadge(sensor.stable_percent)}${connBadge(sensor)}</span>` +
            `<span class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></span>`
          : `<span class="spot-sensor none">Sem sensor vinculado</span>` +
            `<span class="row-actions">${linkable ? `<button class="primary compact" data-act="spot-link" data-spot="${spot.id}">Vincular sensor</button>` : ""}</span>`) +
        `</li>`
      );
    })
    .join("");
  const sheet = EQUIP_GROUPS.map(
    (group) =>
      `<section><h4>${group.title}</h4><dl class="detail-fields">` +
      group.fields.map(([key, label]) => `<dt>${esc(label)}</dt><dd${details?.[key] == null ? ' class="absent"' : ""}>${details?.[key] == null ? "—" : esc(details[key])}</dd>`).join("") +
      `</dl></section>`,
  ).join("");
  const childKinds = allowedChildKinds({ ...asset, access });
  return (
    `<div class="inspector-card equip-card">` +
    `<header class="inspector-head"><div class="inspector-title"><span class="kind-chip">TAG</span>` +
    `<h2>${esc(tag)} <span class="equip-type${type ? "" : " unknown"}">· ${esc(type || TYPE_UNKNOWN)}</span></h2>${parentPathLine(asset)}</div>` +
    (overview ? `<div class="inspector-counts"><span><b>${overview.spot_count}</b> ${overview.spot_count === 1 ? "spot" : "spots"}</span><span><b>${overview.sensor_count}</b> ${overview.sensor_count === 1 ? "sensor vinculado" : "sensores vinculados"}</span></div>` : "") +
    `</header>` +
    (asset.tag && asset.name !== asset.tag ? `<p class="form-help">Nome cadastrado anteriormente: <b>${esc(asset.name)}</b>.</p>` : "") +
    (access === "path" ? '<p class="path-note">Este TAG aparece só como caminho até os spots concedidos à sua conta. A ficha técnica e os demais spots não fazem parte do seu acesso.</p>' : "") +
    (problem ? `<p class="path-note">${esc(problem)}</p>` : "") +
    inspectorActions(asset, childKinds) +
    (overview
      ? `<section class="spot-section"><h3>Spots</h3>` +
        (spotRows
          ? `<ul class="spot-list">${spotRows}</ul>`
          : `<p class="form-help">Nenhum spot neste TAG.${childKinds.includes("point") ? " Use <b>+ Spot</b> para criar o primeiro." : ""}</p>`) +
        `</section>`
      : "") +
    (access === "path" || !overview ? "" : `<section class="equip-sheet"><h3>Ficha técnica</h3><div class="sheet-groups">${sheet}</div></section>`) +
    `</div>`
  );
}

async function renderInspector() {
  const box = $id("assetInspector");
  const assetId = state.assetId;
  const asset = assetIndex.get(assetId);
  if (!asset) {
    box.innerHTML = `<div class="inspector-card"><h2>Estrutura de ativos</h2><p>Selecione um nível na árvore para ver os dados${isNativeApp() ? "" : ", editar ou criar o próximo nível"}.</p>${HIERARCHY_GUIDE}</div>`;
    return;
  }
  await ensureAssets([assetId]);
  let sensor = null;
  let overview = null;
  let problem = "";
  if (asset.kind === "point") {
    sensor = (await unwrap(sb.from("gaxeta_devices").select("*").eq("measurement_point_id", assetId).limit(1)))[0] || null;
    if (sensor) mergeDevices([sensor]);
  } else if (asset.kind === "equipment") {
    // Spots, sensores e ficha vêm do banco numa chamada: a contagem não depende do que a grade já carregou.
    const startedAt = Date.now();
    try {
      overview = await callRpc("gaxeta_equipment_overview", { p_id: assetId });
      setServerTime(overview.server_time, startedAt);
      mergeDevices(overview.spots.map((spot) => spot.sensor).filter(Boolean));
      rememberAssets(overview.spots.map((spot) => ({ id: spot.id, parent_id: assetId, kind: "point", name: spot.name, position: spot.position })));
      equipTypeIndex.set(assetId, overview.details?.equipment_type || null);
    } catch (error) {
      problem = isMissingFeature(error) ? MISSING_FEATURE_TEXT : "Não foi possível carregar spots e ficha deste TAG: " + errorText(error);
    }
  }
  if (state.assetId !== assetId || state.page !== "assets") return;
  if (asset.kind === "equipment") {
    box.innerHTML = equipmentInspector(asset, overview, problem);
    renderTree();
    renderIcons();
    return;
  }
  const childKinds = allowedChildKinds(asset);
  const sensorBlock =
    asset.kind !== "point"
      ? ""
      : sensor
        ? `<div class="inspector-sensor"><div><small>Sensor vinculado</small><strong>${esc(deviceLabel(sensor))}</strong><span>${fmtNum(sensor.stable_percent)} % ${healthBadge(sensor.stable_percent)} ${connBadge(sensor)}</span></div>` +
          `<div class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></div></div>`
        : `<div class="inspector-sensor empty"><div><small>Sensor</small><strong>Aguardando instalação</strong><span>Nenhum sensor vinculado a este spot.</span></div>` +
          (canLinkAt(asset.access) ? `<div class="row-actions"><button class="primary compact" data-act="link">Vincular sensor</button></div>` : "") +
          `</div>`;
  const fields = [];
  if (asset.kind === "point") {
    const equip = assetIndex.get(asset.parent_id);
    if (equip) fields.push(["TAG", `${equipTag(equip)} · ${equipTypeLabel(equip.id) || TYPE_UNKNOWN}`]);
    fields.push(["Posição de montagem", asset.position || "Não informada"]);
  } else if (asset.tag && asset.tag !== asset.name) fields.push(["Código", asset.tag]);
  box.innerHTML =
    `<div class="inspector-card"><header class="inspector-head"><div class="inspector-title"><span class="kind-chip">${KIND_LABEL[asset.kind]}</span><h2>${esc(asset.name)}</h2>${parentPathLine(asset)}</div></header>` +
    (asset.kind === "point" && !spotCanonical(asset.name)
      ? '<p class="form-help">Nome anterior à padronização. Ele é mantido como está; ao trocar o nome, as opções são LOA, LA ou UNICO.</p>'
      : "") +
    (asset.access === "path" ? '<p class="path-note">Este nível aparece só como caminho de navegação até os ramos concedidos à sua conta.</p>' : "") +
    (fields.length ? `<dl class="detail-fields">${fields.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("")}</dl>` : "") +
    sensorBlock +
    inspectorActions(asset, childKinds) +
    (childKinds.length ? `<p class="form-help">Próxima criação: ${childKinds.map((kind) => KIND_LABEL[kind]).join(" ou ")}.</p>` : "") +
    `</div>`;
  renderIcons();
}
$id("assetInspector").onclick = async (event) => {
  const button = event.target.closest("[data-act]");
  if (!button) return;
  const act = button.dataset.act;
  const asset = assetIndex.get(state.assetId);
  const fail = (error) => showMessage(errorText(error), "error");
  if (act === "sensor-detail") return openDrawer(button.dataset.sensor, "detail", button);
  if (act === "sensor-history") return openHistoryFor(button.dataset.sensor);
  if (act === "spot-link") return openLinkDialog(button.dataset.spot);
  if (act === "open-spot") {
    tree.open.add(state.assetId);
    return loadKids(state.assetId)
      .then(() => selectAsset(button.dataset.spot))
      .catch(fail);
  }
  if (!asset) return;
  if (act === "add") return openAssetForm({ parentId: asset.id, kind: button.dataset.kind }).catch(fail);
  if (act === "edit") return withBusy(button, () => openAssetForm({ editId: asset.id }));
  if (act === "link") return openLinkDialog(asset.id);
  if (act === "gateways") return showPage("gateways");
  if (act === "delete") return withBusy(button, () => deleteAsset(asset));
};

// ----- Formulário de ativo -----
const assetFormState = { editId: null, parentId: null, hadType: false };
function buildEquipFields() {
  if ($id("equipGroups").childElementCount) return;
  $id("equipGroups").innerHTML = EQUIP_GROUPS.map(
    (group) =>
      `<fieldset class="equip-group"><legend>${group.title}</legend>` +
      group.fields
        .map(([key, label, format]) =>
          format === "long"
            ? `<label class="span-all">${label}<textarea id="eq-${key}" rows="2" maxlength="1000"></textarea></label>`
            : `<label>${label}<input id="eq-${key}" maxlength="${format === "count" ? 4 : 60}"${format === "count" ? ' inputmode="numeric" placeholder="Número inteiro"' : ""} autocomplete="off"></label>`,
        )
        .join("") +
      `</fieldset>`,
  ).join("");
  // Fabricante, modelo, fluido, tipo e modelo de gaxeta aceitam textos mais longos.
  for (const key of ["fluid", "manufacturer", "model", "packing_type", "packing_model"]) $id("eq-" + key).maxLength = 120;
}
async function openAssetForm({ parentId = null, kind = null, editId = null }) {
  const editing = editId ? assetIndex.get(editId) : null;
  const parent = editing ? assetIndex.get(editing.parent_id) : assetIndex.get(parentId);
  const kinds = editing ? [editing.kind] : allowedChildKinds(parent || null);
  if (!kinds.length || (editing && !canEditAsset(editing))) return showMessage("Sua conta não pode criar ou editar níveis aqui.", "error");
  buildEquipFields();
  // Edição de TAG: a ficha gravada vem do servidor antes de abrir o formulário.
  let details = null;
  if (editing?.kind === "equipment") {
    try {
      details = (await callRpc("gaxeta_equipment_overview", { p_id: editing.id })).details;
    } catch (error) {
      return showMessage(isMissingFeature(error) ? MISSING_FEATURE_TEXT : errorText(error), "error");
    }
  }
  Object.assign(assetFormState, { editId: editing?.id || null, parentId: editing ? editing.parent_id : parentId, hadType: !!details?.equipment_type });
  fillSelect($id("assetKind"), kinds.map((value) => ({ value, label: KIND_LABEL[value] })), null, kind && kinds.includes(kind) ? kind : kinds[0]);
  $id("assetKindRow").hidden = kinds.length < 2;
  $id("assetContext").textContent = parent ? "Dentro de: " + assetPathLabel(parent.id) : "Raiz da estrutura";
  $id("assetName").value = editing?.name || "";
  $id("assetTag").value = editing ? (editing.kind === "equipment" ? equipTag(editing) : editing.tag || "") : "";
  $id("assetPosition").value = editing?.position || "";
  // Spot: uma das três opções. Um nome anterior fora do padrão aparece como está e só muda se trocado.
  const legacySpot = editing?.kind === "point" && !spotCanonical(editing.name) ? editing.name : "";
  fillSelect(
    $id("assetSpotName"),
    [...(legacySpot ? [{ value: legacySpot, label: `${legacySpot} (nome anterior, manter)` }] : []), ...SPOT_NAMES.map((value) => ({ value, label: value }))],
    editing ? null : "Selecione: LOA, LA ou UNICO",
    editing?.kind === "point" ? legacySpot || spotCanonical(editing.name) : "",
  );
  fillSelect($id("equipType"), [...equipCatalog].map(([value, label]) => ({ value, label })), details?.equipment_type ? null : editing ? TYPE_UNKNOWN : "Selecione o tipo", details?.equipment_type || "");
  for (const group of EQUIP_GROUPS) for (const [key] of group.fields) $id("eq-" + key).value = details?.[key] ?? "";
  $id("assetLegacyName").hidden = !(editing?.kind === "equipment" && editing.tag && editing.name !== editing.tag);
  $id("assetLegacyName").textContent = editing ? `Nome cadastrado anteriormente (mantido): ${editing.name}` : "";
  for (const id of ["corpEmail", "corpResponsible", "corpPhone"]) $id(id).value = "";
  $id("assetFormMessage").textContent = "";
  syncAssetForm();
  $id("assetDialog").showModal();
  ($id("assetKindRow").hidden ? [$id("assetTag"), $id("assetSpotName"), $id("assetName")].find((field) => !field.closest("label").hidden) : $id("assetKind")).focus();
}
function syncAssetForm() {
  const kind = $id("assetKind").value;
  const editing = !!assetFormState.editId;
  const isEquip = kind === "equipment";
  const isPoint = kind === "point";
  $id("assetDialogTitle").textContent = (editing ? "Editar " : "Novo nível: ") + KIND_LABEL[kind];
  $id("assetDialog").classList.toggle("wide-dialog", isEquip);
  $id("assetNameRow").hidden = isEquip || isPoint;
  $id("assetTagRow").hidden = kind === "corporation" || isPoint;
  $id("assetTagLabel").textContent = isEquip ? "TAG (identificador do equipamento)" : "Código (opcional)";
  $id("assetSpotRow").hidden = !isPoint;
  $id("assetPositionRow").hidden = !isPoint;
  $id("equipFields").hidden = !isEquip;
  if (!isEquip) $id("assetLegacyName").hidden = true;
  $id("corpFields").hidden = kind !== "corporation";
  $id("corpFields").querySelector(".form-help").textContent = editing
    ? "Para atualizar o contato, preencha e-mail e responsável. Em branco, só o nome é alterado."
    : "Contato e responsável podem ser preenchidos depois: a corporação pode nascer como rascunho.";
}
$id("assetKind").onchange = syncAssetForm;
// Lê a ficha do formulário. Campo vazio é ausência de informação; quantidade é inteiro não negativo.
function readEquipDetails() {
  const details = { equipment_type: $id("equipType").value || null };
  for (const group of EQUIP_GROUPS)
    for (const [key, label, format] of group.fields) {
      const value = $id("eq-" + key).value.trim();
      if (format === "count" && value && !/^\d{1,4}$/.test(value)) throw Error(`${label}: informe um número inteiro, sem sinal.`);
      details[key] = value || null;
    }
  return details;
}
$id("assetForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("assetFormMessage");
  const kind = $id("assetKind").value;
  const { editId, parentId } = assetFormState;
  const tag = $id("assetTag").value.trim();
  const name = kind === "equipment" ? tag : kind === "point" ? $id("assetSpotName").value : $id("assetName").value.trim();
  if (kind === "equipment" && !tag) return void (message.textContent = "Informe o TAG do equipamento.");
  if (kind === "point" && !name) return void (message.textContent = "Selecione o nome do spot: LOA, LA ou UNICO.");
  if (!name) return void (message.textContent = "Informe o nome.");
  const email = $id("corpEmail").value.trim();
  if (kind === "corporation" && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void (message.textContent = "E-mail de contato inválido.");
  let details = null;
  if (kind === "equipment") {
    try {
      details = readEquipDetails();
    } catch (error) {
      return void (message.textContent = error.message);
    }
    if (!details.equipment_type && (!editId || assetFormState.hadType)) return void (message.textContent = "Selecione o tipo de equipamento.");
  }
  message.textContent = "Salvando…";
  const button = event.submitter || $id("assetForm").querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const withContact = kind === "corporation" && (!editId || email || $id("corpResponsible").value.trim());
    const saved =
      kind === "equipment"
        ? // TAG e ficha numa única transação: ou grava tudo, ou nada.
          await callRpc("gaxeta_save_equipment", { p_id: editId, p_parent_id: parentId || null, p_tag: tag, p_details: details })
        : withContact
          ? await callRpc("gaxeta_save_corporation", {
              p_id: editId,
              p_name: name,
              p_contact_email: email || null,
              p_responsible_name: $id("corpResponsible").value.trim() || null,
              p_phone: $id("corpPhone").value.trim() || null,
              p_slug: null,
            })
          : await callRpc("gaxeta_save_asset", {
              p_id: editId,
              p_parent_id: parentId || null,
              p_kind: kind,
              p_name: name,
              p_tag: kind === "corporation" || kind === "point" ? "" : tag,
              p_position: kind === "point" ? $id("assetPosition").value.trim() : "",
              p_sensor_id: null,
              p_sensor_label: null,
            });
    if (kind === "equipment") equipTypeIndex.set(saved.id, saved.details?.equipment_type || null);
    // Relê o ramo no servidor: o que aparece na árvore é o que ficou gravado.
    await loadKids(parentId || null, { force: true });
    await ensureAssets([saved.id]);
    if (parentId) tree.open.add(parentId);
    $id("assetDialog").close();
    await revealAsset(saved.id);
    // Um spot novo aparece dentro da ficha do TAG, que continua selecionado; os demais níveis passam a ser a seleção.
    const stayOnEquip = kind === "point" && state.page === "assets" && state.assetId === parentId;
    if (stayOnEquip) tree.open.add(parentId);
    else state.assetId = saved.id;
    renderTree();
    if (state.page === "assets") await renderInspector();
    renderIcons();
    const next = allowedChildKinds(assetIndex.get(saved.id)).map((value) => KIND_LABEL[value]);
    showMessage(`${KIND_LABEL[kind]} “${assetLabel(assetIndex.get(saved.id) || saved)}” ${kindDone(kind, editId ? "atualizad" : "gravad")}.${!editId && next.length ? " Próxima criação: " + next.join(" ou ") + "." : ""}`, "success");
  } catch (error) {
    message.textContent = isMissingFeature(error) ? MISSING_FEATURE_TEXT : errorText(error);
  } finally {
    button.disabled = false;
  }
};

// ----- Exclusão definitiva (nível 1), sempre com as dependências à vista -----
async function deleteAsset(asset) {
  const deps = await callRpc("gaxeta_asset_dependencies", { p_id: asset.id });
  const lines = [
    ["children", "níveis diretamente abaixo"],
    ["linked_sensors", "sensores vinculados"],
    ["gateways", "gateways"],
    ["link_history", "registros de instalação (histórico de vínculos)"],
    ["users", "usuários vinculados à corporação"],
  ]
    .filter(([key]) => deps[key] > 0)
    .map(([key, label]) => `<li><b>${deps[key]}</b> ${label}</li>`);
  if (lines.length) {
    await askConfirm({
      title: "Não é possível excluir",
      html: `<p><b>${esc(assetLabel(asset))}</b> possui dependências:</p><ul>${lines.join("")}</ul><p>Remova ou mova as dependências primeiro. Itens com histórico de instalação ficam preservados.</p>`,
      allowOk: false,
    });
    return;
  }
  const grants = deps.access_grants > 0 ? `<p>${deps.access_grants} concessão(ões) de acesso apontam para este nível e serão removidas.</p>` : "";
  const sheet = asset.kind === "equipment" ? "<p>A ficha técnica deste TAG é excluída junto.</p>" : "";
  if (!(await askConfirm({ title: "Excluir " + KIND_LABEL[asset.kind].toLowerCase(), html: `<p>Excluir definitivamente <b>${esc(assetPathLabel(asset.id))}</b>?</p>${grants}${sheet}<p>A exclusão fica registrada na auditoria.</p>`, okLabel: "Excluir" }))) return;
  await callRpc("gaxeta_delete_asset", { p_id: asset.id, p_reason: "exclusão pela interface" });
  forgetAsset(asset.id);
  equipTypeIndex.delete(asset.id);
  tree.kids.delete(kidsKey(asset.id));
  await loadKids(asset.parent_id || null, { force: true });
  state.assetId = asset.parent_id || "";
  renderTree();
  await renderInspector();
  renderIcons();
  showMessage(`${KIND_LABEL[asset.kind]} “${assetLabel(asset)}” ${kindDone(asset.kind, "excluíd")}.`, "success");
}

// ----- Vínculo do sensor ao spot (operação atômica no servidor) -----
const linkState = { pointId: null, run: 0 };
function openLinkDialog(pointId) {
  linkState.pointId = pointId;
  $id("linkContext").textContent = "Spot: " + assetPathLabel(pointId);
  $id("linkSearch").value = "";
  $id("linkMessage").textContent = "";
  $id("linkUnlinked").checked = hasCap("association_queue");
  $id("linkUnlinked").closest("label").hidden = !hasCap("association_queue");
  $id("linkDialog").showModal();
  searchLinkable();
}
async function searchLinkable() {
  const run = ++linkState.run;
  const box = $id("linkResults");
  box.innerHTML = '<p class="form-help">Buscando…</p>';
  try {
    const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: $id("linkSearch").value.trim() || null, p_unlinked: $id("linkUnlinked").checked, p_limit: 20, p_offset: 0 });
    if (run !== linkState.run) return;
    mergeDevices(result.items);
    await ensureAssets(result.items.map((device) => device.measurement_point_id));
    box.innerHTML =
      result.items
        .map(
          (device) =>
            `<div class="pick-row"><div><strong>${esc(deviceLabel(device))}</strong><small>${esc(device.sensor_id)} · ${device.measurement_point_id ? "em " + esc(assetPathLabel(device.measurement_point_id)) : "sem vínculo"} · ${deviceStatus(device).label}</small></div>` +
            `<button class="primary compact" data-link="${esc(device.sensor_id)}">${device.measurement_point_id ? "Mover para cá" : "Vincular"}</button></div>`,
        )
        .join("") +
        (result.total > result.items.length ? `<p class="form-help">Mostrando 20 de ${result.total}. Refine a busca.</p>` : "") ||
      `<p class="form-help">${hasCap("association_queue") ? "Nenhum sensor encontrado. O sensor aparece aqui depois da primeira transmissão." : "Nenhum sensor do seu escopo encontrado. A primeira associação de um sensor novo é feita por um administrador."}</p>`;
  } catch (error) {
    box.innerHTML = "";
    $id("linkMessage").textContent = errorText(error);
  }
}
$id("linkSearch").oninput = debounce(searchLinkable, 350);
$id("linkUnlinked").onchange = searchLinkable;
$id("linkResults").onclick = async (event) => {
  const button = event.target.closest("[data-link]");
  if (!button) return;
  button.disabled = true;
  $id("linkMessage").textContent = "Vinculando…";
  try {
    const saved = await callRpc("gaxeta_link_sensor", { p_sensor_id: button.dataset.link, p_point_id: linkState.pointId, p_reason: "vínculo pela interface" });
    mergeDevices([saved]);
    $id("linkDialog").close();
    renderTree();
    // Relê o resumo do TAG (ou a ficha do spot) com o vínculo novo.
    if (state.page === "assets") await renderInspector();
    showMessage(`Sensor ${deviceLabel(saved)} vinculado a ${assetPathLabel(linkState.pointId)}.`, "success");
  } catch (error) {
    $id("linkMessage").textContent = errorText(error);
    button.disabled = false;
  }
};
