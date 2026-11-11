// =============================================================================
// Telemetria. O cálculo, o gráfico, o zoom e os CSV vêm do pacote publicado, sem
// mudança de comportamento. A escolha do sensor passou a buscar no servidor.
// =============================================================================
const telemetry = { matchIds: null, searchRun: 0 };
function renderHistorySelect() {
  const known = telemetry.matchIds ? telemetry.matchIds.map(findDevice).filter(Boolean) : [...state.devices];
  const current = currentDevice();
  if (current && !known.includes(current)) known.unshift(current);
  known.sort((left, right) => deviceLabel(left).localeCompare(deviceLabel(right), "pt-BR"));
  fillSelect(
    $id("historySensor"),
    known.slice(0, 100).map((device) => ({ value: device.sensor_id, label: deviceLabel(device) + " — " + (assetPathLabel(device.measurement_point_id) || "Sem vínculo") })),
    known.length ? null : "Nenhum sensor",
    state.sensorId,
  );
  $id("historyLocation").textContent = current ? assetPathLabel(current.measurement_point_id) || "Sensor sem vínculo com spot" : "";
}
async function searchHistorySensors() {
  const run = ++telemetry.searchRun;
  const query = $id("historySearch").value.trim();
  const result = await callRpc("gaxeta_devices_page", { p_asset_id: null, p_search: query || null, p_unlinked: false, p_limit: 50, p_offset: 0 });
  if (run !== telemetry.searchRun) return;
  mergeDevices(result.items);
  await ensureAssets(result.items.map((device) => device.measurement_point_id));
  telemetry.matchIds = query ? result.items.map((device) => device.sensor_id) : null;
  renderHistorySelect();
}
$id("historySearch").oninput = debounce(() => searchHistorySensors().catch((error) => showMessage(errorText(error), "error")), 350);
async function openTelemetry() {
  if (state.sensorId && !currentDevice()) await refreshKnownDevices();
  if (!currentDevice()) {
    await searchHistorySensors();
    if (!currentDevice()) state.sensorId = state.devices[0]?.sensor_id || "";
  }
  await ensureAssets([currentDevice()?.measurement_point_id]);
  renderHistorySelect();
  renderHistory();
  await loadHistory();
}

