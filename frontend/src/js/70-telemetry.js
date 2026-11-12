// =============================================================================
// Telemetria.
//   * Identidade primeiro: TAG · tipo de equipamento, depois sensor e spot.
//   * Um único contexto (sensor + período) alimenta gráfico, métricas, mudanças e
//     CSV: o que está em tela é sempre de `telem.loaded`.
//   * Leitura atual (leve, a cada ciclo) separada da consulta de histórico (pesada,
//     só quando o período pede). Uma solicitação por combinação; respostas e erros
//     de pedidos substituídos são descartados e a requisição é cancelada.
//   * Linha estabilizada em degraus, colorida pela condição de cada trecho.
// O cálculo, os limites da consulta e o formato dos CSV não mudaram.
// =============================================================================
const telem = {
  matchIds: null, // resultado da busca do seletor (null = sem filtro)
  listed: false, // o seletor já recebeu a lista de sensores da conta nesta sessão
  searchRun: 0,
  period: 36e5, // preset escolhido (ms, "month" ou "3months")
  custom: false, // true = intervalo fixo (manual ou ampliado)
  range: presetRange(36e5),
  request: 0,
  controller: null,
  pending: null, // { key, label, auto }
  loaded: null, // { sensorId, range, label, history, movements, seed, stats, truncated, bucketSeconds }
  error: "",
  zoomStack: [], // seleções anteriores, para "Voltar" restaurar inclusive um intervalo manual
  lastLoadAt: 0,
};
const PERIOD_LABELS = { 300000: "5 min", 3600000: "1 hora", 21600000: "6 horas", 86400000: "1 dia", 604800000: "7 dias", month: "1 mês", "3months": "3 meses" };
const selectionLabel = () => (telem.custom ? "intervalo personalizado" : PERIOD_LABELS[telem.period] || "período");
const shortDateTime = (value) => new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function resetTelemetryData() {
  telem.controller?.abort();
  telem.request++;
  Object.assign(telem, { controller: null, pending: null, loaded: null, error: "", zoomStack: [], lastLoadAt: 0 });
}

// ----- Seletor de sensor -----
// Opção curta: "TAG · tipo · spot". Só quando duas opções coincidem entram, nesta ordem,
// empresa/área, nome do sensor e identificador.
function sensorOptions(devices) {
  const entries = devices.map((device) => {
    const identity = deviceIdentity(device);
    return { device, identity, label: identity.linked ? [identity.tag, identity.type, identity.spot].filter(Boolean).join(" · ") : `${identity.sensor} · sem vínculo` };
  });
  for (const extra of [(entry) => entry.identity.context, (entry) => (entry.identity.linked ? "sensor " + entry.identity.sensor : ""), (entry) => entry.device.sensor_id]) {
    const seen = new Map();
    for (const entry of entries) seen.set(entry.label, (seen.get(entry.label) || 0) + 1);
    for (const entry of entries) if (seen.get(entry.label) > 1 && extra(entry)) entry.label += " — " + extra(entry);
  }
  return entries.sort((left, right) => left.label.localeCompare(right.label, "pt-BR", { numeric: true }));
}
function renderHistorySelect() {
  const known = telem.matchIds ? telem.matchIds.map(findDevice).filter(Boolean) : state.devices.filter((device) => device.origin !== "integration_test");
  const current = currentDevice();
  if (current && !known.includes(current)) known.unshift(current);
  fillSelect(
    $id("historySensor"),
    sensorOptions(known.slice(0, 100)).map((entry) => ({ value: entry.device.sensor_id, label: entry.label })),
    known.length ? null : telem.matchIds ? "Nenhum sensor encontrado" : "Nenhum sensor",
    state.sensorId,
  );
}
// Busca no servidor por TAG, nome do sensor, ID ou MAC, dentro do que a conta pode ver.
async function searchHistorySensors() {
  const run = ++telem.searchRun;
  const query = $id("historySearch").value.trim();
  const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: query || null, p_unlinked: false, p_limit: 50, p_offset: 0 });
  if (run !== telem.searchRun) return;
  mergeDevices(result.items);
  await ensureAssets(result.items.map((device) => device.measurement_point_id));
  if (run !== telem.searchRun) return;
  telem.matchIds = query ? result.items.map((device) => device.sensor_id) : null;
  if (!query) telem.listed = true;
  renderHistorySelect();
}
$id("historySearch").oninput = debounce(() => searchHistorySensors().catch((error) => showMessage(errorText(error), "error")), 350);

