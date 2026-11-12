// =============================================================================
// Núcleo: configuração, cliente Supabase e utilitários de formatação e domínio.
// Tudo neste diretório é concatenado em ordem pelo build (escopo único de módulo).
// Nomes novos usam 4+ caracteres para não colidir com os nomes curtos do vendor.
// =============================================================================
const CONFIG = Object.freeze({
  supabaseUrl: "https://dejxzipydlnjhrjivgjp.supabase.co",
  publishableKey: "sb_publishable_XkutzQ-1BaHXHuBDaD1eLw_xEukysyF",
  // Endereço público do site: usado nos links de convite e recuperação, inclusive pelo app Android.
  publicBaseUrl: "https://laboratoriochesterton.github.io/sensorgaxeta/",
  callbackPage: "acesso.html",
  inviteFunction: "gaxeta-invite",
  pollMs: 5000,
  contextCheckMs: 60000,
  pageSize: 24,
});

// A URL de entrada é lida antes de o SDK consumir os parâmetros de convite/recuperação.
const ENTRY_URL = Object.freeze({ hash: location.hash, search: location.search });

async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  init.signal?.aborted ? controller.abort() : init.signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}

// `Ia` é o createClient do supabase-js no vendor.
const sb = Ia(CONFIG.supabaseUrl, CONFIG.publishableKey, {
  global: { fetch: fetchWithTimeout },
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

async function unwrap(request) {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}
const callRpc = (name, params = {}) => unwrap(sb.rpc(name, params));

const KIND_ORDER = ["corporation", "company", "area", "subarea", "equipment", "point"];
const KIND_LABEL = {
  corporation: "Corporação",
  company: "Empresa",
  area: "Área",
  subarea: "Subárea",
  equipment: "TAG",
  point: "Spot",
};
// Filhos válidos por nível (a subárea é opcional: o TAG pode ficar direto na área).
const KIND_CHILDREN = {
  corporation: ["company"],
  company: ["area"],
  area: ["equipment", "subarea"],
  subarea: ["equipment"],
  equipment: ["point"],
  point: [],
};
const KIND_ICON = { corporation: "building-2", company: "factory", area: "folder", subarea: "folder", equipment: "cog", point: "map-pin" };

// Spot: o nome é uma de três opções (o servidor valida a mesma lista).
const SPOT_NAMES = ["LOA", "LA", "UNICO"];
const spotCanonical = (name) => {
  const key = String(name ?? "").replace(/\s+/g, "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SPOT_NAMES.includes(key) ? key : null;
};

// Tipos de equipamento. A lista vem do servidor (gaxeta_equipment_types); esta cópia
// é o catálogo inicial e só vale enquanto a leitura não chega.
const equipCatalog = new Map([
  ["bomba_centrifuga", "Bomba centrífuga"], ["bomba_biapoiada", "Bomba biapoiada"], ["agitador", "Agitador"],
  ["misturador", "Misturador"], ["refinador", "Refinador"], ["digestor", "Digestor"], ["depurador", "Depurador"],
  ["vaso_pressao", "Vaso de pressão"], ["bomba_magnetica", "Bomba magnética"], ["bomba_hermetica", "Bomba hermética"],
  ["bomba_vacuo", "Bomba de vácuo"], ["compressor", "Compressor"], ["bomba_alta_pressao", "Bomba de alta pressão"],
  ["bomba_baixa_pressao", "Bomba de baixa pressão"],
]);
const TYPE_UNKNOWN = "Tipo não informado";
// Ficha técnica do TAG: [chave no servidor, rótulo, formato]. "count" = inteiro não negativo; "long" = texto livre.
const EQUIP_GROUPS = [
  { title: "Processo", fields: [["fluid", "Produto / fluido"], ["fluid_temperature", "Temperatura do fluido"], ["density", "Densidade"], ["characteristics", "Características", "long"]] },
  {
    title: "Equipamento e montagem",
    fields: [["manufacturer", "Fabricante"], ["model", "Modelo"], ["shaft_size", "Tamanho do eixo"], ["sleeve_size", "Tamanho da luva"], ["stud_size", "Tamanho do prisioneiro"], ["stud_diameter", "Diâmetro do prisioneiro"], ["gland_bolt_count", "Parafusos do preme-gaxeta (qtd.)", "count"]],
  },
  { title: "Gaxeta", fields: [["ring_count", "Quantidade de anéis", "count"], ["packing_type", "Tipo"], ["packing_model", "Modelo"], ["assembly_rule", "Regra de montagem", "long"]] },
];
const ROLE_LABEL = { adm1: "ADM nível 1", adm2: "ADM nível 2", adm3: "ADM nível 3", corp: "Usuário de corporação" };

const fmtNum = (value, digits = 1) =>
  value == null || !Number.isFinite(Number(value))
    ? "—"
    : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtDateTime = (value) => (value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" }) : "—");
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const $id = (id) => document.getElementById(id);
// Plataforma: só o runtime nativo do Capacitor conta como aplicativo. Uma janela
// estreita de navegador (inclusive Chrome ou Safari no celular) continua sendo web.
const isNativeApp = () => Z.isNativePlatform();
// Bluetooth existe apenas no aplicativo nativo com o plugin disponível.
const bleAvailable = () => isNativeApp() && Z.isPluginAvailable("BluetoothLe");
const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;

// Ícones Lucide incluídos no vendor (nomes minificados à direita).
const renderIcons = () =>
  en({
    icons: {
      LayoutGrid: Ks, Network: Gs, ChartNoAxesCombined: Ms, Router: Xs, Bluetooth: Us, BluetoothSearching: Ds, BookOpen: Bs,
      Plus: Js, Search: Qs, Radio: Ys, Wifi: Zs, Building2: qs, Factory: Ws, Folder: Hs, Cog: Vs, MapPin: zs, ChevronRight: Fs,
    },
  });
const icon = (name) => `<i data-lucide="${name}"></i>`;
// Ícones adicionais desenhados aqui (traço simples), para não depender de novos pacotes.
const GLYPHS = {
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.5c1.8.9 3 2.9 3 5.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M9.5 4.5v15"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-2.5z"/>',
  "chevron-down": '<path d="M6 9.5l6 6 6-6"/>',
  "chevron-right": '<path d="M9.5 6l6 6-6 6"/>',
  back: '<path d="M10 6l-6 6 6 6M4 12h16"/>',
  subfolder: '<path d="M3.5 6.5h6l2 2h9v10h-17z"/><path d="M8 13.5h8"/>',
  list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
};
// Ícone do nível: os do pacote, mais um próprio para distinguir subárea de área.
const kindIcon = (kind) => (kind === "subarea" ? glyph("subfolder") : icon(KIND_ICON[kind]));
const glyph = (name) =>
  `<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[name] || ""}</svg>`;

// ----- Regras de domínio herdadas do pacote publicado (sem alteração de comportamento) -----
function connectionStatus(t, e = Date.now()) {
  const r = e - new Date(t.last_received_at || 0).getTime();
  return r < 25e3
    ? {
        online: !0,
        label: "Transmitindo",
        className: "green",
      }
    : r < 65e3
      ? {
          online: !1,
          label: "Atraso na transmissão",
          className: "gray",
        }
      : {
          online: !1,
          label: "Sem atualização",
          className: "gray",
        };
}
function assetPath(t, e) {
  const r = [],
    s = new Set();
  for (; t && !s.has(t);) {
    s.add(t);
    const n = e.find((i) => i.id === t);
    if (!n) break;
    (r.unshift(n), (t = n.parent_id));
  }
  return r;
}
function isUnderAsset(t, e, r) {
  return !e || assetPath(t, r).some((s) => s.id === e);
}
function companyOf(t, e) {
  return assetPath(t, e).find((r) => r.kind === "company")?.id || null;
}
function presetRange(t, e = new Date()) {
  const r = new Date(e),
    s = new Date(e);
  if (t === "month" || t === "3months") {
    const n = s.getDate();
    (s.setDate(1), s.setMonth(s.getMonth() - (t === "month" ? 1 : 3)));
    const i = new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate();
    s.setDate(Math.min(n, i));
  } else s.setTime(r.getTime() - Number(t));
  return {
    from: s,
    to: r,
  };
}
function validateRange(t, e) {
  const r = new Date(t).getTime(),
    s = new Date(e).getTime();
  if (!Number.isFinite(r) || !Number.isFinite(s) || s - r < 1e3 || s - r > 366 * 864e5)
    throw Error("Selecione um intervalo entre 1 segundo e 366 dias.");
  return {
    from: new Date(r),
    to: new Date(s),
  };
}
function isValidSensorName(t) {
  return /^[A-Za-z0-9][A-Za-z0-9 ._-]{2,23}$/.test(t);
}
function csvCell(t) {
  const e = String(t ?? "");
  return '"' + (/^[=+\-@\t\r]/.test(e) ? "'" : "") + e.replaceAll('"', '""') + '"';
}
function adjustmentInfo(t) {
  if (t == null || !Number.isFinite(Number(t)))
    return {
      key: "unknown",
      label: "Sem leitura",
      action: "Aguardando medição",
    };
  const e = Number(t);
  return e >= 70
    ? {
        key: "high",
        label: "Alto ajuste",
        action: "Sem necessidade de intervenção",
      }
    : e >= 45
      ? {
          key: "medium",
          label: "Médio ajuste",
          action: "Sem necessidade de intervenção",
        }
      : e > 20
        ? {
            key: "low",
            label: "Baixo ajuste",
            action: "Planejar intervenção",
          }
        : {
            key: "critical",
            label: "Sem ajuste",
            action: "Substituir a gaxeta",
          };
}
// A linha estabilizada do gráfico é montada em 70-telemetry.js (buildStableSegments), por condição.
async function exportCsvFile(t, e) {
  if (Z.isNativePlatform()) {
    const n = await FilesystemPlugin.writeFile({
      path: e,
      data: "\uFEFF" + t,
      directory: FsDirectory.Cache,
      encoding: Zt.UTF8,
    });
    await SharePlugin.share({
      title: "Telemetria de gaxeta",
      files: [n.uri],
      dialogTitle: "Salvar ou compartilhar CSV",
    });
    return;
  }
  const r = URL.createObjectURL(
      new Blob(["\uFEFF", t], {
        type: "text/csv;charset=utf-8",
      }),
    ),
    s = document.createElement("a");
  ((s.href = r), (s.download = e), s.click(), setTimeout(() => URL.revokeObjectURL(r), 1e3));
}
