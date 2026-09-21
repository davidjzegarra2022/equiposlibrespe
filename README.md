# SmartSelect

Tienda de celulares con catálogo dinámico y panel de administrador para editar precios en tiempo real.

## Estructura

- `server/` — API en Express (Node.js). Sirve el catálogo público y las rutas protegidas de administración.
- `server/data/products.json` — base de datos de productos (precio, stock, especificaciones). El backend lee y escribe aquí.
- `public/` — frontend estático: `index.html` (tienda) y `admin.html` (panel de administrador).

## Requisitos

- Node.js 18+

## Configuración

1. Copia `.env.example` a `.env` y define tus credenciales:

   ```
   cp .env.example .env
   ```

   - `ADMIN_USER` / `ADMIN_PASSWORD`: credenciales del panel `/admin.html`.
   - `SESSION_SECRET`: cadena aleatoria para firmar la cookie de sesión.

2. Instala dependencias:

   ```
   npm install
   ```

3. Actualiza el número de WhatsApp de la tienda en `public/js/store.js` (`WHATSAPP_NUMBER`).

## Ejecutar

```
npm start
```

La tienda queda disponible en `http://localhost:3000` y el panel de administrador en `http://localhost:3000/admin.html`.

## Cómo funciona la edición de precios

1. El administrador inicia sesión en `/admin.html` con las credenciales de `.env`.
2. Cada fila de la tabla permite editar el precio y el estado de stock de un producto.
3. Al guardar, se hace un `PATCH` a `/api/admin/products/:id/price` (o `/stock`), protegido por sesión.
4. El servidor actualiza `server/data/products.json` y el cambio se refleja de inmediato en la tienda pública (`GET /api/products`), sin necesidad de reiniciar el servidor ni tocar código.
