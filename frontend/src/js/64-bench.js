// =============================================================================
// Modo bancada do sensor magnético (demonstração em mesa).
//   * Ativação explícita, com prévia antes de aplicar. Enquanto está ativo, cartão, árvore,
//     Detalhes, gráfico e CSV dizem "bancada": o número é a Posição de bancada (%), nunca o
//     curso de ajuste restante, e nada vai para a série de campo.
//   * O percentual é calculado no servidor pela contagem contínua que a placa mantém (firmware
//     4.5.0): limitado a 0–100 %, com o quanto passou do extremo guardado ao lado.
//   * A nuvem atualiza a cada envio da placa (30 s na bancada). O acompanhamento em tempo real
//     é o do monitor serial, pela USB. A tela mostra sempre a hora da última atualização.
//   * Sessão da placa diferente da confirmada = "Reposicionar para retomar": a última leitura boa
//     fica à vista, com horário, e nenhum número é inventado.
// =============================================================================
const BENCH_DEFAULT = { zero: 80, full: 180, direction: 1 };
const MAG15_MISSING_TEXT = "Esta função depende da atualização do banco desta revisão (migração 15), que ainda não foi aplicada.";
const benchForms = new Map(); // sensor → { open, zero, full, direction, preview, error, busy }
const benchRequests = new Map(); // sensor → identificador da operação em envio (o mesmo nas novas tentativas)
const benchFormOf = (sensorId) => {
  if (!benchForms.has(sensorId)) benchForms.set(sensorId, { open: false, zero: "", full: "", direction: "1", preview: null, error: "", bands: false });
  return benchForms.get(sensorId);
};
const benchDirText = (direction) => (Number(direction) > 0 ? "crescente (o percentual sobe quando o ângulo sobe)" : "decrescente (o percentual sobe quando o ângulo desce)");
// Graus digitados com vírgula ou ponto: 0 a 359,999.
function parseBenchDeg(text) {
  const raw = String(text ?? "").trim().replace(",", ".").replace("°", "");
  if (!/^\d+(\.\d{1,3})?$/.test(raw)) return NaN;
  const value = Number(raw);
  return value >= 0 && value < 360 ? value : NaN;
}
function benchPreviewHtml(preview) {
  if (!preview) return "";
  const current = preview.current;
  return (
    `<div class="bench-preview" id="benchPreview"><h4>Prévia (nada foi aplicado ainda)</h4>` +
    `<table><thead><tr><th>Ângulo do sensor</th><th>Posição de bancada</th></tr></thead><tbody>` +
    preview.marks.map((mark) => `<tr><td>${esc(fmtDeg(mark.angle_deg, 1))}</td><td>${esc(fmtNum(mark.percent, 0))} %</td></tr>`).join("") +
    `</tbody></table>` +
    `<p>Faixa de ${esc(fmtDeg(preview.span_deg, 1))}, sentido ${esc(benchDirText(preview.direction))}. Fora da faixa a barra fica em 0 % ou em 100 % e o quanto passou é guardado.</p>` +
    (current
      ? current.inside
        ? `<p class="bench-ok">Leitura atual: ${esc(fmtDeg(current.angle_deg, 2))} (bruto ${current.raw_angle}) → <b>${esc(fmtNum(current.percent, 2))} %</b>. O eixo está dentro da faixa: depois de ativar, toque em Confirmar início.</p>`
        : `<p class="bench-warn">Leitura atual: ${esc(fmtDeg(current.angle_deg, 2))} (bruto ${current.raw_angle}), <b>fora da faixa</b>. Antes de confirmar o início, gire o eixo para um ponto entre os dois extremos.</p>`
      : `<p class="bench-warn">Sem ângulo válido na leitura atual: confira o ímã e o sensor antes de confirmar o início.</p>`) +
    (preview.continuity ? "" : `<p class="bench-warn">A última leitura desta placa veio sem contagem contínua (firmware ${esc(preview.firmware_version || "desconhecido")}). O Modo bancada precisa do firmware 4.5.0 ou mais novo: sem ele a tela mostra "Sem contagem contínua", sem percentual.</p>`) +
    (preview.ends_reference ? `<p class="bench-warn">Este vínculo tem um engaxetamento de campo em andamento. Ativar o Modo bancada <b>encerra essa referência</b>; ao sair será preciso registrar o engaxetamento de novo.</p>` : "") +
    `</div>`
  );
}
// Formulário dos extremos (ativar ou trocar). Uma instalação com outro sentido ou posição
// configura os dois ângulos uma vez.
function benchFormHtml(form, active) {
  return (
    `<form id="benchForm" novalidate>` +
    `<div class="bench-fields"><label>Ângulo que vale 0 % (graus)<input id="benchZero" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.zero)}"></label>` +
    `<label>Ângulo que vale 100 % (graus)<input id="benchFull" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(form.full)}"></label>` +
    `<label>Sentido<select id="benchDirection"><option value="1"${form.direction === "1" ? " selected" : ""}>Crescente: sobe com o ângulo</option><option value="-1"${form.direction === "-1" ? " selected" : ""}>Decrescente: sobe quando o ângulo desce</option></select></label></div>` +
    `<p class="form-help">Use os ângulos que aparecem em "Ângulo do sensor" com o eixo em cada extremo. Proposta inicial do ensaio: 80° = 0 % e 180° = 100 %, crescente.</p>` +
    `<p id="benchMessage" class="form-message${form.error ? " is-error" : ""}" role="status">${esc(form.error || "")}</p>` +
    benchPreviewHtml(form.preview) +
    `<div class="drawer-actions"><button class="secondary" type="button" id="benchPreviewBtn">Ver prévia</button>` +
    `<button class="primary" type="submit" id="benchApply"${form.preview ? "" : " disabled"}>${active ? "Aplicar novos extremos" : "Ativar Modo bancada"}</button>` +
    `<button class="secondary" type="button" id="benchFormCancel">Cancelar</button></div></form>`
  );
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
// Barra de 0 a 100 % da bancada. Com "simulação das faixas" ligada, a cor segue as faixas de
// ajuste e a legenda diz que é simulação: na bancada o percentual não é curso de campo.
function benchBarHtml(bench, form) {
  const percent = bench.state === "ok" && bench.percent != null ? Number(bench.percent) : null;
  const band = form.bands && percent != null ? magBandOf(percent) : null;
  const over = Number(bench.over_deg) || 0;
  return (
    `<div class="bench-bar${percent == null ? " idle" : ""}${band ? " health-" + MAG_BAND[band].key : ""}" role="img" aria-label="Posição de bancada: ${percent == null ? "sem posição" : fmtNum(percent, 2) + " por cento"}">` +
    `<i style="width:${percent ?? 0}%"></i><span class="bench-mark" style="left:0">0 %</span><span class="bench-mark" style="left:50%">50</span><span class="bench-mark" style="left:100%">100 %</span></div>` +
    `<p class="bench-number"><strong id="benchPercent">${percent == null ? "—" : esc(fmtNum(percent, 2)) + " %"}</strong>` +
    `<span id="benchLimit">${percent == null ? "" : over > 0 ? `no teto · ${esc(fmtDeg(over, 1))} além do 100 %` : over < 0 ? `no piso · ${esc(fmtDeg(-over, 1))} abaixo do 0 %` : "dentro da faixa"}</span></p>` +
    (band ? `<p class="bench-sim"><span class="adjustment-badge health-${MAG_BAND[band].key}">${esc(MAG_BAND[band].label)}</span> simulação das faixas (${esc(MAG_BAND[band].range)}). Na bancada este percentual não é curso de ajuste restante.</p>` : "")
  );
}
function renderMagBench(device, view) {
  const box = $id("magBench");
  if (!box) return;
  const mag = view.mag;
  const bench = mag?.bench || null;
  const form = benchFormOf(device.sensor_id);
  const reading = mag?.reading || null;
  if (!mag || !mag.linked) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const pending = bench?.pending && !bench.pending.expired ? bench.pending : null;
  const state2 = !bench ? "off" : pending ? "pending" : bench.state;
  // Só é redesenhado quando o estado muda: preserva o que a pessoa está digitando.
  const signature = [state2, bench?.id, bench?.anchor_status, bench?.anchor_note, bench?.lost_reason, mag.can_operate, form.open, form.preview ? "p" : "", form.error, form.bands,
    bench?.state === "ok" ? [bench.percent, bench.over_deg, reading?.id].join("/") : reading?.id, view.reason].join("|");
  if (box.dataset.signature === signature) {
    if (pending && $id("benchWait")) $id("benchWait").textContent = benchWaitText(device, pending);
    if ($id("benchUpdated")) $id("benchUpdated").textContent = benchUpdatedText(device);
    return;
  }
  box.dataset.signature = signature;
  if (!bench) {
    box.className = "mag-bench";
    box.innerHTML = form.open
      ? `<h3>Modo bancada</h3><p class="form-help">Para demonstração em mesa: gire o ímã com a mão e acompanhe uma barra de 0 a 100 %. A série fica identificada como bancada em todas as telas e não entra no histórico de campo.</p>` + benchFormHtml(form, false)
      : `<h3>Modo bancada</h3><p class="form-help">Desligado. Serve para demonstrar o sensor na mesa, com uma barra de 0 a 100 % entre dois ângulos escolhidos.</p>` +
        (mag.can_operate ? `<div class="drawer-actions"><button class="secondary" type="button" id="benchOpen">Configurar e ativar…</button></div>` : `<p class="form-help">Sua conta consulta este sensor, sem permissão para ativar o Modo bancada.</p>`);
    return bindMagBench(device.sensor_id);
  }
  const lastOk = bench.last_ok;
  const stateHtml =
    state2 === "ok"
      ? ""
      : state2 === "pending"
        ? `<p class="mag-wait"><strong>Deixe o eixo parado dentro da faixa.</strong> <span id="benchWait">${esc(benchWaitText(device, pending))}</span></p>` +
          (bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note] ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>` : "")
        : state2 === "reposition"
          ? `<p class="bench-warn"><strong>Reposicionar para retomar.</strong> A placa deixou de garantir a continuidade do giro (${esc(ctLossText(bench.lost_reason))}${bench.lost_at ? ", " + esc(fmtDateTime(bench.lost_at)) : ""}): a posição atual pode estar em outra volta. Leve o eixo a um ponto conhecido dentro da faixa e confirme a referência.</p>`
          : state2 === "no_continuity"
            ? `<p class="bench-warn">${esc(MAG_REASON.bench_no_continuity.note)}</p>`
            : `<p class="bench-warn"><strong>Início não confirmado.</strong> Ponha o eixo parado em um ponto dentro da faixa (entre ${esc(fmtDeg(bench.zero_deg, 1))} e ${esc(fmtDeg(bench.full_deg, 1))}) e toque em Confirmar início. Um ângulo fora da faixa poderia pertencer a várias voltas.</p>` +
              (bench.anchor_note && BENCH_NOTE_TEXT[bench.anchor_note] ? `<p class="bench-warn">${esc(BENCH_NOTE_TEXT[bench.anchor_note])}</p>` : "");
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  box.className = "mag-bench is-active";
  box.innerHTML =
    `<h3><span class="series-tag is-bench">Modo bancada ativo</span> Posição de bancada (%)</h3>` +
    benchBarHtml(bench, form) +
    (sampleBad ? `<p class="bench-warn"><strong>${esc(view.label)}.</strong> ${esc(view.note)}</p>` : "") +
    stateHtml +
    (state2 !== "ok" && lastOk ? `<p class="mag-current">Última posição conhecida: ${esc(fmtNum(lastOk.percent, 2))} % em ${esc(fmtDateTime(lastOk.at))} (não é a leitura atual).</p>` : "") +
    `<dl class="bench-facts"><dt>Faixa</dt><dd>${esc(fmtDeg(bench.zero_deg, 1))} = 0 % · ${esc(fmtDeg(bench.full_deg, 1))} = 100 % · ${Number(bench.direction) > 0 ? "crescente" : "decrescente"}</dd>` +
    `<dt>Ângulo / bruto</dt><dd>${view.raw == null ? "sem ângulo" : esc(fmtDeg(view.degrees, 2)) + " · " + view.raw}</dd>` +
    `<dt>Posição contínua</dt><dd>${bench.continuous_deg == null ? "—" : esc(fmtDeg(bench.continuous_deg, 2)) + ` · ${bench.turns > 0 ? "+" : ""}${bench.turns} volta(s)`}</dd>` +
    `<dt>Sessão da placa</dt><dd>${esc(reading?.ct?.session || "sem contagem")}${bench.anchor_at ? " · início confirmado " + esc(fmtDateTime(bench.anchor_at)) : ""}</dd>` +
    `<dt>Última atualização</dt><dd id="benchUpdated">${esc(benchUpdatedText(device))}</dd></dl>` +
    `<p class="form-help">A nuvem atualiza a cada envio da placa. Para acompanhar o giro em tempo real, use o monitor serial pela USB: ele mostra a mesma conta, linha a linha.</p>` +
    (mag.can_operate
      ? form.open
        ? benchFormHtml(form, true)
        : `<div class="drawer-actions">` +
          (state2 === "pending" ? "" : `<button class="${state2 === "ok" ? "secondary" : "primary"}" type="button" id="benchConfirm">${state2 === "reposition" ? "Confirmar referência (reposicionado)" : state2 === "ok" ? "Confirmar referência de novo" : "Confirmar início"}</button>`) +
          `<button class="secondary" type="button" id="benchOpen">Trocar extremos…</button><button class="secondary" type="button" id="benchStop">Sair do Modo bancada</button></div>` +
          `<label class="check bench-sim-toggle"><input id="benchBands" type="checkbox"${form.bands ? " checked" : ""}> Mostrar a simulação das faixas de ajuste nesta barra</label>`
      : `<p class="form-help">Sua conta consulta este sensor, sem permissão para operar o Modo bancada.</p>`) +
    `<p id="benchMessage2" class="form-message" role="status"></p>`;
  bindMagBench(device.sensor_id);
}
function benchUpdatedText(device) {
  const period = Number(deviceInterval(device)) || 30;
  const age = Math.max(0, Math.round((Date.now() + state.clockOffset - new Date(device.last_received_at).getTime()) / 1000));
  return `${fmtDateTime(device.last_received_at)} · há ${fmtInterval(age)} · um envio a cada ${fmtInterval(period)}`;
}
function bindMagBench(sensorId) {
  const form = benchFormOf(sensorId);
  const refresh = async () => {
    await loadMagSummary([sensorId]).catch(() => {});
    if ($id("magBench")) $id("magBench").dataset.signature = "";
    if ($id("magService")) $id("magService").dataset.signature = "";
    updateDrawerLive();
    if (state.page === "sensors") renderSensorGrid();
    renderTree();
  };
  const redraw = () => {
    if ($id("magBench")) $id("magBench").dataset.signature = "";
    updateDrawerLive();
  };
  if ($id("benchOpen"))
    $id("benchOpen").onclick = () => {
      const bench = deviceMag(findDevice(sensorId))?.bench;
      Object.assign(form, {
        open: true, preview: null, error: "",
        zero: fmtMmInput(bench?.zero_deg ?? BENCH_DEFAULT.zero), full: fmtMmInput(bench?.full_deg ?? BENCH_DEFAULT.full), direction: String(bench?.direction ?? BENCH_DEFAULT.direction),
      });
      redraw();
      $id("benchZero")?.focus();
    };
  if ($id("benchFormCancel"))
    $id("benchFormCancel").onclick = () => {
      Object.assign(form, { open: false, preview: null, error: "" });
      redraw();
    };
  const readForm = () => {
    Object.assign(form, { zero: $id("benchZero").value, full: $id("benchFull").value, direction: $id("benchDirection").value });
    const zero = parseBenchDeg(form.zero);
    const full = parseBenchDeg(form.full);
    if (Number.isNaN(zero) || Number.isNaN(full)) throw Error("Informe os dois ângulos em graus, de 0 a 359,999 (vírgula ou ponto).");
    return { zero, full, direction: Number(form.direction) };
  };
  // Qualquer mudança nos campos invalida a prévia: só se aplica o que foi visto.
  for (const id of ["benchZero", "benchFull", "benchDirection"])
    if ($id(id))
      $id(id).oninput = () => {
        if (!form.preview) return;
        form.preview = null;
        if ($id("benchPreview")) $id("benchPreview").remove();
        if ($id("benchApply")) $id("benchApply").disabled = true;
      };
  if ($id("benchPreviewBtn"))
    $id("benchPreviewBtn").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        try {
          const values = readForm();
          form.preview = await callRpc("gaxeta_mag_bench_preview", { p_sensor_id: sensorId, p_zero_deg: values.zero, p_full_deg: values.full, p_direction: values.direction });
          form.error = "";
        } catch (error) {
          form.preview = null;
          form.error = isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error);
        }
        redraw();
      });
  if ($id("benchForm"))
    $id("benchForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        let values;
        try {
          values = readForm();
        } catch (error) {
          form.error = error.message;
          return redraw();
        }
        const preview = form.preview;
        if (!preview || Number(preview.zero_deg) !== values.zero || Number(preview.full_deg) !== values.full || Number(preview.direction) !== values.direction) {
          form.error = "Veja a prévia destes valores antes de aplicar.";
          form.preview = null;
          return redraw();
        }
        const key = `start:${values.zero}:${values.full}:${values.direction}`;
        const previous = benchRequests.get(sensorId);
        const request = previous?.key === key ? previous : { key, id: newRequestId() };
        benchRequests.set(sensorId, request);
        try {
          await callRpc("gaxeta_mag_bench_start", { p_sensor_id: sensorId, p_request_id: request.id, p_zero_deg: values.zero, p_full_deg: values.full, p_direction: values.direction });
          benchRequests.delete(sensorId);
          Object.assign(form, { open: false, preview: null, error: "" });
          showMessage("Modo bancada ativo. Ponha o eixo dentro da faixa e toque em Confirmar início.", "success");
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          form.error = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: a mesma ativação é reenviada, sem duplicar." : isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error);
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
          showMessage("Confirmação registrada. Deixe o eixo parado até a próxima leitura da placa.", "success");
        } catch (error) {
          if (!isNetworkError(error)) benchRequests.delete(sensorId);
          if ($id("benchMessage2")) $id("benchMessage2").textContent = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: a mesma confirmação é reenviada." : errorText(error);
          return;
        }
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
          Object.assign(form, { open: false, preview: null, error: "", bands: false });
          showMessage("Modo bancada desligado.", "success");
        } catch (error) {
          showMessage(errorText(error), "error");
        }
        await refresh();
      });
    };
  if ($id("benchBands"))
    $id("benchBands").onchange = () => {
      form.bands = $id("benchBands").checked;
      redraw();
    };
}
