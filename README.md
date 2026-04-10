# WB Realty - Inmobiliaria

## Configuración

1. Las credenciales se configuran en el archivo `.env`
2. El archivo `.env` está en la raíz del proyecto

### Idioma (.env)

El idioma se configura en el `.env` con código de idioma (es, en, de, fr, etc.) y el PHP lo convierte al código numérico de la API:

| .env | API | Descripción |
| ---- | --- | ----------- |
| `es` | 2   | Español     |
| `en` | 1   | Inglés      |
| `de` | 3   | Alemán      |
| `fr` | 4   | Francés     |
| `nl` | 5   | Holandés    |
| `da` | 6   | Danés       |
| `ru` | 7   | Ruso        |
| `sv` | 8   | Sueco       |
| `pl` | 9   | Polaco      |
| `no` | 10  | Noruego     |
| `tr` | 11  | Turco       |
| `fi` | 13  | Finlandés   |
| `hu` | 14  | Húngaro     |

**Ejemplo en .env:**

```
LANGUAGE=es
SANDBOX=false
```

**Nota:** Para producción usar `SANDBOX=false`. El modo sandbox puede no devolver los datos en el idioma solicitado.

## API Externa

- **Proveedor:** Resales Online
- **Versión:** 6.1.0
- **Endpoint:** `https://webapi.resales-online.com/V6/`
- **Documentación:** https://webapi.resales-online.com/

## Filtros de Propiedades (Predefined Filters)

Los filtros vienen configurados en la API de Resales Online. Cada API Key tiene 4 filtros por defecto:

| Filter ID | Nombre API           | Descripción                         |
| --------- | -------------------- | ----------------------------------- |
| 1         | Default - Sale       | Propiedades en venta                |
| 2         | Default - Rent Short | Alquiler a corto plazo (vacacional) |
| 3         | Default - Rent Long  | Alquiler a largo plazo              |
| 4         | Default - Featured   | Propiedades en venta destacadas     |

### Cómo usar los filtros

**Desde la URL:**

```
api/config.php?filter=2&page=1
```

**Desde el navegador (consola):**

```javascript
controller.setFilter(1); // Venta
controller.setFilter(2); // Alquiler Corto Plazo
controller.setFilter(3); // Alquiler Largo Plazo
controller.setFilter(4); // Destacadas
```

**Desde la interfaz:**
Los botones en la página permiten cambiar filtros dinámicamente.

## Endpoints Disponibles

### SearchProperties

Busca propiedades con filtros:

```
GET https://webapi.resales-online.com/V6/SearchProperties
```

### PropertyDetails

Obtiene el detalle de una propiedad por referencia:

```
GET https://webapi.resales-online.com/V6/PropertyDetails?p_reference=R1234567
```

### RegisterLead

Registra un lead/interés en una propiedad:

```
GET https://webapi.resales-online.com/V6/RegisterLead?RsId=R1234567&M1=Nombre&M2=Apellido&M5=email@email.com&M7=Mensaje
```

### SearchLocations

Busca ubicaciones disponibles:

```
GET https://webapi.resales-online.com/V6/SearchLocations?P_All=true
```

## Parámetros de la API

### Parámetros principales

| Parámetro           | Descripción                                                                               | Ejemplo     |
| ------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| `p_agency_filterid` | ID del filtro (1-4)                                                                       | 1           |
| `p1`                | ID de la agencia                                                                          | 1036546     |
| `p2`                | API Key                                                                                   | 4182efd6... |
| `P_sandbox`         | Modo sandbox (true/false)                                                                 | false       |
| `p_lang`            | Idioma (1=EN, 2=ES, 3=DE, 4=FR, 5=NL, 6=DA, 7=RU, 8=SV, 9=PL, 10=NO, 11=TR, 13=FI, 14=HU) | 2           |
| `p_page`            | Número de página                                                                          | 1           |
| `p_limit`           | Resultados por página (máx 40)                                                            | 10          |
| `p_reference`       | Referencia de propiedad                                                                   | R5104846    |

### Parámetros de búsqueda

