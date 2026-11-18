// =============================================================================
// Ciclo de gaxeta: referência individual registrada depois do engaxetamento.
//
// Procedimento (regra 2, migrações 10 e 11): depois da troca ou do reajuste, o técnico
// reposiciona o potenciômetro na MARCA SUPERIOR da montagem, mede com o paquímetro a
// distância inicial (D100, o 100 % do ciclo) e, se souber, a distância de fim de ajuste
// (D0, o 0 % do ciclo; pode ser 3 mm, não precisa ser zero) e registra.
//
// Salvar as medidas e aprovar a leitura são passos diferentes:
//   1. O cadastro é gravado com a caixa de confirmação marcada e valores válidos, mesmo
//      que a leitura atual esteja no limite do ADC. A tela mostra o número e o horário do
//      registro e "Medidas salvas · aguardando leitura apta".
//   2. O servidor só aprova como referência elétrica (V100) uma leitura posterior ao
//      registro, de agora, estável, fora do limite do ADC e, com a marca já caracterizada,
//      dentro da faixa esperada. No primeiro comissionamento o técnico confirma a leitura.
//   3. Comissionamento em dois pontos: com o topo aprovado, uma Conferência de medida no
//      fim de ajuste (ou em outra posição conhecida) dá V0/D0 e a inclinação. Gravado no
//      perfil da instalação, os ciclos seguintes dispensam repetir o comissionamento.
//
// Distância, percentual e avanço são calculados no servidor. A placa não recebe nada.
// Sem escala validada a tela mostra a posição elétrica (%) e a tensão, e deixa ciclo e
// milímetros como indisponíveis, com o passo que falta.
//
// Os ciclos registrados antes da migração 10 (regra 1) continuam com o cálculo da
// época, identificados como estimativa nominal.
// =============================================================================
const glandPanelState = { key: "", status: null };
const glandForm = { mode: "cycle", sensorId: "", requestId: "", linkId: null, expected: null };
// Rascunho do formulário por sensor e modo: fechar o diálogo sem enviar não perde o que foi digitado.
const glandDraft = new Map();
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
// Milímetros sem casas desnecessárias: 15 mm, 3 mm, 12,5 mm.
const fmtMmShort = (value) => (value == null || !Number.isFinite(Number(value)) ? "—" : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 3 }) + " mm");
const fmtSeconds = (seconds) => (seconds == null || !Number.isFinite(Number(seconds)) ? "—" : Number(seconds) < 90 ? `${Math.round(Number(seconds))} s` : `${Math.round(Number(seconds) / 60)} min`);
// "15 mm e 3 mm" (ou só "15 mm" quando o fim de ajuste não foi informado).
const glandPair = (initial, end) => fmtMmShort(initial) + (end == null ? "" : " e " + fmtMmShort(end));
// Frase curta do cadastro: "Começa em 15 mm. Quando chegar a 3 mm, acaba o ajuste. Curso útil de 12 mm."
function glandCourseText(initial, end) {
  if (initial == null || !(initial > 0)) return "";
  if (end == null) return `Começa em ${fmtMmShort(initial)}. Sem a distância de fim de ajuste a plataforma mostra milímetros, sem percentual.`;
  if (!(end < initial)) return "";
  return `Começa em ${fmtMmShort(initial)}. Quando chegar a ${fmtMmShort(end)}, acaba o ajuste. Curso útil de ${fmtMmShort(Math.round((initial - end) * 1000) / 1000)}.`;
}
// Identificação do registro vigente: número, horário e medidas (só o que o servidor gravou).
function glandSavedLine(status) {
  const event = (status.events || []).find((item) => item.id === status.cycle_event_id);
  return `Registro nº ${status.cycle_event_id} de ${fmtDateTime(status.recorded_at)}${event?.actor ? " (" + event.actor + ")" : ""}.`;
}

