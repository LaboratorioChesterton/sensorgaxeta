// =============================================================================
// Usuários (ADM 1 e 2): listagem paginada, cadastro em três etapas com escopo por
// ramo, ajustes de acesso, nível e status, convites e auditoria. Toda decisão é
// do servidor (RPCs gaxeta_admin_*); a interface só organiza o fluxo.
// =============================================================================
const usersView = { search: "", role: "", status: "", corp: "", offset: 0, total: 0, items: [], request: 0 };
const USERS_PAGE = 25;
const STATUS_LABEL = {
  active: "Ativo",
  disabled: "Desativado",
  invite_pending: "Convite pendente (não enviado)",
  invite_sent: "Convite enviado",
  invite_failed: "Falha no envio",
  invite_expired: "Convite expirado",
};
async function loadUsers() {
  const run = ++usersView.request;
  if ($id("userCorpFilter").options.length < 2) {
    const roots = await loadKids(null);
    fillSelect($id("userCorpFilter"), roots.ids.map((id) => ({ value: id, label: assetName(id) })), "Todas as corporações", usersView.corp);
  }
  const result = await callRpc("gaxeta_admin_users", {
    p_search: usersView.search || null,
    p_role: usersView.role || null,
    p_status: usersView.status || null,
    p_corporation_id: usersView.corp || null,
    p_company_id: null,
    p_limit: USERS_PAGE,
    p_offset: usersView.offset,
  });
  if (run !== usersView.request) return;
  usersView.items = result.items;
  usersView.total = result.total;
  renderUsers();
  if ($id("auditPanel").open) loadAudit().catch(() => {});
}
function renderUsers() {
  const mine = myRole();
  $id("userRows").innerHTML =
    usersView.items
      .map((item) => {
        const isInvite = item.kind === "invite";
        const isGlobal = item.role !== "corp";
        const allowed = mine === "adm1" || !isGlobal; // ADM 2 não altera contas com papel global
        const self = item.id === state.userId;
        const actions = [];
        if (allowed && isInvite) actions.push(`<button data-user-act="resend">Reenviar convite</button>`, `<button data-user-act="revoke">Revogar convite</button>`);
        if (allowed && !isInvite) {
          if (!isGlobal) actions.push(`<button data-user-act="access">Editar acesso</button>`);
          if (mine === "adm1" && !self) actions.push(`<button data-user-act="role">Alterar nível</button>`);
          if (!self) actions.push(`<button data-user-act="${item.status === "active" ? "disable" : "enable"}">${item.status === "active" ? "Desativar" : "Reativar"}</button>`);
          if (mine === "adm1" && !self) actions.push(`<button data-user-act="delete" class="danger-text">Excluir cadastro</button>`);
        }
        return (
          `<tr data-user="${esc(item.id)}" data-kind="${item.kind}"><td data-label="Nome"><strong>${esc(item.display_name || "—")}</strong></td><td data-label="E-mail">${esc(item.email)}</td>` +
          `<td data-label="Nível">${ROLE_LABEL[item.role] || esc(item.role)}${item.role === "corp" && item.can_write ? " · edita" : ""}</td>` +
          `<td data-label="Corporação">${esc(item.corporation_name || (isGlobal ? "Todas" : "—"))}</td>` +
          `<td data-label="Status"><span class="state-chip status-${item.status}">${STATUS_LABEL[item.status] || esc(item.status)}</span>${item.last_error ? `<small class="cell-note">${esc(item.last_error)}</small>` : ""}</td>` +
          `<td class="col-actions">${actions.length ? `<details class="row-menu"><summary>Ações</summary><div class="menu-list">${actions.join("")}</div></details>` : self ? "<small>sua conta</small>" : ""}</td></tr>`
        );
      })
      .join("") || `<tr><td colspan="6">Nenhum usuário encontrado com estes filtros.</td></tr>`;
  const first = usersView.total ? usersView.offset + 1 : 0;
  const last = Math.min(usersView.offset + USERS_PAGE, usersView.total);
  $id("userPager").innerHTML =
    `<span>${first}–${last} de ${usersView.total}</span>` +
    (usersView.total > USERS_PAGE
      ? `<button class="secondary compact" data-user-move="-1"${usersView.offset ? "" : " disabled"}>Anterior</button><button class="secondary compact" data-user-move="1"${last < usersView.total ? "" : " disabled"}>Próxima</button>`
      : "");
}
const reloadUsers = () => loadUsers().catch((error) => showMessage(errorText(error), "error"));
$id("userSearch").oninput = debounce(() => {
  usersView.search = $id("userSearch").value.trim();
  usersView.offset = 0;
  reloadUsers();
}, 350);
for (const [id, key] of [["userRoleFilter", "role"], ["userStatusFilter", "status"], ["userCorpFilter", "corp"]])
  $id(id).onchange = () => {
    usersView[key] = $id(id).value;
    usersView.offset = 0;
    reloadUsers();
  };
