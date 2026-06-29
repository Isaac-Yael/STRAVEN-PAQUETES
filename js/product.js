/* =========================================================
   PÁGINA DE PRODUCTO — landing page con scroll
   Cantidad, agregar al carrito y lightbox de fotos.
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const productDataEl = document.getElementById("product-data");
    if (!productDataEl) return;
    const product = JSON.parse(productDataEl.textContent);

    // ---- Comprar ahora: popup de método de pago ----
    // Cualquier botón .js-buy-now (hero, banners intermedios, CTA final,
    // barra fija de mobile) abre el mismo popup. Dos opciones:
    //  1) Transferencia — resaltada con descuento, para empujar al usuario
    //     hacia el método que no tiene comisión de tarjeta/PayPal.
    //  2) Tarjeta de crédito/débito o PayPal a 3MSI — redirige al link de
    //     pago del paquete (columna "Link de pago" del CSV).
    (function setupPaymentModal() {
      const buyBtns = document.querySelectorAll(".js-buy-now");
      if (!buyBtns.length) return;

      const cfg = window.STRAVEN_CONFIG || {};
      const bank = cfg.bankTransfer || {};
      const discountPct = typeof cfg.transferDiscountPct === "number" ? cfg.transferDiscountPct : 0.03;
      const discountLabel = Math.round(discountPct * 100);
      const number = (cfg.whatsappNumber || "").replace(/[^\d]/g, "");
      const linkPago = product.linkPago || "";

      const precioNum = Number(product.precio) || 0;
      const precioTransferNum = precioNum * (1 - discountPct);
      const precioStr = formatPrice(precioNum);
      const precioTransferStr = formatPrice(precioTransferNum);

      function groupDigits(str) {
        return String(str).replace(/(.{4})(?=.)/g, "$1 ");
      }
      function esc(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      }

      const overlay = document.createElement("div");
      overlay.className = "pm-overlay";
      overlay.innerHTML =
        '<div class="pm-modal" role="dialog" aria-modal="true" aria-label="Elige tu método de pago">' +
          '<button type="button" class="pm-close" aria-label="Cerrar">&times;</button>' +

          '<div class="pm-view pm-view--methods is-active">' +
            '<h3 class="pm-title">¿Cómo quieres pagar?</h3>' +
            `<p class="pm-subtitle">Elige tu método para "${esc(product.nombre)}"</p>` +

            '<button type="button" class="pm-method pm-method--transfer">' +
              `<span class="pm-method-badge">Recomendado · Ahorra ${discountLabel}%</span>` +
              '<span class="pm-method-name">Transferencia bancaria</span>' +
              '<span class="pm-method-price">' +
                `<span class="pm-price-old">${precioStr}</span>` +
                `<span class="pm-price-new">${precioTransferStr}</span>` +
              '</span>' +
              '<span class="pm-method-note">SPEI o depósito · confirmamos tu pago el mismo día</span>' +
            '</button>' +

            '<button type="button" class="pm-method pm-method--card">' +
              '<span class="pm-method-name">Tarjeta de crédito, débito o PayPal</span>' +
              `<span class="pm-method-price"><span class="pm-price-new">${precioStr}</span></span>` +
              '<span class="pm-method-note">3 meses sin intereses con crédito o PayPal · no aplica con débito</span>' +
            '</button>' +
          '</div>' +

          '<div class="pm-view pm-view--transfer">' +
            '<button type="button" class="pm-back">&#8249; Volver</button>' +
            '<h3 class="pm-title">Datos para tu transferencia</h3>' +
            `<p class="pm-subtitle">Paga <strong>${precioTransferStr}</strong> (con tu ${discountLabel}% de descuento) a esta cuenta:</p>` +

            '<div class="pm-bank-card">' +
              '<div class="pm-bank-row">' +
                '<span class="pm-bank-label">Banco</span>' +
                `<span class="pm-bank-value">${esc(bank.bank || "—")}</span>` +
              '</div>' +
              '<div class="pm-bank-row">' +
                '<span class="pm-bank-label">Beneficiario</span>' +
                `<span class="pm-bank-value">${esc(bank.beneficiary || "—")}</span>` +
              '</div>' +
              '<div class="pm-bank-row">' +
                '<span class="pm-bank-label">CLABE</span>' +
                `<span class="pm-bank-value">${esc(groupDigits(bank.clabe || ""))}</span>` +
                `<button type="button" class="pm-copy-btn" data-copy="${esc(bank.clabe || "")}">Copiar</button>` +
              '</div>' +
              '<div class="pm-bank-row">' +
                '<span class="pm-bank-label">Cuenta</span>' +
                `<span class="pm-bank-value">${esc(groupDigits(bank.account || ""))}</span>` +
                `<button type="button" class="pm-copy-btn" data-copy="${esc(bank.account || "")}">Copiar</button>` +
              '</div>' +
            '</div>' +

            '<a href="#" class="pm-whatsapp-btn" target="_blank" rel="noopener">' +
              '<svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor"><path d="M16.04 2.67C8.84 2.67 3 8.5 3 15.7c0 2.84.93 5.46 2.5 7.6L4 29.33l6.2-1.63a12.9 12.9 0 0 0 5.84 1.4h.01c7.2 0 13.04-5.83 13.04-13.03 0-3.48-1.36-6.75-3.82-9.2a12.93 12.93 0 0 0-9.23-3.8Zm0 23.4h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-4.1 1.08 1.1-4-.26-.42a10.78 10.78 0 0 1-1.65-5.74c0-5.98 4.87-10.84 10.85-10.84a10.8 10.8 0 0 1 7.68 3.18 10.78 10.78 0 0 1 3.18 7.67c0 5.98-4.87 10.81-10.85 10.81Zm5.95-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.51-.16-.73.16-.21.32-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.19-.32-.02-.49.15-.65.16-.16.36-.41.54-.62.18-.21.24-.36.36-.6.12-.24.06-.44-.03-.6-.1-.16-.66-1.6-.91-2.18-.24-.58-.49-.5-.68-.51h-.58c-.19 0-.5.07-.76.36-.27.29-1.03 1-1.03 2.45s1.06 2.84 1.21 3.04c.16.2 2.13 3.25 5.16 4.43 3.03 1.18 3.03.79 3.58.74.54-.05 1.93-.79 2.2-1.55.28-.76.28-1.41.2-1.55-.08-.13-.3-.21-.62-.37Z"/></svg>' +
              'Enviar mi comprobante por WhatsApp' +
            '</a>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      const methodsView = overlay.querySelector(".pm-view--methods");
      const transferView = overlay.querySelector(".pm-view--transfer");

      function openModal() {
        methodsView.classList.add("is-active");
        transferView.classList.remove("is-active");
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
      }
      function closeModal() {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
      function showTransfer() {
        methodsView.classList.remove("is-active");
        transferView.classList.add("is-active");
      }
      function showMethods() {
        transferView.classList.remove("is-active");
        methodsView.classList.add("is-active");
      }

      buyBtns.forEach((btn) => btn.addEventListener("click", openModal));
      overlay.querySelector(".pm-close").addEventListener("click", closeModal);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
      });

      overlay.querySelector(".pm-method--transfer").addEventListener("click", showTransfer);
      overlay.querySelector(".pm-back").addEventListener("click", showMethods);

      overlay.querySelector(".pm-method--card").addEventListener("click", () => {
        if (linkPago) {
          window.open(linkPago, "_blank", "noopener");
          closeModal();
        } else {
          // Respaldo por si algún paquete no tiene link de pago cargado:
          // nunca dejamos al usuario sin forma de continuar.
          const msg = `Hola ${cfg.businessName || "STRAVEN"}, quiero pagar con tarjeta/PayPal el paquete "${product.nombre}". ¿Me ayudan con el link de pago?`;
          window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
          closeModal();
        }
      });

      const waBtn = overlay.querySelector(".pm-whatsapp-btn");
      const waMsg = `Hola ${cfg.businessName || "STRAVEN"}, ya hice mi transferencia por el paquete "${product.nombre}" (${precioTransferStr} con descuento por transferencia). Aquí adjunto mi comprobante de pago.`;
      waBtn.href = `https://wa.me/${number}?text=${encodeURIComponent(waMsg)}`;

      overlay.querySelectorAll(".pm-copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = btn.dataset.copy || "";
          const original = btn.textContent;
          const flash = () => {
            btn.textContent = "¡Copiado!";
            btn.classList.add("is-copied");
            setTimeout(() => { btn.textContent = original; btn.classList.remove("is-copied"); }, 1600);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(flash).catch(flash);
          } else {
            flash();
          }
        });
      });
    })();

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

    // ---- Countdown de oferta: 78h por visitante, en bucle infinito ----
    // Cada visitante tiene su propio plazo guardado en localStorage (clave
    // compartida en todo el sitio): al entrar por primera vez se le asignan
    // 78h; si vuelve después de que el plazo terminó, se le asigna un nuevo
    // plazo de 78h automáticamente. Es un recordatorio de urgencia/escasez
    // — no afecta el precio real ni ninguna lógica de negocio.
    (function () {
      const cdEl = document.getElementById("buy-countdown");
      if (!cdEl) return;
      const hEl = cdEl.querySelector(".js-cd-h");
      const mEl = cdEl.querySelector(".js-cd-m");
      const sEl = cdEl.querySelector(".js-cd-s");
      const DURATION_MS = 78 * 60 * 60 * 1000;
      const STORAGE_KEY = "straven_offer_deadline";

      function getDeadline() {
        let deadline = parseInt(localStorage.getItem(STORAGE_KEY), 10);
        if (!deadline || isNaN(deadline) || deadline <= Date.now()) {
          deadline = Date.now() + DURATION_MS;
          try { localStorage.setItem(STORAGE_KEY, String(deadline)); } catch (e) {}
        }
        return deadline;
      }

      let deadline = getDeadline();
      function pad(n) { return String(n).padStart(2, "0"); }

      function tick() {
        let remaining = deadline - Date.now();
        if (remaining <= 0) {
          deadline = getDeadline();
          remaining = deadline - Date.now();
        }
        const totalSeconds = Math.floor(remaining / 1000);
        hEl.textContent = pad(Math.floor(totalSeconds / 3600));
        mEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
        sEl.textContent = pad(totalSeconds % 60);
      }
      tick();
      setInterval(tick, 1000);
    })();

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

    // ---- Botón "Solicitar cotización por WhatsApp" (hero + barra mobile) ----
    // Mismo patrón que el botón flotante: número centralizado en config.js,
    // mensaje contextual con el nombre del paquete. Puede haber más de un
    // botón en la página (hero + barra fija de mobile); ambos comparten
    // la misma clase y reciben el mismo link.
    const quoteBtns = document.querySelectorAll(".js-whatsapp-quote");
    if (quoteBtns.length) {
      const cfg = window.STRAVEN_CONFIG || {};
      const number = (cfg.whatsappNumber || "").replace(/[^\d]/g, "");
      const msg = `Hola ${cfg.businessName || "STRAVEN"}, me gustaría solicitar una cotización del paquete "${product.nombre}". ¿Podrían darme más información?`;
      const href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
      quoteBtns.forEach((btn) => (btn.href = href));
    }

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
