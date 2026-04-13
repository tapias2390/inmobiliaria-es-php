class PropertyController {
  constructor(model, view, paginationView = null) {
    this.model = model;
    this.view = view;
    this.paginationView = paginationView;
    this.currentFilter = 1;
    this.currentPropertyType = "";
    this.currentSearchFilters = {};
    this.currentPage = 1;
    this.isLoading = false;
  }

  async init() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.currentPage = 1;
    await this.loadProperties();
  }

  async setFilter(filterId) {
    if (this.isLoading) return;
    this.currentFilter = filterId;
    this.currentPage = 1;
    await this.loadProperties();
  }

  async setPropertyType(type) {
    if (this.isLoading) return;
    this.currentPropertyType = type;
    this.currentPage = 1;
    await this.loadProperties();
  }

  async setSearchFilters(filters) {
    if (this.isLoading) return;
    await this.updateSearchFilters(filters || {});
  }

  async updateSearchFilters(partial) {
    if (this.isLoading) return;
    this.currentSearchFilters = {
      ...(this.currentSearchFilters || {}),
      ...(partial || {}),
    };
    this.currentPage = 1;
    await this.loadProperties();
  }

  async goToPage(page) {
    console.log("[Controller] goToPage:", page, "isLoading:", this.isLoading);
    if (this.isLoading) return;
    if (!Number.isFinite(page) || page <= 0) return;
    this.currentPage = page;
    await this.loadProperties();
  }

  async loadProperties() {
    this.view.renderLoading();

    try {
      this.isLoading = true;

      // Cargar propiedades (hace múltiples llamadas si es necesario)
      const result = await this.model.fetchProperties(
        this.currentPage,
        40,
        this.currentFilter,
        this.currentPropertyType,
        this.currentSearchFilters,
      );

      this.view.render(result.properties);

      // Actualizar paginación
      if (this.paginationView) {
        this.paginationView.render(result.pagination);
      }

      console.log(
        "[SearchProperties] Propiedades cargadas:",
        result.properties.length,
      );
      console.log("Filtro (p_agency_filterid):", this.currentFilter);
      console.log("Tipo propiedad:", this.currentPropertyType || "(todos)");
      console.log("Filtros extra:", this.currentSearchFilters);
      console.log("QueryInfo:", result.pagination);
    } catch (error) {
      this.view.renderError(error.message);
    } finally {
      this.isLoading = false;
    }
  }
}
