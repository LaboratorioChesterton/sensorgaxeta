// =============================================================================
// Ciclo de gaxeta: referência individual registrada depois do engaxetamento.
//
// Procedimento (regra 2, migração 10): depois da troca ou do reajuste, o técnico
// reposiciona o potenciômetro na MARCA SUPERIOR validada da montagem, mede com o
// paquímetro a distância inicial e registra. Essa distância (D100) é o 100 % daquele
// ciclo. O servidor só aprova como referência elétrica (V100) uma leitura posterior
// ao registro, recente, estável, sem saturação e dentro da faixa esperada da marca
// superior; enquanto a marca não tem faixa caracterizada, o técnico confirma a
// leitura aqui, com a marca fisicamente mantida.
//
// Distância, percentual e avanço são calculados no servidor a partir da tensão
// calibrada e de uma inclinação comprovada na montagem (Conferência de medida, perfil
// da instalação). A placa não recebe nada. Sem calibração válida, a tela mostra o
// motivo e os dados elétricos, sem número de distância e sem recomendação.
//
// Os ciclos registrados antes da migração 10 (regra 1) continuam com o cálculo da
// época, identificados como estimativa nominal.
// =============================================================================
const glandPanelState = { key: "", status: null };
const glandForm = { mode: "cycle", sensorId: "", requestId: "", linkId: null, expected: null };
const newRequestId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (ch) => (Number(ch) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(ch) / 4)))).toString(16));

// Valor elétrico na grandeza da calibração do ciclo: volts quando a placa envia tensão
// calibrada, contagens do ADC quando o firmware é anterior ao 4.3.0.
const glandUnitIsVolt = (status, quantity) => (quantity ? quantity === "mv" : status.unit !== "contagens");
const fmtElectric = (status, value, quantity) =>
  value == null ? "—" : glandUnitIsVolt(status, quantity) ? fmtVolt(value) : fmtNum(value, 0) + " contagens";
const glandNextReading = (interval) => (Number(interval) > 12 ? `A placa envia a cada ${fmtInterval(interval)}: a próxima leitura pode levar esse tempo, mais o transporte.` : "");
const ANCHOR_MODE = { window: "aprovada sozinha, dentro da faixa esperada", confirmed: "confirmada pelo técnico", check: "leitura da conferência" };

