class FilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.filters = [
      { id: 1, labelKey: "venta" },
      { id: 2, labelKey: "alquilerCorto" },
      { id: 3, labelKey: "alquilerLargo" },
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
            ${t(f.labelKey)}
          </button>
        `,
          )
          .join("")}
        <button type="button" class="filter-btn" data-promociones="1">
           ${t("bajadaPrecio")}
        </button>
        <button type="button" class="filter-btn" data-nuevo="1">
           ${t("nuevaPromocion")}
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
          alert(t("seleccionaUbicacionPromociones"));
          return;
        }

        // Cerrar modal
        const modal = document.getElementById("filterModal");
        if (modal) modal.classList.remove("is-open");
        document.body.style.overflow = "";

        this.loadPromociones(1, zona);
        return;
      }

      const nuevoBtn = e.target.closest("[data-nuevo]");
      if (nuevoBtn) {
        // Cerrar modal
        const modal = document.getElementById("filterModal");
        if (modal) modal.classList.remove("is-open");
        document.body.style.overflow = "";

        // Usar filter 5 + P_New_Devs=true para Nueva Promoción con paginación
        this.loadNuevaPromocion(1);
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

  async loadPromociones(page = 1, zona = "", tipoPromo = "bajada") {
    console.log(
      "loadPromociones llamada con página:",
      page,
      "zona:",
      zona,
      "tipo:",
      tipoPromo,
    );
    const targetContainer = document.getElementById("properties-container");
    const loadingMsg =
      tipoPromo === "newDevs"
        ? t("cargandoNuevasPromociones")
        : t("cargandoPromociones");
    if (targetContainer) {
      targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info"><div class="loader"></div><p>${loadingMsg}</p></div>`;
    }

    try {
      const timestamp = Date.now();
      let url = `api/config.php?action=promociones&maxPages=10&_=${timestamp}`;
      if (zona) url += `&zona=${encodeURIComponent(zona)}`;
      if (tipoPromo === "newDevs") url += `&newDevs=1`;
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

        // Para newDevs, filtrar solo propiedades New Development
        let propiedadesFiltradas = data.Property;
        let totalMostrado = data.Property.length;

        if (tipoPromo === "newDevs") {
          propiedadesFiltradas = data.Property.filter(
            (p) => p.PropertyType?.NameType === "New Development",
          );
          totalMostrado = propiedadesFiltradas.length;
          console.log(
            "Total propiedades:",
            data.Property.length,
            "New Developments:",
            totalMostrado,
          );
        } else {
          console.log(
            "Total propiedades:",
            data.Property.length,
            "Con descuento:",
            totalDescuentos,
          );
        }

        const event = new CustomEvent("properties:promociones", {
          detail: {
            properties: propiedadesFiltradas,
            mode: tipoPromo,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              total: totalMostrado,
            },
          },
        });
        window.dispatchEvent(event);
      } else {
        if (targetContainer) {
          targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info">${t("noSeEncontraronPromociones")}</div>`;
        }
      }
    } catch (error) {
      if (targetContainer) {
        targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_error">Error: ${error.message}</div>`;
      }
    }
  }

  async loadNuevos(page = 1) {
    console.log("loadNuevos llamada con página:", page);
    const targetContainer = document.getElementById("properties-container");
    if (targetContainer) {
      targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info"><div class="loader"></div><p>${t("cargandoInmueblesNuevos")}</p></div>`;
    }

    try {
      const timestamp = Date.now();
      const url = `api/config.php?action=promociones&maxPages=10&tipo=nuevo&_=${timestamp}`;
      console.log("URL llamada:", url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.Property && data.Property.length > 0) {
        console.log("Total propiedades nuevas:", data.Property.length);

        const event = new CustomEvent("properties:promociones", {
          detail: {
            properties: data.Property,
            mode: "nuevo",
            pagination: {
              currentPage: 1,
              totalPages: 1,
              total: data.Property.length,
            },
          },
        });
        window.dispatchEvent(event);
      } else {
        if (targetContainer) {
          targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info">${t("noSeEncontraronNuevasPromociones")}</div>`;
        }
      }
    } catch (error) {
      if (targetContainer) {
        targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_error">Error: ${error.message}</div>`;
      }
    }
  }

  async loadNuevaPromocion(page = 1) {
    console.log("loadNuevaPromocion llamada con página:", page);
    const targetContainer = document.getElementById("properties-container");
    const paginationContainer = document.getElementById("pagination-container");

    if (targetContainer) {
      targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info"><div class="loader"></div><p>${t("cargandoNuevasPromociones")}</p></div>`;
    }
    if (paginationContainer) {
      paginationContainer.innerHTML = "";
    }

    try {
      const timestamp = Date.now();
      // Usar filter=5 + P_New_Devs=true para Nueva Promoción
      const url = `api/config.php?filter=5&newDevs=1&page=${page}&limit=40&_=${timestamp}`;
      console.log("URL llamada (Nueva Promoción):", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log(
        "Nueva Promoción - PropertyCount:",
        data.QueryInfo?.PropertyCount,
      );

      if (data.Property && data.Property.length > 0) {
        const total = Number(data.QueryInfo?.PropertyCount || 0);
        const perPage = Number(data.QueryInfo?.PropertiesPerPage || 40);
        const totalPages = Math.ceil(total / perPage);

        console.log(
          "Total:",
          total,
          "PerPage:",
          perPage,
          "TotalPages:",
          totalPages,
        );

        // Transformar propiedades
        const model = new PropertyModel(CONFIG);
        const properties = model.transformProperties(data);

        const event = new CustomEvent("properties:promociones", {
          detail: {
            properties: properties,
            mode: "nuevaPromocion",
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              total: total,
              perPage: perPage,
            },
          },
        });
        window.dispatchEvent(event);
      } else {
        if (targetContainer) {
          targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_info">${t("noSeEncontraronNuevasPromociones")}</div>`;
        }
      }
    } catch (error) {
      console.error("Error loadNuevaPromocion:", error);
      if (targetContainer) {
        targetContainer.innerHTML = `<div class="trx_addons_message_box trx_addons_message_box_error">Error: ${error.message}</div>`;
      }
    }
  }
}
