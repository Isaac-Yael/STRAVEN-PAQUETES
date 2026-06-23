/* =========================================================
   CARRITO — STRAVEN
   Carrito persistido en localStorage + checkout por WhatsApp
   ========================================================= */
(function () {
  const STORAGE_KEY = "straven_cart_v1";

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function addToCart(product, qty) {
    qty = qty || 1;
    const cart = getCart();
    const existing = cart.find((i) => i.slug === product.slug);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        slug: product.slug,
        nombre: product.nombre,
        imagen: product.imagen,
        precio: product.precio, // numérico
        precioStr: product.precioStr,
        categoria: product.categoria,
        pzas: product.pzas,
        qty: qty,
      });
    }
    saveCart(cart);
    openCart();
  }

  function removeFromCart(slug) {
    const cart = getCart().filter((i) => i.slug !== slug);
    saveCart(cart);
  }

  function changeQty(slug, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.slug === slug);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      saveCart(cart.filter((i) => i.slug !== slug));
    } else {
      saveCart(cart);
    }
  }

  function clearCart() {
    saveCart([]);
  }

  function cartTotal(cart) {
    return cart.reduce((sum, i) => sum + i.precio * i.qty, 0);
  }

  function cartCount(cart) {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function buildWhatsAppLink(cart) {
    const cfg = window.STRAVEN_CONFIG || {};
    const lines = [];
    lines.push(`Hola ${cfg.businessName || "STRAVEN"}, quiero pedir los siguientes paquetes:`);
    lines.push("");
    cart.forEach((i, idx) => {
      lines.push(`${idx + 1}. ${i.nombre}`);
      lines.push(`   Cantidad: ${i.qty}  |  Precio: ${money(i.precio)} c/u  |  Subtotal: ${money(i.precio * i.qty)}`);
    });
    lines.push("");
    lines.push(`Total estimado: ${money(cartTotal(cart))}`);
    lines.push("");
    lines.push("Quedo atento, gracias.");
    const text = encodeURIComponent(lines.join("\n"));
    const number = (cfg.whatsappNumber || "").replace(/[^\d]/g, "");
    return `https://wa.me/${number}?text=${text}`;
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function renderCart() {
    const cart = getCart();
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = cartCount(cart);

    const itemsWrap = document.getElementById("cart-items");
    const emptyWrap = document.getElementById("cart-empty");
    const footer = document.getElementById("cart-footer");
    if (!itemsWrap) return;

    itemsWrap.innerHTML = "";
    if (cart.length === 0) {
      if (emptyWrap) emptyWrap.style.display = "block";
      if (footer) footer.style.display = "none";
      return;
    }
    if (emptyWrap) emptyWrap.style.display = "none";
    if (footer) footer.style.display = "flex";

    cart.forEach((i) => {
      const node = el(`
        <div class="cart-item" data-slug="${i.slug}">
          <img src="${i.imagen}" alt="${i.nombre}">
          <div class="cart-item-info">
            <div class="cart-item-name">${i.nombre}</div>
            <div class="cart-item-sub">${i.pzas} pzas · ${i.categoria}</div>
            <div class="cart-item-row">
              <div class="qty-stepper">
                <button data-action="dec">−</button>
                <span>${i.qty}</span>
                <button data-action="inc">+</button>
              </div>
              <div class="cart-item-price">${money(i.precio * i.qty)}</div>
            </div>
            <div class="cart-item-row" style="margin-top:8px;">
              <button class="cart-item-remove" data-action="remove">Eliminar</button>
            </div>
          </div>
        </div>
      `);
      node.querySelector('[data-action="inc"]').addEventListener("click", () => changeQty(i.slug, 1));
      node.querySelector('[data-action="dec"]').addEventListener("click", () => changeQty(i.slug, -1));
      node.querySelector('[data-action="remove"]').addEventListener("click", () => removeFromCart(i.slug));
      itemsWrap.appendChild(node);
    });

    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = money(cartTotal(cart));

    const waBtn = document.getElementById("cart-whatsapp-btn");
    if (waBtn) waBtn.href = buildWhatsAppLink(cart);
  }

  function openCart() {
    document.getElementById("cart-drawer")?.classList.add("open");
    document.getElementById("cart-overlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    document.getElementById("cart-drawer")?.classList.remove("open");
    document.getElementById("cart-overlay")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Si el botón flotante se abre desde una página de producto (existe
  // #product-data en el DOM), el mensaje incluye el nombre del paquete que
  // se estaba viendo; si no (catálogo, etc.), usa el mensaje genérico de
  // config.js. Misma plantilla para todos los paquetes, sin nada hardcodeado.
  function buildFloatMessage(cfg) {
    const productDataEl = document.getElementById("product-data");
    if (productDataEl) {
      try {
        const product = JSON.parse(productDataEl.textContent);
        if (product && product.nombre) {
          return `Hola ${cfg.businessName || "STRAVEN"}, estoy interesado en el paquete "${product.nombre}" y quisiera más información, por favor.`;
        }
      } catch (e) {
        // si el JSON no es válido, sigue al mensaje genérico
      }
    }
    return cfg.whatsappDefaultMessage || "Hola, estoy interesado y quisiera más información.";
  }

  function setupWhatsappFloat() {
    const btn = document.getElementById("whatsapp-float-btn");
    if (!btn) return;
    const cfg = window.STRAVEN_CONFIG || {};
    const number = (cfg.whatsappNumber || "").replace(/[^\d]/g, "");
    const text = encodeURIComponent(buildFloatMessage(cfg));
    btn.href = `https://wa.me/${number}?text=${text}`;
  }

  function initCart() {
    renderCart();
    setupWhatsappFloat();
    document.getElementById("cart-btn")?.addEventListener("click", openCart);
    document.getElementById("cart-close")?.addEventListener("click", closeCart);
    document.getElementById("cart-overlay")?.addEventListener("click", closeCart);
    document.getElementById("cart-clear")?.addEventListener("click", () => {
      if (confirm("¿Vaciar tu carrito de pedido?")) clearCart();
    });
  }

  window.StravenCart = {
    getCart,
    addToCart,
    removeFromCart,
    changeQty,
    clearCart,
    renderCart,
    openCart,
    closeCart,
    initCart,
    money,
  };

  document.addEventListener("DOMContentLoaded", initCart);
})();