const GLAND_STATE_TEXT = {
  unlinked: () => "Vincule o sensor a um spot para registrar o engaxetamento.",
  no_reference: () =>
    "Nenhum engaxetamento registrado nesta instalação. Depois de montar a gaxeta, reposicione o potenciômetro na marca superior, meça a distância inicial com o paquímetro e registre.",
  maintenance: (status) => `Manutenção iniciada em ${fmtDateTime(status.recorded_at)}. As leituras deste período não contam para o ajuste.`,
  waiting: (status, interval) => {
    const base = `Distância inicial de ${fmtMm(status.initial_mm, 2)} registrada em ${fmtDateTime(status.recorded_at)}. `;
    if (Number(status.rule) !== 2) return base + "Ela passa a valer na próxima leitura válida da placa. " + glandNextReading(interval);
    const reason = status.wait_reason;
    if (reason === "needs_confirmation")
      return base + "A marca superior desta instalação ainda não tem faixa elétrica caracterizada. Com o potenciômetro mantido na marca superior, confirme a leitura abaixo.";
    if (reason === "outside_window")
      return base + `A leitura atual (${fmtElectric(status, status.value)}) está fora da faixa esperada da marca superior (${fmtElectric(status, status.window?.lo)} a ${fmtElectric(status, status.window?.hi)}). Reposicione o potenciômetro na marca superior e aguarde a próxima leitura.`;
    if (reason === "saturated_high")
      return base + "A leitura está no limite superior do ADC (saturada). Nesta placa a marca superior fica fora da faixa mensurável: a medida informada está preservada, mas a calibração depende de ajuste no circuito.";
    if (reason === "no_sample") return base + "Mantenha o potenciômetro na marca superior até a plataforma confirmar a leitura. " + glandNextReading(interval);
    return base + (GLAND_WAIT[reason] || "Aguardando uma leitura válida") + ". " + glandNextReading(interval);
  },
  no_scale: (status) =>
    `Referência aprovada: ${fmtMm(status.initial_mm, 2)} em ${fmtElectric(status, status.anchor?.value, status.anchor?.quantity)}. Sem calibração de distância: ${(GLAND_SCALE_REASON[status.reason] || GLAND_SCALE_REASON.none).replace(/^./, (ch) => ch.toLowerCase())}.`,
  no_end: (status) =>
    status.reason === "outside_validated"
      ? "A distância está calibrada. O percentual não é mostrado porque o fim de ajuste informado cai fora da faixa elétrica validada: faça uma conferência no fim de ajuste, ou perto dele."
      : "A distância está calibrada. Informe a distância de fim de ajuste (em um novo registro) para a plataforma mostrar o percentual.",
  out_of_range: (status) =>
    `A tensão atual está ${status.reason === "above" ? "acima" : "abaixo"} da faixa validada (${fmtElectric(status, status.scale?.valid_lo)} a ${fmtElectric(status, status.scale?.valid_hi)}). O valor calculado é mostrado, sem classificação.`,
  unusable: (status) => `A última leitura não serve para o cálculo: ${(GLAND_WAIT[status.reason] || "sinal ruidoso, no fim da escala do sensor ou recebido com atraso").replace(/^./, (ch) => ch.toLowerCase())}.`,
  active: (status) => (Number(status.rule) === 2 ? "" : "Ciclo registrado na regra anterior (referência em qualquer posição do sensor). Os números abaixo são estimativa e não geram recomendação. Para calibrar, registre o engaxetamento com o potenciômetro na marca superior."),
};

