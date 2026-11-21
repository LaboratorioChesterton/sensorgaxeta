// =============================================================================
// Sensor magnético (AS5600): cartão, painel de Detalhes e "Engaxetamento realizado".
//   * Sem vínculo: ângulo absoluto e saúde.
//   * Com vínculo e referência: Curso de ajuste restante (% e mm) em destaque; Avanço desde
//     engaxetamento e Ângulo do sensor em Detalhes.
//   * Medido (ângulo, campo, barramento), calculado (avanço, curso restante) e estimado (curso
//     sugerido pela ficha) aparecem com esses nomes, nunca misturados.
//   * O técnico informa uma medida (quanto curso ainda resta até o limite de ajuste) e toca em
//     um botão. A referência é capturada pelo servidor na primeira leitura válida depois do
//     clique; aqui só se mostra o estado: aguardando, confirmada, expirada.
//   * O curso restante não é força de aperto, pressão, qualidade de vedação nem vida útil.
// =============================================================================
const MAG_BUS_TEXT = { ok: "barramento I²C bom", no_ack: "módulo sem resposta (I²C)", read_error: "leitura I²C incompleta", timeout: "I²C sem resposta a tempo" };
const MAG_FIELD_TEXT = { ok: "campo magnético bom", no_magnet: "ímã ausente", weak: "campo fraco", strong: "campo forte" };

