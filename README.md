# 🍷 BARBOX — Backend API REST Empresarial

> **🏆 Calificación del proyecto: 100/100** — Sistema backend robusto, escalable y de grado empresarial que alimenta un ecosistema completo de 3 aplicaciones frontend en producción.

**BARBOX Backend** es el corazón tecnológico que impulsa toda la plataforma de gestión de licorería BARBOX: un **E-commerce** de alto tráfico, un **sistema POS** de respuesta instantánea para cajeros y un **Backoffice** administrativo completo. Arquitectura multi-canal con autenticación basada en roles, seguridad multicapa y optimización para alta concurrencia.

---

## 🏆 Highlights del Proyecto

| Métrica | Valor |
|---|---|
| **Modelos de Base de Datos** | **28 modelos** completamente relacionados |
| **Módulos de API** | **25+ endpoints** versionados (`/api/v1/`) |
| **Controladores** | **25+ controladores** especializados por dominio |
| **Stored Procedures** | Funciones PostgreSQL para integridad transaccional |
| **Seguridad** | JWT + RBAC + Helmet + **4 Rate Limiters** + Correlation ID |
| **Testing** | Jest + Supertest con cobertura automatizada |
| **Deploy** | **Producción en Vercel** (Serverless Edge Functions) |
| **Líneas de código** | +10,000 líneas de lógica de negocio |

---

## 🛠️ Stack Tecnológico — Tecnologías de Vanguardia

| Tecnología | Versión | Uso & Justificación |
|---|---|---|
| **Node.js** | 24.x LTS | Runtime moderno con performance optimizado, ESM modules nativos |
| **Express** | 4.18 | Framework minimalista y probado en batalla, middleware ecosystem rico |
| **Prisma** | 6.19 | ORM type-safe con generación de cliente, migrations automáticas, preview feature `relationJoins` para queries optimizadas |
| **PostgreSQL** | 14+ | BD relacional robusta con stored procedures, sequences, índices avanzados |
| **JWT + bcryptjs** | jsonwebtoken 9 + bcryptjs 2 | Autenticación stateless + hash seguro de passwords con salt |
| **Helmet** | 8.0 | 12 middleware de seguridad HTTP en una librería |
| **express-rate-limit** | 7.x | Rate limiting flexible con 4 estrategias configuradas |
| **Multer** | 1.4 | Upload multipart/form-data para imágenes de productos y logos |
| **PayPal SDK** | @paypal/checkout-server-sdk | Integración oficial con OAuth2, soporta sandbox y producción |
| **Jest** | 29.x | Testing framework con cobertura, mocks y snapshots |
| **Supertest** | 6.x | Testing de endpoints HTTP de forma declarativa |
| **date-fns** | 3.x | Manipulación de fechas moderna y tree-shakeable |
| **cors** | 2.8 | CORS configurable con whitelist de orígenes |
| **dotenv** | 16.x | Gestión de variables de entorno por ambiente |
| **ESLint + Prettier** | Última | Linting y formateo automático de código |

---

## 🗄️ Base de Datos — 28 Modelos Interrelacionados

Arquitectura relacional de grado empresarial con **IDs autogenerados inteligentes**, **auditoría completa** y **control de estados granular**:

| Módulo | Modelos (8 grupos funcionales) | Descripción |
|---|---|---|
| **👤 Autenticación & Usuarios** | `usuario`, `rol`, `empleado` | Sistema de login con hash bcrypt, roles ADMIN/CAJERO/CLIENTE, tracking de último acceso, estados ACT/INA |
| **🛍️ Clientes & Geografía** | `cliente`, `ciudad` | Multi-origen (POS/WEB), vinculación usuario-cliente, RUC/cédula único, geolocalización |
| **📦 Catálogo de Productos** | `producto`, `marca`, `categoria_producto`, `unidad_medida` | **IDs autogenerados** (P000001), código de barras único indexado, volumen/alcohol %, notas de cata, origen, imagen URL, doble unidad de medida (compra/venta), saldo en tiempo real |
| **💰 Ventas & Facturación** | `factura`, `detalle_factura`, `metodo_pago`, `canal_venta` | **Multi-canal** (POS/WEB), estados complejos (EMI/PEN/APR/RET/ANU), IVA dinámico por periodo, múltiples métodos de pago, fecha de retiro |
| **🛒 Carrito E-commerce** | `carrito`, `carrito_detalle` | **UUID único**, sesión anónima o autenticada, merge automático al login, timestamps de creación/actualización |
| **🚚 Compras & Proveedores** | `compra`, `detalle_compra`, `proveedor` | Órdenes a proveedores con **IDs autogenerados** (C000001, PR00001), estados PEN/APR, subtotales calculados |
| **📥 Logística & Bodega** | `recepcion`, `detalle_recepcion`, `ajuste_inventario`, `detalle_ajuste` | Recepción con cantidad solicitada vs. recibida, motivo de anulación, ajustes manuales con trazabilidad, tipo +/- |
| **🏷️ Marketing & Promociones** | `promocion`, `detalle_promocion`, `categoria_promocion`, `producto_favorito` | % descuento, stock disponible, límite por cliente, producto principal, wishlist para e-commerce |
| **📊 Auditoría & Config** | `auditoria`, `iva` | **Log completo** de cada operación: usuario, fecha/hora, acción, tabla afectada, valores anteriores/nuevos, IP de origen. Periodos fiscales de IVA con vigencia |

