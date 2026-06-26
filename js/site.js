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

    // ---- Galería (Productos individuales / Detalles / Video): acordeón ----
    // Cada encabezado funciona como botón desplegable; solo una sección
    // de galería permanece abierta a la vez. El contenido interno (fotos,
    // carrusel, video) no se modifica, solo se muestra u oculta.
    const galleryToggles = Array.from(document.querySelectorAll(".js-gallery-toggle"));
    if (galleryToggles.length) {
      const panelFor = (toggle) => {
        const id = toggle.getAttribute("aria-controls");
        return id ? document.getElementById(id) : null;
      };

      const closeToggle = (toggle) => {
        const panel = panelFor(toggle);
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        if (panel) {
          panel.classList.remove("is-open");
          panel.style.maxHeight = null;
        }
      };

      const openToggle = (toggle) => {
        const panel = panelFor(toggle);
        toggle.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        if (panel) {
          panel.classList.add("is-open");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      };

      const activateToggle = (toggle) => {
        const isOpen = toggle.classList.contains("is-open");
        galleryToggles.forEach((other) => {
          if (other !== toggle) closeToggle(other);
        });
        if (isOpen) closeToggle(toggle); else openToggle(toggle);
      };

      galleryToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => activateToggle(toggle));
        toggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            activateToggle(toggle);
          }
        });

        if (toggle.classList.contains("is-open")) {
          openToggle(toggle);
        }
      });

      window.addEventListener("resize", () => {
        document.querySelectorAll(".gallery-accordion-panel.is-open").forEach((panel) => {
          panel.style.maxHeight = panel.scrollHeight + "px";
        });
      });
    }

    // ---- Acordeón genérico (Ficha técnica, Descripción, FAQ completo) ----
    // Cada sección se abre/cierra de forma independiente: a diferencia de la
    // galería, aquí no hay límite de "solo una abierta a la vez". El panel de
    // FAQ además contiene su propio acordeón de preguntas, así que una vez
    // abierto se quita el límite de alto (max-height:none) para que una
    // pregunta pueda desplegarse sin que el panel exterior la recorte.
    const sectionToggles = Array.from(document.querySelectorAll(".js-section-toggle"));
    if (sectionToggles.length) {
      const panelFor = (toggle) => {
        const id = toggle.getAttribute("aria-controls");
        return id ? document.getElementById(id) : null;
      };

      const setOpen = (toggle, open) => {
        const panel = panelFor(toggle);
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (!panel) return;
        panel.classList.toggle("is-open", open);

        if (open) {
          panel.style.maxHeight = panel.scrollHeight + "px";
          const onEnd = (e) => {
            if (e.propertyName === "max-height") {
              if (panel.classList.contains("is-open")) panel.style.maxHeight = "none";
              panel.removeEventListener("transitionend", onEnd);
            }
          };
          panel.addEventListener("transitionend", onEnd);
        } else {
          // si ya estaba en "none", primero se fija el alto real para
          // poder animar el cierre con una transición de max-height
          panel.style.maxHeight = panel.scrollHeight + "px";
          requestAnimationFrame(() => { panel.style.maxHeight = "0px"; });
        }
      };

      sectionToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => setOpen(toggle, !toggle.classList.contains("is-open")));
        toggle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            setOpen(toggle, !toggle.classList.contains("is-open"));
          }
        });

        if (toggle.classList.contains("is-open")) setOpen(toggle, true);
      });

      window.addEventListener("resize", () => {
        document.querySelectorAll(".accordion-panel.is-open").forEach((panel) => {
          if (panel.style.maxHeight !== "none") panel.style.maxHeight = panel.scrollHeight + "px";
        });
      });
    }
  });
})();
