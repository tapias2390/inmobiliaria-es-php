# Proceso Completo: Inmobiliaria con Resales Online Web API V6

## Resumen del flujo

```
Usuario entra a la web
        |
        v
[1] Ver listado de propiedades (con filtros)
        |
        v
[2] Aplicar filtros (tipo operación, tipo propiedad, etc.)
        |
        v
[3] Ver detalle de una propiedad
        |
        v
[4] Contactar / Solicitar información (RegisterLead)
        |
        v
[5] (Opcional) Agendar cita / Reserva (BookingCalendar)
```

---

## [1] Listado de propiedades

### Qué pasa internamente

1. El navegador carga `index.html`
2. JavaScript (`app.js`) inicializa el modelo, vista y controlador
3. El controlador llama a `model.fetchProperties(page, limit, filter, propertyType)`
4. El modelo construye la URL: `api/config.php?filter=1&page=1&limit=20`
5. El PHP (`config.php`) lee las credenciales del `.env`
6. El PHP construye la URL de la API de Resales Online:
   ```
   https://webapi.resales-online.com/V6/SearchProperties?
   p_agency_filterid=1
   &p1=1036546
   &p2=4182efd65f...
   &P_sandbox=false
   &p_lang=2
   &p_page=1
   &p_limit=20
   ```
7. El PHP hace la petición curl y devuelve JSON al navegador
8. El modelo transforma los datos y traduce al español
9. La vista renderiza las tarjetas de propiedades

### Qué ve el usuario

- 20 propiedades en venta (primeras 20)
- Abajo aparece el botón "Cargar más propiedades"

### Parámetros clave del listado

| Parámetro | Ejemplo | Descripción |
| --------- |:-------:| ------------|
| `filter` | 1, 2, 3, 4 | 1=Venta, 2=Alquiler Corto, 3=Alquiler Largo, 4=Destacadas |
| `page` | 1, 2, 3... | Página de resultados |
| `limit` | 20 | Resultados por página (máx 40) |
| `propertyTypes` | Apartment, Villa | Filtrar por tipo de propiedad |

---

## [2] Filtros

### Filtros disponibles en la web

#### a) Filtro por tipo de operación (botones)

| Botón | filter= | Equivalente API |
| ------|:-------:| -----------------|
| Venta | 1 | p_agency_filterid=1 |
| Alquiler Corto Plazo | 2 | p_agency_filterid=2 |
| Alquiler Largo Plazo | 3 | p_agency_filterid=3 |
| Destacadas | 4 | p_agency_filterid=4 |

**Qué pasa cuando el usuario hace click:**
1. El usuario hace click en "Alquiler Largo Plazo"
2. `FilterView` detecta el click y llama a `controller.setFilter(3)`
3. El controlador guarda `currentFilter = 3`
4. El controlador llama a `loadProperties()` con el nuevo filtro
5. Se hace una nueva petición a la API con `p_agency_filterid=3`
6. La vista muestra las propiedades de alquiler largo

#### b) Filtro por tipo de propiedad (dropdown)

El dropdown tiene opciones como:
- Todos los tipos
- Apartamento
- Villa
- Casa
- etc.

**Qué pasa cuando el usuario selecciona una:**
1. El usuario selecciona "Villa"
2. `PropertyTypeFilterView` detecta el cambio y llama a `controller.setPropertyType("Villa")`
3. El controlador guarda `currentPropertyType = "Villa"`
4. El controlador llama a `loadProperties()` con el tipo
5. Se añade el parámetro `propertyTypes=Villa` a la petición
6. La API devuelve solo villas

#### c) "Cargar más" (paginación)

**Qué pasa cuando el usuario hace click:**
1. El usuario hace click en "Cargar más propiedades"
2. El controlador incrementa `currentPage++` (ej. de 1 a 2)
3. Llama a `loadProperties(true)` (append=true)
4. Se hace la petición con `p_page=2`
5. La vista **concatena** las nuevas propiedades a las existentes
6. Si hay más resultados, aparece otro botón "Cargar más"

---

## [3] Ver detalle de una propiedad

### Qué pasa internamente

1. El usuario hace click en una tarjeta de propiedad
2. El navegador navega a: `property.html?ref=R4689523&filter=1`
3. `app-detail.js` se ejecuta:
   - Lee el parámetro `ref` de la URL
   - Si no hay `ref`, redirige a `index.html`