const GLAND_STATE_TEXT = {
  unlinked: () => "Vincule o sensor a um spot para registrar o engaxetamento.",
  no_reference: () =>
    "Nenhum engaxetamento registrado nesta instalação. Depois de montar a gaxeta, coloque o potenciômetro na marca superior, meça a distância inicial com o paquímetro e registre.",
  maintenance: (status) => `Manutenção iniciada em ${fmtDateTime(status.recorded_at)}. As leituras deste período não contam para o ajuste.`,
  waiting: (status, interval) => {
    if (Number(status.rule) !== 2)
      return `Distância inicial de ${fmtMm(status.initial_mm, 2)} registrada em ${fmtDateTime(status.recorded_at)}. Ela passa a valer na próxima leitura válida da placa. ` + glandNextReading(interval);
    const base = `Medidas salvas · aguardando leitura apta. ${glandSavedLine(status)} ${glandPair(status.initial_mm, status.end_mm)} salvos. `;
    const reason = status.wait_reason;
    const block = status.current?.block;
    if (reason === "needs_confirmation")
      return base + "A marca superior desta instalação ainda não tem faixa elétrica caracterizada: a primeira confirmação define a faixa esperada para os próximos ciclos. Com o potenciômetro mantido na marca superior, confira a leitura abaixo e confirme.";
    if (reason === "outside_window")
      return base + `A leitura atual (${fmtElectric(status, status.value)}) está fora da faixa esperada da marca superior (${fmtElectric(status, status.window?.lo)} a ${fmtElectric(status, status.window?.hi)}). Reposicione o potenciômetro na marca superior e aguarde a próxima leitura.`;
    if (reason === "saturated_high")
      return base + (block === "mixed_high" || block === "touch_high"
        ? BLOCK_HINT[block]
        : `Para calibrar a distância, o topo precisa ficar na faixa mensurável. ${BLOCK_HINT.ceiling}`);
    if (reason === "unstable") return base + BLOCK_HINT.unstable + " " + glandNextReading(interval);
    if (reason === "aged")
      return base + `A última leitura chegou há ${fmtSeconds(status.current?.age_s)} e não é mais oferecida para confirmação (limite de ${fmtSeconds(status.confirm_max_age_s)} para esta placa). Mantenha o sensor na marca superior e aguarde a próxima. ` + glandNextReading(interval);
    if (reason === "stale")
      return base + `A última leitura levou ${fmtSeconds(status.current?.transport_s)} da amostra até o servidor (limite de 30 s) e não serve de referência. Aguarde a próxima. ` + glandNextReading(interval);
    if (reason === "no_sample") return base + "Mantenha o potenciômetro na marca superior até a plataforma receber uma leitura posterior ao registro. " + glandNextReading(interval);
    return base + (glandWaitText({ wait_reason: reason, block }) || "Aguardando uma leitura válida") + ". " + glandNextReading(interval);
  },
  no_scale: (status) =>
    `Referência aprovada: ${fmtMm(status.initial_mm, 2)} em ${fmtElectric(status, status.anchor?.value, status.anchor?.quantity)}. Sem calibração de distância: ${(GLAND_SCALE_REASON[status.reason] || GLAND_SCALE_REASON.none).replace(/^./, (ch) => ch.toLowerCase())}. Até lá valem a posição elétrica (%) e a tensão.`,
  no_end: (status) =>
    status.reason === "outside_validated"
      ? "A distância está calibrada no trecho já conferido. O percentual aparece quando o fim de ajuste for validado: faça uma Conferência de medida no fim de ajuste, ou perto dele."
      : "A distância está calibrada. Informe a distância de fim de ajuste (em um novo registro) para a plataforma mostrar o percentual.",
  out_of_range: (status) =>
    `A tensão atual está ${status.reason === "above" ? "acima" : "abaixo"} da faixa validada (${fmtElectric(status, status.scale?.valid_lo)} a ${fmtElectric(status, status.scale?.valid_hi)}). O valor calculado é mostrado, sem classificação.`,
  unusable: (status) =>
    `A última leitura não serve para o cálculo: ${(BLOCK_HINT[status.current?.block] || glandWaitText({ reason: status.reason, block: status.current?.block }) || "sinal ruidoso, no limite da escala do ADC ou recebido com atraso").replace(/^./, (ch) => ch.toLowerCase())}`,
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
        : `Razão medida, gravada no perfil da instalação (versão ${scale.profile_version})`;
  const range = `faixa validada de ${fmtElectric(status, scale.valid_lo)} a ${fmtElectric(status, scale.valid_hi)}`;
  const resolution = scale.resolution_mm != null ? ` · menor movimento distinguível ≈ ${fmtNum(scale.resolution_mm, 2)} mm` : "";
  return `${origin}: ${slope} · ${range}${resolution}`;
}
function glandLiveFields(status) {
  const computed = status.distance_mm != null && ["active", "no_end", "out_of_range"].includes(status.state);
  const ruleTwo = Number(status.rule) === 2;
  const current = status.current;
  const percent = Number(status.percent);
  const block = current?.block;
  return {
    now: computed ? fmtMm(status.distance_mm, 2) + (status.state === "out_of_range" ? " (fora da faixa calibrada)" : "") : "Indisponível",
    percent:
      computed && status.percent != null
        ? fmtNum(Math.max(0, Math.min(100, percent))) + " %" + (percent > 100 || percent < 0 ? ` (calculado ${fmtNum(percent)} %)` : "") + (ruleTwo ? "" : " · estimativa")
        : "Indisponível",
    advance: computed && status.advance_mm != null ? fmtMm(status.advance_mm, 2) : "Indisponível",
    electric: !current ? "—" : `${fmtNum(current.electric_percent ?? (Number(current.adc) / 4095) * 100)} % da escala do ADC${current.at_ceiling ? " · Limite do ADC" : ""}`,
    volt: !current
      ? "—"
      : `${fmtVolt(current.voltage_mv)} ${current.voltage_source === "calibrated" ? "calibrada" : "estimada"} · ${BLOCK_SHORT[block] || QUALITY_FALLBACK[current.quality] || "—"} · ADC ${fmtNum(current.adc, 0)}` +
        (current.adc_min != null ? ` (${fmtNum(current.adc_min, 0)} a ${fmtNum(current.adc_max, 0)})` : "") +
        ` · dispersão ${fmtNum(current.noise, 1)} · ${fmtDateTime(current.sampled_at)}`,
    warn: [
      // O aviso de 5 % vem de um limiar sobre a escala do ADC: não mede a distância até o batente físico.
      block && block !== "ok" && BLOCK_HINT[block]
        ? ""
        : status.near_limit
          ? "A leitura está nos 5 % finais da escala do ADC (abaixo de 205 ou acima de 3.890 contagens). O aviso vem da escala elétrica: não mede a distância até o batente do potenciômetro. Perto do limite o ADC pode saturar e a leitura deixa de servir para calibrar."
          : "",
      ruleTwo && current && current.voltage_source !== "calibrated" ? "A placa ainda não envia tensão calibrada (firmware anterior ao 4.3.0). O cálculo deste ciclo usa as contagens do ADC." : "",
      status.scale?.source === "none" && status.scale?.reason === "inverted" ? "Sentido invertido: a distância medida subiu enquanto a tensão caiu. Confira se o sensor está montado no sentido certo e a ligação dos extremos do potenciômetro." : "",
    ].filter(Boolean),
  };
}
const QUALITY_FALLBACK = { ok: "bloco bom", unstable: "bloco instável", saturated_high: "limite superior do ADC", saturated_low: "limite inferior do ADC", missing: "sem dados do bloco" };

