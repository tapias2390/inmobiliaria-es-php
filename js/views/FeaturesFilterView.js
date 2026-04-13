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

    const mustOptions = this.buildOptions(this.state.must);
    const preferOptions = this.buildOptions(this.state.prefer);

    this.container.innerHTML = `
      <div class="features-filters">
        <div class="features-filters__head">
          <h3 class="features-filters__title">Características</h3>
          <p class="features-filters__hint">Selecciona lo que el inmueble debe tener y lo que sería preferible.</p>
        </div>

        <div class="features-filters__grid">
          <div class="features-filters__col">
            <label class="features-filters__label" for="featuresMust">Debe tener</label>
            <select id="featuresMust" class="features-filters__select" multiple>
              ${mustOptions}
            </select>
          </div>

          <div class="features-filters__col">
            <label class="features-filters__label" for="featuresPrefer">Preferible tener</label>
            <select id="featuresPrefer" class="features-filters__select" multiple>
              ${preferOptions}
            </select>
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

      if (applyBtn) {
        const must = this.getSelected("featuresMust");
        const prefer = this.getSelected("featuresPrefer");

        this.state = { must, prefer };
        onChange({ featuresMust: must, featuresPrefer: prefer });
        return;
      }

      if (clearBtn) {
        this.state = { must: [], prefer: [] };
        this.render();
        onChange({ featuresMust: [], featuresPrefer: [] });
      }
    });
  }

  getSelected(selectId) {
    const el = this.container.querySelector(`#${selectId}`);
    if (!el) return [];
    return [...el.selectedOptions].map((o) => o.value).filter(Boolean);
  }

  buildOptions(selected) {
    const selectedSet = new Set(selected || []);
    const opts = this.features
      .map((f) => {
        const value = this.escape(f.value);
        const label = this.escape(f.label);
        const isSelected = selectedSet.has(f.value);
        return `<option value="${value}" ${isSelected ? "selected" : ""}>${label}</option>`;
      })
      .join("");

    return opts || "";
  }

  escape(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
