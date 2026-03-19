# 🍷 BARBOX — Backend API REST

> **Calificación del proyecto: 100/100** — API robusta, escalable y segura que alimenta un ecosistema completo de 3 aplicaciones frontend.

**BARBOX Backend** es la API centralizada que impulsa toda la plataforma de gestión de licorería BARBOX: un **E-commerce** público, un sistema de **Punto de Venta (POS)** y un **Backoffice** administrativo. Diseñada con arquitectura multi-canal, autenticación basada en roles y seguridad de nivel producción.

---

## 🏆 Highlights del Proyecto

| Métrica | Valor |
|---|---|
| **Modelos de Base de Datos** | 23 tablas interrelacionadas |
| **Módulos de API** | 25 endpoints versionados (`/api/v1/`) |
| **Controladores** | 25+ controladores especializados |
| **Stored Procedures** | Funciones PostgreSQL para facturación y anulación |
| **Seguridad** | JWT + RBAC + Helmet + Rate Limiting + Correlation ID |
| **Deploy** | Producción en Vercel (Serverless) |

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Node.js 24** | Runtime del servidor |
| **Express 4.18** | Framework HTTP (ES Modules) |
| **Prisma 6.19** | ORM con PostgreSQL + relation joins |
| **JWT + bcryptjs** | Autenticación y encriptación |
| **Helmet 8** | Seguridad HTTP (HSTS, CSP, X-Frame-Options) |
| **express-rate-limit** | 4 limitadores diferenciados (login, API, creación, contraseña) |
| **Multer** | Upload de imágenes (productos, logos, promociones) |
| **PayPal SDK** | Integración de pagos OAuth2 (sandbox/live) |
| **Jest 29 + Supertest** | Testing automatizado |
| **Vercel** | Deploy serverless en producción |

---

## 🗄️ Base de Datos — 23 Modelos

Arquitectura relacional completa con IDs autogenerados, auditoría y control de estados:

| Módulo | Modelos | Descripción |
|---|---|---|
| **Autenticación** | `usuario`, `rol`, `empleado` | Login con hash, roles ADMIN/CAJERO, último acceso |
| **Clientes** | `cliente`, `ciudad` | Origen POS/WEB, vinculación a usuario |
| **Catálogo** | `producto`, `marca`, `categoria_producto`, `unidad_medida` | IDs autogenerados (P000001), código de barras, volumen, % alcohol, notas de cata, imagen, doble unidad de medida |
| **Ventas** | `factura`, `detalle_factura`, `metodo_pago`, `canal_venta` | Multi-canal POS/WEB, estados (EMI/PEN/APR/RET/ANU), IVA dinámico |
| **Carrito** | `carrito`, `carrito_detalle` | UUID, sesión anónima o vinculada a cliente |
| **Compras** | `compra`, `detalle_compra`, `proveedor` | Órdenes a proveedores con IDs autogenerados (C000001) |
| **Bodega** | `recepcion`, `detalle_recepcion` | Cantidad solicitada vs. recibida, motivo de anulación |
| **Inventario** | `ajuste_inventario`, `detalle_ajuste` | Ajustes manuales con trazabilidad |
| **Marketing** | `promocion`, `detalle_promocion`, `categoria_promocion` | % descuento, stock, límite por cliente |
| **E-commerce** | `producto_favorito` | Wishlist para tienda online |
| **Auditoría** | `auditoria` | Log completo: usuario, acción, tabla, valores anteriores, IP |
| **Configuración** | `iva` | Periodos fiscales con fecha inicio/fin y estado |

---

## 🔗 API — 25 Módulos de Rutas

Todas las rutas están versionadas bajo `/api/v1/`:

### 🔐 Autenticación y Usuarios
- **`/auth`** — Login, registro de clientes, perfil, verificación de sesión

### 📊 Panel de Control
- **`/dashboard`** — Ventas del mes, top productos, conteos (productos/clientes/facturas), alertas de stock, facturas recientes

### 📦 Catálogo
- **`/productos`** — CRUD + búsqueda avanzada (descripción, categoría, marca, precio, volumen, código de barras, paginación, ordenamiento)
- **`/categorias-productos`** — Gestión de categorías
- **`/marcas`** — Gestión de marcas con logo
- **`/unidades-medida`** — Unidades de medida

