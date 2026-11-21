// =============================================================================
// Sensores: lista paginada por ramo (gaxeta_devices_page) e painel lateral, que
// só abre por Detalhes ou Editar e não é redesenhado pela atualização periódica.
// =============================================================================
function canEditDevice(device) {
  if (isAdminWriter()) return true;
  return myRole() === "corp" && state.ctx.can_write && !!device.measurement_point_id;
}
async function loadSensors({ quiet = false } = {}) {
  const view = state.sensors;
  const run = ++view.request;
  const startedAt = Date.now();
  if (!quiet && !view.ids.length) $id("sensorGrid").innerHTML = '<div class="empty-state"><p>Carregando sensores…</p></div>';
  const onlineSince = new Date(startedAt + state.clockOffset - 25000).toISOString();
  const [page, online] = await Promise.all([
    callRpc("gaxeta_devices_page", {
      p_asset_id: state.assetId || null,
      p_search: view.search || null,
      p_unlinked: view.filter === "unassigned",
      p_limit: CONFIG.pageSize,
      p_offset: view.offset,
    }),
    // Contagem geral de quem está transmitindo, respeitando o escopo da conta (sem baixar linhas).
    sb.from("gaxeta_devices").select("sensor_id", { count: "exact", head: true }).gte("last_received_at", onlineSince),
  ]);
  if (run !== view.request || !state.authorized) return;
  setServerTime(page.server_time, startedAt);
  mergeDevices(page.items);
  view.ids = page.items.map((device) => device.sensor_id);
  view.total = page.total;
  if (!view.ids.length && view.offset > 0) {
    view.offset = Math.max(0, view.offset - CONFIG.pageSize);
    return loadSensors({ quiet });
  }
  await Promise.all([ensureAssets(page.items.map((device) => device.measurement_point_id)), loadTelemetrySummary(view.ids)]);
  if (run !== view.request) return;
  if (!state.assetId && !view.search && view.filter === "all") {
    // Com todos os sensores na página, a contagem usa a cadência de cada um (placa que
    // hiberna conta como transmitindo dentro do próprio intervalo). Acima disso, vale a
    // contagem do servidor para os últimos 25 s.
    const onlineNow = page.total <= page.items.length ? page.items.filter((device) => deviceStatus(device).online).length : online.count;
    $id("sensorCount").textContent = page.total;
    $id("onlineCount").textContent = onlineNow ?? "—";
    $id("offlineCount").textContent = onlineNow == null ? "—" : Math.max(0, page.total - onlineNow);
    view.allTotal = page.total;
    view.allOnPage = page.total <= page.items.length;
  } else if (online.count != null && view.allTotal != null && !view.allOnPage) {
    $id("onlineCount").textContent = online.count;
    $id("offlineCount").textContent = Math.max(0, view.allTotal - online.count);
  }
  renderSensorGrid();
  if (quiet) renderTree();
  renderIcons();
}
function renderSensorGrid() {
  const view = state.sensors;
  const grid = $id("sensorGrid");
  // Preserva o foco de teclado através do redesenho periódico.
  const focusCard = document.activeElement?.closest?.("[data-card]")?.dataset.card;
  const focusAct = document.activeElement?.dataset?.act;
  let devices = view.ids.map(findDevice).filter(Boolean);
  if (view.filter === "online") devices = devices.filter((device) => deviceStatus(device).online);
  if (view.filter === "offline") devices = devices.filter((device) => !deviceStatus(device).online);
  $id("scopeTitle").textContent = state.assetId ? assetPathLabel(state.assetId) || assetName(state.assetId) : view.filter === "unassigned" ? "Fila de associação" : "Todos os sensores";
  const first = view.total ? view.offset + 1 : 0;
  const last = Math.min(view.offset + CONFIG.pageSize, view.total);
  $id("visibleCount").textContent = view.total ? `${first}–${last} de ${view.total}` : "";
  grid.innerHTML =
    devices
      .map((device) => {
        const status = deviceStatus(device);
        // Um único número: a posição elétrica do potenciômetro (%), com a condição do sinal.
        const view = deviceView(device);
        // Identidade curta: TAG · tipo · spot. O caminho completo fica na dica e em Detalhes.
        const identity = deviceIdentity(device);
        const place = identity.linked ? `${identity.title} · ${identity.spot}` : "";
        // Tensão sempre com a origem: calibrada pelo ADC (firmware 4.3.0+) ou estimada.
        const volt = voltageInfo(device, deviceLive(device));
        const name = deviceLabel(device);
        // Sensor magnético: cartão próprio (curso restante ou ângulo; nunca tensão nem % do ADC).
        if (view.magnetic) return magCardHtml(device, view, status, identity, place, name);
        return (
          `<article class="sensor-card health-${view.key}" data-card="${esc(device.sensor_id)}">` +
          `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
          `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
          `<div class="card-main"><div class="card-value" title="Posição elétrica do potenciômetro: leitura atual, em % da ${esc(scaleText(view.electric.scale))}">${view.value}<small>${view.unit}</small></div>` +
          `<div class="card-side"><span class="card-kicker">Posição elétrica</span><span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small></div></div>` +
          `<div class="mini-scale${view.scale == null ? " idle" : ""}" role="img" aria-label="Posição elétrica: ${esc(view.value)} ${view.unit}"><i style="width:${view.scale ?? 0}%"></i></div>` +
          `<div class="card-meta"><span class="volt" title="${esc(volt.title)}">Tensão ${esc(volt.text)}${volt.short ? `<small>${esc(volt.short)}</small>` : ""}</span>` +
          `<span title="Linha estabilizada: só muda com variação de 5 pontos percentuais ou mais">Estável ${fmtNum(device.stable_percent)} %</span>` +
          `<span title="Última leitura recebida">${fmtDateTime(device.last_received_at)}</span></div>` +
          `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
          (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
          `</footer></article>`
        );
      })
      .join("") ||
    `<div class="empty-state"><h3>Nenhum sensor nesta seleção</h3><p>${
      view.filter === "online" || view.filter === "offline"
        ? "O filtro de conexão vale para os sensores desta página."
        : state.assetId
          ? "Este ramo ainda não tem sensor vinculado a um spot."
          : "Nenhum sensor disponível para a sua conta."
    }</p>${state.assetId || view.search || view.filter !== "all" ? '<button class="secondary compact" id="showAllSensors">Mostrar todos</button>' : ""}</div>`;
  $id("sensorPager").innerHTML =
    view.total > CONFIG.pageSize
      ? `<button class="secondary compact" data-page-move="-1"${view.offset ? "" : " disabled"}>Anterior</button><span>${first}–${last} de ${view.total}</span><button class="secondary compact" data-page-move="1"${last < view.total ? "" : " disabled"}>Próxima</button>`
      : "";
  if (focusCard) grid.querySelector(`[data-card="${CSS.escape(focusCard)}"] [data-act="${focusAct || "detail"}"]`)?.focus({ preventScroll: true });
}
$id("sensorGrid").onclick = (event) => {
  if (event.target.closest("#showAllSensors")) {
    state.assetId = "";
    state.sensors.search = $id("sensorSearch").value = "";
    state.sensors.filter = $id("statusFilter").value = "all";
    state.sensors.offset = 0;
    renderTree();
    loadSensors().catch((error) => showMessage(errorText(error), "error"));
    return;
  }
  const button = event.target.closest("[data-act]");
  const sensorId = event.target.closest("[data-card]")?.dataset.card;
  if (!button || !sensorId) return;
  if (button.dataset.act === "history") openHistoryFor(sensorId);
  else openDrawer(sensorId, button.dataset.act, button);
};
$id("sensorPager").onclick = (event) => {
  const move = event.target.closest("[data-page-move]");
  if (!move) return;
  state.sensors.offset = Math.max(0, state.sensors.offset + Number(move.dataset.pageMove) * CONFIG.pageSize);
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
};
$id("sensorSearch").oninput = debounce(() => {
  state.sensors.search = $id("sensorSearch").value.trim();
  state.sensors.offset = 0;
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
}, 350);
$id("statusFilter").onchange = () => {
  state.sensors.filter = $id("statusFilter").value;
  state.sensors.offset = 0;
  loadSensors().catch((error) => showMessage(errorText(error), "error"));
};

// ----- Seletor de localização em cascata (lê cada nível sob demanda) -----
const PICK_LEVELS = ["corporation", "company", "area", "subarea", "equipment", "point"];
const PICK_PLACEHOLDER = {
  corporation: "Selecione a corporação",
  company: "Selecione a empresa",
  area: "Selecione a área",
  subarea: "Sem subárea · TAGs da área",
  equipment: "Selecione o TAG",
  point: "Selecione o spot",
};
function pickParent(level, values) {
  if (level === "corporation") return null;
  if (level === "company") return values.corporation;
  if (level === "area") return values.company;
  if (level === "subarea") return values.area;
  if (level === "equipment") return values.subarea || values.area;
  return values.equipment;
}
async function refillPicker(prefix, fromIndex, values, levels = PICK_LEVELS) {
  for (let index = fromIndex; index < levels.length; index++) {
    const level = levels[index];
    const select = $id(prefix + level);
    const parent = pickParent(level, values);
    let options = [];
    if (level === "corporation" || parent) {
      const entry = await loadKids(parent);
      options = entry.ids.map((id) => assetIndex.get(id)).filter((asset) => asset && asset.kind === level);
      // O item atual pode estar além da primeira página do ramo: mantém-no selecionável.
      if (values[level] && !options.some((asset) => asset.id === values[level]) && assetIndex.get(values[level])?.parent_id === (parent || null))
        options.push(assetIndex.get(values[level]));
    }
    fillSelect(
      select,
      options.map((asset) => ({ value: asset.id, label: assetLabel(asset) })),
      // Área sem subáreas: a opção vazia continua sendo o caminho normal (TAG direto na área).
      level === "subarea" && parent && !options.length ? "Sem subárea" : PICK_PLACEHOLDER[level],
      values[level] || "",
    );
    values[level] = select.value;
    select.disabled = level !== "corporation" && !parent;
  }
}

// Depois de salvar, vincular ou desvincular: a tela em uso relê o que depende do vínculo.
async function afterSensorChange() {
  if (state.page === "sensors") await loadSensors({ quiet: true });
  else if (state.page === "assets") {
    renderTree();
    await renderInspector();
  } else if (state.page === "telemetry") {
    renderHistorySelect();
    renderTelemetryLive();
  }
  renderIcons();
}

// ----- Painel lateral -----
function openDrawer(sensorId, mode = "detail", opener = null) {
  const device = findDevice(sensorId);
  if (!device) return;
  if (mode === "edit" && !canEditDevice(device)) mode = "detail";
  Object.assign(state.drawer, { open: true, mode, sensorId, opener: opener || state.drawer.opener });
  $id("detailPane").hidden = false;
  $id("scrim").hidden = false;
  document.body.classList.add("drawer-open");
  renderDrawer().catch((error) => showMessage(errorText(error), "error"));
}
function closeDrawer(restoreFocus = true) {
  const opener = state.drawer.opener;
  Object.assign(state.drawer, { open: false, sensorId: "", opener: null });
  $id("detailPane").hidden = true;
  $id("scrim").hidden = true;
  document.body.classList.remove("drawer-open");
  if (restoreFocus) {
    const card = opener?.closest?.("[data-card]")?.dataset.card;
    (card ? $id("sensorGrid").querySelector(`[data-card="${CSS.escape(card)}"] [data-act="${opener.dataset.act}"]`) : opener)?.focus?.();
  }
}
$id("scrim").onclick = () => closeDrawer();
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.drawer.open && !document.querySelector("dialog[open]")) closeDrawer();
});
function updateDrawerLive() {
  if (!state.drawer.open || !$id("detailStatus")) return;
  const device = findDevice(state.drawer.sensorId);
  if (!device) return;
  const status = deviceStatus(device);
  const live = deviceLive(device);
  const view = deviceView(device);
  // A placa trocou de modalidade com o painel aberto: redesenha o painel inteiro.
  if ($id("detailLive") && ($id("detailLive").dataset.mode === "mag") !== !!view.magnetic) return void renderDrawer().catch(() => {});
  if (view.magnetic) return updateDrawerLiveMag(device, view, status);
  const electric = view.electric;
  const volt = voltageInfo(device, live);
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${esc(status.label)} · ${fmtDateTime(device.last_received_at)}`;
  // Bloco fixo, igual para sensor com ou sem vínculo: posição elétrica e tensão da mesma leitura,
  // a linha estabilizada (5 p.p.) e a condição do sinal.
  const tile = (id, value, note) => ($id(id).innerHTML = `${esc(value)}<small>${esc(note)}</small>`);
  tile("detailElectric", electric.text, electric.label || "leitura atual");
  tile("detailVolt", volt.text, volt.source || "sem leitura");
  $id("detailVolt").title = volt.title;
  tile("detailStableLine", device.stable_percent == null ? "—" : fmtNum(device.stable_percent) + " %", "muda com 5 p.p. ou mais");
  tile("detailSignal", view.label, BLOCK_SHORT[electric.block] && electric.block !== "ok" ? BLOCK_SHORT[electric.block] : "bloco de amostras bom");
  const delta = rawDeltaText(device);
  const cadence = firmwareCadence(device.firmware_version);
  $id("detailReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` +
    (delta ? ` · variação desde o envio anterior: ${delta}` : "") +
    (cadence ? ` · ${cadence.text}` : "");
  $id("detailHealth").textContent = view.label + " · " + view.note;
  $id("detailHealth").className = "health-banner health-" + view.key;
  if ($id("detailDiag")) {
    const block = device.last_adc_min != null && device.last_adc_max != null ? ` (bloco de ${fmtNum(device.last_adc_min, 0)} a ${fmtNum(device.last_adc_max, 0)})` : "";
    const measured = Number(live?.interval_s);
    const rows = [
      ["Posição elétrica (leitura atual)", electric.text + (electric.label ? " · " + electric.label : "")],
      ["Escala do percentual", scaleText(electric.scale)],
      ["Posição elétrica (linha estabilizada)", `${fmtNum(device.stable_percent)} % · muda só com variação de 5 p.p. ou mais` + (device.stable_since ? ` · desde ${fmtDateTime(device.stable_since)}` : "")],
      ["Variação desde o envio anterior", delta || "aguardando o próximo envio"],
      ["Tensão calibrada", device.last_voltage_mv != null ? fmtVolt(device.last_voltage_mv) : "não enviada por este firmware"],
      ["Tensão estimada", device.last_voltage_v != null ? fmtNum(device.last_voltage_v, 3) + " V (ADC × 3,3 ÷ 4095)" : "—"],
      ["ADC bruto", device.last_adc_raw != null || live?.adc != null ? fmtNum(device.last_adc_raw ?? live.adc, 1) + " contagens" + block : "—"],
      ["Dispersão do bloco", device.adc_noise != null ? fmtNum(device.adc_noise, 1) + " contagens" : "—"],
      ["Condição do bloco", BLOCK_TEXT[electric.block] || "—"],
      ...(BLOCK_HINT[electric.block] ? [["O que os dados indicam", BLOCK_HINT[electric.block]]] : []),
      ["Cadência", [cadence ? "declarada pelo firmware: " + cadence.text : "", Number.isFinite(measured) && measured > 0 ? "medida nos últimos envios: " + fmtInterval(measured) : ""].filter(Boolean).join(" · ") || "—"],
      ["Método de aquisição", device.last_acq_method || "anterior ao 4.3.0"],
      ["Amostra colhida", fmtDateTime(device.last_sampled_at)],
      ["Recebida no servidor", fmtDateTime(device.last_received_at)],
    ];
    $id("detailDiag").innerHTML = rows.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("");
  }
  if ($id("detailSequence")) $id("detailSequence").textContent = device.last_sequence ?? "—";
  if ($id("detailRssi")) $id("detailRssi").textContent = `${device.last_rssi ?? "—"} dBm`;
}
async function renderDrawer() {
  const { sensorId, mode } = state.drawer;
  const device = findDevice(sensorId);
  if (!device) return closeDrawer(false);
  await ensureAssets([device.measurement_point_id]);
  if (state.drawer.sensorId !== sensorId) return;
  const pane = $id("detailPane");
  const point = assetIndex.get(device.measurement_point_id);
  const path = assetPathLabel(device.measurement_point_id);
  const identity = deviceIdentity(device);
  const head =
    `<div class="drawer-head"><div><small>${mode === "edit" ? "Editar sensor" : "Sensor"}${identity.linked ? " · " + esc(identity.title) : ""}</small><h2>${esc(deviceLabel(device))}</h2></div>` +
    `<button id="drawerClose" class="icon-button" aria-label="Fechar painel">×</button></div>` +
    `<div class="drawer-body"><div class="live-line" id="detailStatus"></div>` +
    (isMagnetic(device, deviceLive(device))
      ? `<div class="drawer-values four" id="detailLive" data-mode="mag"><div><span>Curso de ajuste restante</span><strong id="detailElectric" class="volt-value"></strong></div><div><span>Avanço desde engaxetamento</span><strong id="detailVolt" class="volt-value"></strong></div><div><span>Ângulo do sensor</span><strong id="detailStableLine" class="volt-value"></strong></div><div><span>Sinal</span><strong id="detailSignal" class="volt-value"></strong></div></div>`
      : `<div class="drawer-values four" id="detailLive" data-mode="adc"><div><span>Posição elétrica (%)</span><strong id="detailElectric" class="volt-value"></strong></div><div><span>Tensão (V)</span><strong id="detailVolt" class="volt-value"></strong></div><div><span>Linha estabilizada (%)</span><strong id="detailStableLine" class="volt-value"></strong></div><div><span>Sinal</span><strong id="detailSignal" class="volt-value"></strong></div></div>`) +
    `<p id="detailReading" class="live-reading"></p>` +
    `<div id="detailHealth" class="health-banner"></div>` +
    `<p class="drawer-path">${icon("map-pin")}${esc(path || "Sem vínculo com spot (fila de associação)")}</p>`;
  if (mode === "edit") {
    pane.innerHTML =
      head +
      `<form id="sensorForm" novalidate><label>Nome do sensor na plataforma<input id="sensorName" required minlength="3" maxlength="24" value="${esc(deviceLabel(device))}" autocomplete="off"></label>` +
      `<fieldset class="location-selects"><legend>Spot de instalação</legend>` +
      PICK_LEVELS.map((level) => `<label>${level === "subarea" ? "Subárea (opcional)" : KIND_LABEL[level]}<select id="pick-${level}"></select></label>`).join("") +
      `</fieldset><label>Gateway (opcional)<select id="sensorGateway"></select></label>` +
      `<p id="sensorFormMessage" class="form-message" role="status"></p>` +
      `<div class="drawer-actions"><button class="primary" type="submit">Salvar</button><button class="secondary" type="button" id="drawerCancel">Cancelar</button></div>` +
      (isAdminWriter() && device.measurement_point_id ? `<button type="button" id="unlinkSensor" class="text-button danger-text">Desvincular do spot (volta à fila)</button>` : "") +
      `</form></div>`;
    const values = Object.fromEntries(PICK_LEVELS.map((level) => [level, ""]));
    for (const asset of assetPath(device.measurement_point_id, state.assets)) values[asset.kind] = asset.id;
    const fillGateways = async (keep) => {
      const rows = values.company ? await unwrap(sb.from("gaxeta_gateways").select("id,name,identifier").eq("company_id", values.company).order("name").limit(200)) : [];
      fillSelect($id("sensorGateway"), rows.map((row) => ({ value: row.id, label: `${row.name} · ${row.identifier}` })), values.company ? "Sem gateway" : "Escolha a empresa primeiro", keep || "");
    };
    await refillPicker("pick-", 0, values);
    await fillGateways(device.gateway_id);
    PICK_LEVELS.forEach((level, index) => {
      $id("pick-" + level).onchange = () =>
        withBusy(null, async () => {
          values[level] = $id("pick-" + level).value;
          for (const lower of PICK_LEVELS.slice(index + 1)) values[lower] = "";
          await refillPicker("pick-", index + 1, values);
          if (index <= 1) await fillGateways("");
        });
    });
    $id("drawerCancel").onclick = () => openDrawer(sensorId, "detail");
    $id("sensorForm").onsubmit = async (event) => {
      event.preventDefault();
      const name = $id("sensorName").value.trim();
      const message = $id("sensorFormMessage");
      if (!isValidSensorName(name)) return void (message.textContent = "Nome: 3 a 24 caracteres, letras sem acento, números, espaço, ponto, hífen ou sublinhado.");
      if (!values.point && !isAdminWriter()) return void (message.textContent = "Selecione o spot de instalação.");
      message.textContent = "Salvando…";
      await withBusy(event.submitter, async () => {
        try {
          const saved = await callRpc("gaxeta_configure_sensor", { p_sensor_id: sensorId, p_label: name, p_point_id: values.point || null, p_gateway_id: $id("sensorGateway").value || null });
          mergeDevices([saved]);
          await ensureAssets([saved.measurement_point_id]);
          showMessage(`Sensor ${name} salvo${saved.measurement_point_id ? " em " + assetPathLabel(saved.measurement_point_id) : ", sem vínculo"}.`, "success");
          openDrawer(sensorId, "detail");
          await afterSensorChange();
        } catch (error) {
          message.textContent = errorText(error);
        }
      });
    };
    if ($id("unlinkSensor"))
      $id("unlinkSensor").onclick = async (event) => {
        if (!(await askConfirm({ title: "Desvincular sensor", html: `<p>O sensor <b>${esc(deviceLabel(device))}</b> sai de <b>${esc(path)}</b> e volta à fila de associação. As leituras continuam chegando e o histórico é preservado.</p>`, okLabel: "Desvincular" }))) return;
        await withBusy(event.target, async () => {
          const saved = await callRpc("gaxeta_unlink_sensor", { p_sensor_id: sensorId, p_reason: "desvínculo pela interface" });
          mergeDevices([saved]);
          showMessage("Sensor desvinculado. Ele está na fila de associação.", "success");
          openDrawer(sensorId, "detail");
          await afterSensorChange();
        });
      };
  } else {
    const gateway = device.gateway_id ? (await unwrap(sb.from("gaxeta_gateways").select("name,identifier").eq("id", device.gateway_id).limit(1)))[0] : null;
    if (state.drawer.sensorId !== sensorId) return;
    const fields = [
      ["ID", device.sensor_id],
      ["MAC Wi-Fi", device.wifi_mac || "—"],
      ["MAC BLE", device.ble_mac || "—"],
      ["TAG", identity.linked ? identity.title : "—"],
      ["Spot", point ? point.name + (point.position ? " · " + point.position : "") : "Sem vínculo"],
      ["Transporte", "Wi-Fi direto"],
      ["Gateway", gateway ? `${gateway.name} · cadastrado` : "Sem gateway"],
      ["Firmware", device.firmware_version || "Anterior à v4"],
      ["Nome na placa", device.applied_label || "não informado"],
    ];
    pane.innerHTML =
      head +
      `<div class="drawer-actions"><button class="primary" id="detailHistory">Ver histórico</button>` +
      (canEditDevice(device) ? `<button class="secondary" id="detailEdit">Editar nome e spot</button>` : "") +
      `</div>` +
      (isMagnetic(device, deviceLive(device)) ? magServiceSection() : "") +
      `<dl class="detail-fields">${fields.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("")}` +
      `<dt>Sequência</dt><dd id="detailSequence"></dd><dt>Sinal Wi-Fi</dt><dd id="detailRssi"></dd></dl>` +
      (isMagnetic(device, deviceLive(device)) ? magDrawerSections() :
      // Dados elétricos da leitura atual: servem para diagnosticar ligação, ruído e saturação.
      `<details class="technical-detail"><summary>Leitura elétrica (diagnóstico)</summary><p class="form-help">A posição elétrica é a leitura do potenciômetro em % da escala elétrica da placa: 0 % no mínimo e 100 % no máximo. A tensão é a do pino do ADC. Os avisos de limite indicam saturação do ADC; bloco instável ou misto indica cursor solto, falta de potenciômetro ou giro durante a leitura.</p><dl class="detail-fields" id="detailDiag"></dl></details>`) +
      // Gravar o nome na placa é um comando local por Bluetooth: só existe no aplicativo nativo.
      (canEditDevice(device) && bleAvailable()
        ? `<details class="technical-detail"><summary>Nome anunciado por Bluetooth (opcional)</summary><p class="form-help">O nome da plataforma não depende do Bluetooth. Para gravar o nome na placa, conecte o sensor pelo Bluetooth e use o PIN de 6 dígitos. Nada é enviado à placa sem esta ação.</p><button id="applyBleName" class="secondary compact">Gravar nome na placa</button></details>`
        : "") +
      (isMagnetic(device, deviceLive(device))
        ? `<small class="drawer-note">Sensor magnético AS5600: mede o ângulo absoluto do ímã (medido). O avanço e o curso de ajuste restante são calculados a partir do engaxetamento registrado e da geometria da montagem. O curso restante não indica força de aperto, pressão, qualidade de vedação nem vida útil da gaxeta.</small></div>`
        : `<small class="drawer-note">Sensor: potenciômetro rotativo de uma volta. A plataforma mostra a posição elétrica (%) e a tensão (V) da leitura atual, com ou sem vínculo a spot. A tensão traz a origem: calibrada pelo ADC da placa ou estimada. O histórico de mudanças registra variações de 5 pontos percentuais ou mais.</small></div>`);
    if (isMagnetic(device, deviceLive(device))) bindMagDrawer(sensorId);
    $id("detailHistory").onclick = () => {
      closeDrawer(false);
      openHistoryFor(sensorId);
    };
    if ($id("detailEdit")) $id("detailEdit").onclick = () => openDrawer(sensorId, "edit");
    if ($id("applyBleName"))
      $id("applyBleName").onclick = (event) =>
        withBusy(event.currentTarget, async () => {
          if (!bleCurrent() || state.bleReading?.sensor_id !== sensorId) {
            openBleDialog();
            $id("bleStatus").textContent = "Conecte o sensor com ID " + sensorId + " para gravar o nome.";
            return;
          }
          if (!device.desired_label) throw Error("Salve primeiro o nome do sensor na plataforma.");
          const written = await bleWriteName(device.desired_label, device.sensor_id, state.bleReading?.sensor_id);
          showMessage(`Nome “${written}” gravado e lido na placa. A confirmação na nuvem aparece na próxima transmissão.`, "success");
        });
  }
  $id("drawerClose").onclick = () => closeDrawer();
  updateDrawerLive();
  renderIcons();
  (mode === "edit" ? $id("sensorName") : $id("drawerClose")).focus({ preventScroll: true });
}
