class PropertyModel {
  constructor(config) {
    this.config = config;
    this._cache = {
      features: null,
      propertyTypesByFilter: {},
      locations: null,
      provinceCountsByFilter: {},
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
      "builtMin",
      "builtMax",
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

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    const properties = this.transformProperties(data);
    //console.log("Propiedades:", properties);
    const queryInfo = data.QueryInfo || {};
    const total = Number(queryInfo.PropertyCount || 0);
    const perPage = Number(queryInfo.PropertiesPerPage || limit);
    const currentPage = Number(queryInfo.CurrentPage || 1);
    const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 1;

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

  transformPagination(data, limit = 30, userPage = 1) {
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
      bedrooms: Number(property.Bedrooms) || 0,
      bathrooms: Number(property.Bathrooms) || 0,
      price: this.extractPrice(property),
      currency: property.Currency || "EUR",
      originalPrice: property.OriginalPrice || property.Price,
      rentalPrice1: Number(property.RentalPrice1) || 0,
      rentalPrice2: Number(property.RentalPrice2) || 0,
      rentalPeriod: property.RentalPeriod || "",
      built: Number(property.Built) || 0,
      terrace: Number(property.Terrace) || 0,
      gardenPlot: Number(property.GardenPlot) || 0,
      pool: Number(property.Pool) || 0,
      parking: Number(property.Parking) || 0,
      garden: Number(property.Garden) || 0,
      description: this.stripHtml(property.Description || ""),
      images: this.extractImages(property),
      mainImage: property.MainImage || this.extractImages(property)[0] || "",
      features: this.extractFeatures(property.PropertyFeatures),
    }));
  }

  extractPrice(property) {
    const base = Number(property?.Price) || 0;
    if (base > 0) return base;

    const candidates = [];
    const visited = new Set();

    const visit = (node, parentKey = "") => {
      if (node === null || node === undefined) return;

      if (typeof node === "object") {
        if (visited.has(node)) return;
        visited.add(node);

        if (Array.isArray(node)) {
          node.forEach((x) => visit(x, parentKey));
          return;
        }

        Object.entries(node).forEach(([k, v]) => {
          const key = `${parentKey}.${String(k)}`;
          visit(v, key);
        });
        return;
      }

      const keyLower = String(parentKey || "").toLowerCase();
      if (
        !(
          keyLower.includes("price") ||
          keyLower.includes("rent") ||
          keyLower.includes("rental")
        )
      ) {
        return;
      }

      const n =
        typeof node === "number"
          ? node
          : Number(String(node).replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(n) && n > 0) {
        candidates.push(n);
      }
    };

    visit(property, "property");

    if (candidates.length === 0) return 0;
    candidates.sort((a, b) => a - b);
    return candidates[0];
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

  async fetchBookingCalendar(refId, startDate = "", endDate = "") {
    const params = new URLSearchParams({
      action: "bookingCalendar",
      ref: refId,
    });
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    return data?.DateRanges || {};
  }

  translateStatus(status) {
    return this.translations.status[status] || status;
  }

  translateType(type) {
    return this.translations.propertyType[type] || type;
  }

  async fetchPropertyByReference(reference, filter = "1") {
    const params = new URLSearchParams({
      ref: reference,
      filter: String(filter || "1"),
    });

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    /* console.log(
      "[PropertyDetail] raw api property:",
      data?.Property?.[0] || null,
    );*/
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
    const key = String(filter || 1);
    if (this._cache.propertyTypesByFilter[key])
      return this._cache.propertyTypesByFilter[key];

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

    const result = [{ id: "", label: "Todos" }, ...uniq];
    this._cache.propertyTypesByFilter[key] = result;
    return result;
  }

  async fetchProvinceCounts(filter = 1, provinces = []) {
    const key = String(filter || 1);
    if (this._cache.provinceCountsByFilter[key])
      return this._cache.provinceCountsByFilter[key];

    const list = Array.isArray(provinces) ? provinces.filter(Boolean) : [];
    const out = {};
    if (list.length === 0) {
      this._cache.provinceCountsByFilter[key] = out;
      return out;
    }

    const concurrency = 3;
    let idx = 0;
    const worker = async () => {
      while (idx < list.length) {
        const i = idx++;
        const province = String(list[i]);
        try {
          const params = new URLSearchParams({
            filter: String(filter),
            page: "1",
            limit: "1",
            province,
          });
          const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?${params.toString()}`;
          const response = await fetch(url);
          if (!response.ok) {
            out[province] = 0;
            continue;
          }
          const data = await response.json();
          const count = Number(data?.QueryInfo?.PropertyCount || 0);
          out[province] = Number.isFinite(count) ? count : 0;
        } catch (e) {
          out[province] = 0;
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    this._cache.provinceCountsByFilter[key] = out;
    return out;
  }

  async fetchLocations(filter = 1) {
    // Forzar nueva request (quitar cache temporalmente)
    // if (this._cache.locations) return this._cache.locations;

    const url = `${this.config.API_ENDPOINTS.SEARCH_PROPERTIES}?action=locations&filter=${encodeURIComponent(
      String(filter),
    )}&all=TRUE&sortType=1`;
    // console.log("fetchLocations URL:", url);
    const response = await fetch(url);
    //console.log("fetchLocations response:", response);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    //console.log("fetchLocations data:", data);

    const provinceSysArea = data?.ProvinceSysArea || [];

    // Las provincias principales tienen Parent igual a su Name
    // Las zonas tienen Parent apuntando a la provincia
    const provinceSet = new Set();
    const locationsByProvince = {};

    provinceSysArea.forEach((item) => {
      const name = item?.Name;
      const parent = item?.Parent;
      if (!name || !parent) return;

      // Si Parent == Name, es una provincia principal
      if (parent === name) {
        provinceSet.add(name);
        if (!locationsByProvince[name]) {
          locationsByProvince[name] = [];
        }
      } else {
        // Es una zona, asignar a su provincia padre
        // En algunos filtros la API no devuelve provincias con Parent==Name,
        // así que también consideramos el Parent como provincia.
        provinceSet.add(parent);
        if (!locationsByProvince[parent]) {
          locationsByProvince[parent] = [];
        }
        locationsByProvince[parent].push(name);
      }
    });

    const provincesArr = [...provinceSet].sort((a, b) =>
      a.localeCompare(b, "es"),
    );

    const provincesFinal = provincesArr;

    // Ordenar las zonas dentro de cada provincia
    Object.keys(locationsByProvince).forEach((p) => {
      locationsByProvince[p].sort((a, b) => a.localeCompare(b, "es"));
    });

    this._cache.locations = {
      provinces: provincesFinal,
      locationsByProvince,
    };
    return this._cache.locations;
  }
}
