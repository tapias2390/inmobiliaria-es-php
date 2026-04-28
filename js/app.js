const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("active");
  });
}

const menuDots = document.querySelector(".menu-dots");
if (menuDots) {
  const dotsToggle = menuDots.querySelector(".dots-toggle");
  if (dotsToggle) {
    dotsToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menuDots.classList.toggle("active");
    });
  }
}

document.addEventListener("click", (e) => {
  if (menuDots && !menuDots.contains(e.target)) {
    menuDots.classList.remove("active");
  }
});

const dropdownLinks = document.querySelectorAll(".dropdown > a");
dropdownLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const submenu = link.nextElementSibling;
    link.classList.toggle("active");
    submenu.classList.toggle("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const model = new PropertyModel(CONFIG);
  const view = new PropertyView("properties-container");
  const filterView = new FilterView("filter-container");
  const searchFiltersView = new SearchFiltersView("search-filters-container");
  const propertyTypeFilterView = new PropertyTypeFilterView(
    "property-type-filter",
  );
  const featuresFilterView = new FeaturesFilterView(
    "features-filter-container",
  );
  const paginationView = new PaginationView("pagination-container");
  const controller = new PropertyController(model, view, paginationView);

  // Referencias del modal
  const filterModal = document.getElementById("filterModal");

  filterView.render();
  filterView.bind((filterId) => controller.setFilter(filterId));

  // Listener para promociones
  window.addEventListener("properties:promociones", async (e) => {
    window.isPromoMode = true;
    const { properties, pagination } = e.detail;
    console.log("Total propiedades recibidas de API:", properties.length);

    // Filtrar solo propiedades con descuento (originalPrice > price)
    const promoProperties = properties.filter((p) => {
      const originalPrice = Number(p.OriginalPrice);
      const price = Number(p.Price);
      return originalPrice > price;
    });
    console.log("Propiedades con descuento:", promoProperties.length);

    const data = { Property: promoProperties };
    const transformed = model.transformProperties(data, false);
    console.log("Propiedades transformadas mostradas:", transformed.length);
    view.render(transformed, false, "promo");

    // Usar la paginación que viene de la API (total de la API, no de las filtradas)
    if (pagination) {
      paginationView.render(pagination);
    }
  });

  // Listener para detectar si estamos en modo promociones
  let isPromoMode = false;
  window.addEventListener("properties:promociones", () => {
    isPromoMode = true;
  });
  window.addEventListener("properties:updated", () => {
    isPromoMode = false;
  });

  if (typeof propertyTypeFilterView.render === "function") {
    propertyTypeFilterView.render();
  }
  propertyTypeFilterView.bind((type) => controller.setPropertyType(type));

  searchFiltersView.bind(async (filters) => {
    // Si newDevs está marcado, cargar promociones en lugar de filtros normales
    if (filters.newDevs) {
      if (!filters.location) {
        alert(
          "Por favor selecciona una Ubicación para filtrar las promociones",
        );
        return;
      }
      filterModal.classList.remove("is-open");
      document.body.style.overflow = "";
      const zona = filters.location || "";
      console.log("Cargando promociones con zona:", zona);
      filterView.loadPromociones(1, zona);
      return;
    }

    // Cerrar modal primero
    filterModal.classList.remove("is-open");
    document.body.style.overflow = "";

    // Luego mostrar indicador de carga
    const container = document.getElementById("search-filters-container");
    if (container) {
      container.innerHTML =
        '<div style="text-align:center;padding:20px;"><span class="loader"></span><br>' +
        t("cargando") +
        "</div>";
    }

    // Recargar locations al aplicar filtros
    try {
      const locations = await model.fetchLocations(controller.currentFilter);
      if (locations) {
        searchFiltersView.setLocations(locations);
      }
    } catch (e) {
      console.error("Error loading locations:", e);
    }
    controller.setSearchFilters(filters);
  });

  featuresFilterView.render();
  featuresFilterView.bind((payload) => controller.setSearchFilters(payload));

  // Variable global para detectar modo promociones
  window.isPromoMode = false;

  paginationView.bind((page) => {
    if (window.isPromoMode) {
      filterView.loadPromociones(page);
    } else {
      controller.goToPage(page);
    }
  });

  // Cargar catálogos para filtros dinámicos
  (async () => {
    try {
      const [types, features, locations] = await Promise.all([
        model.fetchPropertyTypes(controller.currentFilter),
        model.fetchFeatures(controller.currentFilter),
        model.fetchLocations(controller.currentFilter),
      ]);

      if (
        Array.isArray(types) &&
        typeof propertyTypeFilterView.setTypes === "function"
      ) {
        propertyTypeFilterView.setTypes(types);
        propertyTypeFilterView.render();
      }

      if (Array.isArray(features)) {
        featuresFilterView.setFeatures(features);
        featuresFilterView.render();
      }

      if (locations) {
        searchFiltersView.setLocations(locations);
      }
    } catch (e) {
      console.warn("No se pudieron cargar catálogos de filtros:", e);
    }
  })();

  // Si hay parámetro ref en URL, aplicar el filtro después del init
  // (si lo hacemos durante init, se ignora por isLoading)
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get("ref");

  controller.init().then(() => {
    if (refParam) {
      controller.setSearchFilters({ reference: refParam });
    }
  });

  // Modal de filtros (los filtros solo existen dentro del modal)
  const filterModalOverlay = document.getElementById("filterModalOverlay");
  const filterModalClose = document.getElementById("filterModalClose");
  const filterModalApply = document.getElementById("filterModalApply");
  const filterToggleBtn = document.getElementById("filterToggleBtn");

  // Abrir modal
  if (filterToggleBtn) {
    filterToggleBtn.addEventListener("click", () => {
      filterModal.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  }

  // Cerrar modal
  const closeFilterModal = () => {
    filterModal.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  if (filterModalOverlay) {
    filterModalOverlay.addEventListener("click", closeFilterModal);
  }

  if (filterModalClose) {
    filterModalClose.addEventListener("click", closeFilterModal);
  }

  // Aplicar filtros desde el modal
  if (filterModalApply) {
    filterModalApply.addEventListener("click", () => {
      closeFilterModal();
    });
  }

  // Cerrar modal con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && filterModal?.classList.contains("is-open")) {
      closeFilterModal();
    }
  });

  // Cuando se aplican filtros (o cambia página), cerrar el modal
  document.addEventListener("properties:updated", () => {
    if (filterModal?.classList.contains("is-open")) {
      closeFilterModal();
    }
  });
});
