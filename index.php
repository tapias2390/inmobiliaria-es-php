<!doctype html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WB Realty</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
</head>

<body>
  <?php include 'partials/header.html'; ?>

  <!-- BODY -->
  <main class="main">
    <div class="container">
      <section class="properties-section">
        <div class="properties-header">
          <h1>Propiedades</h1>
          <button type="button" class="filter-toggle-btn" id="filterToggleBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
              <circle cx="8" cy="6" r="2" fill="currentColor"></circle>
              <circle cx="16" cy="12" r="2" fill="currentColor"></circle>
              <circle cx="10" cy="18" r="2" fill="currentColor"></circle>
            </svg>
            Filtros
          </button>
        </div>

        <!-- Listado de propiedades -->
        <div id="properties-container"></div>

        <!-- Paginación al final -->
        <div id="pagination-container"></div>
      </section>
    </div>
  </main>

  <!-- Modal de Filtros -->
  <div class="filter-modal" id="filterModal">
    <div class="filter-modal__overlay" id="filterModalOverlay"></div>
    <div class="filter-modal__content">
      <div class="filter-modal__header">
        <h2>Filtros</h2>
        <button type="button" class="filter-modal__close" id="filterModalClose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="filter-modal__body">
        <div id="filter-container"></div>
        <div id="property-type-filter"></div>
        <div id="search-filters-container"></div>
        <div id="features-filter-container"></div>
      </div>
      <div class="filter-modal__footer">
        <button type="button" class="sc_button" id="filterModalApply">Aplicar Filtros</button>
      </div>
    </div>
  </div>

  <?php include 'partials/footer.html'; ?>

  <script src="js/config.js"></script>
  <script src="js/models/PropertyModel.js"></script>
  <script src="js/views/PropertyView.js"></script>
  <script src="js/views/FilterView.js"></script>
  <script src="js/views/SearchFiltersView.js"></script>
  <script src="js/views/PropertyTypeFilterView.js"></script>
  <script src="js/views/FeaturesFilterView.js"></script>
  <script src="js/views/PaginationView.js"></script>
  <script src="js/controllers/PropertyController.js"></script>
  <script src="js/app.js"></script>
</body>

</html>