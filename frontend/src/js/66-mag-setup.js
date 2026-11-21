// =============================================================================
// Configurar montagem do sensor magnético: curso disponível típico (TAG e exceção por spot) e
// revisão da montagem (geometria ensaiada). Usa o cadastro que já existe no servidor
// (gaxeta_mag_*); nenhuma tabela paralela.
//   * Curso típico: quem edita o TAG ou o spot. É estimativa: o engaxetamento que o usa sai como
//     "curso estimado". O cadastro do curso não depende de a mecânica estar validada.
//   * Revisão da montagem: engenharia (ADM nível 1 ou 2), a partir de ensaio com paquímetro.
//   * O servidor decide a permissão; a tela só mostra o que cada conta pode fazer e o que falta.
// Chega-se aqui por Sensores → Detalhes → Configurar montagem, pelo botão Configurar do cartão,
// por Ativos → spot → Montagem do sensor, e pelos campos do formulário Editar do TAG e do spot.
// =============================================================================
const magSetup = { pointId: null, sensorId: null, point: null, tag: null, geoms: [], validating: null, message: "", error: false };
const GEOM_STATUS_TEXT = { draft: "em caracterização", validated: "validada", retired: "retirada" };
// Curso típico digitado: número positivo até 1000 mm, com até duas casas. Vazio = sem valor.
function readCourseField(text, label) {
  const value = parseMm(text);
  if (value === null) return null;
  if (Number.isNaN(value) || value <= 0 || value > 1000) throw Error(`${label}: informe um número maior que zero, até 1000 mm (vírgula ou ponto).`);
  if (Math.abs(Math.round(value * 100) - value * 100) > 1e-6) throw Error(`${label}: use até duas casas decimais.`);
  return value;
}
const geomText = (geom) =>
  !geom
    ? "nenhuma"
    : `${geom.label} (${geom.key} r${geom.revision}) · ${geom.model_kind === "linear" ? `reta de ${fmtNum(geom.mm_per_deg, 4)} mm por grau` : `curva de ${geom.curve?.length || 0} pontos`} · aperto ${Number(geom.direction) > 0 ? "aumenta" : "diminui"} o ângulo · arco de ${fmtNum(geom.unique_arc_deg, 0)}° · ${GEOM_STATUS_TEXT[geom.status] || geom.status}`;

