class PropertyController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.currentFilter = 1;
    this.isLoading = false;
  }

  async init() {
    if (this.isLoading) return;
    this.isLoading = true;

    await this.loadProperties();
  }

  async setFilter(filterId) {
    if (this.isLoading) return;
    this.currentFilter = filterId;
    await this.loadProperties();
  }

  async loadProperties() {
    this.view.renderLoading();

    try {
      this.isLoading = true;
      const result = await this.model.fetchProperties(
        1,
        10,
        this.currentFilter,
      );

      this.view.render(result.properties);
    } catch (error) {
      this.view.renderError(error.message);
    } finally {
      this.isLoading = false;
    }
  }
}
