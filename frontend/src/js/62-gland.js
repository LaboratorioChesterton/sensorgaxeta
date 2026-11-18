// =============================================================================
// Ciclo de gaxeta: referência individual registrada depois do engaxetamento.
//
// O técnico mede com o paquímetro a distância entre as referências mecânicas da
// montagem e registra. O servidor associa essa distância à primeira leitura válida
// seguinte do sensor (ADC bruto): esse ponto vira 100 % daquele ciclo, só para
// aquele sensor e aquela instalação. A placa não recebe nada: continua enviando o
// valor bruto, e distância e percentual são calculados na consulta, com a referência
// que valia na época de cada leitura.
//
// O sensor é um potenciômetro rotativo de uma volta (Metaltex PR20-10K). Quantos
// milímetros de avanço correspondem a uma contagem do ADC depende do acoplamento
// mecânico de cada montagem. Enquanto ninguém confere, vale a escala nominal do
// firmware; uma "Conferência de medida" (segunda leitura de paquímetro em outra
// posição) passa a medir essa escala.
// =============================================================================
const glandPanelState = { key: "", status: null };
const glandForm = { mode: "cycle", sensorId: "", requestId: "", linkId: null, expected: null };
const newRequestId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (ch) => (Number(ch) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(ch) / 4)))).toString(16));

const GLAND_STATE_TEXT = {
  unlinked: () => "Vincule o sensor a um spot para registrar o engaxetamento.",
  no_reference: () =>
    "Nenhum engaxetamento registrado nesta instalação. Depois de montar a gaxeta e reposicionar o sensor, meça a distância com o paquímetro e registre.",
  maintenance: (status) => `Manutenção iniciada em ${fmtDateTime(status.recorded_at)}. As leituras deste período não contam para o ajuste.`,
  waiting: (status, interval) =>
    `Referência de ${fmtMm(status.initial_mm, 2)} registrada em ${fmtDateTime(status.recorded_at)}. Ela passa a valer na próxima leitura válida da placa` +
    (Number(interval) > 12 ? ` (envio a cada ${fmtInterval(interval)}).` : "."),
  unusable: () => "A última leitura não serve para o cálculo: sinal ruidoso, no fim da escala do sensor ou recebida com atraso.",
  active: () => "",
};

