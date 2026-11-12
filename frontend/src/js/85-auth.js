// =============================================================================
// Entrada, convite e recuperação.
//  * Nada entra sozinho: sem sessão, só o envio do formulário (Entrar/Enter);
//    com sessão guardada, "Continuar" ou "Trocar conta".
//  * Convite e recuperação chegam por acesso.html. O painel só abre depois de a
//    senha ser definida e, no convite, de o servidor ativar o vínculo pré-cadastrado.
//  * Tokens do link nunca são gravados, exibidos ou propagados; a URL é limpa.
// =============================================================================
function readEntryIntent() {
  const hash = new URLSearchParams(ENTRY_URL.hash.replace(/^#/, ""));
  const query = new URLSearchParams(ENTRY_URL.search);
  const pick = (key) => hash.get(key) || query.get(key);
  return {
    type: pick("type"),
    tokenHash: query.get("token_hash"),
    hasTokens: !!hash.get("access_token"),
    error: pick("error_code") || pick("error"),
  };
}
const auth = { entered: false, intent: readEntryIntent(), flow: null, pendingLogin: false, verifiedSession: null };
const isCallback = () => !!(auth.intent.type || auth.intent.tokenHash || auth.intent.error);
function cleanUrl() {
  history.replaceState(null, "", location.pathname.replace(new RegExp(CONFIG.callbackPage.replace(".", "\\.") + "$"), ""));
  auth.intent = { type: null, tokenHash: null, hasTokens: false, error: null };
}
function showAuthView(viewId, message = "", kind = "") {
  $id("application").hidden = true;
  $id("auth").hidden = false;
  document.querySelectorAll(".auth-view").forEach((view) => (view.hidden = view.id !== viewId));
  $id("authMessage").textContent = message;
  $id("authMessage").className = "auth-message " + kind;
}
function authErrorText(error) {
  const message = error?.message || "";
  if (/Invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(message)) return "Este e-mail ainda não foi confirmado. Use o link do convite ou peça um novo.";
  if (/different from the old/i.test(message)) return "A nova senha precisa ser diferente da anterior.";
  if (/weak|at least|characters/i.test(message)) return "Senha recusada pela política de segurança: use pelo menos 10 caracteres, com letras e números.";
  if (/expired|invalid|not found/i.test(message)) return "Link vencido ou já utilizado. Solicite um novo.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  return errorText(error);
}
function passwordProblem(password, confirmation) {
  if (password.length < 10) return "A senha precisa de pelo menos 10 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "A senha precisa ter letras e números.";
  if (password !== confirmation) return "As senhas não coincidem.";
  return "";
}
function showPasswordView(session, flow) {
  auth.flow = flow;
  auth.verifiedSession = session;
  $id("passwordForm").reset();
  $id("passwordTitle").textContent = flow === "invite" ? "Criar sua senha" : "Definir nova senha";
  $id("passwordEmail").textContent = session.user.email; // e-mail verificado pelo Supabase, sem edição
  $id("passwordSubmit").textContent = flow === "invite" ? "Salvar senha e entrar" : "Salvar nova senha";
  showAuthView("passwordForm");
  $id("setPassword").focus();
}
function showExpiredLink() {
  const wasInvite = auth.intent.type === "invite";
  cleanUrl();
  // Mantém o aviso na tela: eventos seguintes do SDK não o trocam por "Continuar".
  auth.flow = "notice";
  if (wasInvite) showAuthView("loginForm", "Convite vencido ou já utilizado. Peça ao responsável um novo envio.", "error");
  else showAuthView("forgotForm", "Link vencido ou já utilizado. Informe o e-mail para receber um novo.", "error");
}

// ----- Entrada no painel (sempre depois de uma ação explícita) -----
async function enterApp(session) {
  showAuthView("authLoading", "Carregando seu acesso…");
  const run = ++state.authRequest;
  try {
    let context = await callRpc("gaxeta_my_context");
    if (!context.role && context.has_pending_invite) {
      try {
        await callRpc("gaxeta_activate_invite");
        context = await callRpc("gaxeta_my_context");
      } catch (error) {
        if (/senha/i.test(error?.message || "")) return showPasswordView(session, "invite");
        throw error;
      }
    }
    if (run !== state.authRequest) return;
    if (!context.role) {
      $id("continueEmail").textContent = session.user.email;
      return showAuthView("authContinue", "Esta conta ainda não tem acesso autorizado. Fale com o responsável pela operação ou troque de conta.", "error");
    }
    Object.assign(state, { ctx: context, userId: session.user.id, authorized: true, lastContextCheck: Date.now() });
    auth.entered = true;
    auth.flow = null;
    $id("auth").hidden = true;
    $id("application").hidden = false;
    $id("userEmail").textContent = session.user.email;
    $id("userBadge").textContent = (context.display_name || session.user.email || "?").trim().slice(0, 2).toUpperCase();
    $id("password").value = "";
    applyPermissions();
    loadEquipCatalog().catch(() => {}); // rótulos dos tipos de equipamento; sem a leitura vale o catálogo inicial
    setConnection(true);
    showMessage("");
    if (session.user.user_metadata?.must_change_password) openAccountDialog(true);
    showPage(PAGE_TITLES[location.hash.slice(1)] ? location.hash.slice(1) : "sensors");
    clearTimeout(state.timer);
    state.timer = setTimeout(refreshData, CONFIG.pollMs);
  } catch (error) {
    showAuthView("loginForm", authErrorText(error), "error");
  }
}
async function leaveApp(message = "") {
  await bleDisconnect().catch(() => {});
  clearSessionData();
  auth.entered = false;
  auth.flow = null;
  await sb.auth.signOut({ scope: "local" }).catch(() => {});
  showAuthView("loginForm", message, message ? "error" : "");
}

$id("loginForm").onsubmit = async (event) => {
  event.preventDefault();
  const email = $id("email").value.trim();
  const password = $id("password").value;
  if (!email || !password) return showAuthView("loginForm", "Informe e-mail e senha.", "error");
  const button = event.submitter || $id("loginForm").querySelector("button.primary");
  button.disabled = true;
  auth.pendingLogin = true;
  $id("authMessage").textContent = "Entrando…";
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return showAuthView("loginForm", authErrorText(error), "error");
    await enterApp(data.session);
  } catch (error) {
    showAuthView("loginForm", authErrorText(error), "error");
  } finally {
    auth.pendingLogin = false;
    button.disabled = false;
  }
};
$id("continueSession").onclick = (event) =>
  withBusy(event.currentTarget, async () => {
    const { data } = await sb.auth.getSession();
    if (!data.session) return showAuthView("loginForm", "A sessão guardada expirou. Entre novamente.");
    await enterApp(data.session);
  });
$id("switchAccount").onclick = async () => {
  await sb.auth.signOut({ scope: "local" }).catch(() => {});
  $id("loginForm").reset();
  showAuthView("loginForm");
};
$id("showForgot").onclick = () => {
  $id("forgotEmail").value = $id("email").value.trim();
  showAuthView("forgotForm");
};
$id("backToLogin").onclick = () => showAuthView("loginForm");
$id("forgotForm").onsubmit = async (event) => {
  event.preventDefault();
  const email = $id("forgotEmail").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return showAuthView("forgotForm", "Informe um e-mail válido.", "error");
  event.submitter.disabled = true;
  try {
    // Resposta neutra: a tela não revela se o e-mail tem cadastro.
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: CONFIG.publicBaseUrl + CONFIG.callbackPage });
    if (error && /fetch|network/i.test(error.message)) throw error;
    showAuthView("loginForm", "Se houver uma conta para este e-mail, um link para definir a senha chegará em instantes. Confira também a caixa de spam.", "ok");
  } catch (error) {
    showAuthView("forgotForm", authErrorText(error), "error");
  } finally {
    event.submitter.disabled = false;
  }
};
// Link com token_hash: a validação só acontece neste clique, para que verificadores
// automáticos de e-mail não consumam o link.
$id("verifyLink").onclick = (event) =>
  withBusy(event.currentTarget, async () => {
    const { tokenHash, type } = auth.intent;
    const { data, error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: type || "recovery" });
    if (error || !data.session) return showExpiredLink();
    cleanUrl();
    showPasswordView(data.session, type === "recovery" ? "recovery" : "invite");
  });
