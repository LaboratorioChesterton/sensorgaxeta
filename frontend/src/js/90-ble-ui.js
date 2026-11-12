// Diálogo de Bluetooth (herdado do pacote publicado, com o vínculo passando pelo fluxo autorizado).
// Só existe no aplicativo nativo e só abre por toque explícito: abrir o aplicativo ou trocar de
// tela nunca inicia busca nem envia comando à placa. Na web, a entrada e o diálogo são removidos.
function openBleDialog() {
  if (!bleAvailable() || !$id("bleDialog")) return;
  $id("bleDialog").showModal();
}
function closeBleDialog() {
  const dialog = $id("bleDialog");
  if (dialog?.open) dialog.close();
}
function onBleReading(t, e) {
  ((state.bleReading = t),
    (state.bleDevice = e),
    ($id("bleLive").hidden = !1),
    ($id("bleName").textContent = t.device || e?.name || "Sensor"),
    ($id("bleIdentity").textContent = t.sensor_id || "Firmware sem identificação; atualize para configurar."),
    ($id("blePercent").textContent = `${fmtNum(t.travel_percent)} %`),
    ($id("bleVoltage").textContent = `${fmtNum(t.voltage_v, 3)} V`),
    ($id("bleTimestamp").textContent = `Leitura local ${fmtDateTime(new Date())} · sequência ${t.sequence ?? "—"}`));
}
function setBleStatus(t) {
  if (!$id("bleStatus")) return;
  (($id("bleStatus").textContent = t),
    ($id("disconnectBle").disabled = !bleCurrent()),
    ($id("identifyBle").disabled = !bleCurrent()),
    ($id("linkBle").disabled = !bleCurrent()));
}
$id("openBle").onclick = openBleDialog;
$id("scanBle").onclick = async (t) => {
  await withBusy(t.currentTarget, async () => {
    const e = new Map();
    ($id("bleDevices").replaceChildren(),
      await bleScan((r) => {
        (e.set(r.deviceId, r),
          ($id("bleDevices").innerHTML = [...e.values()]
            .map(
              (s) =>
                `<button class="ble-device" data-ble="${esc(s.deviceId)}"><span><strong>${esc(s.name || s.localName || "Sensor Gaxeta")}</strong><small>${esc(s.deviceId)} ${s.rssi == null ? "" : `· ${s.rssi} dBm`}</small></span>Conectar →</button>`,
            )
            .join("")));
      }, setBleStatus));
  });
};
$id("bleDevices").onclick = async (t) => {
  const e = t.target.closest("[data-ble]");
  if (e)
    try {
      await bleConnect(
        {
          deviceId: e.dataset.ble,
          name: e.querySelector("strong").textContent,
        },
        onBleReading,
        setBleStatus,
      );
    } catch (r) {
      setBleStatus(errorText(r));
    }
};
$id("disconnectBle").onclick = () => bleDisconnect();
$id("bleDialog").addEventListener("close", () => bleStopScan());
$id("identifyBle").onclick = async (t) => {
  await withBusy(t.currentTarget, async () => {
    (await bleIdentify(), setBleStatus("Comando enviado. Observe o LED do sensor por 10 segundos."));
  });
};
// O sensor detectado por Bluetooth só identifica o equipamento e abre o fluxo
// autorizado da plataforma; o vínculo ao spot é decidido no servidor.
$id("linkBle").onclick = async () => {
  const sensorId = state.bleReading?.sensor_id;
  if (!sensorId) return setBleStatus("Atualize o firmware para identificar o sensor por ID.");
  try {
    const result = await callRpc("gaxeta_devices_status", { p_sensor_ids: [sensorId] });
    if (!result.devices.length)
      return setBleStatus("Sensor identificado, mas ainda não disponível para a sua conta. Ele aparece após a primeira transmissão; a primeira associação é feita por um administrador.");
    mergeDevices(result.devices);
    $id("bleDialog").close();
    showPage("sensors");
    openDrawer(sensorId, canEditDevice(result.devices[0]) ? "edit" : "detail");
  } catch (error) {
    setBleStatus(errorText(error));
  }
};
