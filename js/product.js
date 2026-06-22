/* =========================================================
   PÁGINA DE PRODUCTO — galería con tabs + agregar al carrito
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const galleryDataEl = document.getElementById("gallery-data");
    const productDataEl = document.getElementById("product-data");
    if (!galleryDataEl || !productDataEl) return;

    const gallery = JSON.parse(galleryDataEl.textContent);
    const product = JSON.parse(productDataEl.textContent);

    const mainWrap = document.getElementById("gallery-main");
    const tabsWrap = document.getElementById("gallery-tabs");
    const thumbsWrap = document.getElementById("thumbs");

    const tabKeys = Object.keys(gallery).filter((k) => gallery[k].items && gallery[k].items.length > 0);
    let activeTab = tabKeys[0];

    function setMain(item) {
      if (!item) return;
      if (item.type === "video") {
        mainWrap.innerHTML = `<video controls playsinline ${item.poster ? `poster="${item.poster}"` : ""}><source src="${item.src}"></video>`;
      } else {
        mainWrap.innerHTML = `<img src="${item.src}" alt="${product.nombre}">`;
      }
    }

    function renderThumbs() {
      const items = gallery[activeTab].items;
      thumbsWrap.innerHTML = "";
      if (items.length <= 1) {
        thumbsWrap.style.display = "none";
        return;
      }
      thumbsWrap.style.display = "flex";
      items.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.className = "thumb" + (idx === 0 ? " active" : "") + (item.type === "video" ? " video-thumb" : "");
        if (item.type === "video") {
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        } else {
          btn.innerHTML = `<img src="${item.src}" alt="">`;
        }
        btn.addEventListener("click", () => {
          thumbsWrap.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
          btn.classList.add("active");
          setMain(item);
        });
        thumbsWrap.appendChild(btn);
      });
    }

    function renderTabs() {
      tabsWrap.innerHTML = "";
      tabKeys.forEach((key) => {
        const btn = document.createElement("button");
        btn.className = "gtab" + (key === activeTab ? " active" : "");
        btn.textContent = gallery[key].label;
        btn.addEventListener("click", () => {
          activeTab = key;
          tabsWrap.querySelectorAll(".gtab").forEach((t) => t.classList.remove("active"));
          btn.classList.add("active");
          setMain(gallery[key].items[0]);
          renderThumbs();
        });
        tabsWrap.appendChild(btn);
      });
    }

    if (tabKeys.length) {
      renderTabs();
      setMain(gallery[activeTab].items[0]);
      renderThumbs();
    }

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
    // con PayPal. Por ahora .js-buy-now no tiene listener.
  });
})();
