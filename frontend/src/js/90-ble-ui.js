// =============================================================================
// Buscar sensor por Bluetooth (só no aplicativo nativo, com o plugin embarcado).
//   * Só abre e só procura por toque: abrir o aplicativo ou trocar de tela nunca inicia busca
//     nem envia comando à placa. Na web, a entrada e o diálogo são removidos (95-boot.js).
//   * Estados com texto próprio: Bluetooth desligado, permissão negada, procurando, nenhum
//     sensor encontrado, conectando, conectado e desconectado. Dá para cancelar e repetir.
//   * A busca para ao fechar o diálogo, ao trocar de tela e quando o aplicativo vai para o
//     fundo; a conexão é liberada se ele ficar no fundo por mais de 30 s.
//   * Origem dos dados à vista: a leitura LOCAL (ângulo e saúde do AS5600, pelo Bluetooth) ao
//     lado da última leitura da NUVEM (o que a placa enviou por Wi-Fi), cada uma com o horário.
//     O celular não reenvia nada à nuvem: a ingestão continua sendo só a da placa.
//   * O vínculo ao spot continua passando pelo fluxo autorizado da plataforma.
// =============================================================================
const bleUi = { phase: "idle", devices: new Map(), detail: "", cloudFor: "", cloudAt: 0, cloudError: "", cloudKnown: null, hiddenTimer: null, run: 0 };
const BLE_PHASE = {
  idle: ["", "Pronto para buscar. Aproxime o celular da placa."],
  checking: ["is-busy", "Conferindo o Bluetooth do aparelho…"],
  off: ["is-warn", "Bluetooth desligado. Ligue o Bluetooth do celular e toque em Buscar de novo."],
  denied: ["is-error", "Permissão negada. Sem a permissão de dispositivos próximos o aplicativo não encontra a placa."],
  location: ["is-warn", "Localização desligada. Nesta versão do Android a busca Bluetooth só funciona com a localização ligada."],
  unavailable: ["is-error", "Bluetooth indisponível neste aparelho."],
  scanning: ["is-busy", "Procurando sensores próximos…"],
  none: ["is-warn", "Nenhum sensor encontrado. Confira se a placa está ligada e perto do celular (até uns 5 m) e busque de novo."],
  found: ["", "Busca concluída. Toque no sensor para conectar, ou busque de novo."],
  connecting: ["is-busy", "Conectando ao sensor…"],
  connected: ["is-ok", "Conectado. Leitura local a cada 5 segundos."],
  disconnected: ["is-warn", "Desconectado. A última leitura local continua na tela."],
  error: ["is-error", ""],
};
function setBlePhase(phase, detail = "") {
  Object.assign(bleUi, { phase, detail });
  renderBle();
}
function renderBle() {
  if (!$id("bleStatus")) return;
  const [kind, text] = BLE_PHASE[bleUi.phase] || BLE_PHASE.idle;
  const status = $id("bleStatus");
  status.className = "ble-state " + kind;
  status.textContent = bleUi.detail || text;
  const connected = !!bleCurrent();
  const scanning = bleUi.phase === "scanning" || bleUi.phase === "checking";
  $id("scanBle").hidden = scanning || bleUi.phase === "connecting";
  $id("scanBleLabel").textContent = ["idle", "checking", "scanning"].includes(bleUi.phase) ? "Buscar sensores" : "Buscar de novo";
  $id("cancelBle").hidden = bleUi.phase !== "scanning";
  $id("disconnectBle").hidden = !connected;
  $id("identifyBle").disabled = !connected;
  // Atalhos para resolver o que impede a busca, sem sair procurando nos ajustes.
  $id("bleHelp").innerHTML =
    bleUi.phase === "off"
      ? `<button class="secondary compact" type="button" data-ble-help="bluetooth">Abrir ajustes de Bluetooth</button>`
      : bleUi.phase === "denied"
        ? `<button class="secondary compact" type="button" data-ble-help="app">Abrir permissões do aplicativo</button>`
        : bleUi.phase === "location"
          ? `<button class="secondary compact" type="button" data-ble-help="location">Abrir ajustes de localização</button>`
          : "";
  $id("bleDevices").innerHTML = [...bleUi.devices.values()]
    .map(
      (item) =>
        `<button class="ble-device" data-ble="${esc(item.deviceId)}"${bleUi.phase === "connecting" ? " disabled" : ""}><span><strong>${esc(item.name || item.localName || "Sensor Gaxeta")}</strong>` +
        `<small>${esc(item.deviceId)}${item.rssi == null ? "" : ` · sinal ${item.rssi} dBm`}</small></span>${bleCurrent()?.deviceId === item.deviceId ? "Conectado" : "Conectar →"}</button>`,
    )
    .join("");
}
function openBleDialog({ scan = false } = {}) {
  if (!bleAvailable() || !$id("bleDialog")) return;
  if (!$id("bleDialog").open) $id("bleDialog").showModal();
  renderBle();
  if (scan) startBleScan();
}
function closeBleDialog() {
  const dialog = $id("bleDialog");
  if (dialog?.open) dialog.close();
}
// Busca: confere permissão e Bluetooth, procura por 8 s e mostra o que achou (ou que não achou).
async function startBleScan() {
  if (bleUi.phase === "scanning" || bleUi.phase === "checking" || bleUi.phase === "connecting") return;
  const run = ++bleUi.run;
  bleUi.devices.clear();
  setBlePhase("checking");
  const ready = await blePrepare();
  if (run !== bleUi.run) return;
  if (!ready.ok) return setBlePhase(ready.kind, ready.kind === "unavailable" && ready.message ? "Bluetooth indisponível: " + ready.message : "");
  try {
    setBlePhase("scanning");
    await bleScan(
      (found) => {
        if (run !== bleUi.run) return;
        bleUi.devices.set(found.deviceId, found);
        renderBle();
      },
      () => {},
      () => {
        if (run === bleUi.run && bleUi.phase === "scanning") setBlePhase(bleUi.devices.size ? "found" : "none");
      },
    );
  } catch (error) {
    if (run !== bleUi.run) return;
    const text = String(error?.message || error || "");
    setBlePhase(/denied|permission/i.test(text) ? "denied" : "error", /denied|permission/i.test(text) ? "" : "A busca não começou: " + errorText(error));
  }
}
async function cancelBleScan() {
  bleUi.run++;
  await bleStopScan();
  if (bleUi.phase === "scanning" || bleUi.phase === "checking") setBlePhase(bleUi.devices.size ? "found" : "idle", bleUi.devices.size ? "" : "Busca cancelada.");
}
// Aplicativo no fundo: a busca para na hora; a conexão é liberada depois de 30 s (um diálogo do
// sistema, como o do pareamento, não derruba a conexão).
function bleOnVisibility() {
  clearTimeout(bleUi.hiddenTimer);
  if (!document.hidden || !bleAvailable()) return;
  cancelBleScan().catch(() => {});
  bleUi.hiddenTimer = setTimeout(() => {
    if (document.hidden && bleCurrent()) bleDisconnect().catch(() => {});
  }, 30e3);
}
// Última leitura que a placa enviou à nuvem, para ficar ao lado da leitura local.
async function loadBleCloud(sensorId, force = false) {
  if (!sensorId || !state.authorized) return;
  if (!force && bleUi.cloudFor === sensorId && Date.now() - bleUi.cloudAt < 10e3) return;
  Object.assign(bleUi, { cloudFor: sensorId, cloudAt: Date.now() });
  try {
    const startedAt = Date.now();
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    setServerTime(result.server_time, startedAt);
    mergeDevices(result.devices);
    bleUi.cloudKnown = result.devices.length > 0;
    if (bleUi.cloudKnown) await loadTelemetrySummary([sensorId]).catch(() => {});
    bleUi.cloudError = "";
  } catch (error) {
    bleUi.cloudError = isNetworkError(error) ? "offline" : errorText(error);
  }
  renderBleCloud(sensorId);
}
function renderBleCloud(sensorId) {
  if (!$id("bleCloud")) return;
  const device = findDevice(sensorId);
  const offline = bleUi.cloudError === "offline";
  const box = $id("bleCloud");
  if (!device) {
    box.className = "ble-source is-cloud is-late";
    $id("bleCloudValue").textContent = "—";
    $id("bleCloudLabel").textContent = offline ? "sem internet no celular" : bleUi.cloudKnown === false ? "sensor fora do escopo da sua conta, ou ainda sem a primeira transmissão" : bleUi.cloudError || "consultando a nuvem…";
    $id("bleCloudTime").textContent = "";
    $id("linkBle").disabled = !offline && bleUi.cloudKnown === false;
    return;
  }
  const view = deviceView(device);
  const status = deviceStatus(device);
  const late = offline || !status.online;
  box.className = "ble-source is-cloud" + (late ? " is-late" : "");
  $id("bleCloudValue").textContent = view.value === "—" ? "—" : view.value + (view.unit === "%" ? " %" : view.unit);
  $id("bleCloudLabel").innerHTML =
    esc(view.bench ? "posição de bancada" : view.kicker || "posição elétrica") + (view.sim ? " · " + benchSimChip(view.sim) : view.value === "—" ? " · " + esc(view.label) : "");
  $id("bleCloudTime").textContent =
    (late ? "última leitura da nuvem: " : "recebida às ") + fmtClock(device.last_received_at) + ` · há ${agoText(device.last_received_at)}` + (offline ? " · sem internet no celular agora" : late ? " · " + status.label.toLowerCase() : "");
  $id("linkBle").disabled = false;
  $id("linkBle").textContent = `Abrir ${deviceLabel(device)} na plataforma`;
}
function onBleReading(reading, device) {
  state.bleReading = reading;
  state.bleDevice = device;
  const magnetic = reading.modality === "as5600_i2c";
  $id("bleLive").hidden = false;
  $id("bleName").textContent = reading.device || device?.name || "Sensor";
  $id("bleIdentity").textContent = reading.sensor_id || "Firmware sem identificação; atualize para configurar.";
  // Placa magnética (firmware 4.4.0 em diante): ângulo absoluto e saúde. Não há tensão nem percentual local.
  const badSample = magnetic && (reading.bus !== "ok" || reading.mag !== "ok" || reading.angle_deg == null);
  $id("blePercent").textContent = magnetic ? (reading.angle_deg == null ? "—" : fmtDeg(reading.angle_deg, 2)) : `${fmtNum(reading.travel_percent)} %`;
  $id("blePercentLabel").textContent = magnetic ? "ângulo do sensor (absoluto, medido agora)" : "posição elétrica";
  $id("bleVoltage").textContent = magnetic
    ? "sinal: " + (reading.bus !== "ok" ? MAG_BUS_TEXT[reading.bus] || "sem resposta do sensor" : MAG_FIELD_TEXT[reading.mag] || "—")
    : `tensão estimada ${fmtNum(reading.voltage_v, 3)} V`;
  $id("bleVoltage").classList.toggle("tree-state", badSample);
  $id("bleTimestamp").textContent = `lida às ${fmtClock(new Date())} · sequência ${reading.sequence ?? "—"}`;
  $id("bleNote").textContent = magnetic
    ? "O ângulo local é a posição absoluta do ímã, de 0° a 359,9°. O percentual de bancada é calculado na nuvem pela contagem contínua que a placa envia: só com o ângulo não dá para saber em que volta o eixo está depois de passar de 360°."
    : "A leitura local vem direto da placa. A nuvem recebe o que a placa envia pela rede Wi-Fi.";
  if (bleUi.phase === "connecting") setBlePhase("connected");
  if (reading.sensor_id) {
    renderBleCloud(reading.sensor_id);
    loadBleCloud(reading.sensor_id).catch(() => {});
  } else $id("linkBle").disabled = true;
}
// Mensagens do cliente Bluetooth (conexão caiu, falha de leitura): viram estado na tela.
function setBleStatus(text) {
  if (!$id("bleStatus")) return;
  if (/desconectado/i.test(text)) return setBlePhase("disconnected");
  if (/falha na leitura/i.test(text)) return setBlePhase("connected", "Conectado, mas a última leitura local falhou. Tentando de novo a cada 5 segundos.");
  if (bleCurrent() && bleUi.phase !== "connected") return setBlePhase("connected");
  if (bleUi.phase === "connected" || bleUi.phase === "disconnected") return setBlePhase(bleUi.phase, text);
  renderBle();
}
$id("openBle").onclick = () => openBleDialog();
$id("scanBle").onclick = () => startBleScan();
$id("cancelBle").onclick = () => cancelBleScan();
$id("bleHelp").onclick = (event) => {
  const kind = event.target.closest("[data-ble-help]")?.dataset.bleHelp;
  if (!kind) return;
  const open = kind === "bluetooth" ? BleClient.openBluetoothSettings() : kind === "location" ? BleClient.openLocationSettings() : BleClient.openAppSettings();
  open.catch(() => setBlePhase(bleUi.phase, "Não foi possível abrir os ajustes por aqui. Abra os Ajustes do Android e volte ao aplicativo."));
};
$id("bleDevices").onclick = async (event) => {
  const button = event.target.closest("[data-ble]");
  if (!button || bleUi.phase === "connecting") return;
  const run = ++bleUi.run;
  const picked = bleUi.devices.get(button.dataset.ble) || { deviceId: button.dataset.ble };
  setBlePhase("connecting");
  try {
    await bleConnect({ deviceId: picked.deviceId, name: picked.name || picked.localName || "Sensor Gaxeta" }, onBleReading, setBleStatus);
    if (run === bleUi.run) setBlePhase("connected");
  } catch (error) {
    if (run === bleUi.run) setBlePhase("error", "Não foi possível conectar: " + errorText(error) + " Aproxime o celular da placa e tente de novo.");
  }
};
$id("disconnectBle").onclick = async () => {
  await bleDisconnect();
  setBlePhase("disconnected");
};
$id("bleDialog").addEventListener("close", () => cancelBleScan().catch(() => {}));
document.addEventListener("visibilitychange", bleOnVisibility);
window.addEventListener("pagehide", () => {
  if (!bleAvailable()) return;
  bleStopScan().catch(() => {});
  if (bleCurrent()) bleDisconnect().catch(() => {});
});
$id("identifyBle").onclick = async (event) => {
  await withBusy(event.currentTarget, async () => {
    await bleIdentify();
    setBlePhase("connected", "Comando enviado. Observe o LED do sensor por 10 segundos.");
  });
};
// O sensor detectado por Bluetooth só identifica o equipamento e abre o fluxo
// autorizado da plataforma; o vínculo ao spot é decidido no servidor.
$id("linkBle").onclick = async () => {
  const sensorId = state.bleReading?.sensor_id;
  if (!sensorId) return setBlePhase(bleUi.phase, "Atualize o firmware para identificar o sensor por ID.");
  try {
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    if (!result.devices.length)
      return setBlePhase(bleUi.phase, "Sensor identificado, mas ainda não disponível para a sua conta. Ele aparece após a primeira transmissão; a primeira associação é feita por um administrador.");
    mergeDevices(result.devices);
    await loadTelemetrySummary([sensorId]).catch(() => {});
    $id("bleDialog").close();
    showPage("sensors");
    // Sensor ainda sem spot e conta que pode associar: abre direto no vínculo. Senão, os Detalhes.
    openDrawer(sensorId, !result.devices[0].measurement_point_id && canEditDevice(result.devices[0]) ? "edit" : "detail");
  } catch (error) {
    setBlePhase(bleUi.phase, isNetworkError(error) ? "Sem internet no celular: a leitura local segue acima; a plataforma abre quando a conexão voltar." : errorText(error));
  }
};
