class SearchFiltersView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.locationsData = null;
    this.state = {
      province: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      builtMin: "",
      builtMax: "",
      beds: "",
      baths: "",
      sortType: "",
      newDevs: false,
    };
    this.render();
  }

  setLocations(locationsData) {
    this.locationsData = locationsData || null;
    // console.log("setLocations - provinces:", this.getProvinces());
    //console.log("setLocations - locationsData:", this.locationsData);
    this.render();
  }

  render() {
    if (!this.container) return;

    const provinces = this.getProvinces();
    //console.log("render - provinces:", provinces);
    const locations = this.getLocationsForProvince(this.state.province);

    this.container.innerHTML = `
      <form class="search-filters" id="searchFiltersForm">
        <div class="search-filters__row">
          <div class="search-filters__field" style="display:none;">
            <label for="sf-province">Provincia</label>
            <select id="sf-province" name="province">
              ${this.selectOptions(provinces, this.state.province, "Todas")}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-location">Ubicación</label>
            <select id="sf-location" name="location" ${
              locations.length === 0 ? "disabled" : ""
            }>
              ${this.selectOptions(locations, this.state.location, "Todas")}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-minPrice">Precio mín.</label>
            <input id="sf-minPrice" name="minPrice" type="number" min="0" value="${this.escape(
              this.state.minPrice,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-maxPrice">Precio máx.</label>
            <input id="sf-maxPrice" name="maxPrice" type="number" min="0" value="${this.escape(
              this.state.maxPrice,
            )}" placeholder="0" />
          </div>
        </div>

        <div class="search-filters__row">
          <div class="search-filters__field">
            <label for="sf-builtMin">Construidos mín. (m²)</label>
            <input id="sf-builtMin" name="builtMin" type="number" min="0" value="${this.escape(
              this.state.builtMin,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-builtMax">Construidos máx. (m²)</label>
            <input id="sf-builtMax" name="builtMax" type="number" min="0" value="${this.escape(
              this.state.builtMax,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-beds">Dormitorios</label>
            <select id="sf-beds" name="beds">
              ${this.options(
                [
                  { v: "", l: "Cualquiera" },
                  { v: "1x", l: "1+" },
                  { v: "2x", l: "2+" },
                  { v: "3x", l: "3+" },
                  { v: "4x", l: "4+" },
                  { v: "5x", l: "5+" },
                ],
                this.state.beds,
              )}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-baths">Baños</label>
            <select id="sf-baths" name="baths">
              ${this.options(
                [
                  { v: "", l: "Cualquiera" },
                  { v: "1x", l: "1+" },
                  { v: "2x", l: "2+" },
                  { v: "3x", l: "3+" },
                  { v: "4x", l: "4+" },
                ],
                this.state.baths,
              )}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-sortType">Orden</label>
            <select id="sf-sortType" name="sortType">
              ${this.options(
                [
                  { v: "", l: "Por defecto" },
                  { v: "0", l: "Sistema" },
                  { v: "1", l: "A-Z" },
                  { v: "2", l: "Z-A" },
                  { v: "3", l: "Última actualización" },
                ],
                this.state.sortType,
              )}
            </select>
          </div>

          <div class="search-filters__field search-filters__field--checkbox">
            <label for="sf-newDevs">Nueva promoción</label>
            <input id="sf-newDevs" name="newDevs" type="checkbox" ${
              this.state.newDevs ? "checked" : ""
            } />
          </div>

          <div class="search-filters__actions">
            <button type="submit" class="sc_button">Aplicar filtros</button>
            <button type="button" class="sc_button" data-reset>Limpiar</button>
          </div>
        </div>
      </form>
    `;
  }

  bind(onChange) {
    if (!this.container) return;

    this.container.addEventListener("change", (e) => {
      if (e.target && e.target.id === "sf-province") {
        const province = String(e.target.value || "");
        this.state = { ...this.state, province, location: "" };
        this.render();
      }
    });

    this.container.addEventListener("submit", (e) => {
      const form = e.target.closest("#searchFiltersForm");
      if (!form) return;

      e.preventDefault();
      const data = new FormData(form);

      const filters = {
        province: (data.get("province") || "").toString().trim(),
        location: (data.get("location") || "").toString().trim(),
        minPrice: (data.get("minPrice") || "").toString().trim(),
        maxPrice: (data.get("maxPrice") || "").toString().trim(),
        builtMin: (data.get("builtMin") || "").toString().trim(),
        builtMax: (data.get("builtMax") || "").toString().trim(),
        beds: (data.get("beds") || "").toString().trim(),
        baths: (data.get("baths") || "").toString().trim(),
        sortType: (data.get("sortType") || "").toString().trim(),
        newDevs: !!data.get("newDevs"),
      };

      this.state = { ...this.state, ...filters };
      onChange(filters);
    });

    this.container.addEventListener("click", (e) => {
      const resetBtn = e.target.closest("[data-reset]");
      if (!resetBtn) return;

      this.state = {
        province: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        builtMin: "",
        builtMax: "",
        beds: "",
        baths: "",
        sortType: "",
        newDevs: false,
      };

      this.render();
      onChange({});
    });
  }

  options(items, selected) {
    return items
      .map(
        (i) =>
          `<option value="${this.escape(i.v)}" ${
            i.v === selected ? "selected" : ""
          }>${i.l}</option>`,
      )
      .join("");
  }

  selectOptions(items, selected, allLabel = "") {
    const safeAll = this.escape(allLabel);
    const allOpt = `<option value="" ${selected === "" ? "selected" : ""}>${safeAll}</option>`;
    const opts = (items || [])
      .map((x) => {
        const v = this.escape(x);
        return `<option value="${v}" ${x === selected ? "selected" : ""}>${v}</option>`;
      })
      .join("");
    return allOpt + opts;
  }

  getProvinces() {
    const data = this.locationsData;
    // Si falla la carga desde API, al menos mostrar un listado básico
    if (!data) {
      return [
        "Málaga",
        "Cádiz",
        "Sevilla",
        "Granada",
        "Huelva",
        "Córdoba",
        "Almería",
        "Jaén",
      ];
    }
    if (Array.isArray(data.provinces) && data.provinces.length > 0)
      return data.provinces;
    if (data instanceof Map) return [...data.keys()];
    if (typeof data === "object") {
      if (
        data.locationsByProvince &&
        typeof data.locationsByProvince === "object"
      ) {
        return Object.keys(data.locationsByProvince);
      }
      return Object.keys(data);
    }
    return [];
  }

  getLocationsForProvince(province) {
    const p = String(province || "").trim();
    if (!p) return [];

    const data = this.locationsData;

    // Soportar el formato del modelo: { provinces: [], locationsByProvince: {} }
    if (data?.locationsByProvince && data.locationsByProvince[p]) {
      /*console.log(
        "getLocationsForProvince:",
        p,
        "->",
        data.locationsByProvince[p],
      );*/
      return data.locationsByProvince[p];
    }

    if (data instanceof Map) return [...(data.get(p) || [])];
    if (typeof data === "object" && data[p]) {
      const v = data[p];
      if (Array.isArray(v)) return v;
      if (v instanceof Set) return [...v];
    }

    // Fallback: ubicaciones hardcodeadas por provincia
    const fallbackLocations = {
      Málaga: [
        "Casares",
        "Estepona",
        "Marbella",
        "Mijas",
        "Benalmádena",
        "Fuengirola",
        "Torremolinos",
        "Málaga",
        "Benahavís",
        "Coín",
      ],
      Cádiz: [
        "Jerez de la Frontera",
        "Cádiz",
        "Algeciras",
        "San Fernando",
        "El Puerto de Santa María",
        "Chiclana de la Frontera",
        "La Línea de la Concepción",
      ],
      Sevilla: [
        "Sevilla",
        "Alcalá de Guadaíra",
        "Carmona",
        "Écija",
        "Osuna",
        "Morón de la Frontera",
      ],
      Granada: ["Granada", "Almuñécar", "Motril", "Baza", "Loja"],
    };
    return fallbackLocations[p] || [];
  }

  escape(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
