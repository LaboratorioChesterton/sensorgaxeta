// =============================================================================
// Gateways: cadastro e edição reais, sempre sob uma empresa (gaxeta_save_gateway).
// "Cadastrado" não significa "transmitindo": o transporte por gateway ainda não
// está ativo e nenhum estado de transmissão é mostrado sem evidência.
// =============================================================================
const gatewayView = { search: "", offset: 0, total: 0, rows: [], counts: {}, editId: null, request: 0 };
const GATEWAY_PAGE = 24;
async function loadGateways() {
  const run = ++gatewayView.request;
  let query = sb.from("gaxeta_gateways").select("*", { count: "exact" }).order("name").range(gatewayView.offset, gatewayView.offset + GATEWAY_PAGE - 1);
  if (gatewayView.search) {
    const term = gatewayView.search.replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,identifier.ilike.%${term}%`);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  if (run !== gatewayView.request) return;
  gatewayView.rows = data;
  gatewayView.total = count ?? data.length;
  await ensureAssets(data.map((row) => row.company_id));
  gatewayView.counts = {};
  if (data.length) {
    const linked = await unwrap(sb.from("gaxeta_devices").select("gateway_id").in("gateway_id", data.map((row) => row.id)));
    for (const row of linked) gatewayView.counts[row.gateway_id] = (gatewayView.counts[row.gateway_id] || 0) + 1;
  }
  if (run !== gatewayView.request) return;
  renderGateways();
}
function renderGateways() {
  const canManage = hasCap("manage_gateways");
  $id("gatewayGrid").innerHTML =
    gatewayView.rows
      .map(
        (row) =>
          `<article class="gateway-card">${icon("router")}<div class="gateway-main"><h3>${esc(row.name)}</h3><code>${esc(row.identifier)}</code>` +
          `<p>${esc(assetPathLabel(row.company_id) || "Empresa fora do seu escopo")}</p>` +
          `<p><span class="state-chip">Cadastrado</span> ${gatewayView.counts[row.id] || 0} sensor(es) associados</p></div>` +
          (canManage
            ? `<div class="row-actions"><button class="secondary compact" data-gateway-edit="${row.id}">Editar</button>${hasCap("delete_records") ? `<button class="text-button danger-text" data-gateway-delete="${row.id}">Excluir</button>` : ""}</div>`
            : "") +
          `</article>`,
      )
      .join("") ||
    `<div class="empty-state"><h3>Nenhum gateway ${gatewayView.search ? "encontrado" : "cadastrado"}</h3><p>Os sensores seguem transmitindo direto por Wi-Fi. O gateway é opcional e fica sob a empresa.</p></div>`;
  const first = gatewayView.total ? gatewayView.offset + 1 : 0;
  const last = Math.min(gatewayView.offset + GATEWAY_PAGE, gatewayView.total);
  $id("gatewayPager").innerHTML =
    gatewayView.total > GATEWAY_PAGE
      ? `<button class="secondary compact" data-gw-move="-1"${gatewayView.offset ? "" : " disabled"}>Anterior</button><span>${first}–${last} de ${gatewayView.total}</span><button class="secondary compact" data-gw-move="1"${last < gatewayView.total ? "" : " disabled"}>Próxima</button>`
      : "";
  renderIcons();
}
async function openGatewayForm(editId = null) {
  const row = editId ? gatewayView.rows.find((item) => item.id === editId) : null;
  gatewayView.editId = row?.id || null;
  $id("gatewayDialogTitle").textContent = row ? "Editar gateway" : "Cadastrar gateway";
  $id("gatewayName").value = row?.name || "";
  $id("gatewayIdentifier").value = row?.identifier || "";
  $id("gatewayMessage").textContent = "";
  // Empresa: a do gateway em edição, ou a do ramo selecionado na árvore.
  const seed = row?.company_id || state.assetId;
  await ensureAssets([seed]);
  const values = { corporation: "", company: "" };
  for (const asset of assetPath(seed, state.assets)) if (asset.kind in values) values[asset.kind] = asset.id;
  const levels = ["corporation", "company"];
  await refillPicker("gw-pick-", 0, values, levels);
  $id("gw-pick-corporation").onchange = () =>
    withBusy(null, async () => {
      values.corporation = $id("gw-pick-corporation").value;
      values.company = "";
      await refillPicker("gw-pick-", 1, values, levels);
    });
  $id("gatewayDialog").showModal();
}
$id("gatewayForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("gatewayMessage");
  const company = $id("gw-pick-company").value;
  const name = $id("gatewayName").value.trim();
  const identifier = $id("gatewayIdentifier").value.trim();
  if (!company) return void (message.textContent = "Selecione a empresa.");
  if (!name || !identifier) return void (message.textContent = "Informe nome e identificação.");
  message.textContent = "Salvando…";
  event.submitter.disabled = true;
  try {
    const saved = await callRpc("gaxeta_save_gateway", { p_id: gatewayView.editId, p_company_id: company, p_name: name, p_identifier: identifier });
    $id("gatewayDialog").close();
    await loadGateways();
    showMessage(`Gateway “${saved.name}” ${gatewayView.editId ? "atualizado" : "cadastrado"} em ${assetPathLabel(saved.company_id)}.`, "success");
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    event.submitter.disabled = false;
  }
};
$id("gatewayGrid").onclick = async (event) => {
  const edit = event.target.closest("[data-gateway-edit]");
  const remove = event.target.closest("[data-gateway-delete]");
  if (edit) return withBusy(edit, () => openGatewayForm(edit.dataset.gatewayEdit));
  if (!remove) return;
  const row = gatewayView.rows.find((item) => item.id === remove.dataset.gatewayDelete);
  if (!row) return;
  if (!(await askConfirm({ title: "Excluir gateway", html: `<p>Excluir definitivamente o gateway <b>${esc(row.name)}</b> (${esc(row.identifier)})? Gateways com sensores associados não são excluídos.</p>`, okLabel: "Excluir" }))) return;
  await withBusy(remove, async () => {
    await callRpc("gaxeta_delete_gateway", { p_id: row.id });
    await loadGateways();
    showMessage(`Gateway “${row.name}” excluído.`, "success");
  });
};
$id("gatewayPager").onclick = (event) => {
  const move = event.target.closest("[data-gw-move]");
  if (!move) return;
  gatewayView.offset = Math.max(0, gatewayView.offset + Number(move.dataset.gwMove) * GATEWAY_PAGE);
  loadGateways().catch((error) => showMessage(errorText(error), "error"));
};
$id("gatewaySearch").oninput = debounce(() => {
  gatewayView.search = $id("gatewaySearch").value.trim();
  gatewayView.offset = 0;
  loadGateways().catch((error) => showMessage(errorText(error), "error"));
}, 350);
