class PropertyTypeFilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.propertyTypes = [
      { id: "", label: "Todos los tipos" },
      { id: "Apartment", label: "Apartamento" },
      { id: "Villa", label: "Villa" },
      { id: "House", label: "Casa" },
      { id: "Penthouse", label: "Ático" },
      { id: "Townhouse", label: "Casa adosada" },
      { id: "Bungalow", label: "Bungalow" },
      { id: "Studio", label: "Estudio" },
      { id: "Finca", label: "Finca" },
      { id: "Plot", label: "Parcela" },
      { id: "Garage", label: "Garaje" },
      { id: "Parking Space", label: "Plaza de parking" },
      { id: "Storage Room", label: "Trastero" },
      { id: "Commercial", label: "Comercial" },
      { id: "Office", label: "Oficina" },
      { id: "Restaurant", label: "Restaurante" },
      { id: "Shop", label: "Tienda" },
    ];
    this.activeType = "";
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="property-type-filter">
        <select class="property-type-select" id="propertyTypeSelect">
          ${this.propertyTypes
            .map(
              (t) => `
            <option value="${t.id}" ${t.id === this.activeType ? "selected" : ""}>
              ${t.label}
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
    `;
  }

  bind(onTypeChange) {
    if (!this.container) return;

    this.container.addEventListener("change", (e) => {
      if (e.target.id === "propertyTypeSelect") {
        this.activeType = e.target.value;
        onTypeChange(this.activeType);
      }
    });
  }
}