function glandScaleText(status) {
  const scale = status.scale;
  if (!scale) return "—";
  if (scale.source === "measured")
    return `Medida em ${fmtDateTime(scale.recorded_at)}: ${fmtNum(scale.mm_per_count, 5)} mm por contagem (${fmtNum(scale.delta_mm, 2)} mm em ${fmtNum(scale.delta_adc, 0)} contagens)`;
  const anchor = status.anchor;
  const course = anchor && Number(anchor.adc) > 0 ? Math.round((Number(anchor.mm) / Number(anchor.adc)) * 4095) : null;
  return `Nominal do firmware${course ? ` (${course} mm na escala inteira do ADC)` : ""}. Ainda não conferida nesta montagem`;
}
function glandLiveFields(status) {
  const active = status.state === "active";
  return {
    now: active ? fmtMm(status.distance_mm, 2) : "—",
    percent: active && status.percent != null ? fmtNum(Math.max(0, Math.min(100, Number(status.percent)))) + " %" + (Number(status.percent) > 100 || Number(status.percent) < 0 ? ` (calculado ${fmtNum(status.percent)} %)` : "") : "—",
    adc: active ? `ADC ${fmtNum(status.current_adc, 0)} · ${Number(status.delta_adc) > 0 ? "+" : ""}${fmtNum(status.delta_adc, 0)} contagens desde a referência` : "—",
    warn: [
      status.out_of_range ? "O valor calculado saiu da faixa do ciclo (abaixo de 0 % ou acima de 100 %). O sensor pode ter sido movido ou a medida informada não corresponde: confira a montagem e registre de novo." : "",
      status.near_limit ? "O potenciômetro está a menos de 5 % do fim do curso elétrico. Perto do batente ele deixa de acompanhar o movimento: reposicione o sensor e registre de novo." : "",
      active && status.scale?.source === "nominal" ? "Distância e percentual usam a escala nominal do firmware. Faça uma Conferência de medida para a plataforma medir a escala desta montagem." : "",
    ].filter(Boolean),
  };
}
function renderGlandPanel(status, device) {
  const panel = $id("glandPanel");
  if (!panel) return;
  const view = cycleView(status, device);
  const interval = state.gland.get(device.sensor_id)?.interval_s;
  const live = glandLiveFields(status);
  const cycleEvent = (status.events || []).find((event) => event.id === status.cycle_event_id);
  const rows = [];
  if (status.initial_mm != null) {
    rows.push(["Referência (100 %)", `${fmtMm(status.initial_mm, 2)} · ${GLAND_KIND[status.kind] || ""} em ${fmtDateTime(status.recorded_at)}${cycleEvent?.actor ? " · " + cycleEvent.actor : ""}`]);
    rows.push(["Fim de ajuste (0 %)", status.end_mm == null ? "Não informado: sem percentual" : fmtMm(status.end_mm, 2)]);
    rows.push(["Distância atual", `<span id="glandNow">${esc(live.now)}</span>`, true]);
    rows.push(["Ajuste do ciclo", `<span id="glandPct">${esc(live.percent)}</span>`, true]);
    if (status.anchor) rows.push(["Sensor na referência", `ADC ${fmtNum(status.anchor.adc, 0)} (${fmtNum((Number(status.anchor.adc) / 4095) * 100)} % da escala) em ${fmtDateTime(status.anchor.sampled_at)}`]);
    rows.push(["Sensor agora", `<span id="glandAdc">${esc(live.adc)}</span>`, true]);
    if (status.anchor) rows.push(["Escala", glandScaleText(status)]);
  }
  const actions = [];
  if (status.can_operate && status.state !== "unlinked") {
    actions.push(`<button class="primary" data-gland="cycle">${glyph("ruler")}Registrar engaxetamento</button>`);
    if (["active", "waiting", "unusable"].includes(status.state)) actions.push(`<button class="secondary" data-gland="check">Conferir medida</button>`);
    if (status.state !== "maintenance") actions.push(`<button class="secondary" data-gland="maintenance">${glyph("wrench")}Iniciar manutenção</button>`);
  }
  const events = (status.events || [])
    .map((event) => {
      const measure = event.initial_mm == null ? "" : ` · ${fmtMm(event.initial_mm, 2)}${event.end_mm == null ? "" : ` (fim de ajuste ${fmtMm(event.end_mm, 2)})`}`;
      const anchor = event.kind === "maintenance" ? "" : event.anchor ? ` · sensor no ADC ${fmtNum(event.anchor.adc, 0)}` : " · sem leitura válida associada";
      return `<li><b>${esc(GLAND_KIND[event.kind] || event.kind)}</b>${esc(measure)}<small>${esc(fmtDateTime(event.recorded_at))}${event.actor ? " · " + esc(event.actor) : ""}${esc(anchor)}</small></li>`;
    })
    .join("");
  const stateText = (GLAND_STATE_TEXT[status.state] || (() => ""))(status, interval);
  panel.innerHTML =
    `<h3>Ciclo da gaxeta <span class="adjustment-badge health-${view.key}">${esc(view.label)}</span></h3>` +
    (stateText ? `<p class="form-help">${esc(stateText)}</p>` : "") +
    (rows.length ? `<dl class="detail-fields">${rows.map(([name, value, raw]) => `<dt>${esc(name)}</dt><dd>${raw ? value : esc(value)}</dd>`).join("")}</dl>` : "") +
    `<div id="glandWarn">${live.warn.map((text) => `<p class="path-note">${esc(text)}</p>`).join("")}</div>` +
    (actions.length ? `<div class="drawer-actions gland-actions">${actions.join("")}</div>` : status.state !== "unlinked" && !status.can_operate ? '<p class="form-help">Sua conta consulta o ciclo, sem registrar.</p>' : "") +
    (events ? `<details class="technical-detail"><summary>Histórico do ciclo (${status.events.length}${status.events.length >= 20 ? "+" : ""})</summary><ol class="gland-events">${events}</ol></details>` : "");
}
// Lê o estado do ciclo do sensor aberto no painel. Redesenha só quando algo estrutural
// muda (estado, evento, permissão); entre uma leitura e outra atualiza apenas os números.
async function refreshGlandPanel(force = false) {
  if (!state.drawer.open || state.drawer.mode !== "detail" || !$id("glandPanel") || state.glandMissing) return;
  if (document.querySelector("dialog[open]") && !force) return;
  const sensorId = state.drawer.sensorId;
  let status;
  try {
    status = await callRpc("gaxeta_gland_status", { p_sensor_id: sensorId });
  } catch (error) {
    if (isMissingFeature(error)) {
      state.glandMissing = true;
      $id("glandPanel")?.replaceChildren();
      return;
    }
    if (error?.code === "42501") {
      const panel = $id("glandPanel");
      if (panel) panel.innerHTML = '<h3>Ciclo da gaxeta</h3><p class="form-help">Sua conta não tem acesso ao ciclo deste sensor.</p>';
      return;
    }
    throw error;
  }
  const device = findDevice(sensorId);
  if (state.drawer.sensorId !== sensorId || !$id("glandPanel") || !device) return;
  glandPanelState.status = status;
  state.gland.set(sensorId, {
    ...state.gland.get(sensorId), sensor_id: sensorId, state: status.state, percent: status.percent, distance_mm: status.distance_mm,
    initial_mm: status.initial_mm, end_mm: status.end_mm, recorded_at: status.recorded_at, scale_source: status.scale?.source ?? null,
    out_of_range: status.out_of_range, near_limit: status.near_limit,
  });
  const key = JSON.stringify([sensorId, status.state, status.event_id, status.link_id, status.can_operate, status.scale?.source, status.scale?.event_id, status.anchor?.id, (status.events || []).length]);
  if (force || key !== glandPanelState.key) {
    glandPanelState.key = key;
    renderGlandPanel(status, device);
  } else {
    const live = glandLiveFields(status);
    if ($id("glandNow")) $id("glandNow").textContent = live.now;
    if ($id("glandPct")) $id("glandPct").textContent = live.percent;
    if ($id("glandAdc")) $id("glandAdc").textContent = live.adc;
    if ($id("glandWarn")) $id("glandWarn").innerHTML = live.warn.map((text) => `<p class="path-note">${esc(text)}</p>`).join("");
  }
  updateDrawerLive();
}

