# Plan de Refactoring - Arquitectura con Stored Procedures

**Fecha**: 20 de Enero de 2026  
**Estado**: En Planificación  
**Responsables**:
- **POS/Ventas & Bodega**: Refactoring Node.js + Stored Procedures (James: Base de Datos)
- **Compras**: Refactoring con Prisma directo

---

## 📋 Resumen Ejecutivo

El sistema debe reorganizarse en **3 patrones diferentes**:

| Módulo | Patrón | Responsable BD | Lógica |
|--------|--------|---|---------|
| **POS (Ventas)** | Stored Procedures | James | BD |
| **Bodega** | Stored Procedures | James | BD |
| **Compras** | Prisma + Node.js | Backend | Node.js |
| **Ajuste Inventario** | Por Definir | Por Definir | Por Definir |

---

## 🎯 MÓDULO 1: VENTAS (POS)

### Requisito
Desde el controlador **SOLO se debe llamar**:
1. `sp_cliente_crear()` - Crear cliente
2. `sp_factura_crear()` - Crear factura

**NO implementar lógica de validación, cálculo de totales, manejo de inventario, etc. en Node.js**

### Cambios Requeridos

#### 1.1 Cliente Controller (`cliente.controller.js`)
**Métodos a simplificar:**
- ✅ `listarClientes()` - Mantener con Prisma
- ✅ `buscarClientes()` - Mantener con Prisma
- ❌ `crearCliente()` - **REEMPLAZAR por llamada a sp_cliente_crear()**
- ✅ `actualizarCliente()` - Mantener con Prisma
- ✅ `eliminarCliente()` - Mantener con Prisma

**Lógica que irá a BD:**
- Validación de cédula
- Generación de ID
- Validación de duplicados
- Registro en auditoría
- Cualquier otra validación

**Ejemplo de nueva implementación:**
```javascript
export const crearCliente = async (req, res, next) => {
  try {
    const { ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad } = req.body;
    
    // Validación mínima en Node
    if (!ruc_cedula || !nombre1 || !apellido1) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos requeridos: ruc_cedula, nombre1, apellido1',
        data: null
      });
    }

    // LLAMAR a sp_cliente_crear
    const cliente = await prisma.$queryRaw`
      SELECT * FROM sp_cliente_crear(
        ${ruc_cedula}::VARCHAR(13),
        ${nombre1}::VARCHAR(50),
        ${apellido1}::VARCHAR(50),
        ${email}::VARCHAR(100),
        ${telefono}::VARCHAR(20),
        ${id_ciudad}::CHAR(3)
      )
    `;

    return res.status(201).json({
      status: 'success',
      message: 'Cliente creado exitosamente',
      data: cliente[0]
    });
  } catch (err) {
    next(err);
  }
};
```

#### 1.2 Factura Controller (`factura.controller.js`)
**Métodos a simplificar:**
- ✅ `listarFacturas()` - Mantener con Prisma
- ✅ `buscarFacturas()` - Mantener con Prisma
- ❌ `crearFactura()` - **REEMPLAZAR por llamada a sp_factura_crear()**
- ✅ Otros métodos - Mantener con Prisma

**Lógica que irá a BD:**
- Validación de cliente, carrito, método de pago, sucursal
- Cálculo de totales, subtotales, IVA
- Generación de número de factura
- Descuento de inventario
- Registro de movimiento en bodega
- Auditoría
- Transacción completa

**Ejemplo de nueva implementación:**
```javascript
export const crearFactura = async (req, res, next) => {
  try {
    const { id_cliente, id_carrito, id_metodo_pago, id_sucursal } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // Validación mínima en Node
    if (!id_cliente || !id_carrito || !id_metodo_pago || !id_sucursal) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan parámetros requeridos',
        data: null
      });
    }

    // LLAMAR a sp_factura_crear
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_factura_crear(
        ${id_cliente}::INTEGER,
        ${id_carrito}::UUID,
        ${id_metodo_pago}::INTEGER,
        ${id_sucursal}::INTEGER,
        ${id_empleado}::INTEGER
      )
    `;

    return res.status(201).json({
      status: 'success',
      message: 'Factura creada exitosamente',
      data: resultado[0]
    });
  } catch (err) {
    next(err);
  }
};
```

**Especificación de `sp_factura_crear()`:**
```sql
-- ENTRADA:
-- p_id_cliente INTEGER
-- p_id_carrito UUID
-- p_id_metodo_pago INTEGER
-- p_id_sucursal INTEGER
-- p_id_empleado INTEGER

