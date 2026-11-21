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
  ruler: '<path d="M3.5 15.5l12-12 5 5-12 12z"/><path d="M7 12l1.5 1.5M10 9l1.5 1.5M13 6l1.5 1.5"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 0 0 5.2-5.2l-2.5 2.5-2-2z"/>',
};
// Ícone do nível: os do pacote, mais um próprio para distinguir subárea de área.
const kindIcon = (kind) => (kind === "subarea" ? glyph("subfolder") : icon(KIND_ICON[kind]));
const glyph = (name) =>
  `<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPHS[name] || ""}</svg>`;

// ----- Regras de domínio herdadas do pacote publicado (sem alteração de comportamento) -----
// Cadência observada de cada sensor (gaxeta_telemetry_summary → interval_s). Até 12 s vale a
// regra original (25 s / 65 s). Placa que hiberna entre envios é avaliada pelo próprio
// intervalo: transmitindo até 1,5 intervalo + 15 s; atraso até 3 intervalos + 15 s.
const fmtInterval = (seconds) =>
  seconds < 90 ? `${Math.round(seconds)} s` : seconds < 5400 ? `${Math.round(seconds / 60)} min` : `${fmtNum(seconds / 3600, 1)} h`;
function connectionStatus(t, e = Date.now(), intervalS = null) {
  const r = e - new Date(t.last_received_at || 0).getTime();
  const slow = Number(intervalS) > 12;
  const onlineMs = slow ? intervalS * 1500 + 15e3 : 25e3;
  const lateMs = slow ? intervalS * 3000 + 15e3 : 65e3;
  return r < onlineMs
    ? {
        online: !0,
        label: slow ? "Transmitindo · a cada " + fmtInterval(intervalS) : "Transmitindo",
        className: "green",
      }
    : r < lateMs
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
// ----- Leitura elétrica do potenciômetro -----
// A plataforma mostra uma única grandeza de posição: a posição ELÉTRICA do potenciômetro, em %
// da escala elétrica da placa (0 % no mínimo útil, 100 % no máximo útil), e a tensão no pino,
// em volts. Vale com ou sem vínculo a spot. Não há medida em mm, ciclo ou calibração mecânica.
// Tensão em volts a partir de milivolts.
const fmtVolt = (millivolts, digits = 3) => (millivolts == null || !Number.isFinite(Number(millivolts)) ? "—" : fmtNum(Number(millivolts) / 1000, digits) + " V");
// Tensão atual de um sensor, sempre com a origem: calibrada pelo ADC da placa (firmware
// 4.3.0 em diante) ou estimada pela conta ADC × 3,3 ÷ 4095 das versões anteriores.
function voltageInfo(device, live) {
  const calibrated = device?.last_voltage_mv ?? (live?.voltage_source === "calibrated" ? live.voltage_mv : null);
  if (calibrated != null && Number.isFinite(Number(calibrated)))
    return { text: fmtVolt(calibrated), source: "calibrada", short: "calibrada", calibrated: true, title: "Tensão no pino, calibrada pelo ADC da placa: média das mesmas amostras da leitura bruta" };
  if (device?.last_voltage_v == null) return { text: "—", source: "", short: "", calibrated: false, title: "" };
  return { text: fmtNum(device.last_voltage_v, 3) + " V", source: "estimada", short: "estimada", calibrated: false, title: "Estimativa ADC × 3,3 ÷ 4095 (firmware anterior ao 4.3.0, sem a calibração do ADC)" };
}
// Diagnóstico do bloco de amostras da leitura atual (mesma regra de gaxeta_private.adc_block,
// migração 12). O servidor envia `block`; sem o resumo, a tela chega ao mesmo resultado pelos
// campos da leitura. Separa três situações diferentes:
//   ceiling    bloco inteiro em 4095: limite do ADC (100 % da escala elétrica);
//   mixed_high amostras em 4095 junto com amostras muito diferentes: contato, movimento ou circuito;
//   unstable   disperso sem tocar os limites.
function blockOf(adc, noise, min, max) {
  const value = adc == null ? NaN : Number(adc);
  const spread = noise == null ? null : Number(noise);
  const low = min == null ? null : Number(min);
  const high = max == null ? null : Number(max);
  if (!Number.isFinite(value)) return "missing";
  if ((low ?? (value >= 4095 ? 4095 : -1)) >= 4095) return "ceiling";
  if ((high ?? (value <= 0 ? 0 : 1)) <= 0) return "floor";
  const wide = high != null && low != null && (high - low > 400 || (spread ?? 0) > 25);
  if (high != null && high >= 4095 && wide) return "mixed_high";
  if (low != null && low <= 0 && wide) return "mixed_low";
  if ((high != null && high >= 4095) || value >= 4095) return "touch_high";
  if ((low != null && low <= 0) || value <= 0) return "touch_low";
  if (spread == null && low == null) return "unknown";
  if ((spread ?? 0) > 25 || (high != null && low != null && high - low > 400)) return "unstable";
  return "ok";
}
const BLOCK_TEXT = {
  ok: "boa",
  ceiling: "limite do ADC (bloco inteiro em 4095)",
  touch_high: "encosta no limite superior do ADC",
  mixed_high: "bloco misto: amostras em 4095 junto com amostras muito diferentes",
  floor: "limite inferior do ADC (bloco inteiro em zero)",
  touch_low: "encosta no limite inferior do ADC",
  mixed_low: "bloco misto: zeros junto com amostras muito diferentes",
  unstable: "instável (dispersão alta no bloco)",
  unknown: "sem diagnóstico do bloco (firmware anterior ao 4.3.0)",
  missing: "sem leitura",
};
// O que cada condição permite concluir, e só isso.
const BLOCK_HINT = {
  ceiling:
    "O ADC chegou ao teto: acima dele toda tensão vira 4095 e deixa de ser distinguida. A posição aparece como 100 % da escala elétrica; nessa região a resolução é limitada.",
  touch_high: "Parte do bloco chegou a 4095: a posição está na borda superior da faixa que o ADC mede.",
  mixed_high:
    "No mesmo bloco (60 ms) há amostras em 4095 e amostras muito diferentes. Com o eixo parado, confira borne, fio do cursor, alimentação, GND e contato interno do potenciômetro; giro durante a aquisição produz o mesmo efeito. O dado sozinho não prova a causa.",
  floor: "Bloco inteiro em zero: abaixo de cerca de 0,15 V o ADC não distingue a tensão. Confira o extremo baixo e o cursor.",
  touch_low: "Parte do bloco chegou a zero: a posição está na borda inferior da faixa que o ADC mede.",
  mixed_low: "No mesmo bloco há zeros e amostras muito diferentes: confira a ligação do cursor e o GND.",
  unstable:
    "Dispersão alta sem tocar os limites: cursor solto, entrada sem potenciômetro ligado ou giro durante a leitura. Enquanto durar, o percentual não representa uma posição.",
};
const BLOCK_SHORT = {
  ok: "bloco bom", ceiling: "limite do ADC", touch_high: "na borda do limite do ADC", mixed_high: "bloco misto", floor: "limite inferior do ADC",
  touch_low: "na borda inferior do ADC", mixed_low: "bloco misto", unstable: "bloco instável", unknown: "sem diagnóstico do bloco", missing: "sem leitura",
};
// Condição elétrica da leitura atual, como aparece nos cartões, na árvore e em Detalhes.
// key escolhe a cor: electric (leitura boa), limit (saturação: limite do ADC), warn (bloco que
// não representa posição) e unknown (sem leitura).
const BLOCK_QUALITY = {
  ok: { key: "electric", label: "Sinal estável", note: "Leitura atual do potenciômetro" },
  unknown: { key: "electric", label: "Posição elétrica", note: "Firmware sem diagnóstico do bloco" },
  ceiling: { key: "limit", label: "Limite do ADC", note: "100 % da escala elétrica · região saturada, resolução limitada" },
  touch_high: { key: "limit", label: "Na borda do limite do ADC", note: "Parte das amostras chegou a 4095" },
  floor: { key: "limit", label: "Limite inferior do ADC", note: "0 % da escala elétrica · confira o extremo baixo e o cursor" },
  touch_low: { key: "limit", label: "Na borda inferior do ADC", note: "Parte das amostras chegou a zero" },
  mixed_high: { key: "warn", label: "Bloco misto", note: "Amostras no limite junto com outras muito diferentes: confira o cursor e o GND" },
  mixed_low: { key: "warn", label: "Bloco misto", note: "Zeros junto com amostras muito diferentes: confira o cursor e o GND" },
  unstable: { key: "warn", label: "Sinal instável", note: "Cursor solto, sem potenciômetro ou giro durante a leitura: não é posição" },
};
// Escala elétrica do percentual informada pela placa (percent_scale). Sem ela: ADC bruto.
function scaleText(scale) {
  const fixed = /^(mv|adc)-(\d+)-(\d+)$/.exec(scale || "");
  if (!fixed) return scale ? "escala " + scale : "escala do ADC (0 a 4095)";
  return fixed[1] === "mv"
    ? `limites fixos da placa: ${fmtNum(Number(fixed[2]) / 1000, 3)} V = 0 % e ${fmtNum(Number(fixed[3]) / 1000, 3)} V = 100 %`
    : `limites fixos da placa: ${fixed[2]} contagens = 0 % e ${fixed[3]} contagens = 100 %`;
}
// Posição elétrica do sensor: a leitura atual, em % da escala elétrica da placa. `live` é o item
// do resumo de telemetria (opcional). Bloco estável no teto aparece como 100 %, "Limite do ADC".
function electricInfo(device, live) {
  const block = live?.block || (device?.last_adc_raw != null ? blockOf(device.last_adc_raw, device.adc_noise, device.last_adc_min, device.last_adc_max) : device?.last_percent != null ? "unknown" : null);
  const raw = device?.last_percent ?? live?.percent;
  const scale = device?.last_percent_scale ?? live?.percent_scale ?? null;
  if (raw == null || !Number.isFinite(Number(raw))) return { percent: null, text: "—", label: "", block, ceiling: false, scale };
  const ceiling = block === "ceiling";
  const percent = ceiling ? 100 : Math.max(0, Math.min(100, Number(raw)));
  return { percent, text: fmtNum(percent) + " %", label: ceiling ? "Limite do ADC" : block === "floor" ? "Limite inferior do ADC" : "", block, ceiling, scale };
}
// Como apresentar um sensor em qualquer tela: o número é sempre a posição elétrica (%), com a
// condição elétrica da leitura. Não há classificação mecânica nem recomendação de intervenção.
function electricView(device, live) {
  const electric = electricInfo(device, live);
  if (!device || electric.percent == null)
    return { key: "unknown", label: "Sem leitura", note: "Aguardando a primeira leitura da placa", value: "—", unit: "", scale: null, electric };
  const quality = BLOCK_QUALITY[electric.block] || BLOCK_QUALITY.ok;
  return { key: quality.key, label: quality.label, note: quality.note, value: fmtNum(electric.percent), unit: "%", scale: electric.percent, electric };
}
// ----- Modalidade magnética (AS5600 por I²C) -----
// Três grandezas que não se misturam: o ÂNGULO absoluto do ímã (medido, 0 a 4095 = 0° a 359,9°),
// o AVANÇO do preme-gaxeta desde o engaxetamento (calculado, mm) e o CURSO DE AJUSTE RESTANTE
// (calculado, % e mm). Nada aqui usa percentual do ADC, tensão ou milímetro nominal.
const isMagnetic = (device, live) => (live?.modality || device?.last_modality) === "as5600_i2c";
const magDegrees = (raw) => (raw == null || !Number.isFinite(Number(raw)) ? null : (Number(raw) * 360) / 4096);
const fmtDeg = (degrees, digits = 1) => (degrees == null || !Number.isFinite(Number(degrees)) ? "—" : fmtNum(degrees, digits) + "°");
const fmtMm = (value, digits = 1) => (value == null || !Number.isFinite(Number(value)) ? "—" : fmtNum(value, digits) + " mm");
const clampPercent = (value) => Math.max(0, Math.min(100, Number(value)));
// Por que não há curso restante agora, e o que fazer. key escolhe a cor (como na série elétrica).
const MAG_REASON = {
  no_reading: { key: "unknown", label: "Sem leitura", note: "Aguardando a primeira leitura da placa." },
  bus_no_ack: { key: "warn", label: "Sensor sem resposta", note: "O AS5600 não respondeu no I²C. Confira alimentação de 3,3 V, GND e os fios SDA e SCL." },
  bus_read_error: { key: "warn", label: "Falha de leitura I²C", note: "O sensor responde, mas a leitura veio incompleta. Confira solda, cabo e contatos." },
  bus_timeout: { key: "warn", label: "I²C sem resposta a tempo", note: "Barramento travado ou cabo longo demais. Confira o cabo e os pull-ups." },
  no_magnet: { key: "warn", label: "Ímã ausente", note: "O sensor não detecta o ímã. Confira o ímã no eixo e a distância até o chip." },
  field_weak: { key: "warn", label: "Campo fraco", note: "Ímã longe ou descentrado. Aproxime e centralize o ímã." },
  field_strong: { key: "warn", label: "Campo forte", note: "Ímã perto demais do chip. Afaste o ímã." },
  no_link: { key: "electric", label: "Sem vínculo", note: "Ângulo absoluto do sensor. Vincule a um spot para acompanhar o curso." },
  no_geometry: { key: "limit", label: "Sem geometria", note: "O spot ainda não tem montagem caracterizada. Peça à engenharia para vincular a geometria." },
  no_reference: { key: "limit", label: "Sem referência", note: "Informe o curso disponível e toque em Engaxetamento realizado, em Detalhes." },
  awaiting_reference: { key: "limit", label: "Aguardando leitura", note: "Engaxetamento solicitado. Mantenha a haste parada até a confirmação." },
  not_computed: { key: "electric", label: "Ângulo do sensor", note: "Aguardando a próxima leitura para calcular o curso." },
  out_of_range: { key: "warn", label: "Fora da faixa validada", note: "O giro passou do arco ou da tolerância validados. Confira a montagem e registre novo engaxetamento." },
};
// Sem o resumo magnético (banco antigo ou sem permissão), a saúde sai dos campos do próprio sensor.
function magReasonFromDevice(device) {
  if (!device || device.last_bus_status == null) return "no_reading";
  if (device.last_bus_status !== "ok") return "bus_" + device.last_bus_status;
  if (device.last_mag_status === "no_magnet") return "no_magnet";
  if (device.last_mag_status === "weak") return "field_weak";
  if (device.last_mag_status === "strong") return "field_strong";
  return device.measurement_point_id ? "no_reference" : "no_link";
}
// Como apresentar um sensor magnético em cartões, árvore, Detalhes e Telemetria. `mag` é o item
// de gaxeta_mag_summary. O número principal é o Curso de ajuste restante (%), quando existe e é
// válido; sem ele, o ângulo absoluto. Amostra inválida não mostra número: mostra o motivo.
// A barra fica limitada a 0–100 %; o valor com sinal segue em `computed`.
function magView(device, mag) {
  const reading = mag?.reading || null;
  const raw = reading ? reading.raw_angle : (device?.last_raw_angle ?? null);
  const degrees = magDegrees(raw);
  const reason = mag ? mag.reason || null : magReasonFromDevice(device);
  const computed = mag?.computed || null;
  const service = mag?.service || null;
  const electric = { percent: null, text: "—", label: "", block: null, ceiling: false, scale: null };
  const base = { magnetic: true, mag: mag || null, reason, degrees, raw, electric, computed, service, origin: "medido" };
  const info = MAG_REASON[reason] || null;
  if (computed && computed.remaining_percent != null && (!reason || reason === "out_of_range")) {
    const percent = clampPercent(computed.remaining_percent);
    const tags = [service?.course_origin === "estimated" ? "curso estimado" : "", service?.provisional ? "geometria em caracterização" : ""].filter(Boolean);
    return {
      ...base, origin: "calculado", key: info ? info.key : "electric", kicker: "Curso de ajuste restante",
      label: info ? info.label : service?.provisional ? "Provisório" : "Calculado",
      note: info ? info.note : `${fmtMm(computed.remaining_mm)} de ${fmtMm(service?.course_mm)} · avanço ${fmtMm(computed.advance_mm)}` + (tags.length ? " · " + tags.join(" · ") : ""),
      value: fmtNum(percent), unit: "%", scale: percent,
    };
  }
  const sampleBad = reason && /^(bus_|no_magnet|field_|no_reading)/.test(reason);
  return {
    ...base, key: info?.key || "electric", kicker: "Ângulo do sensor", label: info?.label || "Ângulo do sensor", note: info?.note || "Ângulo absoluto do ímã.",
    value: sampleBad || degrees == null ? "—" : fmtNum(degrees), unit: sampleBad || degrees == null ? "" : "°", scale: null,
  };
}
// Identificador da solicitação de engaxetamento: o mesmo em cada nova tentativa do mesmo clique.
const newRequestId = () =>
  globalThis.crypto?.randomUUID?.() ||
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ ((Math.random() * 16) >> (Number(c) / 4))).toString(16));
// Cadência declarada pelo firmware no sufixo da versão: -hib180 (hibernação, um envio a cada
// 180 s) ou -cont30 (contínuo, sem hibernação, um envio a cada 30 s). Versão sem sufixo: contínuo, 10 s.
function firmwareCadence(version) {
  const match = /-(hib|cont)(\d+)$/.exec(version || "");
  if (match) {
    const seconds = Number(match[2]);
    return { seconds, sleeps: match[1] === "hib", text: `${match[1] === "hib" ? "hibernação" : "contínuo, sem hibernação"} · um envio a cada ${fmtInterval(seconds)}` };
  }
  return /^4\.\d+\.\d+$/.test(version || "") ? { seconds: 10, sleeps: false, text: "contínuo, sem hibernação · um envio a cada 10 s" } : null;
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