// Histórico aberto a partir de Sensores, TAG ou Spot: o sensor exato escolhido fica selecionado.
function openHistoryFor(sensorId) {
  if (!sensorId) return;
  if (state.sensorId !== sensorId) {
    state.sensorId = sensorId;
    resetTelemetryData();
  }
  telem.matchIds = null;
  telem.searchRun++;
  $id("historySearch").value = "";
  if (state.page === "telemetry") openTelemetry().catch((error) => showMessage(errorText(error), "error"));
  else showPage("telemetry");
}
async function openTelemetry() {
  renderTelemetryLive();
  renderHistory();
  if (state.sensorId && !currentDevice()) await refreshKnownDevices();
  if (!currentDevice()) {
    await searchHistorySensors();
    if (!currentDevice()) {
      state.sensorId = state.devices.find((device) => device.origin !== "integration_test")?.sensor_id || "";
      resetTelemetryData();
    }
  } else if (!telem.listed && !telem.matchIds) {
    // Entrou direto com um sensor escolhido: preenche o seletor em segundo plano.
    searchHistorySensors().catch(() => {});
  }
  await ensureAssets([currentDevice()?.measurement_point_id]);
  if (state.page !== "telemetry") return;
  renderHistorySelect();
  renderTelemetryLive();
  await loadHistory();
}
$id("historySensor").onchange = () => {
  state.sensorId = $id("historySensor").value;
  // Troca de sensor: os dados do anterior saem da tela na hora, antes da resposta nova.
  resetTelemetryData();
  renderTelemetryLive();
  renderHistory();
  ensureAssets([currentDevice()?.measurement_point_id])
    .then(() => {
      renderHistorySelect();
      renderTelemetryLive();
    })
    .catch(() => {});
  loadHistory();
};

// ----- Consulta do histórico -----
function toLocalInput(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}
function historyErrorText(error) {
  if (isNetworkError(error)) return "Sem resposta do servidor. A leitura atual e o histórico serão tentados de novo.";
  if (error?.code === "57014") return "A consulta deste período demorou demais. Reduza o período e tente de novo.";
  if (error?.code === "42501") return "Sua conta não tem acesso ao histórico deste sensor.";
  return "Não foi possível carregar o histórico: " + errorText(error);
}
// Uma solicitação por combinação de sensor e período. `auto` = atualização periódica de um preset.
async function loadHistory({ auto = false } = {}) {
  const sensorId = state.sensorId;
  if (!sensorId) {
    resetTelemetryData();
    renderHistory();
    return;
  }
  // A atualização automática nunca compete com um pedido de quem está usando.
  if (auto && telem.pending) return;
  // Preset = janela móvel, calculada só quando há carga. Intervalo manual ou ampliado = fixo.
  const range = telem.custom ? { from: telem.range.from, to: telem.range.to } : presetRange(telem.period, new Date(Date.now() + state.clockOffset));
  const key = sensorId + "|" + (telem.custom ? range.from.toISOString() + "|" + range.to.toISOString() : "preset:" + telem.period);
  if (!auto && telem.pending && !telem.pending.auto && telem.pending.key === key) return; // mesmo pedido já em andamento
  telem.controller?.abort();
  const controller = new AbortController();
  const token = ++telem.request;
  const label = selectionLabel();
  Object.assign(telem, { controller, pending: { key, label, auto }, error: auto ? telem.error : "" });
  renderHistoryState();
  try {
    // Fuso local só na tela: a consulta vai em ISO UTC, com os limites e a inclusividade da RPC.
    const data = await unwrap(sb.rpc("gaxeta_history", { p_sensor_id: sensorId, p_from: range.from.toISOString(), p_to: range.to.toISOString() }).abortSignal(controller.signal));
    if (token !== telem.request || sensorId !== state.sensorId || !state.authorized) return;
    telem.loaded = {
      sensorId,
      range,
      label,
      custom: telem.custom,
      history: data.history || [],
      movements: data.movements || [],
      seed: data.seed || null,
      stats: data.stats || {},
      truncated: !!data.movements_truncated,
      bucketSeconds: data.bucket_seconds,
    };
    telem.error = "";
    telem.lastLoadAt = Date.now();
  } catch (error) {
    if (token !== telem.request) return; // pedido substituído: o erro dele não interessa mais
    telem.error = historyErrorText(error);
    telem.lastLoadAt = Date.now();
    if (error?.code === "42501") checkContext().catch(() => {});
    // Erro da consulta de histórico não é "sem conexão": só falha de transporte muda o indicador global.
    if (isNetworkError(error)) setConnection(false);
  } finally {
    if (token === telem.request) {
      telem.pending = null;
      telem.controller = null;
      renderHistory();
    }
  }
}
// Ritmo da atualização automática conforme a janela: períodos longos não são refeitos a cada ciclo.
function autoIntervalMs() {
  const span = typeof telem.period === "number" || /^\d+$/.test(telem.period) ? Number(telem.period) : Infinity;
  if (span <= 3e5) return CONFIG.pollMs;
  if (span <= 36e5) return 15e3;
  if (span <= 216e5) return 6e4;
  if (span <= 864e5) return 12e4;
  if (span <= 6048e5) return 3e5;
  return 6e5;
}
function refreshHistoryIfDue() {
  if (state.page !== "telemetry" || !state.sensorId || telem.custom || telem.pending) return;
  if (Date.now() - telem.lastLoadAt < autoIntervalMs()) return;
  loadHistory({ auto: true });
}