-- SALIDA:
-- id_factura VARCHAR(20)
-- numero_factura VARCHAR(20)
-- fecha_emision TIMESTAMP
-- total DECIMAL(14, 3)
-- estado VARCHAR(3)
-- mensaje TEXT

-- FUNCIONALIDAD:
-- 1. Validar cliente, carrito, método de pago, sucursal
-- 2. Validar carrito activo y con items
-- 3. Calcular subtotal, IVA, total
-- 4. Generar número de factura
-- 5. Crear transacción:
--    a. Crear factura
--    b. Copiar detalles del carrito a detalle_factura
--    c. Actualizar saldo_actual de productos (disminuir)
--    d. Marcar carrito como 'COM'
--    e. Registrar en auditoría
-- 6. Retornar factura creada o error
```

---

## 🎯 MÓDULO 2: BODEGA (RECEPCIONES)

### Requisito
Desde el controlador **SOLO se debe llamar**:
- `sp_recepcion_registrar()` - Registrar recepción de mercadería

**NO implementar lógica de validación compleja en Node.js**

### Cambios Requeridos

#### 2.1 Bodega Controller (`bodega.controller.js`)
**Métodos a simplificar:**
- ✅ `listarRecepciones()` - Mantener con Prisma
- ✅ `obtenerRecepcion()` - Mantener con Prisma
- ✅ `buscarRecepciones()` - Mantener con Prisma
- ❌ `registrarRecepcion()` - **REEMPLAZAR por llamada a sp_recepcion_registrar()**

**Lógica que irá a BD:**
- Validación de orden de compra
- Validación de productos en la orden
- Validación de cantidades (no exceder lo pendiente)
- Incremento de ingresos del producto
- Actualización de cantidad_recibida
- Actualización de estado de compra
- Creación de detalles de recepción
- Auditoría

**Ejemplo de nueva implementación:**
```javascript
export const registrarRecepcion = async (req, res, next) => {
  try {
    const { compraId, detalles } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // Validación mínima
    if (!compraId || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'compraId y detalles son requeridos',
        data: null
      });
    }

    // LLAMAR a sp_recepcion_registrar
    // Convertir detalles a formato que espera la BD (JSON o múltiples llamadas)
    const detallesJson = JSON.stringify(detalles);

    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_recepcion_registrar(
        ${compraId}::INTEGER,
        ${detallesJson}::JSONB,
        ${id_empleado}::INTEGER
      )
    `;

    return res.status(201).json({
      status: 'success',
      message: 'Recepción registrada exitosamente',
      data: resultado[0]
    });
  } catch (err) {
    next(err);
  }
};
```

**Especificación de `sp_recepcion_registrar()`:**
```sql
-- ENTRADA:
-- p_id_compra INTEGER
-- p_detalles JSONB -- [{productoId, cantidad}, ...]
-- p_id_empleado INTEGER

-- SALIDA:
-- id_recepcion INTEGER
-- num_productos INTEGER
-- fecha_recepcion TIMESTAMP
-- estado VARCHAR(3)
-- id_compra_estado VARCHAR(3)  -- nuevo estado de la compra
-- mensaje TEXT

-- FUNCIONALIDAD:
-- 1. Validar orden de compra existe
-- 2. Validar orden NO está anulada
-- 3. Para cada detalle:
--    a. Validar producto existe en orden
--    b. Validar cantidad no excede pendiente
--    c. Insertar en detalle_recepcion
--    d. Actualizar cantidad_recibida
--    e. Incrementar ingresos del producto
-- 4. Actualizar estado de compra (PEN, PAR, COM)
-- 5. Registrar en auditoría
-- 6. Retornar id_recepcion o error
```

---

## 🎯 MÓDULO 3: COMPRAS

### Requisito
**Usar Prisma directamente, sin stored procedures**

### Estado Actual
✅ El controlador `compra.controller.js` **YA ESTÁ IMPLEMENTADO CORRECTAMENTE** con Prisma.

**Funciones que usan Prisma:**
- `listarCompras()` - ✅ Correcto
- `obtenerCompra()` - ✅ Correcto
- `buscarCompras()` - ✅ Correcto
- `crearCompra()` - ✅ Correcto (crea con transacción)
- `actualizarCompra()` - ✅ Correcto
- `cancelarCompra()` - ✅ Correcto

**Acciones Necesarias:**
- ✅ **NO HACER CAMBIOS** - El módulo está bien

---

## 🎯 MÓDULO 4: AJUSTE DE INVENTARIO

### Estado Actual
El controlador usa Prisma con transacción.

### Decisión Pendiente
**¿Aplicar el mismo patrón que Bodega (Stored Procedures) o mantener con Prisma?**

