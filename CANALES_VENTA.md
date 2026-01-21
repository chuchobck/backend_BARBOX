# 📊 CANALES DE VENTA - CONFIGURACIÓN Y USO

## 🎯 Canales Disponibles en el Sistema

La tabla `canal_venta` contiene dos canales principales:

| Código | Descripción | Estado | Uso |
|--------|-------------|--------|-----|
| **POS** | Venta física en punto de venta | ACT | Ventas presenciales con empleado |
| **WEB** | Venta e-commerce | ACT | Compras en línea (frontend) |

---

## 🔄 DETECCIÓN AUTOMÁTICA DEL CANAL

El sistema **detecta automáticamente** el canal en el endpoint de checkout:

### Backend: `factura.controller.js`

```javascript
// Línea 232
const canal = id_empleado ? 'POS' : 'WEB';
```

### Lógica:

- ✅ **Si existe `id_empleado`** → Canal = **POS**
  - El empleado está logueado y procesando la venta
  - Requiere autenticación de empleado
  - Usa métodos de pago con `disponible_pos = true`

- ✅ **Si NO existe `id_empleado`** → Canal = **WEB**
  - Cliente comprando desde e-commerce
  - No requiere empleado
  - Usa métodos de pago con `disponible_web = true`

---

## 📋 VALIDACIONES POR CANAL

### Canal WEB:

1. **Métodos de Pago**
   ```javascript
   if (canal === 'WEB' && !metodoPago.disponible_web) {
     return error('Método de pago no disponible para compras en línea')
   }
   ```

2. **Sucursales (Puntos de Retiro)**
   ```javascript
   if (canal === 'WEB' && !sucursal.es_punto_retiro) {
     return error('La sucursal no está habilitada para retiro')
   }
   ```

3. **Cliente**
   - Debe estar autenticado como CLIENTE
   - Rol: `CLIENTE`

### Canal POS:

1. **Métodos de Pago**
   ```javascript
   if (canal === 'POS' && !metodoPago.disponible_pos) {
     return error('Método de pago no disponible en POS')
   }
   ```

2. **Sucursales**
   - Cualquier sucursal activa
   - No requiere `es_punto_retiro = true`

3. **Empleado**
   - Debe estar autenticado como EMPLEADO
   - Roles: `ADMIN`, `CAJERO`

---

## 🚀 FLUJO E-COMMERCE (Canal WEB)

### 1. Frontend envía al checkout:
```typescript
POST /api/v1/facturas/checkout
{
  "id_cliente": "C000001",
  "id_carrito": "CART123456",
  "id_metodo_pago": 1,
  "id_sucursal": 1
}
```

### 2. Backend detecta:
```javascript
const id_empleado = req.usuario?.id_empleado || null;
const canal = id_empleado ? 'POS' : 'WEB';
// Como no hay id_empleado → canal = 'WEB'
```

### 3. Validaciones aplicadas:
- ✅ Método de pago debe tener `disponible_web = true`
- ✅ Sucursal debe tener `es_punto_retiro = true`
- ✅ Cliente debe estar autenticado

### 4. Factura creada:
```javascript
{
  id_factura: "FAC000123",
  id_canal: "WEB",  // ← Asignado automáticamente
  id_cliente: "C000001",
  id_empleado: null,
  // ...resto de datos
}
```

---

## 🏪 FLUJO POS (Canal POS)

### 1. Frontend POS envía:
```typescript
POST /api/v1/facturas/checkout
{
  "id_cliente": "C000001",
  "id_carrito": "CART123456",
  "id_metodo_pago": 2,
  "id_sucursal": 1
}
// + Token JWT con id_empleado
```

### 2. Backend detecta:
```javascript
const id_empleado = req.usuario?.id_empleado; // "E000001"
const canal = id_empleado ? 'POS' : 'WEB';
// Como SÍ hay id_empleado → canal = 'POS'
```

### 3. Validaciones aplicadas:
- ✅ Método de pago debe tener `disponible_pos = true`
- ✅ Sucursal debe estar activa (no requiere `es_punto_retiro`)
- ✅ Empleado debe tener rol ADMIN o CAJERO

