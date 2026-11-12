// =============================================================================
// Casca da aplicação: estado, mensagens, permissões, navegação e atualização.
// =============================================================================
const state = {
  clockOffset: 0,
  devices: [], // sensores conhecidos nesta sessão (página atual e sensor selecionado)
  assets: [], // cache dos ativos já carregados (a árvore é lida por ramo, sob demanda)
  sensorId: "",
  assetId: "",
  page: "sensors",
  manualReturn: "sensors", // tela de origem do Manual aberto dentro da aplicação
  authorized: false,
  loading: false,
  timer: null,
  authRequest: 0,
  bleReading: null,
  bleDevice: null,
  ctx: null, // resposta de gaxeta_my_context()
  userId: null,
  lastContextCheck: 0,
  sensors: { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 },
  drawer: { open: false, mode: "detail", sensorId: "", opener: null },
};
const assetIndex = new Map();
// Tipo de equipamento por TAG (id do ativo → chave do catálogo; null = não informado).
const equipTypeIndex = new Map();
let equipTypesMissing = false; // a tabela da ficha ainda não existe no banco (migração não aplicada)

const deviceStatus = (device) => connectionStatus(device, Date.now() + state.clockOffset);
const currentDevice = () => state.devices.find((device) => device.sensor_id === state.sensorId);
const findDevice = (sensorId) => state.devices.find((device) => device.sensor_id === sensorId);
// O TAG é o identificador do equipamento: o código gravado em `tag`, ou o nome nos registros antigos.
const equipTag = (asset) => asset?.tag || asset?.name || "—";
const assetLabel = (asset) =>
  !asset ? "—" : asset.kind === "equipment" ? equipTag(asset) : asset.tag && asset.tag !== asset.name ? `${asset.name} · ${asset.tag}` : asset.name;
const assetName = (id) => assetIndex.get(id)?.name || "—";
const assetPathLabel = (id) => assetPath(id, state.assets).map(assetLabel).join(" / ");
const equipTypeLabel = (id) => equipCatalog.get(equipTypeIndex.get(id)) || "";
const deviceLabel = (device) =>
  device.desired_label || device.applied_label || (device.label === "Sensor de gaxeta" ? device.sensor_id : device.label) || device.sensor_id;

// Identidade de um sensor para leitura rápida: TAG · tipo na frente, sensor e spot como contexto.
// O caminho completo continua disponível (dica do título e painel de Detalhes).
function deviceIdentity(device) {
  const chain = device ? assetPath(device.measurement_point_id, state.assets) : [];
  const pick = (kind) => chain.find((asset) => asset.kind === kind);
  const equip = pick("equipment");
  const point = pick("point");
  const sensor = device ? deviceLabel(device) : "";
  if (!equip || !point) return { linked: false, sensor, tag: "", type: "", spot: "", title: sensor || "Sensor", context: "", path: "" };
  const tag = equipTag(equip);
  const type = equipTypeLabel(equip.id);
  return {
    linked: true,
    sensor,
    tag,
    type,
    spot: point.name,
    title: `${tag} · ${type || TYPE_UNKNOWN}`,
    context: [pick("company")?.name, pick("area")?.name].filter(Boolean).join(" / "),
    path: chain.map(assetLabel).join(" / "),
  };
}

const myRole = () => state.ctx?.role || null;
const hasCap = (name) => !!state.ctx?.capabilities?.[name];
const isAdminWriter = () => myRole() === "adm1" || myRole() === "adm2";

// ----- Mensagens -----
let messageTimer = null;
function showMessage(text, kind = "info") {
  const box = $id("globalMessage");
  clearTimeout(messageTimer);
  box.textContent = text || "";
  box.className = "message " + kind;
  box.hidden = !text;
  if (text && kind !== "error") messageTimer = setTimeout(() => (box.hidden = true), 7000);
}
// Falha de transporte (sem rede, tempo esgotado no aparelho): só ela muda o indicador de conexão.
const isNetworkError = (error) =>
  error?.name === "AbortError" || /Failed to fetch|NetworkError|Load failed|network request failed/i.test(error?.message || String(error || ""));
