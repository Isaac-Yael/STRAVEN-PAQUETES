/* =========================================================
   STRAVEN — utilidades compartidas
   Formato de precios + botón flotante de WhatsApp.
   (No hay carrito: cada paquete es una compra directa o se
   cotiza por WhatsApp; ver product.js).
   ========================================================= */
(function () {
  function money(n) {
    return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  window.StravenCart = { money };

  document.addEventListener("DOMContentLoaded", setupWhatsappFloat);
})();
