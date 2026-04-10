class PaginationView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.onPageChange = null;
  }

  render(pagination) {
    if (!this.container) return;

    if (!pagination || pagination.totalPages <= 1) {
      this.container.innerHTML = "";
      return;
    }

    const { currentPage, totalPages, total } = pagination;

    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;

    const pagesHtml = this.buildPagesWindow(currentPage, totalPages);

    this.container.innerHTML = `
      <nav class="pagination" aria-label="Paginación">
        <div class="pagination__summary">
          <span class="pagination__total">${this.formatNumber(total)} resultados</span>
          <span class="pagination__info">Página ${currentPage} de ${totalPages}</span>
        </div>

        <div class="pagination__controls">
          <button type="button" class="pagination__btn" data-page="1" ${prevDisabled ? "disabled" : ""}>Primero</button>
          <button type="button" class="pagination__btn" data-page="${currentPage - 1}" ${prevDisabled ? "disabled" : ""}>Anterior</button>

          <div class="pagination__pages">${pagesHtml}</div>

          <button type="button" class="pagination__btn" data-page="${currentPage + 1}" ${nextDisabled ? "disabled" : ""}>Siguiente</button>
          <button type="button" class="pagination__btn" data-page="${totalPages}" ${nextDisabled ? "disabled" : ""}>Último</button>
        </div>

        <form class="pagination__goto" data-goto-form>
          <label class="pagination__goto-label">Ir a página</label>
          <input class="pagination__goto-input" type="number" min="1" max="${totalPages}" value="${currentPage}" />
          <button class="pagination__btn" type="submit">Ir</button>
        </form>
      </nav>
    `;
  }

  bind(onPageChange) {
    if (!this.container) return;

    this.onPageChange = onPageChange;

    this.container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn) return;

      const page = Number(btn.getAttribute("data-page"));
      if (!Number.isFinite(page) || page <= 0) return;
      if (btn.disabled) return;

      this.onPageChange(page);
    });

    this.container.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-goto-form]");
      if (!form) return;

      e.preventDefault();

      const input = form.querySelector("input");
      const page = Number(input?.value);
      if (!Number.isFinite(page) || page <= 0) return;
      this.onPageChange(page);
    });
  }

  buildPagesWindow(currentPage, totalPages) {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const parts = [];

    if (start > 1) {
      parts.push(this.pageButton(1, currentPage));
      if (start > 2) parts.push(`<span class="pagination__dots">…</span>`);
    }

    for (let p = start; p <= end; p++) {
      parts.push(this.pageButton(p, currentPage));
    }

    if (end < totalPages) {
      if (end < totalPages - 1)
        parts.push(`<span class="pagination__dots">…</span>`);
      parts.push(this.pageButton(totalPages, currentPage));
    }

    return parts.join("");
  }

  pageButton(page, currentPage) {
    const active = page === currentPage;
    return `<button type="button" class="pagination__page ${active ? "is-active" : ""}" data-page="${page}" ${active ? "disabled" : ""}>${page}</button>`;
  }

  formatNumber(num) {
    return new Intl.NumberFormat("es-ES").format(Number(num || 0));
  }
}
