// =============================================================================
// Modo bancada do sensor magnético (demonstração em mesa).
//   * Ativação explícita, com prévia antes de aplicar. Enquanto está ativo, cartão, árvore,
//     Detalhes, gráfico e CSV dizem "bancada": o número é a Posição de bancada (%), nunca o
//     curso de ajuste restante, e nada vai para a série de campo.
//   * O percentual é calculado no servidor pela contagem contínua que a placa mantém (firmware
//     4.5.0): limitado a 0–100 %, com o quanto passou do extremo guardado ao lado.
//   * Faixas simuladas (Sem ajuste, Baixo, Médio, Alto): preferência do vínculo, guardada no
//     servidor e ligada por padrão. Muda só a apresentação: não abre sessão, não pede referência
//     e não cria registro. A regra e as cores estão em 10-core.js (benchSimOf).
//   * Alterar a faixa: a prévia é calculada sozinha depois que a pessoa para de digitar; só
//     "Aplicar nova faixa" grava. A atualização periódica não toca no formulário aberto.
//   * A nuvem atualiza a cada envio da placa (30 s na bancada). A tela mostra sempre a hora da
//     última atualização, e leitura atrasada aparece como última leitura válida, não como atual.
//   * Sessão da placa diferente da confirmada = "Reposicionar para retomar": a última leitura boa
//     fica à vista, com horário, e nenhum número é inventado.
// =============================================================================
const BENCH_DEFAULT = { zero: 80, full: 180, direction: 1 };
const MAG15_MISSING_TEXT = "Esta função depende da atualização do banco desta revisão (migração 15), que ainda não foi aplicada.";
const benchForms = new Map(); // sensor → formulário da faixa (valores digitados, prévia, fase)
const benchRequests = new Map(); // sensor → identificador da operação em envio (o mesmo nas novas tentativas)
const benchBusy = new Set(); // sensores com a preferência de faixas em envio
const benchFormOf = (sensorId) => {
  if (!benchForms.has(sensorId)) benchForms.set(sensorId, { open: false, zero: "", full: "", direction: "1", preview: null, previewKey: "", phase: "empty", error: "", token: 0, timer: null, note: "" });
  return benchForms.get(sensorId);
};
const benchDirWord = (direction) => (Number(direction) > 0 ? "crescente" : "decrescente");
const benchDirText = (direction) => (Number(direction) > 0 ? "crescente (o percentual sobe quando o ângulo sobe)" : "decrescente (o percentual sobe quando o ângulo desce)");
const benchRangeText = (zero, full, direction) => `${fmtDeg(zero, 1)} = 0 % · ${fmtDeg(full, 1)} = 100 % · ${benchDirWord(direction)}`;
// Graus entre os dois extremos, no sentido escolhido (mesma conta de gaxeta_private.mag_bench_u).
const benchSpanOf = (zero, full, direction) => ((((full - zero) * direction) % 360) + 360) % 360;
// Ângulo do chip em que a faixa vale a fração indicada (0 a 1).
const benchAngleAt = (zero, span, direction, fraction) => (((zero + direction * span * fraction) % 360) + 360) % 360;
// Graus digitados com vírgula ou ponto: 0 a 359,999.
function parseBenchDeg(text) {
  const raw = String(text ?? "").trim().replace(",", ".").replace("°", "");
  if (!/^\d+(\.\d{1,3})?$/.test(raw)) return NaN;
  const value = Number(raw);
  return value >= 0 && value < 360 ? value : NaN;
}
// Conferência local do que está digitado, antes de pedir a prévia ao servidor.
//   empty    falta preencher          invalid  não forma uma faixa (com o motivo)
//   same     igual à faixa em uso     ready    pode pedir a prévia
function benchFormCheck(form, bench) {
  if (!String(form.zero).trim() || !String(form.full).trim()) return { phase: "empty", message: "" };
  const zero = parseBenchDeg(form.zero);
  const full = parseBenchDeg(form.full);
  const direction = Number(form.direction) < 0 ? -1 : 1;
  if (Number.isNaN(zero) || Number.isNaN(full)) return { phase: "invalid", message: "Informe os dois ângulos em graus, de 0 a 359,999 (vírgula ou ponto, até três casas)." };
  if (zero === full) return { phase: "invalid", message: "Os dois ângulos são iguais: a faixa ficaria com 0°. Escolha ângulos diferentes para 0 % e para 100 %." };
  const span = benchSpanOf(zero, full, direction);
  if (span < 5 || span > 355)
    return { phase: "invalid", message: `No sentido ${benchDirWord(direction)}, esta faixa teria ${fmtDeg(span, 1)}. Ela precisa ter de 5° a 355°: troque o sentido ou os ângulos.` };
  const values = { zero, full, direction, span, key: `${zero}|${full}|${direction}` };
  if (bench && Number(bench.zero_deg) === zero && Number(bench.full_deg) === full && Number(bench.direction) === direction) return { phase: "same", values, message: "" };
  return { phase: "ready", values, message: "" };
}
// Prévia: a faixa em uso ao lado da proposta, com 0 %, 50 %, 100 % e a posição atual.
function benchPreviewHtml(preview, bench, currentShown) {
  if (!preview) return "";
  const current = preview.current;
  const mark = (percent) => preview.marks.find((item) => Number(item.percent) === percent)?.angle_deg;
  const old = bench ? { zero: Number(bench.zero_deg), span: Number(bench.span_deg), direction: Number(bench.direction) } : null;
  const row = (label, before, after) => `<tr><th scope="row">${label}</th>${old ? `<td>${before}</td>` : ""}<td>${after}</td></tr>`;
  const oldAt = (fraction) => esc(fmtDeg(benchAngleAt(old.zero, old.span, old.direction, fraction), 1));
  return (
    `<div class="bench-preview" id="benchPreview"><h4>Prévia ${bench ? "da nova faixa" : "da faixa"} (nada foi aplicado ainda)</h4>` +
    `<table><thead><tr><th></th>${old ? "<th>Faixa em uso</th>" : ""}<th>${bench ? "Nova faixa" : "Faixa proposta"}</th></tr></thead><tbody>` +
    row("0 %", old ? oldAt(0) : "", esc(fmtDeg(mark(0), 1))) +
    row("50 %", old ? oldAt(0.5) : "", esc(fmtDeg(mark(50), 1))) +
    row("100 %", old ? oldAt(1) : "", esc(fmtDeg(mark(100), 1))) +
    row("Sentido", old ? benchDirWord(old.direction) : "", benchDirWord(preview.direction)) +
    row("Tamanho da faixa", old ? esc(fmtDeg(old.span, 1)) : "", esc(fmtDeg(preview.span_deg, 1))) +
    (current
      ? row(`Posição atual (${esc(fmtDeg(current.angle_deg, 2))})`, currentShown == null ? "—" : esc(fmtNum(currentShown, 2)) + " %", current.inside ? `<b>${esc(fmtNum(current.percent, 2))} %</b>` : "<b>fora da faixa</b>")
      : "") +
    `</tbody></table>` +
    `<p>Fora da faixa a barra fica em 0 % ou em 100 % e o quanto passou é guardado.</p>` +
    (current
      ? current.inside
        ? `<p class="bench-ok">O eixo está dentro da ${bench ? "nova " : ""}faixa: depois de aplicar, basta tocar em Confirmar início com ele parado.</p>`
        : `<p class="bench-warn">A leitura atual (${esc(fmtDeg(current.angle_deg, 2))}) está <b>fora da ${bench ? "nova " : ""}faixa</b>. Depois de aplicar, gire o eixo para um ponto entre os dois extremos antes de confirmar o início.</p>`
      : `<p class="bench-warn">Sem ângulo válido na leitura atual: confira o ímã e o sensor antes de confirmar o início.</p>`) +
    (preview.continuity ? "" : `<p class="bench-warn">A última leitura desta placa veio sem contagem contínua (firmware ${esc(preview.firmware_version || "desconhecido")}). O Modo bancada precisa do firmware 4.5.0 ou mais novo: sem ele a tela mostra "Sem contagem contínua", sem percentual.</p>`) +
    (preview.ends_reference ? `<p class="bench-warn">Este vínculo tem um engaxetamento de campo em andamento. Ativar o Modo bancada <b>encerra essa referência</b>; ao sair será preciso registrar o engaxetamento de novo.</p>` : "") +
    `</div>`
  );
}
// Formulário da faixa (ativar ou alterar). O conteúdo que muda sozinho (prévia, mensagem, botão
// Aplicar) é pintado por benchPreviewPaint, sem refazer os campos.
function benchFormHtml(form, bench) {
  return (
    `<form id="benchForm" novalidate>` +
    (bench ? `<p class="bench-inuse"><span>Faixa em uso</span><strong>${esc(benchRangeText(bench.zero_deg, bench.full_deg, bench.direction))}</strong></p>` : "") +
    `<p class="form-help">Escolha qual ângulo do sensor vale <b>0 %</b> e qual vale <b>100 %</b>. Use os ângulos que aparecem em "Ângulo do sensor" com o eixo em cada extremo. O sentido diz para que lado o percentual sobe.` +
    (bench ? " A faixa em uso continua valendo enquanto você digita, e também se cancelar." : " Proposta inicial do ensaio: 80° = 0 % e 180° = 100 %, crescente.") + `</p>` +
    `<div class="bench-fields"><label>Ângulo que vale 0 % (graus)<input id="benchZero" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.zero)}"></label>` +
    `<label>Ângulo que vale 100 % (graus)<input id="benchFull" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.full)}"></label>` +
    `<label>Sentido<select id="benchDirection"><option value="1"${form.direction === "1" ? " selected" : ""}>Crescente: sobe com o ângulo</option><option value="-1"${form.direction === "-1" ? " selected" : ""}>Decrescente: sobe quando o ângulo desce</option></select></label></div>` +
    `<p class="bench-invert"><button class="text-button" type="button" id="benchInvert" title="Troca os dois ângulos entre si e muda o sentido: o que valia 0 % passa a valer 100 %.">Inverter a faixa: trocar os ângulos de 0 % e de 100 %</button><span id="benchInvertNote">${esc(form.note)}</span></p>` +
    `<p id="benchMessage" class="form-message" role="status"></p>` +
    `<div id="benchPreviewBox" aria-live="polite"></div>` +
    `<p id="benchApplyHelp" class="form-help"></p>` +
    `<div class="drawer-actions"><button class="primary" type="submit" id="benchApply" disabled>${bench ? "Aplicar nova faixa" : "Ativar Modo bancada"}</button>` +
    `<button class="secondary" type="button" id="benchPreviewBtn">Calcular prévia</button>` +
    `<button class="secondary" type="button" id="benchFormCancel">Cancelar</button></div></form>`
  );
}
// Pinta o que depende da fase da prévia, sem tocar nos campos digitados.
function benchPreviewPaint(sensorId) {
  const form = benchFormOf(sensorId);
  if (!form.open || !$id("benchForm")) return;
  const mag = deviceMag(findDevice(sensorId));
  const bench = mag?.bench || null;
  const shown = bench && bench.state === "ok" ? benchShown(bench.percent) : null;
  const ready = form.phase === "shown" && !!form.preview;
  $id("benchPreviewBox").innerHTML = form.phase === "loading" ? `<p class="bench-loading">Calculando a prévia destes valores…</p>` : ready ? benchPreviewHtml(form.preview, bench, shown) : "";
  const message = $id("benchMessage");
  message.textContent = form.error || "";
  message.classList.toggle("is-error", !!form.error);
  $id("benchApply").disabled = !ready;
  $id("benchPreviewBtn").hidden = form.phase !== "error";
  $id("benchInvertNote").textContent = form.note || "";
  $id("benchApplyHelp").textContent =
    form.phase === "shown"
      ? bench
        ? "Só Aplicar nova faixa altera a configuração. Ao aplicar, a faixa em uso é encerrada (fica no histórico) e será preciso tocar em Confirmar início com o eixo parado dentro da nova faixa."
        : "Ao ativar, ponha o eixo parado dentro da faixa e toque em Confirmar início."
      : form.phase === "same"
        ? "Esta já é a faixa em uso: não há o que aplicar. A referência atual continua valendo."
        : form.phase === "loading"
          ? "Aplicar fica disponível assim que a prévia destes valores aparecer: só se aplica o que foi visto."
          : form.phase === "error"
            ? "Aplicar aguarda a prévia, para que só seja aplicado o que foi visto. Toque em Calcular prévia para tentar de novo."
            : "A prévia aparece sozinha quando os dois ângulos formam uma faixa válida. Aplicar aguarda a prévia.";
}
// Pede a prévia depois de uma pausa na digitação. Cada edição invalida a resposta de uma edição
// anterior que ainda esteja a caminho (token).
function benchSchedulePreview(sensorId, immediate = false) {
  const form = benchFormOf(sensorId);
  const bench = deviceMag(findDevice(sensorId))?.bench || null;
  clearTimeout(form.timer);
  const token = ++form.token;
  const check = benchFormCheck(form, bench);
  if (check.phase !== "ready") {
    Object.assign(form, { phase: check.phase, preview: null, previewKey: "", error: check.message });
    return benchPreviewPaint(sensorId);
  }
  if (form.preview && form.previewKey === check.values.key) {
    Object.assign(form, { phase: "shown", error: "" });
    return benchPreviewPaint(sensorId);
  }
  Object.assign(form, { phase: "loading", preview: null, previewKey: "", error: "" });
  benchPreviewPaint(sensorId);
  form.timer = setTimeout(async () => {
    try {
      const preview = await callRpc("gaxeta_mag_bench_preview", { p_sensor_id: sensorId, p_zero_deg: check.values.zero, p_full_deg: check.values.full, p_direction: check.values.direction });
      if (token !== form.token || !form.open) return; // resposta de uma edição anterior
      Object.assign(form, { phase: "shown", preview, previewKey: check.values.key, error: "" });
    } catch (error) {
      if (token !== form.token || !form.open) return;
      Object.assign(form, { phase: "error", preview: null, previewKey: "", error: isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error) });
    }
    benchPreviewPaint(sensorId);
  }, immediate ? 0 : 450);
}
// Espera pela leitura que confirma o início.
function benchWaitText(device, pending) {
  const period = Number(deviceInterval(device)) || 30;
  const now = Date.now() + state.clockOffset;
  const sinceLast = (now - new Date(device.last_received_at).getTime()) / 1000;
  const next = Math.max(0, Math.round(period - (sinceLast % period)));
  const left = Math.max(0, Math.round((new Date(pending.expires_at).getTime() - now) / 1000));
  return `Próxima leitura em cerca de ${fmtInterval(next)} (um envio a cada ${fmtInterval(period)}). A confirmação vale por mais ${fmtInterval(left)}.`;
}
function benchUpdatedText(device) {
  const period = Number(deviceInterval(device)) || 30;
  const age = Math.max(0, Math.round((Date.now() + state.clockOffset - new Date(device.last_received_at).getTime()) / 1000));
  return `${fmtDateTime(device.last_received_at)} · há ${fmtInterval(age)} · um envio a cada ${fmtInterval(period)}`;
}
// Andamento depois de aplicar uma faixa: aplicada → confirmação pedida → início confirmado, com a hora.
function benchStepsHtml(device, bench, pending, state2) {
  const anchored = state2 === "ok" && bench.anchor_status === "set";
  const recent = anchored && bench.anchor_at && Date.now() + state.clockOffset - new Date(bench.anchor_at).getTime() < 5 * 60e3;
  if (anchored && !recent) return "";
  const step = (kind, html) => `<li class="${kind}">${html}</li>`;
  return (
    `<ol class="bench-steps" aria-label="Andamento da confirmação do início">` +
    step("done", `Faixa aplicada às ${esc(fmtClock(bench.started_at))}`) +
    step(
      anchored ? "done" : "current",
      anchored
        ? "Início pedido com o eixo parado dentro da faixa"
        : pending
          ? `Confirmação pedida às ${esc(fmtClock(pending.requested_at))}. Deixe o eixo parado: o resultado aparece após uma leitura válida da placa. <span id="benchWait">${esc(benchWaitText(device, pending))}</span>`
          : state2 === "reposition"
            ? "Leve o eixo a um ponto conhecido dentro da faixa, deixe-o parado e toque em Confirmar referência"
            : "Posicione o eixo dentro da faixa, deixe-o parado e toque em Confirmar início",
    ) +
    step(anchored ? "done" : "todo", anchored ? `Início confirmado às ${esc(fmtClock(bench.anchor_at))}` : "Início confirmado (a hora aparece aqui)") +
    `</ol>`
  );
}
// Parte que acompanha a leitura: barra de 0 a 100 %, número, faixa simulada, estado e fatos.
function benchLiveHtml(device, view, bench, pending, state2) {
  const sim = view.sim;
  const has = view.scale != null;
  const over = Number(bench.over_deg) || 0;
  const stale = has && !deviceStatus(device).online;
  const lastOk = bench.last_ok;
  const reading = view.mag?.reading || null;
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  const stateHtml =
    state2 === "ok" || state2 === "pending"
      ? state2 === "pending" && bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note]
        ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>`
        : ""
      : state2 === "reposition"
        ? `<p class="bench-warn"><strong>Reposicionar para retomar.</strong> A placa deixou de garantir a continuidade do giro (${esc(ctLossText(bench.lost_reason))}${bench.lost_at ? ", " + esc(fmtDateTime(bench.lost_at)) : ""}): a posição atual pode estar em outra volta. Leve o eixo a um ponto conhecido dentro da faixa e confirme a referência.</p>`
        : state2 === "no_continuity"
          ? `<p class="bench-warn">${esc(MAG_REASON.bench_no_continuity.note)}</p>`
          : `<p class="bench-warn"><strong>Início não confirmado.</strong> Ponha o eixo parado em um ponto dentro da faixa (entre ${esc(fmtDeg(bench.zero_deg, 1))} e ${esc(fmtDeg(bench.full_deg, 1))}) e toque em Confirmar início. Um ângulo fora da faixa poderia pertencer a várias voltas.</p>` +
            (bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note] ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>` : "");
  return (
    `<div class="bench-bar${has ? "" : " idle"}${sim ? " health-" + sim.key : ""}" role="img" aria-label="Posição de bancada: ${has ? view.value + " por cento" + (sim ? ", faixa simulada " + sim.label : "") : "sem posição"}">` +
    `<i style="width:${view.scale ?? 0}%"></i>` + (view.benchBands ? `<b style="left:30%"></b><b style="left:50%"></b><b style="left:73%"></b>` : "") +
    `<span class="bench-mark" style="left:0">0 %</span><span class="bench-mark" style="left:50%">50</span><span class="bench-mark" style="left:100%">100 %</span></div>` +
    `<p class="bench-number${sim ? " health-" + sim.key : ""}${stale ? " is-stale" : ""}"><strong id="benchPercent">${has ? esc(view.value) + " %" : "—"}</strong>${benchSimChip(sim, " is-large")}` +
    `<span id="benchLimit">${has ? (over > 0 ? `no teto · ${esc(fmtDeg(over, 1))} além do 100 %` : over < 0 ? `no piso · ${esc(fmtDeg(-over, 1))} abaixo do 0 %` : "dentro da faixa") : ""}</span></p>` +
    // Sem posição não há faixa: a régua das faixas só aparece junto de um percentual válido.
    (view.benchBands && has
      ? `<ul class="sim-scale" aria-label="Faixas simuladas da bancada">${BENCH_SIM_ORDER.map((name) => `<li class="health-${BENCH_SIM[name].key}${sim?.band === name ? " is-current" : ""}"><b>${esc(BENCH_SIM[name].label)}</b><small title="${esc(BENCH_SIM[name].range)}">${esc(BENCH_SIM[name].short)}</small></li>`).join("")}</ul>` +
        `<p class="bench-sim">Faixa simulada: na bancada este percentual é a fração de um arco entre dois ângulos, não o curso de ajuste restante.</p>`
      : "") +
    (stale ? `<p class="bench-warn"><strong>Última leitura válida às ${esc(fmtClock(device.last_received_at))}.</strong> A placa está sem atualização há ${esc(agoText(device.last_received_at))}: o número acima não é a posição atual.</p>` : "") +
    (sampleBad ? `<p class="bench-warn"><strong>${esc(view.label)}.</strong> ${esc(view.note)}</p>` : "") +
    stateHtml +
    (!has && lastOk ? `<p class="mag-current">Última leitura válida: ${esc(fmtNum(benchShown(lastOk.percent), 2))} % em ${esc(fmtDateTime(lastOk.at))} (não é a leitura atual).</p>` : "") +
    benchStepsHtml(device, bench, pending, state2) +
    `<dl class="bench-facts">` +
    `<dt>Ângulo / bruto</dt><dd>${view.raw == null ? "sem ângulo" : esc(fmtDeg(view.degrees, 2)) + " · " + view.raw}</dd>` +
    `<dt>Posição contínua</dt><dd>${bench.continuous_deg == null ? "—" : esc(fmtDeg(bench.continuous_deg, 2)) + ` · ${bench.turns > 0 ? "+" : ""}${bench.turns} volta(s)`}</dd>` +
    `<dt>Sessão da placa</dt><dd>${esc(reading?.ct?.session || "sem contagem")}${bench.anchor_at ? " · início confirmado " + esc(fmtDateTime(bench.anchor_at)) : ""}</dd>` +
    `<dt>Última atualização</dt><dd id="benchUpdated">${esc(benchUpdatedText(device))}</dd></dl>` +
    `<p class="form-help">A nuvem atualiza a cada envio da placa. Para acompanhar o giro em tempo real, use o monitor serial pela USB: ele mostra a mesma conta, linha a linha.</p>`
  );
}
// Faixa em uso, ações e a preferência das faixas simuladas (ou o formulário, quando aberto).
function benchControlsHtml(view, bench, state2, form, canOperate, sensorId) {
  if (form.open) return benchFormHtml(form, bench);
  if (!bench)
    return canOperate
      ? `<div class="drawer-actions"><button class="secondary" type="button" id="benchOpen">Configurar e ativar…</button></div>`
      : `<p class="form-help">Sua conta consulta este sensor, sem permissão para ativar o Modo bancada.</p>`;
  const inUse =
    `<p class="bench-inuse"><span>Faixa em uso</span><strong>${esc(benchRangeText(bench.zero_deg, bench.full_deg, bench.direction))}</strong></p>` +
    `<p class="form-help">O operador escolhe qual ângulo vale 0 % e qual vale 100 %.${canOperate ? " Para mudar, toque em Alterar faixa da bancada: os valores em uso aparecem para edição." : ""}</p>`;
  if (!canOperate)
    return inUse + `<p class="form-help">Faixas simuladas da bancada: <b>${view.benchBands ? "ligadas" : "desligadas"}</b> (escolha de quem opera o sensor). Sua conta consulta este sensor, sem permissão para operar o Modo bancada.</p>`;
  return (
    inUse +
    `<div class="drawer-actions">` +
    (state2 === "pending" ? "" : `<button class="${state2 === "ok" ? "secondary" : "primary"}" type="button" id="benchConfirm">${state2 === "reposition" ? "Confirmar referência (reposicionado)" : state2 === "ok" ? "Confirmar referência de novo" : "Confirmar início"}</button>`) +
    `<button class="secondary" type="button" id="benchOpen">Alterar faixa da bancada…</button><button class="secondary" type="button" id="benchStop">Sair do Modo bancada</button></div>` +
    `<label class="check bench-sim-toggle"><input id="benchBands" type="checkbox"${view.benchBands ? " checked" : ""}${benchBusy.has(sensorId) ? " disabled" : ""}> Mostrar faixas simuladas da bancada</label>` +
    `<p class="form-help">Mostra o nome e a cor da faixa (Sem ajuste, Baixo, Médio, Alto) junto do percentual em Sensores, Ativos e Telemetria, no site e no aplicativo. Muda só a apresentação: a referência e o histórico ficam como estão.</p>`
  );
}
function benchForceRedraw() {
  const box = $id("magBench");
  if (box) box.dataset.live = box.dataset.controls = "";
}
function renderMagBench(device, view) {
  const box = $id("magBench");
  if (!box) return;
  const mag = view.mag;
  const bench = mag?.bench || null;
  const sensorId = device.sensor_id;
  const form = benchFormOf(sensorId);
  const reading = mag?.reading || null;
  if (!mag || !mag.linked) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  if (!$id("benchLive")) {
    box.innerHTML = `<h3 id="benchTitle"></h3><div id="benchLive" class="bench-live"></div><div id="benchControls" class="bench-controls"></div><p id="benchMessage2" class="form-message" role="status"></p>`;
    box.dataset.live = box.dataset.controls = "";
  }
  const pending = bench?.pending && !bench.pending.expired ? bench.pending : null;
  const state2 = !bench ? "off" : pending ? "pending" : bench.state;
  box.className = "mag-bench" + (bench ? " is-active" : "");
  // Leitura: só é redesenhada quando muda, e nunca toca no formulário.
  const online = deviceStatus(device).online;
  const anchoredRecently = !!bench?.anchor_at && Date.now() + state.clockOffset - new Date(bench.anchor_at).getTime() < 5 * 60e3;
  const liveSignature = [state2, bench?.id, bench?.anchor_status, bench?.anchor_note, bench?.lost_reason, bench?.anchor_at, anchoredRecently, view.benchBands, view.key, view.value, bench?.over_deg, reading?.id, view.reason, online, form.open && !bench].join("|");
  if (box.dataset.live !== liveSignature) {
    box.dataset.live = liveSignature;
    $id("benchTitle").innerHTML = bench ? `<span class="series-tag is-bench">Modo bancada</span> Posição de bancada (%)` : "Modo bancada";
    $id("benchLive").innerHTML = bench
      ? benchLiveHtml(device, view, bench, pending, state2)
      : form.open
        ? `<p class="form-help">Para demonstração em mesa: gire o ímã com a mão e acompanhe uma barra de 0 a 100 %. A série fica identificada como bancada em todas as telas e não entra no histórico de campo.</p>`
        : `<p class="form-help">Desligado. Serve para demonstrar o sensor na mesa, com uma barra de 0 a 100 % entre dois ângulos escolhidos.</p>`;
  } else {
    if (pending && $id("benchWait")) $id("benchWait").textContent = benchWaitText(device, pending);
    if ($id("benchUpdated")) $id("benchUpdated").textContent = benchUpdatedText(device);
  }
  // Ações e formulário: com o formulário aberto, a atualização periódica não redesenha nada aqui.
  const controlSignature = form.open
    ? ["form", bench?.id || "novo", mag.can_operate].join("|")
    : [state2, bench?.id, bench?.zero_deg, bench?.full_deg, bench?.direction, mag.can_operate, view.benchBands, benchBusy.has(sensorId)].join("|");
  if (box.dataset.controls !== controlSignature) {
    box.dataset.controls = controlSignature;
    $id("benchControls").innerHTML = benchControlsHtml(view, bench, state2, form, !!mag.can_operate, sensorId);
    bindMagBench(sensorId);
    if (form.open) benchPreviewPaint(sensorId);
  }
}
// Redesenha todas as telas que mostram a bancada deste sensor (cartão, árvore, Ativos, gráfico).
function benchRepaint() {
  benchForceRedraw();
  updateDrawerLive();
  if (state.page === "sensors") renderSensorGrid();
  renderTree();
  if (state.page === "assets") renderInspector().catch(() => {});
  if (state.page === "telemetry") renderHistory();
  renderIcons();
}
function bindMagBench(sensorId) {
  const form = benchFormOf(sensorId);
  const refresh = async () => {
    await loadMagSummary([sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    benchRepaint();
  };
  const redraw = () => {
    benchForceRedraw();
    updateDrawerLive();
  };
  const closeForm = () => {
    clearTimeout(form.timer);
    form.token++;
    Object.assign(form, { open: false, preview: null, previewKey: "", phase: "empty", error: "", note: "" });
  };
  if ($id("benchOpen"))
    $id("benchOpen").onclick = () => {
      // Ao abrir, os campos trazem a faixa em uso. Nada é enviado até Aplicar.
      const bench = deviceMag(findDevice(sensorId))?.bench;
      Object.assign(form, {
        open: true, preview: null, previewKey: "", error: "", note: "",
        zero: fmtMmInput(bench?.zero_deg ?? BENCH_DEFAULT.zero), full: fmtMmInput(bench?.full_deg ?? BENCH_DEFAULT.full), direction: String(bench?.direction ?? BENCH_DEFAULT.direction),
      });
      redraw();
      benchSchedulePreview(sensorId, true);
      $id("benchZero")?.focus();
    };
  if ($id("benchFormCancel"))
    $id("benchFormCancel").onclick = () => {
      closeForm();
      redraw();
    };
  // O que é digitado fica guardado a cada tecla: um redesenho nunca devolve um valor antigo.
  const typed = () => {
    Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction: $id("benchDirection").value, note: "" });
    benchSchedulePreview(sensorId);
  };
  for (const id of ["benchZero", "benchFull"]) if ($id(id)) $id(id).oninput = typed;
  if ($id("benchDirection")) $id("benchDirection").onchange = typed;
  if ($id("benchInvert"))
    $id("benchInvert").onclick = () => {
      const zero = $id("benchZero").value;
      const direction = $id("benchDirection").value === "1" ? "-1" : "1";
      $id("benchZero").value = $id("benchFull").value;
      $id("benchFull").value = zero;
      $id("benchDirection").value = direction;
      Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction });
      const check = benchFormCheck(form, null);
      form.note = check.values ? `Invertida: ${benchRangeText(check.values.zero, check.values.full, check.values.direction)}.` : "";
      benchSchedulePreview(sensorId, true);
    };
  if ($id("benchPreviewBtn")) $id("benchPreviewBtn").onclick = () => benchSchedulePreview(sensorId, true);
  if ($id("benchForm"))
    $id("benchForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        const bench = deviceMag(findDevice(sensorId))?.bench || null;
        Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction: $id("benchDirection").value });
        const check = benchFormCheck(form, bench);
        // Só se aplica o que a prévia mostrou: valores iguais aos da prévia em tela.
        if (check.phase !== "ready" || !form.preview || form.previewKey !== check.values.key) return benchSchedulePreview(sensorId, true);
        const values = check.values;
        const key = `start:${values.key}`;
        const previous = benchRequests.get(sensorId);
        const request = previous?.key === key ? previous : { key, id: newRequestId() };
        benchRequests.set(sensorId, request);
        try {
          const result = await callRpc("gaxeta_mag_bench_start", { p_sensor_id: sensorId, p_request_id: request.id, p_zero_deg: values.zero, p_full_deg: values.full, p_direction: values.direction });
          benchRequests.delete(sensorId);
          closeForm();
          showMessage(
            result?.unchanged
              ? "A faixa informada já era a faixa em uso. Nada foi alterado: a referência atual continua valendo."
              : "Posicione o eixo dentro da nova faixa, deixe-o parado e toque em Confirmar início. O resultado aparece após uma leitura válida da placa, normalmente no próximo envio.",
            "success",
          );
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          Object.assign(form, { phase: "error", error: isNetworkError(error) ? "Sem resposta do servidor. Toque de novo em Aplicar: a mesma solicitação é reenviada, sem duplicar." : isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error) });
          if (isNetworkError(error)) form.phase = "shown";
          return benchPreviewPaint(sensorId);
        }
        await refresh();
      });
    };
  if ($id("benchConfirm"))
    $id("benchConfirm").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const previous = benchRequests.get(sensorId);
        const request = previous?.key === "confirm" ? previous : { key: "confirm", id: newRequestId() };
        benchRequests.set(sensorId, request);
        try {
          await callRpc("gaxeta_mag_bench_confirm", { p_sensor_id: sensorId, p_request_id: request.id });
          benchRequests.delete(sensorId);
          showMessage("Confirmação registrada. Deixe o eixo parado: o resultado aparece após uma leitura válida da placa, normalmente no próximo envio.", "success");
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          if ($id("benchMessage2")) $id("benchMessage2").textContent = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: a mesma confirmação é reenviada." : errorText(error);
          return;
        }
        if ($id("benchMessage2")) $id("benchMessage2").textContent = "";
        await refresh();
      });
  if ($id("benchStop"))
    $id("benchStop").onclick = async (event) => {
      const button = event.currentTarget;
      if (!(await askConfirm({ title: "Sair do Modo bancada", okLabel: "Sair do Modo bancada", danger: false,
        html: `<p>O sensor volta à série de campo. As leituras de bancada ficam no histórico, identificadas como bancada.</p><p>Para acompanhar o curso de ajuste restante será preciso registrar o engaxetamento de novo.</p>` }))) return;
      await withBusy(button, async () => {
        try {
          await callRpc("gaxeta_mag_bench_stop", { p_sensor_id: sensorId });
          closeForm();
          showMessage("Modo bancada desligado.", "success");
        } catch (error) {
          showMessage(errorText(error), "error");
        }
        await refresh();
      });
    };
  // Faixas simuladas: muda só a apresentação. A tela troca na hora e a escolha vai para o
  // servidor, para o outro cliente (site ou aplicativo) abrir igual.
  if ($id("benchBands"))
    $id("benchBands").onchange = async () => {
      const want = $id("benchBands").checked;
      benchBandsLocal.set(sensorId, want);
      benchBusy.add(sensorId);
      benchRepaint();
      let note = "";
      try {
        await callRpc("gaxeta_mag_bench_set_bands", { p_sensor_id: sensorId, p_show: want });
        await loadMagSummary([sensorId]).catch(() => {});
        benchBandsLocal.delete(sensorId);
      } catch (error) {
        if (isMissingFeature(error)) {
          // Banco ainda sem a migração 16: a escolha vale neste aparelho até a atualização.
          try {
            localStorage.setItem("gaxeta.benchBands." + sensorId, want ? "1" : "0");
          } catch {}
          benchBandsLocal.delete(sensorId);
          note = "Escolha guardada só neste aparelho: o banco ainda não recebeu a atualização que a compartilha (migração 16).";
        } else {
          benchBandsLocal.delete(sensorId);
          note = isNetworkError(error) ? "Sem resposta do servidor: a escolha não foi gravada. Tente de novo." : errorText(error);
        }
      }
      benchBusy.delete(sensorId);
      benchRepaint();
      if ($id("benchMessage2")) $id("benchMessage2").textContent = note;
    };
}
