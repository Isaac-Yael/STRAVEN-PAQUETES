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

    // ---- Animación de aparición al hacer scroll ----
    // Textos (story-head) y fotos/video (photo-tile, video-frame) entran
    // con un fade + slide sutil la primera vez que cruzan el viewport.
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );
        revealEls.forEach((el) => io.observe(el));
      } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }
    }

    // ---- Carrusel desktop: fotografías individuales ----
    // En mobile el track se recorre con swipe (sin flechas); en desktop
    // las flechas avanzan/retroceden de 5 en 5 fotos.
    document.querySelectorAll(".js-carousel-track").forEach((track) => {
      const wrap = track.closest(".photo-carousel-wrap");
      if (!wrap) return;
      const prevBtn = wrap.querySelector(".js-carousel-prev");
      const nextBtn = wrap.querySelector(".js-carousel-next");
      if (!prevBtn || !nextBtn) return;

      function pageDistance() {
        const tile = track.querySelector(".photo-tile");
        if (!tile) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return (tile.getBoundingClientRect().width + gap) * 5;
      }
      function updateArrows() {
        const max = track.scrollWidth - track.clientWidth - 1;
        prevBtn.disabled = track.scrollLeft <= 0;
        nextBtn.disabled = max <= 0 || track.scrollLeft >= max;
      }
      prevBtn.addEventListener("click", () => track.scrollBy({ left: -pageDistance(), behavior: "smooth" }));
      nextBtn.addEventListener("click", () => track.scrollBy({ left: pageDistance(), behavior: "smooth" }));
      track.addEventListener("scroll", () => window.requestAnimationFrame(updateArrows));
      window.addEventListener("resize", updateArrows);
      updateArrows();
    });

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
