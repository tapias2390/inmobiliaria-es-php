class FilterView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.filters = [
      { id: 1, label: "Venta" },
      { id: 2, label: "Alquiler Corto Plazo" },
      { id: 3, label: "Alquiler Largo Plazo" },
      { id: 4, label: "Destacadas" },
    ];
    this.activeFilter = 1;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="filter-buttons">
        ${this.filters
          .map(
            (f) => `
          <button type="button" 
            class="filter-btn ${f.id === this.activeFilter ? "is-active" : ""}" 
            data-filter="${f.id}">
            ${f.label}
          </button>
        `,
          )
          .join("")}
      </div>
    `;
  }

  bind(onFilterChange) {
    if (!this.container) return;

    this.container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;

      const filterId = Number(btn.getAttribute("data-filter"));
      if (!Number.isFinite(filterId)) return;

      this.activeFilter = filterId;
      this.render();
      onFilterChange(filterId);
    });
  }
}
