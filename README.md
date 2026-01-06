# BARBOX - Backend API

API REST para sistema de gestión de licorería online con soporte para E-commerce, Backoffice y POS.

## 🚀 Tecnologías

- **Node.js** 18+
- **Express** 4.x
- **Prisma ORM** 6.19.0
- **PostgreSQL** 13+
- **JWT** para autenticación
- **bcryptjs** para encriptación de contraseñas

## 📋 Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 13 o superior
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
cd "Clase 9 backend"
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd"
JWT_SECRET="tu_secreto_jwt_seguro"
NODE_ENV=development
```

4. **Ejecutar migraciones de Prisma**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Opcional: Poblar base de datos con datos de prueba**
```bash
npm run prisma:seed
```

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuraciones (BD, CORS, etc.)
├── controllers/     # Controladores de rutas
├── middleware/      # Middlewares (auth, errors, etc.)
├── routes/          # Definición de rutas
├── utils/           # Utilidades
└── server.js        # Punto de entrada

prisma/
├── schema.prisma    # Esquema de base de datos
├── migrations/      # Migraciones
└── seed.js          # Datos iniciales

public/              # Archivos estáticos (imágenes)
```

## 🔑 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/registro` - Registrar nuevo cliente
- `GET /api/v1/auth/perfil` - Obtener perfil (requiere auth)
- `PUT /api/v1/auth/actualizar-perfil` - Actualizar perfil (requiere auth)
- `PUT /api/v1/auth/cambiar-password` - Cambiar contraseña (requiere auth)

### Catálogo
- `GET /api/v1/catalogo/productos` - Listar productos
- `GET /api/v1/catalogo/productos/:id` - Detalle de producto
- `GET /api/v1/catalogo/categorias` - Listar categorías
- `GET /api/v1/catalogo/marcas` - Listar marcas

### Carrito
- `GET /api/v1/carrito` - Obtener carrito del usuario (requiere auth)
- `POST /api/v1/carrito/items` - Agregar item al carrito (requiere auth)
- `PUT /api/v1/carrito/items/:id` - Actualizar cantidad (requiere auth)
- `DELETE /api/v1/carrito/items/:id` - Eliminar item (requiere auth)

### Pedidos
- `POST /api/v1/pedidos` - Crear pedido (requiere auth)
- `GET /api/v1/pedidos/:id` - Ver detalle de pedido (requiere auth)
- `GET /api/v1/pedidos/usuario/:idUsuario` - Historial de pedidos (requiere auth)

### Pagos
- `POST /api/v1/pagos/paypal` - Procesar pago con PayPal (requiere auth)
- `POST /api/v1/pagos/tarjeta` - Procesar pago con tarjeta (requiere auth)

### Favoritos
- `GET /api/v1/favoritos` - Listar favoritos (requiere auth)
- `POST /api/v1/favoritos` - Agregar a favoritos (requiere auth)
- `DELETE /api/v1/favoritos/:id` - Quitar de favoritos (requiere auth)

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens). Para endpoints protegidos, incluir el token en el header:

```
Authorization: Bearer <token>
```

## 🌐 CORS

El servidor acepta peticiones desde:
- `http://localhost:3001` (Frontend BARBOX)

Para agregar más orígenes, editar `src/config/cors.js`

## 📊 Base de Datos

El proyecto usa Prisma ORM. Para gestionar la base de datos:

```bash
# Ver base de datos en interfaz visual
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Regenerar cliente Prisma
npm run prisma:generate
```

## 🚨 Scripts de Utilidad y Archivos de Desarrollo

### Archivos `.js` en la raíz (NO necesarios para producción)
Estos son scripts de desarrollo/debug creados durante el desarrollo:
- `debug-*.js` - Scripts de depuración de la API
- `test-*.js` - Scripts de prueba de endpoints
- `check-*.js` - Scripts de verificación de datos
- `list-*.js` - Scripts para listar tablas/datos
- `fix-*.js` - Scripts para arreglar datos
- `get-*.js` - Scripts para obtener información
- `search-*.js` - Scripts de búsqueda en BD
- `all-counts.js`, `non-empty.js` - Utilidades diversas

### Archivos `.json` y `.txt` en la raíz (NO necesarios para producción)
- `cats.json` - Datos temporales de categorías
- `counts.json` - Contadores de prueba
- `mapping_data.txt` - Mapeo temporal de datos
- `thunder-client-*.json` - Colecciones de Thunder Client (opcional)

### ⚠️ Importante
**Estos archivos están excluidos en `.gitignore` y NO se subirán a GitHub.**

Para limpiar antes de subir a GitHub:
```bash
# Usando npm script (recomendado)
npm run clean

# O usando los scripts batch/shell
# Windows:
cleanup-dev-files.bat

# Linux/Mac:
chmod +x cleanup-dev-files.sh
./cleanup-dev-files.sh
```

**Los archivos importantes del proyecto están en:**
- `src/` - Código fuente principal
- `prisma/` - Esquema y migraciones de BD
- `package.json` - Dependencias
- `.env.example` - Ejemplo de variables de entorno

## 📝 Notas de Producción

Antes de desplegar en producción:

1. ✅ Cambiar `JWT_SECRET` a un valor seguro y único
2. ✅ Configurar `DATABASE_URL` con credenciales de producción
3. ✅ Establecer `NODE_ENV=production`
4. ✅ Verificar que `.env` NO esté en el repositorio
5. ✅ Configurar CORS para el dominio de producción
6. ⚠️ Considerar usar variables de entorno del hosting (no `.env`)
7. ⚠️ Implementar rate limiting y seguridad adicional

## 📄 Licencia

ISC

## 👥 Contacto

Para soporte: info@barbox.com
WhatsApp: +593 99 173 0968