function glandScaleText(status) {
  const scale = status.scale;
  if (!scale) return "—";
  if (Number(status.rule) !== 2) {
    if (scale.source === "measured")
      return `Regra anterior · medida em ${fmtDateTime(scale.recorded_at)}: ${fmtNum(scale.mm_per_count, 5)} mm por contagem (${fmtNum(scale.delta_mm, 2)} mm em ${fmtNum(scale.delta_adc, 0)} contagens)`;
    const anchor = status.anchor;
    const course = anchor && Number(anchor.adc) > 0 ? Math.round((Number(anchor.mm) / Number(anchor.adc)) * 4095) : null;
    return `Regra anterior · curso nominal do firmware${course ? ` (${course} mm na escala inteira do ADC)` : ""}. Estimativa`;
  }
  if (scale.source === "none") return "Sem calibração de distância";
  const volt = scale.unit !== "contagens";
  const slope = volt ? `${fmtNum(Number(scale.mm_per_unit) * 1000, 3)} mm por volt` : `${fmtNum(scale.mm_per_unit, 5)} mm por contagem`;
  const origin =
    scale.source === "measured"
      ? `Medida por conferência em ${fmtDateTime(scale.recorded_at)}` + (Number(scale.points) > 1 ? ` (${scale.points} pontos, maior desvio ${fmtNum(scale.max_residual_mm, 2)} mm)` : "")
      : scale.source === "endpoints"
        ? `Extremos do perfil da instalação (versão ${scale.profile_version})`
        : `Razão de transmissão documentada no perfil (versão ${scale.profile_version})`;
  const range = `faixa validada de ${fmtElectric(status, scale.valid_lo)} a ${fmtElectric(status, scale.valid_hi)}`;
  const resolution = scale.resolution_mm != null ? ` · menor movimento distinguível ≈ ${fmtNum(scale.resolution_mm, 2)} mm` : "";
  return `${origin}: ${slope} · ${range}${resolution}`;
}
function glandLiveFields(status) {
  const computed = status.distance_mm != null && ["active", "no_end", "out_of_range"].includes(status.state);
  const ruleTwo = Number(status.rule) === 2;
  const current = status.current;
  const percent = Number(status.percent);
  return {
    now: computed ? fmtMm(status.distance_mm, 2) + (status.state === "out_of_range" ? " (fora da faixa calibrada)" : "") : "—",
    percent:
      computed && status.percent != null
        ? fmtNum(Math.max(0, Math.min(100, percent))) + " %" + (percent > 100 || percent < 0 ? ` (calculado ${fmtNum(percent)} %)` : "") + (ruleTwo ? "" : " · estimativa")
        : "—",
    advance: computed && status.advance_mm != null ? fmtMm(status.advance_mm, 2) : "—",
    volt: !current
      ? "—"
      : `${fmtVolt(current.voltage_mv)} ${current.voltage_source === "calibrated" ? "calibrada" : "estimada"} · ADC ${fmtNum(current.adc, 0)}` +
        (current.adc_min != null ? ` (${fmtNum(current.adc_min, 0)} a ${fmtNum(current.adc_max, 0)})` : "") +
        ` · dispersão ${fmtNum(current.noise, 1)} · ${fmtDateTime(current.sampled_at)}`,
    warn: [
      status.near_limit ? "O potenciômetro está a menos de 5 % do fim do curso elétrico. Perto do batente a leitura deixa de acompanhar o movimento e o ADC pode saturar." : "",
      ruleTwo && current && current.voltage_source !== "calibrated" ? "A placa ainda não envia tensão calibrada (firmware anterior ao 4.3.0). O cálculo deste ciclo usa as contagens do ADC." : "",
      status.scale?.source === "none" && status.scale?.reason === "inverted" ? "Sentido invertido: a distância medida subiu enquanto a tensão caiu. Confira se o sensor está montado no sentido certo e a ligação dos extremos do potenciômetro." : "",
    ].filter(Boolean),
  };
}
function renderGlandPanel(status, device) {
  const panel = $id("glandPanel");
  if (!panel) return;
  const view = cycleView(status, device);
  const interval = state.gland.get(device.sensor_id)?.interval_s;
  const live = glandLiveFields(status);
  const ruleTwo = Number(status.rule) === 2;
  const cycleEvent = (status.events || []).find((event) => event.id === status.cycle_event_id);
  const rows = [];
  if (status.initial_mm != null) {
    rows.push(["Distância inicial (100 %)", `${fmtMm(status.initial_mm, 2)} · ${GLAND_KIND[status.kind] || ""} em ${fmtDateTime(status.recorded_at)}${cycleEvent?.actor ? " · " + cycleEvent.actor : ""}`]);
    rows.push(["Fim de ajuste (0 %)", status.end_mm == null ? "Não informado: sem percentual" : fmtMm(status.end_mm, 2)]);
    rows.push(["Distância atual", `<span id="glandNow">${esc(live.now)}</span>`, true]);
    rows.push(["Ajuste do ciclo", `<span id="glandPct">${esc(live.percent)}</span>`, true]);
    rows.push(["Avanço", `<span id="glandAdv">${esc(live.advance)}</span>`, true]);
    rows.push(["Tensão atual", `<span id="glandAdc">${esc(live.volt)}</span>`, true]);
    if (status.anchor && ruleTwo)
      rows.push(["Tensão na referência", `${fmtElectric(status, status.anchor.value, status.anchor.quantity)} · ${ANCHOR_MODE[status.anchor.mode] || ""}${status.anchor.actor ? " (" + status.anchor.actor + ")" : ""} · amostra de ${fmtDateTime(status.anchor.sampled_at)}`]);
    else if (status.anchor) rows.push(["Sensor na referência", `ADC ${fmtNum(status.anchor.adc, 0)} (${fmtNum((Number(status.anchor.adc) / 4095) * 100)} % da escala) em ${fmtDateTime(status.anchor.sampled_at)}`]);
    if (ruleTwo && status.scale?.v0 != null) rows.push(["Tensão no fim de ajuste", fmtElectric(status, status.scale.v0) + (status.scale.end_ok ? "" : " · fora da faixa validada")]);
    if (status.anchor) rows.push(["Calibração", glandScaleText(status)]);
    if (ruleTwo)
      rows.push([
        "Marca superior",
        status.window
          ? `Esperada de ${fmtElectric(status, status.window.lo, status.window.quantity)} a ${fmtElectric(status, status.window.hi, status.window.quantity)} (${status.window.source === "profile" ? "perfil da instalação, versão " + status.window.profile_version : "última referência confirmada pelo técnico"})`
          : "Ainda não caracterizada nesta instalação: a referência é confirmada pelo técnico",
      ]);
  }
  const actions = [];
  const candidate = status.state === "waiting" && status.candidate && status.can_operate ? status.candidate : null;
  if (candidate)
    actions.push(`<button class="primary" data-gland="confirm">${glyph("ruler")}Confirmar leitura na marca superior</button>`);
  if (status.can_operate && status.state !== "unlinked") {
    actions.push(`<button class="${candidate ? "secondary" : "primary"}" data-gland="cycle">${candidate ? "" : glyph("ruler")}Registrar engaxetamento</button>`);
    if (["active", "no_scale", "no_end", "out_of_range", "unusable"].includes(status.state) || (status.state === "waiting" && !ruleTwo))
      actions.push(`<button class="secondary" data-gland="check">Conferir medida</button>`);
    if (status.state !== "maintenance") actions.push(`<button class="secondary" data-gland="maintenance">${glyph("wrench")}Iniciar manutenção</button>`);
  }
  const events = (status.events || [])
    .map((event) => {
      const measure = event.initial_mm == null ? "" : ` · ${fmtMm(event.initial_mm, 2)}${event.end_mm == null ? "" : ` (fim de ajuste ${fmtMm(event.end_mm, 2)})`}`;
      const anchor =
        event.kind === "maintenance"
          ? ""
          : !event.anchor
            ? " · sem leitura aprovada"
            : event.anchor.value != null
              ? ` · ${fmtElectric(status, event.anchor.value, event.anchor.quantity)}, ${ANCHOR_MODE[event.anchor.mode] || "leitura associada"}`
              : ` · sensor no ADC ${fmtNum(event.anchor.adc, 0)}`;
      return `<li><b>${esc(GLAND_KIND[event.kind] || event.kind)}</b>${esc(measure)}<small>${esc(fmtDateTime(event.recorded_at))}${event.actor ? " · " + esc(event.actor) : ""}${esc(anchor)}${Number(event.rule) === 1 ? " · regra anterior" : ""}</small></li>`;
    })
    .join("");
  const stateText = (GLAND_STATE_TEXT[status.state] || (() => ""))(status, interval);
  const candidateText = candidate
    ? `<p class="gland-candidate">Leitura para confirmar: <b>${esc(fmtElectric(status, candidate.value, candidate.quantity))}</b> · ADC ${esc(fmtNum(candidate.adc, 0))} · dispersão ${esc(fmtNum(candidate.noise, 1))} · ${esc(fmtDateTime(candidate.sampled_at))}</p>`
    : "";
  panel.innerHTML =
    `<h3>Ciclo da gaxeta <span class="adjustment-badge health-${view.key}">${esc(view.label)}</span></h3>` +
    (stateText ? `<p class="form-help">${esc(stateText)}</p>` : "") +
    candidateText +
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
    out_of_range: status.out_of_range, near_limit: status.near_limit, rule: status.rule, calibrated: status.calibrated,
    advance_mm: status.advance_mm, wait_reason: status.wait_reason, reason: status.reason, unit: status.unit,
    voltage_mv: status.current?.voltage_mv, voltage_source: status.current?.voltage_source, quality: status.current?.quality, adc: status.current?.adc,
  });
  const key = JSON.stringify([
    sensorId, status.state, status.event_id, status.link_id, status.can_operate, status.scale?.source, status.scale?.event_id, status.scale?.profile_version,
    status.anchor?.id, (status.events || []).length, status.wait_reason, status.reason, status.candidate?.reading_id, status.window?.lo, status.window?.hi, status.scale?.end_ok,
  ]);
  if (force || key !== glandPanelState.key) {
    glandPanelState.key = key;
    renderGlandPanel(status, device);
  } else {
    const live = glandLiveFields(status);
    if ($id("glandNow")) $id("glandNow").textContent = live.now;
    if ($id("glandPct")) $id("glandPct").textContent = live.percent;
    if ($id("glandAdv")) $id("glandAdv").textContent = live.advance;
    if ($id("glandAdc")) $id("glandAdc").textContent = live.volt;
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
  const volt = voltageInfo(device, state.gland.get(device.sensor_id));
  const saturated = Number(device.last_adc_max) >= 4095 || Number(device.last_adc_raw) >= 4095;
  return (
    `Sensor agora: ${volt.text}${volt.source ? " " + volt.source : ""} · ${status.label}` +
    (status.online ? "" : ". A referência só passa a valer quando a placa enviar a próxima leitura válida") +
    (saturated ? ". A leitura atual está saturada no limite superior do ADC: nesta posição a plataforma não consegue aprovar a referência" : "") +
    (Number.isFinite(noise) && noise > 25 ? `. Sinal instável (dispersão de ${fmtNum(noise, 0)} contagens): confira a fixação e os fios antes de registrar` : "") +
    "."
  );
}
function openGlandDialog(mode) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  if (!status || !device || !status.can_operate) return;
  Object.assign(glandForm, { mode, sensorId: device.sensor_id, requestId: newRequestId(), linkId: status.link_id, expected: status.event_id ?? null });
  const check = mode === "check";
  const interval = state.gland.get(device.sensor_id)?.interval_s;
  $id("glandTitle").textContent = check ? "Conferir medida" : "Registrar engaxetamento";
  $id("glandSubmit").textContent = check ? "Registrar conferência" : "Registrar engaxetamento";
  $id("glandContext").textContent = glandContextLine(device);
  $id("glandKindField").hidden = check;
  $id("glandEndField").hidden = check;
  $id("glandTopField").hidden = check;
  $id("glandTop").checked = false;
  $id("glandMmLabel").textContent = check ? "Distância medida agora com o paquímetro (mm)" : "Distância inicial medida com o paquímetro (mm) — 100 % deste ciclo";
  $id("glandMm").value = "";
  $id("glandEnd").value = check || status.end_mm == null ? "" : String(Number(status.end_mm)).replace(".", ",");
  document.querySelector('input[name="glandKind"][value="replacement"]').checked = true;
  $id("glandHelp").textContent = check
    ? `Meça agora, na mesma referência mecânica usada na distância inicial (${fmtMm(status.initial_mm, 2)} em ${fmtDateTime(status.recorded_at)}), e deixe o conjunto parado até a próxima leitura. A conferência é o segundo ponto da calibração: precisa de pelo menos 0,1 V (100 contagens) de diferença em relação à referência e a distância tem de cair junto com a tensão. Feita no fim de ajuste, ela também valida o 0 %. A conferência não abre um ciclo novo. ${glandNextReading(interval)}`
    : `Antes de registrar, coloque o potenciômetro na marca superior validada desta montagem e confira pela marca física. Meça a distância entre o preme-gaxeta e a referência mecânica do equipamento: essa medida é o 100 % deste ciclo, seja ela 12, 15 ou 40 mm. O fim de ajuste é a mesma distância quando não resta aperto (pode ser maior que zero). Sem ele, a plataforma mostra milímetros, sem percentual. Mantenha o sensor na marca superior até a plataforma confirmar a leitura. ${glandNextReading(interval)}`;
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
  if (measured == null || measured <= 0) return void (message.textContent = "Informe a distância medida em milímetros, maior que zero, com até três casas decimais (use vírgula ou ponto).");
  if (!check && endText && (end == null || end >= measured)) return void (message.textContent = "O fim de ajuste deve ser um número menor que a distância inicial (0 é aceito).");
  if (!check && !$id("glandTop").checked) return void (message.textContent = "Confirme que o potenciômetro está na marca superior. Com o sensor em outra posição a referência não é aprovada.");
  const kind = check ? "check" : document.querySelector('input[name="glandKind"]:checked').value;
  message.textContent = "Registrando…";
  await withBusy($id("glandSubmit"), async () => {
    try {
      const saved = await sendGlandEvent(kind, measured, end);
      $id("glandDialog").close();
      const status = glandPanelState.status;
      showMessage(
        check
          ? "Conferência registrada. Deixe o conjunto parado: a calibração é recalculada com a próxima leitura válida do sensor."
          : `${GLAND_KIND[kind]} registrada${saved.duplicate ? " (já estava gravada)" : ""}: ${fmtMm(measured, 2)} é a distância inicial (100 %) deste ciclo` +
              (status?.state === "waiting" ? ". Mantenha o sensor na marca superior até a leitura ser confirmada." : "."),
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
// Confirmação, pelo técnico, de que a leitura candidata foi colhida com o sensor na marca superior.
async function confirmGlandAnchor(button) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  const candidate = status?.candidate;
  if (!status || !device || !candidate) return;
  const outside = status.wait_reason === "outside_window";
  const confirmed = await askConfirm({
    title: "Confirmar leitura na marca superior",
    html:
      `<p>Sensor <b>${esc(glandContextLine(device))}</b>.</p>` +
      `<p>Leitura de ${esc(fmtDateTime(candidate.sampled_at))}: <b>${esc(fmtElectric(status, candidate.value, candidate.quantity))}</b> (ADC ${esc(fmtNum(candidate.adc, 0))}, dispersão ${esc(fmtNum(candidate.noise, 1))} contagens).</p>` +
      (outside ? `<p><b>Atenção:</b> a faixa esperada da marca superior nesta instalação é de ${esc(fmtElectric(status, status.window?.lo, status.window?.quantity))} a ${esc(fmtElectric(status, status.window?.hi, status.window?.quantity))}. Confirme só se a marca física foi conferida agora e a montagem mudou.</p>` : "") +
      `<p>Confirme apenas se o potenciômetro está, fisicamente, na marca superior desta montagem e não foi movido desde essa leitura. Ela passa a ser a referência elétrica (100 %) da distância inicial de <b>${esc(fmtMm(status.initial_mm, 2))}</b> e define a faixa esperada da marca superior para os próximos ciclos. Uma referência aprovada não é substituída: para trocar, é preciso um novo registro.</p>`,
    okLabel: "Confirmar referência",
    danger: false,
  });
  if (!confirmed) return;
  await withBusy(button, async () => {
    try {
      await callRpc("gaxeta_confirm_gland_anchor", { p_sensor_id: device.sensor_id, p_link_id: status.link_id, p_event_id: status.cycle_event_id, p_reading_id: candidate.reading_id });
      await refreshGlandPanel(true);
      await afterSensorChange();
      showMessage("Referência confirmada. Para a plataforma calcular a distância falta o segundo ponto: use Conferir medida depois do primeiro avanço ou no fim de ajuste.", "success");
    } catch (error) {
      if (error?.code === "PT409") await refreshGlandPanel(true).catch(() => {});
      throw error;
    }
  });
}
$id("detailPane").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-gland]");
  if (!button) return;
  const mode = button.dataset.gland;
  if (mode === "confirm") return confirmGlandAnchor(button).catch((error) => showMessage(errorText(error), "error"));
  if (mode !== "maintenance") return openGlandDialog(mode);
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  if (!status || !device) return;
  const confirmed = await askConfirm({
    title: "Iniciar manutenção",
    html: `<p>Sensor <b>${esc(glandContextLine(device))}</b>.</p><p>Use antes de desacoplar ou movimentar o sensor. Enquanto a manutenção estiver aberta, as leituras continuam gravadas, mas não contam para o ajuste da gaxeta. Ao terminar, recoloque o potenciômetro na marca superior e use <b>Registrar engaxetamento</b>.</p>`,
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
// Cada ponto é calculado no servidor com a regra, a referência e o modelo que valiam na
// época da leitura (gaxeta_gland_history). Um ciclo novo ou um perfil novo não redesenha o passado.
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
  if (telem.loaded?.sensorId === sensorId) telem.loaded.cycle = data; // usado pelo CSV: mesma amostra, mesmo cálculo
  renderCycleChart(data, range);
}
function renderCycleChart(data, range) {
  const panel = $id("cyclePanel");
  const events = data?.events || [];
  // A unidade segue o ciclo mais recente do período: percentual quando ele tem fim de ajuste válido, milímetros quando não tem.
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
  const gapMs = Math.max(3 * (Number(data.bucket_seconds) || 1) * 1000, 90e3, 2.5 * (Number(state.gland.get(state.sensorId)?.interval_s) || 0) * 1000);
  const paths = [];
  let current = [];
  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (previous && (point.at - previous.at > gapMs || cuts.some((cut) => cut > previous.at && cut <= point.at) || Boolean(point.raw.nominal) !== Boolean(previous.raw.nominal))) {
      paths.push(current);
      current = [];
    }
    current.push(point);
  });
  if (current.length) paths.push(current);
  const lines = paths
    .map((path) => {
      const estimate = path[0].raw.nominal || Number(path[0].raw.rule) === 1 ? " cycle-estimate" : "";
      return path.length === 1
        ? `<circle class="cycle-dot${estimate}" cx="${px(path[0].at)}" cy="${py(path[0].value)}" r="3"/>`
        : `<path class="cycle-line${estimate}" d="M${path.map((point) => `${px(point.at)} ${py(point.value)}`).join("L")}"/>`;
    })
    .join("");
  // Leituras fora da faixa calibrada: o valor fica, marcado.
  const flags = points
    .filter((point) => point.raw.out_of_range)
    .map((point) => `<circle class="cycle-off" cx="${px(point.at)}" cy="${py(point.value)}" r="4"><title>Fora da faixa calibrada · ${esc(fmtDateTime(point.raw.received_at))}</title></circle>`)
    .join("");
  const marks = events
    .filter((event) => new Date(event.recorded_at).getTime() >= fromAt)
    .map((event) => {
      const x = px(new Date(event.recorded_at).getTime());
      const text = `${GLAND_KIND[event.kind] || event.kind}${event.initial_mm == null ? "" : " · " + fmtMm(event.initial_mm, 2)} · ${fmtDateTime(event.recorded_at)}`;
      return `<path class="chart-riser${event.kind === "check" ? " cycle-check" : ""}" d="M${x} 4V116"><title>${esc(text)}</title></path>`;
    })
    .join("");
  $id("cycleChart").innerHTML = marks + lines + flags;
  // O eixo tem a mesma largura do gráfico principal (os dois compartilham o eixo do tempo); a unidade fica na legenda.
  $id("cycleAxis").innerHTML = [high, (high + low) / 2, low].map((value) => `<span>${fmtNum(value, usePercent || high - low >= 20 ? 0 : 1)}</span>`).join("");
  const last = points[points.length - 1];
  const tail = !last
    ? ""
    : ` · ${fmtMm(last.raw.distance_mm, 2)}` +
      (last.raw.advance_mm != null ? ` · avanço ${fmtMm(last.raw.advance_mm, 2)}` : "") +
      (last.raw.voltage_mv != null ? ` · ${fmtVolt(last.raw.voltage_mv)} calibrada` : "") +
      (last.raw.nominal || Number(last.raw.rule) === 1 ? " · estimativa (regra anterior)" : "") +
      (last.raw.out_of_range ? " · fora da faixa calibrada" : "");
  $id("cycleShown").textContent = !points.length
    ? "Ciclo de gaxeta: eventos no período, sem leitura com distância calculada (sem calibração de distância ou aguardando referência)."
    : usePercent
      ? `Ajuste pelo ciclo de gaxeta (% da distância inicial) · último ${fmtNum(last.raw.percent)} %${tail}`
      : `Distância pelo ciclo de gaxeta (mm), sem percentual · última${tail.replace(/^ ·/, "")}`;
}
