# Resales Online Web API V6 - Guía Completa en Español

> **Versión:** 6.1.0 (Febrero 2024)

---

## ¿Qué es la WebAPI?

La **WebAPI** es un servicio que permite que tu sitio web obtenga **propiedades en tiempo real** desde Resales-Online. No necesitas una base de datos propia.

**URL base de la API:**

```
https://webapi.resales-online.com/V6/NOMBRE_DEL_ENDPOINT
```

---

## ¿Cómo funciona? (Explicación simple)

```
Tu sitio web (frontend)
        |
        v
Tu servidor (PHP proxy) - aquí están las credenciales ocultas
        |
        v
Resales Online API - devuelve las propiedades
```

---

## Parámetros que siempre debes enviar

Son como "credenciales" que la API necesita para saber quién eres y qué quieres:

| Parámetro           | ¿Qué es?      | ¿Para qué sirve?                              | Ejemplo         |
| ------------------- | ------------- | --------------------------------------------- | --------------- |
| `p1`                | **Agency ID** | Es tu ID de agencia (te lo da Resales-Online) | `1036546`       |
| `p2`                | **API Key**   | Es tu contraseña secreta (asociada a tu IP)   | `4182efd65f...` |
| `p_agency_filterid` | **Filtro**    | Indica qué tipo de propiedades quieres (1-4)  | `1` = Ventas    |
| `P_sandbox`         | **Entorno**   | `true` = pruebas, `false` = producción        | `false`         |
| `p_lang`            | **Idioma**    | Idioma de los datos devueltos                 | `2` = Español   |

### ¿Qué significa cada filtro?

| Filter ID | Nombre             | ¿Qué devuelve?                            |
| :-------: | ------------------ | ----------------------------------------- |
|     1     | **Venta**          | Propiedades en venta                      |
|     2     | **Alquiler Corto** | Alquileres de vacaciones (días/semanas)   |
|     3     | **Alquiler Largo** | Alquileres de larga duración (meses/años) |
|     4     | **Destacadas**     | Solo propiedades destacadas de tu agencia |

### Códigos de idioma

| Código | Idioma      |
| :----: | ----------- |
|   1    | Inglés      |
|   2    | **Español** |
|   3    | Alemán      |
|   4    | Francés     |
|   5    | Holandés    |
|   6    | Danés       |
|   7    | Ruso        |
|   8    | Sueco       |
|   9    | Polaco      |
|   10   | Noruego     |
|   11   | Turco       |
|   13   | Finlandés   |
|   14   | Húngaro     |

---

## Los 7 Endpoints (explicados uno por uno)

---

### 1) SearchProperties (BUSCAR PROPIEDADES)

**¿Para qué sirve?**

> Es el endpoint principal. Sirve para **obtener una lista de propiedades** según filtros (venta, alquiler, precio, ubicación, etc.).

**¿Cuándo usarlo?**

- Cuando quieres mostrar el catálogo de propiedades en tu web
- Para el listado principal de tu página de inicio
- Para búsquedas con filtros (precio, dormitorios, provincia, etc.)

**URL completa:**

```
https://webapi.resales-online.com/V6/SearchProperties
```

**Datos que ENVÍAS (parámetros):**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?                               | Ejemplo            |
| ------------------- | :-----------: | ---------------------------------------- | ------------------ |
| `p1`                |    **Sí**     | Tu ID de agencia                         | `1036546`          |
| `p2`                |    **Sí**     | Tu API Key                               | `4182efd65f...`    |
| `p_agency_filterid` |    **Sí**     | Tipo de búsqueda (1-4)                   | `1` = Ventas       |
| `P_sandbox`         |      No       | `false` = producción                     | `false`            |
| `p_lang`            |      No       | Idioma (2=español)                       | `2`                |
| `p_page`            |      No       | Página número X                          | `1`, `2`, `3`...   |
| `p_limit`           |      No       | Cuántos resultados (máx 40)              | `20`               |
| `P_Min`             |      No       | Precio mínimo                            | `100000`           |
| `P_Max`             |      No       | Precio máximo                            | `500000`           |
| `P_Beds`            |      No       | Dormitorios (`2`=exactos, `2x`=mínimo 2) | `2x`               |
| `P_Baths`           |      No       | Baños                                    | `2`                |
| `P_Location`        |      No       | Ubicación específica                     | `Marbella`         |
| `P_Province`        |      No       | Provincia                                | `Málaga`           |
| `P_PropertyTypes`   |      No       | Tipos de propiedad (códigos)             | `2-1,2-2`          |
| `P_SortType`        |      No       | Orden de resultados                      | `0`, `1`, `2`, `3` |
| `P_RefId`           |      No       | Buscar por referencia(s)                 | `R3479851`         |

