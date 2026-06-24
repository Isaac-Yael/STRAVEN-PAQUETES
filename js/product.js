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

    // ---- Animación de conteo en los precios ----
    // El precio del hero (y la barra fija de mobile) cuentan desde 0 apenas
    // carga la página; el resto de precios (banners intermedios y CTA final)
    // cuentan la primera vez que entran en el viewport al hacer scroll.
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function formatPrice(n) {
      return window.StravenCart && window.StravenCart.money ? window.StravenCart.money(n) : "$" + Number(n).toFixed(2);
    }
    function animateCount(el) {
      const final = parseFloat(el.dataset.final);
      if (isNaN(final)) return;
      if (reduceMotion) {
        el.textContent = formatPrice(final);
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatPrice(final * eased);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = formatPrice(final);
      }
      requestAnimationFrame(tick);
    }
    const countEls = document.querySelectorAll(".js-count-price");
    countEls.forEach((el) => {
      if (el.dataset.count === "load") animateCount(el);
    });
    const scrollCountEls = Array.from(countEls).filter((el) => el.dataset.count !== "load");
    if (scrollCountEls.length) {
      if ("IntersectionObserver" in window) {
        const countIO = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateCount(entry.target);
                countIO.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.4 }
        );
        scrollCountEls.forEach((el) => countIO.observe(el));
      } else {
        scrollCountEls.forEach((el) => animateCount(el));
      }
    }

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

    // ---- Carrusel: fotografías individuales ----
    // Avanza solo (derecha→izquierda) cada 1.5s. El usuario puede tomar el
    // control con las flechas (desktop) o los bullets (todas las pantallas);
    // en mobile además se puede recorrer con swipe (scroll táctil nativo).
    document.querySelectorAll(".js-carousel-track").forEach((track) => {
      const wrap = track.closest(".photo-carousel-wrap");
      if (!wrap) return;
      const prevBtn = wrap.querySelector(".js-carousel-prev");
      const nextBtn = wrap.querySelector(".js-carousel-next");
      const dotsWrap = wrap.parentElement.querySelector(".js-carousel-dots");
      const tiles = Array.from(track.querySelectorAll(".photo-tile"));
      if (!prevBtn || !nextBtn || !tiles.length) return;

      function tileStep() {
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return tiles[0].getBoundingClientRect().width + gap;
      }
      function visibleCount() {
        const step = tileStep();
        return step > 0 ? Math.max(1, Math.round(track.clientWidth / step)) : 1;
      }
      function maxScroll() {
        return Math.max(0, track.scrollWidth - track.clientWidth - 1);
      }
      function pageCount() {
        return Math.max(1, Math.ceil(tiles.length / visibleCount()));
      }
      function pageOf(scrollLeft) {
        const max = maxScroll();
        const pages = pageCount();
        if (max <= 0 || pages <= 1) return 0;
        return Math.min(pages - 1, Math.round((scrollLeft / max) * (pages - 1)));
      }
      function updateArrows() {
        const max = maxScroll();
        prevBtn.disabled = track.scrollLeft <= 0;
        nextBtn.disabled = max <= 0 || track.scrollLeft >= max - 1;
      }

      let dots = [];
      function updateDots() {
        if (!dots.length) return;
        const active = pageOf(track.scrollLeft);
        dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
      }
      function buildDots() {
        if (!dotsWrap) return;
        const pages = pageCount();
        dotsWrap.innerHTML = "";
        dots = [];
        if (pages <= 1) {
          dotsWrap.style.display = "none";
          return;
        }
        dotsWrap.style.display = "flex";
        for (let i = 0; i < pages; i++) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "carousel-dot";
          dot.setAttribute("aria-label", "Ir al grupo de fotos " + (i + 1));
          dot.addEventListener("click", () => {
            goToPage(i);
            restartAutoplay();
          });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        }
        updateDots();
      }

      function goToPage(page) {
        const pages = pageCount();
        const wrapped = ((page % pages) + pages) % pages;
        const max = maxScroll();
        const target = max <= 0 ? 0 : Math.min(max, wrapped * tileStep() * visibleCount());
        track.scrollTo({ left: target, behavior: "smooth" });
      }
      function step(dir) {
        goToPage(pageOf(track.scrollLeft) + dir);
      }

      prevBtn.addEventListener("click", () => { step(-1); restartAutoplay(); });
      nextBtn.addEventListener("click", () => { step(1); restartAutoplay(); });
      track.addEventListener("scroll", () => window.requestAnimationFrame(() => { updateArrows(); updateDots(); }));
      window.addEventListener("resize", () => { buildDots(); updateArrows(); });

      // ---- Autoplay: avanza un grupo cada 1.5s, en bucle ----
      let autoplayTimer = null;
      function startAutoplay() {
        stopAutoplay();
        if (reduceMotion || pageCount() <= 1) return;
        autoplayTimer = setInterval(() => {
          const pages = pageCount();
          const cur = pageOf(track.scrollLeft);
          goToPage(cur + 1 >= pages ? 0 : cur + 1);
        }, 1500);
      }
      function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      function restartAutoplay() {
        startAutoplay();
      }
      wrap.addEventListener("mouseenter", stopAutoplay);
      wrap.addEventListener("mouseleave", startAutoplay);
      wrap.addEventListener("touchstart", stopAutoplay, { passive: true });
      wrap.addEventListener("touchend", () => setTimeout(startAutoplay, 2500), { passive: true });

      buildDots();
      updateArrows();
      startAutoplay();
    });

    // ---- Botón "Agendar videollamada" (CTA final) ----
    // Mismo patrón que el botón flotante de WhatsApp: número centralizado
    // en config.js, mensaje contextual con el nombre del paquete.
    const videocallBtn = document.getElementById("videocall-whatsapp-btn");
    if (videocallBtn) {
      const cfg = window.STRAVEN_CONFIG || {};
      const number = (cfg.whatsappNumber || "").replace(/[^\d]/g, "");
      const msg = `Hola ${cfg.businessName || "STRAVEN"}, me gustaría agendar una videollamada para ver físicamente el paquete "${product.nombre}" antes de comprar.`;
      videocallBtn.href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    }

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
