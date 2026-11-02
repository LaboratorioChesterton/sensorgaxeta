import { CONFIG } from './config.js';

const $ = (id) => document.getElementById(id);
const state = { data: null, minutes: 60, sensorId: '', demo: false, demoValue: 72,
  demoPoints: [], running: false, timer: null, error: null, lastSuccess: null };
const stamp = (value) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }) : '—';
const numeric = (value, digits = 1) => value == null || !Number.isFinite(Number(value)) ? '—' :
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function setStatus(element, label, kind) {
  element.textContent = label;
  element.className = `status-pill ${kind}`;
}

function currentDevice() {
  return state.data?.devices?.find(d => d.sensor_id === (state.data.sensor_id || state.sensorId)) || null;
}

function updateDeviceSelect() {
  const select = $('sensorSelect');
  const devices = state.data?.devices || [];
  const selected = state.data?.sensor_id || '';
  select.replaceChildren();
  if (!devices.length) select.add(new Option('Aguardando sensor', ''));
  else for (const device of devices) select.add(new Option(device.label && device.label !== 'Sensor de gaxeta'
    ? `${device.label} · ${device.sensor_id}` : device.sensor_id, device.sensor_id));
  select.value = selected;
}

function createDemoHistory() {
  const time = Date.now();
  state.demoPoints.push({ received_at: new Date(time).toISOString(), travel_percent: state.demoValue,
    position_mm: state.demoValue * CONFIG.courseReferenceMm / 100,
    voltage_v: state.demoValue * 3.3 / 100, sequence: state.demoPoints.length + 1 });
  state.demoPoints = state.demoPoints.slice(-70);
}

function displayData() {
  const d = currentDevice();
  const realHistory = state.data?.history || [];
  const history = state.demo ? state.demoPoints : realHistory;
  const percent = state.demo ? state.demoValue : d?.last_percent;
  const position = state.demo ? state.demoValue * CONFIG.courseReferenceMm / 100 : d?.last_position_mm;
  const voltage = state.demo ? state.demoValue * 3.3 / 100 : d?.last_voltage_v;
  const age = d?.last_received_at ? Date.now() - new Date(d.last_received_at).getTime() : Infinity;
  let label = 'Aguardando sensor', kind = 'waiting';
  if (state.demo) { label = 'Demonstração local'; kind = 'demo'; }
  else if (d && age < CONFIG.staleAfterMs && !state.error) { label = 'Recebendo'; kind = 'online'; }
  else if (d && age < CONFIG.offlineAfterMs) { label = 'Sem atualização recente'; kind = 'stale'; }
  else if (d) { label = 'Sem sinal'; kind = 'offline'; }
  setStatus($('readingStatus'), label, kind);
  $('currentValue').textContent = numeric(percent, 1);
  $('positionValue').textContent = numeric(position, 2);
  $('voltageValue').textContent = numeric(voltage, 3);
  $('sampleCount').textContent = state.demo ? state.demoPoints.length.toLocaleString('pt-BR') :
    d ? Number(d.reading_count || 0).toLocaleString('pt-BR') : '—';
  $('sensorLabel').textContent = state.demo ? 'Valores somente no navegador' : d?.sensor_id || 'Nenhum ESP32 registrado';
  $('selectedSensor').textContent = state.demo ? 'DEMONSTRAÇÃO' : d?.sensor_id || '—';
  $('currentTime').textContent = state.demo ? 'Simulação local' : `Última leitura ${stamp(d?.last_received_at)}`;
  $('heroExplanation').textContent = state.demo ? 'Ajuste o controle abaixo para explorar o painel.' :
    !d ? 'Nenhuma leitura física recebida ainda.' : kind === 'online' ? 'Leitura recebida diretamente da placa ESP32.' :
    'Último valor preservado; verifique a conexão da placa.';
  const safePercent = Number.isFinite(Number(percent)) ? Math.max(0, Math.min(100, Number(percent))) : null;
  $('ringProgress').style.strokeDashoffset = safePercent == null ? 446.1 : (446.1 * (1 - safePercent / 100));
  $('ringProgress').style.stroke = safePercent == null ? '#c2d1d4' : safePercent < 33 ? '#d86968' : safePercent < 66 ? '#e6af50' : '#32b697';
  $('scaleMarker').hidden = safePercent == null;
  if (safePercent != null) $('scaleMarker').style.left = `${safePercent}%`;
  $('periodCount').textContent = state.demo ? `${history.length} pontos simulados` :
    `${Number(state.data?.stats?.count || 0).toLocaleString('pt-BR')} leituras no período`;
  $('chartClock').textContent = state.demo ? 'Horário da simulação local' : 'Horário de chegada ao Supabase';
  $('exportBtn').disabled = state.demo || !realHistory.length;
  renderChart(history);
  renderTable(history);
}

