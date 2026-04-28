class PropertyController {
  constructor(model, view, paginationView = null) {
    this.model = model;
    this.view = view;
    this.paginationView = paginationView;
    this.currentFilter = 1;
    this.currentPropertyType = "";
    this.currentSearchFilters = { sortType: "2" };
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
    //console.log("[Controller] goToPage:", page, "isLoading:", this.isLoading);
    if (this.isLoading) return;
    if (!Number.isFinite(page) || page <= 0) return;
    this.currentPage = page;
    await this.loadProperties();
  }

  async loadProperties() {
    this.view.renderLoading();

    try {
      this.isLoading = true;

      if (this.view && typeof this.view.setCurrentFilter === "function") {
        this.view.setCurrentFilter(this.currentFilter);
      }

      let result;

      // Si hay búsqueda por referencia, usar fetchPropertyByReference
      if (this.currentSearchFilters?.reference) {
        const property = await this.model.fetchPropertyByReference(
          this.currentSearchFilters.reference,
          this.currentFilter,
        );
        result = {
          properties: property ? [property] : [],
          pagination: {
            total: property ? 1 : 0,
            perPage: 1,
            currentPage: 1,
            totalPages: 1,
          },
        };
      } else {
        // Cargar propiedades normal
        result = await this.model.fetchProperties(
          this.currentPage,
          40,
          this.currentFilter,
          this.currentPropertyType,
          this.currentSearchFilters,
        );

        // Filtrar localmente por address/development si hay texto de búsqueda
        const searchText = this.currentSearchFilters?.address
          ?.toLowerCase()
          .trim();
        if (searchText && result.properties?.length > 0) {
          const antes = result.properties.length;
          result.properties = result.properties.filter((p) => {
            if (!p) return false;
            const txt = searchText;
            const s = (str) => (str || "").toLowerCase();
            return (
              s(p.province).includes(txt) ||
              s(p.area).includes(txt) ||
              s(p.location).includes(txt) ||
              s(p.type).includes(txt) ||
              s(p.Description).includes(txt)
            );
          });
          console.log(
            "Filtro:",
            searchText,
            "- antes:",
            antes,
            "después:",
            result.properties.length,
          );
          result.pagination.total = result.properties.length;
        }
      }

      // Indicar si fue búsqueda por referencia
      const searchByReference = !!this.currentSearchFilters?.reference;
      this.view.render(result.properties, searchByReference);

      // Actualizar paginación
      if (this.paginationView) {
        this.paginationView.render(result.pagination);
      }

      document.dispatchEvent(
        new CustomEvent("properties:updated", {
          detail: {
            filter: this.currentFilter,
            page: this.currentPage,
          },
        }),
      );

      /* console.log(
        "[SearchProperties] Propiedades cargadas:",
        result.properties.length,
      );
      /*console.log("Filtro (p_agency_filterid):", this.currentFilter);
      console.log("Tipo propiedad:", this.currentPropertyType || "(todos)");
      console.log("Filtros extra:", this.currentSearchFilters);
      console.log("QueryInfo:", result.pagination);*/
    } catch (error) {
      this.view.renderError(error.message);
    } finally {
      this.isLoading = false;
    }
  }
}
