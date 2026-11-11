// =============================================================================
// Ativos: inspetor do nível selecionado, formulários persistentes (RPCs com
// autorização no servidor), exclusão com dependências e vínculo sensor–spot.
// =============================================================================
const HIERARCHY_GUIDE =
  '<ol class="hierarchy-guide"><li>Corporação</li><li>Empresa</li><li>Área</li><li>Subárea <em>(opcional)</em></li><li>TAG (equipamento)</li><li>Spot → sensor</li></ol>' +
  "<p>O TAG pode ficar direto na área ou dentro de uma subárea. O sensor é vinculado ao spot. O gateway é cadastrado na empresa.</p>";

async function renderInspector() {
  const box = $id("assetInspector");
  const assetId = state.assetId;
  const asset = assetIndex.get(assetId);
  if (!asset) {
    box.innerHTML = `<div class="inspector-card"><h2>Estrutura de ativos</h2><p>Selecione um nível na árvore para ver detalhes, editar ou criar o próximo nível.</p>${HIERARCHY_GUIDE}</div>`;
    return;
  }
  await ensureAssets([assetId]);
  let sensor = null;
  if (asset.kind === "point") {
    sensor = (await unwrap(sb.from("gaxeta_devices").select("*").eq("measurement_point_id", assetId).limit(1)))[0] || null;
    if (sensor) mergeDevices([sensor]);
  }
  if (state.assetId !== assetId || state.page !== "assets") return;
  const childKinds = allowedChildKinds(asset);
  const editable = canEditAsset(asset);
  const canLink = asset.kind === "point" && (isAdminWriter() || (myRole() === "corp" && state.ctx.can_write && asset.access === "full"));
  const sensorBlock =
    asset.kind !== "point"
      ? ""
      : sensor
        ? `<div class="inspector-sensor"><div><small>Sensor vinculado</small><strong>${esc(deviceLabel(sensor))}</strong><span>${fmtNum(sensor.stable_percent)} % · ${deviceStatus(sensor).label}</span></div>` +
          `<div class="row-actions"><button class="secondary compact" data-act="sensor-detail" data-sensor="${esc(sensor.sensor_id)}">Detalhes</button><button class="secondary compact" data-act="sensor-history" data-sensor="${esc(sensor.sensor_id)}">Histórico</button></div></div>`
        : `<div class="inspector-sensor empty"><div><small>Sensor</small><strong>Aguardando instalação</strong><span>Nenhum sensor vinculado a este spot.</span></div>` +
          (canLink ? `<div class="row-actions"><button class="primary compact" data-act="link">Vincular sensor</button></div>` : "") +
          `</div>`;
  box.innerHTML =
    `<div class="inspector-card"><span class="kind-chip">${KIND_LABEL[asset.kind]}</span><h2>${esc(asset.name)}</h2>` +
    `<p class="inspector-path">${esc(assetPathLabel(assetId))}</p>` +
    (asset.access === "path" ? '<p class="path-note">Este nível aparece só como caminho de navegação até os ramos concedidos à sua conta.</p>' : "") +
    `<dl class="detail-fields">${asset.tag ? `<dt>TAG / código</dt><dd>${esc(asset.tag)}</dd>` : ""}${asset.position ? `<dt>Posição</dt><dd>${esc(asset.position)}</dd>` : ""}</dl>` +
    sensorBlock +
    `<div class="inspector-actions">` +
    childKinds.map((kind) => `<button class="primary compact" data-act="add" data-kind="${kind}">${icon("plus")}${KIND_LABEL[kind]}</button>`).join("") +
    (editable ? `<button class="secondary compact" data-act="edit">Editar</button>` : "") +
    (asset.kind === "company" ? `<button class="secondary compact" data-act="gateways">Gateways da empresa</button>` : "") +
    (hasCap("delete_records") ? `<button class="text-button danger-text" data-act="delete">Excluir…</button>` : "") +
    `</div>` +
    (childKinds.length ? `<p class="form-help">Próximo nível: ${childKinds.map((kind) => KIND_LABEL[kind]).join(" ou ")}.</p>` : "") +
    `</div>`;
  renderIcons();
}
$id("assetInspector").onclick = async (event) => {
  const button = event.target.closest("[data-act]");
  if (!button) return;
  const act = button.dataset.act;
  const asset = assetIndex.get(state.assetId);
  if (act === "sensor-detail") return openDrawer(button.dataset.sensor, "detail", button);
  if (act === "sensor-history") {
    state.sensorId = button.dataset.sensor;
    return showPage("telemetry");
  }
  if (!asset) return;
  if (act === "add") return openAssetForm({ parentId: asset.id, kind: button.dataset.kind });
  if (act === "edit") return openAssetForm({ editId: asset.id });
  if (act === "link") return openLinkDialog(asset.id);
  if (act === "gateways") return showPage("gateways");
  if (act === "delete") return withBusy(button, () => deleteAsset(asset));
};