function magSetupDialog() {
  let dialog = $id("magSetupDialog");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.id = "magSetupDialog";
  dialog.className = "wide-dialog";
  dialog.innerHTML =
    `<div class="dialog-heading"><h2>Configurar montagem</h2><button type="button" id="magSetupClose" class="icon-button" aria-label="Fechar">×</button></div>` +
    `<div id="magSetupBody" class="setup-body"></div>`;
  document.body.appendChild(dialog);
  dialog.querySelector("#magSetupClose").onclick = () => dialog.close();
  return dialog;
}
async function openMagSetup(sensorId) {
  const device = findDevice(sensorId);
  if (!device?.measurement_point_id) return showMessage("Vincule o sensor a um spot antes de configurar a montagem.", "error");
  return openMagSetupForPoint(device.measurement_point_id, sensorId);
}
async function openMagSetupForPoint(pointId, sensorId = null) {
  Object.assign(magSetup, { pointId, sensorId, point: null, tag: null, geoms: [], validating: null, message: "", error: false });
  const dialog = magSetupDialog();
  $id("magSetupBody").innerHTML = `<p class="form-help">Carregando o cadastro…</p>`;
  if (!dialog.open) dialog.showModal();
  await loadMagSetup();
}
async function loadMagSetup() {
  try {
    magSetup.point = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: magSetup.pointId });
    const tagId = magSetup.point.tag?.asset_id;
    [magSetup.tag, magSetup.geoms] = await Promise.all([
      tagId ? callRpc("gaxeta_mag_asset_setup", { p_asset_id: tagId }).catch(() => null) : null,
      callRpc("gaxeta_mag_geometries").catch(() => []),
    ]);
    await ensureAssets([magSetup.pointId]);
  } catch (error) {
    $id("magSetupBody").innerHTML = `<p class="form-message is-error">${esc(isMissingFeature(error) ? "Esta tela depende da atualização do banco desta revisão (migração 15), que ainda não foi aplicada." : errorText(error))}</p>`;
    return;
  }
  renderMagSetup();
}
// Depois de gravar: relê o cadastro e o estado do sensor, e atualiza o que estiver aberto.
async function afterMagSetupChange(text) {
  magSetup.message = text;
  magSetup.error = false;
  magAssetInfoCache.clear();
  await loadMagSetup();
  if (magSetup.sensorId) {
    await loadMagSummary([magSetup.sensorId]).catch(() => {});
    if ($id("magService")) $id("magService").dataset.signature = "";
    updateDrawerLive();
  }
  if (state.page === "sensors") renderSensorGrid();
  else if (state.page === "assets") await renderInspector().catch(() => {});
}
function renderMagSetup() {
  const { point, tag, geoms } = magSetup;
  const eff = point.effective || {};
  const usable = geoms.filter((geom) => geom.status !== "retired");
  const tagName = point.tag?.tag || "TAG";
  const own = point.own?.suggested_course_mm;
  const ownGeom = point.own?.geometry_id || "";
  const validating = magSetup.validating ? geoms.find((geom) => String(geom.id) === String(magSetup.validating)) : null;
  $id("magSetupBody").innerHTML =
    `<p class="form-context">${esc(assetPathLabel(magSetup.pointId) || "Spot")}</p>` +
    (magSetup.message ? `<p class="form-message${magSetup.error ? " is-error" : " is-success"}" role="status">${esc(magSetup.message)}</p>` : "") +
    // 1. Curso disponível típico
    `<section class="setup-block"><h3>1. Curso disponível típico (mm)</h3>` +
    `<p class="form-help">Quanto o preme-gaxeta costuma poder avançar logo depois de um engaxetamento novo, até o limite de ajuste. É uma estimativa do equipamento: vira o valor proposto no botão <b>Engaxetamento realizado</b> e o resultado aparece como <b>curso estimado</b>. Quem tiver a medida real informa na hora do engaxetamento.</p>` +
    `<p class="setup-current">Em uso neste spot: <b>${eff.suggested_course_mm != null ? esc(fmtMm(eff.suggested_course_mm, 2)) : "não cadastrado"}</b>${eff.course_source ? " · " + esc(COURSE_SOURCE_TEXT[eff.course_source]) : ""}</p>` +
    (tag?.can_edit_course
      ? `<form id="setupTagForm" class="setup-row" novalidate><label>No TAG ${esc(tagName)} (vale para os spots sem valor próprio)<input id="setupTagCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 20 ou 2,5" value="${esc(fmtMmInput(tag.suggested_course_mm))}"></label>` +
        `<label>Porte (opcional)<select id="setupTagSize"><option value="">Não informado</option>${Object.entries(SIZE_CLASS_LABEL).map(([value, text]) => `<option value="${value}"${tag.size_class === value ? " selected" : ""}>${text}</option>`).join("")}</select></label>` +
        `<button class="secondary" type="submit">Salvar no TAG</button></form>`
      : `<p class="form-help">No TAG ${esc(tagName)}: ${point.tag?.suggested_course_mm != null ? esc(fmtMm(point.tag.suggested_course_mm, 2)) : "não cadastrado"}. Quem cadastra: quem edita o TAG em Ativos (ADM nível 1 ou 2, ou usuário da corporação com permissão de edição neste ramo).</p>`) +
    (point.can_edit_course
      ? `<form id="setupSpotForm" class="setup-row" novalidate><fieldset><legend>Neste spot</legend>` +
        `<label class="check"><input type="radio" name="setupSpotMode" value="inherit"${own == null ? " checked" : ""}> Herdar do TAG${point.tag?.suggested_course_mm != null ? " (" + esc(fmtMm(point.tag.suggested_course_mm, 2)) + ")" : " (TAG sem valor cadastrado)"}</label>` +
        `<label class="check"><input type="radio" name="setupSpotMode" value="own"${own != null ? " checked" : ""}> Valor específico deste spot</label>` +
        `<label>Curso deste spot (mm)<input id="setupSpotCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" value="${esc(fmtMmInput(own))}"${own == null ? " disabled" : ""}></label></fieldset>` +
        `<button class="secondary" type="submit">Salvar no spot</button></form>`
      : `<p class="form-help">Sua conta não edita o curso deste spot.</p>`) +
    `</section>` +
    // 2. Revisão da montagem
    `<section class="setup-block"><h3>2. Revisão da montagem (ensaio)</h3>` +
    `<p class="form-help">A revisão diz quantos milímetros o preme-gaxeta avança por grau de giro do eixo do sensor, em que sentido e em que arco isso foi comprovado. Vem de um ensaio com paquímetro: a medida do espaço na bomba, sozinha, não diz quantos milímetros valem um grau. Suportes da mesma família, intercambiáveis, podem usar a mesma revisão já comprovada.</p>` +
    `<p class="setup-current">Em uso neste spot: <b>${esc(geomText(eff.geometry))}</b>${eff.geometry_source ? " · " + (eff.geometry_source === "point" ? "vinculada a este spot" : "sugerida no TAG") : ""}</p>` +
    (eff.geometry && eff.geometry.status !== "validated" ? `<p class="bench-warn">Esta revisão ainda não foi validada: o curso de ajuste restante só aparece para a engenharia, como provisório.</p>` : "") +
    (!eff.geometry ? `<p class="bench-warn">Sem revisão vinculada, o curso de ajuste restante fica indisponível, com o motivo à vista. O curso típico acima pode ser cadastrado antes: uma coisa não depende da outra.</p>` : "") +
    (point.can_edit_geometry
      ? `<form id="setupGeomForm" class="setup-row" novalidate><label>Revisão vinculada a este spot<select id="setupGeom"><option value="">Nenhuma própria (usar a sugerida no TAG, se houver)</option>` +
        usable.map((geom) => `<option value="${esc(geom.id)}"${String(geom.id) === String(ownGeom) ? " selected" : ""}>${esc(geom.key)} r${geom.revision} · ${esc(geom.label)} · ${esc(GEOM_STATUS_TEXT[geom.status])}</option>`).join("") +
        `</select></label>` +
        `<label>Ângulo bruto no datum mecânico (só para curva)<input id="setupDatum" type="text" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0 a 4095" value="${esc(point.own?.datum_raw ?? "")}"></label>` +
        (point.active_reference ? `<p class="bench-warn">Há um engaxetamento em andamento neste spot. Trocar a revisão <b>encerra essa referência</b>: será preciso registrar o engaxetamento de novo.</p>` : "") +
        `<button class="secondary" type="submit">Vincular ao spot</button></form>`
      : `<p class="form-help">Quem vincula e valida a revisão: a engenharia (ADM nível 1 ou 2).</p>`) +
    `</section>` +
    // 3. Engenharia: revisões e ensaio
    (point.can_edit_geometry
      ? `<section class="setup-block"><h3>3. Revisões cadastradas (engenharia)</h3>` +
        (geoms.length
          ? `<ul class="setup-geoms">${geoms
              .map(
                (geom) =>
                  `<li><span>${esc(geomText(geom))} · curso de ${esc(fmtNum(geom.min_course_mm))} a ${esc(fmtNum(geom.max_course_mm))} mm` +
                  (geom.status === "validated" && geom.evidence?.max_error_pp != null ? ` · erro máximo ${esc(fmtNum(geom.evidence.max_error_pp, 2))} p.p., folga ${esc(fmtNum(geom.evidence.backlash_mm, 2))} mm` : "") +
                  `</span><span class="row-actions">` +
                  (geom.status === "draft" ? `<button class="secondary compact" type="button" data-geom-validate="${esc(geom.id)}">Validar…</button>` : "") +
                  (geom.status !== "retired" ? `<button class="text-button danger-text" type="button" data-geom-retire="${esc(geom.id)}">Retirar</button>` : "") +
                  `</span></li>`,
              )
              .join("")}</ul>`
          : `<p class="form-help">Nenhuma revisão cadastrada ainda.</p>`) +
        (validating
          ? `<form id="setupValidateForm" class="setup-row setup-validate" novalidate><h4>Validar ${esc(validating.key)} r${validating.revision}</h4>` +
            `<p class="form-help">Só valide com o ensaio aprovado em posições independentes das usadas para ajustar a reta ou a curva. A folga que depende do sentido entra no erro.</p>` +
            `<label>Erro máximo no curso (mm)<input id="valErrMm" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label>Erro máximo (pontos percentuais do curso)<input id="valErrPp" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label>Folga na reversão (mm)<input id="valBacklash" type="text" inputmode="decimal" maxlength="8" autocomplete="off"></label>` +
            `<label class="span-all">Relatório do ensaio (onde está e o que mediu)<textarea id="valReport" rows="2" maxlength="600"></textarea></label>` +
            `<div class="row-actions"><button class="primary" type="submit">Validar revisão</button><button class="secondary" type="button" id="valCancel">Cancelar</button></div></form>`
          : "") +
        `<details class="technical-detail" id="setupNewGeom"><summary>Nova revisão a partir de um ensaio</summary>` +
        `<form id="setupNewForm" class="setup-grid" novalidate>` +
        `<label>Família do suporte (identificador)<input id="ngKey" maxlength="40" autocomplete="off" placeholder="ex.: haste-cremalheira-20"></label>` +
        `<label>Descrição<input id="ngLabel" maxlength="80" autocomplete="off" placeholder="ex.: Cremalheira, pinhão 12,7 mm"></label>` +
        `<label>Modelo<select id="ngKind"><option value="linear">Reta: mm por grau constante</option><option value="table">Curva: tabela de pontos medidos</option></select></label>` +
        `<label>Ao apertar o preme-gaxeta, o ângulo do sensor<select id="ngDir"><option value="1">aumenta</option><option value="-1">diminui</option></select></label>` +
        `<label id="ngSlopeRow">Avanço por grau de giro (mm por grau)<input id="ngSlope" type="text" inputmode="decimal" maxlength="10" autocomplete="off" placeholder="ex.: 0,111"></label>` +
        `<label id="ngCurveRow" class="span-all" hidden>Pontos do ensaio, um por linha: graus desde o datum mecânico; mm<textarea id="ngCurve" rows="5" placeholder="0; 0&#10;45; 5,1&#10;90; 10,0"></textarea></label>` +
        `<label id="ngDatumRow" hidden>Ângulo bruto no datum mecânico (0 a 4095, se o porta-ímã for indexado)<input id="ngDatum" type="text" inputmode="numeric" maxlength="4" autocomplete="off"></label>` +
        `<label>Arco útil comprovado no ensaio (graus)<input id="ngArc" type="text" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="ex.: 240"></label>` +
        `<label>Recuo tolerado atrás da referência (graus)<input id="ngBack" type="text" inputmode="decimal" maxlength="5" autocomplete="off" value="15"></label>` +
        `<label>Tolerância aceita além dos extremos (mm)<input id="ngTol" type="text" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="ex.: 0,5"></label>` +
        `<label>Menor curso atendido (mm)<input id="ngMin" type="text" inputmode="decimal" maxlength="7" autocomplete="off"></label>` +
        `<label>Maior curso atendido (mm)<input id="ngMax" type="text" inputmode="decimal" maxlength="7" autocomplete="off"></label>` +
        `<p class="form-help span-all">A revisão nasce como rascunho (em caracterização). O arco útil tem de ser menor que uma volta e conter o maior curso: fora dele a plataforma suspende o cálculo em vez de extrapolar. Depois de trocar a haste ou o suporte, cadastre uma revisão nova: a curva anterior não vale para a peça nova.</p>` +
        `<div class="row-actions span-all"><button class="primary" type="submit">Salvar como rascunho</button></div></form></details></section>`
      : "");
  bindMagSetup();
}
function bindMagSetup() {
  const fail = (error) => {
    magSetup.message = errorText(error);
    magSetup.error = true;
    renderMagSetup();
  };
  const num = (id, label, { required = true } = {}) => {
    const value = parseMm($id(id).value);
    if (value === null && !required) return null;
    if (value === null || Number.isNaN(value)) throw Error(`${label}: informe um número (vírgula ou ponto).`);
    return value;
  };
  if ($id("setupTagForm"))
    $id("setupTagForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const course = readCourseField($id("setupTagCourse").value, "Curso do TAG");
          await callRpc("gaxeta_mag_set_equipment_defaults", {
            p_asset_id: magSetup.point.tag.asset_id, p_size_class: $id("setupTagSize").value || null, p_suggested_course_mm: course,
            // Preserva a revisão sugerida no TAG (para a engenharia o servidor grava o que vier aqui).
            p_geometry_id: magSetup.tag?.can_edit_geometry ? (magSetup.tag?.geometry?.id ?? null) : null,
          });
          await afterMagSetupChange(course == null ? "Curso típico removido do TAG." : `Curso típico de ${fmtMm(course, 2)} gravado no TAG. Os ciclos já registrados não mudam.`);
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("setupSpotForm")) {
    for (const radio of document.querySelectorAll('input[name="setupSpotMode"]'))
      radio.onchange = () => {
        $id("setupSpotCourse").disabled = radio.value !== "own" || !radio.checked;
        if (radio.value === "own" && radio.checked) $id("setupSpotCourse").focus();
      };
    $id("setupSpotForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const ownMode = document.querySelector('input[name="setupSpotMode"]:checked')?.value === "own";
          const course = ownMode ? readCourseField($id("setupSpotCourse").value, "Curso do spot") : null;
          if (ownMode && course == null) throw Error("Informe o curso deste spot, ou escolha Herdar do TAG.");
          await callRpc("gaxeta_mag_set_point_course", { p_point_id: magSetup.pointId, p_course_mm: course });
          await afterMagSetupChange(course == null ? "Este spot voltou a herdar o curso do TAG." : `Curso de ${fmtMm(course, 2)} gravado só para este spot.`);
        } catch (error) {
          fail(error);
        }
      });
    };
  }
  if ($id("setupGeomForm"))
    $id("setupGeomForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const datumText = $id("setupDatum").value.trim();
          if (datumText && !/^\d{1,4}$/.test(datumText)) throw Error("Datum mecânico: ângulo bruto inteiro, de 0 a 4095.");
          await callRpc("gaxeta_mag_set_point_geometry", { p_point_id: magSetup.pointId, p_geometry_id: $id("setupGeom").value ? Number($id("setupGeom").value) : null, p_datum_raw: datumText ? Number(datumText) : null, p_note: null });
          await afterMagSetupChange($id("setupGeom").value ? "Revisão vinculada a este spot." : "Este spot voltou a usar a revisão sugerida no TAG, se houver.");
        } catch (error) {
          fail(error);
        }
      });
    };
  for (const button of document.querySelectorAll("[data-geom-validate]"))
    button.onclick = () => {
      magSetup.validating = button.dataset.geomValidate;
      magSetup.message = "";
      renderMagSetup();
      $id("valErrMm")?.focus();
    };
  for (const button of document.querySelectorAll("[data-geom-retire]"))
    button.onclick = async () => {
      if (!(await askConfirm({ title: "Retirar revisão", okLabel: "Retirar", html: `<p>A revisão deixa de poder ser vinculada. Os engaxetamentos já registrados com ela continuam no histórico.</p>` }))) return;
      await withBusy(button, async () => {
        try {
          await callRpc("gaxeta_mag_set_geometry_status", { p_geometry_id: Number(button.dataset.geomRetire), p_status: "retired", p_evidence: null });
          await afterMagSetupChange("Revisão retirada.");
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("valCancel"))
    $id("valCancel").onclick = () => {
      magSetup.validating = null;
      renderMagSetup();
    };
  if ($id("setupValidateForm"))
    $id("setupValidateForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const report = $id("valReport").value.trim();
          if (!report) throw Error("Informe onde está o relatório do ensaio e o que ele mediu.");
          const evidence = { max_error_mm: num("valErrMm", "Erro máximo (mm)"), max_error_pp: num("valErrPp", "Erro máximo (p.p.)"), backlash_mm: num("valBacklash", "Folga na reversão (mm)"), report };
          await callRpc("gaxeta_mag_set_geometry_status", { p_geometry_id: Number(magSetup.validating), p_status: "validated", p_evidence: evidence });
          magSetup.validating = null;
          await afterMagSetupChange("Revisão validada com a evidência do ensaio.");
        } catch (error) {
          fail(error);
        }
      });
    };
  if ($id("ngKind"))
    $id("ngKind").onchange = () => {
      const table = $id("ngKind").value === "table";
      $id("ngSlopeRow").hidden = table;
      $id("ngCurveRow").hidden = !table;
      $id("ngDatumRow").hidden = !table;
    };
  if ($id("setupNewForm"))
    $id("setupNewForm").onsubmit = (event) => {
      event.preventDefault();
      withBusy(event.submitter, async () => {
        try {
          const key = $id("ngKey").value.trim().toLowerCase();
          if (!/^[a-z][a-z0-9_-]{1,39}$/.test(key)) throw Error("Família do suporte: comece por letra e use só letras minúsculas, números, hífen ou sublinhado (2 a 40 caracteres).");
          const label = $id("ngLabel").value.trim();
          if (!label) throw Error("Informe a descrição da revisão.");
          const table = $id("ngKind").value === "table";
          const geometry = {
            key, label, model_kind: table ? "table" : "linear", direction: Number($id("ngDir").value),
            unique_arc_deg: num("ngArc", "Arco útil"), back_margin_deg: num("ngBack", "Recuo tolerado"), tolerance_mm: num("ngTol", "Tolerância"),
            min_course_mm: num("ngMin", "Menor curso"), max_course_mm: num("ngMax", "Maior curso"),
          };
          if (table) {
            const points = $id("ngCurve").value.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split(/[;\t]/).map((cell) => parseMm(cell)));
            if (points.length < 2 || points.some((pair) => pair.length !== 2 || pair.some((cell) => cell === null || Number.isNaN(cell))))
              throw Error("Pontos do ensaio: uma linha por ponto, no formato graus; mm (pelo menos dois pontos).");
            geometry.curve = points;
            const datum = $id("ngDatum").value.trim();
            if (datum && !/^\d{1,4}$/.test(datum)) throw Error("Datum mecânico: ângulo bruto inteiro, de 0 a 4095.");
            if (datum) geometry.datum_raw = Number(datum);
          } else geometry.mm_per_deg = num("ngSlope", "Avanço por grau");
          const saved = await callRpc("gaxeta_mag_save_geometry", { p_geometry: geometry });
          await afterMagSetupChange(`Revisão ${saved.key} r${saved.revision} gravada como rascunho. Vincule-a ao spot e valide depois do ensaio.`);
        } catch (error) {
          fail(error);
        }
      });
    };
}