### 4. Factura creada:
```javascript
{
  id_factura: "FAC000124",
  id_canal: "POS",  // ← Asignado automáticamente
  id_cliente: "C000001",
  id_empleado: "E000001",  // ← Empleado que procesó la venta
  // ...resto de datos
}
```

---

## 📊 CONFIGURACIÓN DE BASE DE DATOS

### Tabla: `metodo_pago`

```sql
-- Métodos para WEB (e-commerce)
UPDATE metodo_pago 
SET disponible_web = true 
WHERE id_metodo_pago IN (1, 2, 3);
-- Ejemplo: Tarjeta Crédito, Tarjeta Débito, PayPal

-- Métodos para POS (punto de venta)
UPDATE metodo_pago 
SET disponible_pos = true 
WHERE id_metodo_pago IN (1, 2, 4, 5);
-- Ejemplo: Tarjeta Crédito, Tarjeta Débito, Efectivo, Transferencia
```

### Tabla: `sucursal`

```sql
-- Habilitar sucursales como puntos de retiro para WEB
UPDATE sucursal 
SET es_punto_retiro = true 
WHERE id_sucursal IN (1, 2);
-- Solo sucursales habilitadas para retiro web

-- Todas las sucursales activas pueden usarse en POS
UPDATE sucursal 
SET activo = true;
```

---

## 🎯 ENDPOINTS POR CANAL

### E-Commerce (WEB):

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/sucursales/puntos-retiro` | Sucursales con `es_punto_retiro = true` |
| `GET /api/v1/metodos-pago/disponibles-web` | Métodos con `disponible_web = true` |
| `POST /api/v1/facturas/checkout` | Crear factura (canal WEB automático) |
| `GET /api/v1/facturas/mis-pedidos` | Pedidos del cliente WEB |

### POS (Punto de Venta):

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/sucursales` | Todas las sucursales activas |
| `GET /api/v1/metodos-pago` | Todos los métodos activos |
| `POST /api/v1/facturas/checkout` | Crear factura (canal POS automático) |
| `GET /api/v1/facturas/pedidos-retiro` | Pedidos pendientes de retiro |

---

## 🔐 AUTENTICACIÓN POR CANAL

### E-Commerce (WEB):
```
Role: CLIENTE
Token JWT con:
- id_usuario
- id_cliente
- rol: "CLIENTE"
```

### POS:
```
Role: ADMIN | CAJERO
Token JWT con:
- id_usuario
- id_empleado
- rol: "ADMIN" | "CAJERO"
```

---

## 📝 RESUMEN

| Aspecto | Canal WEB | Canal POS |
|---------|-----------|-----------|
| **Detección** | Sin `id_empleado` | Con `id_empleado` |
| **Usuario** | Cliente autenticado | Empleado autenticado |
| **Métodos Pago** | `disponible_web = true` | `disponible_pos = true` |
| **Sucursales** | `es_punto_retiro = true` | Cualquiera activa |
| **Frontend** | E-commerce React | POS React |
| **Flujo** | Compra online → Retiro | Venta presencial directa |

---

## ✅ VERIFICACIÓN

### ¿Cómo saber qué canal se usó en una factura?

```sql
SELECT 
  f.id_factura,
  f.id_canal,
  cv.descripcion AS canal_descripcion,
  f.id_empleado,
  CASE 
    WHEN f.id_empleado IS NULL THEN 'E-Commerce'
    ELSE 'Punto de Venta'
  END AS tipo_venta
FROM factura f
JOIN canal_venta cv ON f.id_canal = cv.id_canal;
```

### Resultado esperado:
```
id_factura | id_canal | canal_descripcion | id_empleado | tipo_venta
-----------|----------|-------------------|-------------|------------
FAC000001  | WEB      | Venta e-commerce  | NULL        | E-Commerce
FAC000002  | POS      | Venta física...   | E000001     | Punto de Venta
```

---

## 🎉 CONCLUSIÓN

El sistema **detecta automáticamente** el canal basándose en la presencia del `id_empleado`:

- ✅ **Sin empleado** = Compra WEB (e-commerce)
- ✅ **Con empleado** = Venta POS (presencial)

**No es necesario enviar el canal desde el frontend**, el backend lo asigna correctamente según el contexto de autenticación.