// Passos do comissionamento em dois pontos do ciclo vigente (regra 2).
function glandSteps(status) {
  if (Number(status.rule) !== 2 || status.initial_mm == null || status.state === "maintenance") return "";
  const scale = status.scale;
  const hasSlope = scale && scale.source && scale.source !== "none";
  const origin = status.profile?.origin;
  const step = (done, title, detail) => `<li class="${done ? "done" : "todo"}"><b>${esc(title)}</b><span>${esc(detail)}</span></li>`;
  const top = status.anchor
    ? `${fmtMmShort(status.initial_mm)} em ${fmtElectric(status, status.anchor.value, status.anchor.quantity)} (V100), ${ANCHOR_MODE[status.anchor.mode] || "aprovada"}`
    : `${fmtMmShort(status.initial_mm)} salvos; leitura elétrica pendente`;
  const second = hasSlope
    ? scale.source === "measured"
      ? scale.end_ok && status.end_mm != null
        ? `${fmtMmShort(status.end_mm)} em ${fmtElectric(status, scale.v0)} (V0)`
        : "segundo ponto medido; o fim de ajuste ainda não foi validado"
      : `reaproveitado do perfil da instalação (versão ${scale.profile_version})` + (scale.v0 != null && status.end_mm != null ? `: ${fmtMmShort(status.end_mm)} em ${fmtElectric(status, scale.v0)} (V0)` : "")
    : status.anchor
      ? `leve o conjunto ${status.end_mm != null ? "a " + fmtMmShort(status.end_mm) : "a uma posição conhecida"} (ou a outra distância medida), meça com o paquímetro e use Conferir medida`
      : "depois da referência no topo";
  const verify = hasSlope
    ? Number(scale.points) > 1
      ? `${scale.points} pontos medidos, maior desvio ${fmtNum(scale.max_residual_mm, 2)} mm`
      : "recomendado: confira um ponto intermediário com o paquímetro (Conferir medida)"
    : "depois do segundo ponto";
  const profile = scale?.source === "ratio" || scale?.source === "endpoints"
    ? `versão ${scale.profile_version} em uso` + (origin ? ` (comissionada no registro nº ${origin.cycle_event_id})` : "")
    : status.commission
      ? status.can_profile ? "pronto para gravar: os próximos ciclos dispensam repetir o comissionamento" : "pronto; um administrador de nível 1 ou 2 grava no perfil"
      : "depois dos dois pontos";
  return (
    `<ol class="gland-steps" aria-label="Comissionamento em dois pontos">` +
    step(!!status.anchor, "1 · Topo (100 %)", top) +
    step(hasSlope && (scale.source !== "measured" || !!scale.end_ok || status.end_mm == null), `2 · ${status.end_mm != null ? "Fim de ajuste (0 %)" : "Segundo ponto"}`, second) +
    step(hasSlope && (Number(scale.points) > 1 || scale.source !== "measured"), "3 · Ponto intermediário", verify) +
    step(scale?.source === "ratio" || scale?.source === "endpoints", "4 · Perfil da instalação", profile) +
    `</ol>`
  );
}
function glandCandidateHtml(status, candidate) {
  const peak = candidate.below_peak ? candidate.peak : null;
  return (
    `<div class="gland-candidate"><p>Leitura para confirmar: <b>${esc(fmtElectric(status, candidate.value, candidate.quantity))}</b>` +
    (candidate.electric_percent != null ? ` · ${esc(fmtNum(candidate.electric_percent))} % da escala elétrica` : "") +
    ` · ADC ${esc(fmtNum(candidate.adc, 0))} · dispersão ${esc(fmtNum(candidate.noise, 1))}</p>` +
    `<p>Amostra de ${esc(fmtDateTime(candidate.sampled_at))}` +
    (candidate.age_s != null ? ` · recebida há ${esc(fmtSeconds(candidate.age_s))} (pode ser confirmada até ${esc(fmtSeconds(candidate.max_age_s))}) · transporte de ${esc(fmtSeconds(candidate.transport_s))}` : "") +
    `</p>` +
    (peak
      ? `<p class="gland-alert"><b>Atenção:</b> depois do registro o sensor já mostrou uma posição mais alta (${esc(peak.block === "ceiling" ? "limite do ADC, 100 %" : fmtNum(peak.electric_percent) + " %")} em ${esc(fmtDateTime(peak.sampled_at))}). Se o potenciômetro saiu do topo, esta leitura é intermediária e não deve ser confirmada como máximo.</p>`
      : "") +
    `</div>`
  );
}
function renderGlandPanel(status, device) {
  const panel = $id("glandPanel");
  if (!panel) return;
  const view = cycleView({ ...status, block: status.current?.block, electric_percent: status.current?.electric_percent }, device);
  const interval = state.gland.get(device.sensor_id)?.interval_s;
  const live = glandLiveFields(status);
  const ruleTwo = Number(status.rule) === 2;
  const cycleEvent = (status.events || []).find((event) => event.id === status.cycle_event_id);
  const rows = [];
  if (status.initial_mm != null) {
    rows.push(["Distância inicial (100 %)", `${fmtMm(status.initial_mm, 2)} · ${GLAND_KIND[status.kind] || ""} em ${fmtDateTime(status.recorded_at)}${cycleEvent?.actor ? " · " + cycleEvent.actor : ""}`]);
    rows.push(["Fim de ajuste (0 %)", status.end_mm == null ? "Não informado: sem percentual" : `${fmtMm(status.end_mm, 2)} · curso útil de ${fmtMm(Number(status.initial_mm) - Number(status.end_mm), 2)}`]);
    rows.push(["Posição elétrica", `<span id="glandElec">${esc(live.electric)}</span>`, true]);
    rows.push(["Tensão atual", `<span id="glandAdc">${esc(live.volt)}</span>`, true]);
    rows.push(["Distância atual", `<span id="glandNow">${esc(live.now)}</span>`, true]);
    rows.push(["Ajuste do ciclo", `<span id="glandPct">${esc(live.percent)}</span>`, true]);
    rows.push(["Avanço", `<span id="glandAdv">${esc(live.advance)}</span>`, true]);
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
          : "Ainda não caracterizada nesta instalação: a primeira confirmação do técnico define a faixa esperada",
      ]);
  }
  const actions = [];
  const candidate = status.state === "waiting" && status.candidate && status.can_operate ? status.candidate : null;
  if (candidate)
    actions.push(`<button class="primary" data-gland="confirm">${glyph("ruler")}Confirmar leitura na marca superior</button>`);
  if (status.can_operate && status.state !== "unlinked") {
    const needsSecond = ruleTwo && status.state === "no_scale";
    if (needsSecond) actions.push(`<button class="primary" data-gland="check">${glyph("ruler")}Conferir medida (segundo ponto)</button>`);
    actions.push(`<button class="${candidate || needsSecond ? "secondary" : "primary"}" data-gland="cycle">${candidate || needsSecond ? "" : glyph("ruler")}Registrar engaxetamento</button>`);
    if (!needsSecond && (["active", "no_end", "out_of_range", "unusable"].includes(status.state) || (status.state === "waiting" && !ruleTwo)))
      actions.push(`<button class="secondary" data-gland="check">Conferir medida</button>`);
    if (status.commission && status.can_profile) actions.push(`<button class="secondary" data-gland="commission">Gravar no perfil da instalação</button>`);
    if (status.state !== "maintenance") actions.push(`<button class="secondary" data-gland="maintenance">${glyph("wrench")}Iniciar manutenção</button>`);
  }
  const events = (status.events || [])
    .map((event) => {
      const measure = event.initial_mm == null ? "" : ` · ${fmtMm(event.initial_mm, 2)}${event.end_mm == null ? "" : ` (fim de ajuste ${fmtMm(event.end_mm, 2)})`}`;
      const current = event.id === status.cycle_event_id;
      const anchor =
        event.kind === "maintenance"
          ? ""
          : !event.anchor
            ? event.kind === "check"
              ? " · aguardando a leitura da conferência"
              : current
                ? " · referência elétrica pendente"
                : " · substituído sem referência aprovada (o registro fica no histórico)"
            : event.anchor.value != null
              ? ` · ${fmtElectric(status, event.anchor.value, event.anchor.quantity)}, ${ANCHOR_MODE[event.anchor.mode] || "leitura associada"}`
              : ` · sensor no ADC ${fmtNum(event.anchor.adc, 0)}`;
      return `<li${current ? ' class="current"' : ""}><b>${esc(GLAND_KIND[event.kind] || event.kind)}</b>${esc(measure)}${current ? " <em>ciclo vigente</em>" : ""}<small>nº ${esc(event.id)} · ${esc(fmtDateTime(event.recorded_at))}${event.actor ? " · " + esc(event.actor) : ""}${esc(anchor)}${Number(event.rule) === 1 ? " · regra anterior" : ""}</small></li>`;
    })
    .join("");
  const stateText = (GLAND_STATE_TEXT[status.state] || (() => ""))(status, interval);
  // Ciclo vigente em destaque, sempre com o que o servidor gravou (nunca com o que só foi digitado).
  const currentLine =
    status.initial_mm != null
      ? `<p class="gland-current"><b>Ciclo vigente</b> · registro nº ${esc(status.cycle_event_id)} · ${esc(fmtDateTime(status.recorded_at))} · ${esc(glandCadastro(status).replace(/^cadastro: /, ""))} · ` +
        `<span class="gland-ref ${status.anchor ? "ok" : "pending"}">${ruleTwo ? (status.anchor ? "referência elétrica aprovada" : "referência elétrica pendente") : "regra anterior (estimativa)"}</span></p>`
      : "";
  panel.innerHTML =
    `<h3>Ciclo da gaxeta <span class="adjustment-badge health-${view.key}">${esc(status.state === "waiting" && ruleTwo ? "Medidas salvas · aguardando leitura apta" : view.label)}</span></h3>` +
    currentLine +
    (stateText ? `<p class="form-help">${esc(stateText)}</p>` : "") +
    (candidate ? glandCandidateHtml(status, candidate) : "") +
    glandSteps(status) +
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
    block: status.current?.block, electric_percent: status.current?.electric_percent, cycle_event_id: status.cycle_event_id, anchored: !!status.anchor,
  });
  const key = JSON.stringify([
    sensorId, status.state, status.event_id, status.link_id, status.can_operate, status.scale?.source, status.scale?.event_id, status.scale?.profile_version,
    status.anchor?.id, (status.events || []).length, status.wait_reason, status.reason, status.candidate?.reading_id, status.window?.lo, status.window?.hi, status.scale?.end_ok,
    status.current?.block, status.candidate?.below_peak, !!status.commission, status.scale?.points, status.profile?.version,
  ]);
  if (force || key !== glandPanelState.key) {
    glandPanelState.key = key;
    renderGlandPanel(status, device);
  } else {
    const live = glandLiveFields(status);
    const set = (id, text) => $id(id) && ($id(id).textContent = text);
    set("glandNow", live.now);
    set("glandPct", live.percent);
    set("glandAdv", live.advance);
    set("glandAdc", live.volt);
    set("glandElec", live.electric);
    if ($id("glandWarn")) $id("glandWarn").innerHTML = live.warn.map((text) => `<p class="path-note">${esc(text)}</p>`).join("");
  }
  updateDrawerLive();
}

