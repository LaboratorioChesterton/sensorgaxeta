// =============================================================================
// Telemetria da modalidade magnética (AS5600).
//   * A série magnética nunca entra na conta da série elétrica: % do ADC e % de curso são
//     gráficos, tabelas e CSV separados (telem.loaded.modality).
//   * Com referência no período: Curso de ajuste restante (%), média física por intervalo,
//     um trecho por engaxetamento. A linha quebra em lacunas e na troca de referência.
//   * Sem referência: ângulo absoluto (0° a 360°), em média CIRCULAR calculada no servidor. A
//     linha quebra na passagem por 0° em vez de atravessar o gráfico.
//   * CSV com unidade, método, qualidade, revisão da geometria e referência em cada linha.
// =============================================================================
const TELEM_LABELS = {
  electric: {
    rawNow: ["Posição elétrica (%)", "Leitura atual do potenciômetro, em % da escala elétrica da placa (0 % no mínimo, 100 % no máximo)."],
    volt: null,
    stableNow: ["Linha estabilizada (%)", "Posição elétrica estabilizada: só muda com variação de 5 pontos percentuais ou mais."],
    delta: ["Variação desde o envio anterior", "Diferença entre o envio anterior e o atual, sem a estabilização de 5 p.p."],
    min: ["Mín. elétrico", "Menor posição elétrica do período"],
    max: ["Máx. elétrico", "Maior posição elétrica do período"],
    scale: "Posição elétrica do sensor (% da escala elétrica)",
    legend: ["Leitura atual (média por intervalo)", "Linha estabilizada (5 p.p.)", "Mudança da linha estabilizada"],
    axis: ["100", "75", "50", "25", "0"],
    movementTitle: "Mudanças da linha estabilizada (posição elétrica)",
    movementHead: ["Horário", "Posição elétrica anterior", "Nova posição elétrica", "Variação"],
    historyHead: ["Horário", "Posição elétrica: estabilizada / leitura (média)", "Mín. / máx. elétrico", "Tensão estimada", "Tensão calibrada", "Leituras"],
  },
  course: {
    rawNow: ["Curso restante (%)", "Curso de ajuste restante da leitura atual: calculado pela geometria a partir do engaxetamento registrado."],
    volt: ["Avanço (mm)", "Avanço do preme-gaxeta desde o engaxetamento (calculado). Negativo = recuo."],
    stableNow: ["Linha estabilizada (%)", "Curso restante estabilizado: só muda com variação de 5 pontos percentuais ou mais, dentro do mesmo engaxetamento."],
    delta: ["Ângulo do sensor", "Ângulo absoluto do ímã (medido). Não é avanço nem curso."],
    min: ["Mín. do período", "Menor curso restante válido do período"],
    max: ["Máx. do período", "Maior curso restante válido do período"],
    scale: "Curso de ajuste restante (% do curso disponível no engaxetamento)",
    legend: ["Curso restante (média por intervalo)", "Linha estabilizada (5 p.p.)", "Engaxetamento registrado"],
    axis: ["100", "75", "50", "25", "0"],
    movementTitle: "Mudanças do curso de ajuste restante (5 p.p.)",
    movementHead: ["Horário", "Curso restante anterior", "Novo curso restante", "Variação"],
    historyHead: ["Horário", "Curso restante: estabilizado / média", "Mín. / máx.", "Avanço (mm)", "Ângulo (média circular)", "Leituras válidas / total"],
  },
  angle: {
    rawNow: ["Curso restante (%)", "Sem engaxetamento registrado neste período: não há curso restante."],
    volt: ["Avanço (mm)", "Sem engaxetamento registrado: não há avanço."],
    stableNow: ["Linha estabilizada (%)", "Só existe depois de um engaxetamento registrado."],
    delta: ["Ângulo do sensor", "Ângulo absoluto do ímã (medido). Não é avanço nem curso."],
    min: ["Mín. do período", "Sem curso restante no período"],
    max: ["Máx. do período", "Sem curso restante no período"],
    scale: "Ângulo absoluto do sensor (0° a 360°, média circular por intervalo)",
    legend: ["Ângulo (média circular)", "—", "—"],
    axis: ["360°", "270°", "180°", "90°", "0°"],
    movementTitle: "Mudanças do curso de ajuste restante (5 p.p.)",
    movementHead: ["Horário", "Curso restante anterior", "Novo curso restante", "Variação"],
    historyHead: ["Horário", "Curso restante: estabilizado / média", "Mín. / máx.", "Avanço (mm)", "Ângulo (média circular)", "Leituras válidas / total"],
  },
};
// Os rótulos do resumo seguem a modalidade da leitura ATUAL; os do gráfico e das tabelas seguem
// a série CARREGADA. Assim, um sensor que voltou ao potenciômetro pode mostrar o histórico
// magnético antigo sem trocar os rótulos da leitura atual, e vice-versa.
let telemSummaryMode = "electric";
let telemChartMode = "electric";
function applySummaryLabels(mode) {
  if (mode === telemSummaryMode) return;
  telemSummaryMode = mode;
  const text = TELEM_LABELS[mode];
  const set = (id, pair) => {
    if (!pair || !$id(id)) return;
    $id(id).textContent = pair[0];
    $id(id).title = pair[1];
  };
  set("lblRawNow", text.rawNow);
  set("historyVoltLabel", text.volt);
  set("lblStableNow", text.stableNow);
  set("lblDelta", text.delta);
}
function applyChartLabels(mode) {
  if (mode === telemChartMode) return;
  telemChartMode = mode;
  const text = TELEM_LABELS[mode];
  for (const [id, pair] of [["lblMin", text.min], ["lblMax", text.max]]) {
    $id(id).textContent = pair[0];
    $id(id).title = pair[1];
  }
  $id("chartScaleNote").textContent = text.scale;
  $id("chartLegend").innerHTML =
    `<li class="legend-raw"><i></i>${esc(text.legend[0])}</li>` +
    (text.legend[1] === "—" ? "" : `<li class="legend-stable"><i></i>${esc(text.legend[1])}</li><li class="legend-change"><i></i>${esc(text.legend[2])}</li>`);
  $id("chartYAxis").innerHTML = text.axis.map((label) => `<span>${esc(label)}</span>`).join("");
  $id("movementTitle").textContent = text.movementTitle;
  $id("movementHead").innerHTML = text.movementHead.map((label) => `<th>${esc(label)}</th>`).join("");
  $id("historyHead").innerHTML = text.historyHead.map((label) => `<th>${esc(label)}</th>`).join("");
  $id("showRawBand").closest("label").hidden = mode === "angle";
}
// Que série a Telemetria mostra: a da modalidade atual do sensor, ou a escolhida no seletor.
function telemetrySeries(device) {
  const chosen = $id("historySeries")?.value || "auto";
  if (chosen !== "auto") return chosen;
  return isMagnetic(device, device ? deviceLive(device) : null) ? "as5600_i2c" : "adc_pot";
}
// Resposta de gaxeta_mag_history no formato que a tela usa (telem.loaded).
function magLoaded(base, data) {
  const history = data.history || [];
  const valid = history.filter((row) => row.remaining_percent != null);
  return {
    ...base,
    modality: "as5600_i2c",
    series: valid.length ? "course" : "angle",
    history,
    movements: data.movements || [],
    services: data.services || [],
    seed: null,
    stats: {
      count: data.stats?.count || 0,
      valid: data.stats?.valid || 0,
      last_received_at: data.stats?.last_received_at || null,
      min: valid.length ? Math.min(...valid.map((row) => Number(row.min_remaining ?? row.remaining_percent))) : null,
      max: valid.length ? Math.max(...valid.map((row) => Number(row.max_remaining ?? row.remaining_percent))) : null,
    },
    truncated: !!data.movements_truncated,
    bucketSeconds: data.bucket_seconds,
  };
}