// ----- Ativos: campos no formulário Editar do TAG e do spot, e a linha da ficha -----
const magAssetInfoCache = new Map(); // ativo → resposta de gaxeta_mag_asset_setup (ou null se indisponível)
async function magAssetInfo(assetId) {
  if (!assetId) return null;
  if (magAssetInfoCache.has(assetId)) return magAssetInfoCache.get(assetId);
  let info = null;
  try {
    info = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: assetId });
  } catch (error) {
    info = null;
  }
  magAssetInfoCache.set(assetId, info);
  return info;
}
// Linha da ficha do spot e do TAG: o valor e de onde ele veio.
function magAssetSummaryText(info) {
  if (!info) return null;
  if (info.kind === "equipment") return info.suggested_course_mm != null ? `${fmtMm(info.suggested_course_mm, 2)}${info.size_class ? " · porte " + SIZE_CLASS_LABEL[info.size_class].toLowerCase() : ""} · estimativa` : "Não cadastrado";
  const eff = info.effective || {};
  return eff.suggested_course_mm != null ? `${fmtMm(eff.suggested_course_mm, 2)} · ${COURSE_SOURCE_TEXT[eff.course_source] || ""} · estimativa` : "Não cadastrado";
}
const magAssetForm = { info: null, parentInfo: null, available: true };
function magAssetFormBox() {
  let box = $id("magAssetBox");
  if (box) return box;
  box = document.createElement("div");
  box.id = "magAssetBox";
  $id("assetFormMessage").before(box);
  return box;
}
// Prepara os campos ao abrir o formulário (edição ou criação).
async function magAssetFormPrepare(editing, parent) {
  const box = magAssetFormBox();
  Object.assign(magAssetForm, { info: null, parentInfo: null, available: true });
  if (state.magMissing) magAssetForm.available = false;
  else
    try {
      if (editing && ["equipment", "point"].includes(editing.kind)) magAssetForm.info = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: editing.id });
      const tagId = editing?.kind === "point" ? editing.parent_id : !editing && parent?.kind === "equipment" ? parent.id : null;
      if (tagId) magAssetForm.parentInfo = await callRpc("gaxeta_mag_asset_setup", { p_asset_id: tagId }).catch(() => null);
    } catch (error) {
      // Banco sem a migração 15 (ou ativo fora do escopo): o formulário segue sem estes campos.
      magAssetForm.available = false;
    }
  const info = magAssetForm.info;
  const tagCourse = info?.kind === "point" ? info.tag?.suggested_course_mm : magAssetForm.parentInfo?.suggested_course_mm;
  const own = info?.kind === "point" ? info.own?.suggested_course_mm : null;
  const canCourse = info ? info.can_edit_course : true;
  box.innerHTML =
    `<fieldset class="equip-group mag-asset" id="magAssetEquip" hidden><legend>Sensor magnético: curso do preme-gaxeta</legend>` +
    `<label>Curso disponível típico (mm)<input id="magTagCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 20 ou 2,5" value="${esc(info?.kind === "equipment" ? fmtMmInput(info.suggested_course_mm) : "")}"${canCourse ? "" : " disabled"}></label>` +
    `<label>Porte (opcional)<select id="magTagSize"${canCourse ? "" : " disabled"}><option value="">Não informado</option>${Object.entries(SIZE_CLASS_LABEL).map(([value, text]) => `<option value="${value}"${info?.kind === "equipment" && info.size_class === value ? " selected" : ""}>${text}</option>`).join("")}</select></label>` +
    `<p class="form-help span-all">Quanto o preme-gaxeta costuma poder avançar depois de um engaxetamento novo. Vale para todos os spots deste TAG sem valor próprio e entra como <b>curso estimado</b>. Em branco = não cadastrado. Mudar este valor não altera os ciclos já registrados.</p></fieldset>` +
    `<fieldset class="equip-group mag-asset" id="magAssetPoint" hidden><legend>Sensor magnético: curso do preme-gaxeta</legend>` +
    `<label class="check span-all"><input type="radio" name="magSpotMode" value="inherit"${own == null ? " checked" : ""}${canCourse ? "" : " disabled"}> Herdar do TAG${tagCourse != null ? " (" + esc(fmtMm(tagCourse, 2)) + ")" : " (TAG sem valor cadastrado)"}</label>` +
    `<label class="check span-all"><input type="radio" name="magSpotMode" value="own"${own != null ? " checked" : ""}${canCourse ? "" : " disabled"}> Valor específico deste spot</label>` +
    `<label>Curso deste spot (mm)<input id="magSpotCourse" type="text" inputmode="decimal" maxlength="8" autocomplete="off" placeholder="Ex.: 15" value="${esc(fmtMmInput(own))}"${own == null || !canCourse ? " disabled" : ""}></label>` +
    (info?.kind === "point"
      ? `<p class="form-help span-all">Em uso: <b>${esc(magAssetSummaryText(info))}</b>. Revisão da montagem: ${esc(geomText(info.effective?.geometry))}.</p>` +
        `<p class="span-all"><button class="secondary compact" type="button" id="magAssetSetup">${info.can_edit_geometry ? "Revisão da montagem e ensaio…" : "Ver a montagem deste spot…"}</button></p>`
      : `<p class="form-help span-all">A revisão da montagem (geometria ensaiada) é vinculada pela engenharia depois de o spot existir.</p>`) +
    `</fieldset>`;
  for (const radio of box.querySelectorAll('input[name="magSpotMode"]'))
    radio.onchange = () => {
      $id("magSpotCourse").disabled = radio.value !== "own" || !radio.checked;
      if (radio.value === "own" && radio.checked) $id("magSpotCourse").focus();
    };
  if ($id("magAssetSetup"))
    $id("magAssetSetup").onclick = () => {
      const pointId = magAssetForm.info.asset_id;
      $id("assetDialog").close();
      openMagSetupForPoint(pointId).catch((error) => showMessage(errorText(error), "error"));
    };
}
function magAssetFormSync(kind) {
  if (!$id("magAssetBox")) return;
  $id("magAssetEquip").hidden = !(magAssetForm.available && kind === "equipment");
  $id("magAssetPoint").hidden = !(magAssetForm.available && kind === "point");
}
// Lê e valida o que foi digitado, antes de gravar o ativo. Devolve null quando não há o que gravar.
function magAssetFormRead(kind) {
  if (!magAssetForm.available || !$id("magAssetBox")) return null;
  const info = magAssetForm.info;
  if (kind === "equipment") {
    if (info && !info.can_edit_course) return null;
    const course = readCourseField($id("magTagCourse").value, "Curso disponível típico");
    const size = $id("magTagSize").value || null;
    const changed = !info ? course != null || size != null : Number(info.suggested_course_mm ?? NaN) !== Number(course ?? NaN) || (info.size_class || null) !== size;
    return changed ? { kind, course, size, geometryId: info?.can_edit_geometry ? (info?.geometry?.id ?? null) : null } : null;
  }
  if (kind === "point") {
    if (info && !info.can_edit_course) return null;
    const ownMode = document.querySelector('input[name="magSpotMode"]:checked')?.value === "own";
    const course = ownMode ? readCourseField($id("magSpotCourse").value, "Curso deste spot") : null;
    if (ownMode && course == null) throw Error("Informe o curso deste spot, ou escolha Herdar do TAG.");
    const before = info?.own?.suggested_course_mm ?? null;
    return Number(before ?? NaN) !== Number(course ?? NaN) && !(before == null && course == null) ? { kind, course } : null;
  }
  return null;
}
async function magAssetFormApply(saved, wanted) {
  if (!wanted) return;
  if (wanted.kind === "equipment")
    await callRpc("gaxeta_mag_set_equipment_defaults", { p_asset_id: saved.id, p_size_class: wanted.size, p_suggested_course_mm: wanted.course, p_geometry_id: wanted.geometryId });
  else await callRpc("gaxeta_mag_set_point_course", { p_point_id: saved.id, p_course_mm: wanted.course });
  magAssetInfoCache.clear();
}