// ----- Herdado do pacote publicado -----
function toLocalInput(t) {
  return new Date(t.getTime() - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}
async function loadHistory() {
  const t = ++state.historyRequest,
    e = state.sensorId;
  if (!e) {
    ((state.history = []), (state.stats = {}), renderHistory());
    return;
  }
  state.custom || (state.range = presetRange(state.period, new Date(Date.now() + state.clockOffset)));
  const r = {
      ...state.range,
    },
    s = await unwrap(
      sb.rpc("gaxeta_history", {
        p_sensor_id: e,
        p_from: r.from.toISOString(),
        p_to: r.to.toISOString(),
      }),
    );
  t !== state.historyRequest ||
    e !== state.sensorId ||
    !state.authorized ||
    ((state.history = s.history || []),
    (state.movements = s.movements || []),
    (state.seed = s.seed || null),
    (state.movementsTruncated = !!s.movements_truncated),
    (state.stats = s.stats || {}),
    (state.historyRange = r),
    (state.bucketSeconds = s.bucket_seconds),
    $id("customRange").contains(document.activeElement) ||
      (($id("fromTime").value = toLocalInput(r.from)), ($id("toTime").value = toLocalInput(r.to))),
    renderHistory());
}
function renderHistory() {
  const t = state.history,
    e = currentDevice(),
    r = state.historyRange || state.range;
  (($id("historyTitle").textContent = e ? deviceLabel(e) : "Deslocamento da gaxeta"),
    ($id("historyCurrent").textContent = `${fmtNum(e?.stable_percent)} %`));
  const s = adjustmentInfo(e?.stable_percent);
  (($id("historyHealth").className = "health-banner health-" + s.key),
    ($id("historyHealth").textContent = s.label + " · " + s.action),
    ($id("historyRaw").textContent =
      "Leitura bruta atual: " + fmtNum(e?.last_percent) + "% · referência desde " + fmtDateTime(e?.stable_since)),
    ($id("historyMin").textContent = `${fmtNum(state.stats.min)} %`),
    ($id("historyMax").textContent = `${fmtNum(state.stats.max)} %`),
    ($id("historyCount").textContent = fmtNum(state.stats.count || 0, 0)),
    ($id("chartEmpty").hidden = t.length > 0),
    ($id("chartFrom").textContent = fmtDateTime(r.from)),
    ($id("chartTo").textContent = fmtDateTime(r.to)),
    ($id("aggregationNote").textContent = state.movementsTruncated
      ? "Muitos movimentos neste intervalo. Reduza o período para exibir o gráfico completo."
      : "Linha: variação ≥ 5 p.p. · faixa bruta: mín./máx. · médias de " + fmtNum(state.bucketSeconds || 1, 0) + " s"),
    ($id("exportCsv").disabled = !t.length),
    ($id("exportMovements").disabled = !state.movements.length || state.movementsTruncated),
    ($id("movementCount").textContent = state.movementsTruncated
      ? "Mais de 5.000 registros — reduza o período"
      : state.movements.filter((o) => o.previous_percent != null).length + " mudanças no período"),
    ($id("movementRows").innerHTML =
      state.movements
        .slice(-30)
        .reverse()
        .map((o) => {
          const l = adjustmentInfo(o.stable_percent);
          return `<tr><td>${fmtDateTime(o.received_at)}</td><td>${o.previous_percent == null ? "Referência inicial" : fmtNum(o.previous_percent) + " %"}</td><td>${fmtNum(o.stable_percent)} %</td><td>${o.previous_percent == null ? "—" : fmtNum(o.stable_percent - o.previous_percent) + " p.p."}</td><td><span class="adjustment-badge health-${l.key}">${l.label}</span></td></tr>`;
        })
        .join("") ||
      '<tr><td colspan="5">Nenhuma mudança de 5 pontos neste período. A referência anterior é mantida enquanto chegam novas leituras.</td></tr>'));
  const n = (o, l) => {
      const c = Math.max(0, Math.min(1e3, ((new Date(o.received_at) - r.from) / (r.to - r.from)) * 1e3)),
        h = 280 - Math.max(0, Math.min(100, Number(o[l]))) * 2.8;
      return `${c.toFixed(2)} ${h.toFixed(2)}`;
    },
    i = state.movementsTruncated
      ? ""
      : buildStablePath(state.movements, state.seed, r.from, r.to, state.stats.last_received_at || t.at(-1)?.received_at),
    a = t.length
      ? t.map((o, l) => `${l ? "L" : "M"}${n(o, "min_percent")}`).join(" ") +
        [...t]
          .reverse()
          .map((o) => `L${n(o, "max_percent")}`)
          .join(" ") +
        " Z"
      : "";
  (($id("historyChart").innerHTML = t.length
    ? `<path class="chart-band" d="${$id("showRawBand").checked ? a : ""}"/><path class="chart-line" d="${i}"/>${t.length === 1 && i ? `<circle cx="${n(t[0], "travel_percent").split(" ")[0]}" cy="${n(t[0], "stable_percent").split(" ")[1]}" r="4" fill="#174f6a"/>` : ""}`
    : ""),
    $id("historyChart").setAttribute(
      "aria-label",
      `${t.length} intervalos. ${fmtNum(state.stats.count || 0, 0)} leituras. Mínimo ${fmtNum(state.stats.min)}%, máximo ${fmtNum(state.stats.max)}%. Arraste para ampliar.`,
    ),
    ($id("historyRows").innerHTML =
      t
        .slice(-30)
        .reverse()
        .map(
          (o) =>
            `<tr><td>${fmtDateTime(o.received_at)}</td><td>${fmtNum(o.stable_percent)} %<small class="raw-average">Bruta: ${fmtNum(o.travel_percent)}%</small></td><td>${fmtNum(o.min_percent)} / ${fmtNum(o.max_percent)} %</td><td>${fmtNum(o.position_mm, 2)} mm</td><td>${fmtNum(o.voltage_v, 3)} V</td><td>${fmtNum(o.samples, 0)}</td></tr>`,
        )
        .join("") || '<tr><td colspan="6">Nenhuma leitura neste período.</td></tr>'));
}
document.querySelectorAll("[data-range]").forEach(
  (t) =>
    (t.onclick = () => {
      ((state.period = t.dataset.range),
        (state.custom = !1),
        document.querySelectorAll("[data-range]").forEach((e) => e.classList.toggle("selected", e === t)),
        loadHistory().catch((e) => showMessage(errorText(e))));
    }),
);
$id("customRange").onsubmit = (t) => {
  t.preventDefault();
  try {
    ((state.range = validateRange($id("fromTime").value, $id("toTime").value)),
      (state.custom = !0),
      document.querySelectorAll("[data-range]").forEach((e) => e.classList.remove("selected")),
      loadHistory().catch((e) => showMessage(errorText(e))));
  } catch (e) {
    showMessage(errorText(e));
  }
};
$id("resetZoom").onclick = () => {
  ((state.custom = !1), loadHistory().catch((t) => showMessage(errorText(t))));
};
$id("historySensor").onchange = () => {
  ((state.sensorId = $id("historySensor").value),
    state.historyRequest++,
    (state.history = []),
    (state.stats = {}),
    renderAll(),
    renderHistory(),
    loadHistory().catch((t) => showMessage(errorText(t))));
};
let chartDragStart = null;
const chartFraction = (t) =>
  Math.max(
    0,
    Math.min(
      1,
      (t.clientX - $id("historyChart").getBoundingClientRect().left) / $id("historyChart").getBoundingClientRect().width,
    ),
  );
$id("historyChart").onpointerdown = (t) => {
  state.history.length && ((chartDragStart = chartFraction(t)), $id("historyChart").setPointerCapture(t.pointerId));
};
$id("historyChart").onpointermove = (t) => {
  const e = chartFraction(t),
    r = state.historyRange || state.range;
  if (chartDragStart !== null) {
    let i = $id("historyChart").querySelector(".chart-selection");
    (i ||
      ((i = document.createElementNS("http://www.w3.org/2000/svg", "rect")),
      i.setAttribute("class", "chart-selection"),
      i.setAttribute("height", "280"),
      $id("historyChart").append(i)),
      i.setAttribute("x", Math.min(e, chartDragStart) * 1e3),
      i.setAttribute("width", Math.abs(e - chartDragStart) * 1e3));
    return;
  }
  const s = r.from.getTime() + e * (r.to - r.from),
    n = state.history.reduce(
      (i, a) => (!i || Math.abs(new Date(a.received_at) - s) < Math.abs(new Date(i.received_at) - s) ? a : i),
      null,
    );
  n &&
    (($id("chartTooltip").hidden = !1),
    ($id("chartTooltip").textContent = `${fmtDateTime(n.received_at)}
Estabilizado ${fmtNum(n.stable_percent)}% · média bruta ${fmtNum(n.travel_percent)}% · mín. ${fmtNum(n.min_percent)}% · máx. ${fmtNum(n.max_percent)}%
${fmtNum(n.samples, 0)} leituras`));
};
$id("historyChart").onpointerleave = () => {
  $id("chartTooltip").hidden = !0;
};
$id("historyChart").onpointercancel = () => {
  ((chartDragStart = null), $id("historyChart").querySelector(".chart-selection")?.remove());
};
$id("historyChart").onpointerup = (t) => {
  if (chartDragStart === null) return;
  const e = chartFraction(t),
    r = chartDragStart;
  if (((chartDragStart = null), $id("historyChart").querySelector(".chart-selection")?.remove(), Math.abs(e - r) < 0.01)) return;
  const s = state.historyRange || state.range,
    n = s.to - s.from;
  try {
    ((state.range = validateRange(
      new Date(s.from.getTime() + Math.min(r, e) * n),
      new Date(s.from.getTime() + Math.max(r, e) * n),
    )),
      (state.custom = !0),
      loadHistory().catch((i) => showMessage(errorText(i))));
  } catch (i) {
    showMessage(errorText(i));
  }
};
$id("exportCsv").onclick = async () => {
  const e = [
    [
      "horario",
      "percentual_estabilizado",
      "media_percentual",
      "min_percentual",
      "max_percentual",
      "posicao_estimada_mm",
      "tensao_estimada_v",
      "leituras",
    ],
    ...state.history.map((r) => [
      r.received_at,
      r.stable_percent,
      r.travel_percent,
      r.min_percent,
      r.max_percent,
      r.position_mm,
      r.voltage_v,
      r.samples,
    ]),
  ].map((r) => r.map(csvCell).join(";")).join(`\r
`);
  try {
    await exportCsvFile(e, `gaxeta-${state.sensorId}-intervalos.csv`);
  } catch (r) {
    showMessage(errorText(r));
  }
};
$id("exportMovements").onclick = async () => {
  if (state.movementsTruncated) {
    showMessage("Reduza o período para exportar todas as mudanças.");
    return;
  }
  const t = [
    ["horario", "percentual_anterior", "percentual_estabilizado", "variacao_pontos", "regra"],
    ...state.movements.map((e) => [
      e.received_at,
      e.previous_percent,
      e.stable_percent,
      e.previous_percent == null ? "" : Number(e.stable_percent) - Number(e.previous_percent),
      e.rule_version,
    ]),
  ].map((e) => e.map(csvCell).join(";")).join(`\r
`);
  try {
    await exportCsvFile(t, `gaxeta-${state.sensorId}-mudancas.csv`);
  } catch (e) {
    showMessage(errorText(e));
  }
};
$id("showRawBand").onchange = renderHistory;
$id("historyEdit").onclick = () => {
  state.sensorId && openSensorEditor(state.sensorId);
};
