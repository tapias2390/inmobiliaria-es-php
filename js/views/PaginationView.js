class PaginationView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(pagination) {
    if (!this.container) return;

    if (!pagination || pagination.totalPages <= 1) {
      this.container.innerHTML = '';
      return;
    }

    const { currentPage, totalPages } = pagination;

    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= totalPages;

    this.container.innerHTML = `
      <nav class="pagination" aria-label="Paginación">
        <button type="button" class="pagination__btn" data-page="${currentPage - 1}" ${prevDisabled ? 'disabled' : ''}>Anterior</button>
        <span class="pagination__info">Página ${currentPage} de ${totalPages}</span>
        <button type="button" class="pagination__btn" data-page="${currentPage + 1}" ${nextDisabled ? 'disabled' : ''}>Siguiente</button>
      </nav>
    `;
  }

  bind(onPageChange) {
    if (!this.container) return;

    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;

      const page = Number(btn.getAttribute('data-page'));
      if (!Number.isFinite(page) || page <= 0) return;
      if (btn.disabled) return;

      onPageChange(page);
    });
  }
}