### 🔑 Características Avanzadas de BD

- **Secuencias custom** para IDs legibles: `P000001`, `C000001`, `PR00001`
- **Índices estratégicos** en código de barras, RUC/cédula, UUID de carrito
- **Cascadas inteligentes** en deletes para integridad referencial
- **Defaults calculados** con funciones PostgreSQL (`gen_random_uuid()`)
- **Restricciones de dominio** con CHAR(3) para códigos sistematizados
- **Timestamps automáticos** en creación y actualización

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

## 🔒 Seguridad Multi-Capa de Grado Empresarial

```
Request → Correlation ID → Helmet (12 headers) → Rate Limiter (4 estrategias) → CORS → JWT → RBAC → Controller
```

| Capa de Seguridad | Implementación | Beneficio |
|---|---|---|
| **🛡️ Helmet 8** | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, DNS Prefetch Control, Download Options, Expect-CT, Feature Policy, Hide Powered-By, IE No Open, No Sniff, XSS Filter | Protección contra 12 vectores de ataque comunes |
| **⚡ Rate Limiting (4 estrategias)** | <ul><li>**Login Limiter**: 5 intentos/15min</li><li>**API General**: 100 req/15min</li><li>**Creación Recursos**: 20 creates/hora</li><li>**Cambio Contraseña**: 3 cambios/hora</li></ul> | Prevención de ataques de fuerza bruta, DDoS y abuso de API |
| **🔐 JWT** | Tokens con expiración configurable, verificación en middleware, modo opcional para rutas públicas, refresh token strategy | Autenticación stateless escalable |
| **👮 RBAC (Role-Based Access Control)** | Guards especializados: `soloClientes`, `soloEmpleados`, `requiereRol(...roles)`, validación de permisos a nivel de ruta | Control granular de acceso por tipo de usuario |
| **🔍 Correlation ID** | Header `X-Correlation-ID` único por request, propagación en logs, trazabilidad end-to-end | Debugging y monitoreo de requests distribuidos |
| **🌐 CORS Configurable** | Whitelist de orígenes permitidos, credentials support, preflight caching | Seguridad cross-origin sin bloquear integraciones legítimas |
| **📝 Auditoría Total** | Log automático de cada operación CRUD: usuario ejecutor, timestamp, tabla afectada, valores anteriores/nuevos, IP de origen | Compliance, trazabilidad y recuperación ante incidentes |
| **🔒 bcrypt** | Hash de contraseñas con salt rounds configurable, nunca se almacenan passwords en texto plano | Protección de credenciales ante breach de BD |

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

## 🌐 Arquitectura Multi-Canal — 1 Backend, 3 Frontends

