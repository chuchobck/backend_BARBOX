# 📚 ÍNDICE Y REFERENCIAS - Refactoring POS/Bodega

**Creado**: 20 de Enero de 2026  
**Versión**: 1.0

---

## 🗂️ DOCUMENTOS GENERADOS

### Para Entender el Plan
| Documento | Contenido | Audiencia |
|-----------|----------|-----------|
| **RESUMEN_EJECUTIVO.md** | Visión general, timeline, tareas | Todos |
| **REFACTORING_PLAN.md** | Detalle técnico de cambios | Backend |
| **GUIA_IMPLEMENTACION.md** | Checklist paso a paso | Backend + James |

### Para Implementar
| Documento | Contenido | Audiencia |
|-----------|----------|-----------|
| **ESPECIFICACION_SQL_STORED_PROCEDURES.sql** | Código SQL para James | James |
| **EJEMPLOS_REFACTORING.js** | Templates de código | Backend |
| **QUICK_START_EXAMPLES.js** | Ejemplos y patrones | Backend |

### Este Documento
| Documento | Contenido |
|-----------|----------|
| **INDICE_Y_REFERENCIAS.md** (actual) | Mapeo de información |

---

## 🔍 CÓMO ENCONTRAR INFORMACIÓN

### "Necesito entender qué hacer"
→ Leer en este orden:
1. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) (5 min)
2. [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Sección relevante (10 min)

### "Soy Backend, ¿por dónde empiezo?"
→ Ir a:
1. [GUIA_IMPLEMENTACION.md](GUIA_IMPLEMENTACION.md) - FASE 3: REFACTORING
2. [EJEMPLOS_REFACTORING.js](EJEMPLOS_REFACTORING.js) - Copiar template
3. [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) - Patrones de código

### "Soy James, ¿qué tengo que crear?"
→ Ir a:
1. [ESPECIFICACION_SQL_STORED_PROCEDURES.sql](ESPECIFICACION_SQL_STORED_PROCEDURES.sql)
2. [GUIA_IMPLEMENTACION.md](GUIA_IMPLEMENTACION.md) - FASE 2: DESARROLLO

### "¿Cómo invoco un SP desde Node.js?"
→ Ver:
- [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) - Sección 3-5
- [EJEMPLOS_REFACTORING.js](EJEMPLOS_REFACTORING.js) - Sección "UTIL"

### "¿Cuál es el timeline?"
→ Ver:
- [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) - Sección "Timeline"
- [GUIA_IMPLEMENTACION.md](GUIA_IMPLEMENTACION.md) - Checklist con fases

### "¿Qué cambios debo hacer en [archivo]?"
→ Ver tabla en [REFACTORING_PLAN.md](REFACTORING_PLAN.md#-resumen-de-cambios-por-archivo)

---

## 📋 MATRIZ DE CAMBIOS

### Cliente Controller
```
Archivo: src/controllers/cliente.controller.js

MÉTODO              ACCIÓN          DETALLES
────────────────────────────────────────────────────────────────
crearCliente()      REEMPLAZAR      → Llamar sp_cliente_crear()
listarClientes()    MANTENER        Sin cambios
buscarClientes()    MANTENER        Sin cambios
actualizarCliente() MANTENER        Sin cambios
eliminarCliente()   MANTENER        Sin cambios

Referencia: EJEMPLOS_REFACTORING.js → crearClienteRefactorizado()
```

### Factura Controller
```
Archivo: src/controllers/factura.controller.js

MÉTODO              ACCIÓN          DETALLES
────────────────────────────────────────────────────────────────
crearFactura()      REEMPLAZAR      → Llamar sp_factura_crear()
                                       ELIMINAR TODA la lógica actual
listarFacturas()    MANTENER        Sin cambios
buscarFacturas()    MANTENER        Sin cambios
actualizarFactura() MANTENER        Sin cambios
cancelarFactura()   MANTENER        Sin cambios

Referencia: EJEMPLOS_REFACTORING.js → crearFacturaRefactorizado()
```

### Bodega Controller
```
Archivo: src/controllers/bodega.controller.js

MÉTODO                ACCIÓN          DETALLES
──────────────────────────────────────────────────────────────
registrarRecepcion()  REEMPLAZAR      → Llamar sp_recepcion_registrar()
                                         ELIMINAR transacción actual
listarRecepciones()   MANTENER        Sin cambios
obtenerRecepcion()    MANTENER        Sin cambios
buscarRecepciones()   MANTENER        Sin cambios

Referencia: EJEMPLOS_REFACTORING.js → registrarRecepcionRefactorizado()
```

### Compra Controller
```
Archivo: src/controllers/compra.controller.js

MÉTODO          ACCIÓN          DETALLES
────────────────────────────────────────────────────
crearCompra()   SIN CAMBIOS     ✅ Mantener igual
listarCompras() SIN CAMBIOS     ✅ Mantener igual
etc.            SIN CAMBIOS     ✅ Mantener igual

Referencia: Sin cambios - No leer documentación
```

---

## 🗄️ STORED PROCEDURES A CREAR

### SP 1: sp_cliente_crear()
```
ENTRADA:
  - p_ruc_cedula VARCHAR(13)
  - p_nombre1 VARCHAR(50)
  - p_apellido1 VARCHAR(50)
  - p_email VARCHAR(100) [OPCIONAL]
  - p_telefono VARCHAR(20) [OPCIONAL]
  - p_id_ciudad CHAR(3) [OPCIONAL]

SALIDA:
  - id_cliente INTEGER
  - ruc_cedula VARCHAR(13)
  - nombre1 VARCHAR(50)
  - apellido1 VARCHAR(50)
  - email VARCHAR(100)
  - telefono VARCHAR(20)
  - id_ciudad CHAR(3)
  - estado CHAR(3)
  - fecha_creacion TIMESTAMP
  - error BOOLEAN
  - mensaje TEXT

LÓGICA:
  ✓ Validar datos obligatorios
  ✓ Validar cédula/RUC no existe
  ✓ Validar ciudad existe (si se proporciona)
  ✓ Crear cliente
  ✓ Registrar auditoría
  ✓ Retornar cliente o error

Referencia: ESPECIFICACION_SQL_STORED_PROCEDURES.sql (L1-60)
Complejidad: ⭐ BAJA
```

### SP 2: sp_factura_crear()
```
ENTRADA:
  - p_id_cliente INTEGER
  - p_id_carrito UUID
  - p_id_metodo_pago INTEGER
  - p_id_sucursal INTEGER
  - p_id_empleado INTEGER [OPCIONAL]

SALIDA:
  - id_factura VARCHAR(20)
  - numero_factura VARCHAR(20)
  - fecha_emision TIMESTAMP
  - subtotal DECIMAL(14,3)
  - total_iva DECIMAL(14,3)
  - total DECIMAL(14,3)
  - estado CHAR(3)
  - num_detalles INTEGER
  - error BOOLEAN
  - mensaje TEXT

LÓGICA:
  ✓ Validar cliente existe y activo
  ✓ Validar carrito existe, activo, pertenece cliente
  ✓ Validar carrito no está vacío
  ✓ Validar método de pago existe y activo
  ✓ Validar sucursal existe y activa
  ✓ Validar stock suficiente para todos los productos
  ✓ Calcular totales (subtotal, IVA, total)
  ✓ Generar número de factura único
  ✓ Crear factura en transacción
  ✓ Copiar detalles del carrito a detalle_factura
  ✓ Actualizar saldo_actual de productos (disminuir)
  ✓ Marcar carrito como completado
  ✓ Registrar auditoría
  ✓ Retornar factura o error

Referencia: ESPECIFICACION_SQL_STORED_PROCEDURES.sql (L70-260)
Complejidad: ⭐⭐⭐ CRÍTICO - MÁS IMPORTANTE
```

### SP 3: sp_recepcion_registrar()
```
ENTRADA:
  - p_id_compra INTEGER
  - p_detalles JSONB -- [{productoId, cantidad}, ...]
  - p_id_empleado INTEGER [OPCIONAL]

SALIDA:
  - id_recepcion INTEGER
  - num_productos INTEGER
  - fecha_recepcion TIMESTAMP
  - estado CHAR(3)
  - id_compra_nuevo_estado CHAR(3)
  - error BOOLEAN
  - mensaje TEXT

LÓGICA:
  ✓ Validar orden de compra existe
  ✓ Validar orden NO está anulada
  ✓ Para cada detalle:
    ✓ Validar producto existe en orden
    ✓ Validar cantidad no excede pendiente
    ✓ Insertar en detalle_recepcion
    ✓ Actualizar cantidad_recibida
    ✓ Incrementar ingresos del producto
  ✓ Actualizar estado de compra (PEN/PAR/COM)
  ✓ Registrar auditoría
  ✓ Retornar recepción o error

Referencia: ESPECIFICACION_SQL_STORED_PROCEDURES.sql (L270-450)
Complejidad: ⭐⭐ MEDIANA
```

---

## 🎯 CHECKLIST RÁPIDO

### Para Backend - Día 1
```
☐ Leer RESUMEN_EJECUTIVO.md (5 min)
☐ Leer REFACTORING_PLAN.md - Módulos 1-3 (15 min)
☐ Revisar EJEMPLOS_REFACTORING.js (15 min)
☐ Revisar QUICK_START_EXAMPLES.js (15 min)
Tiempo total: ~50 minutos
```

### Para Backend - Antes de Implementar
```
☐ Esperar que James cree SPs
☐ Probar SPs en BD de desarrollo
☐ Preparar ambiente de testing
☐ Hacer backup del código actual
```

### Para Backend - Implementación
```
☐ Refactorizar cliente.controller.js
  ☐ Backup archivo original
  ☐ Reemplazar crearCliente()
  ☐ Probar con Postman
  ☐ Testing unitario
☐ Refactorizar factura.controller.js
  ☐ Backup archivo original
  ☐ Reemplazar crearFactura()
  ☐ ELIMINAR toda lógica anterior
  ☐ Probar con Postman
  ☐ Testing integración
☐ Refactorizar bodega.controller.js
  ☐ Backup archivo original
  ☐ Reemplazar registrarRecepcion()
  ☐ ELIMINAR transacción
  ☐ Probar con Postman
  ☐ Testing integración
```

### Para James - Día 1
```
☐ Leer RESUMEN_EJECUTIVO.md (5 min)
☐ Leer ESPECIFICACION_SQL_STORED_PROCEDURES.sql (30 min)
☐ Leer GUIA_IMPLEMENTACION.md - FASE 2 (10 min)
Tiempo total: ~45 minutos
```

### Para James - Desarrollo
```
☐ Crear sp_cliente_crear()
  ☐ Estructura base
  ☐ Validaciones
  ☐ Testing
  ☐ Compartir con Backend para probar
☐ Crear sp_factura_crear() [CRÍTICO]
  ☐ Estructura base
  ☐ Validaciones
  ☐ Cálculos
  ☐ Transacción
  ☐ Testing exhaustivo
  ☐ Compartir con Backend para probar
☐ Crear sp_recepcion_registrar()
  ☐ Estructura base
  ☐ Manejo de JSON
  ☐ Validaciones
  ☐ Testing
  ☐ Compartir con Backend para probar
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Error: "function sp_cliente_crear(...) does not exist"
**Causa**: SP no existe en BD  
**Solución**: 
- [ ] Verificar que James ejecutó CREATE FUNCTION
- [ ] Verificar nombre exacto de SP
- [ ] Verificar tipos de parámetros

### Error: "type 'int' does not exist"
**Causa**: Usando `int` en lugar de `INTEGER` en Prisma  
**Solución**: 
- [ ] Cambiar `int` → `INTEGER`
- [ ] Ver [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) sección "5. TIPS"

### Error: "JSONB value must be json or null"
**Causa**: Pasar array directamente en lugar de JSON string  
**Solución**: 
- [ ] Hacer `JSON.stringify(detalles)` antes de pasar
- [ ] Ver [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) sección "5. TIP 3"

### Error: "relation [...] does not exist"
**Causa**: Tabla no existe en BD  
**Solución**: 
- [ ] Verificar esquema Prisma
- [ ] Verificar migraciones ejecutadas
- [ ] Verificar nombre de tabla exacto

### Error: "no rows returned by statement"
**Causa**: `resultado[0]` es undefined  
**Solución**: 
- [ ] Validar respuesta antes de acceder
- [ ] Ver [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) sección "4. PATRONES"

---

## 📞 PREGUNTAS FRECUENTES

### ¿Puedo cambiar el formato de retorno del SP?
**R**: Sí, pero debe coincidir con lo que Backend espera. Coordinar con Backend antes.

### ¿Qué pasa si un parámetro es null?
**R**: Usar `${null}::TIPO` en Prisma. Ver [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) sección "5. TIP 1"

### ¿Cuál es la diferencia entre error y excepción?
**R**: 
- Error: Retornado por SP (error=true, mensaje=texto)
- Excepción: Error de BD no manejado (try/catch)

### ¿Debo usar transacciones en el SP?
**R**: Sí, siempre. El SP debe garantizar consistencia atómica.

### ¿Puedo llamar dos SPs en paralelo?
**R**: No sin cuidado. Usar Prisma.$transaction si necesitas que sean atómicas.

### ¿Cuándo Prisma usa caché?
**R**: Prisma Client NO cachea. Cada llamada va a BD.

---

## 🔗 REFERENCIAS CRUZADAS

### De REFACTORING_PLAN.md a documentos específicos
- Módulo 1 (Ventas) → [EJEMPLOS_REFACTORING.js](EJEMPLOS_REFACTORING.js) (crearClienteRefactorizado)
- Módulo 1 (Ventas) → [EJEMPLOS_REFACTORING.js](EJEMPLOS_REFACTORING.js) (crearFacturaRefactorizado)
- Módulo 2 (Bodega) → [EJEMPLOS_REFACTORING.js](EJEMPLOS_REFACTORING.js) (registrarRecepcionRefactorizado)

### De GUIA_IMPLEMENTACION.md a documentos específicos
- Checklist SP 1 → [ESPECIFICACION_SQL_STORED_PROCEDURES.sql](ESPECIFICACION_SQL_STORED_PROCEDURES.sql) (L1-60)
- Checklist SP 2 → [ESPECIFICACION_SQL_STORED_PROCEDURES.sql](ESPECIFICACION_SQL_STORED_PROCEDURES.sql) (L70-260)
- Checklist SP 3 → [ESPECIFICACION_SQL_STORED_PROCEDURES.sql](ESPECIFICACION_SQL_STORED_PROCEDURES.sql) (L270-450)
- Testing Unitario → [QUICK_START_EXAMPLES.js](QUICK_START_EXAMPLES.js) (Sección 7)

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Documentos creados | 6 |
| Líneas de documentación | ~3,500 |
| SPs a crear | 3 |
| Controladores a refactorizar | 3 |
| Métodos a reemplazar | 3 |
| Métodos a mantener | 15+ |
| Tiempo estimado | 2-3 semanas |
| Persona-días | ~10 |

---

## ✅ VALIDACIÓN FINAL

Antes de dar por completado el proyecto:

- [ ] ¿Todos los SPs están en producción?
- [ ] ¿Todos los controladores están refactorizados?
- [ ] ¿Pruebas unitarias pasan?
- [ ] ¿Pruebas integración pasan?
- [ ] ¿No hay duplicación de lógica?
- [ ] ¿Performance es aceptable (< 500ms)?
- [ ] ¿Documentación está actualizada?

---

## 📝 VERSIÓN Y CAMBIOS

**v1.0** - 20 Enero 2026
- Inicial: 6 documentos, plan completo

---

**Próxima actualización**: Después del kick-off meeting