// ----- Registro (engaxetamento, conferência, manutenção) -----
function glandContextLine(device) {
  const identity = deviceIdentity(device);
  return `${deviceLabel(device)}${identity.linked ? ` · ${identity.title} · ${identity.spot}` : ""}`;
}
function glandLiveLine(device) {
  const status = deviceStatus(device);
  const noise = Number(device.adc_noise);
  return (
    `Sensor agora: ${fmtNum(device.last_percent)} % da escala · ${status.label}` +
    (status.online ? "" : ". A referência só passa a valer quando a placa enviar a próxima leitura válida") +
    (Number.isFinite(noise) && noise > 25 ? `. Sinal instável (ruído de ${fmtNum(noise, 0)} contagens): confira a fixação antes de registrar` : "") +
    "."
  );
}
function openGlandDialog(mode) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  if (!status || !device || !status.can_operate) return;
  Object.assign(glandForm, { mode, sensorId: device.sensor_id, requestId: newRequestId(), linkId: status.link_id, expected: status.event_id ?? null });
  const check = mode === "check";
  $id("glandTitle").textContent = check ? "Conferir medida" : "Registrar engaxetamento";
  $id("glandSubmit").textContent = check ? "Registrar conferência" : "Registrar engaxetamento";
  $id("glandContext").textContent = glandContextLine(device);
  $id("glandKindField").hidden = check;
  $id("glandEndField").hidden = check;
  $id("glandMm").value = "";
  $id("glandEnd").value = check || status.end_mm == null ? "" : String(status.end_mm).replace(".", ",");
  document.querySelector('input[name="glandKind"][value="replacement"]').checked = true;
  $id("glandHelp").textContent = check
    ? `Meça agora, com o paquímetro, a mesma distância usada na referência (${fmtMm(status.initial_mm, 2)} em ${fmtDateTime(status.recorded_at)}). Com pelo menos 100 contagens de diferença no sensor, a plataforma passa a usar a escala medida nesta montagem. A conferência não abre um ciclo novo.`
    : "Com a gaxeta montada e o sensor reposicionado, meça a distância entre as duas referências mecânicas desta montagem. Essa medida passa a ser 100 % deste sensor. O fim de ajuste é a mesma distância quando não resta aperto (use 0 quando a medida é a folga até o encosto). Sem ele, a plataforma mostra milímetros, sem percentual.";
  $id("glandLive").textContent = glandLiveLine(device);
  $id("glandMessage").textContent = "";
  $id("glandDialog").showModal();
  $id("glandMm").focus();
}
async function sendGlandEvent(kind, initialMm, endMm) {
  const saved = await callRpc("gaxeta_record_gland_event", {
    p_sensor_id: glandForm.sensorId, p_link_id: glandForm.linkId, p_expected_event: glandForm.expected, p_request_id: glandForm.requestId,
    p_kind: kind, p_initial_mm: initialMm, p_end_mm: endMm,
  });
  await refreshGlandPanel(true);
  await afterSensorChange();
  return saved;
}
// Depois de um conflito, o estado mostrado ficou velho: relê e exige nova confirmação.
async function glandConflict() {
  await refreshGlandPanel(true).catch(() => {});
  const status = glandPanelState.status;
  Object.assign(glandForm, { requestId: newRequestId(), linkId: status?.link_id ?? null, expected: status?.event_id ?? null });
}
$id("glandForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("glandMessage");
  const check = glandForm.mode === "check";
  const measured = parseMm($id("glandMm").value);
  const endText = $id("glandEnd").value.trim();
  const end = check || !endText ? null : parseMm(endText);
  if (measured == null || measured <= 0) return void (message.textContent = "Informe a distância medida em milímetros, maior que zero, com até três casas decimais.");
  if (!check && endText && (end == null || end >= measured)) return void (message.textContent = "O fim de ajuste deve ser um número menor que a distância medida (0 é aceito).");
  const kind = check ? "check" : document.querySelector('input[name="glandKind"]:checked').value;
  message.textContent = "Registrando…";
  await withBusy($id("glandSubmit"), async () => {
    try {
      const saved = await sendGlandEvent(kind, measured, end);
      $id("glandDialog").close();
      const status = glandPanelState.status;
      showMessage(
        check
          ? "Conferência registrada. A escala é recalculada com a próxima leitura válida do sensor."
          : `${GLAND_KIND[kind]} registrada${saved.duplicate ? " (já estava gravada)" : ""}: ${fmtMm(measured, 2)} é a nova referência de 100 % deste sensor` +
              (status?.state === "waiting" ? ", a partir da próxima leitura válida." : "."),
        "success",
      );
    } catch (error) {
      if (isNetworkError(error)) message.textContent = "Sem conexão. Tente de novo: o mesmo registro não será duplicado.";
      else if (error?.code === "PT409") {
        await glandConflict();
        message.textContent = errorText(error) + " Confira os dados e confirme de novo.";
      } else message.textContent = errorText(error);
    }
  });
};
$id("detailPane").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-gland]");
  if (!button) return;
  const mode = button.dataset.gland;
  if (mode !== "maintenance") return openGlandDialog(mode);
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  if (!status || !device) return;
  const confirmed = await askConfirm({
    title: "Iniciar manutenção",
    html: `<p>Sensor <b>${esc(glandContextLine(device))}</b>.</p><p>Use antes de desacoplar ou movimentar o sensor. Enquanto a manutenção estiver aberta, as leituras continuam gravadas, mas não contam para o ajuste da gaxeta. Ao terminar, use <b>Registrar engaxetamento</b>.</p>`,
    okLabel: "Iniciar manutenção",
    danger: false,
  });
  if (!confirmed) return;
  Object.assign(glandForm, { mode: "maintenance", sensorId: device.sensor_id, requestId: newRequestId(), linkId: status.link_id, expected: status.event_id ?? null });
  await withBusy(button, async () => {
    try {
      await sendGlandEvent("maintenance", null, null);
      showMessage("Manutenção iniciada. As leituras deste período não contam para o ajuste.", "success");
    } catch (error) {
      if (error?.code === "PT409") await glandConflict();
      throw error;
    }
  });
});

