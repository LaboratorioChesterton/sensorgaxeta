// =============================================================================
// Manual dentro da aplicação. O conteúdo e o índice são os de operacao.html (uma
// só fonte), lidos sob demanda. Como a navegação não sai da página, a sessão
// autorizada, a tela de origem e o sensor selecionado continuam em memória, e o
// Voltar devolve exatamente ao ponto de partida. operacao.html continua valendo
// como endereço direto; aberto fora da plataforma, segue o fluxo normal de entrada.
// =============================================================================
const manual = { loaded: false, observer: null };
function markManualSection(id) {
  $id("manualNav")
    .querySelectorAll("a[data-section]")
    .forEach((link) => (link.dataset.section === id ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current")));
}
function goManualSection(id) {
  const target = $id("manualBody").querySelector("#" + CSS.escape(id));
  if (!target) return;
  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  markManualSection(id);
  if (isNarrow()) $id("manualNav").querySelector("details")?.removeAttribute("open");
}
async function openManual() {
  if (!manual.loaded) {
    $id("manualNav").replaceChildren();
    $id("manualBody").innerHTML = '<p class="form-help">Carregando o manual…</p>';
    try {
      const response = await fetch("./operacao.html", { cache: "no-cache" });
      if (!response.ok) throw Error("HTTP " + response.status);
      const page = new DOMParser().parseFromString(await response.text(), "text/html");
      const content = page.querySelector("[data-manual-content]");
      const index = page.querySelector("[data-manual-nav]");
      if (!content || !index) throw Error("formato inesperado");
      for (const node of [content, index]) node.querySelectorAll("script, style, link").forEach((element) => element.remove());
      $id("manualBody").replaceChildren(...[...content.children].map((node) => document.importNode(node, true)));
      $id("manualNav").replaceChildren(...[...index.children].map((node) => document.importNode(node, true)));
      manual.loaded = true;
    } catch (error) {
      $id("manualBody").innerHTML =
        '<section><h2>Manual indisponível agora</h2><p>Não foi possível carregar o conteúdo. <a href="./operacao.html" target="_blank" rel="noopener">Abrir o manual em outra aba</a>.</p></section>';
      return;
    }
    // Indicação da seção atual conforme a rolagem.
    manual.observer?.disconnect();
    manual.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
        if (visible) markManualSection(visible.target.id);
      },
      { rootMargin: "-70px 0px -65% 0px" },
    );
    $id("manualBody")
      .querySelectorAll("section[id]")
      .forEach((section) => manual.observer.observe(section));
  }
  const index = $id("manualNav").querySelector("details");
  if (index) index.open = !isNarrow();
  window.scrollTo(0, 0);
}
// Dentro da aplicação o endereço (#manual) é a rota: os links do índice rolam até a seção sem trocá-lo.
$id("manualPage").addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  goManualSection(link.getAttribute("href").slice(1));
});