**Ejemplo de llamada completa:**

```bash
https://webapi.resales-online.com/V6/SearchProperties?p_agency_filterid=1&p1=1036546&p2=4182efd65f...&P_sandbox=false&p_lang=2&p_page=1&p_limit=20
```

**Datos que RECIBES (respuesta):**

```json
{
  "transaction": {
    "status": "success",  // "success" = OK, "error" = falló
    "version": "6.0"
  },
  "QueryInfo": {
    "PropertyCount": 42,    // Total de propiedades encontradas
    "CurrentPage": 1,       // Página actual
    "PropertiesPerPage": 20 // Resultados por página
  },
  "Property": [             // Array con las propiedades
    {
      "Reference": "R3479851",  // Referencia única
      "Location": "Marbella",   // Ubicación
      "PropertyType": { "NameType": "Villa" },  // Tipo
      "Price": 450000,          // Precio
      "Bedrooms": "4",          // Dormitorios
      "Bathrooms": "3",         // Baños
      "MainImage": "https://...", // Imagen principal
      ...
    },
    ...
  ]
}
```

---

### 2) PropertyDetails (DETALLE DE PROPIEDAD)

**¿Para qué sirve?**

> Obtener **todos los detalles de una propiedad específica** (descripción completa, todas las imágenes, características, coordenadas GPS, etc.).

**¿Cuándo usarlo?**

- Cuando el usuario hace click en una propiedad y quieres mostrar su página de detalle

**URL:**

```
https://webapi.resales-online.com/V6/PropertyDetails
```