// ----- Formulário de ativo -----
const assetFormState = { editId: null, parentId: null };
function openAssetForm({ parentId = null, kind = null, editId = null }) {
  const editing = editId ? assetIndex.get(editId) : null;
  const parent = editing ? assetIndex.get(editing.parent_id) : assetIndex.get(parentId);
  const kinds = editing ? [editing.kind] : allowedChildKinds(parent || null);
  if (!kinds.length) return showMessage("Sua conta não pode criar níveis aqui.", "error");
  Object.assign(assetFormState, { editId: editing?.id || null, parentId: editing ? editing.parent_id : parentId });
  fillSelect($id("assetKind"), kinds.map((value) => ({ value, label: KIND_LABEL[value] })), null, kind && kinds.includes(kind) ? kind : kinds[0]);
  $id("assetKindRow").hidden = kinds.length < 2;
  $id("assetContext").textContent = parent ? "Dentro de: " + assetPathLabel(parent.id) : "Raiz da estrutura";
  $id("assetName").value = editing?.name || "";
  $id("assetTag").value = editing?.tag || "";
  $id("assetPosition").value = editing?.position || "";
  for (const id of ["corpEmail", "corpResponsible", "corpPhone"]) $id(id).value = "";
  $id("assetFormMessage").textContent = "";
  syncAssetForm();
  $id("assetDialog").showModal();
  $id("assetName").focus();
}
function syncAssetForm() {
  const kind = $id("assetKind").value;
  const editing = !!assetFormState.editId;
  $id("assetDialogTitle").textContent = (editing ? "Editar " : "Novo nível: ") + KIND_LABEL[kind];
  $id("assetTagRow").hidden = kind === "corporation" || kind === "point";
  $id("assetPositionRow").hidden = kind !== "point";
  $id("corpFields").hidden = kind !== "corporation";
  $id("corpFields").querySelector(".form-help").textContent = editing
    ? "Para atualizar o contato, preencha e-mail e responsável. Em branco, só o nome é alterado."
    : "Contato e responsável podem ser preenchidos depois: a corporação pode nascer como rascunho.";
}
$id("assetKind").onchange = syncAssetForm;
$id("assetForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("assetFormMessage");
  const kind = $id("assetKind").value;
  const name = $id("assetName").value.trim();
  if (!name) return void (message.textContent = "Informe o nome.");
  const email = $id("corpEmail").value.trim();
  if (kind === "corporation" && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void (message.textContent = "E-mail de contato inválido.");
  message.textContent = "Salvando…";
  const button = event.submitter;
  button.disabled = true;
  try {
    const { editId, parentId } = assetFormState;
    const withContact = kind === "corporation" && (!editId || email || $id("corpResponsible").value.trim());
    const saved = withContact
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
          p_tag: kind === "corporation" || kind === "point" ? "" : $id("assetTag").value.trim(),
          p_position: kind === "point" ? $id("assetPosition").value.trim() : "",
          p_sensor_id: null,
          p_sensor_label: null,
        });
    // Relê o ramo no servidor: o que aparece na árvore é o que ficou gravado.
    await loadKids(parentId || null, { force: true });
    await ensureAssets([saved.id]);
    if (parentId) tree.open.add(parentId);
    $id("assetDialog").close();
    await revealAsset(saved.id);
    state.assetId = saved.id;
    renderTree();
    if (state.page === "assets") await renderInspector();
    renderIcons();
    const next = allowedChildKinds(assetIndex.get(saved.id)).map((value) => KIND_LABEL[value]);
    showMessage(`${KIND_LABEL[kind]} “${saved.name}” ${editId ? "atualizado" : "gravado"}.${!editId && next.length ? " Próximo nível: " + next.join(" ou ") + "." : ""}`, "success");
  } catch (error) {
    message.textContent = errorText(error);
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
      html: `<p><b>${esc(asset.name)}</b> possui dependências:</p><ul>${lines.join("")}</ul><p>Remova ou mova as dependências primeiro. Itens com histórico de instalação ficam preservados.</p>`,
      allowOk: false,
    });
    return;
  }
  const grants = deps.access_grants > 0 ? `<p>${deps.access_grants} concessão(ões) de acesso apontam para este nível e serão removidas.</p>` : "";
  if (!(await askConfirm({ title: "Excluir " + KIND_LABEL[asset.kind].toLowerCase(), html: `<p>Excluir definitivamente <b>${esc(assetPathLabel(asset.id))}</b>?</p>${grants}<p>A exclusão fica registrada na auditoria.</p>`, okLabel: "Excluir" }))) return;
  await callRpc("gaxeta_delete_asset", { p_id: asset.id, p_reason: "exclusão pela interface" });
  forgetAsset(asset.id);
  tree.kids.delete(kidsKey(asset.id));
  await loadKids(asset.parent_id || null, { force: true });
  state.assetId = asset.parent_id || "";
  renderTree();
  await renderInspector();
  renderIcons();
  showMessage(`${KIND_LABEL[asset.kind]} “${asset.name}” excluído.`, "success");
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
    await renderInspector();
    showMessage(`Sensor ${deviceLabel(saved)} vinculado a ${assetPathLabel(linkState.pointId)}.`, "success");
  } catch (error) {
    $id("linkMessage").textContent = errorText(error);
    button.disabled = false;
  }
};
