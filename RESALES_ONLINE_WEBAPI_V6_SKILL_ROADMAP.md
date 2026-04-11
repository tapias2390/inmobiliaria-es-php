# Roadmap de Skills - Resales Online Web API V6 (Web Developers)

## Objetivo

Aprender a integrar correctamente la **Resales Online Web API V6** en un sitio web (frontend + proxy backend) con buenas prácticas: paginación, filtros, idiomas, sandbox/producción, manejo de errores y rendimiento.

## Requisitos previos

- JavaScript (fetch, async/await, manejo de JSON)
- HTTP básico (query params, status codes)
- Backend básico (ideal: PHP/Node) para ocultar credenciales
- Conceptos de paginación

## Skill Tree (de básico a avanzado)

## Nivel 1: Fundamentos de la API

- **Comprender credenciales y seguridad**
  - **Qué es** `p1` (AgencyId) y `p2` (API Key)
  - Por qué **no** deben ir en el frontend
  - La API Key está asociada a una **IP** (si cambia, hay que regenerarla)

- **Entender los endpoints principales**
  - `SearchProperties`
  - `PropertyDetails`
  - `SearchLocations`
  - `RegisterLead`

- **Entender filtros predefinidos (p_agency_filterid)**
  - `1` Sale
  - `2` Rent Short
  - `3` Rent Long
  - `4` Featured

- **Sandbox vs Producción**
  - `P_sandbox=true` puede devolver resultados limitados o vacíos
  - `P_sandbox=false` es producción

## Nivel 2: Paginación (lo más importante)

- **Lectura de `QueryInfo`**
  - `PropertyCount` = total de propiedades
  - `PropertiesPerPage` = tamaño de página
  - `CurrentPage` = página actual

- **Implementar paginación por parámetros**
  - `p_page` para pedir la página 1, 2, 3...
  - `p_limit` para definir tamaño de página (máx 40)

- **Patrones de UI**
  - Botón **Cargar más**
  - Scroll infinito (más avanzado)

## Nivel 3: Búsquedas y filtros (parámetros)

- **Parámetros de búsqueda comunes**
  - Dormitorios, baños, precio, provincia, ubicación
  - Orden: `P_SortType`

- **Filtrar por referencia(s)**
  - En búsquedas: `P_RefId` (puede ser una o varias referencias en CSV)

- **Tipos de propiedad**
  - `P_PropertyTypes` (según la API)
  - Diferenciar:
    - `PropertyType.NameType` (texto)
    - `PropertyType.TypeId / SubtypeId` (IDs)

## Nivel 4: Idiomas y formato

- **Idioma**
  - `p_lang` (ej: 2 = Español)
  - Saber que algunas respuestas tienen nodos por idioma, ej. `Status.es`

- **Formato de salida**
  - JSON por defecto
  - `p_output=JSON` / `p_output=XML`

## Nivel 5: Integración web profesional (arquitectura)

- **Proxy backend obligatorio**
  - Endpoint propio: `/api/config.php` (o equivalente)
  - Añadir `Content-Type: application/json; charset=utf-8`

- **Model/View/Controller en frontend**
  - Model: llamadas HTTP + transformación
  - View: render
  - Controller: estado (filtro actual, página actual, etc.)

- **Manejo robusto de errores**
  - timeouts
  - status codes
  - mostrar mensajes amigables

## Nivel 6: Casos especiales de negocio

- **Propiedades fuera de mercado**
  - La doc indica que pueden devolverse por 15 días con información limitada

- **New Developments**
  - Se identifican por `PropertyType.NameType: "New Development"`
  - Vienen con rangos (beds, price, built, etc.)

## Nivel 7: Leads (conversión)

- **RegisterLead**
  - Parámetros típicos: `M1`, `M2`, `M5`, `M6`, `M7`, `RsId`
  - Validación y sanitización en el backend

## Checklist rápido (para debug)

- **No hay resultados (`PropertyCount=0`)**
  - Revisar `P_sandbox` (si está en true)
  - Revisar `p_agency_filterid` (1-4)
  - Revisar que la API Key esté activa y que la IP coincida
  - Revisar que el filtro en Resales Online no esté restringiendo provincia/ubicaciones

- **Siempre veo los mismos 10**
  - Estás consultando solo `p_page=1`
  - Debes iterar páginas o implementar "Cargar más"

## Ejercicios recomendados (práctica)

1. **Traer página 1 y 2** con `p_limit=40` y concatenar resultados.
2. Mostrar en consola: `PropertyCount`, `CurrentPage`, `PropertiesPerPage`.
3. Implementar un botón "Cargar más" que pida `p_page++`.
4. Implementar filtro por tipo de propiedad y verificar que cambie el resultado.
5. Implementar un formulario de lead con `RegisterLead` (backend proxy).

## Referencia

- Documentación (Full Documentation for Web Developers):
  - https://webapi-v6.learning.resales-online.com/#full-documentation-for-web-developers
