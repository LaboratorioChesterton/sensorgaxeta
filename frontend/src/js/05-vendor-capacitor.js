// VENDOR (não editar): núcleo do Capacitor e cliente Bluetooth LE, extraídos do pacote publicado e reformatados.
var Dr;
(function (t) {
  ((t[(t.SCAN_MODE_LOW_POWER = 0)] = "SCAN_MODE_LOW_POWER"),
    (t[(t.SCAN_MODE_BALANCED = 1)] = "SCAN_MODE_BALANCED"),
    (t[(t.SCAN_MODE_LOW_LATENCY = 2)] = "SCAN_MODE_LOW_LATENCY"));
})(Dr || (Dr = {}));
var Ur;
(function (t) {
  ((t[(t.CONNECTION_PRIORITY_BALANCED = 0)] = "CONNECTION_PRIORITY_BALANCED"),
    (t[(t.CONNECTION_PRIORITY_HIGH = 1)] = "CONNECTION_PRIORITY_HIGH"),
    (t[(t.CONNECTION_PRIORITY_LOW_POWER = 2)] = "CONNECTION_PRIORITY_LOW_POWER"));
})(Ur || (Ur = {}));
var Me;
(function (t) {
  ((t.Unimplemented = "UNIMPLEMENTED"), (t.Unavailable = "UNAVAILABLE"));
})(Me || (Me = {}));
class Lt extends Error {
  constructor(e, r, s) {
    (super(e), (this.message = e), (this.code = r), (this.data = s));
  }
}
const Na = (t) => {
    var e, r;
    return t?.androidBridge
      ? "android"
      : !((r = (e = t?.webkit) === null || e === void 0 ? void 0 : e.messageHandlers) === null || r === void 0) && r.bridge
        ? "ios"
        : "web";
  },
  Da = (t) => {
    const e = t.CapacitorCustomPlatform || null,
      r = t.Capacitor || {},
      s = (r.Plugins = r.Plugins || {}),
      n = () => (e !== null ? e.name : Na(t)),
      i = () => n() !== "web",
      a = (p) => {
        const f = c.get(p);
        return !!(f?.platforms.has(n()) || o(p));
      },
      o = (p) => {
        var f;
        return (f = r.PluginHeaders) === null || f === void 0 ? void 0 : f.find((g) => g.name === p);
      },
      l = (p) => t.console.error(p),
      c = new Map(),
      h = (p, f = {}) => {
        const g = c.get(p);
        if (g) return (console.warn(`Capacitor plugin "${p}" already registered. Cannot register plugins twice.`), g.proxy);
        const m = n(),
          w = o(p);
        let v;
        const _ = async () => (
            !v && m in f
              ? (v = typeof f[m] == "function" ? (v = await f[m]()) : (v = f[m]))
              : e !== null && !v && "web" in f && (v = typeof f.web == "function" ? (v = await f.web()) : (v = f.web)),
            v
          ),
          E = (P, I) => {
            var ie, fe;
            if (w) {
              const pe = w?.methods.find((te) => I === te.name);
              if (pe)
                return pe.rtype === "promise"
                  ? (te) => r.nativePromise(p, I.toString(), te)
                  : (te, lt) => r.nativeCallback(p, I.toString(), te, lt);
              if (P) return (ie = P[I]) === null || ie === void 0 ? void 0 : ie.bind(P);
            } else {
              if (P) return (fe = P[I]) === null || fe === void 0 ? void 0 : fe.bind(P);
              throw new Lt(`"${p}" plugin is not implemented on ${m}`, Me.Unimplemented);
            }
          },
          y = (P) => {
            let I;
            const ie = (...fe) => {
              const pe = _().then((te) => {
                const lt = E(te, P);
                if (lt) {
                  const ct = lt(...fe);
                  return ((I = ct?.remove), ct);
                } else throw new Lt(`"${p}.${P}()" is not implemented on ${m}`, Me.Unimplemented);
              });
              return (P === "addListener" && (pe.remove = async () => I()), pe);
            };
            return (
              (ie.toString = () => `${P.toString()}() { [capacitor code] }`),
              Object.defineProperty(ie, "name", {
                value: P,
                writable: !1,
                configurable: !1,
              }),
              ie
            );
          },
          T = y("addListener"),
          N = y("removeListener"),
          R = (P, I) => {
            const ie = T(
                {
                  eventName: P,
                },
                I,
              ),
              fe = async () => {
                const te = await ie;
                N(
                  {
                    eventName: P,
                    callbackId: te,
                  },
                  I,
                );
              },
              pe = new Promise((te) =>
                ie.then(() =>
                  te({
                    remove: fe,
                  }),
                ),
              );
            return (
              (pe.remove = async () => {
                (console.warn("Using addListener() without 'await' is deprecated."), await fe());
              }),
              pe
            );
          },
          x = new Proxy(
            {},
            {
              get(P, I) {
                switch (I) {
                  case "$$typeof":
                    return;
                  case "toJSON":
                    return () => ({});
                  case "addListener":
                    return w ? R : T;
                  case "removeListener":
                    return N;
                  default:
                    return y(I);
                }
              },
            },
          );
        return (
          (s[p] = x),
          c.set(p, {
            name: p,
            proxy: x,
            platforms: new Set([...Object.keys(f), ...(w ? [m] : [])]),
          }),
          x
        );
      };
    return (
      r.convertFileSrc || (r.convertFileSrc = (p) => p),
      (r.getPlatform = n),
      (r.handleError = l),
      (r.isNativePlatform = i),
      (r.isPluginAvailable = a),
      (r.registerPlugin = h),
      (r.Exception = Lt),
      (r.DEBUG = !!r.DEBUG),
      (r.isLoggingEnabled = !!r.isLoggingEnabled),
      r
    );
  },
  Ua = (t) => (t.Capacitor = Da(t)),
  Z = Ua(
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : typeof global < "u"
            ? global
            : {},
  ),
  Ge = Z.registerPlugin;