function errorText(error) {
  const message = error?.message || String(error || "");
  if (isNetworkError(error)) return "Não foi possível conectar. Verifique sua conexão e tente de novo.";
  if (error?.code === "42501") return "Sua conta não tem permissão para esta operação.";
  if (error?.code === "23505") {
    if (/gateway|identifier/i.test(message + (error.details || ""))) return "Já existe um gateway com esta identificação.";
    if (/e-mail|email/i.test(message)) return message;
    return "Este spot já tem um sensor, ou o sensor já está em outro spot. Desfaça o vínculo atual antes.";
  }
  if (error?.code === "23503") return message || "Este cadastro possui dependências e não pode ser alterado.";
  if (error?.code === "57014") return "A consulta demorou demais. Reduza o período e tente de novo.";
  return message;
}
async function withBusy(button, task) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await task();
  } catch (error) {
    showMessage(errorText(error), "error");
  } finally {
    if (button) button.disabled = false;
  }
}
function fillSelect(select, options, placeholder, value = "") {
  select.replaceChildren();
  if (placeholder !== null) select.add(new Option(placeholder, ""));
  for (const option of options) select.add(new Option(option.label, option.value));
  select.value = value;
  if (select.value !== value) select.value = "";
}
const debounce = (task, wait = 300) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => task(...args), wait);
  };
};

// Confirmação na própria página (sem caixas nativas do navegador).
function askConfirm({ title, html, okLabel = "Confirmar", allowOk = true, danger = true }) {
  const dialog = $id("confirmDialog");
  $id("confirmTitle").textContent = title;
  $id("confirmBody").innerHTML = html;
  const ok = $id("confirmOk");
  ok.textContent = okLabel;
  ok.hidden = !allowOk;
  ok.className = danger ? "danger" : "primary";
  dialog.returnValue = "cancel";
  dialog.showModal();
  return new Promise((resolve) => dialog.addEventListener("close", () => resolve(dialog.returnValue === "ok"), { once: true }));
}

// ----- Cache de ativos e sensores -----
function rememberAssets(rows) {
  for (const row of rows || []) assetIndex.set(row.id, { ...assetIndex.get(row.id), ...row });
  state.assets = [...assetIndex.values()];
}
function forgetAsset(id) {
  assetIndex.delete(id);
  state.assets = [...assetIndex.values()];
}
// Garante no cache os ativos indicados e seus ancestrais (duas consultas no máximo) e,
// para os TAGs envolvidos, o tipo de equipamento (uma consulta, só para os ainda não lidos).
async function ensureAssets(ids) {
  const fetchRows = async (wanted) => {
    const rows = [];
    for (let i = 0; i < wanted.length; i += 80)
      rows.push(
        ...(await unwrap(
          sb.from("gaxeta_assets").select("id,parent_id,kind,name,tag,position,path,corporation_id").in("id", wanted.slice(i, i + 80)),
        )),
      );
    rememberAssets(rows);
    return rows;
  };
  const wantedIds = [...new Set(ids.filter(Boolean))];
  const missing = wantedIds.filter((id) => !assetIndex.get(id)?.path);
  if (missing.length) {
    const rows = await fetchRows(missing);
    const ancestors = [...new Set(rows.flatMap((row) => row.path || []))].filter((id) => !assetIndex.has(id));
    if (ancestors.length) await fetchRows(ancestors);
  }
  await ensureEquipTypes(
    wantedIds.flatMap((id) => assetIndex.get(id)?.path || []).filter((id) => assetIndex.get(id)?.kind === "equipment"),
  );
}
async function ensureEquipTypes(ids) {
  const wanted = [...new Set(ids)].filter((id) => id && !equipTypeIndex.has(id));
  if (!wanted.length || equipTypesMissing) return;
  try {
    const rows = [];
    for (let i = 0; i < wanted.length; i += 80)
      rows.push(...(await unwrap(sb.from("gaxeta_equipment_details").select("asset_id,equipment_type").in("asset_id", wanted.slice(i, i + 80)))));
    for (const id of wanted) equipTypeIndex.set(id, null);
    for (const row of rows) equipTypeIndex.set(row.asset_id, row.equipment_type || null);
  } catch (error) {
    // O tipo é complemento da tela: sem ele, o TAG aparece com "Tipo não informado".
    if (error?.code === "42P01" || error?.code === "PGRST205") equipTypesMissing = true;
  }
}
async function loadEquipCatalog() {
  const rows = await unwrap(sb.from("gaxeta_equipment_types").select("key,label").order("sort_order"));
  if (!rows.length) return;
  equipCatalog.clear();
  for (const row of rows) equipCatalog.set(row.key, row.label);
}
function mergeDevices(rows) {
  const byId = new Map(state.devices.map((device) => [device.sensor_id, device]));
  for (const row of rows || []) byId.set(row.sensor_id, row);
  state.devices = [...byId.values()];
}
function setServerTime(serverTime, observedAt) {
  if (serverTime) state.clockOffset = new Date(serverTime).getTime() - observedAt;
}
// Atualiza só os sensores em uso (selecionado e painel aberto): uma chamada por ciclo.
async function refreshKnownDevices() {
  const ids = [...new Set([state.sensorId, state.drawer.open ? state.drawer.sensorId : ""].filter(Boolean))];
  if (!ids.length) return;
  const startedAt = Date.now();
  const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: ids });
  setServerTime(result.server_time, startedAt);
  mergeDevices(result.devices);
  if (state.sensorId && !result.devices.some((device) => device.sensor_id === state.sensorId) && state.page === "telemetry") {
    // O sensor saiu do escopo de quem está logado (vínculo ou acesso alterado).
    state.devices = state.devices.filter((device) => device.sensor_id !== state.sensorId);
    state.sensorId = "";
    resetTelemetryData();
  }
}

