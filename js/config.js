/* =========================================================
   CONFIGURACIÓN DEL SITIO — STRAVEN
   =========================================================
   Cambia aquí los datos de contacto del negocio.
   ========================================================= */
window.STRAVEN_CONFIG = {
  // Número de WhatsApp Business que recibe los pedidos y el botón flotante.
  // Formato: código de país + número, SIN signos, espacios ni "+".
  whatsappNumber: "525538900271",

  // Mensaje por defecto del botón flotante de WhatsApp (no del carrito).
  // Se usa cuando no hay un paquete específico en pantalla (ej. catálogo);
  // en la página de un producto, cart.js lo sobrescribe con un mensaje que
  // menciona ese paquete en particular.
  whatsappDefaultMessage: "Hola STRAVEN, estoy interesado en sus paquetes al mayoreo y quisiera más información, por favor.",

  businessName: "STRAVEN",
  currency: "MXN",

  // Datos de la cuenta para pagos por transferencia (popup de checkout).
  // % de descuento que se le ofrece al cliente por pagar por transferencia.
  bankTransfer: {
    bank: "BBVA",
    beneficiary: "GRUPO VENGMONT",
    clabe: "012470001154425912",
    account: "0115442591",
  },
  transferDiscountPct: 0.03,
};
