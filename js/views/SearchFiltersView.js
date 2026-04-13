class SearchFiltersView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = {
      province: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
      sortType: "",
      newDevs: false,
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <form class="search-filters" id="searchFiltersForm">
        <div class="search-filters__row">
          <div class="search-filters__field">
            <label for="sf-province">Provincia</label>
            <input id="sf-province" name="province" type="text" value="${this.escape(
              this.state.province,
            )}" placeholder="Ej: Málaga" />
          </div>

          <div class="search-filters__field">
            <label for="sf-location">Ubicación</label>
            <input id="sf-location" name="location" type="text" value="${this.escape(
              this.state.location,
            )}" placeholder="Ej: Marbella" />
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

  escape(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
