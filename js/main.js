/* =========================================================
   HOME — filtros por categoría
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".pill[data-cat]");
    const sections = document.querySelectorAll(".cat-section[data-cat]");
    const noResults = document.getElementById("no-results");

    function applyFilter(cat) {
      let visibleCount = 0;
      sections.forEach((sec) => {
        const match = cat === "todos" || sec.dataset.cat === cat;
        sec.style.display = match ? "" : "none";
        if (match) visibleCount++;
      });
      if (noResults) noResults.style.display = visibleCount === 0 ? "block" : "none";
    }

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        applyFilter(pill.dataset.cat);
        if (pill.dataset.cat !== "todos") {
          const target = document.querySelector(`.cat-section[data-cat="${pill.dataset.cat}"]`);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  });
})();
