// VENDOR (não editar): registro dos plugins Filesystem e Share do Capacitor.
function ao(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, r) {
        return new Proxy(
          {},
          {
            get(s, n) {
              return (i, a, o) => {
                const l = t.Capacitor.Plugins[r];
                if (l === void 0) {
                  o(new Error(`Capacitor plugin ${r} not found`));
                  return;
                }
                if (typeof l[n] != "function") {
                  o(new Error(`Method ${n} not found in Capacitor plugin ${r}`));
                  return;
                }
                (async () => {
                  try {
                    const c = await l[n](i);
                    a(c);
                  } catch (c) {
                    o(c);
                  }
                })();
              };
            },
          },
        );
      },
    },
  );
}
function oo(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, r) {
        return t.cordova.plugins[r];
      },
    },
  );
}
function lo(t = !1) {
  typeof window > "u" ||
    ((window.CapacitorUtils = window.CapacitorUtils || {}),
    window.Capacitor !== void 0 && !t ? ao(window) : window.cordova !== void 0 && oo(window));
}
var FsDirectory;
(function (t) {
  ((t.Documents = "DOCUMENTS"),
    (t.Data = "DATA"),
    (t.Library = "LIBRARY"),
    (t.Cache = "CACHE"),
    (t.External = "EXTERNAL"),
    (t.ExternalStorage = "EXTERNAL_STORAGE"),
    (t.ExternalCache = "EXTERNAL_CACHE"),
    (t.LibraryNoCloud = "LIBRARY_NO_CLOUD"),
    (t.Temporary = "TEMPORARY"));
})(FsDirectory || (FsDirectory = {}));
var Zt;
(function (t) {
  ((t.UTF8 = "utf8"), (t.ASCII = "ascii"), (t.UTF16 = "utf16"));
})(Zt || (Zt = {}));
const FilesystemPlugin = Ge("Filesystem", {
  web: () => ar(() => import("./web-8iTD2sZM.js"), [], import.meta.url).then((t) => new t.FilesystemWeb()),
});
lo();
const SharePlugin = Ge("Share", {
  web: () => ar(() => import("./web-BfBGDy75.js"), [], import.meta.url).then((t) => new t.ShareWeb()),
});
