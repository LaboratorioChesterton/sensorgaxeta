// =============================================================================
// Inicialização: liga a navegação e os eventos globais. O painel só abre por
// enterApp(), chamado a partir de uma ação explícita de quem está usando.
// =============================================================================
document.querySelectorAll("[data-glyph]").forEach((slot) => (slot.innerHTML = glyph(slot.dataset.glyph)));
document.querySelectorAll("[data-page]").forEach((button) => (button.onclick = () => showPage(button.dataset.page)));
document.querySelectorAll("[data-close]").forEach((button) => (button.onclick = () => $id(button.dataset.close).close()));
$id("refresh").onclick = () => refreshData(true);
$id("pageActions").onclick = (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "find-sensor") openBleDialog();
  if (action === "new-corporation") openAssetForm({ parentId: null });
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
// Fora do fluxo síncrono do SDK, para não bloquear a renovação do token.
sb.auth.onAuthStateChange((event, session) => setTimeout(() => onAuthEvent(event, session), 0));
renderIcons();
