# 🚀 Guía de Implementación - Arquitectura con Stored Procedures

**Versión**: 1.0  
**Fecha**: 20 de Enero de 2026  
**Responsables**: Backend Team + James (BD)

---

## 📋 Checklist de Implementación

### FASE 1: PREPARACIÓN (Hoy - Mañana)

- [ ] **Backend**: Revisar documentación
  - [ ] Leer `REFACTORING_PLAN.md`
  - [ ] Revisar `EJEMPLOS_REFACTORING.js`
  - [ ] Entender llamadas a `$queryRaw`

- [ ] **James**: Revisar especificación
  - [ ] Leer `ESPECIFICACION_SQL_STORED_PROCEDURES.sql`
  - [ ] Clonar/descargar estructura base
  - [ ] Preparar ambiente de testing en BD

- [ ] **Backend + James**: Kick-off meeting
  - [ ] Confirmar especificación de SPs
  - [ ] Definir formato de retorno JSON
  - [ ] Establecer naming conventions
  - [ ] Acordar manejo de errores

---

### FASE 2: DESARROLLO DE STORED PROCEDURES (James - Estimado: 1-2 semanas)

#### SP 1: `sp_cliente_crear()`
- [ ] Crear estructura base de función
- [ ] Implementar validaciones
- [ ] Pruebas unitarias
- [ ] Documentar en comentarios SQL

**Checklist interno James:**
- [ ] ¿Valida cédula/RUC duplicado?
- [ ] ¿Valida que ciudad existe si se proporciona?
- [ ] ¿Retorna error si datos obligatorios faltan?
- [ ] ¿Registra en auditoría?
- [ ] ¿Campos retornados coinciden con spec?

#### SP 2: `sp_factura_crear()`
- [ ] Crear estructura base de función
- [ ] Implementar validaciones
- [ ] Implementar cálculos (subtotal, IVA, total)
- [ ] Implementar movimientos de inventario
- [ ] Implementar generación de número de factura
- [ ] Transacción completa
- [ ] Pruebas unitarias
- [ ] Documentar en comentarios SQL

**Checklist interno James:**
- [ ] ¿Valida cliente existe y está activo?
- [ ] ¿Valida carrito existe, está activo y pertenece al cliente?
- [ ] ¿Valida carrito NO está vacío?
- [ ] ¿Valida método de pago?
- [ ] ¿Valida sucursal?
- [ ] ¿Valida stock suficiente para todos los productos?
- [ ] ¿Calcula totales correctamente?
- [ ] ¿Genera número de factura único?
- [ ] ¿Copia detalles del carrito?
- [ ] ¿Actualiza saldo_actual de productos?
- [ ] ¿Marca carrito como completado?
- [ ] ¿Registra auditoría?
- [ ] ¿Campos retornados coinciden con spec?

#### SP 3: `sp_recepcion_registrar()`
- [ ] Crear estructura base de función
- [ ] Implementar validaciones
- [ ] Implementar procesamiento de detalles JSON
- [ ] Transacción completa
- [ ] Pruebas unitarias
- [ ] Documentar en comentarios SQL

**Checklist interno James:**
- [ ] ¿Valida orden de compra existe?
- [ ] ¿Valida orden NO está anulada?
- [ ] ¿Valida cada producto existe en la orden?
- [ ] ¿Valida cantidad no excede pendiente?
- [ ] ¿Inserta detalles_recepcion correctamente?
- [ ] ¿Actualiza cantidad_recibida?
- [ ] ¿Incrementa ingresos del producto?
- [ ] ¿Actualiza estado de compra (PEN/PAR/COM)?
- [ ] ¿Registra auditoría?
- [ ] ¿Maneja JSON correctamente?
- [ ] ¿Campos retornados coinciden con spec?

---

### FASE 3: REFACTORING DE CONTROLADORES (Backend - Estimado: 2-3 días)

#### Cliente Controller
**Archivo**: `src/controllers/cliente.controller.js`

- [ ] `crearCliente()` - Reemplazar
  - [ ] Mantener validación mínima en Node
  - [ ] Llamar `sp_cliente_crear()` con `$queryRaw`
  - [ ] Manejo de errores mejorado
  - [ ] Pruebas locales

- [ ] Otros métodos - Mantener sin cambios
  - [ ] `listarClientes()`
  - [ ] `buscarClientes()`
  - [ ] `actualizarCliente()`
  - [ ] `eliminarCliente()`

**Template disponible en**: `EJEMPLOS_REFACTORING.js` → `crearClienteRefactorizado()`

