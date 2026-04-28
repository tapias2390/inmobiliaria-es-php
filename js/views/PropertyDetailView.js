class PropertyDetailView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.defaultImage = "img/property-placeholder.svg";
  }

  render(property, dateRanges = null) {
    if (!this.container) return;

    if (!property) {
      this.renderError("Propiedad no encontrada");
      return;
    }

    const zone =
      property.subLocation || property.location || property.area || "";

    const hasRental = property.rentalPeriod && property.rentalPeriod !== "";

    const images =
      property.images && property.images.length > 0
        ? property.images
        : [property.mainImage || this.defaultImage];

    const priceLabel = this.getPriceLabel(property);
    const currencySymbol =
      property.currency === "EUR" ? "€" : property.currency;

    this.container.innerHTML = `
      <div class="property-detail">
        <div class="property-detail__breadcrumb">
          <a href="index.php">${t("menuInicio")}</a>
          <span>/</span>
          <a href="index.php">${t("menuPropiedades")}</a>
          <span>/</span>
          <span class="current">${property.type} en ${property.location}</span>
        </div>

        <div class="property-detail__gallery">
          <div class="property-detail__featured">
            <img src="${images[0]}" alt="${property.type} en ${property.location}" 
                 onerror="this.src='${this.defaultImage}'">
          </div>
          <div class="property-detail__thumbs">
            ${images
              .slice(0, 8)
              .map(
                (img, i) => `
              <div class="property-detail__thumb ${i === 0 ? "is-active" : ""}">
                <img src="${img}" alt="Imagen ${i + 1}" 
                     onerror="this.src='${this.defaultImage}'">
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="property-detail__title-wrap">
          <h1 class="property-detail__title">
            ${property.type} en ${property.location}
            <span class="property-detail__status">${t(property.status)}</span>
            <button type="button" class="contact-button-small" id="openContactModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              ${t("contactar")}
            </button>
          </h1>
          <div class="property-detail__ref-bar">
            <span class="property-detail__ref">Referencia: <strong>${property.reference || property.Ref || "N/A"}</strong></span>
          </div>
          <div class="property-detail__address">
            <span>${property.type} en ${property.location}</span>
            <span>${property.location}</span>
            <span>${property.province}</span>
          </div>
          <div class="property-detail__meta">
            <div class="property-detail__price">
              <span class="properties_price">
                ${
                  property.rentalPeriod
                    ? `
                  ${property.rentalPrice1 > 0 ? `<span class="rental-price">${currencySymbol}${this.formatPrice(property.rentalPrice1)} - ${currencySymbol}${this.formatPrice(property.rentalPrice2)}</span>` : `<span class="properties_price_label">${currencySymbol}</span><span class="properties_price_data">${this.formatPrice(property.price)}</span>`}
                  <span class="properties_price_after">${property.rentalPeriod === "Week" ? "/semana" : property.rentalPeriod === "Month" ? "/mes" : ""}</span>
                `
                    : `
                  ${
                    property.originalPrice &&
                    property.originalPrice > property.price
                      ? `
                    <span class="discount-badge">-${((1 - property.price / property.originalPrice) * 100).toFixed(2)}%</span>
                    <span class="properties_price_label" style="text-decoration:line-through;font-size:0.7em;opacity:0.7;">${currencySymbol}${this.formatPrice(property.originalPrice)}</span>
                    `
                      : ""
                  }
                  <span class="properties_price_label">${currencySymbol}</span>
                  <span class="properties_price_data">${this.formatPrice(property.price)}</span>
                  ${priceLabel ? `<span class="properties_price_after">${priceLabel}</span>` : ""}
                `
                }
              </span>
              ${
                hasRental
                  ? `
                <button type="button" class="availability-toggle-btn" id="availabilityToggleBtn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  ${t("verDisponibilidad")}
                </button>
              `
                  : ""
              }
            </div>
            <div class="property-detail__views">
              <span>${t("verPropiedad")}</span>
            </div>
          </div>
        </div>

        <div class="property-detail__content">
          <div class="property-detail__description">
            <h3>${t("descripcion")}</h3>
            <p>${property.description || t("sinDescripcion")}</p>
          </div>

          <div class="property-detail__details">
            <h4>${t("detalles")}</h4>
            <div class="property-detail__details-grid">
              ${this.renderDetailItem(t("area"), `${property.built} m²`)}
              ${this.renderDetailItem(t("dormitorios"), property.bedrooms)}
              ${this.renderDetailItem(t("banos"), property.bathrooms)}
              ${this.renderDetailItem(t("estacionamiento"), property.parking)}
              ${property.terrace > 0 ? this.renderDetailItem(t("terraza"), `${property.terrace} m²`) : ""}
              ${property.pool > 0 ? this.renderDetailItem(t("piscina"), t("si")) : ""}
              ${property.garden > 0 ? this.renderDetailItem(t("jardin"), t("si")) : ""}
              ${zone ? this.renderDetailItem(t("zona"), zone) : ""}
              ${property.province ? this.renderDetailItem(t("provincia"), property.province) : ""}
              ${property.subLocation ? this.renderDetailItem(t("sububicacion"), property.subLocation) : ""}
            </div>
          </div>

          ${
            hasRental
              ? `
            <div id="availabilityModal" class="modal-overlay">
              <div class="modal-content availability-modal">
                <button class="modal-close" id="closeAvailabilityModal">&times;</button>
                <h3>${t("disponibilidad")}</h3>
                <p class="availability-modal-info">${t("fechasReservadas")}</p>
                <div class="availability-modal-ranges" id="availabilityModalRanges">
                  ${dateRanges && Object.keys(dateRanges).length > 0 ? this.renderAvailabilityContent(dateRanges) : '<p class="availability-available">' + t("noReservas") + "</p>"}
                </div>
              </div>
            </div>
          `
              : ""
          }

          ${this.renderFeatures(property.features)}
        </div>

        <div class="property-detail__map">
          <h4>${t("ubicacion")}</h4>
          <div id="property-map" style="width: 100%; height: 400px; background: #f0f0f0; border-radius: 8px;"></div>
        </div>

        <div id="contactModal" class="modal-overlay">
          <div class="modal-content">
            <button class="modal-close" id="closeContactModal">&times;</button>
            <h3>${t("contactar")}</h3>
            <p>${t("contactoTexto")}</p>
            <form id="contact-form" class="contact-form">
              <input type="hidden" name="ref" value="${property.reference}">
              <div class="contact-form__row">
                <div class="contact-form__field">
                  <label for="contact-name">${t("nombre")} *</label>
                  <input type="text" id="contact-name" name="name" required>
                </div>
                <div class="contact-form__field">
                  <label for="contact-surname">${t("apellido")} *</label>
                  <input type="text" id="contact-surname" name="surname" required>
                </div>
              </div>
              <div class="contact-form__row">
                <div class="contact-form__field">
                  <label for="contact-email">${t("email")} *</label>
                  <input type="email" id="contact-email" name="email" required>
                </div>
                <div class="contact-form__field">
                  <label for="contact-phone">${t("telefono")}</label>
                  <input type="tel" id="contact-phone" name="phone">
                </div>
              </div>
              <div class="contact-form__field">
                <label for="contact-message">${t("mensaje")} *</label>
                <textarea id="contact-message" name="message" rows="4" required>${t("mensajeDefault")}</textarea>
              </div>
              <div class="contact-form__actions">
                <button type="submit" class="sc_button contact-form__submit">${t("enviarMensaje")}</button>
              </div>
              <div id="contact-form-message"></div>
            </form>
          </div>
        </div>

        <div class="property-detail__back">
          <a href="index.php" class="sc_button">« ${t("volver")}</a>
        </div>
      </div>
    `;

    this.bindGalleryEvents();
    this.bindContactForm(property.reference);
    this.initMap(property);
    this.bindModalEvents();
    this.bindAvailabilityEvents();
  }

  bindModalEvents() {
    const openBtn = document.getElementById("openContactModal");
    const closeBtn = document.getElementById("closeContactModal");
    const modal = document.getElementById("contactModal");

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("is-open");
          document.body.style.overflow = "";
        }
      });
    }
  }

  initMap(property) {
    const mapContainer = document.getElementById("property-map");
    if (!mapContainer) return;

    if (typeof google === "undefined" || !google.maps) {
      mapContainer.innerHTML =
        "<p style='padding:20px;text-align:center;'>" +
        t("cargandoMapa") +
        "</p>";
      setTimeout(() => this.initMap(property), 1000);
      return;
    }

    const address = [
      property.location,
      property.subLocation,
      property.area,
      property.province,
      "España",
    ]
      .filter(Boolean)
      .join(", ");

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const map = new google.maps.Map(mapContainer, {
          center: location,
          zoom: 14,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        new google.maps.Marker({
          position: location,
          map: map,
          title: property.location || property.type,
          animation: google.maps.Animation.DROP,
        });
      } else {
        mapContainer.innerHTML = `<p style='padding:20px;text-align:center;'>No se pudo cargar el mapa para: ${address}</p>`;
      }
    });
  }

  renderError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="property-detail__error">
        <p>${message}</p>
        <a href="index.php" class="sc_button">${t("volver")}</a>
      </div>
    `;
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="property-detail__loading">
        <div class="loader"></div>
        <p>${t("cargandoDetalle")}</p>
      </div>
    `;
  }

  renderDetailItem(label, value) {
    if (!value || value === 0 || value === "") return "";
    return `
      <div class="property-detail__detail-item">
        <span class="property-detail__label">${label}:</span>
        <span class="property-detail__data">${value}</span>
      </div>
    `;
  }

  renderFeatures(features) {
    if (!features || Object.keys(features).length === 0) return "";

    const allFeatures = [];
    Object.values(features).forEach((values) => {
      if (Array.isArray(values)) {
        allFeatures.push(...values);
      }
    });

    if (allFeatures.length === 0) return "";

    return `
      <div class="property-detail__features">
        <h4>${t("caracteristicas")}</h4>
        <div class="property-detail__features-list">
          ${allFeatures.map((f) => `<span class="property-detail__feature">${f}</span>`).join("")}
        </div>
      </div>
    `;
  }

  getPriceLabel(property) {
    const filter = parseInt(
      new URLSearchParams(window.location.search).get("filter") || "1",
    );
    if (filter === 3) return "/mensual";
    if (filter === 4) return "/temporada";
    return "";
  }

  formatPrice(price) {
    return new Intl.NumberFormat("es-ES").format(price);
  }

  bindGalleryEvents() {
    const thumbs = this.container.querySelectorAll(".property-detail__thumb");
    const featured = this.container.querySelector(
      ".property-detail__featured img",
    );

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        const img = thumb.querySelector("img");
        if (featured && img) {
          featured.src = img.src;
        }
      });
    });
  }

  bindContactForm(reference) {
    const form = document.getElementById("contact-form");
    const messageDiv = document.getElementById("contact-form-message");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        action: "registerLead",
        ref: formData.get("ref"),
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      };

      const submitBtn = form.querySelector(".contact-form__submit");
      submitBtn.disabled = true;
      submitBtn.textContent = t("enviando");
      messageDiv.innerHTML = "";

      try {
        const response = await fetch("api/config.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(data).toString(),
        });

        const result = await response.json();

        if (result.success) {
          messageDiv.innerHTML =
            '<div class="contact-form__success">' +
            t("mensajeEnviado") +
            "</div>";
          form.reset();
        } else {
          messageDiv.innerHTML = `<div class="contact-form__error">${result.message || "Error al enviar el mensaje. Inténtalo de nuevo."}</div>`;
        }
      } catch (error) {
        messageDiv.innerHTML =
          '<div class="contact-form__error">' + t("errorConexion") + "</div>";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("enviarMensaje");
      }
    });
  }

  renderError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="property-detail__error">
        <p>${message}</p>
        <a href="index.php" class="sc_button">${t("volver")}</a>
      </div>
    `;
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="property-detail__loading">
        <div class="loader"></div>
        <p>${t("cargandoDetalle")}</p>
      </div>
    `;
  }

  renderDetailItem(label, value) {
    if (!value || value === 0 || value === "") return "";
    return `
      <div class="property-detail__detail-item">
        <span class="property-detail__label">${label}:</span>
        <span class="property-detail__data">${value}</span>
      </div>
    `;
  }

  renderFeatures(features) {
    if (!features || Object.keys(features).length === 0) return "";

    const allFeatures = [];
    Object.values(features).forEach((values) => {
      if (Array.isArray(values)) {
        allFeatures.push(...values);
      }
    });

    if (allFeatures.length === 0) return "";

    return `
      <div class="property-detail__features">
        <h4>${t("caracteristicas")}</h4>
        <div class="property-detail__features-list">
          ${allFeatures.map((f) => `<span class="property-detail__feature">${f}</span>`).join("")}
        </div>
      </div>
    `;
  }

  getPriceLabel(property) {
    const filter = parseInt(
      new URLSearchParams(window.location.search).get("filter") || "1",
    );
    if (filter === 3) return "/mensual";
    if (filter === 4) return "/temporada";
    return "";
  }

  formatPrice(price) {
    return new Intl.NumberFormat("es-ES").format(price);
  }

  bindGalleryEvents() {
    const thumbs = this.container.querySelectorAll(".property-detail__thumb");
    const featured = this.container.querySelector(
      ".property-detail__featured img",
    );

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
        const img = thumb.querySelector("img");
        if (featured && img) {
          featured.src = img.src;
        }
      });
    });
  }

  bindContactForm(reference) {
    const form = document.getElementById("contact-form");
    const messageDiv = document.getElementById("contact-form-message");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = {
        action: "registerLead",
        ref: formData.get("ref"),
        name: formData.get("name"),
        surname: formData.get("surname"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      };

      const submitBtn = form.querySelector(".contact-form__submit");
      submitBtn.disabled = true;
      submitBtn.textContent = t("enviando");
      messageDiv.innerHTML = "";

      try {
        const response = await fetch("api/config.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(data).toString(),
        });

        const result = await response.json();

        if (result.success) {
          messageDiv.innerHTML =
            '<div class="contact-form__success">' +
            t("mensajeEnviado") +
            "</div>";
          form.reset();
        } else {
          messageDiv.innerHTML = `<div class="contact-form__error">${result.message || "Error al enviar el mensaje. Inténtalo de nuevo."}</div>`;
        }
      } catch (error) {
        messageDiv.innerHTML =
          '<div class="contact-form__error">' + t("errorConexion") + "</div>";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("enviarMensaje");
      }
    });
  }

  renderAvailability(dateRanges) {
    if (!dateRanges || Object.keys(dateRanges).length === 0) {
      return `
        <div class="property-detail__availability" id="availabilitySection">
          <h4>${t("disponibilidad")}</h4>
          <p class="availability-available">${t("noReservas")}</p>
        </div>
      `;
    }

    const ranges = [];
    for (const [start, end] of Object.entries(dateRanges)) {
      ranges.push({ start, end });
    }
    ranges.sort((a, b) => new Date(a.start) - new Date(b.start));

    const formatDate = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return `
      <div class="property-detail__availability" id="availabilitySection">
        <h4>${t("disponibilidad")}</h4>
        <p class="availability-info">${t("fechasReservadas")}</p>
        <div class="availability-ranges">
          ${ranges
            .map(
              (r) => `
            <span class="availability-range">
              <span class="availability-date">${formatDate(r.start)}</span>
              <span class="availability-separator">-</span>
              <span class="availability-date">${formatDate(r.end)}</span>
            </span>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  renderAvailabilityContent(dateRanges) {
    const ranges = [];
    for (const [start, end] of Object.entries(dateRanges)) {
      ranges.push({ start, end });
    }
    ranges.sort((a, b) => new Date(a.start) - new Date(b.start));

    const formatDate = (d) => {
      const date = new Date(d);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    return ranges
      .map(
        (r) => `
      <span class="availability-range">
        <span class="availability-date">${formatDate(r.start)}</span>
        <span class="availability-separator">-</span>
        <span class="availability-date">${formatDate(r.end)}</span>
      </span>
    `,
      )
      .join("");
  }

  bindAvailabilityEvents() {
    const toggleBtn = document.getElementById("availabilityToggleBtn");
    const modal = document.getElementById("availabilityModal");
    const closeBtn = document.getElementById("closeAvailabilityModal");

    if (toggleBtn && modal) {
      toggleBtn.addEventListener("click", () => {
        modal.classList.add("is-open");
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("is-open");
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("is-open");
        }
      });
    }
  }
}