$id("passwordForm").onsubmit = async (event) => {
  event.preventDefault();
  const password = $id("setPassword").value;
  const problem = passwordProblem(password, $id("setPasswordConfirm").value);
  if (problem) return void (($id("authMessage").textContent = problem), ($id("authMessage").className = "auth-message error"));
  const button = $id("passwordSubmit");
  button.disabled = true;
  $id("authMessage").textContent = "Salvando…";
  try {
    const { data, error } = await sb.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) throw error;
    cleanUrl();
    const session = (await sb.auth.getSession()).data.session || auth.verifiedSession;
    const flow = auth.flow;
    if (flow === "invite") return await enterApp({ ...session, user: data.user || session.user });
    // Recuperação: ativa um convite ainda pendente desta identidade, encerra a sessão e volta ao login.
    const context = await callRpc("gaxeta_my_context").catch(() => null);
    if (context && !context.role && context.has_pending_invite) await callRpc("gaxeta_activate_invite").catch(() => {});
    await sb.auth.signOut({ scope: "local" }).catch(() => {});
    auth.flow = null;
    $id("loginForm").reset();
    showAuthView("loginForm", "Senha atualizada. Entre com a nova senha.", "ok");
  } catch (error) {
    $id("authMessage").textContent = authErrorText(error);
    $id("authMessage").className = "auth-message error";
  } finally {
    button.disabled = false;
  }
};

