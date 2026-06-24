/* =========================================================
   COMPORTAMIENTO GLOBAL — se carga en TODAS las páginas
   (home y producto): animación de aparición al hacer scroll
   y acordeón de Preguntas Frecuentes.
   ========================================================= */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // ---- Menú: hamburguesa en mobile ----
    // El mismo <nav> se muestra inline en desktop y colapsado en mobile;
    // este botón solo alterna su visibilidad y cierra el menú al navegar.
    const burger = document.querySelector(".js-header-burger");
    const headerNav = document.getElementById("header-nav");
    if (burger && headerNav) {
      burger.addEventListener("click", () => {
        const isOpen = headerNav.classList.toggle("is-open");
        burger.classList.toggle("is-open", isOpen);
        burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      headerNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          headerNav.classList.remove("is-open");
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }

    // ---- Animación de aparición al hacer scroll ----
    // Cualquier elemento con clase .reveal entra con un fade + slide sutil
    // la primera vez que cruza el viewport. Usado por textos, fotos/video
    // y, ahora, también por la sección de Preguntas Frecuentes.
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

    // ---- Preguntas Frecuentes: acordeón ----
    // Un clic en la pregunta despliega la respuesta; solo una pregunta
    // permanece abierta a la vez para mantener la sección compacta.
    document.querySelectorAll(".js-faq-toggle").forEach((btn) => {
      const item = btn.closest(".faq-item");
      const answer = item ? item.querySelector(".faq-answer") : null;
      if (!item || !answer) return;

      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            const openBtn = openItem.querySelector(".js-faq-toggle");
            const openAnswer = openItem.querySelector(".faq-answer");
            if (openBtn) openBtn.setAttribute("aria-expanded", "false");
            if (openAnswer) openAnswer.style.maxHeight = null;
          }
        });

        if (isOpen) {
          item.classList.remove("is-open");
          btn.setAttribute("aria-expanded", "false");
          answer.style.maxHeight = null;
        } else {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  });
})();
