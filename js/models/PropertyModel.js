class PropertyModel {
  constructor(config) {
    this.config = config;
    this._cache = {
      features: null,
      propertyTypes: null,
      locations: null,
    };
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

  async fetchProperties(
    page = 1,
    limit = 10,
    filter = 1,
    propertyType = "",
    extraFilters = {},
  ) {
    const params = new URLSearchParams({
      page: page,
      limit: limit,
      filter: filter,
    });
    if (propertyType) {
      params.append("propertyTypes", propertyType);
    }

    const allowedExtra = [
      "beds",
      "baths",
      "minPrice",
      "maxPrice",
      "location",
      "province",
      "sortType",
      "newDevs",
      "featuresMust",
      "featuresPrefer",
    ];

    allowedExtra.forEach((k) => {
      if (!extraFilters || !(k in extraFilters)) return;
      const v = extraFilters[k];
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) {
        const csv = v
          .map((x) => String(x))
          .filter(Boolean)
          .join(",");
        if (csv) params.append(k, csv);
        return;
      }
      if (typeof v === "boolean") {
        if (v) params.append(k, "1");
        return;
      }
      params.append(k, String(v));
    });

    console.log(
      "API URL:",
      `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`,
    );

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response for filter:", data.QueryInfo);

    const properties = this.transformProperties(data);
    const queryInfo = data.QueryInfo || {};
    const total = Number(queryInfo.PropertyCount || 0);
    const perPage = Number(queryInfo.PropertiesPerPage || limit);
    const currentPage = Number(queryInfo.CurrentPage || 1);
    const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 1;

    console.log(
      `[fetchProperties] Página ${currentPage}/${totalPages}, ${properties.length} propiedades de ${total}`,
    );

    return {
      properties: properties,
      pagination: {
        total,
        perPage,
        currentPage,
        totalPages,
      },
    };
  }

  transformPagination(data, limit = 40, userPage = 1) {
    const queryInfo = data.QueryInfo || {};
    const total = Number(queryInfo.PropertyCount || 0);

    // Calcular páginas basándose en el límite de 40 propiedades por "página" del usuario
    const perPage = limit;
    const totalPages = Math.ceil(total / perPage);

    // Usar la página del usuario directamente
    const currentPage = userPage;

    return {
      total,
      perPage,
      currentPage,
      totalPages,
    };
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
      images: this.extractImages(property),
      mainImage: property.MainImage || this.extractImages(property)[0] || "",
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

  async fetchPropertyByReference(reference) {
    const params = new URLSearchParams({
      ref: reference,
    });

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    const properties = this.transformProperties(data);
    return properties.length > 0 ? properties[0] : null;
  }

  async fetchFeatures(filter = 1) {
    if (this._cache.features) return this._cache.features;

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?action=features&filter=${encodeURIComponent(
      String(filter),
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();

    // Normalizar: quedarnos con ParamName (se usa como parámetro) + texto
    const out = [];
    const groups = data?.Features || data?.FeatureGroups || data;

    // Intento genérico: recorrer objetos/arrays y buscar elementos con ParamName + Name
    const visit = (node) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (typeof node !== "object") return;

      if (node.ParamName && (node.Name || node.ParamText || node.Description)) {
        out.push({
          value: String(node.ParamName),
          label: String(node.Name || node.ParamText || node.Description),
        });
      }

      Object.values(node).forEach(visit);
    };

    visit(groups);

    // dedupe
    const seen = new Set();
    const uniq = out.filter((x) => {
      if (!x.value || seen.has(x.value)) return false;
      seen.add(x.value);
      return true;
    });

    uniq.sort((a, b) => a.label.localeCompare(b.label, "es"));
    this._cache.features = uniq;
    return uniq;
  }

  async fetchPropertyTypes(filter = 1) {
    if (this._cache.propertyTypes) return this._cache.propertyTypes;

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?action=propertyTypes&filter=${encodeURIComponent(
      String(filter),
    )}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();

    const list = data?.PropertyType || data?.propertyType || [];
    const out = [];

    const visit = (node) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (typeof node !== "object") return;

      if (node.TypeId && (node.NameType || node.Name)) {
        out.push({
          id: String(node.TypeId),
          label: String(node.NameType || node.Name),
        });
      }

      Object.values(node).forEach(visit);
    };
    visit(list);

    const seen = new Set();
    const uniq = out.filter((x) => {
      if (!x.id || seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
    uniq.sort((a, b) => a.label.localeCompare(b.label, "es"));

    this._cache.propertyTypes = [{ id: "", label: "Todos los tipos" }, ...uniq];
    return this._cache.propertyTypes;
  }

  async fetchLocations(filter = 1) {
    if (this._cache.locations) return this._cache.locations;

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?action=locations&filter=${encodeURIComponent(
      String(filter),
    )}&all=TRUE&sortType=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();

    const provinces = new Map();

    const visit = (node, currentProvince = null) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach((x) => visit(x, currentProvince));
        return;
      }
      if (typeof node !== "object") return;

      const provinceName =
        node.ProvinceAreaName || node.ProvinceName || currentProvince;
      if (provinceName && node.Location && Array.isArray(node.Location)) {
        if (!provinces.has(provinceName))
          provinces.set(provinceName, new Set());
        node.Location.forEach((loc) => {
          if (loc) provinces.get(provinceName).add(String(loc));
        });
      }

      Object.values(node).forEach((v) => visit(v, provinceName));
    };

    visit(data);

    const provincesArr = [...provinces.keys()].sort((a, b) =>
      a.localeCompare(b, "es"),
    );

    const locationsByProvince = {};
    provincesArr.forEach((p) => {
      locationsByProvince[p] = [...provinces.get(p)].sort((a, b) =>
        a.localeCompare(b, "es"),
      );
    });

    this._cache.locations = {
      provinces: provincesArr,
      locationsByProvince,
    };
    return this._cache.locations;
  }
}
