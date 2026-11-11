// =============================================================================
// gaxeta-invite · envio do convite de acesso (Edge Function)
//
// Quem chama: a tela Usuários, com o JWT de um administrador (nível 1 ou 2).
// O que faz:  confere a autoridade de quem chama e a existência do convite
//             (pelas RPCs do banco, com o JWT de quem chama), pede ao Supabase
//             Auth o envio do e-mail e grava o resultado no convite.
// O que não faz: não cria acesso. O acesso nasce quando o convidado define a
//             senha e o banco ativa o vínculo pré-cadastrado (gaxeta_activate_invite).
// Segredo:    a chave administrativa vem do ambiente da função; nunca vai ao navegador.
// Sem relação com a ingestão dos sensores.
// =============================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CALLBACK_URL = Deno.env.get("GAXETA_CALLBACK_URL") ?? "https://laboratoriochesterton.github.io/sensorgaxeta/acesso.html";
// Validade informada na tela (segundos). Deve acompanhar "Email OTP Expiration" do Auth; sem valor, não se informa prazo.
const INVITE_TTL_SECONDS = Number(Deno.env.get("GAXETA_INVITE_TTL_SECONDS") ?? "0");
const ALLOWED_ORIGINS = (Deno.env.get("GAXETA_ALLOWED_ORIGINS") ?? "https://laboratoriochesterton.github.io,https://localhost,capacitor://localhost,http://localhost")
  .split(",")
  .map((value) => value.trim());

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (request) => {
  const headers = { ...corsHeaders(request), "Content-Type": "application/json" };
  const reply = (status: number, ok: boolean, message: string, extra: Record<string, unknown> = {}) =>
    new Response(JSON.stringify({ ok, message, ...extra }), { status, headers });

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply(405, false, "Método não permitido.");

  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return reply(401, false, "Sessão ausente.");

  let payload: { invite_id?: string; email?: string };
  try {
    payload = await request.json();
  } catch {
    return reply(400, false, "Requisição inválida.");
  }
  const inviteId = String(payload.invite_id ?? "");
  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!UUID.test(inviteId) || !EMAIL.test(email)) return reply(400, false, "Informe o convite e o e-mail.");

  // 1. Autoridade de quem chama, decidida pelo banco com o JWT recebido.
  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: context, error: contextError } = await caller.rpc("gaxeta_my_context");
  if (contextError) return reply(401, false, "Sessão inválida ou expirada.");
  if (!context?.capabilities?.manage_users) return reply(403, false, "Sua conta não pode enviar convites.");

  // 2. O convite existe, está aberto e pertence a este e-mail (a listagem já aplica a autoridade).
  const { data: listing, error: listError } = await caller.rpc("gaxeta_admin_users", { p_search: email, p_limit: 100, p_offset: 0 });
  if (listError) return reply(403, false, "Não foi possível conferir o convite.");
  const invite = (listing?.items ?? []).find((item: { kind: string; id: string; email: string }) => item.kind === "invite" && item.id === inviteId && item.email === email);
  if (!invite) return reply(404, false, "Convite não encontrado ou já encerrado.");
  if (invite.role !== "corp" && !context.capabilities.manage_global_roles) return reply(403, false, "Somente o nível 1 envia convites de nível global.");

  // 3. Envio pelo Supabase Auth, fora de qualquer transação do banco.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  let ok = false;
  let authUserId: string | null = null;
  let failure: string | null = null;
  let note = "Convite enviado.";

  const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: CALLBACK_URL, data: { display_name: invite.display_name } });
  if (!invited.error) {
    ok = true;
    authUserId = invited.data.user?.id ?? null;
  } else if (/already|registered|exists/i.test(invited.error.message)) {
    // A identidade já existe (convite anterior ou conta sem senha): envia o link de definição de senha.
    const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const recovery = await anon.auth.resetPasswordForEmail(email, { redirectTo: CALLBACK_URL });
    if (recovery.error) failure = recovery.error.message;
    else {
      ok = true;
      note = "A identidade já existia: enviado o link para definir a senha.";
    }
  } else {
    failure = invited.error.message;
  }

  // 4. Resultado persistido no convite (idempotente; nunca cria acesso).
  const expiresAt = ok && INVITE_TTL_SECONDS > 0 ? new Date(Date.now() + INVITE_TTL_SECONDS * 1000).toISOString() : null;
  const { error: resultError } = await admin.rpc("gaxeta_service_invite_result", {
    p_invite_id: inviteId,
    p_ok: ok,
    p_auth_user_id: authUserId,
    p_error: failure,
    p_expires_at: expiresAt,
  });
  // Registro sem e-mail, sem token e sem conteúdo do link.
  console.log(JSON.stringify({ fn: "gaxeta-invite", invite: inviteId, ok, recorded: !resultError }));

  if (!ok) {
    const smtp = /not authorized|rate limit|smtp|sending/i.test(failure ?? "");
    return reply(502, false, smtp ? "O Supabase recusou o envio: configure o SMTP com remetente autorizado (Auth → SMTP) e reenvie." : "Falha no envio: " + failure);
  }
  return reply(200, true, note, { recorded: !resultError });
});