// ----- Desenho -----
// Linha estabilizada em degraus, um trecho por referência em vigor: começa na semente
// autorizada (referência anterior ao período) ou na primeira mudança, troca de valor no
// instante da mudança e termina na última leitura elegível, nunca além dela.
// Cada patamar leva a cor da condição do valor que esteve em vigor ali. O degrau vertical
// (o instante da mudança) é neutro: não representa um valor mantido.
function buildStableSegments(movements, seed, fromValue, toValue, lastValue) {
  const from = +new Date(fromValue);
  const to = +new Date(toValue);
  const end = Math.min(to, +new Date(lastValue));
  const levels = [];
  let risers = "";
  if (!(to > from) || !(end >= from)) return { levels, risers };
  const px = (time) => Math.max(0, Math.min(1e3, ((time - from) / (to - from)) * 1e3)).toFixed(2);
  const py = (percent) => (280 - Math.max(0, Math.min(100, Number(percent))) * 2.8).toFixed(2);
  let value = seed?.stable_percent ?? null;
  let startX = value == null ? null : px(from);
  const close = (endX) => {
    // A condição é classificada com o valor gravado, sem arredondar.
    if (value != null && endX !== startX) levels.push({ key: adjustmentInfo(value).key, d: `M${startX} ${py(value)}H${endX}` });
  };
  for (const move of movements) {
    const time = +new Date(move.received_at);
    if (time < from || time > end) continue;
    const at = px(time);
    close(at);
    if (value != null) risers += `M${at} ${py(value)}V${py(move.stable_percent)}`;
    value = move.stable_percent;
    startX = at;
  }
  close(px(end));
  return { levels, risers };
}
// Leitura atual do sensor selecionado (barata; roda a cada ciclo sem refazer o histórico).
function renderTelemetryLive() {
  const device = currentDevice();
  const identity = deviceIdentity(device);
  const health = adjustmentInfo(device?.stable_percent);
  $id("historyTitle").textContent = device ? identity.title : "Telemetria";
  $id("historyTitle").title = identity.path || "";
  $id("historyContext").textContent = !device
    ? "Nenhum sensor selecionado."
    : identity.linked
      ? `Sensor: ${identity.sensor} · Spot: ${identity.spot}`
      : `Sensor sem vínculo com spot (fila de associação) · ${deviceStatus(device).label}`;
  $id("historyContext").title = identity.path || "";
  $id("historyCurrent").textContent = `${fmtNum(device?.stable_percent)} %`;
  $id("historyHealthBox").className = "summary-main health-" + health.key;
  $id("historyHealth").textContent = health.label;
  $id("historyAction").textContent = health.action;
  $id("historyRawNow").textContent = `${fmtNum(device?.last_percent)} %`;
  $id("historySince").textContent = device?.stable_since ? "Referência desde " + fmtDateTime(device.stable_since) : "";
  $id("historyEdit").disabled = !device;
}
// O que está em tela e o que está sendo carregado, sempre explícito.
function renderHistoryState() {
  const { loaded, pending, error } = telem;
  const userLoading = !!pending && !pending.auto;
  const shown = loaded ? `Em tela: ${loaded.label} · ${shortDateTime(loaded.range.from)} a ${shortDateTime(loaded.range.to)}` : "";
  $id("historyShown").textContent = userLoading
    ? (shown ? shown + " · " : "") + `carregando ${pending.label}…`
    : error
      ? (shown ? shown + " · " : "") + error
      : shown;
  $id("historyShown").classList.toggle("is-error", !userLoading && !!error);
  document.querySelector(".chart-panel").classList.toggle("is-loading", userLoading);
  // Enquanto outro intervalo carrega, os CSV ficam desabilitados: exportam sempre o que está em tela.
  $id("exportCsv").disabled = userLoading || !loaded?.history.length;
  $id("exportMovements").disabled = userLoading || !loaded?.movements.length || !!loaded?.truncated;
  $id("resetZoom").hidden = !telem.zoomStack.length;
  document.querySelectorAll("[data-range]").forEach((button) => button.classList.toggle("selected", !telem.custom && String(telem.period) === button.dataset.range));
  $id("customToggle").classList.toggle("selected", telem.custom);
  if (telem.custom) {
    $id("customRange").hidden = false;
    $id("customToggle").setAttribute("aria-expanded", "true");
  }
  const range = loaded?.range || (telem.custom ? telem.range : null);
  if (range && !$id("customRange").contains(document.activeElement)) {
    $id("fromTime").value = toLocalInput(range.from);
    $id("toTime").value = toLocalInput(range.to);
  }
}
function renderHistory() {
  renderTelemetryLive();
  renderHistoryState();
  const loaded = telem.loaded;
  const rows = loaded?.history || [];
  const movements = loaded?.movements || [];
  const stats = loaded?.stats || {};
  const range = loaded?.range || null;
  $id("historyMin").textContent = `${fmtNum(stats.min)} %`;
  $id("historyMax").textContent = `${fmtNum(stats.max)} %`;
  $id("historyCount").textContent = loaded ? fmtNum(stats.count || 0, 0) : "—";
  $id("chartEmpty").hidden = rows.length > 0;
  $id("chartEmpty").textContent = !state.sensorId
    ? "Selecione um sensor."
    : telem.pending && !loaded
      ? "Carregando…"
      : telem.error && !loaded
        ? telem.error
        : "Nenhuma leitura neste período.";
  $id("chartFrom").textContent = range ? fmtDateTime(range.from) : "—";
  $id("chartTo").textContent = range ? fmtDateTime(range.to) : "—";
  $id("aggregationNote").textContent = !loaded
    ? ""
    : loaded.truncated
      ? "Muitas mudanças neste intervalo. Reduza o período para exibir a linha completa."
      : "Linha: mudanças de 5 p.p. ou mais · faixa bruta: mín./máx. · médias de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s";
  $id("movementCount").textContent = !loaded
    ? ""
    : loaded.truncated
      ? "Mais de 5.000 registros — reduza o período"
      : movements.filter((move) => move.previous_percent != null).length + " mudanças no período";
  $id("movementRows").innerHTML =
    movements
      .slice(-30)
      .reverse()
      .map((move) => {
        const health = adjustmentInfo(move.stable_percent);
        return `<tr><td>${fmtDateTime(move.received_at)}</td><td>${move.previous_percent == null ? "Referência inicial" : fmtNum(move.previous_percent) + " %"}</td><td>${fmtNum(move.stable_percent)} %</td><td>${move.previous_percent == null ? "—" : fmtNum(move.stable_percent - move.previous_percent) + " p.p."}</td><td><span class="adjustment-badge health-${health.key}">${health.label}</span></td></tr>`;
      })
      .join("") ||
    `<tr><td colspan="5">${loaded ? "Nenhuma mudança de 5 pontos neste período. A referência anterior é mantida enquanto chegam novas leituras." : telem.error || "Aguardando o histórico…"}</td></tr>`;
  const point = (row, field) => {
    const x = Math.max(0, Math.min(1e3, ((new Date(row.received_at) - range.from) / (range.to - range.from)) * 1e3));
    const y = 280 - Math.max(0, Math.min(100, Number(row[field]))) * 2.8;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  // Trechos agrupados por condição: no máximo quatro traços, um por cor.
  const byHealth = new Map();
  let risers = "";
  if (loaded && !loaded.truncated) {
    const stable = buildStableSegments(movements, loaded.seed, range.from, range.to, stats.last_received_at || rows.at(-1)?.received_at);
    risers = stable.risers;
    for (const level of stable.levels) byHealth.set(level.key, (byHealth.get(level.key) || "") + level.d);
  }
  const band = rows.length
    ? rows.map((row, index) => `${index ? "L" : "M"}${point(row, "min_percent")}`).join(" ") +
      [...rows]
        .reverse()
        .map((row) => `L${point(row, "max_percent")}`)
        .join(" ") +
      " Z"
    : "";
  $id("historyChart").innerHTML = rows.length
    ? `<path class="chart-band" d="${$id("showRawBand").checked ? band : ""}"/>` +
      `<path class="chart-riser" d="${risers}"/>` +
      [...byHealth].map(([key, d]) => `<path class="chart-line health-${key}" d="${d}"/>`).join("") +
      (rows.length === 1 && byHealth.size
        ? `<circle class="chart-dot health-${adjustmentInfo(rows[0].stable_percent).key}" cx="${point(rows[0], "travel_percent").split(" ")[0]}" cy="${point(rows[0], "stable_percent").split(" ")[1]}" r="4"/>`
        : "")
    : "";
  $id("historyChart").setAttribute(
    "aria-label",
    `${rows.length} intervalos. ${fmtNum(stats.count || 0, 0)} leituras. Mínimo ${fmtNum(stats.min)}%, máximo ${fmtNum(stats.max)}%. Linha colorida pela condição do ajuste. Arraste para ampliar.`,
  );
  $id("historyRows").innerHTML =
    rows
      .slice(-30)
      .reverse()
      .map(
        (row) =>
          `<tr><td>${fmtDateTime(row.received_at)}</td><td>${fmtNum(row.stable_percent)} %<small class="raw-average">Bruta: ${fmtNum(row.travel_percent)}%</small></td><td>${fmtNum(row.min_percent)} / ${fmtNum(row.max_percent)} %</td><td>${fmtNum(row.position_mm, 2)} mm</td><td>${fmtNum(row.voltage_v, 3)} V</td><td>${fmtNum(row.samples, 0)}</td></tr>`,
      )
      .join("") || '<tr><td colspan="6">Nenhuma leitura neste período.</td></tr>';
}

// ----- Período -----
document.querySelectorAll("[data-range]").forEach((button) => {
  button.onclick = () => {
    // Preset: janela móvel. Sai de qualquer intervalo fixo e esquece ampliações anteriores.
    Object.assign(telem, { period: /^\d+$/.test(button.dataset.range) ? Number(button.dataset.range) : button.dataset.range, custom: false, zoomStack: [] });
    $id("customRange").hidden = true;
    $id("customToggle").setAttribute("aria-expanded", "false");
    loadHistory();
  };
});
// "Personalizado" abre os campos De/Até. Com um intervalo fixo em uso, eles ficam à vista.
$id("customToggle").onclick = () => {
  const show = telem.custom || $id("customRange").hidden;
  $id("customRange").hidden = !show;
  $id("customToggle").setAttribute("aria-expanded", String(show));
  if (show) $id("fromTime").focus();
};
$id("customRange").onsubmit = (event) => {
  event.preventDefault();
  try {
    // Intervalo manual: fica fixo depois de aplicado (a atualização periódica não o desloca).
    const range = validateRange($id("fromTime").value, $id("toTime").value);
    Object.assign(telem, { range, custom: true, zoomStack: [] });
    $id("fromTime").blur();
    $id("toTime").blur();
    loadHistory();
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
// Voltar da ampliação restaura a seleção anterior, inclusive quando ela era um intervalo manual.
$id("resetZoom").onclick = () => {
  const previous = telem.zoomStack.pop();
  if (!previous) return;
  Object.assign(telem, { custom: previous.custom, period: previous.period, range: previous.range });
  if (!telem.custom) {
    $id("customRange").hidden = true;
    $id("customToggle").setAttribute("aria-expanded", "false");
  }
  loadHistory();
};

// ----- Ampliação por arraste e dica -----
let chartDragStart = null;
const chartFraction = (event) => {
  const box = $id("historyChart").getBoundingClientRect();
  return Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
};
$id("historyChart").onpointerdown = (event) => {
  if (!telem.loaded?.history.length || telem.pending?.auto === false) return;
  chartDragStart = chartFraction(event);
  $id("historyChart").setPointerCapture(event.pointerId);
};
$id("historyChart").onpointermove = (event) => {
  const loaded = telem.loaded;
  if (!loaded) return;
  const fraction = chartFraction(event);
  if (chartDragStart !== null) {
    let selection = $id("historyChart").querySelector(".chart-selection");
    if (!selection) {
      selection = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      selection.setAttribute("class", "chart-selection");
      selection.setAttribute("height", "280");
      $id("historyChart").append(selection);
    }
    selection.setAttribute("x", Math.min(fraction, chartDragStart) * 1e3);
    selection.setAttribute("width", Math.abs(fraction - chartDragStart) * 1e3);
    return;
  }
  const at = loaded.range.from.getTime() + fraction * (loaded.range.to - loaded.range.from);
  const nearest = loaded.history.reduce((best, row) => (!best || Math.abs(new Date(row.received_at) - at) < Math.abs(new Date(best.received_at) - at) ? row : best), null);
  if (!nearest) return;
  $id("chartTooltip").hidden = false;
  $id("chartTooltip").textContent = `${fmtDateTime(nearest.received_at)}
Estabilizado ${fmtNum(nearest.stable_percent)}% (${adjustmentInfo(nearest.stable_percent).label}) · média bruta ${fmtNum(nearest.travel_percent)}% · mín. ${fmtNum(nearest.min_percent)}% · máx. ${fmtNum(nearest.max_percent)}%
${fmtNum(nearest.samples, 0)} leituras`;
};
$id("historyChart").onpointerleave = () => {
  $id("chartTooltip").hidden = true;
};
$id("historyChart").onpointercancel = () => {
  chartDragStart = null;
  $id("historyChart").querySelector(".chart-selection")?.remove();
};
$id("historyChart").onpointerup = (event) => {
  if (chartDragStart === null) return;
  const end = chartFraction(event);
  const start = chartDragStart;
  chartDragStart = null;
  $id("historyChart").querySelector(".chart-selection")?.remove();
  const loaded = telem.loaded;
  if (!loaded || Math.abs(end - start) < 0.01) return;
  const span = loaded.range.to - loaded.range.from;
  try {
    const range = validateRange(new Date(loaded.range.from.getTime() + Math.min(start, end) * span), new Date(loaded.range.from.getTime() + Math.max(start, end) * span));
    telem.zoomStack.push({ custom: telem.custom, period: telem.period, range: telem.range });
    Object.assign(telem, { range, custom: true });
    loadHistory();
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};

// ----- CSV: sempre do contexto em tela (sensor e período carregados) -----
$id("exportCsv").onclick = async () => {
  const loaded = telem.loaded;
  if (!loaded?.history.length) return;
  const text = [
    ["horario", "percentual_estabilizado", "media_percentual", "min_percentual", "max_percentual", "posicao_estimada_mm", "tensao_estimada_v", "leituras"],
    ...loaded.history.map((row) => [row.received_at, row.stable_percent, row.travel_percent, row.min_percent, row.max_percent, row.position_mm, row.voltage_v, row.samples]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  try {
    await exportCsvFile(text, `gaxeta-${loaded.sensorId}-intervalos.csv`);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("exportMovements").onclick = async () => {
  const loaded = telem.loaded;
  if (!loaded?.movements.length) return;
  if (loaded.truncated) return showMessage("Reduza o período para exportar todas as mudanças.");
  const text = [
    ["horario", "percentual_anterior", "percentual_estabilizado", "variacao_pontos", "regra"],
    ...loaded.movements.map((move) => [move.received_at, move.previous_percent, move.stable_percent, move.previous_percent == null ? "" : Number(move.stable_percent) - Number(move.previous_percent), move.rule_version]),
  ]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
  try {
    await exportCsvFile(text, `gaxeta-${loaded.sensorId}-mudancas.csv`);
  } catch (error) {
    showMessage(errorText(error), "error");
  }
};
$id("showRawBand").onchange = renderHistory;
$id("historyEdit").onclick = () => {
  if (state.sensorId) openSensorEditor(state.sensorId);
};
