// Bluetooth local (herdado do pacote publicado; nenhum comando é enviado sem ação do operador).
const BLE_SERVICE = "7a1e0001-9b3c-4d2e-8f10-123456789001",
  BLE_CHAR_READING = "7a1e0002-9b3c-4d2e-8f10-123456789001",
  BLE_CHAR_NAME = "7a1e0003-9b3c-4d2e-8f10-123456789001",
  bleDecode = (t) => new TextDecoder().decode(new Uint8Array(t.buffer, t.byteOffset, t.byteLength)),
  bleEncode = (t) => {
    const e = new TextEncoder().encode(t);
    return new DataView(e.buffer, e.byteOffset, e.byteLength);
  };
let bleInitialized = !1,
  bleDevice = null,
  bleTimer = null,
  bleOnReading = () => {},
  bleOnStatus = () => {},
  bleScanTimer = null,
  bleReading = !1;
async function bleInit() {
  bleInitialized ||
    (await BleClient.initialize({
      androidNeverForLocation: !0,
    }),
    (bleInitialized = !0));
}
const bleCurrent = () => bleDevice;
async function bleStopScan() {
  (clearTimeout(bleScanTimer), await BleClient.stopLEScan().catch(() => {}));
}
async function bleScan(t, e) {
  if ((await bleInit(), await bleStopScan(), !Z.isNativePlatform())) {
    const r = await BleClient.requestDevice({
      services: [BLE_SERVICE],
    });
    (t(r), e("Sensor selecionado. Toque em Conectar."));
    return;
  }
  (await BleClient.requestLEScan(
    {
      services: [BLE_SERVICE],
      allowDuplicates: !1,
    },
    (r) =>
      t({
        ...r.device,
        rssi: r.rssi,
      }),
  ),
    e("Buscando sensores próximos…"),
    (bleScanTimer = setTimeout(async () => {
      (await bleStopScan(), e("Busca concluída. Selecione um sensor ou busque novamente."));
    }, 8e3)));
}
function bleDropped() {
  (clearInterval(bleTimer),
    (bleTimer = null),
    (bleDevice = null),
    bleOnStatus("Bluetooth desconectado. A última leitura local foi preservada."));
}
async function bleDisconnect() {
  const t = bleDevice;
  (bleDropped(), t && (await BleClient.disconnect(t.deviceId).catch(() => {})));
}
async function bleConnect(t, e, r) {
  (await bleInit(),
    await bleStopScan(),
    await bleDisconnect(),
    (bleOnReading = e),
    (bleOnStatus = r),
    r("Conectando ao sensor…"),
    await BleClient.connect(t.deviceId, bleDropped, {
      timeout: 2e4,
    }),
    (bleDevice = t));
  try {
    (await bleReadOnce(),
      await BleClient.startNotifications(t.deviceId, BLE_SERVICE, BLE_CHAR_READING, (s) => bleParse(s)).catch(() => {}),
      (bleTimer = setInterval(() => bleReadOnce().catch(() => bleOnStatus("Falha na leitura local; tentando novamente.")), 5e3)),
      r("Bluetooth conectado. Leitura local a cada 5 segundos."));
  } catch (s) {
    throw (await bleDisconnect(), s);
  }
}
function bleParse(t) {
  const e = JSON.parse(bleDecode(t));
  if (typeof e != "object" || e === null) throw Error("Resposta BLE inválida.");
  bleOnReading(e, bleDevice);
}
async function bleReadOnce() {
  if (!(!bleDevice || bleReading)) {
    bleReading = !0;
    try {
      const t = bleDevice.deviceId,
        e = await BleClient.read(t, BLE_SERVICE, BLE_CHAR_READING);
      bleDevice?.deviceId === t && bleParse(e);
    } finally {
      bleReading = !1;
    }
  }
}
async function bleWriteName(t, e, r) {
  if (!bleDevice) throw Error("Conecte o sensor por Bluetooth.");
  if (!e || r !== e) throw Error("O sensor Bluetooth não corresponde ao sensor selecionado. Confira o ID.");
  if (!isValidSensorName(t)) throw Error("Nome inválido. Use de 3 a 24 caracteres sem acentos.");
  const s = bleDevice.deviceId;
  (Z.getPlatform() === "android" &&
    !(await BleClient.isBonded(s)) &&
    (await BleClient.createBond(s, {
      timeout: 3e4,
    })),
    await BleClient.read(s, BLE_SERVICE, BLE_CHAR_NAME, {
      timeout: 3e4,
    }),
    await BleClient.write(s, BLE_SERVICE, BLE_CHAR_NAME, bleEncode(t), {
      timeout: 1e4,
    }));
  for (let n = 0; n < 8; n++) {
    await new Promise((a) => setTimeout(a, 300));
    const i = bleDecode(await BleClient.read(s, BLE_SERVICE, BLE_CHAR_NAME));
    if (i === t) return i;
  }
  throw Error("A placa ainda não confirmou o nome. Confira o PIN e tente novamente.");
}
async function bleIdentify() {
  if (!bleDevice) throw Error("Conecte um sensor.");
  (Z.getPlatform() === "android" &&
    !(await BleClient.isBonded(bleDevice.deviceId)) &&
    (await BleClient.createBond(bleDevice.deviceId, {
      timeout: 3e4,
    })),
    await BleClient.read(bleDevice.deviceId, BLE_SERVICE, BLE_CHAR_NAME, {
      timeout: 3e4,
    }),
    await BleClient.write(bleDevice.deviceId, BLE_SERVICE, BLE_CHAR_NAME, bleEncode("identify")));
}