**Datos que ENVÍAS:**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?                          |
| ------------------- | :-----------: | ----------------------------------- |
| `p1`                |    **Sí**     | Tu ID de agencia                    |
| `p2`                |    **Sí**     | Tu API Key                          |
| `p_agency_filterid` |    **Sí**     | Filtro (1-4)                        |
| `P_RefId`           |    **Sí**     | Referencia de la propiedad a buscar |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/PropertyDetails?p_agency_filterid=1&p1=1036546&p2=KEY&P_sandbox=false&P_RefId=R3479851
```

**Datos que RECIBES:**

- Descripción completa
- Todas las imágenes (no solo la principal)
- Características detalladas
- Coordenadas GPS (latitud/longitud)
- Certificado energético
- Virtual Tour (si hay)
- Información de la promoción (si es nueva construcción)

---

### 3) SearchPropertyTypes (TIPOS DE PROPIEDAD)

**¿Para qué sirve?**

> Obtener la **lista de tipos de propiedad** disponibles (Apartamento, Villa, Casa, etc.) para crear filtros en tu web.

**¿Cuándo usarlo?**

- Para populate el dropdown de "Tipo de propiedad" en los filtros de búsqueda

**URL:**

```
https://webapi.resales-online.com/V6/SearchPropertyTypes
```

**Datos que ENVÍAS:**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?       |
| ------------------- | :-----------: | ---------------- |
| `p1`                |    **Sí**     | Tu ID de agencia |
| `p2`                |    **Sí**     | Tu API Key       |
| `p_agency_filterid` |    **Sí**     | Filtro (1-4)     |
| `p_lang`            |      No       | Idioma           |

**Datos que RECIBES:**

```json
{
  "PropertyType": [
    { "TypeId": "1-1", "NameType": "Apartamento" },
    { "TypeId": "2-1", "NameType": "Villa" },
    { "TypeId": "3-1", "NameType": "Terreno" }
  ]
}
```

---

### 4) SearchFeatures (CARACTERÍSTICAS)

**¿Para qué sirve?**

> Obtener la lista de **características** disponibles para filtrar (Piscina, Jardín, Primera línea de playa, Golf, etc.).

**¿Cuándo usarlo?**

- Para crear filtros avanzados por características

**URL:**

```
https://webapi.resales-online.com/V6/SearchFeatures
```

**Datos que ENVÍAS:**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?       |
| ------------------- | :-----------: | ---------------- |
| `p1`                |    **Sí**     | Tu ID de agencia |
| `p2`                |    **Sí**     | Tu API Key       |
| `p_agency_filterid` |    **Sí**     | Filtro (1-4)     |
| `p_lang`            |      No       | Idioma           |

**Cómo usarlo para filtrar:**

La respuesta te da un código (`ParamName`) que puedes usar en `SearchProperties`:

```bash
# La API devuelve: ParamName = "1Setting1" (primera línea de playa)
# Tú usas ese código para filtrar:
.../SearchProperties?...&1Setting1=1
```

---

### 5) SearchLocations (UBICACIONES)

**¿Para qué sirve?**

> Obtener la lista de **ubicaciones/zonas** disponibles según el filtro configurado.

**¿Cuándo usarlo?**

- Para el selector de ubicación en los filtros
- Para autocompletado de búsqueda

**URL:**

```
https://webapi.resales-online.com/V6/SearchLocations
```

**Datos que ENVÍAS:**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?                     |
| ------------------- | :-----------: | ------------------------------ |
| `p1`                |    **Sí**     | Tu ID de agencia               |
| `p2`                |    **Sí**     | Tu API Key                     |
| `p_agency_filterid` |    **Sí**     | Filtro (1-4)                   |
| `P_SortType`        |      No       | Orden: 0=sistema, 1=A-Z, 2=Z-A |
| `P_All`             |      No       | `TRUE` = todas las ubicaciones |

**Datos que RECIBES:**

```json
{
  "LocationData": {
    "ProvinceArea": {
      "ProvinceAreaName": "Málaga",
      "Locations": {
        "Location": ["Marbella", "Fuengirola", "Benalmadena", ...]
      }
    }
  }
}
```

---

### 6) BookingCalendar (CALENDARIO DE RESERVAS)

**¿Para qué sirve?**

> Ver qué **fechas están reservadas** en una propiedad (para alquileres vacacionales).

**¿Cuándo usarlo?**

- Cuando quieres mostrar un calendario de disponibilidad en propiedades de alquiler

**URL:**

```
https://webapi.resales-online.com/V6/BookingCalendar
```

**Datos que ENVÍAS:**

| Parámetro           | ¿Obligatorio? | ¿Qué hace?                  |
| ------------------- | :-----------: | --------------------------- |
| `p1`                |    **Sí**     | Tu ID de agencia            |
| `p2`                |    **Sí**     | Tu API Key                  |
| `p_agency_filterid` |    **Sí**     | Filtro (2 = alquiler corto) |
| `P_RefId`           |    **Sí**     | Referencia de la propiedad  |
| `P_StartDate`       |      No       | Fecha inicio (YYYY-MM-DD)   |
| `P_EndDate`         |      No       | Fecha fin (YYYY-MM-DD)      |

**Datos que RECIBES:**

- Si `DateRanges` está vacío = la propiedad está disponible
- Si tiene fechas = esas fechas están reservadas

---

### 7) RegisterLead (ENVIAR CONTACTO)

**¿Para qué sirve?**

> Enviar los **datos de un cliente interesado** al CRM de Resales-Online para que la agencia lo contacte.

**¿Cuándo usarlo?**

- Cuando un usuario completa el formulario de contacto en tu web

**URL:**

```
https://webapi.resales-online.com/V6/RegisterLead
```

**Datos que ENVÍAS (obligatorios):**

| Parámetro | ¿Qué es?             | Ejemplo                          |
| --------- | -------------------- | -------------------------------- |
| `M1`      | Nombre del cliente   | `Juan`                           |
| `M2`      | Apellido del cliente | `Pérez`                          |
| `M5`      | Email del cliente    | `juan@email.com`                 |
| `M6`      | Asunto del mensaje   | `Interés en propiedad`           |
| `M7`      | Mensaje del cliente  | `Estoy interesado en esta villa` |

**Datos que ENVÍAS (opcionales):**

| Parámetro | ¿Qué es?                                          |
| --------- | ------------------------------------------------- |
| `M3`      | Teléfono fijo                                     |
| `M4`      | Teléfono móvil                                    |
| `RsId`    | Referencia de la propiedad(s)                     |
| `W10`     | Tipo: 1=Venta, 2=Alquiler Corto, 3=Alquiler Largo |
| `IP`      | IP del cliente                                    |
| `Source`  | Origen del lead                                   |

**Datos que RECIBES:**

```
Your request has been successfully forwarded.
One of our representatives will contact you shortly.
```

---

## Códigos de Error

Si algo sale mal, la API devuelve códigos de error:

| Código  | Significado                      | Qué hacer                                         |
| ------- | -------------------------------- | ------------------------------------------------- |
| **001** | La IP no coincide con tu API Key | Verifica que la IP de tu servidor esté registrada |
| **002** | Agency ID (p1) no válido         | Revisa el valor de p1                             |
| **003** | Filtro no especificado           | Añade p_agency_filterid                           |
| **102** | API Key (p2) no válida           | Revisa el valor de p2                             |
| **103** | FilterAgencyId no válido         | El filtro 1-4 no existe                           |

---

## Resumen: ¿Qué endpoint usar?

| Necesidad...                          | Endpoint a usar       |
| ------------------------------------- | --------------------- | ------------------------------------------------------ |
| Mostrar lista de propiedades          | `SearchProperties`    |
| Mostrar detalle de una propiedad      | `PropertyDetails`     |
| Crear filtro de tipos de propiedad    | `SearchPropertyTypes` |
| Crear filtro de características       | `SearchFeatures`      |
| Crear selector de ubicaciones         | `SearchLocations`     |
| Mostrar disponibilidad de alquiler    | `BookingCalendar`     |
| Enviar formulario de contacto         | `RegisterLead`        |
| ------------------------------------: | :---------:           | ------------------------------------------------------ |
| `p_agency_filterid`                   | Sí\*                  | Filtro (1-4)                                           |
| `P_ApiId`                             | Sí\*                  | ID del filtro                                          |
| `p1`                                  | Sí                    | Agency ID                                              |
| `p2`                                  | Sí                    | API Key                                                |
| `p_page`                              | No                    | Página (default 1)                                     |
| `p_limit`                             | No                    | Resultados por página (máx 40, default 10)             |
| `p_lang`                              | No                    | Idioma                                                 |
| `P_RefId`                             | No                    | Referencia(s) CSV para buscar por referencia           |
| `P_Beds`                              | No                    | Dormitorios (2 = exacto, 2x = mínimo 2)                |
| `P_Baths`                             | No                    | Baños                                                  |
| `P_Min`                               | No                    | Precio mínimo                                          |
| `P_Max`                               | No                    | Precio máximo                                          |
| `P_Location`                          | No                    | Ubicación                                              |
| `P_Province`                          | No                    | Provincia                                              |
| `P_PropertyTypes`                     | No                    | Tipos de propiedad (ej. 1-1,1-2)                       |
| `P_SortType`                          | No                    | Orden (0=sistema, 1=A-Z, 2=Z-A, 3=fecha actualización) |
| `P_New_Devs`                          | No                    | Solo nuevas promociones                                |
| `P_EnergyRating`                      | No                    | Certificado energético                                 |
| `P_Built_Min` / `P_Built_Max`         | No                    | Metros cuadrados construidos                           |
| `P_Plot_Min` / `P_Plot_Max`           | No                    | Tamaño parcela                                         |
| `P_RentalDateFrom` / `P_RentalDateTo` | No                    | Fechas de alquiler                                     |
| `P_ShowLastUpdateDate`                | No                    | Mostrar fecha de actualización                         |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/SearchProperties?p_agency_filterid=1&p1=1036546&p2=4182efd65f...&P_sandbox=false&p_lang=2&p_page=1&p_limit=20
```

