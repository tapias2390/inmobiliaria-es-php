class FeaturesFilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.features = [];
    this.state = {
      must: [],
      prefer: [],
    };
  }

  setFeatures(features) {
    this.features = Array.isArray(features) ? features : [];
  }

  render() {
    if (!this.container) return;

    const listId = `featuresList-${Date.now()}`;
    const optionsHtml = this.buildDatalistOptions();
    const mustTags = this.buildTags("must");
    const preferTags = this.buildTags("prefer");

    this.container.innerHTML = `
      <div class="features-filters">
        <div class="features-filters__head">
          <h3 class="features-filters__title">Características</h3>
          <p class="features-filters__hint">Escribe y selecciona una característica para agregarla.</p>
        </div>

        <datalist id="${listId}">${optionsHtml}</datalist>

        <div class="features-filters__grid">
          <div class="features-filters__col">
            <label class="features-filters__label" for="featuresMustInput">Debe tener</label>
            <input
              id="featuresMustInput"
              class="features-filters__input"
              type="text"
              list="${listId}"
              placeholder="Escribe para buscar..."
              autocomplete="off"
              data-features-input="must"
            />
            <div class="features-filters__tags" data-tags="must">${mustTags}</div>
          </div>

          <div class="features-filters__col">
            <label class="features-filters__label" for="featuresPreferInput">Preferible tener</label>
            <input
              id="featuresPreferInput"
              class="features-filters__input"
              type="text"
              list="${listId}"
              placeholder="Escribe para buscar..."
              autocomplete="off"
              data-features-input="prefer"
            />
            <div class="features-filters__tags" data-tags="prefer">${preferTags}</div>
          </div>

          <div class="features-filters__actions">
            <button type="button" class="sc_button" data-apply-features>Aplicar</button>
            <button type="button" class="sc_button" data-clear-features>Limpiar</button>
          </div>
        </div>
      </div>
    `;
  }

  bind(onChange) {
    if (!this.container) return;

    this.container.addEventListener("click", (e) => {
      const applyBtn = e.target.closest("[data-apply-features]");
      const clearBtn = e.target.closest("[data-clear-features]");
      const removeTagBtn = e.target.closest("[data-remove-feature]");

      if (applyBtn) {
        const must = [...new Set(this.state.must || [])];
        const prefer = [...new Set(this.state.prefer || [])];
        this.state = { must, prefer };
        onChange({ featuresMust: must, featuresPrefer: prefer });
        return;
      }

      if (clearBtn) {
        this.state = { must: [], prefer: [] };
        this.render();
        onChange({ featuresMust: [], featuresPrefer: [] });
        return;
      }

      if (removeTagBtn) {
        const group = removeTagBtn.getAttribute("data-group");
        const value = removeTagBtn.getAttribute("data-remove-feature");
        if (!group || !value) return;

        const next = (this.state[group] || []).filter((v) => v !== value);
        this.state = { ...this.state, [group]: next };
        this.render();
      }
    });

    this.container.addEventListener("change", (e) => {
      const input = e.target.closest("[data-features-input]");
      if (!input) return;
      const group = input.getAttribute("data-features-input");
      const raw = String(input.value || "").trim();
      if (!raw) return;

      const normalized = this.normalizeFeatureValue(raw);
      if (!normalized) {
        input.value = "";
        return;
      }

      const current = this.state[group] || [];
      if (!current.includes(normalized)) {
        this.state = { ...this.state, [group]: [...current, normalized] };
      }

      input.value = "";
      this.render();
    });
  }

  buildDatalistOptions() {
    return (this.features || [])
      .map((f) => {
        const label = this.escape(f.label);
        return `<option value="${label}"></option>`;
      })
      .join("");
  }

  buildTags(group) {
    const values = this.state[group] || [];
    if (!Array.isArray(values) || values.length === 0) return "";

    return values
      .map((v) => {
        const label = this.getFeatureLabel(v);
        const safeLabel = this.escape(label);
        const safeValue = this.escape(v);
        return `
          <span class="features-filters__tag">
            <span class="features-filters__tag-text">${safeLabel}</span>
            <button type="button" class="features-filters__tag-remove" data-group="${group}" data-remove-feature="${safeValue}">×</button>
          </span>
        `;
      })
      .join("");
  }

  normalizeFeatureValue(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    const match = (this.features || []).find(
      (f) => String(f.label || "").toLowerCase() === s.toLowerCase(),
    );
    return match ? String(match.value) : "";
  }

  getFeatureLabel(value) {
    const v = String(value || "").trim();
    if (!v) return "";
    const match = (this.features || []).find((f) => String(f.value) === v);
    return match ? String(match.label || match.value) : v;
  }

  escape(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