**Opciones:**
1. **Opción A**: Crear `sp_ajuste_inventario_crear()` (similar a bodega)
   - Ventaja: Consistencia con bodega
   - Desventaja: Más trabajo de BD

2. **Opción B**: Mantener con Prisma
   - Ventaja: Ya está implementado
   - Desventaja: Inconsistencia

**Recomendación**: Esperar indicación de tu compañero

---

## 📦 Especificación de Stored Procedures a Implementar

### FN 1: `fn_ingresar_factura()`
```sql
-- ENTRADA:
-- p_id_cliente INTEGER
-- p_id_carrito UUID
-- p_id_metodo_pago INTEGER
-- p_id_sucursal INTEGER
-- p_canal_venta CHAR(3) -- 'POS' o 'WEB'
-- p_id_empleado INTEGER [OPCIONAL]

-- SALIDA:
-- id_factura VARCHAR(20)
-- numero_factura VARCHAR(20)
-- fecha_emision TIMESTAMP
-- subtotal DECIMAL(14, 3)
-- total_iva DECIMAL(14, 3)
-- total DECIMAL(14, 3)
-- estado VARCHAR(3)
-- mensaje TEXT

-- Nota: Implementada por James
-- Ya existe en BD como: fn_ingresar_factura()
```

### SP 2: `sp_factura_crear()`
```sql
CREATE OR REPLACE FUNCTION sp_factura_crear(
  p_id_cliente INTEGER,
  p_id_carrito UUID,
  p_id_metodo_pago INTEGER,
  p_id_sucursal INTEGER,
  p_id_empleado INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_factura VARCHAR(20),
  numero_factura VARCHAR(20),
  fecha_emision TIMESTAMP,
  subtotal DECIMAL(14, 3),
  total_iva DECIMAL(14, 3),
  total DECIMAL(14, 3),
  estado CHAR(3),
  mensaje TEXT
) AS $$
BEGIN
  -- TODO: Implementar por James
END;
$$ LANGUAGE plpgsql;
```

### SP 3: `sp_recepcion_registrar()`
```sql
CREATE OR REPLACE FUNCTION sp_recepcion_registrar(
  p_id_compra INTEGER,
  p_detalles JSONB,
  p_id_empleado INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_recepcion INTEGER,
  num_productos INTEGER,
  fecha_recepcion TIMESTAMP,
  estado CHAR(3),
  id_compra_estado CHAR(3),
  mensaje TEXT
) AS $$
BEGIN
  -- TODO: Implementar por James
END;
$$ LANGUAGE plpgsql;
```

---

## 🔧 Cómo Invocar Stored Procedures desde Prisma

### Método 1: Raw Query (Recomendado)
```javascript
const resultado = await prisma.$queryRaw`
  SELECT * FROM sp_cliente_crear(
    ${'1234567890'}::VARCHAR(13),
    ${'Juan'}::VARCHAR(50),
    ${'Pérez'}::VARCHAR(50),
    ${'juan@mail.com'}::VARCHAR(100),
    ${null}::VARCHAR(20),
    ${'001'}::CHAR(3)
  )
`;
```

### Método 2: Parametrizado
```javascript
const resultado = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM sp_cliente_crear(${ruc}, ${nombre}, ...)`
);
```

### Método 3: Para Transacciones
```javascript
const resultado = await prisma.$transaction(async (tx) => {
  const data = await tx.$queryRaw`
    SELECT * FROM sp_cliente_crear(...)
  `;
  return data;
});
```

---

## 📝 Resumen de Cambios por Archivo

| Archivo | Cambios |
|---------|---------|
| `cliente.controller.js` | Simplificar `crearCliente()` → Llamar `sp_cliente_crear()` |
| `factura.controller.js` | Simplificar `crearFactura()` → Llamar `sp_factura_crear()` |
| `bodega.controller.js` | Simplificar `registrarRecepcion()` → Llamar `sp_recepcion_registrar()` |
| `compra.controller.js` | ✅ Sin cambios (ya usa Prisma) |
| `ajusteInventario.controller.js` | Pendiente decisión |

---

## ⏱️ Timeline Estimado

1. **James**: Crear los 3 stored procedures (1-2 semanas)
2. **Backend**: Refactorizar controladores (2-3 días)
3. **Testing**: Pruebas integración (2-3 días)
4. **Deploy**: Actualización en producción

---

## 🚀 Siguientes Pasos

1. ✅ Revisar este documento con James y tu compañero
2. ⏳ James define las funciones de BD
3. ⏳ Backend implementa cambios en controladores
4. ⏳ Testing integral
5. ⏳ Deploy