// ----- Permissões na interface (o servidor decide; aqui só se evita oferecer o que será negado) -----
function applyPermissions() {
  const users = hasCap("manage_users");
  document.querySelectorAll(".needs-users").forEach((element) => (element.hidden = !users));
  $id("userName").textContent = state.ctx?.display_name || "";
  $id("userRole").textContent = ROLE_LABEL[myRole()] || "";
  $id("statusFilter").querySelector('[value="unassigned"]').hidden = !(myRole() || "").startsWith("adm");
}
async function checkContext() {
  const context = await callRpc("gaxeta_my_context");
  state.lastContextCheck = Date.now();
  if (!context?.role) {
    await leaveApp("Seu acesso foi alterado ou removido. Fale com o responsável pela operação.");
    return false;
  }
  state.ctx = context;
  applyPermissions();
  return true;
}

// ----- Navegação -----
const PAGE_TITLES = { sensors: "Sensores", assets: "Árvore de ativos", telemetry: "Telemetria", gateways: "Gateways", users: "Usuários", manual: "Manual de operação" };
function renderPageActions() {
  const actions = [];
  // Bluetooth: só no aplicativo nativo e só por toque. Na web, a busca da lista encontra por nome, TAG, ID ou MAC.
  if (state.page === "sensors" && bleAvailable())
    actions.push('<button class="primary compact" data-action="find-sensor">' + icon("bluetooth-searching") + "Encontrar sensor</button>");
  // A estrutura de ativos é administrada na web (qualquer largura de janela).
  if (state.page === "assets" && hasCap("manage_corporations") && !isNativeApp())
    actions.push('<button class="primary compact" data-action="new-corporation">' + icon("plus") + "Nova corporação</button>");
  if (state.page === "gateways" && hasCap("manage_gateways"))
    actions.push('<button class="primary compact" data-action="new-gateway">' + icon("plus") + "Cadastrar gateway</button>");
  if (state.page === "users" && hasCap("manage_users"))
    actions.push('<button class="primary compact" data-action="new-user">' + icon("plus") + "Novo usuário</button>");
  if (state.page === "manual")
    actions.push(`<button class="secondary compact" data-action="manual-back">${glyph("back")}Voltar para ${esc(PAGE_TITLES[state.manualReturn] || "Sensores")}</button>`);
  $id("pageActions").innerHTML = actions.join("");
}
function showPage(page) {
  if (!PAGE_TITLES[page] || (page === "users" && !hasCap("manage_users"))) page = "sensors";
  // O Manual abre dentro da aplicação: guarda a tela de origem para o Voltar (sessão e seleção intactas).
  if (page === "manual" && state.page !== "manual") state.manualReturn = state.page;
  // Bluetooth nunca fica aberto de uma tela para outra, nem abre sozinho.
  closeBleDialog();
  state.page = page;
  if (location.hash.slice(1) !== page) history.replaceState(null, "", "#" + page);
  document.body.dataset.page = page;
  $id("workspace").hidden = !["sensors", "assets"].includes(page);
  $id("sensorPane").hidden = page !== "sensors";
  $id("assetInspector").hidden = page !== "assets";
  $id("telemetryPage").hidden = page !== "telemetry";
  $id("gatewayPage").hidden = page !== "gateways";
  $id("usersPage").hidden = page !== "users";
  $id("manualPage").hidden = page !== "manual";
  $id("summary").hidden = page !== "sensors";
  $id("pageTitle").textContent = PAGE_TITLES[page];
  $id("userMenu").open = false;
  setTreeDrawer(false);
  for (const button of document.querySelectorAll("[data-page]")) {
    button.classList.toggle("active", button.dataset.page === page);
    button.setAttribute("aria-current", button.dataset.page === page ? "page" : "false");
  }
  renderPageActions();
  const fail = (error) => showMessage(errorText(error), "error");
  if (page === "sensors") loadSensors().catch(fail);
  if (page === "assets") renderInspector().catch(fail);
  if (page === "telemetry") openTelemetry().catch(fail);
  if (page === "gateways") loadGateways().catch(fail);
  if (page === "users") loadUsers().catch(fail);
  if (page === "manual") openManual().catch(fail);
  if (page === "sensors" || page === "assets") ensureTreeRoot().catch(fail);
  renderIcons();
}
function setConnection(ok) {
  $id("connection").textContent = ok ? "Conectado" : "Sem conexão";
  $id("connection").className = "connection " + (ok ? "ok" : "error");
}