### 💰 Ventas
- **`/facturas`** — Crear (desde POS directo o carrito WEB), anular (`fn_anular_factura()`), retirar, búsqueda multi-criterio
- **`/carrito`** — CRUD, agregar/quitar productos, merge sesión→cliente al login, checkout
- **`/metodos-pago`** — Disponibilidad por canal POS/WEB

### 💳 Pagos
- **`/paypal`** — Crear orden, capturar pago, generación automática de factura post-pago

### 🚚 Compras y Logística
- **`/compras`** — Órdenes de compra a proveedores
- **`/recepciones`** — Recepción de mercadería en bodega
- **`/proveedores`** — Gestión de proveedores

### 🏷️ Marketing
- **`/promociones`** — CRUD con productos asociados, filtrado por categoría
- **`/favoritos`** — Wishlist del e-commerce

### 📋 Inventario y Auditoría
- **`/ajustes-inventario`** — Ajustes manuales de stock
- **`/auditoria`** — Consulta de logs de operaciones

### ⚙️ Configuración
- **`/ciudades`**, **`/iva`**, **`/roles`**, **`/canales-venta`**, **`/empleados`**

---

## 🔒 Seguridad Multi-Capa

```
Request → Correlation ID → Helmet → Rate Limiter → CORS → JWT Auth → RBAC → Controller
```

| Capa | Implementación |
|---|---|
| **Helmet 8** | HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options |
| **Rate Limiting** | 4 limitadores diferenciados: login, API general, creación de recursos, cambio de contraseña |
| **JWT** | Tokens con verificación, modo opcional para rutas públicas |
| **RBAC** | Guards: `soloClientes`, `soloEmpleados`, `requiereRol(...roles)` |
| **Correlation ID** | Trazabilidad de cada request con `X-Correlation-ID` |
| **CORS** | Whitelist configurable de orígenes permitidos |
| **Auditoría** | Log de cada operación con usuario, IP y valores anteriores/nuevos |

---

## 🏗️ Stored Procedures en PostgreSQL

| Función | Descripción |
|---|---|
| `fn_ingresar_factura()` | Creación atómica de factura con detalle, cálculo de IVA y actualización de inventario |
| `fn_anular_factura()` | Anulación con reversión de inventario y registro en auditoría |

---

## 📁 Arquitectura del Proyecto

```
src/
├── config/          # CORS, PayPal, configuraciones
├── controllers/     # 25+ controladores de negocio
├── middleware/       # Auth JWT, seguridad, validadores, RBAC
├── routes/          # 25 módulos de rutas versionadas
├── lib/             # Cliente Prisma singleton
└── utils/           # Helpers y utilidades

prisma/
├── schema.prisma          # 23 modelos + relaciones
├── seed.js                # Datos iniciales
├── migrations/            # Migraciones versionadas
└── stored_procedures/     # Funciones PostgreSQL

api/
└── index.js         # Entry point Vercel Serverless
```

---

## 🌐 Arquitectura Multi-Canal

Un solo backend sirve a **3 frontends** con detección automática de canal y autenticación basada en roles:

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   🛒 E-commerce  │   │   🖥️ POS         │   │   📊 Backoffice  │
│   React 19 + TS  │   │   React 18 + TS  │   │   React 18       │
│   Clientes       │   │   Cajeros        │   │   Administradores │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    🍷 BARBOX API      │
                    │    /api/v1/           │
                    │    Node.js + Express  │
                    │    JWT + RBAC         │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    🐘 PostgreSQL      │
                    │    23 tablas          │
                    │    Stored Procedures  │
                    │    Prisma ORM         │
                    └───────────────────────┘
```

---

## 🔗 Repositorios del Ecosistema BARBOX

| Proyecto | Repositorio | Descripción |
|---|---|---|
| **Backend API** | [backend_BARBOX](https://github.com/chuchobck/backend_BARBOX) | API REST centralizada |
| **Backoffice** | [Backoffice_BARBOX](https://github.com/chuchobck/Backoffice_BARBOX) | Panel administrativo |
| **Punto de Venta** | [POS_BARBOX](https://github.com/chuchobck/POS_BARBOX) | Terminal POS para cajeros |

---

<p align="center">
  Desarrollado como proyecto académico con calificación perfecta <strong>100/100</strong> 🏆
</p>
