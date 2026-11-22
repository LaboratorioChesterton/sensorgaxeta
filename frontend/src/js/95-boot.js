// =============================================================================
// Inicialização: liga a navegação e os eventos globais. O painel só abre por
// enterApp(), chamado a partir de uma ação explícita de quem está usando.
// =============================================================================
// Plataforma: decidida pelo runtime (aplicativo nativo × navegador), nunca pela largura da tela.
document.body.classList.toggle("native-app", isNativeApp());
// O topo do aplicativo é claro: os ícones da barra de status precisam ser escuros, inclusive com o
// aparelho em tema escuro (o padrão seguiria o tema e deixaria relógio e sinal brancos sobre branco).
if (isNativeApp()) {
  try {
    const bars = window.Capacitor?.Plugins?.SystemBars;
    Promise.resolve(bars?.setStyle?.({ style: "LIGHT" })).catch(() => {});
  } catch {}
}
if (bleAvailable()) $id("openBle").hidden = false;
else {
  // Web (inclusive navegador de celular): sem entrada de Bluetooth e sem o diálogo no documento.
  $id("openBle").remove();
  $id("bleDialog").remove();
}
document.querySelectorAll("[data-glyph]").forEach((slot) => (slot.innerHTML = glyph(slot.dataset.glyph)));
document.querySelectorAll("[data-page]").forEach((button) => (button.onclick = () => showPage(button.dataset.page)));
document.querySelectorAll("[data-close]").forEach((button) => (button.onclick = () => $id(button.dataset.close).close()));
$id("refresh").onclick = () => refreshData(true);
$id("pageActions").onclick = (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "find-sensor") openBleDialog({ scan: true }); // o toque em "Buscar" já é o pedido de busca
  if (action === "new-corporation") openAssetForm({ parentId: null }).catch((error) => showMessage(errorText(error), "error"));
  if (action === "manual-back") showPage(state.manualReturn);
  if (action === "new-gateway") openGatewayForm().catch((error) => showMessage(errorText(error), "error"));
  if (action === "new-user") openUserWizard().catch((error) => showMessage(errorText(error), "error"));
};
document.addEventListener("click", (event) => {
  // Fecha menus abertos ao clicar fora deles.
  document.querySelectorAll("details.user-menu[open], details.row-menu[open]").forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshData();
});
window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1);
  if (state.authorized && PAGE_TITLES[page] && state.page !== page) showPage(page);
});
window.addEventListener(
  "resize",
  debounce(() => {
    if (!state.authorized) return;
    renderPageActions();
    renderTree();
    renderIcons();
  }, 200),
);
// Telefone com o teclado aberto: o campo em foco fica à vista (o teclado encolhe a área útil).
document.addEventListener("focusin", (event) => {
  if (!(isNativeApp() || isNarrow()) || !event.target.matches?.('input:not([type="checkbox"]):not([type="radio"]), select, textarea')) return;
  setTimeout(() => document.activeElement === event.target && event.target.scrollIntoView({ block: "center", behavior: "smooth" }), 300);
});
// Fora do fluxo síncrono do SDK, para não bloquear a renovação do token.
sb.auth.onAuthStateChange((event, session) => setTimeout(() => onAuthEvent(event, session), 0));
renderIcons();
