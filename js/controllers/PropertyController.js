class PropertyController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentPage = 1;
        this.propertiesPerPage = 12;
    }

    async init() {
        await this.loadProperties();
    }

    async loadProperties() {
        this.view.renderLoading();
        
        try {
            const properties = await this.model.fetchProperties(this.currentPage, this.propertiesPerPage);
            this.view.render(properties);
        } catch (error) {
            this.view.renderError(error.message);
        }
    }

    async loadMore() {
        this.currentPage++;
        
        try {
            const newProperties = await this.model.fetchProperties(this.currentPage, this.propertiesPerPage);
            this.appendProperties(newProperties);
        } catch (error) {
            console.error('Error loading more properties:', error);
        }
    }

    appendProperties(properties) {
        const grid = document.querySelector('.properties-grid');
        if (grid) {
            const html = properties.map(p => this.view.createPropertyCard(p)).join('');
            grid.insertAdjacentHTML('beforeend', html);
        }
    }
}
