class PropertyView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.defaultImage = "img/property-placeholder.svg";
    this.currentProperties = [];
    this.currentFilter = "1";
  }

  getCurrentProperties() {
    return this.currentProperties;
  }

  render(properties, searchByReference = false) {
    if (!this.container) return;

    this.currentProperties = properties;

    if (properties.length === 0) {
      this.renderEmpty(searchByReference);
      return;
    }

    this.container.innerHTML = this.createPropertyGrid(properties);
  }

  appendProperties(newProperties) {
    if (!this.container || newProperties.length === 0) return;

    this.currentProperties = [...this.currentProperties, ...newProperties];

    const grid = this.container.querySelector(".sc_properties_columns");
    if (grid) {
      grid.innerHTML += newProperties
        .map((p) => this.createPropertyCard(p))
        .join("");
    }
  }

  removeLoadMore() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) loadMoreBtn.remove();
  }

  renderLoadMore(hasMore) {
    this.removeLoadMore();
  }

  bindLoadMore(onLoadMore) {
    this.removeLoadMore();
  }

  renderEmpty(searchByReference = false) {
    const message = searchByReference
      ? "La propiedad no se encuentra disponible"
      : "No se encontraron propiedades.";

    this.container.innerHTML = `
            <div class="trx_addons_message_box trx_addons_message_box_error">
                ${message}
                <div style="margin-top:12px;">
                  <button type="button" class="sc_button" onclick="window.location.href = 'index.php'">Ir al inicio</button>
                </div>
            </div>
        `;
  }

  renderLoading() {
    this.container.innerHTML = `
            <div class="trx_addons_message_box trx_addons_message_box_info">
                <div class="loader"></div>
                <p>${t("cargando")}</p>
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
    const title = `${property.type} ${property.location ? " - " + property.location : ""}`;
    const currencySymbol =
      property.currency === "EUR" ? "€" : property.currency || "";
    const detailUrl = `property.php?ref=${property.reference}&filter=${this.getCurrentFilter()}`;
    const zone =
      property.subLocation || property.location || property.area || "";
    const totalSize =
      Number(property.built || 0) + Number(property.terrace || 0);

    return `
            <div class="trx_addons_column-1_3">
                <div class="sc_properties_item with_image with_content">
                    <div class="post_featured with_thumb hover_icon sc_properties_item_thumb">
                        <a href="${detailUrl}">
                            <img loading="lazy" decoding="async" width="370" height="208" 
                                src="${imageUrl}" 
                                class="attachment-good_homes-thumb-med size-good_homes-thumb-med wp-post-image" 
                                alt="${title}"
                                onerror="this.src='${this.defaultImage}'">
                        </a>
                        <div class="mask"></div>
                        <div class="icons">
                            <a href="${detailUrl}" class="icon-eye-1" aria-label="Ver detalle" title="Ver detalle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="sc_properties_item_info">
                        <div class="sc_properties_item_ref">Ref: ${property.reference || "N/A"}</div>
                        <h5 class="sc_properties_item_title">
                            <a href="${detailUrl}">${title}</a>
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
                                ${
                                  property.rentalPeriod
                                    ? `
                                    ${
                                      property.rentalPrice1 > 0
                                        ? `
                                        <span class="rental-price">${currencySymbol}${this.formatPriceNumber(property.rentalPrice1)} - ${currencySymbol}${this.formatPriceNumber(property.rentalPrice2)}</span>
                                        <span class="properties_price_after">${property.rentalPeriod === "Week" ? "/semana" : property.rentalPeriod === "Month" ? "/mes" : ""}</span>
                                    `
                                        : `
                                        <span class="properties_price_label properties_price_before">${currencySymbol}</span>
                                        <span class="properties_price_data properties_price1">${this.formatPriceNumber(property.price)}</span>
                                    `
                                    }
                                `
                                    : `
                                    ${
                                      property.originalPrice &&
                                      property.originalPrice > property.price
                                        ? `
                                        <span class="discount-badge">-${((1 - property.price / property.originalPrice) * 100).toFixed(2)}%</span>
                                        <span class="properties_price_label properties_price_before" style="text-decoration:line-through;font-size:0.7em;opacity:0.7;">${currencySymbol}${this.formatPriceNumber(property.originalPrice)}</span>
                                        `
                                        : ""
                                    }
                                    <span class="properties_price_label properties_price_before">${currencySymbol}</span>
                                    <span class="properties_price_data properties_price1">${this.formatPriceNumber(property.price)}</span>
                                `
                                }
                            </span>
                        </div>
                        <div class="sc_properties_item_options">
                            <div class="sc_properties_item_row sc_properties_item_row_info" style="display:flex;flex-wrap:wrap;gap:8px;">
                                ${this.createDetailItem("province", property.province, t("provincia") + ":")}
                                ${this.createDetailItem("zone", zone, t("zona") + ":")}
                                ${this.createDetailItem("size", totalSize, t("tamano") + ":", t("metrosCuadrados"))}
                            </div>
                            <div class="sc_properties_item_footer">
                                <div class="sc_properties_item_button sc_item_button">
                                    <a href="${detailUrl}" class="sc_button sc_button_with_icon">${t("verPropiedad")} <span class="sc_button__arrow">${t("flecha")}</span></a>
                                </div>
                                <div class="sc_properties_item_meta">
                                    <div class="sc_properties_item_status">
                                        <span class="sc_properties_item_status_text">${t(property.status)}</span>
                                    </div>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  getCurrentFilter() {
    return String(this.currentFilter || "1");
  }

  setCurrentFilter(filterId) {
    this.currentFilter = String(filterId ?? "1");
  }

  createDetailItem(icon, value, label, suffix = "") {
    if (!value || value === 0) return "";
    const valueText = suffix ? `${value} ${suffix}` : value;
    return `
            <span class="sc_properties_item_option sc_properties_item_${icon}" title="${label}" style="flex:1 1 auto;min-width:120px;">
                <span class="sc_properties_item_option_label_text">${label}</span>
                <span class="sc_properties_item_option_data">${valueText}</span>
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
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) return "Consultar";
    return new Intl.NumberFormat("es-ES").format(n);
  }
}
