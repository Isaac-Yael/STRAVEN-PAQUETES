/* =========================================================
   HOME — filtros por categoría
   "Todos" muestra la grilla completa, sin separar por categoría.
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".pill[data-cat]");
    const cards = document.querySelectorAll("#product-grid .card[data-cat]");
    const noResults = document.getElementById("no-results");
    if (!pills.length || !cards.length) return;

    function applyFilter(cat) {
      let visibleCount = 0;
      cards.forEach((card) => {
        const match = cat === "todos" || card.dataset.cat === cat;
        card.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });
      if (noResults) noResults.style.display = visibleCount === 0 ? "block" : "none";
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        applyFilter(pill.dataset.cat);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  });
})();