// Atualização periódica. Não reabre painéis, não apaga edição e não mexe em filtros.
async function refreshData(manual = false) {
  if (!state.authorized || document.hidden) return;
  if (state.loading) {
    state.refreshPending = true;
    return;
  }
  state.loading = true;
  state.refreshPending = false;
  clearTimeout(state.timer);
  const session = state.authRequest;
  try {
    if (Date.now() - state.lastContextCheck > CONFIG.contextCheckMs && !(await checkContext())) return;
    if (session !== state.authRequest) return;
    if (state.page === "sensors") await loadSensors({ quiet: true });
    else if (state.page === "telemetry") {
      // Leitura atual: leve, a cada ciclo. Histórico: consulta separada, no ritmo do período
      // exibido, sem competir com um pedido feito por quem está usando (ver 70-telemetry).
      await refreshKnownDevices();
      renderTelemetryLive();
      refreshHistoryIfDue();
    }
    if (state.drawer.open) {
      if (state.page !== "telemetry") await refreshKnownDevices();
      updateDrawerLive();
    }
    setConnection(true);
    $id("lastSync").textContent = `Última consulta ${fmtDateTime(new Date())}`;
  } catch (error) {
    if (error?.code === "42501") await checkContext().catch(() => {});
    else {
      // Só falha de transporte vira "Sem conexão"; erro de consulta é mostrado onde aconteceu.
      if (isNetworkError(error)) setConnection(false);
      if (manual || !isNetworkError(error)) showMessage(errorText(error), "error");
    }
  } finally {
    state.loading = false;
    if (state.authorized) state.timer = setTimeout(refreshData, state.refreshPending ? 0 : CONFIG.pollMs);
  }
}
const openSensorEditor = (sensorId) => openDrawer(sensorId, "detail");

// Limpa da tela e da memória tudo o que pertence à sessão encerrada.
function clearSessionData() {
  clearTimeout(state.timer);
  state.authorized = false;
  state.authRequest++;
  Object.assign(state, { devices: [], assets: [], sensorId: "", assetId: "", ctx: null, userId: null, manualReturn: "sensors" });
  resetTelemetryData();
  Object.assign(telem, { matchIds: null, listed: false, period: 36e5, custom: false, range: presetRange(36e5) });
  equipTypeIndex.clear();
  state.sensors = { search: "", filter: "all", offset: 0, total: 0, ids: [], request: 0 };
  assetIndex.clear();
  resetTree();
  closeDrawer(false);
  for (const id of ["sensorGrid", "tree", "assetInspector", "gatewayGrid", "userRows", "auditRows", "movementRows", "historyRows", "historyChart"])
    $id(id).replaceChildren();
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
}
