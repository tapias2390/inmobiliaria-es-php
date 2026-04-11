class PropertyController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.currentFilter = 1;
    this.currentPropertyType = "";
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
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
    this.hasMore = true;
    await this.loadProperties();
  }

  async setPropertyType(type) {
    if (this.isLoading) return;
    this.currentPropertyType = type;
    this.currentPage = 1;
    this.hasMore = true;
    await this.loadProperties();
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    this.currentPage++;
    await this.loadProperties(true);
  }

  async loadProperties(append = false) {
    if (!append) {
      this.view.renderLoading();
    }

    try {
      this.isLoading = true;
      const result = await this.model.fetchProperties(
        this.currentPage,
        20,
        this.currentFilter,
        this.currentPropertyType,
      );

      const totalLoaded = append
        ? this.view.getCurrentProperties().length + result.properties.length
        : result.properties.length;

      this.hasMore = totalLoaded < result.pagination.total;

      if (append) {
        this.view.appendProperties(result.properties);
      } else {
        this.view.render(result.properties);
      }

      this.view.renderLoadMore(this.hasMore);
      this.view.bindLoadMore(() => this.loadMore());

      console.log(
        "Filter:",
        this.currentFilter,
        "Type:",
        this.currentPropertyType,
        "Properties loaded:",
        result.properties.length,
      );
      console.log(
        "First 3 properties:",
        result.properties.slice(0, 3).map((p) => ({
          ref: p.reference,
          type: p.type,
          location: p.location,
        })),
      );
    } catch (error) {
      this.view.renderError(error.message);
    } finally {
      this.isLoading = false;
    }
  }
}
