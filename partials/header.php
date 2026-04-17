<!-- TOPBAR -->
<div class="topbar">
  <div class="container">
    <div class="topbar__left">
      <p>La solución integral para maximizar la rentabilidad inmobiliaria.</p>
    </div>
    <div class="topbar__right">
      <span class="topbar__clock">&#128337;</span>
      <span class="topbar__time">Horario de apertura: 9:00 am - 7:00 pm</span>
      <select id="language-selector" class="language-selector">
        <option value="es" <?php echo (getenv('LANGUAGE') ?: 'es') === 'es' ? 'selected' : ''; ?>>Español</option>
        <option value="en" <?php echo (getenv('LANGUAGE') ?: 'es') === 'en' ? 'selected' : ''; ?>>English</option>
        <option value="de" <?php echo (getenv('LANGUAGE') ?: 'es') === 'de' ? 'selected' : ''; ?>>Deutsch</option>
        <option value="fr" <?php echo (getenv('LANGUAGE') ?: 'es') === 'fr' ? 'selected' : ''; ?>>Français</option>
        <option value="nl" <?php echo (getenv('LANGUAGE') ?: 'es') === 'nl' ? 'selected' : ''; ?>>Nederlands</option>
        <option value="da" <?php echo (getenv('LANGUAGE') ?: 'es') === 'da' ? 'selected' : ''; ?>>Dansk</option>
        <option value="ru" <?php echo (getenv('LANGUAGE') ?: 'es') === 'ru' ? 'selected' : ''; ?>>Pussian</option>
        <option value="sv" <?php echo (getenv('LANGUAGE') ?: 'es') === 'sv' ? 'selected' : ''; ?>>Svenska</option>
        <option value="pl" <?php echo (getenv('LANGUAGE') ?: 'es') === 'pl' ? 'selected' : ''; ?>>Polski</option>
        <option value="no" <?php echo (getenv('LANGUAGE') ?: 'es') === 'no' ? 'selected' : ''; ?>>Norsk</option>
        <option value="tr" <?php echo (getenv('LANGUAGE') ?: 'es') === 'tr' ? 'selected' : ''; ?>>Türkçe</option>
        <option value="fi" <?php echo (getenv('LANGUAGE') ?: 'es') === 'fi' ? 'selected' : ''; ?>>Suomi</option>
        <option value="hu" <?php echo (getenv('LANGUAGE') ?: 'es') === 'hu' ? 'selected' : ''; ?>>Magyar</option>
      </select>
    </div>
  </div>
</div>

<!-- HEADER -->
<header class="header">
  <div class="container header__container">
    <a href="index.php" class="sc_layouts_logo sc_layouts_logo_default">
      <img
        class="logo_image"
        src="https://wbrealtygroup.es/wp-content/uploads/2025/11/logo-realty.png"
        alt="WB Realty Group"
        width="307"
        height="147"
      />
    </a>

    <nav class="nav" id="nav">
      <ul class="menu">
        <li><a href="https://wbrealtygroup.es/">Inicio</a></li>
        <li><a href="https://wbrealtygroup.es/about-us/">Nosotros</a></li>
        <li><a href="https://wbrealtygroup.es/project-development/">Project Development</a></li>
        <li><a href="https://wbrealtygroup.es/propiedades/">Propiedades</a></li>
        <li><a href="https://wbrealtygroup.es/compra-2/">Compra</a></li>
        <li><a href="https://wbrealtygroup.es/alquiler/">Alquiler</a></li>
        <li class="dropdown">
          <a href="#">Servicios</a>
          <ul class="submenu">
            <li><a href="https://wbstudios.es/">Diseño y Reformas</a></li>
            <li>
              <a href="https://wbrealtygroup.es/licencias/">Licencias</a>
            </li>
            <li>
              <a href="https://wbrealtygroup.es/boletines/">Boletines</a>
            </li>
            <li>
              <a
                href="https://wbrealtygroup.es/certificados-eficiencia-energetica/"
                >Certificados eficiencia energetica</a
              >
            </li>
          </ul>
        </li>
        <li><a href="https://wbrealtygroup.es/contacts/">Contacto</a></li>
      </ul>
    </nav>

    <div class="menu-toggle" id="menuToggle"><span></span></div>
  </div>
</header>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var langSelector = document.getElementById('language-selector');
  if (langSelector) {
    langSelector.addEventListener('change', function() {
      var newLang = this.value;
      fetch('api/config.php?action=setLanguage&lang=' + newLang)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data.success) {
            location.reload();
          }
        })
        .catch(function(error) {
          console.error('Error changing language:', error);
        });
    });
  }
});
</script>
