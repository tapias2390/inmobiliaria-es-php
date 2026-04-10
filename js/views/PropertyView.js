class PropertyView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.defaultImage = "img/property-placeholder.svg";
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
            <div class="trx_addons_message_box trx_addons_message_box_error">
                No se encontraron propiedades.
            </div>
        `;
  }

  renderLoading() {
    this.container.innerHTML = `
            <div class="trx_addons_message_box trx_addons_message_box_info">
                <div class="loader"></div>
                <p>Cargando propiedades...</p>
            </div>
        `;
  }

  renderError(message) {
    this.container.innerHTML = `
            <div class="trx_addons_message_box trx_addons_message_box_error">
                Error: ${message}
            </div>
        `;
  }

  createPropertyGrid(properties) {
    return `
            <div class="sc_properties_columns trx_addons_columns_wrap">
                ${properties.map((p) => this.createPropertyCard(p)).join("")}
            </div>
        `;
  }

  createPropertyCard(property) {
    const imageUrl = property.mainImage || this.defaultImage;
    const title = `${property.type} ${property.location ? "– " + property.location : ""}`;
    const currencySymbol =
      property.currency === "EUR" ? "€" : property.currency || "";

    return `
            <div class="trx_addons_column-1_3">
                <div class="sc_properties_item with_image with_content">
                    <div class="post_featured with_thumb hover_icon sc_properties_item_thumb">
                        <img loading="lazy" decoding="async" width="370" height="208" 
                            src="${imageUrl}" 
                            class="attachment-good_homes-thumb-med size-good_homes-thumb-med wp-post-image" 
                            alt="${title}"
                            onerror="this.src='${this.defaultImage}'">
                        <div class="mask"></div>
                        <div class="icons">
                            <a href="#" aria-hidden="true" class="icon-eye-1"></a>
                        </div>
                    </div>
                    <div class="sc_properties_item_info">
                        <h5 class="sc_properties_item_title">
                            <a href="#">${title}</a>
                        </h5>
                        <div class="sc_properties_item_header">
                            <div class="sc_properties_item_row sc_properties_item_row_address">
                                <span class="sc_properties_item_option sc_properties_item_address" title="Address">
                                    <span class="sc_properties_item_option_label">
                                        <span class="sc_properties_item_option_label_icon trx_addons_icon-home"></span>
                                        <span class="sc_properties_item_option_label_text">Dirección:</span>
                                    </span>
                                    <span class="sc_properties_item_option_data">
                                        <span class="properties_address">
                                            <span class="properties_address_item">${title}</span>
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div class="sc_properties_item_type">
                                <span>${property.type}</span>
                                <span class="sc_properties_item_option_data"></span>
                            </div>
                        </div>
                        <div class="sc_properties_item_price">
                            <span class="properties_price">
                                <span class="properties_price_label properties_price_before">${currencySymbol}</span>
                                <span class="properties_price_data properties_price1">${this.formatPriceNumber(property.price)}</span>
                            </span>
                        </div>
                        <div class="sc_properties_item_options">
                            <div class="sc_properties_item_row sc_properties_item_row_info"></div>
                            <div class="sc_properties_item_row sc_properties_item_row_info">
                                ${this.createDetailItem("bedrooms", property.bedrooms, "Camas:")}
                                ${this.createDetailItem("bathrooms", property.bathrooms, "Baños:")}
                                ${this.createDetailItem("garages", property.parking, "Estacionamiento:")}
                            </div>
                            <div class="sc_properties_item_footer">
                                <div class="sc_properties_item_button sc_item_button">
                                    <a href="#" class="sc_button sc_button_with_icon">VER PROPIEDAD <span class="sc_button__arrow">→</span></a>
                                </div>
                                <div class="sc_properties_item_meta">
                                    <div class="sc_properties_item_status">
                                        <span class="sc_properties_item_status_text">${property.status}</span>
                                    </div>
                                    <div class="sc_properties_item_actions">
                                        <button type="button" class="sc_properties_action sc_properties_action_fav" title="Favorito">❤</button>
                                        <button type="button" class="sc_properties_action sc_properties_action_compare" title="Comparar">⚖</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  createDetailItem(icon, value, label) {
    if (!value || value === 0) return "";
    return `
            <span class="sc_properties_item_option sc_properties_item_${icon}" title="${label}">
                <span class="sc_properties_item_option_label_text">${label}</span>
                <span class="sc_properties_item_option_data">${value}</span>
            </span>
        `;
  }

  formatPrice(price, currency) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatPriceNumber(price) {
    return new Intl.NumberFormat("es-ES").format(price);
  }
}
