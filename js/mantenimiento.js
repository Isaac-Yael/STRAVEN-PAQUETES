/* =========================================================
   MODO REPARACIÓN — STRAVEN
   =========================================================
   Para ACTIVAR:    pon ACTIVO = true
   Para DESACTIVAR: pon ACTIVO = false  (y sube el cambio)

   Con el modo activo, cualquier página de la tienda (inicio y
   páginas de paquetes) redirige a catalogo.html, que muestra un
   aviso de "tienda en reparación" y el botón de descarga del PDF.
   ========================================================= */
(function () {
  var ACTIVO = true;
  if (!ACTIVO) return;

  var script = document.currentScript;
  if (!script) return;
  var catalogoUrl = new URL("../catalogo.html", script.src);
  var estaEnCatalogo = location.pathname.replace(/\/+$/, "").split("/").pop() === "catalogo.html";

  if (!estaEnCatalogo) {
    location.replace(catalogoUrl.href);
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.querySelector(".catalog-hero");
    if (!hero || document.getElementById("aviso-reparacion")) return;
    var aviso = document.createElement("div");
    aviso.id = "aviso-reparacion";
    aviso.setAttribute("role", "status");
    aviso.style.cssText =
      "margin:0 auto 24px;max-width:560px;padding:14px 18px;border-radius:12px;" +
      "border:1px solid rgba(255,193,7,.5);background:rgba(255,193,7,.12);" +
      "color:inherit;font-weight:600;line-height:1.4;text-align:center;";
    aviso.innerHTML =
      "🛠️ Nuestra tienda en línea está en reparación.<br>" +
      "<span style=\"font-weight:400\">Descarga el catálogo y pide tu paquete por WhatsApp.</span>";
    hero.insertBefore(aviso, hero.firstChild);
  });
})();