---

#### Factura Controller
**Archivo**: `src/controllers/factura.controller.js`

- [ ] `crearFactura()` - Reemplazar completamente
  - [ ] **ELIMINAR toda lógica de validación compleja**
  - [ ] **ELIMINAR cálculos de totales**
  - [ ] **ELIMINAR movimientos de inventario**
  - [ ] **ELIMINAR transacción**
  - [ ] Mantener solo validación mínima (tipos, no nulos)
  - [ ] Llamar `sp_factura_crear()` con `$queryRaw`
  - [ ] Manejo de errores mejorado
  - [ ] Pruebas locales

- [ ] Otros métodos - Mantener sin cambios
  - [ ] `listarFacturas()`
  - [ ] `buscarFacturas()`
  - [ ] `actualizarFactura()`
  - [ ] `cancelarFactura()`

**Template disponible en**: `EJEMPLOS_REFACTORING.js` → `crearFacturaRefactorizado()`

**IMPORTANTE - Líneas a ELIMINAR:**
```javascript
// ELIMINAR ESTO:
- Todas las validaciones de cliente, carrito, método de pago, sucursal
- Cálculos de IVA, subtotales, totales
- Transacción $transaction
- Updates a productos (saldo_actual)
- Updates a carrito (estado = 'COM')
- Creación de detalle_factura
- Validaciones de stock
- Generación de número de factura
```

---

#### Bodega Controller
**Archivo**: `src/controllers/bodega.controller.js`

- [ ] `registrarRecepcion()` - Reemplazar
  - [ ] **ELIMINAR validaciones complejas**
  - [ ] **ELIMINAR transacción**
  - [ ] **ELIMINAR creación de detalle_recepcion**
  - [ ] **ELIMINAR updates a cantidad_recibida**
  - [ ] **ELIMINAR updates a ingresos**
  - [ ] **ELIMINAR actualización de estado de compra**
  - [ ] Mantener solo validación mínima
  - [ ] Llamar `sp_recepcion_registrar()` con `$queryRaw`
  - [ ] Manejo de errores mejorado
  - [ ] Pruebas locales

- [ ] Otros métodos - Mantener sin cambios
  - [ ] `listarRecepciones()`
  - [ ] `obtenerRecepcion()`
  - [ ] `buscarRecepciones()`

**Template disponible en**: `EJEMPLOS_REFACTORING.js` → `registrarRecepcionRefactorizado()`

---

#### Compra Controller
**Archivo**: `src/controllers/compra.controller.js`

- [ ] **NO HACER CAMBIOS** ✅
  - Módulo ya usa Prisma correctamente
  - Mantener exactamente igual

---

#### Ajuste Inventario Controller
**Archivo**: `src/controllers/ajusteInventario.controller.js`

- [ ] **Pendiente decisión** ⏳
  - [ ] Si usar Stored Procedures: crear `sp_ajuste_inventario_crear()`
  - [ ] Si mantener Prisma: revisar si es consistente

---

### FASE 4: TESTING (Backend - Estimado: 2-3 días)

#### Testing Unitario
- [ ] Cliente:
  - [ ] Crear cliente válido
  - [ ] Crear cliente con cédula duplicada
  - [ ] Crear cliente sin datos requeridos
  - [ ] Crear cliente con ciudad no existente

- [ ] Factura:
  - [ ] Crear factura válida
  - [ ] Crear factura con cliente no existe
  - [ ] Crear factura con carrito vacío
  - [ ] Crear factura con stock insuficiente
  - [ ] Crear factura con método de pago no existe
  - [ ] Validar número de factura único
  - [ ] Validar cálculos de totales

- [ ] Recepción:
  - [ ] Registrar recepción válida
  - [ ] Registrar con orden no existe
  - [ ] Registrar con producto no en orden
  - [ ] Registrar con cantidad que excede pendiente
  - [ ] Validar estado de compra se actualiza (PEN/PAR/COM)
  - [ ] Validar ingresos se incrementan

#### Testing Integración
- [ ] Flujo completo POS: Cliente → Factura
- [ ] Flujo completo Bodega: Compra → Recepción
- [ ] Validar auditoría registra operaciones
- [ ] Validar inventario se actualiza correctamente

#### Testing Performance
- [ ] Tiempo de respuesta SPs (< 500ms ideal)
- [ ] Carga con múltiples recepciones simultáneas
- [ ] Carga con múltiples facturas simultáneas

---

### FASE 5: DOCUMENTACIÓN (Backend - 1 día)

