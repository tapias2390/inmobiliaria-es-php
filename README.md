# WB Realty - Inmobiliaria

## Configuración

1. Las credenciales se configuran en el archivo `.env`
2. El archivo `.env` está en la raíz del proyecto

## Estructura

```
inmobiliaria/
  .env                   - Credenciales (NO subir a git)
  api/
    config.php           - Endpoint PHP que lee .env y llama a la API
  js/
    config.js            - Apunta al endpoint PHP local
    models/
      PropertyModel.js   - Modelo para obtener datos
    views/
      PropertyView.js    - Vista para renderizar propiedades
    controllers/
      PropertyController.js - Controlador de la lógica
    app.js               - Inicialización de la aplicación
```

## Flujo de datos

1. JavaScript llama a `api/config.php`
2. PHP lee las credenciales del `.env`
3. PHP hace la petición a la API externa
4. PHP devuelve los datos al frontend

## Seguridad

- Las credenciales en `.env` nunca se exponen al navegador
- El archivo `.env` debe estar en `.gitignore`
