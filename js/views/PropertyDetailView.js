class PropertyDetailView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.defaultImage = "img/property-placeholder.svg";
  }

  render(property) {
    if (!this.container) return;

    if (!property) {
      this.renderError("Propiedad no encontrada");
      return;
    }

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
          <a href="index.php">Home</a>
          <span>/</span>
          <a href="index.php">Propiedades</a>
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
            <span class="property-detail__status">${property.status}</span>
          </h1>
          <div class="property-detail__address">
            <span>${property.type} en ${property.location}</span>
            <span>${property.location}</span>
            <span>${property.province}</span>
          </div>
          <div class="property-detail__meta">
            <div class="property-detail__price">
              <span class="properties_price">
                <span class="properties_price_label">${currencySymbol}</span>
                <span class="properties_price_data">${this.formatPrice(property.price)}</span>
                ${priceLabel ? `<span class="properties_price_after">${priceLabel}</span>` : ""}
              </span>
            </div>
            <div class="property-detail__views">
              <span>Ver propiedad</span>
            </div>
          </div>
        </div>

        <div class="property-detail__content">
          <div class="property-detail__description">
            <h3>Descripción</h3>
            <p>${property.description || "No hay descripción disponible."}</p>
          </div>

          <div class="property-detail__details">
            <h4>Detalles</h4>
            <div class="property-detail__details-grid">
              ${this.renderDetailItem("Área", `${property.built} m²`)}
              ${this.renderDetailItem("Dormitorios", property.bedrooms)}
              ${this.renderDetailItem("Baños", property.bathrooms)}
              ${this.renderDetailItem("Estacionamiento", property.parking)}
              ${property.terrace > 0 ? this.renderDetailItem("Terraza", `${property.terrace} m²`) : ""}
              ${property.pool > 0 ? this.renderDetailItem("Piscina", "Sí") : ""}
              ${property.garden > 0 ? this.renderDetailItem("Jardín", "Sí") : ""}
              ${property.area ? this.renderDetailItem("Zona", property.area) : ""}
              ${property.province ? this.renderDetailItem("Provincia", property.province) : ""}
              ${property.subLocation ? this.renderDetailItem("Sububicación", property.subLocation) : ""}
            </div>
          </div>

          ${this.renderFeatures(property.features)}
        </div>

        <div class="property-detail__map">
          <h4>Ubicación</h4>
          <div id="property-map" style="width: 100%; height: 400px; background: #f0f0f0; border-radius: 8px;"></div>
        </div>

        <div class="property-detail__contact">
          <h3>Contactar</h3>
          <p>¿Te interesa esta propiedad? Rellena el formulario y te contactaremos.</p>
          <form id="contact-form" class="contact-form">
            <input type="hidden" name="ref" value="${property.reference}">
            <div class="contact-form__row">
              <div class="contact-form__field">
                <label for="contact-name">Nombre *</label>
                <input type="text" id="contact-name" name="name" required>
              </div>
              <div class="contact-form__field">
                <label for="contact-surname">Apellido *</label>
                <input type="text" id="contact-surname" name="surname" required>
              </div>
            </div>
            <div class="contact-form__row">
              <div class="contact-form__field">
                <label for="contact-email">Email *</label>
                <input type="email" id="contact-email" name="email" required>
              </div>
              <div class="contact-form__field">
                <label for="contact-phone">Teléfono</label>
                <input type="tel" id="contact-phone" name="phone">
              </div>
            </div>
            <div class="contact-form__field">
              <label for="contact-message">Mensaje *</label>
              <textarea id="contact-message" name="message" rows="4" required>Estoy interesado en esta propiedad. Por favor, contacten conmigo.</textarea>
            </div>
            <div class="contact-form__actions">
              <button type="submit" class="sc_button contact-form__submit">Enviar mensaje</button>
            </div>
            <div id="contact-form-message"></div>
          </form>
        </div>

        <div class="property-detail__back">
          <a href="index.php" class="sc_button">« Volver a propiedades</a>
        </div>
      </div>
    `;

    this.bindGalleryEvents();
    this.bindContactForm(property.reference);
    this.initMap(property);
  }

  initMap(property) {
    const mapContainer = document.getElementById("property-map");
    if (!mapContainer) return;

    if (typeof google === "undefined" || !google.maps) {
      mapContainer.innerHTML =
        "<p style='padding:20px;text-align:center;'>Cargando mapa...</p>";
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
        <a href="index.php" class="sc_button">Volver</a>
      </div>
    `;
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="property-detail__loading">
        <div class="loader"></div>
        <p>Cargando propiedad...</p>
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
        <h4>Características</h4>
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
      submitBtn.textContent = "Enviando...";
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
            '<div class="contact-form__success">¡Mensaje enviado correctamente! Te contactaremos pronto.</div>';
          form.reset();
        } else {
          messageDiv.innerHTML = `<div class="contact-form__error">${result.message || "Error al enviar el mensaje. Inténtalo de nuevo."}</div>`;
        }
      } catch (error) {
        messageDiv.innerHTML =
          '<div class="contact-form__error">Error de conexión. Inténtalo de nuevo.</div>';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensaje";
      }
    });
  }
}