class ir {
  constructor() {
    ((this.listeners = {}), (this.retainedEventArguments = {}), (this.windowListeners = {}));
  }
  addListener(e, r) {
    let s = !1;
    (this.listeners[e] || ((this.listeners[e] = []), (s = !0)), this.listeners[e].push(r));
    const i = this.windowListeners[e];
    (i && !i.registered && this.addWindowListener(i), s && this.sendRetainedArgumentsForEvent(e));
    const a = async () => this.removeListener(e, r);
    return Promise.resolve({
      remove: a,
    });
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const e in this.windowListeners) this.removeWindowListener(this.windowListeners[e]);
    this.windowListeners = {};
  }
  notifyListeners(e, r, s) {
    const n = this.listeners[e];
    if (!n) {
      if (s) {
        let i = this.retainedEventArguments[e];
        (i || (i = []), i.push(r), (this.retainedEventArguments[e] = i));
      }
      return;
    }
    n.forEach((i) => i(r));
  }
  hasListeners(e) {
    var r;
    return !!(!((r = this.listeners[e]) === null || r === void 0) && r.length);
  }
  registerWindowListener(e, r) {
    this.windowListeners[r] = {
      registered: !1,
      windowEventName: e,
      pluginEventName: r,
      handler: (s) => {
        this.notifyListeners(r, s);
      },
    };
  }
  unimplemented(e = "not implemented") {
    return new Z.Exception(e, Me.Unimplemented);
  }
  unavailable(e = "not available") {
    return new Z.Exception(e, Me.Unavailable);
  }
  async removeListener(e, r) {
    const s = this.listeners[e];
    if (!s) return;
    const n = s.indexOf(r);
    (this.listeners[e].splice(n, 1), this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]));
  }
  addWindowListener(e) {
    (window.addEventListener(e.windowEventName, e.handler), (e.registered = !0));
  }
  removeWindowListener(e) {
    e && (window.removeEventListener(e.windowEventName, e.handler), (e.registered = !1));
  }
  sendRetainedArgumentsForEvent(e) {
    const r = this.retainedEventArguments[e];
    r &&
      (delete this.retainedEventArguments[e],
      r.forEach((s) => {
        this.notifyListeners(e, s);
      }));
  }
}
const Br = (t) =>
    encodeURIComponent(t)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape),
  qr = (t) => t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class Ba extends ir {
  async getCookies() {
    const e = document.cookie,
      r = {};
    return (
      e.split(";").forEach((s) => {
        if (s.length <= 0) return;
        let [n, i] = s.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        ((n = qr(n).trim()), (i = qr(i).trim()), (r[n] = i));
      }),
      r
    );
  }
  async setCookie(e) {
    try {
      const r = Br(e.key),
        s = Br(e.value),
        n = `; expires=${(e.expires || "").replace("expires=", "")}`,
        i = (e.path || "/").replace("path=", ""),
        a = e.url != null && e.url.length > 0 ? `domain=${e.url}` : "";
      document.cookie = `${r}=${s || ""}${n}; path=${i}; ${a};`;
    } catch (r) {
      return Promise.reject(r);
    }
  }
  async deleteCookie(e) {
    try {
      document.cookie = `${e.key}=; Max-Age=0`;
    } catch (r) {
      return Promise.reject(r);
    }
  }
  async clearCookies() {
    try {
      const e = document.cookie.split(";") || [];
      for (const r of e) document.cookie = r.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
Ge("CapacitorCookies", {
  web: () => new Ba(),
});
const qa = async (t) =>
    new Promise((e, r) => {
      const s = new FileReader();
      ((s.onload = () => {
        const n = s.result;
        e(n.indexOf(",") >= 0 ? n.split(",")[1] : n);
      }),
        (s.onerror = (n) => r(n)),
        s.readAsDataURL(t));
    }),
  Ma = (t = {}) => {
    const e = Object.keys(t);
    return Object.keys(t)
      .map((n) => n.toLocaleLowerCase())
      .reduce((n, i, a) => ((n[i] = t[e[a]]), n), {});
  },
  Fa = (t, e = !0) =>
    t
      ? Object.entries(t)
          .reduce((s, n) => {
            const [i, a] = n;
            let o, l;
            return (
              Array.isArray(a)
                ? ((l = ""),
                  a.forEach((c) => {
                    ((o = e ? encodeURIComponent(c) : c), (l += `${i}=${o}&`));
                  }),
                  l.slice(0, -1))
                : ((o = e ? encodeURIComponent(a) : a), (l = `${i}=${o}`)),
              `${s}&${l}`
            );
          }, "")
          .substr(1)
      : null,
  Va = (t, e = {}) => {
    const r = Object.assign(
        {
          method: t.method || "GET",
          headers: t.headers,
        },
        e,
      ),
      n = Ma(t.headers)["content-type"] || "";
    if (typeof t.data == "string") r.body = t.data;
    else if (n.includes("application/x-www-form-urlencoded")) {
      const i = new URLSearchParams();
      for (const [a, o] of Object.entries(t.data || {})) i.set(a, o);
      r.body = i.toString();
    } else if (n.includes("multipart/form-data") || t.data instanceof FormData) {
      const i = new FormData();
      if (t.data instanceof FormData)
        t.data.forEach((o, l) => {
          i.append(l, o);
        });
      else for (const o of Object.keys(t.data)) i.append(o, t.data[o]);
      r.body = i;
      const a = new Headers(r.headers);
      (a.delete("content-type"), (r.headers = a));
    } else (n.includes("application/json") || typeof t.data == "object") && (r.body = JSON.stringify(t.data));
    return r;
  };
class Wa extends ir {
  async request(e) {
    const r = Va(e, e.webFetchExtra),
      s = Fa(e.params, e.shouldEncodeUrlParams),
      n = s ? `${e.url}?${s}` : e.url,
      i = await fetch(n, r),
      a = i.headers.get("content-type") || "";
    let { responseType: o = "text" } = i.ok ? e : {};
    a.includes("application/json") && (o = "json");
    let l, c;
    switch (o) {
      case "arraybuffer":
      case "blob":
        ((c = await i.blob()), (l = await qa(c)));
        break;
      case "json":
        l = await i.json();
        break;
      default:
        l = await i.text();
    }
    const h = {};
    return (
      i.headers.forEach((p, f) => {
        h[f] = p;
      }),
      {
        data: l,
        headers: h,
        status: i.status,
        url: i.url,
      }
    );
  }
  async get(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "GET",
      }),
    );
  }
  async post(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "POST",
      }),
    );
  }
  async put(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "PUT",
      }),
    );
  }
  async patch(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "PATCH",
      }),
    );
  }
  async delete(e) {
    return this.request(
      Object.assign(Object.assign({}, e), {
        method: "DELETE",
      }),
    );
  }
}
Ge("CapacitorHttp", {
  web: () => new Wa(),
});
var Mr;
(function (t) {
  ((t.Dark = "DARK"), (t.Light = "LIGHT"), (t.Default = "DEFAULT"));
})(Mr || (Mr = {}));
var Fr;
(function (t) {
  ((t.StatusBar = "StatusBar"), (t.NavigationBar = "NavigationBar"));
})(Fr || (Fr = {}));
class Ha extends ir {
  async setStyle() {
    this.unavailable("not available for web");
  }
  async setAnimation() {
    this.unavailable("not available for web");
  }
  async show() {
    this.unavailable("not available for web");
  }
  async hide() {
    this.unavailable("not available for web");
  }
}
Ge("SystemBars", {
  web: () => new Ha(),
});
function Ka(t) {
  return new DataView(Uint8Array.from(t).buffer);
}
function za(t) {
  return Array.from(new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
}
function Ga(t) {
  return `0000${t.toString(16).padStart(4, "0")}-0000-1000-8000-00805f9b34fb`;
}
function hs(t) {
  const e = [];
  let r,
    s,
    n = 1,
    i = 0;
  for (r = 0; r < t.length; r++)
    ((s = t.charCodeAt(r)),
      ((s > 47 && s < 58) || (s > 64 && s < 71) || (s > 96 && s < 103)) &&
        ((i = (i << 4) ^ ((s > 64 ? s + 9 : s) & 15)), (n ^= 1) && e.push(i & 255)));
  return Ka(e);
}
function Qe(t) {
  return za(t)
    .map((e) => {
      let r = e.toString(16);
      return (r.length == 1 && (r = "0" + r), r);
    })
    .join("");
}
function _o(t) {
  if (typeof t == "string") return t;
  if (typeof t == "number") return Ga(t);
  throw new Error("Invalid UUID");
}
function bo(t) {
  const e = {};
  if (t)
    return (
      t.forEach((r, s) => {
        e[s.toString()] = r;
      }),
      e
    );
}
function Vr(t) {
  if (t !== void 0) {
    if (typeof t == "string") {
      const e = hs(t);
      return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
    }
    return t instanceof DataView ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : t;
  }
}
function pt(t) {
  if (t !== void 0) return t instanceof DataView ? Qe(t) : Qe(new DataView(t.buffer, t.byteOffset, t.byteLength));
}
function Eo(t) {
  if (t.buffer instanceof SharedArrayBuffer) {
    const r = new Uint8Array(t.buffer, t.byteOffset, t.byteLength).slice().buffer;
    return new DataView(r);
  }
  return t;
}
const Ja = "modulepreload",
  Ya = function (t, e) {
    return new URL(t, e).href;
  },
  Wr = {},
  ar = function (e, r, s) {
    let n = Promise.resolve();
    if (r && r.length > 0) {
      let c = function (h) {
        return Promise.all(
          h.map((p) =>
            Promise.resolve(p).then(
              (f) => ({
                status: "fulfilled",
                value: f,
              }),
              (f) => ({
                status: "rejected",
                reason: f,
              }),
            ),
          ),
        );
      };
      const a = document.getElementsByTagName("link"),
        o = document.querySelector("meta[property=csp-nonce]"),
        l = o?.nonce || o?.getAttribute("nonce");
      n = c(
        r.map((h) => {
          if (((h = Ya(h, s)), h in Wr)) return;
          Wr[h] = !0;
          const p = h.endsWith(".css"),
            f = p ? '[rel="stylesheet"]' : "";
          if (s)
            for (let m = a.length - 1; m >= 0; m--) {
              const w = a[m];
              if (w.href === h && (!p || w.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${h}"]${f}`)) return;
          const g = document.createElement("link");
          if (
            ((g.rel = p ? "stylesheet" : Ja),
            p || (g.as = "script"),
            (g.crossOrigin = ""),
            (g.href = h),
            l && g.setAttribute("nonce", l),
            document.head.appendChild(g),
            p)
          )
            return new Promise((m, w) => {
              (g.addEventListener("load", m), g.addEventListener("error", () => w(new Error(`Unable to preload CSS for ${h}`))));
            });
        }),
      );
    }
    function i(a) {
      const o = new Event("vite:preloadError", {
        cancelable: !0,
      });
      if (((o.payload = a), window.dispatchEvent(o), !o.defaultPrevented)) throw a;
    }
    return n.then((a) => {
      for (const o of a || []) o.status === "rejected" && i(o.reason);
      return e().catch(i);
    });
  },
  O = Ge("BluetoothLe", {
    web: () => ar(() => import("./web-DEeSqGRi.js"), [], import.meta.url).then((t) => new t.BluetoothLeWeb()),
  }),
  Xa = () => {
    let t = Promise.resolve();
    return (e) =>
      new Promise((r, s) => {
        t = t
          .then(() => e())
          .then(r)
          .catch(s);
      });
  };
function Nt(t) {
  return t ? Xa() : (e) => e();
}
function D(t) {
  if (typeof t != "string") throw new Error(`Invalid UUID type ${typeof t}. Expected string.`);
  if (((t = t.toLowerCase()), !(t.search(/^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/) >= 0)))
    throw new Error(`Invalid UUID format ${t}. Expected 128 bit string (e.g. "0000180d-0000-1000-8000-00805f9b34fb").`);
  return t;
}
class Qa {
  constructor() {
    ((this.scanListener = null), (this.eventListeners = new Map()), (this.queue = Nt(!0)));
  }
  enableQueue() {
    this.queue = Nt(!0);
  }
  disableQueue() {
    this.queue = Nt(!1);
  }
  async initialize(e) {
    await this.queue(async () => {
      await O.initialize(e);
    });
  }
  async isEnabled() {
    return await this.queue(async () => (await O.isEnabled()).value);
  }
  async requestEnable() {
    await this.queue(async () => {
      await O.requestEnable();
    });
  }
  async enable() {
    await this.queue(async () => {
      await O.enable();
    });
  }
  async disable() {
    await this.queue(async () => {
      await O.disable();
    });
  }
  async startEnabledNotifications(e) {
    await this.queue(async () => {
      var r;
      const s = "onEnabledChanged";
      await ((r = this.eventListeners.get(s)) === null || r === void 0 ? void 0 : r.remove());
      const n = await O.addListener(s, (i) => {
        e(i.value);
      });
      (this.eventListeners.set(s, n), await O.startEnabledNotifications());
    });
  }
  async stopEnabledNotifications() {
    await this.queue(async () => {
      var e;
      const r = "onEnabledChanged";
      (await ((e = this.eventListeners.get(r)) === null || e === void 0 ? void 0 : e.remove()),
        this.eventListeners.delete(r),
        await O.stopEnabledNotifications());
    });
  }
  async isLocationEnabled() {
    return await this.queue(async () => (await O.isLocationEnabled()).value);
  }
  async openLocationSettings() {
    await this.queue(async () => {
      await O.openLocationSettings();
    });
  }
  async openBluetoothSettings() {
    await this.queue(async () => {
      await O.openBluetoothSettings();
    });
  }
  async openAppSettings() {
    await this.queue(async () => {
      await O.openAppSettings();
    });
  }
  async setDisplayStrings(e) {
    await this.queue(async () => {
      await O.setDisplayStrings(e);
    });
  }
  async requestDevice(e) {
    return ((e = e ? this.validateRequestBleDeviceOptions(e) : void 0), await this.queue(async () => await O.requestDevice(e)));
  }
  async requestLEScan(e, r) {
    ((e = this.validateRequestBleDeviceOptions(e)),
      await this.queue(async () => {
        var s;
        (await ((s = this.scanListener) === null || s === void 0 ? void 0 : s.remove()),
          (this.scanListener = await O.addListener("onScanResult", (n) => {
            const i = Object.assign(Object.assign({}, n), {
              manufacturerData: this.convertObject(n.manufacturerData),
              serviceData: this.convertObject(n.serviceData),
              rawAdvertisement: n.rawAdvertisement ? this.convertValue(n.rawAdvertisement) : void 0,
            });
            r(i);
          })),
          await O.requestLEScan(e));
      }));
  }
  async stopLEScan() {
    await this.queue(async () => {
      var e;
      (await ((e = this.scanListener) === null || e === void 0 ? void 0 : e.remove()),
        (this.scanListener = null),
        await O.stopLEScan());
    });
  }
  async getDevices(e) {
    if (!Array.isArray(e)) throw new Error("deviceIds must be an array");
    return this.queue(
      async () =>
        (
          await O.getDevices({
            deviceIds: e,
          })
        ).devices,
    );
  }
  async getConnectedDevices(e) {
    if (!Array.isArray(e)) throw new Error("services must be an array");
    return (
      (e = e.map(D)),
      this.queue(
        async () =>
          (
            await O.getConnectedDevices({
              services: e,
            })
          ).devices,
      )
    );
  }
  async getBondedDevices() {
    return this.queue(async () => (await O.getBondedDevices()).devices);
  }
  async connect(e, r, s) {
    await this.queue(async () => {
      var n;
      if (r) {
        const i = `disconnected|${e}`;
        await ((n = this.eventListeners.get(i)) === null || n === void 0 ? void 0 : n.remove());
        const a = await O.addListener(i, () => {
          r(e);
        });
        this.eventListeners.set(i, a);
      }
      await O.connect(
        Object.assign(
          {
            deviceId: e,
          },
          s,
        ),
      );
    });
  }
  async createBond(e, r) {
    await this.queue(async () => {
      await O.createBond(
        Object.assign(
          {
            deviceId: e,
          },
          r,
        ),
      );
    });
  }
  async isBonded(e) {
    return await this.queue(
      async () =>
        (
          await O.isBonded({
            deviceId: e,
          })
        ).value,
    );
  }
  async disconnect(e) {
    await this.queue(async () => {
      await O.disconnect({
        deviceId: e,
      });
    });
  }
  async getServices(e) {
    return await this.queue(
      async () =>
        (
          await O.getServices({
            deviceId: e,
          })
        ).services,
    );
  }
  async discoverServices(e) {
    await this.queue(async () => {
      await O.discoverServices({
        deviceId: e,
      });
    });
  }
  async getMtu(e) {
    return await this.queue(
      async () =>
        (
          await O.getMtu({
            deviceId: e,
          })
        ).value,
    );
  }
  async requestConnectionPriority(e, r) {
    await this.queue(async () => {
      await O.requestConnectionPriority({
        deviceId: e,
        connectionPriority: r,
      });
    });
  }
  async readRssi(e) {
    return await this.queue(async () => {
      const s = await O.readRssi({
        deviceId: e,
      });
      return parseFloat(s.value);
    });
  }
  async read(e, r, s, n) {
    return (
      (r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        const a = await O.read(
          Object.assign(
            {
              deviceId: e,
              service: r,
              characteristic: s,
            },
            n,
          ),
        );
        return this.convertValue(a.value);
      })
    );
  }
  async write(e, r, s, n, i) {
    return (
      (r = D(r)),
      (s = D(s)),
      this.queue(async () => {
        if (!n?.buffer) throw new Error("Invalid data.");
        let a = n;
        (Z.getPlatform() !== "web" && (a = Qe(n)),
          await O.write(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                value: a,
              },
              i,
            ),
          ));
      })
    );
  }
  async writeWithoutResponse(e, r, s, n, i) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        if (!n?.buffer) throw new Error("Invalid data.");
        let a = n;
        (Z.getPlatform() !== "web" && (a = Qe(n)),
          await O.writeWithoutResponse(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                value: a,
              },
              i,
            ),
          ));
      }));
  }
  async readDescriptor(e, r, s, n, i) {
    return (
      (r = D(r)),
      (s = D(s)),
      (n = D(n)),
      await this.queue(async () => {
        const o = await O.readDescriptor(
          Object.assign(
            {
              deviceId: e,
              service: r,
              characteristic: s,
              descriptor: n,
            },
            i,
          ),
        );
        return this.convertValue(o.value);
      })
    );
  }
  async writeDescriptor(e, r, s, n, i, a) {
    return (
      (r = D(r)),
      (s = D(s)),
      (n = D(n)),
      this.queue(async () => {
        if (!i?.buffer) throw new Error("Invalid data.");
        let o = i;
        (Z.getPlatform() !== "web" && (o = Qe(i)),
          await O.writeDescriptor(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
                descriptor: n,
                value: o,
              },
              a,
            ),
          ));
      })
    );
  }
  async startNotifications(e, r, s, n, i) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        var a;
        const o = `notification|${e}|${r}|${s}`;
        await ((a = this.eventListeners.get(o)) === null || a === void 0 ? void 0 : a.remove());
        const l = await O.addListener(o, (c) => {
          n(this.convertValue(c?.value));
        });
        (this.eventListeners.set(o, l),
          await O.startNotifications(
            Object.assign(
              {
                deviceId: e,
                service: r,
                characteristic: s,
              },
              i,
            ),
          ));
      }));
  }
  async stopNotifications(e, r, s) {
    ((r = D(r)),
      (s = D(s)),
      await this.queue(async () => {
        var n;
        const i = `notification|${e}|${r}|${s}`;
        (await ((n = this.eventListeners.get(i)) === null || n === void 0 ? void 0 : n.remove()),
          this.eventListeners.delete(i),
          await O.stopNotifications({
            deviceId: e,
            service: r,
            characteristic: s,
          }));
      }));
  }
  validateRequestBleDeviceOptions(e) {
    return (
      e.services && (e.services = e.services.map(D)),
      e.optionalServices && (e.optionalServices = e.optionalServices.map(D)),
      e.serviceData &&
        Z.getPlatform() !== "web" &&
        (e.serviceData = e.serviceData.map((r) =>
          Object.assign(Object.assign({}, r), {
            serviceUuid: D(r.serviceUuid),
            dataPrefix: pt(r.dataPrefix),
            mask: pt(r.mask),
          }),
        )),
      e.manufacturerData &&
        (Z.getPlatform() !== "web"
          ? (e.manufacturerData = e.manufacturerData.map((r) =>
              Object.assign(Object.assign({}, r), {
                dataPrefix: pt(r.dataPrefix),
                mask: pt(r.mask),
              }),
            ))
          : (e.manufacturerData = e.manufacturerData.map((r) =>
              Object.assign(Object.assign({}, r), {
                dataPrefix: Vr(r.dataPrefix),
                mask: Vr(r.mask),
              }),
            ))),
      e
    );
  }
  convertValue(e) {
    return typeof e == "string" ? hs(e) : e === void 0 ? new DataView(new ArrayBuffer(0)) : e;
  }
  convertObject(e) {
    if (e === void 0) return;
    const r = {};
    for (const s of Object.keys(e)) r[s] = this.convertValue(e[s]);
    return r;
  }
}
const BleClient = new Qa();
