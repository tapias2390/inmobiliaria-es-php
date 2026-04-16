class SearchFiltersView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.locationsData = null;
    this.state = {
      province: "Málaga",
      location: "",
      minPrice: "",
      maxPrice: "",
      builtMin: "",
      builtMax: "",
      beds: "",
      baths: "",
      sortType: "2",
      newDevs: false,
    };
    this.render();
  }

  setLocations(locationsData) {
    this.locationsData = locationsData || null;
    // console.log("setLocations - provinces:", this.getProvinces());
    //console.log("setLocations - locationsData:", this.locationsData);
    this.render();
  }

  render() {
    if (!this.container) return;

    const provinces = this.getProvinces();
    //console.log("render - provinces:", provinces);
    // Si no hay provincia seleccionada, usar Málaga por defecto para cargar ubicaciones
    const activeProvince = this.state.province || "Málaga";
    const locations = this.getLocationsForProvince(activeProvince);

    this.container.innerHTML = `
      <form class="search-filters" id="searchFiltersForm">
        <div class="search-filters__row">
          <div class="search-filters__field" style="display:none;">
            <label for="sf-province">Provincia</label>
            <select id="sf-province" name="province">
              ${this.selectOptions(provinces, this.state.province, "Todas")}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-location">Ubicación</label>
            <select id="sf-location" name="location" ${
              locations.length === 0 ? "disabled" : ""
            }>
              ${this.selectOptions(locations, this.state.location, "Todas")}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-minPrice">Precio mín.</label>
            <input id="sf-minPrice" name="minPrice" type="number" min="0" value="${this.escape(
              this.state.minPrice,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-maxPrice">Precio máx.</label>
            <input id="sf-maxPrice" name="maxPrice" type="number" min="0" value="${this.escape(
              this.state.maxPrice,
            )}" placeholder="0" />
          </div>
        </div>

        <div class="search-filters__row">
          <div class="search-filters__field">
            <label for="sf-builtMin">Construidos mín. (m²)</label>
            <input id="sf-builtMin" name="builtMin" type="number" min="0" value="${this.escape(
              this.state.builtMin,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-builtMax">Construidos máx. (m²)</label>
            <input id="sf-builtMax" name="builtMax" type="number" min="0" value="${this.escape(
              this.state.builtMax,
            )}" placeholder="0" />
          </div>

          <div class="search-filters__field">
            <label for="sf-beds">Dormitorios</label>
            <select id="sf-beds" name="beds">
              ${this.options(
                [
                  { v: "", l: "Cualquiera" },
                  { v: "1x", l: "1+" },
                  { v: "2x", l: "2+" },
                  { v: "3x", l: "3+" },
                  { v: "4x", l: "4+" },
                  { v: "5x", l: "5+" },
                ],
                this.state.beds,
              )}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-baths">Baños</label>
            <select id="sf-baths" name="baths">
              ${this.options(
                [
                  { v: "", l: "Cualquiera" },
                  { v: "1x", l: "1+" },
                  { v: "2x", l: "2+" },
                  { v: "3x", l: "3+" },
                  { v: "4x", l: "4+" },
                ],
                this.state.baths,
              )}
            </select>
          </div>

          <div class="search-filters__field">
            <label for="sf-sortType">Orden</label>
            <select id="sf-sortType" name="sortType">
              ${this.options(
                [
                  { v: "", l: "Por defecto" },
                  { v: "0", l: "Sistema" },
                  { v: "1", l: "A-Z" },
                  { v: "2", l: "Z-A" },
                  { v: "3", l: "Última actualización" },
                ],
                this.state.sortType,
              )}
            </select>
          </div>

          <div class="search-filters__field search-filters__field--checkbox">
            <label for="sf-newDevs">Nueva promoción</label>
            <input id="sf-newDevs" name="newDevs" type="checkbox" ${
              this.state.newDevs ? "checked" : ""
            } />
          </div>

          <div class="search-filters__actions">
            <button type="submit" class="sc_button">Aplicar filtros</button>
            <button type="button" class="sc_button" data-reset>Limpiar</button>
          </div>
        </div>
      </form>
    `;
  }

  bind(onChange) {
    if (!this.container) return;

    this.container.addEventListener("change", (e) => {
      if (e.target && e.target.id === "sf-province") {
        const province = String(e.target.value || "");
        this.state = { ...this.state, province, location: "" };
        this.render();
      }
    });

    this.container.addEventListener("submit", (e) => {
      const form = e.target.closest("#searchFiltersForm");
      if (!form) return;

      e.preventDefault();
      const data = new FormData(form);

      const filters = {
        province: (data.get("province") || "").toString().trim(),
        location: (data.get("location") || "").toString().trim(),
        minPrice: (data.get("minPrice") || "").toString().trim(),
        maxPrice: (data.get("maxPrice") || "").toString().trim(),
        builtMin: (data.get("builtMin") || "").toString().trim(),
        builtMax: (data.get("builtMax") || "").toString().trim(),
        beds: (data.get("beds") || "").toString().trim(),
        baths: (data.get("baths") || "").toString().trim(),
        sortType: (data.get("sortType") || "").toString().trim(),
        newDevs: !!data.get("newDevs"),
      };

      //console.log("DEBUG filtros enviados:", filters);
      this.state = { ...this.state, ...filters };
      onChange(filters);
    });

    this.container.addEventListener("click", (e) => {
      const resetBtn = e.target.closest("[data-reset]");
      if (!resetBtn) return;

      this.state = {
        province: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        builtMin: "",
        builtMax: "",
        beds: "",
        baths: "",
        sortType: "",
        newDevs: false,
      };

      this.render();
      onChange({});
    });
  }

  options(items, selected) {
    return items
      .map(
        (i) =>
          `<option value="${this.escape(i.v)}" ${
            i.v === selected ? "selected" : ""
          }>${i.l}</option>`,
      )
      .join("");
  }

  selectOptions(items, selected, allLabel = "") {
    const safeAll = this.escape(allLabel);
    const allOpt = `<option value="" ${selected === "" ? "selected" : ""}>${safeAll}</option>`;
    const opts = (items || [])
      .map((x) => {
        const v = this.escape(x);
        return `<option value="${v}" ${x === selected ? "selected" : ""}>${v}</option>`;
      })
      .join("");
    return allOpt + opts;
  }

  getProvinces() {
    const data = this.locationsData;
    // Si falla la carga desde API, al menos mostrar un listado básico
    if (!data) {
      return [
        "Málaga",
        "Cádiz",
        "Sevilla",
        "Granada",
        "Huelva",
        "Córdoba",
        "Almería",
        "Jaén",
      ];
    }
    if (Array.isArray(data.provinces) && data.provinces.length > 0)
      return data.provinces;
    if (data instanceof Map) return [...data.keys()];
    if (typeof data === "object") {
      if (
        data.locationsByProvince &&
        typeof data.locationsByProvince === "object"
      ) {
        return Object.keys(data.locationsByProvince);
      }
      return Object.keys(data);
    }
    return [];
  }

  getLocationsForProvince(province) {
    const p = String(province || "").trim();
    if (!p) return [];

    const data = this.locationsData;

    // Soportar el formato del modelo: { provinces: [], locationsByProvince: {} }
    if (data && data.locationsByProvince && data.locationsByProvince[p]) {
      return data.locationsByProvince[p];
    }

    if (data instanceof Map) return [...(data.get(p) || [])];
    if (data && typeof data === "object" && data[p]) {
      const v = data[p];
      if (Array.isArray(v)) return v;
      if (v instanceof Set) return [...v];
    }

    // Fallback: ubicaciones hardcodeadas por provincia (más de 400 ubicaciones de Málaga)
    const fallbackLocations = {
      Málaga: [
        "26 de Febrero",
        "503 Viviendas",
        "Alameda",
        "Alaska",
        "Alcaucín",
        "Alfarnate",
        "Alfarnatejo",
        "Algarrobo",
        "Algarrobo Costa",
        "Algatocin",
        "Alhaurín de la Torre",
        "Alhaurín el Grande",
        "Alhaurin Golf",
        "Almachar",
        "Almargen",
        "Almayate",
        "Almayate Alto",
        "Almogía",
        "Almudena",
        "Aloha",
        "Alora",
        "Alozaina",
        "Alpandeire",
        "Altos de los Monteros",
        "Amoníaco",
        "Antequera",
        "Árchez",
        "Archidona",
        "Ardales",
        "Arenas",
        "Arriate",
        "Arroyo de la Miel",
        "Arroyo de los Ángeles",
        "Artola",
        "Atajate",
        "Atalaya",
        "Atalayas",
        "Azafranes",
        "Bahía de Marbella",
        "Bailen Miraflores",
        "Bajondillo",
        "Baños de Vilo",
        "Bel Air",
        "Benadalid",
        "Benagalbon",
        "Benahavís",
        "Benajarafe",
        "Benalauría",
        "Benalmadena",
        "Benalmadena Costa",
        "Benalmadena Pueblo",
        "Benamara",
        "Benamargosa",
        "Benamocarra",
        "Benaoján",
        "Benarrabá",
        "Benavista",
        "Bobadilla",
        "Cabopino",
        "Cabrillas",
        "Cajiz",
        "Cala del Moral",
        "Calahonda",
        "Calanova Golf",
        "Caleta de Vélez",
        "Calypso",
        "Campanillas",
        "Campillos",
        "Campo Mijas",
        "Cancelada",
        "Cañete la Real",
        "Canillas de Aceituno",
        "Canillas de Albaida",
        "Capuchinos",
        "Carib Playa",
        "Carranque",
        "Carraspite",
        "Carratraca",
        "Cartajima",
        "Cártama",
        "Carvajal",
        "Casabermeja",
        "Casarabonela",
        "Casares",
        "Casares Playa",
        "Casares Pueblo",
        "Castañetas",
        "Castillo Bajo",
        "Centro de Transporte de Mercancías",
        "Centro Histórico",
        "Cerrado de Calderón",
        "Cerros del Aguila",
        "Chilches",
        "Churriana",
        "Ciudad Jardín",
        "Coín",
        "Colmenar",
        "Colmenarejo",
        "Comares",
        "Cómpeta",
        "Conde de Ureña",
        "Cortes de la Frontera",
        "Cortijo Bazán",
        "Cortijo Blanco",
        "Cortijo de Maza",
        "Corumbela",
        "Costabella",
        "Costalita",
        "Cruz del Humilladero",
        "Cuevas Bajas",
        "Cuevas De San Marcos",
        "Cuevas del Becerro",
        "Cútar",
        "Daimalos",
        "Diana Park",
        "Doña Julia",
        "Dos Hermanas",
        "El Acebuchal",
        "El Ángel",
        "El Atabal",
        "El Borge",
        "El Brillante",
        "El Bulto",
        "El Burgo",
        "El Calvario",
        "El Candado",
        "El Chaparral",
        "El Chorro",
        "El Colmenar",
        "El Cónsul",
        "El Cortijuelo",
        "El Coto",
        "El Ejido",
        "El Faro",
        "El Higueral",
        "El Hornillo",
        "El Limonero",
        "El Madroñal",
        "El Molinillo",
        "El Molino",
        "El Morche",
        "El Olivar",
        "El Padron",
        "El Palo",
        "El Paraiso",
        "El Pinillo",
        "El Pizarrillo",
        "El Prado",
        "El Presidente",
        "El Romeral",
        "El Rosario",
        "El Tarajal",
        "El Tejar",
        "El Tomillar",
        "El Torcal",
        "El Trapiche",
        "Elviria",
        "Ensanche Centro",
        "Entrerrios",
        "Estación Archidona",
        "Estación de Campanillas",
        "Estacion de Cartama",
        "Estación de Gaucin",
        "Estepona",
        "Faraján",
        "Finca El Pato",
        "Finca Monsalvez",
        "Florisol",
        "Frigiliana",
        "Frontones",
        "Fuengirola",
        "Fuente Alegre",
        "Fuente de Piedra",
        "Gaucín",
        "Genalguacil",
        "Gibralfaro",
        "Gibralgalia",
        "Girón",
        "Gobantes",
        "Guadalmar",
        "Guadalmina Alta",
        "Guadalmina Baja",
        "Guadalsol",
        "Guaro",
        "Hacienda Bizcochero",
        "Hacienda del Sol",
        "Hacienda Las Chapas",
        "Hacienda Paredes",
        "Haza Cuevas",
        "Higueron",
        "Huelin",
        "Huerta La Palma",
        "Huerta Nueva",
        "Huertas Altas",
        "Huertas Bajas",
        "Huertecilla Mañas",
        "Huit",
        "Humilladero",
        "Igualeja",
        "Industrial Intelhorce",
        "Industrial Pilar del Prado",
        "Istán",
        "Iznate",
        "Jardín de Málaga",
        "Jimera de Líbar",
        "Jubrique",
        "Júzcar",
        "La Alcubilla",
        "La Atalaya",
        "La Azucarera",
        "La Barriguilla",
        "La Cala",
        "La Cala de Mijas",
        "La Cala del Moral",
        "La Cala Golf",
        "La Cala Hills",
        "La Caleta",
        "La Campana",
        "La Capellania",
        "La Carihuela",
        "La Colina",
        "La Concha de Malaga",
        "La Duquesa",
        "La Estación",
        "La Fábrica",
        "La Florida",
        "La Goleta",
        "La Heredia",
        "La Joya",
        "La Leala",
        "La Luz",
        "La Mairena",
        "La Merced",
        "La Noria",
        "La Palma",
        "La Palmilla",
        "La Parrilla",
        "La Paz",
        "La Princesa",
        "La Quinta",
        "La Roca",
        "La Rosaleda",
        "La Trinidad",
        "La Victoria",
        "La Viñuela",
        "La Zagaleta",
        "Lagos",
        "Las Brisas",
        "Las Casillas",
        "Las Chapas",
        "Las Delicias",
        "Las Flores",
        "Las Lagunas",
        "Las Manseras",
        "Las Virreinas",
        "Las Zorrillas",
        "Lauro Golf",
        "Limonar",
        "Loma del Campo",
        "Los Alamos",
        "Los Almendros",
        "Los Almendros - Puerto de la Torre",
        "Los Arqueros",
        "Los Asperones 2",
        "Los Boliches",
        "Los Casinis",
        "Los Castillejos",
        "Los Chopos",
        "Los Cipreses",
        "Los Flamingos",
        "Los Guindos",
        "Los Monteros",
        "Los Morales",
        "Los Pacos",
        "Los Pérez",
        "Los Prados",
        "Los Puertas",
        "Los Romanes",
        "Los Tilos",
        "Los Vados",
        "Los Valverde",
        "Macharaviaya",
        "Mainake",
        "Málaga",
        "Málaga Centro",
        "Málaga Este",
        "Malagueta",
        "Mangas Verdes",
        "Manilva",
        "Maqueda",
        "Marbella",
        "Marbesa",
        "Maro",
        "Martiricos",
        "Mayorazgo",
        "Mercamálaga",
        "Mezquitilla",
        "Mijas",
        "Mijas Costa",
        "Mijas Golf",
        "Miraflores",
        "Miranda",
        "Moclinejo",
        "Mollina",
        "Monda",
        "Mondrón",
        "Monte Azul",
        "Monte Halcones",
        "Monte Sancha",
        "Montefrío",
        "Montejaque",
        "Montemar",
        "Montes de Málaga",
        "Morlaco",
        "Nagüeles",
        "Nerja",
        "New Golden Mile",
        "Nueva Andalucía",
        "Nuevo San Andrés",
        "Ojén",
        "Olias",
        "Oliveros",
        "Olletas",
        "Pacífico",
        "Parauta",
        "Parque Cementerio",
        "Parque Clavero",
        "Parque del Guadalhorce",
        "Parque Industrial Trévenez",
        "Parque Las Virreinas",
        "Parque Mediterráneo",
        "Parque Norte",
        "Parque Tecnológico",
        "Paseo Marítimo Oeste",
        "Pedregalejo",
        "Peñarrubia",
        "Perchel Norte",
        "Perchel Sur",
        "Periana",
        "Pilar del Prado",
        "Pinares de San Antón",
        "Pizarra",
        "Playamar",
        "Pol. Crta. De Cártama",
        "Polígono Industrial Guadalhorce",
        "Polígono Industrial La Huertecilla",
        "Poligono Industrial Ordoñez",
        "Polígonos",
        "Portada Alta",
        "Puente don Manuel",
        "Puerta Blanca",
        "Puerto Banús",
        "Puerto de Cabopino",
        "Puerto de la Torre",
        "Puertosol",
        "Pujerra",
        "Punta Chullera",
        "Real Alto",
        "Real Bajo",
        "Recinto Ferial",
        "Reserva de Marbella",
        "Rincón de la Victoria",
        "Rincona",
        "Río de la Miel",
        "Río Real",
        "Riogordo",
        "Riviera del Sol",
        "Ronda",
        "Roquero",
        "Salares",
        "San Alberto",
        "San Carlos Condote",
        "San Felipe Neri",
        "San Francisco",
        "San Luis de Sabinillas",
        "San Pedro de Alcántara",
        "San Rafael",
        "Santa Águeda",
        "Santa Clara",
        "Santa Cristina",
        "Santa Fe de los Boliches",
        "Santa Paula",
        "Santa Rosalía",
        "Santa Siabel",
        "Sayalonga",
        "Sedella",
        "Segovia",
        "Selwo",
        "Serrato",
        "Sierra Blanca",
        "Sierra Blanquilla",
        "Sierra de Yeguas",
        "Sierrezuela",
        "Soho",
        "Suárez",
        "Tabacalera",
        "Teatinos",
        "Teba",
        "The Golden Mile",
        "Tolox",
        "Toril",
        "Torre de Benagalbón",
        "Torre del Mar",
        "Torre del Río",
        "Torre Real",
        "Torreblanca",
        "Torremar",
        "Torremolinos",
        "Torremolinos Centro",
        "Torremuelle",
        "Torrenueva",
        "Torrequebrada",
        "Torrox",
        "Torrox Costa",
        "Totalán",
        "Trapiche",
        "Triana",
        "Valdés",
        "Valle de Abdalajis",
        "Valle del Sol",
        "Valle Romano",
        "Valle-Niza",
        "Vallejo",
        "Valtocado",
        "Vélez-Málaga",
        "Victoria Eugenia",
        "Villafranco del Guadalhorce",
        "Villanueva de Algaidas",
        "Villanueva de Cauche",
        "Villanueva De La Concepcion",
        "Villanueva de Tapia",
        "Villanueva del Rosario",
        "Villanueva del Trabuco",
        "Viñuela",
        "Virgen de Belén",
        "Virreina",
        "Virreina Alta",
        "Vistafranca",
        "Yunquera",
        "Zalea",
      ],
      Cádiz: [
        "Jerez de la Frontera",
        "Cádiz",
        "Algeciras",
        "San Fernando",
        "El Puerto de Santa María",
        "Chiclana de la Frontera",
        "La Línea de la Concepción",
      ],
      Sevilla: [
        "Sevilla",
        "Alcalá de Guadaíra",
        "Carmona",
        "Écija",
        "Osuna",
        "Morón de la Frontera",
      ],
      Granada: ["Granada", "Almuñécar", "Motril", "Baza", "Loja"],
    };
    return fallbackLocations[p] || [];
  }

  escape(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}
