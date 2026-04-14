class PropertyTypeFilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.propertyTypes = [
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
    if (typeof this.render === "function") {
      this.render();
    }
  }

  setTypes(types) {
    //console.log("setTypes called with:", types);
    if (!Array.isArray(types) || types.length === 0) return;
    this.propertyTypes = types.filter((t) => String(t?.id || "") !== "");
    //console.log("propertyTypes after setTypes:", this.propertyTypes);
  }

  render() {
    if (!this.container) return;
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