function renderChart(history) {
  const svg = $('historyChart');
  const rows = history.filter(r => Number.isFinite(Number(r.travel_percent)) && Number.isFinite(new Date(r.received_at).getTime()));
  $('emptyChart').hidden = rows.length > 0;
  if (!rows.length) { svg.replaceChildren(); $('chartFirst').textContent = '—'; $('chartLast').textContent = '—'; return; }
  $('chartFirst').textContent = stamp(rows[0].received_at);
  $('chartLast').textContent = stamp(rows.at(-1).received_at);
  const times = rows.map(r => new Date(r.received_at).getTime());
  const first = Math.min(...times), last = Math.max(...times);
  const span = Math.max(1, last - first);
  const points = rows.map((r, i) => [((times[i] - first) / span) * 940 + 10,
    235 - Math.max(0, Math.min(100, Number(r.travel_percent))) * 2.2]);
  if (points.length === 1) points[0][0] = 480;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const area = `${line} L ${points.at(-1)[0].toFixed(2)} 245 L ${points[0][0].toFixed(2)} 245 Z`;
  svg.innerHTML = `<path class="chart-area" d="${area}"/><path class="chart-line" d="${line}"/><circle class="chart-dot" cx="${points.at(-1)[0].toFixed(2)}" cy="${points.at(-1)[1].toFixed(2)}" r="4"/>`;
  svg.setAttribute('aria-label', `Histórico de ${rows.length} pontos. Último valor: ${numeric(rows.at(-1).travel_percent, 1)} por cento.`);
}

function renderTable(history) {
  const tbody = $('readingRows');
  tbody.replaceChildren();
  const rows = history.slice(-8).reverse();
  $('tableCount').textContent = `${rows.length} ${state.demo ? 'pontos simulados' : 'registros exibidos'}`;
  if (!rows.length) {
    const tr = tbody.insertRow(); const td = tr.insertCell(); td.colSpan = 5;
    td.className = 'empty-table'; td.textContent = 'Aguardando telemetria real.'; return;
  }
  for (const row of rows) {
    const tr = tbody.insertRow();
    for (const value of [stamp(row.received_at), `${numeric(row.travel_percent, 1)}%`,
      `${numeric(row.position_mm, 2)} mm`, `${numeric(row.voltage_v, 3)} V`, String(row.sequence ?? '—')]) {
      tr.insertCell().textContent = value;
    }
  }
}

async function fetchSnapshot() {
  if (state.running || document.hidden) return;
  state.running = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/rpc/gaxeta_snapshot`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CONFIG.publishableKey },
      body: JSON.stringify({ p_sensor_id: state.sensorId || null, p_minutes: state.minutes }),
      cache: 'no-store', signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.devices) || !Array.isArray(payload.history)) throw new Error('Resposta inválida');
    state.data = payload; state.error = null; state.lastSuccess = new Date();
    updateDeviceSelect(); displayData();
    $('lastSync').textContent = stamp(state.lastSuccess);
    $('apiStatus').className = 'api-status ok';
    $('apiStatus').innerHTML = '<i></i>Banco conectado';
  } catch (error) {
    state.error = error;
    $('apiStatus').className = 'api-status error';
    $('apiStatus').innerHTML = '<i></i>Falha na consulta';
    displayData();
  } finally {
    clearTimeout(timeout); state.running = false;
    clearTimeout(state.timer); state.timer = setTimeout(fetchSnapshot, state.error ? 10000 : CONFIG.pollMs);
  }
}

function exportCsv() {
  const rows = state.data?.history || [];
  if (state.demo || !rows.length) return;
  const header = ['id', 'recebido_em', 'amostrado_em', 'margem_percentual', 'posicao_mm_referencia', 'tensao_v_aproximada', 'sequencia'];
  const fields = r => [r.id, r.received_at, r.sampled_at || '', r.travel_percent, r.position_mm, r.voltage_v, r.sequence];
  const esc = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = [header.join(';'), ...rows.map(r => fields(r).map(esc).join(';'))].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `gaxeta-${state.data.sensor_id}-${state.minutes}min-pontos-exibidos.csv`;
  link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

$('refreshBtn').addEventListener('click', fetchSnapshot);
$('exportBtn').addEventListener('click', exportCsv);
$('sensorSelect').addEventListener('change', event => { state.sensorId = event.target.value; fetchSnapshot(); });
document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => {
  state.minutes = Number(button.dataset.minutes);
  document.querySelectorAll('[data-minutes]').forEach(b => b.classList.toggle('selected', b === button));
  fetchSnapshot();
}));
$('demoBtn').addEventListener('click', () => {
  state.demo = !state.demo;
  if (state.demo && !state.demoPoints.length) createDemoHistory();
  document.querySelector('.app-shell').classList.toggle('demo-mode', state.demo);
  $('demoBtn').textContent = state.demo ? 'Desativar demonstração' : 'Ativar demonstração';
  $('demoBtn').setAttribute('aria-pressed', String(state.demo));
  $('demoControls').hidden = !state.demo;
  const announcement = document.querySelector('.announcement span:last-child');
  announcement.innerHTML = state.demo ? '<strong>Demonstração local ativada.</strong> Os valores abaixo são simulados neste navegador e não são enviados ao banco.' :
    '<strong>Piloto configurado para o Supabase.</strong> O roteador fornece internet ao ESP32. As leituras reais aparecem após gravar o novo firmware na placa.';
  displayData();
});
$('demoSlider').addEventListener('input', event => {
  state.demoValue = Number(event.target.value);
  $('demoSliderValue').textContent = String(state.demoValue);
  createDemoHistory(); displayData();
});
$('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  localStorage.setItem('gaxeta-theme', dark ? 'dark' : 'light');
  $('themeBtn').textContent = dark ? '☀' : '☾';
});
$('menuBtn').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelectorAll('.nav-item').forEach(link => link.addEventListener('click', () => document.querySelector('.sidebar').classList.remove('open')));
document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchSnapshot(); });
if (localStorage.getItem('gaxeta-theme') === 'dark') { document.body.classList.add('dark'); $('themeBtn').textContent = '☀'; }
displayData(); fetchSnapshot();
