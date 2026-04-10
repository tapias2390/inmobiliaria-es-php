class PropertyController {
  constructor(model, view, paginationView) {
    this.model = model;
    this.view = view;
    this.paginationView = paginationView;
    this.currentPage = 1;
    this.propertiesPerPage = 10;
    this.isLoading = false;
  }

  async init() {
    if (this.isLoading) return;
    this.isLoading = true;

    if (this.paginationView) {
      this.paginationView.bind((page) => this.goToPage(page));
    }

    await this.loadProperties();
  }

  async goToPage(page) {
    if (this.isLoading) return;
    if (!Number.isFinite(page) || page <= 0) return;
    this.currentPage = page;
    await this.loadProperties();
  }

  async loadProperties() {
    this.view.renderLoading();

    try {
      this.isLoading = true;
      const result = await this.model.fetchProperties(
        this.currentPage,
        this.propertiesPerPage,
      );

      this.view.render(result.properties);
      if (this.paginationView) {
        this.paginationView.render(result.pagination);
      }
    } catch (error) {
      this.view.renderError(error.message);
      if (this.paginationView) {
        this.paginationView.render({ totalPages: 0 });
      }
    } finally {
      this.isLoading = false;
    }
  }
}
