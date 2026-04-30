class FilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.filters = [
      { id: 1, label: "Venta" },
      { id: 2, label: "Alquiler Corto Plazo" },
      { id: 3, label: "Alquiler Largo Plazo" },
    ];
    this.activeFilter = 1;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="filter-buttons">
        ${this.filters
          .map(
            (f) => `
          <button type="button" 
            class="filter-btn ${f.id === this.activeFilter ? "is-active" : ""}" 
            data-filter="${f.id}">
            ${f.label}
          </button>
        `,
          )
          .join("")}
        <button type="button" class="filter-btn" data-promociones="1">
           Bajada de precio
        </button>
      </div>
    `;
  }

  bind(onFilterChange) {
    if (!this.container) return;

    this.container.addEventListener("click", (e) => {
      const promoBtn = e.target.closest("[data-promociones]");
      if (promoBtn) {
        // Obtener ubicación del filtro
        const locationInput = document.getElementById("sf-location");
        const zona = locationInput ? locationInput.value : "";

        if (!zona) {
          // Cerrar modal si está abierto
          const modal = document.getElementById("filterModal");
          if (modal) modal.classList.remove("is-open");
          document.body.style.overflow = "";
          alert(
            "Por favor selecciona una Ubicación para filtrar las promociones",
          );
          return;
        }

        // Cerrar modal
        const modal = document.getElementById("filterModal");
        if (modal) modal.classList.remove("is-open");
        document.body.style.overflow = "";

        this.loadPromociones(1, zona);
        return;
      }

      const btn = e.target.closest("[data-filter]");
      if (!btn) return;

      const filterId = Number(btn.getAttribute("data-filter"));
      if (!Number.isFinite(filterId)) return;

      this.activeFilter = filterId;
      this.render();

      // Resetear filtros de búsqueda (especialmente newDevs)
      const newDevsCheckbox = document.getElementById("sf-newDevs");
      if (newDevsCheckbox) newDevsCheckbox.checked = false;

      onFilterChange(filterId);
    });
  }

  async loadPromociones(page = 1, zona = "") {
    console.log("loadPromociones llamada con página:", page, "zona:", zona);
    const targetContainer = document.getElementById("properties-container");
    if (targetContainer) {
      targetContainer.innerHTML =
        '<div class="trx_addons_message_box trx_addons_message_box_info"><div class="loader"></div><p>Cargando promociones...</p></div>';
    }

    try {
      const timestamp = Date.now();
      let url = `api/config.php?action=promociones&maxPages=10&_=${timestamp}`;
      if (zona) url += `&zona=${encodeURIComponent(zona)}`;
      console.log("URL llamada:", url);
      console.log(
        "Endpoint completo:",
        new URL(url, window.location.href).toString(),
      );
      const response = await fetch(url);
      console.log("URL completa:", response.url);
      const data = await response.json();
      console.log("X-Debug-URL header:", response.headers.get("X-Debug-URL"));
      console.log("Total propiedades únicas:", data.Property?.length || 0);
      console.log("Debug info:", data._debug);
      console.log("=== PROMOCIONES API ===");
      console.log(
        "Page:",
        page,
        "PropertyCount:",
        data.QueryInfo?.PropertyCount,
        "PropertiesPerPage:",
        data.QueryInfo?.PropertiesPerPage,
      );
      console.log(
        "Propiedades refs:",
        data.Property?.map((p) => p.Reference),
      );
      console.log(
        "Con descuento:",
        data.Property?.filter(
          (p) => Number(p.OriginalPrice) > Number(p.Price),
        ).map((p) => ({
          ref: p.Reference,
          price: p.Price,
          originalPrice: p.OriginalPrice,
        })),
      );

      if (data.Property && data.Property.length > 0) {
        // Sin paginación real - mostrar todo en una página
        const totalDescuentos = data.Property.filter(
          (p) => Number(p.OriginalPrice) > Number(p.Price),
        ).length;
        console.log(
          "Total propiedades:",
          data.Property.length,
          "Con descuento:",
          totalDescuentos,
        );

        const event = new CustomEvent("properties:promociones", {
          detail: {
            properties: data.Property,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              total: totalDescuentos,
            },
          },
        });
        window.dispatchEvent(event);
      } else {
        if (targetContainer) {
          targetContainer.innerHTML =
            '<div class="trx_addons_message_box trx_addons_message_box_info">No se encontraron promociones</div>';
        }
      }
    } catch (error) {
      if (targetContainer) {
        targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_error">Error: ${error.message}</div>`;
      }
    }
  }
}