**Respuesta exitosa:**

```json
{
  "transaction": { "status": "success" },
  "QueryInfo": {
    "ApiId": "5950",
    "PropertyCount": 42,
    "CurrentPage": 1,
    "PropertiesPerPage": 10
  },
  "Property": [...]
}
```

---

### 2) PropertyDetails

**Propósito:** Obtener el detalle completo de una propiedad específica.

**URL:** `https://webapi.resales-online.com/V6/PropertyDetails`

**Parámetros:**

|           Parámetro | Obligatorio | Descripción                |
| ------------------: | :---------: | -------------------------- |
|           `P_RefId` |     Sí      | Referencia de la propiedad |
| `p_agency_filterid` |    Sí\*     | Filtro                     |
|           `P_ApiId` |    Sí\*     | ID del filtro              |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/PropertyDetails?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&P_RefId=R3479851
```

**En V6.1 incluye por defecto:**

- Virtual Tour y Video Tour (solo propiedades propias)
- Coordenadas GPS (latitud/longitud)
- int_floor_space (metros cuadrados útiles)
- levels (pisos)
- freehold/leasehold (propiedades comerciales)
- Energy rating completo

---

### 3) SearchPropertyTypes

**Propósito:** Obtener lista de tipos de propiedad disponibles según el filtro.

**URL:** `https://webapi.resales-online.com/V6/SearchPropertyTypes`

**Parámetros:**

