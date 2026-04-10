class PropertyModel {
  constructor(config) {
    this.config = config;
    this.translations = {
      status: {
        Available: "Disponible",
        "Under Offer": "En oferta",
        "Sale Agreed": "Venta acordada",
        Sold: "Vendido",
        "With Reservation": "Con reserva",
      },
      propertyType: {
        Garage: "Garaje",
        "Parking Space": "Plaza de parking",
        "Storage Room": "Trastero",
        Apartment: "Apartamento",
        Villa: "Villa",
        House: "Casa",
        Penthouse: "Ático",
        Studio: "Estudio",
        Townhouse: "Casa adosada",
        Bungalow: "Bungalow",
        Finca: "Finca",
        Plot: "Parcela",
        Commercial: "Comercial",
        Office: "Oficina",
        Restaurant: "Restaurante",
        Shop: "Tienda",
        Hotel: "Hotel",
      },
    };
  }

  async fetchProperties(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page,
      limit: limit,
    });

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return this.transformProperties(data);
  }

  transformProperties(data) {
    const properties = data.Property || [];

    return properties.map((property) => ({
      reference: property.Reference,
      location: property.Location,
      subLocation: property.SubLocation || "",
      area: property.Area,
      province: property.Province,
      type: this.translateType(property.PropertyType?.NameType || "N/A"),
      status: this.translateStatus(property.Status?.system || "N/A"),
      bedrooms: property.Bedrooms || 0,
      bathrooms: property.Bathrooms || 0,
      price: parseFloat(property.Price) || 0,
      currency: property.Currency || "EUR",
      originalPrice: property.OriginalPrice || property.Price,
      built: property.Built || 0,
      terrace: property.Terrace || 0,
      pool: property.Pool || 0,
      parking: property.Parking || 0,
      garden: property.Garden || 0,
      description: this.stripHtml(property.Description || ""),
      mainImage: property.MainImage || "",
      images: this.extractImages(property),
      features: this.extractFeatures(property.PropertyFeatures),
    }));
  }

  stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  extractImages(property) {
    if (property.Pictures?.Picture) {
      return property.Pictures.Picture.map((p) => p.PictureURL);
    }
    return property.MainImage ? [property.MainImage] : [];
  }

  extractFeatures(propertyFeatures) {
    if (!propertyFeatures?.Category) return {};

    const features = {};
    propertyFeatures.Category.forEach((cat) => {
      features[cat.Type] = cat.Value;
    });
    return features;
  }

  translateStatus(status) {
    return this.translations.status[status] || status;
  }

  translateType(type) {
    return this.translations.propertyType[type] || type;
  }
}