// ----- Telemetria: ajuste pelo ciclo no período exibido -----
// Cada ponto é calculado no servidor com a referência e a escala que valiam na época da
// leitura (gaxeta_gland_history). Um ciclo novo não redesenha o passado.
async function loadCycleHistory(sensorId, range, token) {
  const panel = $id("cyclePanel");
  if (state.glandMissing) return void (panel.hidden = true);
  let data;
  try {
    data = await callRpc("gaxeta_gland_history", { p_sensor_id: sensorId, p_from: range.from.toISOString(), p_to: range.to.toISOString() });
  } catch (error) {
    if (isMissingFeature(error)) state.glandMissing = true;
    panel.hidden = true; // complemento da tela: o gráfico principal continua valendo
    return;
  }
  if (token !== telem.request || sensorId !== state.sensorId || !state.authorized) return;
  renderCycleChart(data, range);
}
function renderCycleChart(data, range) {
  const panel = $id("cyclePanel");
  const events = data?.events || [];
  // A unidade segue o ciclo mais recente do período: percentual quando ele tem fim de ajuste, milímetros quando não tem.
  const all = data?.points || [];
  const usePercent = all.length > 0 && all[all.length - 1].percent != null;
  const points = (data?.points || [])
    .map((point) => ({ at: new Date(point.received_at).getTime(), value: Number(usePercent ? point.percent : point.distance_mm), raw: point }))
    .filter((point) => Number.isFinite(point.value) && (!usePercent || point.raw.percent != null));
  if (!points.length && !events.length) return void (panel.hidden = true);
  panel.hidden = false;
  const fromAt = range.from.getTime();
  const span = Math.max(1, range.to.getTime() - fromAt);
  const values = points.map((point) => point.value);
  let low = usePercent ? Math.min(0, ...values) : Math.min(...values);
  let high = usePercent ? Math.max(100, ...values) : Math.max(...values);
  if (!points.length) [low, high] = [0, 100];
  if (high - low < 1e-6) [low, high] = [low - 1, high + 1];
  const px = (at) => (((at - fromAt) / span) * 1000).toFixed(1);
  const py = (value) => (112 - ((value - low) / (high - low)) * 104).toFixed(1);
  // Quebra a linha a cada evento que muda o ciclo e em lacunas longas (placa parada ou em manutenção).
  const cuts = events.filter((event) => event.kind !== "check").map((event) => new Date(event.recorded_at).getTime());
  const gapMs = Math.max(3 * (Number(data.bucket_seconds) || 1) * 1000, 90e3);
  const paths = [];
  let current = [];
  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (previous && (point.at - previous.at > gapMs || cuts.some((cut) => cut > previous.at && cut <= point.at))) {
      paths.push(current);
      current = [];
    }
    current.push(point);
  });
  if (current.length) paths.push(current);
  const lines = paths
    .map((path) =>
      path.length === 1
        ? `<circle class="cycle-dot" cx="${px(path[0].at)}" cy="${py(path[0].value)}" r="3"/>`
        : `<path class="cycle-line" d="M${path.map((point) => `${px(point.at)} ${py(point.value)}`).join("L")}"/>`,
    )
    .join("");
  const marks = events
    .filter((event) => new Date(event.recorded_at).getTime() >= fromAt)
    .map((event) => {
      const x = px(new Date(event.recorded_at).getTime());
      const text = `${GLAND_KIND[event.kind] || event.kind}${event.initial_mm == null ? "" : " · " + fmtMm(event.initial_mm, 2)} · ${fmtDateTime(event.recorded_at)}`;
      return `<path class="chart-riser${event.kind === "check" ? " cycle-check" : ""}" d="M${x} 4V116"><title>${esc(text)}</title></path>`;
    })
    .join("");
  $id("cycleChart").innerHTML = marks + lines;
  // O eixo tem a mesma largura do gráfico principal (os dois compartilham o eixo do tempo); a unidade fica na legenda.
  $id("cycleAxis").innerHTML = [high, (high + low) / 2, low].map((value) => `<span>${fmtNum(value, usePercent || high - low >= 20 ? 0 : 1)}</span>`).join("");
  const last = points[points.length - 1];
  $id("cycleShown").textContent = !points.length
    ? "Ciclo de gaxeta: eventos no período, sem leitura válida depois da referência."
    : usePercent
      ? `Ajuste pelo ciclo de gaxeta (% da referência do engaxetamento) · último ${fmtNum(last.raw.percent)} % · ${fmtMm(last.raw.distance_mm, 2)}`
      : `Distância pelo ciclo de gaxeta (mm). Fim de ajuste não informado, sem percentual · última ${fmtMm(last.raw.distance_mm, 2)}`;
}