|           Parámetro | Obligatorio | Descripción   |
| ------------------: | :---------: | ------------- |
| `p_agency_filterid` |    Sí\*     | Filtro        |
|           `P_ApiId` |    Sí\*     | ID del filtro |
|            `p_lang` |     No      | Idioma        |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/SearchPropertyTypes?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2
```

**Respuesta:**

```json
{
  "PropertyType": [
    { "TypeId": "1-1", "NameType": "Apartamento", "Subtype": [...] },
    { "TypeId": "2-1", "NameType": "Villa", "Subtype": [...] }
  ]
}
```

---

### 4) SearchFeatures

**Propósito:** Obtener características disponibles para filtrar (piscina, jardín, primera línea playa, etc.).

**URL:** `https://webapi.resales-online.com/V6/SearchFeatures`

**Parámetros:**

|           Parámetro | Obligatorio | Descripción   |
| ------------------: | :---------: | ------------- |
| `p_agency_filterid` |    Sí\*     | Filtro        |
|           `P_ApiId` |    Sí\*     | ID del filtro |
|            `p_lang` |     No      | Idioma        |

**Cómo usar para filtrar en SearchProperties:**

El resultado devuelve `ParamName` (ej. `1Setting1`) que se usa como parámetro:

```bash
.../SearchProperties?...&1Setting1=1
```

**Categorías de features:**

- Setting (primera línea playa, golf, etc.)
- Pool (piscina)
- Garden (jardín)
- Parking (garaje)
- Utilities (electricidad, agua, etc.)
- Category (ganga, lujo, inversión, etc.)
- Rentals (mascotas permitidas, etc.)

---

### 5) SearchLocations

**Propósito:** Devolver ubicaciones disponibles según la configuración del filtro.

**URL:** `https://webapi.resales-online.com/V6/SearchLocations`

**Parámetros:**

|           Parámetro | Obligatorio | Descripción                     |
| ------------------: | :---------: | ------------------------------- |
| `p_agency_filterid` |    Sí\*     | Filtro                          |
|           `P_ApiId` |    Sí\*     | ID del filtro                   |
|        `P_SortType` |     No      | Orden (0=sistema, 1=A-Z, 2=Z-A) |
|             `P_All` |     No      | TRUE = todas las ubicaciones    |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/SearchLocations?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&P_Lang=2&P_All=TRUE
```

---

### 6) BookingCalendar

**Propósito:** Ver calendario de disponibilidad/reservas de una propiedad (alquileres).

**URL:** `https://webapi.resales-online.com/V6/BookingCalendar`

**Parámetros:**

|     Parámetro | Obligatorio | Descripción                   |
| ------------: | :---------: | ----------------------------- |
|     `P_RefId` |     Sí      | Referencia de la propiedad    |
| `P_StartDate` |     No      | Inicio del rango (YYYY-MM-DD) |
|   `P_EndDate` |     No      | Fin del rango (YYYY-MM-DD)    |

**Notas:**

- Si no se incluyen fechas, devuelve todas las fechas reservadas próximas.
- Si `DateRanges` está vacío, no hay reservas en el rango.

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/BookingCalendar?p_agency_filterid=2&p1=AGENCY&p2=KEY&P_sandbox=false&P_RefId=R3479785&P_StartDate=2026-01-01&P_EndDate=2026-12-31
```

---

### 7) RegisterLead

**Propósito:** Registrar el interés de un cliente en una propiedad en el CRM de Resales-Online.

**URL:** `https://webapi.resales-online.com/V6/RegisterLead`

**Parámetros obligatorios:**

| Parámetro | Descripción               |
| --------- | ------------------------- |
| M1        | Nombre                    |
| M2        | Apellido                  |
| M5        | Email                     |
| M6        | Asunto                    |
| M7        | Mensaje (no permite URLs) |

**Parámetros opcionales:**

| Parámetro | Descripción                                       |
| --------- | ------------------------------------------------- |
| M3        | Teléfono fijo                                     |
| M4        | Móvil                                             |
| W1        | País                                              |
| W2        | Provincia/Área                                    |
| W3        | Lista de ubicaciones (csv)                        |
| W4        | Tipos de propiedad                                |
| W6        | Dormitorios                                       |
| W7        | Baños                                             |
| W8        | Precio mínimo                                     |
| W9        | Precio máximo                                     |
| W10       | Tipo: 1=Venta, 2=Alquiler Corto, 3=Alquiler Largo |
| W11       | Fecha inicio alquiler (DD-MM-YYYY)                |
| W12       | Fecha fin alquiler (DD-MM-YYYY)                   |
| W13       | Amueblado                                         |
| IP        | IP remota                                         |
| Source    | Origen del lead                                   |
| RsId      | Referencias de propiedad (separadas por `;`)      |

**Ejemplo:**