| Parámetro API      | Descripción                                                                                              | Ejemplo           |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ----------------- |
| `P_Beds`           | Dormitorios (2 = exacto, 2x = mínimo 2)                                                                  | 2 o 2x            |
| `P_Baths`          | Baños (2 = exacto, 2x = mínimo 2)                                                                        | 2                 |
| `P_Min`            | Precio mínimo                                                                                            | 100000            |
| `P_Max`            | Precio máximo                                                                                            | 500000            |
| `P_Location`       | Ubicación específica (csv)                                                                               | Marbella,Estepona |
| `P_Province`       | Provincia                                                                                                | Málaga            |
| `P_PropertyTypes`  | Tipos de propiedad (csv)                                                                                 | 2-3,2-4           |
| `P_SortType`       | Ordenación (0=precio asc, 1=precio desc, 2=ubicación, 3=más reciente, 4=más antiguo, 5=nuevo, 6=antiguo) | 3                 |
| `P_Currency`       | Moneda (EUR, GBP, USD, RUB, TRY, SAR)                                                                    | EUR               |
| `P_EnergyRating`   | Certificación energética (1-16)                                                                          | 5                 |
| `p_new_devs`       | Nuevos desarrollos (exclude, include, only)                                                              | include           |
| `P_Images`         | Número de imágenes (0=todas, 1=principal, n=específico)                                                  | 1                 |
| `P_Dimension`      | Dimensión (1=metros, 2=pies)                                                                             | 1                 |
| `P_Built_Min`      | Tamaño construido mínimo (m²)                                                                            | 50                |
| `P_Built_Max`      | Tamaño construido máximo (m²)                                                                            | 200               |
| `P_Plot_Min`       | Tamaño parcela mínimo (m²)                                                                               | 500               |
| `P_Plot_Max`       | Tamaño parcela máximo (m²)                                                                               | 2000              |
| `P_RentalDateFrom` | Fecha inicio alquiler (DD-MM-YYYY)                                                                       | 01-06-2026        |
| `P_RentalDateTo`   | Fecha fin alquiler (DD-MM-YYYY)                                                                          | 30-08-2026        |
| `P_IncludeRented`  | Incluir alquiladas (0=no, 1=sí)                                                                          | 1                 |
| `P_onlydecree218`  | Decreto 218 (0=no, 1=sí)                                                                                 | 1                 |
| `P_RemoveLocation` | Excluir ubicaciones                                                                                      | Calahonda         |
| `P_RefId`          | Referencias específicas (csv)                                                                            | R12345,R67890     |

## Parámetros del frontend

| Parámetro | Descripción                            | Valor por defecto |
| --------- | -------------------------------------- | ----------------- |
| page      | Número de página                       | 1                 |
| limit     | Propiedades por página                 | 10                |
| filter    | ID del filtro de propiedades           | 1                 |
| ref       | Referencia de propiedad (para detalle) | -                 |

## Estructura del proyecto

```
inmobiliaria/
  .env                   - Credenciales (NO subir a git)
  index.html             - Página principal con listado
  property.html          - Página de detalle de propiedad
  api/
    config.php           - Endpoint PHP que lee .env y llama a la API
  js/
    config.js            - Configuración del frontend
    app.js               - Inicialización del listado
    app-detail.js        - Inicialización del detalle
    models/
      PropertyModel.js   - Modelo para obtener datos
    views/
      PropertyView.js           - Vista del listado
      PropertyDetailView.js     - Vista del detalle
      PaginationView.js         - Vista de paginación
      FilterView.js             - Vista de filtros
    controllers/
      PropertyController.js     - Controlador de la lógica
  img/
    property-placeholder.svg    - Imagen por defecto
```

## Flujo de datos

1. JavaScript llama a `api/config.php` con parámetros (page, limit, filter, reference)
2. PHP lee las credenciales del `.env`
3. PHP construye la URL de la API externa (Resales Online)
4. PHP hace la petición curl a la API externa
5. PHP devuelve los datos al frontend
6. El modelo transforma los datos y traduce al español
7. La vista renderiza las propiedades

## Notas importantes

- Las propiedades fuera del mercado o vendidas se devuelven durante 15 días con información limitada
- Los desarrollos nuevos (New Developments) se identifican por `PropertyType.NameType: "New Development"`
- Para populate de base de datos local, usar `p_ShowLastUpdateDate=true` y `p_SortType=3`

## Seguridad

- Las credenciales en `.env` nunca se exponen al navegador
- El archivo `.env` debe estar en `.gitignore`
- La API Key está asociada a una IP específica