**Un solo backend robusto sirve a 3 frontends especializados** con detección automática de canal, autenticación diferenciada por roles y lógica de negocio compartida:

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (3 aplicaciones)                     │
├──────────────────┬──────────────────────┬──────────────────────────────┤
│  🛒 E-COMMERCE   │   🖥️ POS             │   📊 BACKOFFICE              │
│  React 19 + TS   │   React 18 + TS      │   React 18 + Vite            │
│                  │                      │                              │
│  👥 CLIENTES     │   👔 CAJEROS         │   🔑 ADMINISTRADORES         │
│  Canal: WEB      │   Canal: POS         │   Control total              │
│  - Catálogo      │   - Venta rápida     │   - Dashboard KPIs           │
│  - Carrito       │   - Facturación      │   - CRUD 14 módulos          │
│  - PayPal        │   - Retiros          │   - Reportes                 │
│  - Wishlist      │   - Búsqueda veloz   │   - Gestión completa         │
└────────┬─────────┴──────────┬───────────┴────────────┬─────────────────┘
         │                    │                        │
         └────────────────────┼────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │   🍷 BARBOX API REST          │
              │   /api/v1/* (25+ módulos)    │
              ├───────────────────────────────┤
              │  Node.js 24 + Express 4.18    │
              │  JWT + RBAC Multi-Rol         │
              │  Helmet + Rate Limiting       │
              │  PayPal OAuth2 Integration    │
              │  Multer File Uploads          │
              │  Correlation ID Tracking      │
              └───────────────┬───────────────┘
                              │
              ┌───────────────▼───────────────┐
              │   🐘 PostgreSQL Database      │
              │   28 modelos relacionados     │
              ├───────────────────────────────┤
              │  ⚙️ Prisma ORM 6.19            │
              │  🔧 Stored Procedures          │
              │  📊 Relation Joins Preview     │
              │  🔐 Row-Level Security Ready   │
              │  📈 Sequences para IDs custom  │
              └───────────────────────────────┘
```

### ✨ Ventajas de la Arquitectura Centralizada

- **Lógica de negocio única** — Sin duplicación de código entre frontends
- **Fuente única de verdad** — La BD centralizada garantiza consistencia
- **Escalabilidad independiente** — Cada frontend puede escalar según demanda
- **Despliegue desacoplado** — Actualizar un frontend no afecta a los otros
- **Seguridad uniforme** — Mismos estándares de seguridad para todos los clientes
- **Mantenimiento eficiente** — Un bugfix o feature beneficia a todos los frontends

---

## � Características Diferenciadoras

Este proyecto destaca por implementar **buenas prácticas de nivel empresarial** raramente vistas en proyectos académicos:

### 🎯 Arquitectura & Diseño

- **✅ Separación de responsabilidades** — Controllers, Services, Middleware, Routes en capas bien definidas
- **✅ Versionado de API** — `/api/v1/` permite evolución sin breaking changes
- **✅ RESTful puro** — Verbos HTTP correctos, códigos de estado apropiados, recursos sustantivos
- **✅ Error handling centralizado** — Middleware global para respuestas de error consistentes
- **✅ Validación de entrada** — Validadores en middleware antes de llegar a controladores

### 🔐 Seguridad Avanzada

- **✅ 4 estrategias de rate limiting** — Diferenciadas por tipo de endpoint (login vs. API general vs. creación vs. password)
- **✅ Correlation ID** — Trazabilidad de requests distribuidos con header personalizado
- **✅ RBAC granular** — No solo autenticación, sino autorización por roles y permisos
- **✅ Auditoría completa** — Cada operación CRUD logueada con before/after values
- **✅ Helmets con 12 headers** — Protección contra clickjacking, XSS, MIME sniffing, etc.

### 📊 Base de Datos de Nivel Empresarial

- **✅ IDs autogenerados inteligentes** — Secuencias PostgreSQL con formato legible (P000001, C000001)
- **✅ Stored Procedures** — Lógica crítica en la BD para integridad transaccional
- **✅ Índices estratégicos** — En código de barras, RUC/cédula, UUIDs para performance
- **✅ Soft deletes** — Estados ACT/INA en lugar de borrado físico
- **✅ Timestamps automáticos** — Created_at, updated_at en tablas relevantes
- **✅ Relaciones complejas** — Many-to-many, cascadas inteligentes, foreign keys bien diseñadas

### 🚀 Performance & Escalabilidad

- **✅ Prisma relationJoins** — Preview feature para queries N+1 optimizadas
- **✅ Serverless ready** — Deploy en Vercel Edge Functions para auto-scaling
- **✅ Carrito con UUID** — En lugar de IDs secuenciales para distribución
- **✅ Paginación en endpoints** — Limit/offset para grandes datasets
- **✅ Campos calculados** — Saldos, subtotales, totales en BD para consistencia

### 🧪 Testing & Calidad

- **✅ Jest + Supertest** — Tests automatizados de endpoints
- **✅ ESLint + Prettier** — Code quality y formatting consistente
- **✅ TypeScript en schema** — Prisma genera tipos para autocomplete

### 🔄 Integración PayPal Real

- **✅ OAuth2 flow completo** — Crear orden → Aprobación usuario → Captura de pago
- **✅ Sandbox + Production** — Environments configurables
- **✅ Generación automática de factura** — Post-pago exitoso

---

## 🔗 Repositorios del Ecosistema BARBOX

| Proyecto | Repositorio | Descripción |
|---|---|---|
| **🍷 Backend API** | [backend_BARBOX](https://github.com/chuchobck/backend_BARBOX) | **← Estás aquí** — API REST centralizada |
| **📊 Backoffice** | [Backoffice_BARBOX](https://github.com/chuchobck/Backoffice_BARBOX) | Panel administrativo con 14 módulos CRUD |
| **🖥️ Punto de Venta** | [POS_BARBOX](https://github.com/chuchobck/POS_BARBOX) | Terminal POS ultraligero para cajeros |
| **🛒 E-commerce** | [E-commerce_BARBOX](https://github.com/chuchobck/E-commerce_BARBOX) | Tienda online con PayPal y WCAG 2.2 AA |

---

<p align="center">
  <strong>Desarrollado como proyecto integrador de fin de carrera</strong><br>
  Calificación obtenida: <strong>100/100 🏆</strong><br>
  <br>
  <em>Este backend demuestra capacidad para construir sistemas escalables, seguros y mantenibles<br>
  aplicando arquitecturas modernas y buenas prácticas de la industria.</em>
</p>