```bash
https://webapi.resales-online.com/V6/RegisterLead?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&P_Lang=2&M1=Juan&M2=Pérez&M5=juan@email.com&M6=Lead%20desde%20web&M7=Estoy%20interesado&RsId=R3479851
```

**Respuesta exitosa:**

```
Your request has been successfully forwarded.
One of our representatives will contact you shortly.
```

---

## Errores comunes

**Códigos de error:**

| Código | Descripción                      |
| ------ | -------------------------------- |
| 001    | La IP no coincide con tu API Key |
| 002    | P1 no válido                     |
| 003    | FilterId faltante                |
| 102    | P2 (API Key) no válido           |
| 103    | FilterAgencyId no válido         |

**Ejemplo de respuesta de error:**

```json
{
  "transaction": {
    "status": "error",
    "errordescription": {
      "102": "P2 not valid",
      "103": "FilterAgencyId not valid",
      "001": "the IP does not match with your API key"
    }
  }
}
```

---

## V6 vs V6.1

### Cambios en V6.1

**Parámetros ya no necesarios (se incluyen por defecto):**

- `P_virtualTours` (Virtual Tour y Video Tour)
- `P_showallprices` (precios de venta y alquiler juntos)
- `P_shownewdevname` (nombre de nueva promoción)
- `P_show_dev_prices` (rangos de precio)
- `P_ERShowAll` (datos completos de energy rating)
- `P_showGPSCoords` (coordenadas GPS)
- `P_RTA` (referencia RTA para alquileres cortos)
- `P_showLastUpdateDate` (fecha de última actualización)

**Nuevos datos incluidos:**

- `int_floor_space` (metros cuadrados útiles)
- `levels` (pisos/niveles)
- `freehold` / `leasehold` (propiedades comerciales)

**Cambio en descripciones:**

- V6.0: Si no hay descripción en el idioma solicitado, devuelve inglés.
- V6.1: Devuelve vacío + descripción inglés en nodo separado.

---

## FAQ

**P: ¿Cómo sé el total de propiedades de una búsqueda?**
R: Revisa el campo `QueryInfo.PropertyCount`

**P: ¿Cómo identifico nuevas promociones?**
R: Busca en `PropertyType.NameType` = "New Development"

**P: ¿Puedo usar la API para poblar una base de datos local?**
R: Sí, usa `p_ShowLastUpdateDate=true` + `p_SortType=3` para obtener propiedades ordenadas por fecha de actualización.

**P: ¿Qué hago si la API devuelve 0 propiedades?**
R: Verifica:

- Que `P_sandbox=false` (si es producción)
- Que la IP del servidor coincide con la API Key
- Que el filtro tiene propiedades activas

---

## 1) SearchProperties

### Para qué sirve

Devuelve un **listado** de propiedades según el filtro (`p_agency_filterid`) y parámetros de búsqueda adicionales.

### Cuándo usarlo

- **Producción**:
  - Para mostrar listados (Venta / Alquiler corto / Alquiler largo / Destacadas).
  - Para búsquedas con filtros (precio, dormitorios, provincia, ubicación, etc.).
- **Pruebas**:
  - Validar integración, paginación y parámetros.

### Paginación (obligatoria)

Aunque `QueryInfo.PropertyCount` sea alto, la API devuelve resultados por páginas.

- `p_page`: página (1, 2, 3...)
- `p_limit`: tamaño página (máx 40)

### Parámetros útiles (ejemplos)

- `P_Min`, `P_Max`: rango de precio
- `P_Beds`, `P_Baths`: dormitorios/baños
- `P_Province`, `P_Location`: provincia / ubicación
- `P_SortType`: orden
- `P_Images`: imágenes a incluir
- `P_RefId`: filtrar por referencia(s) exactas (CSV o 1 valor)

### Casos comunes (ejemplos)

Venta: básico

```bash
.../SearchProperties?p_agency_filterid=1&...&p_page=1&p_limit=20
```

Venta: 2 dormitorios (mínimo)

```bash
.../SearchProperties?p_agency_filterid=1&...&P_Beds=2x&p_page=1&p_limit=20
```

Alquiler largo: básico

```bash
.../SearchProperties?p_agency_filterid=3&...&p_page=1&p_limit=20
```

Alquiler corto: básico

```bash
.../SearchProperties?p_agency_filterid=2&...&p_page=1&p_limit=20
```

Venta: por tipos de propiedad

```bash
.../SearchProperties?p_agency_filterid=1&...&P_PropertyTypes=2-4,2-5&p_page=1&p_limit=20
```