$id("userPager").onclick = (event) => {
  const move = event.target.closest("[data-user-move]");
  if (!move) return;
  usersView.offset = Math.max(0, usersView.offset + Number(move.dataset.userMove) * USERS_PAGE);
  reloadUsers();
};

// ----- Envio do convite pelo serviço no servidor (a chave administrativa nunca vem ao navegador) -----
async function sendInvite(inviteId, email) {
  try {
    const { data } = await sb.auth.getSession();
    const response = await fetchWithTimeout(`${CONFIG.supabaseUrl}/functions/v1/${CONFIG.inviteFunction}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CONFIG.publishableKey, Authorization: `Bearer ${data.session?.access_token || ""}` },
      body: JSON.stringify({ invite_id: inviteId, email }),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body.ok) return { ok: true, message: body.message || "Convite enviado." };
    return { ok: false, message: body.message || (response.status === 404 ? "O serviço de envio (gaxeta-invite) não está implantado." : `Falha no envio (${response.status}).`) };
  } catch (error) {
    // Função ausente responde sem cabeçalhos CORS e chega aqui como falha de rede.
    return { ok: false, message: "O serviço de envio (gaxeta-invite) não respondeu. Confira se a função está implantada e a conexão." };
  }
}

// ----- Ações por usuário -----
$id("userRows").onclick = async (event) => {
  const button = event.target.closest("[data-user-act]");
  if (!button) return;
  const row = button.closest("tr");
  const item = usersView.items.find((entry) => entry.id === row.dataset.user && entry.kind === row.dataset.kind);
  if (!item) return;
  button.closest("details").open = false;
  const act = button.dataset.userAct;
  const who = `<b>${esc(item.display_name || item.email)}</b> (${esc(item.email)})`;
  await withBusy(button, async () => {
    if (act === "access") return openUserWizard({ userId: item.id });
    if (act === "resend") {
      await callRpc("gaxeta_admin_resend_invite", { p_invite_id: item.id });
      const sent = await sendInvite(item.id, item.email);
      showMessage(sent.ok ? `Convite reenviado para ${item.email}.` : `Convite mantido como pendente. ${sent.message}`, sent.ok ? "success" : "error");
    } else if (act === "revoke") {
      if (!(await askConfirm({ title: "Revogar convite", html: `<p>Revogar o convite de ${who}? O link recebido deixa de dar acesso.</p>`, okLabel: "Revogar" }))) return;
      await callRpc("gaxeta_admin_revoke_invite", { p_invite_id: item.id });
      showMessage("Convite revogado.", "success");
    } else if (act === "disable" || act === "enable") {
      const disabling = act === "disable";
      if (!(await askConfirm({ title: disabling ? "Desativar usuário" : "Reativar usuário", html: `<p>${disabling ? "Desativar" : "Reativar"} ${who}?${disabling ? " O acesso é cortado no servidor imediatamente, mesmo com sessão aberta." : ""}</p>`, okLabel: disabling ? "Desativar" : "Reativar", danger: disabling }))) return;
      await callRpc("gaxeta_admin_set_status", { p_user_id: item.id, p_status: disabling ? "disabled" : "active" });
      showMessage(disabling ? "Usuário desativado." : "Usuário reativado.", "success");
    } else if (act === "role") {
      const options = ["adm1", "adm2", "adm3"].map((role) => `<option value="${role}"${role === item.role ? " selected" : ""}>${ROLE_LABEL[role]}</option>`).join("");
      if (!(await askConfirm({ title: "Alterar nível", html: `<p>Nível global de ${who}:</p><label>Nível<select id="roleChoice">${options}</select></label><p class="form-help">Ao receber nível global, o usuário deixa o vínculo com a corporação e as concessões por ramo.</p>`, okLabel: "Aplicar", danger: false }))) return;
      await callRpc("gaxeta_admin_set_role", { p_user_id: item.id, p_global_role: $id("roleChoice").value });
      showMessage("Nível atualizado.", "success");
    } else if (act === "delete") {
      if (!(await askConfirm({ title: "Excluir cadastro", html: `<p>Excluir o cadastro de acesso de ${who}? As concessões são removidas e a ação fica na auditoria.</p>`, okLabel: "Excluir" }))) return;
      await callRpc("gaxeta_admin_delete_user", { p_user_id: item.id });
      showMessage("Cadastro de acesso excluído. A identidade de login permanece no Auth, sem acesso, até ser removida no painel do Supabase.", "success");
    }
    await loadUsers();
  });
};

// ----- Cadastro e edição de acesso em três etapas: dados → acesso → revisão -----
// O escopo é gravado como concessões por ramo: "all" (inclui o ramo e o que for criado
// nele), "none" (bloqueia) ou nenhuma regra (segue o nível acima). Vale a regra do
// ancestral mais próximo; sem regra nenhuma, o acesso é negado. A prévia e a lista
// normalizada vêm do servidor (gaxeta_admin_preview_access) e são a fonte de verdade
// da revisão e da gravação.
const wizard = {
  step: 1,
  userId: null,
  corp: "",
  mode: "", // "whole" | "select" | "none" | "" (ainda não escolhido)
  grants: new Map(),
  stash: null, // seleção por ramos guardada ao alternar para "Toda a corporação" ou "Sem acesso"
  names: new Map(),
  kids: new Map(),
  open: new Set(),
  totals: {},
  root: null, // item da corporação na prévia (estado e se tem empresas)
  run: 0,
  searchRun: 0,
  previewError: "",
  hint: "",
  flash: "",
};
const KIND_PLURAL = { company: "empresa(s)", area: "área(s)", subarea: "subárea(s)", equipment: "TAG(s)", point: "spot(s)" };
const SCOPE_LABEL = { whole: "Toda a corporação", select: "Ramos selecionados", none: "Sem acesso" };
// Qual das três escolhas corresponde a um conjunto de concessões.
function scopeOf(grants, corp) {
  const included = [...grants].filter(([, mode]) => mode === "all");
  if (!included.length) return "none";
  if (grants.size === 1 && grants.get(corp) === "all") return "whole";
  return "select";
}
async function openUserWizard({ userId = null } = {}) {
  Object.assign(wizard, { step: 1, userId, corp: "", mode: "", grants: new Map(), stash: null, names: new Map(), kids: new Map(), open: new Set(), totals: {}, root: null, previewError: "", hint: "", flash: "" });
  wizard.run++;
  const roots = await loadKids(null);
  const roles = [["corp", ROLE_LABEL.corp]];
  if (hasCap("manage_global_roles")) roles.push(["adm3", ROLE_LABEL.adm3], ["adm2", ROLE_LABEL.adm2], ["adm1", ROLE_LABEL.adm1]);
  fillSelect($id("newUserRole"), roles.map(([value, label]) => ({ value, label })), null, "corp");
  fillSelect($id("newUserCorp"), roots.ids.map((id) => ({ value: id, label: assetName(id) })), "Selecione a corporação", "");
  $id("userForm").reset();
  $id("newUserRole").value = "corp";
  $id("userFormMessage").textContent = "";
  if (userId) {
    const detail = await callRpc("gaxeta_admin_user_detail", { p_user_id: userId });
    $id("newUserName").value = detail.display_name;
    $id("newUserEmail").value = detail.email;
    $id("newUserCorp").value = detail.corporation_id || "";
    $id("newUserWrite").checked = !!detail.can_write;
    // Concessões já gravadas: entram como estão e só mudam por ação de quem edita.
    for (const grant of detail.grants) {
      wizard.grants.set(grant.asset_id, grant.mode);
      wizard.names.set(grant.asset_id, { name: grant.tag && grant.kind === "equipment" ? grant.tag : grant.name, kind: grant.kind, path: (grant.path || []).join(" / ") });
    }
    wizard.mode = scopeOf(wizard.grants, detail.corporation_id);
  }
  for (const id of ["newUserName", "newUserEmail", "newUserRole", "newUserCorp"]) $id(id).disabled = !!userId;
  $id("userDialogTitle").textContent = userId ? "Editar acesso" : "Novo usuário";
  syncWizard();
  $id("userDialog").showModal();
}
function wizardData() {
  const role = $id("newUserRole").value;
  return { name: $id("newUserName").value.trim(), email: $id("newUserEmail").value.trim().toLowerCase(), role, corp: role === "corp" ? $id("newUserCorp").value : "", canWrite: role === "corp" && $id("newUserWrite").checked };
}
function syncWizard() {
  const data = wizardData();
  $id("newUserCorpRow").hidden = $id("newUserWriteRow").hidden = data.role !== "corp";
  for (const step of [1, 2, 3]) $id("userStep" + step).hidden = wizard.step !== step;
  document.querySelectorAll("#userSteps li").forEach((item) => {
    const number = Number(item.dataset.step);
    item.className = number === wizard.step ? "current" : number < wizard.step ? "done" : "";
    item.hidden = number === 2 && data.role !== "corp";
  });
  $id("userBack").hidden = wizard.step === 1;
  $id("userNext").textContent = wizard.step < 3 ? "Avançar" : wizard.userId ? "Salvar acesso" : "Cadastrar e enviar convite";
}
$id("newUserRole").onchange = syncWizard;
const grantList = () => [...wizard.grants].map(([asset_id, mode]) => ({ asset_id, mode }));

// Lê do servidor o efeito das concessões em um nível. Devolve false se a resposta chegou
// atrasada (outra alteração ou outra corporação já está em curso) e deve ser ignorada.
async function loadGrantLevel(parentId, run) {
  const corp = wizard.corp;
  const result = await callRpc("gaxeta_admin_preview_access", { p_corporation_id: corp, p_grants: grantList(), p_parent_id: parentId || null });
  if (run !== wizard.run || corp !== wizard.corp) return false;
  wizard.kids.set(kidsKey(parentId), result.items);
  for (const item of result.items) wizard.names.set(item.id, { ...wizard.names.get(item.id), name: item.kind === "equipment" && item.tag ? item.tag : item.name, kind: item.kind });
  if (!parentId) {
    wizard.totals = result.totals || {};
    wizard.root = result.items[0] || null;
    wizard.grants = new Map(result.normalized_grants.map((grant) => [grant.asset_id, grant.mode]));
  }
  return true;
}
// Relê a prévia: primeiro a raiz (que normaliza as concessões), depois os ramos abertos.
async function refreshGrantTree() {
  const run = ++wizard.run;
  wizard.previewError = "";
  try {
    if (!(await loadGrantLevel(null, run))) return false;
    const levels = await Promise.all([wizard.corp, ...wizard.open].map((id) => loadGrantLevel(id, run)));
    if (levels.includes(false)) return false;
  } catch (error) {
    if (run !== wizard.run) return false;
    // Falha de consulta não é "sem acesso": a tela diz que a prévia não carregou.
    wizard.previewError = errorText(error);
  }
  renderGrantStep();
  return !wizard.previewError;
}
function grantChip(item, explicit) {
  if (explicit === "all") return ["Incluído", "included"];
  if (explicit === "none") return [item.state === "path" ? "Bloqueado · exceção abaixo" : "Bloqueado", "blocked"];
  if (item.state === "full") return ["Acesso herdado", "inherited"];
  if (item.state === "path") return ["Só caminho", "path"];
  return ["Sem acesso", "none"];
}
function grantBranch(parentId) {
  const items = wizard.kids.get(kidsKey(parentId)) || [];
  return (
    "<ul>" +
    items
      .map((item) => {
        const explicit = wizard.grants.get(item.id) || "";
        const open = wizard.open.has(item.id);
        const label = item.kind === "equipment" && item.tag ? item.tag : item.tag && item.tag !== item.name ? `${item.name} · ${item.tag}` : item.name;
        const [chip, chipClass] = grantChip(item, explicit);
        const option = (mode, text) => `<button type="button" data-grant="${item.id}" data-mode="${mode}" aria-pressed="${explicit === mode}">${text}</button>`;
        return (
          `<li><div class="grant-row${wizard.flash === item.id ? " flash" : ""}" data-grant-row="${item.id}">` +
          `<button type="button" class="tree-toggle" data-grant-toggle="${item.id}"${item.has_children ? "" : " disabled"} aria-label="${open ? "Recolher" : "Abrir"} ${esc(label)}">${item.has_children ? glyph(open ? "chevron-down" : "chevron-right") : ""}</button>` +
          `<span class="grant-name"><small>${KIND_LABEL[item.kind]}</small>${esc(label)}</span>` +
          `<span class="grant-state chip-${chipClass}">${chip}</span>` +
          `<details class="row-menu grant-menu"><summary aria-label="Regra de acesso para ${esc(label)}">Regra</summary><div class="menu-list">` +
          option("all", "Incluir ramo") +
          option("none", "Bloquear ramo") +
          option("", "Usar regra do nível acima") +
          `</div></details></div>` +
          (open ? grantBranch(item.id) : "") +
          "</li>"
        );
      })
      .join("") +
    "</ul>"
  );
}
// Resumo fiel ao servidor: nunca diz "sem acesso" quando há concessão válida na raiz,
// nem transforma uma falha de consulta em acesso negado.
function grantSummary() {
  if (wizard.previewError) return `Não foi possível carregar a prévia do acesso (${wizard.previewError}). Nada foi alterado; tente de novo.`;
  if (!wizard.root) return "";
  const parts = Object.entries(KIND_PLURAL).filter(([kind]) => wizard.totals[kind] > 0).map(([kind, label]) => `${wizard.totals[kind]} ${label}`);
  const blocked = [...wizard.grants].filter(([, mode]) => mode === "none").length;
  if (wizard.root.state === "full") {
    if (!wizard.root.has_children) return "Acesso concedido à corporação. Ainda não há empresas cadastradas. Novos ramos serão incluídos.";
    return (
      `Acesso concedido à corporação${blocked ? `, com ${blocked} ramo(s) bloqueado(s)` : ""}. ` +
      `Acesso efetivo hoje: ${parts.join(", ") || "nenhum ramo liberado"}. Novos ramos${blocked ? " fora dos bloqueios" : ""} serão incluídos.`
    );
  }
  if (parts.length) return `Acesso efetivo hoje: ${parts.join(", ")}. Cada ramo incluído recebe também o que for criado dentro dele.`;
  return "Sem acesso: nenhum ramo incluído. A conta entra, mas não vê nenhum ativo.";
}
function renderGrantStep() {
  const data = wizardData();
  $id("scopeLead").textContent = `Acesso de ${data.name || data.email} em ${assetName(wizard.corp)}.`;
  document.querySelectorAll('[name="scopeMode"]').forEach((radio) => (radio.checked = radio.value === wizard.mode));
  $id("scopeSelect").hidden = wizard.mode !== "select";
  $id("scopeFuture").checked = wizard.grants.get(wizard.corp) === "all";
  const companies = wizard.kids.get(wizard.corp);
  // Três situações diferentes, três textos diferentes: falha, corporação vazia, lista.
  $id("grantTree").innerHTML = wizard.previewError
    ? `<p class="tree-empty is-error">Não foi possível carregar os ramos: ${esc(wizard.previewError)} <button type="button" class="text-button" data-grant-retry>Tentar de novo</button></p>`
    : !companies
      ? '<p class="tree-empty">Carregando…</p>'
      : !companies.length
        ? '<p class="tree-empty">Esta corporação ainda não tem empresas cadastradas. Com “Toda a corporação”, as que forem criadas entram automaticamente.</p>'
        : grantBranch(wizard.corp);
  const summary = wizard.mode ? grantSummary() : "Escolha o alcance do acesso.";
  $id("grantTotals").textContent = (wizard.hint ? wizard.hint + " " : "") + summary;
  $id("grantTotals").classList.toggle("is-error", !!wizard.previewError);
  if (wizard.flash) {
    $id("grantTree").querySelector(".flash")?.scrollIntoView({ block: "nearest" });
    wizard.flash = "";
  }
}
// As três escolhas do nível superior.
document.querySelectorAll('[name="scopeMode"]').forEach((radio) => {
  radio.onchange = () => {
    if (!radio.checked) return;
    // A seleção por ramos em andamento fica guardada: voltar a "Selecionar ramos" a restaura.
    if (wizard.mode === "select") wizard.stash = new Map(wizard.grants);
    wizard.mode = radio.value;
    wizard.hint = "";
    if (radio.value === "whole") wizard.grants = new Map([[wizard.corp, "all"]]);
    else if (radio.value === "none") wizard.grants = new Map();
    else if (wizard.stash) wizard.grants = new Map(wizard.stash);
    refreshGrantTree().catch((error) => ($id("userFormMessage").textContent = errorText(error)));
  };
});
$id("scopeFuture").onchange = () => {
  $id("scopeFuture").checked ? wizard.grants.set(wizard.corp, "all") : wizard.grants.delete(wizard.corp);
  wizard.hint = "";
  refreshGrantTree().catch((error) => ($id("userFormMessage").textContent = errorText(error)));
};
$id("grantTree").onclick = async (event) => {
  const toggle = event.target.closest("[data-grant-toggle]");
  const grant = event.target.closest("[data-grant]");
  try {
    if (event.target.closest("[data-grant-retry]")) return void (await refreshGrantTree());
    if (toggle) {
      const id = toggle.dataset.grantToggle;
      if (wizard.open.has(id)) wizard.open.delete(id);
      else {
        wizard.open.add(id);
        if (!(await loadGrantLevel(id, wizard.run))) return;
      }
      renderGrantStep();
    } else if (grant) {
      const id = grant.dataset.grant;
      const mode = grant.dataset.mode;
      mode ? wizard.grants.set(id, mode) : wizard.grants.delete(id);
      wizard.hint = "";
      if (!(await refreshGrantTree())) return;
      // O servidor descarta regras sem efeito; a tela explica em vez de mostrar um estado que não foi gravado.
      const name = wizard.names.get(id)?.name || "Este ramo";
      if (mode === "none" && !wizard.grants.has(id)) wizard.hint = `“${name}” já está sem acesso: sem regra acima, só entram os ramos incluídos.`;
      if (mode === "all" && !wizard.grants.has(id)) wizard.hint = `“${name}” já está incluído pela regra do nível acima.`;
      if (wizard.hint) renderGrantStep();
    }
  } catch (error) {
    $id("userFormMessage").textContent = errorText(error);
  }
};
// O menu "Regra" abre sobre a lista, sem ser cortado pela área de rolagem.
$id("grantTree").addEventListener(
  "toggle",
  (event) => {
    const menu = event.target;
    if (!menu.matches?.("details.grant-menu") || !menu.open) return;
    $id("grantTree").querySelectorAll("details.grant-menu[open]").forEach((other) => other !== menu && (other.open = false));
    const anchor = menu.querySelector("summary").getBoundingClientRect();
    const list = menu.querySelector(".menu-list");
    list.style.position = "fixed";
    list.style.right = "auto";
    list.style.left = Math.max(8, Math.min(anchor.right - 220, window.innerWidth - 228)) + "px";
    list.style.top = (anchor.bottom + 110 > window.innerHeight ? anchor.top - 112 : anchor.bottom + 4) + "px";
  },
  true,
);
$id("grantTree").addEventListener("scroll", () => $id("grantTree").querySelectorAll("details.grant-menu[open]").forEach((menu) => (menu.open = false)));

// Busca de ramos dentro da corporação escolhida (empresa, área, subárea ou TAG).
$id("grantSearch").oninput = debounce(async () => {
  const query = $id("grantSearch").value.trim();
  const box = $id("grantResults");
  const run = ++wizard.searchRun;
  const corp = wizard.corp;
  if (query.length < 2) return void (box.hidden = true);
  try {
    const rows = (await callRpc("gaxeta_assets_search", { p_query: query, p_limit: 100 })).filter((row) => row.corporation_id === corp && row.kind !== "corporation");
    if (run !== wizard.searchRun || corp !== wizard.corp) return;
    box.hidden = false;
    box.innerHTML = rows.length
      ? rows
          .slice(0, 30)
          .map((row) => `<button type="button" data-grant-result="${row.id}"><small>${KIND_LABEL[row.kind]}</small><strong>${esc(assetLabel(row))}</strong><span>${esc((row.path_names || []).slice(1, -1).join(" / "))}</span></button>`)
          .join("")
      : `<p class="tree-empty">Nenhum ramo desta corporação corresponde a “${esc(query)}”.</p>`;
  } catch (error) {
    if (run !== wizard.searchRun) return;
    box.hidden = false;
    box.innerHTML = `<p class="tree-empty is-error">Não foi possível buscar agora: ${esc(errorText(error))}</p>`;
  }
}, 300);
$id("grantResults").onclick = async (event) => {
  const button = event.target.closest("[data-grant-result]");
  if (!button) return;
  try {
    const id = button.dataset.grantResult;
    await ensureAssets([id]);
    // Abre os níveis acima do resultado (da empresa até o pai) e destaca a linha.
    for (const ancestor of (assetIndex.get(id)?.path || []).slice(1, -1)) wizard.open.add(ancestor);
    wizard.flash = id;
    $id("grantResults").hidden = true;
    $id("grantSearch").value = "";
    await refreshGrantTree();
  } catch (error) {
    $id("userFormMessage").textContent = errorText(error);
  }
};

function renderUserReview() {
  const data = wizardData();
  const describe = ([id]) => {
    const known = wizard.names.get(id) || {};
    const path = assetPathLabel(id) || [known.path, known.name].filter(Boolean).join(" / ") || id;
    return `<li><small>${KIND_LABEL[known.kind || assetIndex.get(id)?.kind] || ""}</small> ${esc(path)}</li>`;
  };
  const included = [...wizard.grants].filter(([, mode]) => mode === "all");
  const blocked = [...wizard.grants].filter(([, mode]) => mode === "none");
  const scope = scopeOf(wizard.grants, wizard.corp);
  $id("userReview").innerHTML =
    `<dl class="detail-fields"><dt>Nome</dt><dd>${esc(data.name)}</dd><dt>Destinatário</dt><dd>${esc(data.email)}</dd><dt>Nível</dt><dd>${ROLE_LABEL[data.role]}</dd>` +
    (data.role === "corp"
      ? `<dt>Corporação</dt><dd>${esc(assetName(data.corp))}</dd><dt>Edição operacional</dt><dd>${data.canWrite ? "Sim: cria áreas, subáreas, TAGs e spots e vincula sensores nos ramos concedidos" : "Não: somente consulta"}</dd>` +
        `<dt>Alcance</dt><dd>${SCOPE_LABEL[scope]}</dd></dl>` +
        (scope === "select" || blocked.length
          ? `<div class="review-lists">` +
            (included.length ? `<div><h3>Ramos incluídos</h3><ul>${included.map(describe).join("")}</ul></div>` : "") +
            (blocked.length ? `<div><h3>Exceções bloqueadas</h3><ul>${blocked.map(describe).join("")}</ul></div>` : "") +
            `</div>`
          : "") +
        `<p class="grant-totals${wizard.previewError ? " is-error" : ""}">${esc(grantSummary())}</p>`
      : `<dt>Alcance</dt><dd>${data.role === "adm3" ? "Consulta e análise em todas as corporações, sem escrita" : "Global, conforme o nível"}</dd></dl>`) +
    (wizard.userId ? "" : `<p class="form-help">O cadastro é gravado antes do envio. Se o e-mail falhar, o convite fica pendente e pode ser reenviado. Se o e-mail já tiver uma conta verificada, ela é vinculada sem novo convite e sem troca de senha.</p>`);
}
$id("userBack").onclick = () => {
  wizard.step = wizard.step === 3 && wizardData().role !== "corp" ? 1 : wizard.step - 1;
  $id("userFormMessage").textContent = "";
  syncWizard();
  if (wizard.step === 2) renderGrantStep();
};
$id("userForm").onsubmit = async (event) => {
  event.preventDefault();
  const message = $id("userFormMessage");
  const data = wizardData();
  message.textContent = "";
  const button = $id("userNext");
  button.disabled = true;
  try {
    if (wizard.step === 1) {
      if (data.name.length < 1) return void (message.textContent = "Informe o nome.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return void (message.textContent = "Informe um e-mail válido.");
      if (data.role === "corp" && !data.corp) return void (message.textContent = "Selecione a corporação.");
      if (data.role === "corp") {
        // Outra corporação num cadastro novo: a seleção anterior não se aplica. Mesma corporação: tudo é mantido.
        if (wizard.corp !== data.corp) {
          if (!wizard.userId && wizard.corp) Object.assign(wizard, { grants: new Map(), stash: null, mode: "" });
          Object.assign(wizard, { corp: data.corp, kids: new Map(), open: new Set(), root: null, totals: {} });
        }
        wizard.hint = "";
        $id("grantSearch").value = "";
        $id("grantResults").hidden = true;
        wizard.step = 2;
        syncWizard();
        renderGrantStep();
        await refreshGrantTree();
      } else {
        renderUserReview();
        wizard.step = 3;
      }
    } else if (wizard.step === 2) {
      if (!wizard.mode) return void (message.textContent = "Escolha o alcance: Toda a corporação, Selecionar ramos ou Sem acesso.");
      // A revisão usa a resposta do servidor. Se a prévia falhar, o fluxo não avança nem assume "sem acesso".
      if (!(await refreshGrantTree())) return void (message.textContent = wizard.previewError ? "Não foi possível conferir o acesso no servidor. Tente de novo." : "");
      await ensureAssets([...wizard.grants.keys()]);
      renderUserReview();
      wizard.step = 3;
    } else if (wizard.userId) {
      await callRpc("gaxeta_admin_set_access", { p_user_id: wizard.userId, p_can_write: data.canWrite, p_grants: grantList() });
      $id("userDialog").close();
      showMessage(`Acesso de ${data.email} atualizado. Vale no servidor a partir de agora.`, "success");
      await loadUsers();
    } else {
      const result = await callRpc("gaxeta_admin_invite_user", {
        p_email: data.email,
        p_display_name: data.name,
        p_global_role: data.role === "corp" ? null : data.role,
        p_corporation_id: data.role === "corp" ? data.corp : null,
        p_can_write: data.canWrite,
        p_grants: data.role === "corp" ? grantList() : [],
      });
      $id("userDialog").close();
      if (result.kind === "linked") showMessage(`${data.email} já tinha conta verificada: acesso vinculado e ativo, sem novo convite.`, "success");
      else {
        const sent = await sendInvite(result.invite_id, data.email);
        showMessage(sent.ok ? `Cadastro gravado e convite enviado para ${data.email}.` : `Cadastro gravado; o convite ficou pendente. ${sent.message} Use Ações → Reenviar convite.`, sent.ok ? "success" : "error");
      }
      await loadUsers();
    }
    syncWizard();
  } catch (error) {
    message.textContent = errorText(error);
  } finally {
    button.disabled = false;
  }
};

// ----- Auditoria -----
async function loadAudit() {
  const rows = await callRpc("gaxeta_admin_audit", { p_limit: 50, p_offset: 0, p_action_prefix: null, p_target_id: null, p_corporation_id: null });
  $id("auditRows").innerHTML =
    rows
      .map((row) => `<tr><td>${fmtDateTime(row.at)}</td><td>${esc(row.actor_email || "sistema")}</td><td>${esc(row.action)}</td><td>${esc(row.target_type)} ${esc(String(row.target_id || "").slice(0, 18))}</td><td><code>${esc(JSON.stringify(row.details || {}).slice(0, 160))}</code></td></tr>`)
      .join("") || '<tr><td colspan="5">Nenhum registro.</td></tr>';
}
$id("auditPanel").addEventListener("toggle", () => {
  if ($id("auditPanel").open) loadAudit().catch((error) => showMessage(errorText(error), "error"));
});
