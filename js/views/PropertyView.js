class PropertyView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(properties) {
        if (!this.container) return;
        
        if (properties.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = this.createPropertyGrid(properties);
    }

    renderEmpty() {
        this.container.innerHTML = `
            <div class="properties-empty">
                <p>No se encontraron propiedades.</p>
            </div>
        `;
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="properties-loading">
                <div class="loader"></div>
                <p>Cargando propiedades...</p>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="properties-error">
                <p>Error: ${message}</p>
            </div>
        `;
    }

    createPropertyGrid(properties) {
        return `
            <div class="properties-grid">
                ${properties.map(p => this.createPropertyCard(p)).join('')}
            </div>
        `;
    }

    createPropertyCard(property) {
        const imageUrl = property.mainImage || this.getPlaceholderImage();
        const priceFormatted = this.formatPrice(property.price, property.currency);
        
        return `
            <article class="property-card">
                <div class="property-card__image">
                    <img src="${imageUrl}" alt="${property.type} en ${property.location}" loading="lazy">
                    <span class="property-card__status property-card__status--${property.status.toLowerCase()}">
                        ${property.status}
                    </span>
                </div>
                <div class="property-card__content">
                    <div class="property-card__header">
                        <span class="property-card__type">${property.type}</span>
                        <span class="property-card__location">${property.location}</span>
                    </div>
                    <h3 class="property-card__price">${priceFormatted}</h3>
                    <div class="property-card__details">
                        ${this.createDetailItem('bed', property.bedrooms, 'hab')}
                        ${this.createDetailItem('bath', property.bathrooms, 'bañ')}
                        ${this.createDetailItem('ruler', property.built, 'm²')}
                    </div>
                    <p class="property-card__ref">Ref: ${property.reference}</p>
                </div>
            </article>
        `;
    }

    createDetailItem(icon, value, suffix) {
        if (!value || value === 0) return '';
        return `
            <span class="property-card__detail">
                <span class="property-card__detail-value">${value}</span> ${suffix}
            </span>
        `;
    }

    formatPrice(price, currency) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E';
    }
}