// ----- Registro (engaxetamento, conferência, manutenção) -----
function glandContextLine(device) {
  const identity = deviceIdentity(device);
  return `${deviceLabel(device)}${identity.linked ? ` · ${identity.title} · ${identity.spot}` : ""}`;
}
function glandLiveLine(device, check) {
  const status = deviceStatus(device);
  const gland = state.gland.get(device.sensor_id);
  const volt = voltageInfo(device, gland);
  const electric = electricInfo(device, gland);
  const block = electric.block;
  const head = `Sensor agora: ${electric.text} da escala elétrica${electric.label ? " (" + electric.label + ")" : ""} · ${volt.text}${volt.source ? " " + volt.source : ""} · ${status.label}.`;
  if (check)
    return head + (block && block !== "ok" ? ` A leitura atual não serve para a conferência (${BLOCK_SHORT[block]}): a medida fica salva e a plataforma usa a próxima leitura apta.` : "");
  return (
    head +
    (status.online ? "" : " A referência elétrica só é avaliada quando a placa enviar a próxima leitura.") +
    (block === "ceiling"
      ? " A leitura está no limite do ADC. O cadastro pode ser salvo assim mesmo; para calibrar a distância, o topo precisa ficar na faixa mensurável."
      : block && block !== "ok"
        ? ` Condição da leitura: ${BLOCK_SHORT[block]}. O cadastro pode ser salvo; a referência elétrica fica pendente até chegar uma leitura apta.`
        : "")
  );
}
function glandFormValues() {
  return { mm: $id("glandMm").value, end: $id("glandEnd").value, top: $id("glandTop").checked, kind: document.querySelector('input[name="glandKind"]:checked')?.value || "replacement" };
}
function updateGlandHint() {
  if (glandForm.mode !== "cycle") return;
  const initial = parseMm($id("glandMm").value);
  const endText = $id("glandEnd").value.trim();
  const end = endText ? parseMm(endText) : null;
  const text = glandCourseText(initial, endText ? end : null);
  $id("glandCourse").textContent = text || "Exemplo: começa em 15 mm; quando chegar a 3 mm, acaba o ajuste; curso útil de 12 mm.";
}
function openGlandDialog(mode) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  if (!status || !device || !status.can_operate) return;
  Object.assign(glandForm, { mode, sensorId: device.sensor_id, requestId: newRequestId(), linkId: status.link_id, expected: status.event_id ?? null });
  const check = mode === "check";
  const interval = state.gland.get(device.sensor_id)?.interval_s;
  const draft = glandDraft.get(device.sensor_id + "|" + mode);
  $id("glandTitle").textContent = check ? "Conferir medida" : "Registrar engaxetamento";
  $id("glandSubmit").textContent = check ? "Registrar conferência" : "Registrar engaxetamento";
  $id("glandContext").textContent = glandContextLine(device);
  $id("glandKindField").hidden = check;
  $id("glandEndField").hidden = check;
  $id("glandTopField").hidden = check;
  $id("glandTopField").classList.remove("needs-check");
  $id("glandCourse").hidden = check;
  $id("glandTop").checked = false; // a declaração física é refeita a cada registro
  $id("glandMmLabel").textContent = check ? "Distância medida agora com o paquímetro (mm)" : "Distância inicial (100 %) — medida com o paquímetro, em mm";
  $id("glandMm").value = draft?.mm ?? "";
  $id("glandEnd").value = check ? "" : draft?.end ?? (status.end_mm == null ? "" : String(Number(status.end_mm)).replace(".", ","));
  document.querySelector(`input[name="glandKind"][value="${draft?.kind === "adjustment" ? "adjustment" : "replacement"}"]`).checked = true;
  // Na conferência, um toque preenche a distância de fim de ajuste do ciclo (segundo ponto do comissionamento).
  const atEnd = $id("glandAtEnd");
  atEnd.hidden = !(check && status.end_mm != null);
  if (!atEnd.hidden) {
    atEnd.textContent = `Estou no fim de ajuste (${fmtMmShort(status.end_mm)})`;
    atEnd.onclick = () => {
      $id("glandMm").value = String(Number(status.end_mm)).replace(".", ",");
      $id("glandMm").focus();
    };
  }
  $id("glandHelp").textContent = check
    ? `Segundo ponto da calibração. Meça agora, na mesma referência mecânica da distância inicial (${fmtMmShort(status.initial_mm)}), e deixe o conjunto parado até a próxima leitura. ` +
      (status.end_mm != null ? `No fim de ajuste (${fmtMmShort(status.end_mm)}) a conferência fecha o comissionamento em dois pontos e valida o 0 % do ciclo; em outra posição conhecida ela mede a inclinação. ` : "") +
      `É preciso pelo menos 0,1 V (100 contagens) de diferença em relação ao topo, com a distância caindo junto com a tensão. A conferência não abre um ciclo novo. ${glandNextReading(interval)}`
    : `Coloque o potenciômetro na marca superior e confira pela marca física. Meça as duas distâncias na mesma referência mecânica. O 0 % do ciclo é a distância em que acaba o ajuste: pode ser 3 mm, e a tensão nesse ponto pode ser maior que 0 V. ${glandNextReading(interval)}`;
  $id("glandLive").textContent = glandLiveLine(device, check);
  $id("glandMessage").textContent = "";
  updateGlandHint();
  $id("glandDialog").showModal();
  $id("glandMm").focus();
}
$id("glandMm").addEventListener("input", updateGlandHint);
$id("glandEnd").addEventListener("input", updateGlandHint);
$id("glandTop").addEventListener("change", () => {
  if ($id("glandTop").checked) {
    $id("glandTopField").classList.remove("needs-check");
    if ($id("glandMessage").dataset.kind === "top") $id("glandMessage").textContent = "";
  }
});
// Fechar sem enviar guarda o que foi digitado (menos a caixa, que é declaração do momento).
$id("glandDialog").addEventListener("close", () => {
  if (!glandForm.sensorId || glandForm.mode === "maintenance") return;
  const key = glandForm.sensorId + "|" + glandForm.mode;
  if (glandForm.sent) glandDraft.delete(key);
  else glandDraft.set(key, glandFormValues());
  glandForm.sent = false;
});
// O cadastro é uma chamada; reler a tela é outra. Se a releitura falhar, o registro continua
// gravado e a tela avisa, sem oferecer um envio novo.
async function sendGlandEvent(kind, initialMm, endMm) {
  const saved = await callRpc("gaxeta_record_gland_event", {
    p_sensor_id: glandForm.sensorId, p_link_id: glandForm.linkId, p_expected_event: glandForm.expected, p_request_id: glandForm.requestId,
    p_kind: kind, p_initial_mm: initialMm, p_end_mm: endMm,
  });
  let refreshed = true;
  try {
    await refreshGlandPanel(true);
    await afterSensorChange();
  } catch {
    refreshed = false;
  }
  return { ...saved, refreshed };
}
// Envio cuja resposta se perdeu: procura o registro pela mesma chave (request_id) antes de
// oferecer outro envio. Devolve o registro, null (não foi gravado) ou undefined (não deu para saber).
async function reconcileGlandRequest() {
  try {
    const status = await callRpc("gaxeta_gland_status", { p_sensor_id: glandForm.sensorId });
    const events = status.events || [];
    const found = events.find((event) => event.request_id && event.request_id === glandForm.requestId);
    if (found) return { id: found.id, duplicate: true, reconciled: true };
    return "commission" in status ? null : undefined; // banco anterior à migração 11 não devolve a chave: não dá para afirmar
  } catch {
    return undefined;
  }
}
// Depois de um conflito, o estado mostrado ficou velho: relê e exige nova confirmação.
async function glandConflict() {
  await refreshGlandPanel(true).catch(() => {});
  const status = glandPanelState.status;
  Object.assign(glandForm, { requestId: newRequestId(), linkId: status?.link_id ?? null, expected: status?.event_id ?? null });
}
function glandSavedMessage(kind, measured, end, saved) {
  const status = glandPanelState.status;
  const device = findDevice(glandForm.sensorId);
  const mine = status && status.cycle_event_id === String(saved.id) ? status : null;
  const when = mine ? ` de ${fmtDateTime(mine.recorded_at)}` : "";
  const head = `${glandPair(measured, end)} salvos · registro nº ${saved.id}${when}${saved.duplicate ? " (já estava gravado)" : ""}.`;
  const tail = saved.refreshed === false ? " A tela não pôde ser atualizada agora: o registro está gravado e aparece na próxima atualização." : "";
  if (mine?.anchor) return head + " Referência elétrica aprovada na marca superior." + tail;
  const block = mine?.current?.block || (device ? electricInfo(device, state.gland.get(device.sensor_id)).block : null);
  if (block === "ceiling" || block === "touch_high") return head + " Para calibrar a distância, o topo precisa ficar na faixa mensurável." + tail;
  return head + " Medidas salvas · aguardando leitura apta: mantenha o sensor na marca superior." + tail;
}
$id("glandForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("glandMessage");
  const say = (text, kind = "") => {
    message.textContent = text;
    message.dataset.kind = kind;
  };
  const check = glandForm.mode === "check";
  const measured = parseMm($id("glandMm").value);
  const endText = $id("glandEnd").value.trim();
  const end = check || !endText ? null : parseMm(endText);
  if (measured == null || measured <= 0) {
    $id("glandMm").focus();
    return say("Informe a distância medida em milímetros, maior que zero, com até três casas decimais (use vírgula ou ponto).");
  }
  if (!check && endText && (end == null || end >= measured)) {
    $id("glandEnd").focus();
    return say("A distância no fim de ajuste deve ser um número menor que a distância inicial (0 é aceito).");
  }
  if (!check && !$id("glandTop").checked) {
    // Falta só a declaração física: os valores digitados ficam como estão e o foco vai para a caixa.
    $id("glandTopField").classList.add("needs-check");
    $id("glandTop").focus();
    return say("Marque a caixa para confirmar que você colocou o potenciômetro na marca superior.", "top");
  }
  const kind = check ? "check" : document.querySelector('input[name="glandKind"]:checked').value;
  say("Registrando…");
  await withBusy($id("glandSubmit"), async () => {
    let saved = null;
    try {
      saved = await sendGlandEvent(kind, measured, end);
    } catch (error) {
      if (isNetworkError(error)) {
        // A resposta se perdeu: antes de pedir outro envio, confere pela mesma chave se o registro entrou.
        say("Sem resposta do servidor. Conferindo se o registro foi gravado…");
        const found = await reconcileGlandRequest();
        if (found) {
          saved = { ...found, refreshed: await refreshGlandPanel(true).then(() => afterSensorChange()).then(() => true, () => false) };
        } else {
          return say(
            found === null
              ? "Sem conexão: o registro não foi gravado. Os valores continuam aqui; tente de novo (a mesma chave impede duplicar)."
              : "Sem conexão: não foi possível confirmar se o registro foi gravado. Os valores continuam aqui; ao tentar de novo, a mesma chave impede duplicar.",
          );
        }
      } else if (error?.code === "PT409") {
        await glandConflict();
        return say(errorText(error) + " Confira os dados e confirme de novo.");
      } else return say(errorText(error));
    }
    glandForm.sent = true;
    $id("glandDialog").close();
    showMessage(
      check
        ? `Conferência registrada (nº ${saved.id})${saved.duplicate ? ", já estava gravada" : ""}: ${fmtMmShort(measured)}. Deixe o conjunto parado: a calibração é recalculada com a próxima leitura apta do sensor.` +
            (saved.refreshed === false ? " A tela não pôde ser atualizada agora; o registro está gravado." : "")
        : glandSavedMessage(kind, measured, end, saved),
      "success",
    );
  });
};
// Confirmação, pelo técnico, de que a leitura candidata foi colhida com o sensor na marca superior.
async function confirmGlandAnchor(button) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  const candidate = status?.candidate;
  if (!status || !device || !candidate) return;
  const outside = status.wait_reason === "outside_window";
  const peak = candidate.below_peak ? candidate.peak : null;
  const confirmed = await askConfirm({
    title: "Confirmar leitura na marca superior",
    html:
      `<p>Sensor <b>${esc(glandContextLine(device))}</b>.</p>` +
      `<p>Leitura de ${esc(fmtDateTime(candidate.sampled_at))}: <b>${esc(fmtElectric(status, candidate.value, candidate.quantity))}</b>` +
      (candidate.electric_percent != null ? ` (${esc(fmtNum(candidate.electric_percent))} % da escala elétrica, ` : " (") +
      `ADC ${esc(fmtNum(candidate.adc, 0))}, dispersão ${esc(fmtNum(candidate.noise, 1))} contagens).` +
      (candidate.age_s != null ? ` Recebida há ${esc(fmtSeconds(candidate.age_s))}; transporte de ${esc(fmtSeconds(candidate.transport_s))}.` : "") +
      `</p>` +
      (outside ? `<p><b>Atenção:</b> a faixa esperada da marca superior nesta instalação é de ${esc(fmtElectric(status, status.window?.lo, status.window?.quantity))} a ${esc(fmtElectric(status, status.window?.hi, status.window?.quantity))}. Confirme só se a marca física foi conferida agora e a montagem mudou.</p>` : "") +
      (!status.window ? `<p>Esta instalação ainda não tem a marca superior caracterizada: esta primeira confirmação define a faixa esperada para os próximos ciclos.</p>` : "") +
      (peak
        ? `<p class="gland-alert"><b>Atenção:</b> depois do registro o sensor já mostrou uma posição mais alta (${esc(peak.block === "ceiling" ? "limite do ADC, 100 % da escala elétrica" : fmtNum(peak.electric_percent) + " % da escala elétrica")} em ${esc(fmtDateTime(peak.sampled_at))}). Se o potenciômetro saiu do topo, esta leitura é de uma posição intermediária e não deve ser confirmada como máximo.</p>` +
          `<label class="check"><input id="glandAckLower" type="checkbox"> Conferi a marca física agora: esta posição é a marca superior desta montagem</label>`
        : "") +
      `<p>Confirme apenas se o potenciômetro está, fisicamente, na marca superior desta montagem e não foi movido desde essa leitura. Ela passa a ser a referência elétrica (100 %) da distância inicial de <b>${esc(fmtMm(status.initial_mm, 2))}</b>. Uma referência aprovada não é substituída: para trocar, é preciso um novo registro. As medidas cadastradas não mudam.</p>`,
    okLabel: "Confirmar referência",
    danger: false,
  });
  if (!confirmed) return;
  const ack = !!$id("glandAckLower")?.checked;
  if (peak && !ack) return showMessage("Referência não confirmada: marque a declaração de que esta posição é a marca superior, ou recoloque o potenciômetro no topo e aguarde a próxima leitura.", "error");
  await withBusy(button, async () => {
    try {
      const args = { p_sensor_id: device.sensor_id, p_link_id: status.link_id, p_event_id: status.cycle_event_id, p_reading_id: candidate.reading_id };
      if (peak) args.p_ack_lower = true; // só vai quando a declaração foi feita (o banco da migração 10 não conhece o parâmetro)
      await callRpc("gaxeta_confirm_gland_anchor", args);
      await refreshGlandPanel(true);
      await afterSensorChange();
      const after = glandPanelState.status;
      showMessage(
        after?.scale?.source && after.scale.source !== "none"
          ? "Referência confirmada. A calibração da instalação já vale para este ciclo."
          : `Referência confirmada (topo). Falta o segundo ponto: leve o conjunto ${after?.end_mm != null ? "ao fim de ajuste (" + fmtMmShort(after.end_mm) + ")" : "a uma posição conhecida"}, meça com o paquímetro e use Conferir medida.`,
        "success",
      );
    } catch (error) {
      // Chegou outra leitura (ou a que estava em tela envelheceu): a tela mostra o valor atual para revisão.
      if (error?.code === "PT409") await refreshGlandPanel(true).catch(() => {});
      throw error;
    }
  });
}
// Grava no perfil da instalação o comissionamento em dois pontos do ciclo vigente (níveis 1 e 2).
async function commissionGland(button) {
  const status = glandPanelState.status;
  const device = findDevice(state.drawer.sensorId);
  const draft = status?.commission;
  if (!status || !device || !draft || !status.can_profile) return;
  const origin = draft.origin || {};
  const volt = draft.quantity === "mv";
  const value = (number) => (volt ? fmtVolt(number) : fmtNum(number, 0) + " contagens");
  const confirmed = await askConfirm({
    title: "Gravar o comissionamento no perfil da instalação",
    html:
      `<p>Sensor <b>${esc(glandContextLine(device))}</b>.</p>` +
      `<p>Topo: <b>${esc(fmtMmShort(origin.d100_mm))}</b> em <b>${esc(value(origin.v100))}</b> (V100).<br>` +
      `${origin.at_end ? "Fim de ajuste" : "Segundo ponto"}: <b>${esc(fmtMmShort(origin.d2_mm))}</b> em <b>${esc(value(origin.v2))}</b>${origin.at_end ? " (V0)" : ""}.<br>` +
      `Razão medida: ${esc(volt ? fmtNum(Number(draft.mm_per_unit) * 1000, 3) + " mm por volt" : fmtNum(draft.mm_per_unit, 5) + " mm por contagem")} · faixa validada de ${esc(value(draft.valid_lo))} a ${esc(value(draft.valid_hi))}` +
      (Number(origin.points) > 1 ? ` · ${esc(origin.points)} pontos, maior desvio ${esc(fmtNum(origin.max_residual_mm, 2))} mm` : "") +
      `.</p>` +
      `<p>Grave só depois de conferir um ponto intermediário com o paquímetro. Com o perfil gravado, as próximas trocas nesta instalação reaproveitam a marca superior (${esc(value(draft.high_value))} ± ${esc(value(draft.high_tolerance))}) e a razão medida: basta registrar as medidas do novo ciclo. O perfil vale enquanto a montagem, o método de aquisição e a faixa forem os mesmos; mudou a ligação ou o acoplamento, comissione de novo.</p>`,
    okLabel: "Gravar no perfil",
    danger: false,
  });
  if (!confirmed) return;
  const requestId = newRequestId();
  await withBusy(button, async () => {
    try {
      const saved = await callRpc("gaxeta_commission_gland", { p_sensor_id: device.sensor_id, p_link_id: status.link_id, p_request_id: requestId });
      await refreshGlandPanel(true);
      await afterSensorChange();
      showMessage(`Comissionamento gravado: versão ${saved.version} do perfil da instalação.`, "success");
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
  if (mode === "commission") return commissionGland(button).catch((error) => showMessage(errorText(error), "error"));
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