- [ ] Actualizar README.md
  - [ ] Explicar nueva arquitectura
  - [ ] Listar SPs disponibles
  - [ ] Mostrar ejemplos de uso

- [ ] Documentar en Swagger/OpenAPI
  - [ ] Actualizar spec de POST /clientes
  - [ ] Actualizar spec de POST /facturas
  - [ ] Actualizar spec de POST /bodega/recepciones

- [ ] Crear guía de troubleshooting
  - [ ] Errores comunes
  - [ ] Cómo debuggear
  - [ ] Logs importantes

---

### FASE 6: DEPLOY (Coordinado - 1 día)

- [ ] Backup de BD en producción
- [ ] Crear SPs en BD staging
- [ ] Hacer testing en staging
- [ ] Deploy SPs a producción
- [ ] Deploy código Node a producción
- [ ] Monitoreo post-deploy
- [ ] Documentar cambios en release notes

---

## 🔍 Puntos Críticos a Validar

### Antes de pasar a Backend
**James debe confirmar:**
1. ✅ SPs creados en BD de desarrollo
2. ✅ SPs probados con datos de ejemplo
3. ✅ Retorno JSON coincide con especificación
4. ✅ Manejo de errores implementado
5. ✅ Auditoría registra operaciones
6. ✅ SPs ejecutan en < 500ms

### Antes de pasar a Testing
**Backend debe confirmar:**
1. ✅ Todos los métodos de refactoring reemplazan lógica anterior
2. ✅ Validación mínima implementada
3. ✅ Manejo de errores robusto
4. ✅ `$queryRaw` ejecuta correctamente
5. ✅ No hay duplicación de lógica
6. ✅ Métodos de consulta funcionan igual

### Antes de Deploy
**Todo el equipo debe confirmar:**
1. ✅ Pruebas unitarias pasan
2. ✅ Pruebas integración pasan
3. ✅ Sin errores en linters
4. ✅ Documentación actualizada
5. ✅ Backup de BD realizado
6. ✅ Plan de rollback listo

---

## 📞 Comunicación

### Daily Sync (Recomendado)
- **Hora**: 10:00 AM
- **Duración**: 15 min
- **Asistentes**: Backend + James
- **Agenda**: Blockers, progreso, próximos pasos

### Escalation Points
- SP tarda > 1 segundo
- Retorno de SP no coincide con spec
- Error de auditoría
- Problema de transaccionalidad

---

## 📝 Template de Pull Request

**Cuando Backend haga cambios:**

```markdown
## Descripción
Refactorización de controladores para usar Stored Procedures

## Cambios
- ✅ Refactorizado: `crearCliente()`
- ✅ Refactorizado: `crearFactura()`
- ✅ Refactorizado: `registrarRecepcion()`

## Validaciones
- [ ] Todas las pruebas pasan
- [ ] Sin errores de lint
- [ ] Documentación actualizada
- [ ] SPs están en producción

## Screenshots / Resultados
[Adjuntar pruebas exitosas]

## Testing
- [ ] Probado localmente
- [ ] Probado en staging
```

---

## 🆘 Troubleshooting Común

### "Error: La función sp_cliente_crear no existe"
**Solución**: Asegurar que James ejecutó el CREATE FUNCTION en la BD

### "error: function sp_factura_crear(...) does not exist"
**Solución**: Verificar tipos de parámetros en `::CAST` coinciden con SP

### "error: type \"int\" does not exist"
**Solución**: Usar `INTEGER` no `INT` en Prisma $queryRaw

### "Transaction failed, rolling back"
**Solución**: Revisar si hay constraint violations en los datos

---

## 📚 Recursos

- **REFACTORING_PLAN.md**: Visión general del proyecto
- **ESPECIFICACION_SQL_STORED_PROCEDURES.sql**: Spec completa para James
- **EJEMPLOS_REFACTORING.js**: Código listo para copiar/pegar
- **Este archivo**: Checklist de implementación

---

## ✅ Definición de Hecho

El proyecto se considera **COMPLETADO** cuando:

1. ✅ Los 3 SPs están en producción y funcionan
2. ✅ Los 3 controladores están refactorizados
3. ✅ Todas las pruebas pasan (unitarias + integración)
4. ✅ Documentación está actualizada
5. ✅ No hay tickets abiertos por errores
6. ✅ Performance de SPs es aceptable (< 500ms)

---

**Creado por**: Copilot  
**Fecha**: 20 de Enero de 2026  
**Status**: Listo para implementación ✅