// Leitura atual de um sensor magnético (a cada ciclo, sem refazer o histórico).
function renderTelemetryLiveMag(device) {
  const identity = deviceIdentity(device);
  const view = deviceView(device);
  const computed = view.computed;
  const service = view.service;
  applySummaryLabels(computed ? "course" : "angle");
  $id("historyTitle").textContent = identity.title;
  $id("historyTitle").title = identity.path || "";
  $id("historyContext").textContent = identity.linked ? `Sensor: ${identity.sensor} · Spot: ${identity.spot} · sensor magnético` : `Sensor magnético sem vínculo com spot (fila de associação) · ${deviceStatus(device).label}`;
  $id("historyContext").title = identity.path || "";
  $id("historyCurrentLabel").textContent = view.kicker + (view.origin ? ` (${view.origin})` : "");
  $id("historyCurrent").textContent = view.value === "—" ? "—" : `${view.value}${view.unit === "%" ? " %" : view.unit}`;
  $id("historyHealthBox").className = "summary-main health-" + view.key;
  $id("historyHealth").textContent = view.label;
  $id("historyAction").textContent = view.note;
  $id("historyRawNow").textContent = computed ? fmtNum(computed.remaining_percent, 2) + " %" : "—";
  $id("historyRawNow").title = computed ? `${fmtMm(computed.remaining_mm, 2)} de ${fmtMm(service?.course_mm, 2)}` + (view.reason === "out_of_range" ? " · fora da faixa validada" : "") : MAG_REASON[view.reason]?.note || "";
  $id("historyVolt").textContent = computed ? fmtMm(computed.advance_mm, 2) : "—";
  $id("historyVolt").title = computed ? "Calculado pela geometria " + (service?.geometry || "") : "";
  $id("historyStableNow").textContent = service?.stable_remaining == null ? "—" : fmtNum(service.stable_remaining) + " %";
  $id("historyDelta").textContent = view.raw == null ? "—" : `${fmtDeg(view.degrees, 2)} · bruto ${view.raw}`;
  const cadence = firmwareCadence(device.firmware_version);
  $id("historyReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"} · ${magSignalText(device, view.mag)}` +
    (cadence ? ` · ${cadence.text}` : "") +
    (service ? ` · engaxetamento de ${fmtDateTime(service.captured_at)}: ${fmtMm(service.course_mm)} ${service.course_origin === "estimated" ? "estimados" : "medidos"}, geometria ${service.geometry}` : "");
  $id("historySince").textContent = service?.stable_since ? "Linha estabilizada desde " + fmtDateTime(service.stable_since) : "";
  $id("historyEdit").disabled = false;
}

function renderHistoryMag() {
  const loaded = telem.loaded;
  const mode = loaded.series;
  applyChartLabels(mode);
  const rows = loaded.history;
  const movements = loaded.movements;
  const stats = loaded.stats;
  const range = loaded.range;
  $id("historyMin").textContent = stats.min == null ? "—" : `${fmtNum(stats.min)} %`;
  $id("historyMax").textContent = stats.max == null ? "—" : `${fmtNum(stats.max)} %`;
  $id("historyCount").textContent = `${fmtNum(stats.valid, 0)} válidas de ${fmtNum(stats.count, 0)}`;
  $id("chartEmpty").hidden = rows.length > 0;
  $id("chartEmpty").textContent = "Nenhuma leitura magnética neste período.";
  $id("chartFrom").textContent = fmtDateTime(range.from);
  $id("chartTo").textContent = fmtDateTime(range.to);
  $id("aggregationNote").textContent = loaded.truncated
    ? "Muitas mudanças neste intervalo. Reduza o período para exibir a linha completa."
    : mode === "course"
      ? "Curso restante: média de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo, só de leituras válidas · um trecho por engaxetamento · linha estabilizada: 5 p.p."
      : "Ângulo: média circular de " + fmtNum(loaded.bucketSeconds || 1, 0) + " s por intervalo, só de leituras válidas. Sem engaxetamento no período não há curso restante.";
  $id("movementCount").textContent = loaded.truncated ? "Mais de 5.000 registros — reduza o período" : movements.length + " mudanças de 5 p.p. no período";
  $id("movementRows").innerHTML =
    movements
      .slice(-30)
      .reverse()
      .map((move) => `<tr><td>${fmtDateTime(move.received_at)}</td><td>${fmtNum(move.previous_remaining)} %</td><td>${fmtNum(move.stable_remaining)} %</td><td>${fmtNum(move.stable_remaining - move.previous_remaining)} p.p.</td></tr>`)
      .join("") ||
    `<tr><td colspan="4">${mode === "course" ? "Nenhuma mudança de 5 pontos no curso restante neste período." : "Sem engaxetamento registrado neste período: não há curso restante para acompanhar."}</td></tr>`;
  const px = (time) => Math.max(0, Math.min(1e3, ((new Date(time) - range.from) / (range.to - range.from)) * 1e3)).toFixed(2);
  const py = (percent) => (280 - clampPercent(percent) * 2.8).toFixed(2);
  const valueOf = (row) => (mode === "course" ? row.remaining_percent : row.angle_deg == null ? null : (Number(row.angle_deg) / 360) * 100);
  const gapDevice = currentDevice();
  const gapMs = Math.max(3 * (Number(loaded.bucketSeconds) || 1) * 1000, 90e3, 2.5 * (Number(gapDevice ? deviceInterval(gapDevice) : 0) || 0) * 1000);
  // A linha quebra em lacunas, em intervalos sem leitura válida, na troca de referência e, no
  // modo ângulo, na passagem por 0° (um salto de mais de 180° é a volta do contador, não um giro).
  const breaks = (row, previous) =>
    !previous ||
    new Date(row.received_at) - new Date(previous.last_at || previous.received_at) > gapMs ||
    (mode === "course" && row.service_id !== previous.service_id) ||
    (mode === "angle" && Math.abs(Number(row.angle_deg) - Number(previous.angle_deg)) > 180);
  let rawPath = "", stablePath = "", risers = "", band = "", bandUp = [], bandDown = [];
  let previous = null, previousStable = null;
  const closeBand = () => {
    if (bandUp.length > 1) band += "M" + bandUp.join(" L") + " L" + bandDown.reverse().join(" L") + " Z ";
    bandUp = [];
    bandDown = [];
  };
  const drawn = rows.filter((row) => valueOf(row) != null);
  for (const row of drawn) {
    const x = px(row.received_at);
    const broke = breaks(row, previous);
    rawPath += `${broke ? "M" : "L"}${x} ${py(valueOf(row))} `;
    if (mode === "course") {
      if (broke) closeBand();
      bandUp.push(`${x} ${py(row.max_remaining ?? row.remaining_percent)}`);
      bandDown.push(`${x} ${py(row.min_remaining ?? row.remaining_percent)}`);
      if (row.stable_remaining != null) {
        if (broke || previousStable == null) stablePath += `M${x} ${py(row.stable_remaining)}`;
        else {
          stablePath += `H${x}`;
          if (Number(row.stable_remaining) !== Number(previousStable)) {
            risers += `M${x} ${py(previousStable)}V${py(row.stable_remaining)}`;
            stablePath += `M${x} ${py(row.stable_remaining)}`;
          }
        }
        previousStable = row.stable_remaining;
      }
    }
    previous = row;
  }
  closeBand();
  // Marca vertical em cada engaxetamento capturado dentro do período.
  const marks = loaded.services
    .filter((service) => new Date(service.captured_at) >= range.from && new Date(service.captured_at) <= range.to)
    .map((service) => `M${px(service.captured_at)} 0V280`)
    .join("");
  $id("historyChart").innerHTML = rows.length
    ? `<path class="chart-band" d="${$id("showRawBand").checked && mode === "course" ? band : ""}"/>` +
      `<path class="chart-service" d="${marks}"/>` +
      `<path class="chart-riser" d="${risers}"/>` +
      `<path class="chart-line chart-electric" d="${stablePath}"/>` +
      `<path class="chart-raw" d="${rawPath.trim()}"/>` +
      (drawn.length === 1 ? `<circle class="chart-dot chart-raw-dot" cx="${px(drawn[0].received_at)}" cy="${py(valueOf(drawn[0]))}" r="4"/>` : "")
    : "";
  $id("historyChart").setAttribute(
    "aria-label",
    mode === "course"
      ? `Curso de ajuste restante. ${rows.length} intervalos, ${fmtNum(stats.valid, 0)} leituras válidas de ${fmtNum(stats.count, 0)}. Mínimo ${fmtNum(stats.min)}%, máximo ${fmtNum(stats.max)}%. ${loaded.services.length} engaxetamento(s) no período. Arraste para ampliar.`
      : `Ângulo absoluto do sensor magnético. ${rows.length} intervalos, ${fmtNum(stats.valid, 0)} leituras válidas de ${fmtNum(stats.count, 0)}. Sem curso restante no período. Arraste para ampliar.`,
  );
  $id("historyRows").innerHTML =
    rows
      .slice(-30)
      .reverse()
      .map(
        (row) =>
          `<tr><td>${fmtDateTime(row.received_at)}</td><td>${row.remaining_percent == null ? "—" : fmtNum(row.stable_remaining) + " %"}<small class="raw-average">Média: ${row.remaining_percent == null ? "—" : fmtNum(row.remaining_percent, 2) + "%"}</small></td>` +
          `<td>${row.remaining_percent == null ? "—" : fmtNum(row.min_remaining) + " / " + fmtNum(row.max_remaining) + " %"}</td><td>${row.advance_mm == null ? "—" : fmtNum(row.advance_mm, 2)}</td>` +
          `<td>${fmtDeg(row.angle_deg, 2)}</td><td>${fmtNum(row.valid, 0)} / ${fmtNum(row.samples, 0)}${magRowFlags(row)}</td></tr>`,
      )
      .join("") || '<tr><td colspan="6">Nenhuma leitura magnética neste período.</td></tr>';
}
// Motivos das leituras inválidas de um intervalo, em poucas palavras.
function magRowFlags(row) {
  const flags = [row.bus_fail ? `${row.bus_fail} sem resposta` : "", row.no_magnet ? `${row.no_magnet} sem ímã` : "", row.field_out ? `${row.field_out} campo fora` : "", row.out_of_range ? `${row.out_of_range} fora da faixa` : ""].filter(Boolean);
  return flags.length ? `<small class="raw-average">${esc(flags.join(" · "))}</small>` : "";
}
function magTooltipText(row, loaded) {
  const service = loaded.services.find((item) => item.id === row.service_id);
  return (
    `${fmtDateTime(row.received_at)}\n` +
    (row.remaining_percent == null
      ? `Ângulo do sensor: ${fmtDeg(row.angle_deg, 2)} (média circular) · sem curso restante neste intervalo`
      : `Curso restante: ${fmtNum(row.remaining_percent, 2)}% (${fmtMm(row.remaining_mm, 2)}) · estabilizado ${fmtNum(row.stable_remaining)}% · avanço ${fmtMm(row.advance_mm, 2)} · ângulo ${fmtDeg(row.angle_deg, 2)}`) +
    (service ? `\nEngaxetamento de ${fmtDateTime(service.captured_at)} · ${fmtMm(service.course_mm)} ${service.course_origin === "estimated" ? "estimados" : "medidos"} · ${service.geometry}` : "") +
    `\n${fmtNum(row.valid, 0)} leituras válidas de ${fmtNum(row.samples, 0)}`
  );
}
async function exportMagCsv(loaded) {
  const byId = new Map(loaded.services.map((service) => [service.id, service]));
  const text = [
    ["horario", "modalidade", "engaxetamento_id", "engaxetamento_capturado_em", "geometria_revisao", "curso_disponivel_mm", "origem_do_curso",
      "curso_restante_estabilizado_pct", "curso_restante_medio_pct", "curso_restante_min_pct", "curso_restante_max_pct", "curso_restante_medio_mm", "avanco_medio_mm",
      "angulo_medio_circular_graus", "leituras", "leituras_validas", "falha_de_barramento", "ima_ausente", "campo_fora_da_faixa", "fora_da_faixa_validada", "metodo"],
    ...loaded.history.map((row) => {
      const service = byId.get(row.service_id);
      return [row.received_at, "as5600_i2c", row.service_id ?? "", service?.captured_at ?? "", service ? service.geometry + (service.provisional ? " (provisoria)" : "") : "",
        service?.course_mm ?? "", service ? (service.course_origin === "estimated" ? "estimado" : "medido") : "",
        row.remaining_percent == null ? "" : row.stable_remaining ?? "", row.remaining_percent ?? "", row.min_remaining ?? "", row.max_remaining ?? "", row.remaining_mm ?? "", row.advance_mm ?? "",
        row.angle_deg ?? "", row.samples, row.valid, row.bus_fail, row.no_magnet, row.field_out, row.out_of_range,
        "angulo medido (media circular das leituras validas); avanco e curso restante calculados pela geometria da referencia"];
    }),
  ].map((row) => row.map(csvCell).join(";")).join("\r\n");
  await exportCsvFile(text, `gaxeta-${loaded.sensorId}-magnetico-intervalos.csv`);
}
async function exportMagMovementsCsv(loaded) {
  const byId = new Map(loaded.services.map((service) => [service.id, service]));
  const text = [
    ["horario", "engaxetamento_id", "geometria_revisao", "curso_disponivel_mm", "origem_do_curso", "curso_restante_anterior_pct", "curso_restante_estabilizado_pct", "variacao_pontos", "regra"],
    ...loaded.movements.map((move) => {
      const service = byId.get(move.service_id);
      return [move.received_at, move.service_id, service?.geometry ?? "", service?.course_mm ?? "", service ? (service.course_origin === "estimated" ? "estimado" : "medido") : "",
        move.previous_remaining, move.stable_remaining, Number(move.stable_remaining) - Number(move.previous_remaining), "mudanca de 5 p.p. ou mais no curso de ajuste restante, dentro do mesmo engaxetamento"];
    }),
  ].map((row) => row.map(csvCell).join(";")).join("\r\n");
  await exportCsvFile(text, `gaxeta-${loaded.sensorId}-magnetico-mudancas.csv`);
}
