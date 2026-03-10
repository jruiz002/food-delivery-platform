# Food Delivery Platform

Bienvenido al proyecto de **Food Delivery Platform**, una solución integral para la gestión de pedidos de comida a domicilio. Este proyecto está diseñado para conectar a usuarios hambrientos con sus restaurantes favoritos a través de una API robusta y escalable.

El sistema permite la gestión de usuarios (consumidores y dueños de restaurantes), administración de menús, realización de pedidos, y un sistema de reseñas para asegurar la calidad del servicio.

## 💻 Frontend (Web App)

El frontend de la plataforma está desarrollado utilizando **Angular** (v20) y **Angular Material**, ofreciendo una interfaz de usuario moderna, reactiva y optimizada tanto para consumidores como para administradores de restaurantes.

### Tecnologías Principales
- **Framework:** Angular v20
- **UI Components:** Angular Material
- **Estilos:** SCSS
- **Ubicación:** `web-app/`

### Instalación y Ejecución

1. Navega al directorio del frontend:
   ```bash
   cd web-app
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm start
   ```
   O utiliza el comando de Angular CLI: `ng serve`

4. Abre tu navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente si realizas cambios en el código fuente.

## 🚀 Backend (Core API)

El backend de la plataforma se encuentra en la carpeta `core-api` y está construido utilizando tecnologías modernas para garantizar rendimiento y mantenibilidad.

### Tecnologías Principales
- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Base de Datos:** MongoDB con [Mongoose](https://mongoosejs.com/)
- **Autenticación:** JWT (JSON Web Tokens) con Roles (Consumer, Restaurant)
- **Validación:** Class-validator y DTOs

### Funcionalidades Clave
- **Gestión de Restaurantes:** CRUD completo, filtrado por dueño, búsqueda por nombre/tags, y gestión de menús.
- **Pedidos:** Creación de órdenes, historial de usuario y actualización de estados por parte del restaurante.
- **Reseñas:** Sistema de calificación y comentarios con validación de compra previa.
- **Seguridad:** Protección de rutas mediante Guards y Decoradores personalizados para control de acceso basado en roles (RBAC).

### 📚 Documentación de la API

Puedes encontrar la documentación completa de todos los endpoints disponibles, ejemplos de peticiones y respuestas en nuestra colección de Postman:

[**Ver Documentación en Postman**](https://universal-trinity-319957.postman.co/workspace/My-Workspace~c4061b24-844f-496f-817c-e62fcb46fbf8/collection/19281513-2ccc1ac9-bca2-480e-b5ef-546f7599b22d?action=share&source=copy-link&creator=34709403)

### Instalación y Ejecución

1. Navega al directorio del backend:
   ```bash
   cd core-api
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
