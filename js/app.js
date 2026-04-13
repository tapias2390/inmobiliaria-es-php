const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  toggle.classList.toggle("active");
});

const menuDots = document.querySelector(".menu-dots");
if (menuDots) {
  const dotsToggle = menuDots.querySelector(".dots-toggle");
  dotsToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDots.classList.toggle("active");
  });
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

  filterView.render();
  filterView.bind((filterId) => controller.setFilter(filterId));

  propertyTypeFilterView.render();
  propertyTypeFilterView.bind((type) => controller.setPropertyType(type));

  searchFiltersView.render();
  searchFiltersView.bind((filters) => controller.setSearchFilters(filters));

  featuresFilterView.render();
  featuresFilterView.bind((payload) => controller.setSearchFilters(payload));

  paginationView.bind((page) => controller.goToPage(page));

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
        searchFiltersView.render();
      }
    } catch (e) {
      console.warn("No se pudieron cargar catálogos de filtros:", e);
    }
  })();

  controller.init();

  // Modal de filtros (los filtros solo existen dentro del modal)
  const filterModal = document.getElementById("filterModal");
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