Venta: por tipo + ubicación

```bash
.../SearchProperties?p_agency_filterid=1&...&P_PropertyTypes=2-4&P_Location=Marbella&p_page=1&p_limit=20
```

Venta: paginación (página 2)

```bash
.../SearchProperties?p_agency_filterid=1&...&p_page=2&p_limit=40
```

Venta: por características (features)

Depende de cómo la API codifique las características. Normalmente se usa un parámetro específico del endpoint (ver `SearchFeatures`) y luego filtrar usando los IDs/valores que corresponda.

### Ejemplo (API directa)

```bash
https://webapi.resales-online.com/V6/SearchProperties?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2&p_page=1&p_limit=40
```

### Ejemplo (tu proxy)

```bash
api/config.php?filter=1&page=1&limit=20
```

---

## 2) PropertyDetails

### Para qué sirve

Devuelve el **detalle completo** de una propiedad (más campos que `SearchProperties`).

### Cuándo usarlo

- **Producción**:
  - Página de detalle `property.html`.
- **Pruebas**:
  - Validar idiomas, descripciones, características (features), galería y campos extra.

### Parámetro clave

- `P_RefId`: referencia de la propiedad.

### Ejemplo (API directa)

```bash
https://webapi.resales-online.com/V6/PropertyDetails?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2&P_RefId=R4689523
```

### Multiple languages (múltiples idiomas)

La API V6 soporta devolver varios idiomas en el detalle (según la configuración/versión). Si lo necesitas para un sitio multiidioma, pide los idiomas requeridos en el request de detalle siguiendo el formato indicado por la documentación.

### Nota importante

La documentación indica que si una propiedad sale del mercado, puede devolverse por un tiempo (ej. 15 días) con información limitada y estado (status).

---

## 3) SearchPropertyTypes

### Para qué sirve

Devuelve el catálogo de **tipos y subtipos de propiedad** disponibles para usar en filtros (por ejemplo para construir un selector y enviar `P_PropertyTypes`).

### Cuándo usarlo

- **Producción**:
  - Para poblar dropdowns/filtros de tipos desde la fuente oficial.
- **Pruebas**:
  - Verificar IDs disponibles (`TypeId`, `SubtypeId`) y cómo combinarlos.

### Ejemplo

```bash
https://webapi.resales-online.com/V6/SearchPropertyTypes?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2
```

## 4) SearchFeatures

### Para qué sirve

Devuelve el catálogo de **características/amenities** (features) que luego se usan para filtrar propiedades.

### Cuándo usarlo

- **Producción**:
  - Para construir filtros de características (ej. piscina, jardín, vistas, etc.) sin hardcodear.
- **Pruebas**:
  - Validar IDs/valores y cómo se aplican en `SearchProperties`.

### Ejemplo

```bash
https://webapi.resales-online.com/V6/SearchFeatures?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2
```

### Cómo usar para filtrar en SearchProperties

El resultado de `SearchFeatures` devuelve un `ParamName` (ej. `1Setting1`) que se usa como parámetro en `SearchProperties`:

```bash
.../SearchProperties?...&1Setting1=1
```

**Ejemplo:** Si quieres filtrar propiedades en primera línea de playa:

1. Llamar a `SearchFeatures` y buscar "Beachfront"
2. Obtener su `ParamName` (ej. `1Setting1`)
3. En `SearchProperties` agregar `1Setting1=1`

---

## 5) SearchLocations

### Para qué sirve

Devuelve ubicaciones disponibles según la configuración del filtro.

### Cuándo usarlo

- **Producción**:
  - Autocompletado / selectores de ubicación.
- **Pruebas**:
  - Confirmar qué ubicaciones devuelve tu filtro.

### Parámetros adicionales

| Parámetro    |  Valores   | Descripción                                                    |
| ------------ | :--------: | -------------------------------------------------------------- |
| `P_SortType` |  0, 1, 2   | Orden de las ubicaciones                                       |
| `P_All`      | TRUE/FALSE | TRUE = todas las ubicaciones (sin importar si hay propiedades) |

**Orden (P_SortType):**

- `0` = Sistema (Costa del Sol: Oeste a Este)
- `1` = Alfabético (A a Z)
- `2` = Inverso del sistema (Este a Oeste)

### Nota clave

- Por defecto devuelve ubicaciones dentro de la(s) provincia(s) configuradas en el filtro.
- Si el filtro tiene ubicaciones seleccionadas, solo devuelve esas.
- Para obtener todas las ubicaciones ignorando el filtro de ubicación ("Location filter") (dentro de las provincias del filtro), usar:
  - `P_All=true`

