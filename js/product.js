/* =========================================================
   PÁGINA DE PRODUCTO — landing page con scroll
   Cantidad, agregar al carrito y lightbox de fotos.
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const productDataEl = document.getElementById("product-data");
    if (!productDataEl) return;
    const product = JSON.parse(productDataEl.textContent);

    // ---- Cantidad ----
    let qty = 1;
    const qtyEls = document.querySelectorAll(".js-qty-value");
    function renderQty() {
      qtyEls.forEach((el) => (el.textContent = qty));
    }
    document.querySelectorAll(".js-qty-inc").forEach((b) => b.addEventListener("click", () => { qty++; renderQty(); }));
    document.querySelectorAll(".js-qty-dec").forEach((b) => b.addEventListener("click", () => { if (qty > 1) qty--; renderQty(); }));

    // ---- Agregar al carrito (botón secundario) ----
    const toast = document.getElementById("added-toast");
    document.querySelectorAll(".js-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.StravenCart.addToCart(product, qty);
        if (toast) {
          toast.style.display = "block";
          setTimeout(() => (toast.style.display = "none"), 2200);
        }
      });
    });

    // ---- Comprar ahora (botón primario) ----
    // Intencionalmente sin acción todavía: aquí se integrará el checkout
    // con PayPal. Por ahora .js-buy-now no tiene listener. Aparece repetido
    // en el hero, en los banners intermedios, en el CTA final y en la barra
    // fija de mobile — todos comparten esta misma clase.

    // ---- Lightbox de fotos ----
    // Cada sección (principal / detalles / piezas individuales / foto grupal)
    // es su propio "grupo": el visor solo navega entre fotos de la misma
    // sección, para no perder el contexto narrativo de la página.
    const triggers = Array.from(document.querySelectorAll(".js-lightbox-img"));
    if (!triggers.length) return;

    const groups = {};
    triggers.forEach((btn) => {
      const group = btn.dataset.group || "default";
      (groups[group] = groups[group] || []).push(btn);
    });

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>' +
      '<button type="button" class="lightbox-nav lightbox-prev" aria-label="Anterior">&#8249;</button>' +
      '<div class="lightbox-img-wrap"><img alt=""></div>' +
      '<button type="button" class="lightbox-nav lightbox-next" aria-label="Siguiente">&#8250;</button>';
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector("img");
    const prevBtn = overlay.querySelector(".lightbox-prev");
    const nextBtn = overlay.querySelector(".lightbox-next");

    let currentGroup = null;
    let currentIndex = 0;

    function show(group, index) {
      const list = groups[group];
      if (!list || !list.length) return;
      currentGroup = group;
      currentIndex = (index + list.length) % list.length;
      const sourceImg = list[currentIndex].querySelector("img");
      imgEl.src = sourceImg.src;
      imgEl.alt = sourceImg.alt || "";
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      const multi = list.length > 1;
      prevBtn.style.display = multi ? "flex" : "none";
      nextBtn.style.display = multi ? "flex" : "none";
    }

    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.dataset.group || "default";
        show(group, groups[group].indexOf(btn));
      });
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    prevBtn.addEventListener("click", () => show(currentGroup, currentIndex - 1));
    nextBtn.addEventListener("click", () => show(currentGroup, currentIndex + 1));
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentGroup, currentIndex - 1);
      if (e.key === "ArrowRight") show(currentGroup, currentIndex + 1);
    });
  });
})();