// Sinal em uma linha: barramento e campo da leitura atual.
function magSignalText(device, mag) {
  const bus = mag?.reading?.bus_status ?? device?.last_bus_status;
  const field = mag?.reading?.mag_status ?? device?.last_mag_status;
  if (!bus) return "sem leitura";
  return bus !== "ok" ? MAG_BUS_TEXT[bus] || bus : MAG_FIELD_TEXT[field] || "—";
}
function magCardHtml(device, view, status, identity, place, name) {
  const mag = view.mag;
  const stable = view.service?.stable_remaining;
  return (
    `<article class="sensor-card health-${view.key} is-magnetic" data-card="${esc(device.sensor_id)}">` +
    `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
    `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
    `<div class="card-main"><div class="card-value" title="${esc(view.kicker)} (${esc(view.origin)})">${esc(view.value)}<small>${esc(view.unit)}</small></div>` +
    `<div class="card-side"><span class="card-kicker">${esc(view.kicker)}</span><span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small></div></div>` +
    `<div class="mini-scale${view.scale == null ? " idle" : ""}" role="img" aria-label="${esc(view.kicker)}: ${esc(view.value)} ${esc(view.unit)}"><i style="width:${view.scale ?? 0}%"></i></div>` +
    `<div class="card-meta"><span title="Ângulo absoluto do ímã (medido). Não é avanço nem curso.">Ângulo ${esc(fmtDeg(view.degrees))}</span>` +
    (view.computed
      ? `<span title="Linha estabilizada do curso restante: só muda com variação de 5 pontos percentuais ou mais, dentro do mesmo engaxetamento">Estável ${fmtNum(stable)} %</span>`
      : `<span title="Sinal do sensor magnético">${esc(magSignalText(device, mag))}</span>`) +
    `<span title="Última leitura recebida">${fmtDateTime(device.last_received_at)}</span></div>` +
    `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
    (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
    `</footer></article>`
  );
}

// ----- Painel de Detalhes -----
// O bloco do engaxetamento fica logo abaixo das ações, antes da ficha do sensor: no celular o
// técnico chega ao campo e ao botão sem percorrer a lista de identificação.
const magServiceSection = () => `<section class="mag-service" id="magService" aria-live="polite"></section>`;
function magDrawerSections() {
  return (
    `<details class="technical-detail"><summary>Leitura magnética (diagnóstico)</summary><p class="form-help">O ângulo é a posição absoluta do ímã, de 0° a 359,9° (12 bits). O avanço e o curso restante só existem depois de um engaxetamento registrado e dentro da geometria validada da montagem. Campo fraco, campo forte, ímã ausente e falha do barramento deixam a leitura sem posição: a placa segue online e o motivo aparece aqui.</p><dl class="detail-fields" id="detailDiag"></dl></details>`
  );
}
function updateDrawerLiveMag(device, view, status) {
  const mag = view.mag;
  const reading = mag?.reading || null;
  const computed = view.computed;
  const service = view.service;
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${esc(status.label)} · ${fmtDateTime(device.last_received_at)}`;
  const tile = (id, value, note) => ($id(id).innerHTML = `${esc(value)}<small>${esc(note)}</small>`);
  const outside = view.reason === "out_of_range";
  tile("detailElectric", computed ? fmtNum(clampPercent(computed.remaining_percent)) + " %" : "—",
    computed ? `${fmtMm(computed.remaining_mm)} · calculado${outside ? " · fora da faixa" : ""}` : "sem referência válida");
  tile("detailVolt", computed ? fmtMm(computed.advance_mm, 2) : "—", computed ? "calculado" : "sem referência válida");
  tile("detailStableLine", view.value === "—" && !computed ? "—" : fmtDeg(view.degrees, 2), view.raw == null ? "sem ângulo" : `medido · bruto ${view.raw}`);
  tile("detailSignal", (MAG_REASON[view.reason]?.key === "warn" && view.reason !== "out_of_range" ? view.label : "Sinal válido"), magSignalText(device, mag));
  const cadence = firmwareCadence(device.firmware_version);
  $id("detailReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` + (cadence ? ` · ${cadence.text}` : "");
  $id("detailHealth").textContent = (computed && !view.reason ? "Curso de ajuste restante" : view.label) + " · " + view.note;
  $id("detailHealth").className = "health-banner health-" + view.key;
  renderMagService(device, view);
  if ($id("detailDiag")) {
    const lastValid = mag?.last_valid;
    const rows = [
      ["Ângulo do sensor (medido)", view.raw == null ? "sem ângulo nesta leitura" : `${fmtDeg(view.degrees, 3)} · bruto ${view.raw} de 4095`],
      ["Estabilidade do bloco", reading?.angle_pp == null && device.last_angle_pp == null ? "—" : `${reading?.angle_pp ?? device.last_angle_pp} contagens entre amostras (até 6 = estável)`],
      ["Barramento I²C", MAG_BUS_TEXT[reading?.bus_status ?? device.last_bus_status] || "—"],
      ["Campo magnético", MAG_FIELD_TEXT[reading?.mag_status ?? device.last_mag_status] || "—"],
      ["AGC / magnitude", `${reading?.agc ?? device.last_agc ?? "—"} / ${reading?.magnitude ?? device.last_magnitude ?? "—"}`],
      ...(view.reason && MAG_REASON[view.reason] ? [["O que fazer", MAG_REASON[view.reason].note]] : []),
      ...(lastValid && (view.raw == null || /^(bus_|no_magnet|field_)/.test(view.reason || ""))
        ? [["Último ângulo válido", `${fmtDeg(lastValid.angle_deg, 3)} em ${fmtDateTime(lastValid.at)} (não é a leitura atual)`]]
        : []),
      ["Avanço desde engaxetamento (calculado)", computed ? fmtMm(computed.advance_mm, 3) + (Number(computed.advance_mm) < 0 ? " · recuo" : "") : "—"],
      ["Curso de ajuste restante (calculado)", computed ? `${fmtNum(computed.remaining_percent, 2)} % · ${fmtMm(computed.remaining_mm, 3)}` + (outside ? " · fora da faixa validada" : "") : "—"],
      ["Linha estabilizada", service?.stable_remaining == null ? "—" : `${fmtNum(service.stable_remaining)} % · muda só com variação de 5 p.p. ou mais` + (service.stable_since ? ` · desde ${fmtDateTime(service.stable_since)}` : "")],
      ["Curso disponível no engaxetamento", service ? `${fmtMm(service.course_mm, 3)} · ${service.course_origin === "estimated" ? "estimado" : "medido"}` : "—"],
      ["Geometria da referência", service ? service.geometry + (service.provisional ? " · em caracterização (resultado provisório)" : " · validada") + (service.geometry_current === false ? " · o spot já usa outra revisão" : "") : "—"],
      ["Ângulo de referência", service ? `${fmtDeg(service.ref_angle_deg, 3)} · bruto ${service.ref_raw_angle} · ${fmtDateTime(service.ref_sampled_at || service.captured_at)}` : "—"],
      ["Montagem do spot", mag?.setup?.key ? `${mag.setup.label} (${mag.setup.key} r${mag.setup.revision}) · ${mag.setup.status === "validated" ? "validada" : mag.setup.status === "draft" ? "em caracterização" : "retirada"}` : "não definida"],
      ["Cadência", [cadence ? "declarada pelo firmware: " + cadence.text : "", mag?.interval_s ? "anunciada pela placa: " + fmtInterval(mag.interval_s) : ""].filter(Boolean).join(" · ") || "—"],
      ["Método de aquisição", device.last_acq_method || "—"],
      ["Amostra colhida", fmtDateTime(device.last_sampled_at)],
      ["Recebida no servidor", fmtDateTime(device.last_received_at)],
    ];
    $id("detailDiag").innerHTML = rows.map(([name, value]) => `<dt>${esc(name)}</dt><dd>${esc(value)}</dd>`).join("");
  }
  if ($id("detailSequence")) $id("detailSequence").textContent = device.last_sequence ?? "—";
  if ($id("detailRssi")) $id("detailRssi").textContent = `${device.last_rssi ?? "—"} dBm`;
}

// ----- Engaxetamento realizado -----
// O bloco só é redesenhado quando o estado muda, para não apagar o que a pessoa está digitando.
function renderMagService(device, view) {
  const box = $id("magService");
  if (!box) return;
  const mag = view.mag;
  const pending = mag?.pending || null;
  const service = view.service;
  const setup = mag?.setup || null;
  const sending = state.magRequests.get(device.sensor_id) || null;
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  const mode = !mag
    ? "unavailable"
    : !mag.linked
      ? "no_link"
      : pending && !pending.expired
        ? "pending"
        : !setup?.key
          ? "no_geometry"
          : !mag.can_operate
            ? "readonly"
            : "form";
  const signature = [mode, pending?.id, pending?.expired, service?.id, setup?.geometry_id, setup?.status, sampleBad, mag?.can_operate, sending?.error || "", sending ? "s" : ""].join("|");
  const current = service
    ? `<p class="mag-current">Referência atual: ${esc(fmtDateTime(service.captured_at))} · ${esc(fmtMm(service.course_mm))} ${service.course_origin === "estimated" ? "estimados" : "medidos"} · ângulo de referência ${esc(fmtDeg(service.ref_angle_deg))}${service.provisional ? " · provisório" : ""}</p>`
    : "";
  if (box.dataset.signature === signature) {
    // Mesmo estado: só a contagem da espera muda.
    if (mode === "pending" && $id("magWait")) $id("magWait").textContent = magWaitText(device, pending);
    return;
  }
  box.dataset.signature = signature;
  if (mode === "unavailable") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Estado do engaxetamento indisponível no momento. O ângulo e a saúde do sensor seguem acima.</p>`;
  } else if (mode === "no_link") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Sensor sem vínculo com spot. Associe o sensor a um spot para registrar o engaxetamento e acompanhar o curso restante.</p>`;
  } else if (mode === "pending") {
    box.innerHTML =
      `<h3>Aguardando leitura</h3>` +
      `<p class="mag-wait"><strong>Mantenha a haste parada.</strong> <span id="magWait">${esc(magWaitText(device, pending))}</span></p>` +
      `<p class="form-help">Solicitado ${pending.mine ? "por você" : "por outro operador"} às ${esc(fmtDateTime(pending.requested_at))}, com ${esc(fmtMm(pending.course_mm))} ${pending.course_origin === "estimated" ? "estimados" : "medidos"}. A referência é a primeira leitura válida e estável colhida depois do toque. Se a haste foi movida, cancele e repita.</p>` +
      current +
      (mag.can_operate ? `<div class="drawer-actions"><button class="secondary" type="button" id="magCancel">Cancelar solicitação</button></div>` : "") +
      `<p id="magMessage" class="form-message" role="status"></p>`;
  } else if (mode === "no_geometry") {
    box.innerHTML =
      `<h3>Engaxetamento</h3><p class="form-help">Este spot ainda não tem geometria de montagem caracterizada. Sem ela a plataforma mostra só o ângulo e a saúde do sensor. A engenharia vincula a revisão da montagem ao spot.</p>` +
      (setup?.suggested_course_mm ? `<p class="form-help">Curso típico da ficha: ${esc(fmtMm(setup.suggested_course_mm))} (estimativa, não é medida).</p>` : "");
  } else if (mode === "readonly") {
    box.innerHTML = `<h3>Engaxetamento</h3>${current || '<p class="form-help">Nenhum engaxetamento registrado neste vínculo.</p>'}<p class="form-help">Sua conta consulta este sensor, sem permissão para registrar engaxetamento.</p>`;
  } else {
    const suggestion = setup.suggested_course_mm;
    const draft = setup.status !== "validated";
    box.innerHTML =
      `<h3>Engaxetamento realizado</h3>` +
      (pending?.expired ? `<p class="form-message is-error">A solicitação anterior venceu sem uma leitura válida. Confira o sensor e repita.</p>` : "") +
      (draft ? `<p class="form-message">Geometria ainda em caracterização: o resultado sai como provisório e só a engenharia registra.</p>` : "") +
      `<form id="magForm" novalidate><label>Curso ainda disponível até o limite de ajuste (mm)` +
      `<input id="magCourse" type="text" inputmode="decimal" pattern="[0-9]+([.,][0-9]{1,3})?" maxlength="9" required autocomplete="off" value="${esc(sending?.course == null ? "" : String(sending.course).replace(".", ","))}" aria-describedby="magCourseHelp"></label>` +
      `<p id="magCourseHelp" class="form-help">Meça agora, na direção do ajuste, quanto o preme-gaxeta ainda pode avançar. Faixa desta montagem: ${esc(fmtNum(setup.min_course_mm))} a ${esc(fmtNum(setup.max_course_mm))} mm.` +
      (suggestion ? ` Curso típico da ficha: ${esc(fmtMm(suggestion))} (estimativa).` : "") + `</p>` +
      (suggestion ? `<label class="mag-estimate"><input id="magEstimated" type="checkbox"${sending?.origin === "estimated" ? " checked" : ""}> Não medi: usar a estimativa de ${esc(fmtMm(suggestion))}</label>` : "") +
      `<p id="magMessage" class="form-message${sending?.error ? " is-error" : ""}" role="status">${esc(sending?.error || (sampleBad ? MAG_REASON[view.reason]?.note || "" : ""))}</p>` +
      `<div class="drawer-actions"><button class="primary" type="submit" id="magSubmit">${sending?.error ? "Tentar de novo" : "Engaxetamento realizado"}</button></div></form>` +
      current +
      `<p class="form-help">Depois do toque, mantenha a haste parada até a confirmação. A leitura de referência passa a valer como avanço zero e curso restante de 100 %.</p>`;
  }
  bindMagDrawer(device.sensor_id);
}
// Espera estimada pela cadência anunciada: quanto falta para a próxima leitura da placa.
function magWaitText(device, pending) {
  const period = Number(deviceInterval(device)) || 30;
  const now = Date.now() + state.clockOffset;
  const sinceLast = (now - new Date(device.last_received_at).getTime()) / 1000;
  const next = Math.max(0, Math.round(period - (sinceLast % period)));
  const left = Math.max(0, Math.round((new Date(pending.expires_at).getTime() - now) / 1000));
  return `Próxima leitura em cerca de ${fmtInterval(next)} (um envio a cada ${fmtInterval(period)}). A solicitação vale por mais ${fmtInterval(left)}.`;
}
function bindMagDrawer(sensorId) {
  const estimated = $id("magEstimated");
  if (estimated)
    estimated.onchange = () => {
      const device = findDevice(sensorId);
      const suggestion = deviceMag(device)?.setup?.suggested_course_mm;
      if (estimated.checked && suggestion != null) $id("magCourse").value = Number(suggestion).toLocaleString("pt-BR", { maximumFractionDigits: 3, useGrouping: false });
      $id("magCourse").readOnly = estimated.checked;
    };
  if (estimated?.checked) $id("magCourse").readOnly = true;
  if ($id("magForm"))
    $id("magForm").onsubmit = (event) => {
      event.preventDefault();
      submitMagService(sensorId, event.submitter).catch((error) => showMessage(errorText(error), "error"));
    };
  if ($id("magCancel"))
    $id("magCancel").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const device = findDevice(sensorId);
        const pending = deviceMag(device)?.pending;
        if (!pending) return;
        try {
          await callRpc("gaxeta_mag_cancel_service", { p_sensor_id: sensorId, p_service_id: pending.id });
          showMessage("Solicitação cancelada. A referência anterior continua valendo.", "success");
        } catch (error) {
          if ($id("magMessage")) $id("magMessage").textContent = errorText(error);
        }
        await loadMagSummary([sensorId]).catch(() => {});
        updateDrawerLive();
      });
}
async function submitMagService(sensorId, button) {
  const device = findDevice(sensorId);
  const setup = deviceMag(device)?.setup;
  const message = $id("magMessage");
  const raw = String($id("magCourse").value).replace(",", ".").trim();
  const course = Number(raw);
  const estimated = !!$id("magEstimated")?.checked;
  // Validação local só para a mensagem imediata; quem decide é o servidor.
  if (!raw || !/^\d+(\.\d+)?$/.test(raw) || !Number.isFinite(course) || course <= 0) return void ((message.textContent = "Informe o curso disponível em mm (maior que zero)."), message.classList.add("is-error"));
  if (Math.round(course * 1000) !== course * 1000 && Math.abs(Math.round(course * 1000) - course * 1000) > 1e-6)
    return void ((message.textContent = "Use até três casas decimais."), message.classList.add("is-error"));
  if (setup && (course < Number(setup.min_course_mm) || course > Number(setup.max_course_mm)))
    return void ((message.textContent = `Curso fora da faixa desta montagem (${fmtNum(setup.min_course_mm)} a ${fmtNum(setup.max_course_mm)} mm).`), message.classList.add("is-error"));
  // O mesmo identificador vale para as novas tentativas do mesmo toque (resposta perdida, toque duplo).
  const previous = state.magRequests.get(sensorId);
  const origin = estimated ? "estimated" : "measured";
  const request = previous && previous.course === course && previous.origin === origin ? previous : { id: newRequestId(), course, origin };
  request.error = "";
  state.magRequests.set(sensorId, request);
  message.classList.remove("is-error");
  message.textContent = "Registrando…";
  await withBusy(button, async () => {
    try {
      await callRpc("gaxeta_mag_request_service", { p_sensor_id: sensorId, p_request_id: request.id, p_course_mm: course, p_course_origin: origin });
      state.magRequests.delete(sensorId);
      showMessage("Engaxetamento registrado. Aguardando a próxima leitura: mantenha a haste parada.", "success");
    } catch (error) {
      // Falha de transporte: guarda a solicitação para repetir com o mesmo identificador.
      if (isNetworkError(error)) request.error = "Sem resposta do servidor. Toque de novo: a mesma solicitação é reenviada, sem duplicar.";
      else {
        // Recusa do servidor: a mensagem fica no formulário; a próxima tentativa é uma solicitação nova.
        request.error = errorText(error);
        request.id = newRequestId();
      }
    }
    await loadMagSummary([sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    updateDrawerLive();
  });
}
