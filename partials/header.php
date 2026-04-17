<!-- TOPBAR -->
<div class="topbar">
  <div class="container">
    <div class="topbar__left">
      <p data-i18n="tagline">La solución integral para maximizar la rentabilidad inmobiliaria.</p>
    </div>
    <div class="topbar__right">
      <span class="topbar__clock">&#128337;</span>
      <span class="topbar__time" data-i18n="horario">Horario de apertura: 9:00 am - 7:00 pm</span>
      <div class="lang-dropdown" id="langDropdown">
        <button type="button" class="lang-dropdown__toggle" id="langDropdownToggle">
          <img width="18" height="18" alt="" id="langDropdownFlag" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/es.svg">
          <span id="langDropdownLabel">Spanish</span>
          <span class="lang-dropdown__chevron">▾</span>
        </button>
        <div class="lang-dropdown__menu gt_option" id="langDropdownMenu">
          <a href="#" title="Dutch" class="nturl" data-gt-lang="nl">
            <img width="24" height="24" alt="nl" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/nl.svg"> Dutch
          </a>
          <a href="#" title="English" class="nturl" data-gt-lang="en">
            <img width="24" height="24" alt="en" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/en.svg"> English
          </a>
          <a href="#" title="French" class="nturl" data-gt-lang="fr">
            <img width="24" height="24" alt="fr" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/fr.svg"> French
          </a>
          <a href="#" title="Italian" class="nturl" data-gt-lang="it">
            <img width="24" height="24" alt="it" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/it.svg"> Italian
          </a>
          <a href="#" title="Portuguese" class="nturl" data-gt-lang="pt">
            <img width="24" height="24" alt="pt" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/pt.svg"> Portuguese
          </a>
          <a href="#" title="Spanish" class="nturl" data-gt-lang="es">
            <img width="24" height="24" alt="es" src="https://wbrealtygroup.es/wp-content/plugins/gtranslate/flags/svg/es.svg"> Spanish
          </a>
        </div>
      </div>
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
        height="147" />
    </a>

    <nav class="nav" id="nav">
      <ul class="menu">
        <li><a href="https://wbrealtygroup.es/" data-i18n="menuInicio">Inicio</a></li>
        <li><a href="https://wbrealtygroup.es/about-us/" data-i18n="menuEmpresa">Nosotros</a></li>
        <li><a href="https://wbrealtygroup.es/project-development/" data-i18n="menuProjectDev">Project Development</a></li>
        <li><a href="https://wbrealtygroup.es/propiedades/" data-i18n="menuPropiedades">Propiedades</a></li>
        <li><a href="https://wbrealtygroup.es/alquiler/" data-i18n="menuAlquiler">Alquiler</a></li>
        <li class="dropdown">
          <a href="#" data-i18n="menuServicios">Servicios</a>
          <ul class="submenu">
            <li><a href="https://wbstudios.es/" data-i18n="menuDiseno">Diseño y Reformas</a></li>
            <li><a href="https://wbrealtygroup.es/licencias/" data-i18n="menuLicencias">Licencias</a></li>
            <li><a href="https://wbrealtygroup.es/boletines/" data-i18n="menuBoletines">Boletines</a></li>
            <li><a href="https://wbrealtygroup.es/certificados-eficiencia-energetica/" data-i18n="menuCertificados">Certificados eficiencia energetica</a></li>
          </ul>
        </li>
        <li><a href="https://wbrealtygroup.es/contacts/" data-i18n="menuContacto">Contacto</a></li>
      </ul>
    </nav>

    <div class="menu-toggle" id="menuToggle"><span></span></div>
  </div>
</header>

<script src="js/translations.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var match = document.cookie.match(/site_lang=([^;]+)/);
    var currentLang = match ? match[1] : 'es';

    var dropdown = document.getElementById('langDropdown');
    var toggle = document.getElementById('langDropdownToggle');
    var menu = document.getElementById('langDropdownMenu');
    var label = document.getElementById('langDropdownLabel');
    var flag = document.getElementById('langDropdownFlag');

    function closeDropdown() {
      if (dropdown) dropdown.classList.remove('is-open');
    }

    function openDropdown() {
      if (dropdown) dropdown.classList.add('is-open');
    }

    function setCurrentUIFromLink(link) {
      if (!link) return;
      var img = link.querySelector('img');
      if (label) label.textContent = (link.textContent || '').trim();
      if (flag && img) {
        flag.src = img.getAttribute('src');
      }
    }

    if (toggle) {
      toggle.addEventListener('click', function() {
        if (!dropdown) return;
        dropdown.classList.toggle('is-open');
      });
    }

    document.addEventListener('click', function(e) {
      if (!dropdown) return;
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDropdown();
    });

    document.querySelectorAll('.gt_option a.nturl').forEach(function(link) {
      var lang = link.getAttribute('data-gt-lang');
      if (lang === currentLang) {
        link.classList.add('gt_current');
        setCurrentUIFromLink(link);
      } else {
        link.classList.remove('gt_current');
      }

      link.addEventListener('click', function(e) {
        e.preventDefault();
        var newLang = this.getAttribute('data-gt-lang');
        closeDropdown();
        fetch('api/config.php?action=setLanguage&lang=' + newLang)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.success) {
              location.reload();
            }
          })
          .catch(function(error) {
            console.error('Error changing language:', error);
          });
      });
    });
  });
</script>