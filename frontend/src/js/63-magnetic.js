// =============================================================================
// Sensor magnético (AS5600): cartão, painel de Detalhes e "Engaxetamento realizado".
//   * Modo bancada (64-bench.js): série própria, sempre identificada; não se mistura com o campo.
//   * Campo: o número em destaque é o curso restante estabilizado, com a faixa de ajuste decidida
//     no servidor; "curso estimado" aparece sempre que D veio do valor típico do cadastro.
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
// O que falta no cadastro deste spot para o cálculo de campo, e se esta conta pode resolver.
function magConfigState(mag) {
  const config = mag?.config || null;
  const missing = config?.missing || [];
  // No cartão, o botão Configurar aparece quando o que falta impede o próximo passo e esta conta
  // resolve: geometria ou validação (engenharia), ou o curso típico enquanto não há referência.
  const blocksGeometry = missing.includes("geometry") || missing.includes("validation");
  return {
    missing,
    canFix: !!config && ((blocksGeometry && config.can_geometry) || (missing.includes("course") && config.can_course && !mag.service)),
    can: !!config && (config.can_course || config.can_geometry),
    pointId: config?.point_id || null,
  };
}
// Idade de uma leitura, em texto curto ("12 s", "4 min").
const agoText = (value) => fmtInterval(Math.max(0, Math.round((Date.now() + state.clockOffset - new Date(value).getTime()) / 1000)));
// Uma linha para leitura rápida do sensor em bancada: "67,83 % · Médio ajuste" (ou o estado, sem
// número). Usada na árvore e em Ativos, sempre a partir do mesmo `view` do cartão.
function benchFace(device, view) {
  const status = deviceStatus(device);
  const has = view.scale != null;
  return {
    has, status, stale: has && !status.online, lastOk: has ? null : view.bench?.last_ok || null,
    text: has ? `${view.value} %` + (view.sim ? ` · ${view.sim.label}` : "") : view.label,
    at: device.last_received_at,
  };
}
// Cartão do sensor em Modo bancada: percentual, faixa simulada e barra em destaque, uma única
// identificação lilás de bancada e o horário da leitura. O ponto de transmissão (cabeçalho) é
// independente: um sensor pode estar transmitindo e mostrar "Sem ajuste" simulado.
function benchCardHtml(device, view, status, identity, place, name, config) {
  const bench = view.bench;
  const sim = view.sim;
  const face = benchFace(device, view);
  const side = face.has
    ? sim
      ? benchSimChip(sim, " is-large") + `<small>faixa simulada · ${esc(sim.range)}</small>`
      : `<span class="adjustment-badge">Posição de bancada</span><small>faixas simuladas desligadas</small>`
    : `<span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small>`;
  const time = face.stale
    ? `Última leitura válida às <b>${esc(fmtClock(face.at))}</b> · sem atualização há ${esc(agoText(face.at))}`
    : face.has
      ? `Atualizado às <b>${esc(fmtClock(face.at))}</b>` + (device.last_sampled_at ? ` · amostra das ${esc(fmtClock(device.last_sampled_at))}` : "")
      : face.lastOk
        ? `Última leitura válida: <b>${esc(fmtNum(benchShown(face.lastOk.percent), 2))} %</b> às ${esc(fmtClock(face.lastOk.at))} (não é a atual)`
        : `Atualizado às <b>${esc(fmtClock(face.at))}</b>`;
  return (
    `<article class="sensor-card health-${view.key} is-magnetic is-bench${face.stale ? " is-stale" : ""}" data-card="${esc(device.sensor_id)}">` +
    `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
    `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
    `<p class="bench-flag"><span class="series-tag is-bench" title="Série de bancada: demonstração em mesa. Não é curso de campo e não gera evento de manutenção.">Modo bancada</span>` +
    `<span>${face.stale ? "Última leitura válida (não é a atual)" : "Posição de bancada"}</span></p>` +
    `<div class="card-main"><div class="card-value" title="Posição de bancada (${esc(view.origin)})">${esc(view.value)}<small>${esc(view.unit)}</small></div>` +
    `<div class="card-side">${side}</div></div>` +
    `<div class="mini-scale bench-scale${face.has ? "" : " idle"}" role="img" aria-label="Posição de bancada: ${esc(face.text)}"><i style="width:${view.scale ?? 0}%"></i>` +
    (view.benchBands ? `<b style="left:30%"></b><b style="left:50%"></b><b style="left:73%"></b>` : "") + `</div>` +
    `<p class="card-time${face.stale ? " is-late" : ""}">${time}</p>` +
    `<div class="card-meta"><span title="Ângulo absoluto do ímã (medido). Não é avanço nem curso.">Ângulo ${esc(fmtDeg(view.degrees))}</span>` +
    (face.has ? `<span title="Fora da faixa a barra fica em 0 % ou em 100 % e o quanto passou é guardado">${esc(view.where)}</span>` : `<span title="Sinal do sensor magnético">${esc(magSignalText(device, view.mag))}</span>`) +
    `</div>` +
    `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
    (config.canFix ? `<button data-act="setup" title="Falta cadastro para calcular o curso de ajuste restante">Configurar</button>` : "") +
    (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
    `</footer></article>`
  );
}
function magCardHtml(device, view, status, identity, place, name) {
  const mag = view.mag;
  const config = magConfigState(mag);
  if (view.bench) return benchCardHtml(device, view, status, identity, place, name, config);
  // Selo da série de campo: curso estimado quando D veio do valor típico. A cor não é o único sinal.
  const tag = view.estimated
    ? `<span class="series-tag is-estimated" title="O curso disponível deste engaxetamento veio do valor típico do cadastro, não de uma medida.">Curso estimado</span>`
    : "";
  return (
    `<article class="sensor-card health-${view.key} is-magnetic" data-card="${esc(device.sensor_id)}">` +
    `<header><strong title="${esc(name)}">${esc(name)}</strong><span class="conn"><i class="dot ${status.className}"></i><span>${esc(status.label)}</span></span></header>` +
    `<p class="card-path${place ? "" : " unlinked"}" title="${esc(identity.path || "Sensor ainda não associado a um spot")}">${esc(place || "Sem vínculo · fila de associação")}</p>` +
    `<div class="card-main"><div class="card-value" title="${esc(view.kicker)} (${esc(view.origin)})">${esc(view.value)}<small>${esc(view.unit)}</small></div>` +
    `<div class="card-side"><span class="card-kicker">${esc(view.kicker)}</span>${tag}<span class="adjustment-badge">${esc(view.label)}</span><small title="${esc(view.note)}">${esc(view.note)}</small></div></div>` +
    `<div class="mini-scale${view.scale == null ? " idle" : ""}" role="img" aria-label="${esc(view.kicker)}: ${esc(view.value)} ${esc(view.unit)}"><i style="width:${view.scale ?? 0}%"></i></div>` +
    `<div class="card-meta"><span title="Ângulo absoluto do ímã (medido). Não é avanço nem curso.">Ângulo ${esc(fmtDeg(view.degrees))}</span>` +
    (view.computed
      ? `<span title="Valor da leitura atual, sem a estabilização de 5 pontos percentuais">Instantâneo ${fmtNum(view.instant, 2)} %</span>`
      : `<span title="Sinal do sensor magnético">${esc(magSignalText(device, mag))}</span>`) +
    `<span title="Última atualização recebida da placa">Atualizado ${fmtDateTime(device.last_received_at)}</span></div>` +
    `<footer><button data-act="history">Histórico</button><button data-act="detail">Detalhes</button>` +
    (config.canFix ? `<button data-act="setup" title="Falta cadastro para calcular o curso de ajuste restante">Configurar</button>` : "") +
    (canEditDevice(device) ? `<button data-act="edit">Editar</button>` : "") +
    `</footer></article>`
  );
}

// ----- Painel de Detalhes -----
// O bloco do engaxetamento fica logo abaixo das ações, antes da ficha do sensor: no celular o
// técnico chega ao campo e ao botão sem percorrer a lista de identificação.
const magServiceSection = () => `<section class="mag-bench" id="magBench" aria-live="polite"></section><section class="mag-service" id="magService" aria-live="polite"></section>`;
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
  const bench = view.bench || null;
  const ct = reading?.ct || null;
  $id("detailStatus").innerHTML = `<i class="dot ${status.className}"></i>${esc(status.label)} · atualizado ${fmtDateTime(device.last_received_at)}`;
  const tile = (id, value, note) => ($id(id).innerHTML = `${esc(value)}<small>${esc(note)}</small>`);
  const label = (id, text) => $id(id) && ($id(id).textContent = text);
  const outside = view.reason === "out_of_range";
  if (bench) {
    // Bancada: o número é a Posição de bancada (%); graus e bruto ficam ao lado.
    label("detailElectricLabel", "Posição de bancada (%)");
    label("detailVoltLabel", "Posição contínua");
    tile("detailElectric", view.value === "—" ? "—" : view.value + " %", view.value === "—" ? view.label : view.sim ? `${view.sim.label} · faixa simulada` : "calculado · bancada");
    tile("detailVolt", bench.continuous_deg == null ? "—" : fmtDeg(bench.continuous_deg, 2), bench.continuous_deg == null ? "sem posição conhecida" : `${bench.turns > 0 ? "+" : ""}${bench.turns} volta(s) · medido`);
  } else {
    label("detailElectricLabel", "Curso de ajuste restante");
    label("detailVoltLabel", "Avanço desde engaxetamento");
    tile("detailElectric", computed && view.value !== "—" ? view.value + " %" : "—",
      computed ? `${outside ? "fora da faixa" : MAG_BAND[view.band]?.label || "estabilizado"} · ${view.estimated ? "curso estimado" : "curso medido"}` : "sem referência válida");
    tile("detailVolt", computed ? fmtMm(computed.advance_mm, 2) : "—", computed ? `calculado · instantâneo ${fmtNum(computed.remaining_percent, 2)} %` : "sem referência válida");
  }
  // A cor do quadro do percentual é a mesma do cartão (faixa simulada, ou neutra de bancada).
  $id("detailElectric").parentElement.className = bench ? `health-${view.key} is-sim-tile` : "";
  tile("detailStableLine", view.raw == null ? "—" : fmtDeg(view.degrees, 2), view.raw == null ? "sem ângulo" : `medido · bruto ${view.raw}`);
  tile("detailSignal", (MAG_REASON[view.reason]?.key === "warn" && view.reason !== "out_of_range" && !/^bench_/.test(view.reason) ? view.label : "Sinal válido"), magSignalText(device, mag));
  const cadence = firmwareCadence(device.firmware_version);
  $id("detailReading").textContent =
    `Leitura de ${fmtDateTime(device.last_sampled_at || device.last_received_at)} · sequência ${device.last_sequence ?? "—"}` + (cadence ? ` · ${cadence.text}` : "");
  $id("detailHealth").textContent =
    (bench && view.scale != null
      ? "Modo bancada · " + (view.sim ? `faixa simulada: ${view.sim.label}` : "posição de bancada") + (status.online ? "" : ` · última leitura válida às ${fmtClock(device.last_received_at)}, não é a atual`)
      : computed && !view.reason ? `Curso de ajuste restante · ${view.label}` : view.label) + " · " + (bench && view.scale != null ? view.where + " · não é curso de campo" : view.note);
  $id("detailHealth").className = "health-banner health-" + view.key;
  renderMagBench(device, view);
  renderMagService(device, view);
  if ($id("detailUnlink")) $id("detailUnlink").hidden = !(isAdminWriter() && device.measurement_point_id);
  if ($id("detailDiag")) {
    const lastValid = mag?.last_valid;
    const rows = [
      ["Série exibida", bench ? "bancada (demonstração em mesa)" + (view.benchBands ? " · faixas simuladas ligadas" : " · faixas simuladas desligadas") : computed ? view.series : "ângulo do sensor (sem curso calculado)"],
      ["Ângulo do sensor (medido)", view.raw == null ? "sem ângulo nesta leitura" : `${fmtDeg(view.degrees, 3)} · bruto ${view.raw} de 4095`],
      ["Estabilidade do bloco", reading?.angle_pp == null && device.last_angle_pp == null ? "—" : `${reading?.angle_pp ?? device.last_angle_pp} contagens entre amostras (até 6 = estável)`],
      ["Barramento I²C", MAG_BUS_TEXT[reading?.bus_status ?? device.last_bus_status] || "—"],
      ["Campo magnético", MAG_FIELD_TEXT[reading?.mag_status ?? device.last_mag_status] || "—"],
      ["AGC / magnitude", `${reading?.agc ?? device.last_agc ?? "—"} / ${reading?.magnitude ?? device.last_magnitude ?? "—"}`],
      ["Contagem contínua (placa)", !ct ? "não enviada por este firmware (anterior ao 4.5.0)" : ct.session ? `sessão ${ct.session} · ${ct.count} contagens · ${fmtDeg(ct.continuous_deg, 3)} contínuos · iniciada por: ${ctLossText(ct.loss)}` : `sem contagem agora: ${ctLossText(ct.loss)}`],
      ...(ct && ct.step != null ? [["Margem desde o envio anterior", `maior passo entre amostras: ${ct.step} contagens (${fmtDeg((ct.step * 360) / 4096, 2)}; o limite é 90°) · maior lacuna: ${ct.gap_ms} ms`]] : []),
      ...(view.reason && MAG_REASON[view.reason] ? [["O que fazer", MAG_REASON[view.reason].note]] : []),
      ...(lastValid && (view.raw == null || /^(bus_|no_magnet|field_)/.test(view.reason || ""))
        ? [["Último ângulo válido", `${fmtDeg(lastValid.angle_deg, 3)} em ${fmtDateTime(lastValid.at)} (não é a leitura atual)`]]
        : []),
      ...(bench
        ? [
            ["Bancada: faixa configurada", `${fmtDeg(bench.zero_deg, 1)} = 0 % · ${fmtDeg(bench.full_deg, 1)} = 100 % · sentido ${bench.direction > 0 ? "crescente" : "decrescente"} · ${fmtDeg(bench.span_deg, 1)} de faixa`],
            ["Bancada: posição contínua", bench.u_deg == null ? "—" : `${fmtDeg(bench.u_deg, 2)} a partir do 0 %` + (Number(bench.over_deg) ? ` · ${fmtDeg(Math.abs(bench.over_deg), 2)} ${bench.over_deg > 0 ? "além do 100 %" : "abaixo do 0 %"}` : "")],
            ["Bancada: início confirmado", bench.anchor_at ? fmtDateTime(bench.anchor_at) : "ainda não"],
          ]
        : [
            ["Avanço desde engaxetamento (calculado)", computed ? fmtMm(computed.advance_mm, 3) + (Number(computed.advance_mm) < 0 ? " · recuo" : "") : "—"],
            ["Curso de ajuste restante (instantâneo)", computed ? `${fmtNum(computed.remaining_percent, 2)} % · ${fmtMm(computed.remaining_mm, 3)}` + (outside ? " · fora da faixa validada" : "") : "—"],
            ["Curso de ajuste restante (estabilizado)", service?.stable_remaining == null ? "—" : `${fmtNum(service.stable_shown ?? service.stable_remaining, 2)} % · ${MAG_BAND[service.band]?.label || "—"} · muda só com variação de 5 p.p. ou mais` + (service.stable_since ? ` · desde ${fmtDateTime(service.stable_since)}` : "")],
            ["Curso disponível no engaxetamento", service ? `${fmtMm(service.course_mm, 3)} · ${service.course_origin === "estimated" ? "estimado (valor típico do cadastro)" : "medido"}` : "—"],
            ["Geometria da referência", service ? service.geometry + (service.provisional ? " · em caracterização (resultado provisório)" : " · validada") + (service.geometry_current === false ? " · o spot já usa outra revisão" : "") : "—"],
            ["Ângulo de referência", service ? `${fmtDeg(service.ref_angle_deg, 3)} · bruto ${service.ref_raw_angle} · ${fmtDateTime(service.ref_sampled_at || service.captured_at)}` : "—"],
          ]),
      ["Montagem do spot", mag?.setup?.key ? `${mag.setup.label} (${mag.setup.key} r${mag.setup.revision}) · ${mag.setup.status === "validated" ? "validada" : mag.setup.status === "draft" ? "em caracterização" : "retirada"}` + (mag.setup.geometry_source ? ` · ${mag.setup.geometry_source === "point" ? "vinculada a este spot" : "sugerida no TAG"}` : "") : "não definida"],
      ["Curso disponível típico", mag?.setup?.suggested_course_mm != null ? `${fmtMm(mag.setup.suggested_course_mm, 2)} · ${COURSE_SOURCE_TEXT[mag.setup.course_source] || "do cadastro"} · estimativa` : "não cadastrado"],
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
  const config = magConfigState(mag);
  const maintenance = mag?.maintenance || null;
  const sending = state.magRequests.get(device.sensor_id) || null;
  const sampleBad = /^(bus_|no_magnet|field_|no_reading)/.test(view.reason || "");
  const mode = !mag
    ? "unavailable"
    : !mag.linked
      ? "no_link"
      : mag.bench
        ? "bench"
        : pending && !pending.expired
          ? "pending"
          : !setup?.key
            ? "no_geometry"
            : !mag.can_operate
              ? "readonly"
              : "form";
  const signature = [mode, pending?.id, pending?.expired, service?.id, setup?.geometry_id, setup?.status, setup?.suggested_course_mm, setup?.course_source, sampleBad, mag?.can_operate,
    config.missing.join(","), config.can, maintenance?.id, sending?.error || "", sending ? "s" : "", sending?.manual ? "m" : ""].join("|");
  const current = service
    ? `<p class="mag-current">Referência atual: ${esc(fmtDateTime(service.captured_at))} · ${esc(fmtMm(service.course_mm))} ${service.course_origin === "estimated" ? "estimados" : "medidos"} · ângulo de referência ${esc(fmtDeg(service.ref_angle_deg))}${service.provisional ? " · provisório" : ""}</p>`
    : "";
  if (box.dataset.signature === signature) {
    // Mesmo estado: só a contagem da espera muda.
    if (mode === "pending" && $id("magWait")) $id("magWait").textContent = magWaitText(device, pending);
    return;
  }
  box.dataset.signature = signature;
  // Quem pode configurar e o que falta, dito com todas as letras.
  const missingText = { course: "o curso disponível típico (mm)", geometry: "a revisão da montagem (geometria ensaiada)", validation: "a validação da montagem pelo ensaio" };
  const whoText = (item) => (item === "course" ? "quem edita o TAG ou o spot em Ativos (ADM nível 1 ou 2, ou usuário da corporação com permissão de edição neste ramo)" : "a engenharia (ADM nível 1 ou 2)");
  const gaps = config.missing.length
    ? `<ul class="mag-gaps">${config.missing.map((item) => `<li><b>Falta ${esc(missingText[item])}.</b> Quem cadastra: ${esc(whoText(item))}.</li>`).join("")}</ul>`
    : "";
  const setupButton = config.can ? `<button class="secondary" type="button" id="magSetupOpen">Configurar montagem</button>` : "";
  const maintenanceLine = maintenance
    ? `<p class="mag-current">Último registro de manutenção (sem referência): ${esc(fmtDateTime(maintenance.noted_at))}${maintenance.mine ? " · por você" : ""}${maintenance.note ? " · " + esc(maintenance.note) : ""}</p>`
    : "";
  if (mode === "unavailable") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Estado do engaxetamento indisponível no momento. O ângulo e a saúde do sensor seguem acima.</p>`;
  } else if (mode === "no_link") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">Sensor sem vínculo com spot. Associe o sensor a um spot para registrar o engaxetamento e acompanhar o curso restante.</p>`;
  } else if (mode === "bench") {
    box.innerHTML = `<h3>Engaxetamento</h3><p class="form-help">O Modo bancada está ativo: a série exibida é de bancada. Para registrar um engaxetamento de campo, saia do Modo bancada.</p>` + maintenanceLine;
  } else if (mode === "pending") {
    box.innerHTML =
      `<h3>Aguardando leitura</h3>` +
      `<p class="mag-wait"><strong>Mantenha a haste parada.</strong> <span id="magWait">${esc(magWaitText(device, pending))}</span></p>` +
      `<p class="form-help">Solicitado ${pending.mine ? "por você" : "por outro operador"} às ${esc(fmtDateTime(pending.requested_at))}, com ${esc(fmtMm(pending.course_mm))} ${pending.course_origin === "estimated" ? "estimados" : "medidos"}. A referência é a primeira leitura válida e estável colhida depois do toque. Se a haste foi movida, cancele e repita.</p>` +
      current +
      (mag.can_operate ? `<div class="drawer-actions"><button class="secondary" type="button" id="magCancel">Cancelar solicitação</button></div>` : "") +
      `<p id="magMessage" class="form-message" role="status"></p>`;
  } else if (mode === "no_geometry") {
    // Sem montagem caracterizada não há escala física: só o fato da manutenção pode ser registrado.
    box.innerHTML =
      `<h3>Engaxetamento</h3><p class="form-help">Configuração pendente: sem a montagem ensaiada a plataforma mostra só o ângulo e a saúde do sensor. O curso de ajuste restante não é calculado, e nenhum número é posto no lugar.</p>` +
      gaps +
      (setup?.suggested_course_mm ? `<p class="form-help">Curso disponível típico: ${esc(fmtMm(setup.suggested_course_mm, 2))} (${esc(COURSE_SOURCE_TEXT[setup.course_source] || "do cadastro")}; estimativa, não é medida).</p>` : "") +
      (setupButton || mag.can_operate
        ? `<div class="drawer-actions">${setupButton}${mag.can_operate ? `<button class="secondary" type="button" id="magNote">Registrar engaxetamento (sem referência)</button>` : ""}</div>`
        : "") +
      (mag.can_operate ? `<p class="form-help">O registro guarda quem fez e a hora. Ele não vira zero do curso nem inicia a contagem do curso restante.</p>` : "") +
      maintenanceLine +
      `<p id="magMessage" class="form-message" role="status"></p>`;
  } else if (mode === "readonly") {
    box.innerHTML = `<h3>Engaxetamento</h3>${current || '<p class="form-help">Nenhum engaxetamento registrado neste vínculo.</p>'}<p class="form-help">Sua conta consulta este sensor, sem permissão para registrar engaxetamento.</p>` + gaps;
  } else {
    // Um toque: o curso vem do cadastro (estimado). Quem tem a medida real pode informá-la.
    const typical = setup.suggested_course_mm;
    const draft = setup.status !== "validated";
    const manual = !!sending?.manual || typical == null;
    const typed = sending?.course == null ? "" : fmtMmInput(sending.course);
    box.innerHTML =
      `<h3>Engaxetamento realizado</h3>` +
      (pending?.expired ? `<p class="form-message is-error">A solicitação anterior venceu sem uma leitura válida. Confira o sensor e repita.</p>` : "") +
      (draft ? `<p class="form-message">Montagem ainda em caracterização: o resultado sai como provisório e só a engenharia registra.</p>` : "") +
      `<form id="magForm" novalidate>` +
      (typical != null
        ? `<p class="mag-course" id="magCourseLine"><span>Curso disponível</span><strong>${esc(fmtMm(typical, 2))}</strong><small>valor típico do cadastro · ${esc(COURSE_SOURCE_TEXT[setup.course_source] || "do cadastro")} · entra como <b>estimado</b></small></p>` +
          `<label class="mag-estimate"><input id="magManual" type="checkbox"${manual ? " checked" : ""}> Tenho a medida real deste engaxetamento</label>`
        : `<p class="form-message">Curso disponível típico não cadastrado para este spot. Informe a medida real, ou peça o cadastro em Ativos.</p>`) +
      `<label id="magCourseRow"${manual ? "" : " hidden"}>Curso medido agora até o limite de ajuste (mm)` +
      `<input id="magCourse" type="text" inputmode="decimal" pattern="[0-9]+([.,][0-9]{1,3})?" maxlength="9" autocomplete="off" value="${esc(typed)}" aria-describedby="magCourseHelp"></label>` +
      `<p id="magCourseHelp" class="form-help">Faixa desta montagem: ${esc(fmtNum(setup.min_course_mm))} a ${esc(fmtNum(setup.max_course_mm))} mm. A medida real substitui a estimativa só neste engaxetamento.</p>` +
      `<p id="magMessage" class="form-message${sending?.error ? " is-error" : ""}" role="status">${esc(sending?.error || (sampleBad ? MAG_REASON[view.reason]?.note || "" : ""))}</p>` +
      `<div class="drawer-actions"><button class="primary" type="submit" id="magSubmit">${sending?.error ? "Tentar de novo" : "Engaxetamento realizado"}</button>${setupButton}</div></form>` +
      current +
      `<p class="form-help">Toque uma vez, com a haste parada. A primeira leitura nova, válida e estável vira a referência: avanço zero e 100 % de curso restante, seja qual for o ângulo.</p>` +
      maintenanceLine;
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
  const manual = $id("magManual");
  if (manual)
    manual.onchange = () => {
      $id("magCourseRow").hidden = !manual.checked;
      if (manual.checked) $id("magCourse").focus();
    };
  if ($id("magSetupOpen")) $id("magSetupOpen").onclick = () => openMagSetup(sensorId).catch((error) => showMessage(errorText(error), "error"));
  if ($id("magNote"))
    $id("magNote").onclick = (event) =>
      withBusy(event.currentTarget, async () => {
        const device = findDevice(sensorId);
        if (!(await askConfirm({ title: "Registrar engaxetamento sem referência", danger: false, okLabel: "Registrar",
          html: `<p>Registra que o engaxetamento de <b>${esc(deviceIdentity(device).title)}</b> foi feito agora, por você.</p><p>Este registro <b>não</b> é a referência do curso: o cálculo do curso de ajuste restante continua indisponível até a montagem ser configurada e validada.</p>` }))) return;
        const request = state.magRequests.get("note:" + sensorId) || { id: newRequestId() };
        state.magRequests.set("note:" + sensorId, request);
        try {
          await callRpc("gaxeta_mag_record_maintenance", { p_sensor_id: sensorId, p_request_id: request.id, p_note: null });
          state.magRequests.delete("note:" + sensorId);
          showMessage("Engaxetamento registrado, sem referência de curso.", "success");
        } catch (error) {
          if (!isNetworkError(error)) state.magRequests.delete("note:" + sensorId);
          if ($id("magMessage")) $id("magMessage").textContent = isNetworkError(error) ? "Sem resposta do servidor. Toque de novo: o mesmo registro é reenviado, sem duplicar." : isMissingFeature(error) ? MAG15_MISSING_TEXT : errorText(error);
        }
        await loadMagSummary([sensorId]).catch(() => {});
        updateDrawerLive();
      });
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
  // Com a medida real marcada vale o que foi digitado (medido); senão, o valor típico (estimado).
  const useManual = !$id("magManual") || $id("magManual").checked;
  const estimated = !useManual;
  const raw = useManual ? String($id("magCourse").value).replace(",", ".").trim() : String(setup?.suggested_course_mm ?? "");
  const course = Number(raw);
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
  request.manual = useManual;
  state.magRequests.set(sensorId, request);
  message.classList.remove("is-error");
  message.textContent = "Registrando…";
  await withBusy(button, async () => {
    try {
      await callRpc("gaxeta_mag_request_service", { p_sensor_id: sensorId, p_request_id: request.id, p_course_mm: course, p_course_origin: origin });
      state.magRequests.delete(sensorId);
      showMessage(`Engaxetamento registrado com ${fmtMm(course, 2)} ${estimated ? "estimados" : "medidos"}. Aguardando a próxima leitura: mantenha a haste parada.`, "success");
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