4. Llama a `model.fetchPropertyByReference(reference)`
5. El modelo construye: `api/config.php?ref=R4689523`
6. El PHP detecta el parámetro `ref` y:
   - Añade `P_RefId=R4689523` a la petición
   - Llama a `SearchProperties` (no `PropertyDetails`) filtrando por referencia
7. Devuelve la propiedad específica
8. `PropertyDetailView` renderiza el detalle

### Qué ve el usuario

- Imagen principal grande
- Título (tipo - ubicación)
- Precio
- Descripción
- Características (features)
- Galería de fotos
- Botón "Contactar"

### Parámetros del detalle

| Parámetro | Ejemplo | Descripción |
| --------- |:-------:| ------------|
| `ref` | R4689523 | Referencia de la propiedad |
| `filter` | 1 | Filtro original (para volver) |

---

## [4] Contactar / Solicitar información (RegisterLead)

### Qué pasa internamente

1. El usuario completa un formulario de contacto:
   - Nombre (M1)
   - Apellido (M2)
   - Email (M5)
   - Mensaje (M7)
   - Referencia de la propiedad (RsId)
2. El JavaScript envía los datos a `api/config.php?action=registerLead&...`
3. El PHP valida y sanitiza los datos
4. El PHP construye la URL de `RegisterLead`:
   ```
   https://webapi.resales-online.com/V6/RegisterLead?
   p_agency_filterid=1
   &p1=...
   &p2=...
   &M1=Juan
   &M2=Pérez
   &M5=juan@email.com
   &M7=Estoy interesado en esta propiedad
   &RsId=R4689523
   ```
5. La API devuelve: "Your request has been successfully forwarded"
6. El PHP devuelve éxito al navegador
7. La web muestra "Mensaje enviado correctamente"

### Parámetros de RegisterLead

**Obligatorios:**
| Parámetro | Descripción |
| --------- | ------------|
| M1 | Nombre |
| M2 | Apellido |
| M5 | Email |
| M6 | Asunto |
| M7 | Mensaje |

**Opcionales pero útiles:**
| Parámetro | Descripción |
| --------- | ------------|
| M3 | Teléfono |
| RsId | Referencia(s) de propiedad |
| W10 | Tipo: 1=Venta, 2=Alquiler Corto, 3=Alquiler Largo |

---

## [5] (Opcional) Agendar cita / Ver disponibilidad

### BookingCalendar: para alquileres vacacionales

Si tienes alquileres de corto plazo y quieres mostrar disponibilidad:

1. El usuario está en el detalle de una propiedad de alquiler
2. La web puede llamar a `api/config.php?action=calendar&ref=R3479785&start=2026-06-01&end=2026-08-31`
3. El PHP construye:
   ```
   https://webapi.resales-online.com/V6/BookingCalendar?
   p_agency_filterid=2
   &P_RefId=R3479785
   &P_StartDate=2026-06-01
   &P_EndDate=2026-08-31
   ```
4. La API devuelve las fechas reservadas en `DateRanges`
5. La web muestra un calendario con las fechas disponibles/reservadas

### Parámetros de BookingCalendar

| Parámetro | Descripción |
| --------- | ------------|
| P_RefId | Referencia de la propiedad |
| P_StartDate | Fecha inicio (YYYY-MM-DD) |
| P_EndDate | Fecha fin (YYYY-MM-DD) |

---

## Resumen: Cómo se conecta cada parte

```
index.html (listado)
    |
    +-- app.js (inicialización)
    |       |
    |       +-- PropertyController.js (lógica)
    |               |
    |               +-- PropertyModel.js (datos) ---> api/config.php ---> Resales Online API
    |               |
    |               +-- PropertyView.js (render)
    |               +-- FilterView.js (botones)
    |               +-- PropertyTypeFilterView.js (dropdown)
    |
    +-- property.html (detalle)
            |
            +-- app-detail.js
                    |
                    +-- PropertyModel.js ---> api/config.php ---> Resales Online API
                    |
                    +-- PropertyDetailView.js
```

---

## Para implementar RegisterLead

1. Crear el formulario en `property.html` (nombre, email, mensaje)
2. Crear endpoint en `api/config.php` para `action=registerLead`
3. Llamar desde JavaScript con los datos del formulario
4. Mostrar mensaje de éxito/error

¿Quieres que implemente el formulario de contacto en la página de detalle?