### Ejemplo

```bash
https://webapi.resales-online.com/V6/SearchLocations?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2&P_All=true
```

---

## 6) BookingCalendar

### Para qué sirve

Devuelve información del **calendario de reservas/disponibilidad** (normalmente relevante para alquileres, especialmente corto plazo).

### Cuándo usarlo

- Mostrar disponibilidad en la ficha de una propiedad (si tu negocio usa reservas/calendario).
- **Pruebas**:
  - Validar respuesta y disponibilidad para referencias específicas.

### Parámetros

| Parámetro     | Obligatorio | Descripción                               |
| ------------- | :---------: | ----------------------------------------- |
| `P_RefId`     |     Sí      | Referencia de la propiedad (ej. R3479785) |
| `P_StartDate` |     No      | Inicio del rango (YYYY-MM-DD)             |
| `P_EndDate`   |     No      | Fin del rango (YYYY-MM-DD)                |

**Notas:**

- Si no se incluyen fechas, devuelve todas las fechas reservadas próximas.
- Si `DateRanges` está vacío, no hay reservas en el rango seleccionado.

### Ejemplo

El formato exacto puede requerir referencia y rango de fechas (según la documentación). Ejemplo base:

```bash
https://webapi.resales-online.com/V6/BookingCalendar?p_agency_filterid=2&p1=AGENCY&p2=KEY&P_sandbox=false&p_lang=2&P_RefId=RXXXXXXX&P_StartDate=YYYY-MM-DD&P_EndDate=YYYY-MM-DD
```

## 7) RegisterLead

### Para qué sirve

Envía un **lead** (cliente potencial / contacto) a la agencia por una propiedad.

### Cuándo usarlo

- **Producción**:
  - Formulario “Me interesa esta propiedad” en el detalle.
- **Pruebas**:
  - Validar que llegan los leads.

### Parámetros típicos

**Obligatorios:**

| Parámetro | Descripción               |
| --------- | ------------------------- |
| `M1`      | Nombre                    |
| `M2`      | Apellido                  |
| `M5`      | Email                     |
| `M6`      | Asunto de la consulta     |
| `M7`      | Mensaje (no permite URLs) |

**Opcionales:**

| Parámetro | Descripción                                                  |
| --------- | ------------------------------------------------------------ |
| `M3`      | Teléfono fijo                                                |
| `M4`      | Móvil                                                        |
| `W1`      | País                                                         |
| `W2`      | Área/Provincia                                               |
| `W3`      | Lista de ubicaciones (csv)                                   |
| `W4`      | Tipos de propiedad (ej. 2-3,2-4)                             |
| `W5`      | Subtipos de propiedad                                        |
| `W6`      | Dormitorios (2 = exacto, 2x = mínimo 2)                      |
| `W7`      | Baños                                                        |
| `W8`      | Precio mínimo                                                |
| `W9`      | Precio máximo                                                |
| `W10`     | Tipo búsqueda: 1=Reventa, 2=Alquiler Corto, 3=Alquiler Largo |
| `W11`     | Fecha inicio alquiler (DD-MM-YYYY)                           |
| `W12`     | Fecha fin alquiler (DD-MM-YYYY)                              |
| `W13`     | Amueblado (alquiler)                                         |
| `IP`      | IP remota                                                    |
| `Source`  | Origen del lead                                              |
| `RsId`    | Referencias de propiedad (separadas por `;`)                 |

### Ejemplo (API directa)

```bash
https://webapi.resales-online.com/V6/RegisterLead?p_agency_filterid=1&p1=AGENCY&p2=KEY&P_sandbox=false&P_Lang=2&M1=John&M2=Doe&M5=john.doe@email.com&M6=Lead%20from%20website&M7=Estoy%20interesado&RsId=R3479851
```

### Recomendación de seguridad

Hacer `RegisterLead` siempre desde backend/proxy:

- Validar/sanitizar los campos
- Evitar exponer credenciales
- Evitar abuso (rate-limit / captcha si es necesario)

---

## ¿Cuál endpoint uso? (guía rápida)

- **Listado / búsqueda**: `SearchProperties`
- **Detalle de un inmueble**: `PropertyDetails`
- **Tipos de propiedad para filtros**: `SearchPropertyTypes`
- **Características para filtros**: `SearchFeatures`
- **Selector de ubicaciones**: `SearchLocations`
- **Calendario de reservas/disponibilidad**: `BookingCalendar`
- **Formulario de contacto / lead**: `RegisterLead`