// ----- Eventos do SDK: decidem só qual tela de entrada mostrar; nunca abrem o painel -----
function onAuthEvent(event, session) {
  if (event === "SIGNED_OUT") {
    if (auth.entered) leaveApp("Sua sessão foi encerrada.");
    return;
  }
  if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "MFA_CHALLENGE_VERIFIED") return;
  if (auth.entered || auth.pendingLogin || auth.flow) return;
  if (event === "PASSWORD_RECOVERY" && session) return showPasswordView(session, "recovery");
  if (auth.intent.error) return showExpiredLink();
  if (auth.intent.tokenHash) {
    $id("verifyTitle").textContent = auth.intent.type === "recovery" ? "Recuperar senha" : "Aceitar convite";
    return showAuthView("authVerify");
  }
  if (session && auth.intent.hasTokens && auth.intent.type) return showPasswordView(session, auth.intent.type === "recovery" ? "recovery" : "invite");
  if (isCallback() && !session) return showExpiredLink();
  if (session) {
    $id("continueEmail").textContent = session.user.email;
    return showAuthView("authContinue");
  }
  showAuthView("loginForm");
}

// ----- Minha senha (dentro do painel) -----
let mustChangePassword = false;
function openAccountDialog(forced = false) {
  mustChangePassword = forced;
  $id("closeAccount").hidden = forced;
  $id("accountMessage").textContent = "";
  $id("accountForm").reset();
  $id("userMenu").open = false;
  $id("accountDialog").showModal();
}
$id("account").onclick = () => openAccountDialog(false);
$id("closeAccount").onclick = () => mustChangePassword || $id("accountDialog").close();
$id("accountDialog").addEventListener("cancel", (event) => mustChangePassword && event.preventDefault());
$id("accountForm").onsubmit = async (event) => {
  event.preventDefault();
  const password = $id("newPassword").value;
  const problem = passwordProblem(password, $id("confirmPassword").value);
  if (problem) return void ($id("accountMessage").textContent = problem);
  event.submitter.disabled = true;
  try {
    const { error } = await sb.auth.updateUser({ password, data: { must_change_password: false } });
    if (error) throw error;
    mustChangePassword = false;
    $id("accountDialog").close();
    showMessage("Sua senha foi atualizada.", "success");
  } catch (error) {
    $id("accountMessage").textContent = authErrorText(error);
  } finally {
    event.submitter.disabled = false;
  }
};
$id("logout").onclick = async () => {
  auth.entered = false;
  await bleDisconnect().catch(() => {});
  clearSessionData();
  await sb.auth.signOut().catch(() => {});
  $id("loginForm").reset();
  showAuthView("loginForm");
};
