/**
 * EJEMPLOS DE CÓDIGO REFACTORIZADO
 * Utilizando Stored Procedures desde Prisma
 * 
 * Nota: Estos ejemplos están listos para implementar
 * una vez que James haya creado los stored procedures
 */

// ============================================================================
// MÓDULO 1: CLIENTE CONTROLLER - crearCliente() REFACTORIZADO
// ============================================================================

/**
 * Crear cliente (POS)
 * POST /api/v1/clientes
 * 
 * ANTES: Lógica compleja en Node.js
 * DESPUÉS: Solo llamar sp_cliente_crear()
 */
export const crearClienteRefactorizado = async (req, res, next) => {
  try {
    const { ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad } = req.body;

    // === VALIDACIÓN MÍNIMA EN NODE ===
    if (!ruc_cedula || !nombre1 || !apellido1) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos requeridos: ruc_cedula, nombre1, apellido1',
        data: null
      });
    }

    // Validar formato básico de cédula/RUC (opcional)
    if (!/^\d{10,13}$/.test(ruc_cedula)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato inválido de cédula/RUC (10-13 dígitos)',
        data: null
      });
    }

    // === LLAMAR A STORED PROCEDURE ===
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_cliente_crear(
        ${ruc_cedula}::VARCHAR(13),
        ${nombre1}::VARCHAR(50),
        ${apellido1}::VARCHAR(50),
        ${email || null}::VARCHAR(100),
        ${telefono || null}::VARCHAR(20),
        ${id_ciudad || null}::CHAR(3)
      )
    `;

    // Validar que se retornó resultado
    if (!resultado || resultado.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Error al crear cliente',
        data: null
      });
    }

    const cliente = resultado[0];

    // Validar si hubo error desde BD
    if (cliente.mensaje && cliente.mensaje.includes('Error')) {
      return res.status(400).json({
        status: 'error',
        message: cliente.mensaje,
        data: null
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Cliente creado exitosamente',
      data: cliente
    });

  } catch (err) {
    // Manejo de errores específicos
    if (err.code === '23505') { // Duplicate key
      return res.status(409).json({
        status: 'error',
        message: 'El cliente ya existe',
        data: null
      });
    }
    next(err);
  }
};

// ============================================================================
// MÓDULO 2: FACTURA CONTROLLER - crearFactura() REFACTORIZADO
// ============================================================================

/**
 * Crear factura desde carrito (Checkout)
 * POST /api/v1/facturas
 * 
 * ANTES: Validaciones complejas + cálculos + actualizaciones en Node.js
 * DESPUÉS: Solo llamar sp_factura_crear()
 */
export const crearFacturaRefactorizado = async (req, res, next) => {
  try {
    const { id_cliente, id_carrito, id_metodo_pago, id_sucursal } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // === VALIDACIÓN MÍNIMA EN NODE ===
    if (!id_cliente || !id_carrito || !id_metodo_pago || !id_sucursal) {
      return res.status(400).json({
        status: 'error',
        message: 'Parámetros requeridos: id_cliente, id_carrito, id_metodo_pago, id_sucursal',
        data: null
      });
    }

    // Convertir a números y validar
    const clienteId = Number(id_cliente);
    const metodoPagoId = Number(id_metodo_pago);
    const sucursalId = Number(id_sucursal);

    if (isNaN(clienteId) || isNaN(metodoPagoId) || isNaN(sucursalId)) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs deben ser números válidos',
        data: null
      });
    }

    // === LLAMAR A STORED PROCEDURE ===
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_factura_crear(
        ${clienteId}::INTEGER,
        ${id_carrito}::UUID,
        ${metodoPagoId}::INTEGER,
        ${sucursalId}::INTEGER,
        ${id_empleado}::INTEGER
      )
    `;

    if (!resultado || resultado.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Error al crear factura',
        data: null
      });
    }

    const factura = resultado[0];

    // Validar si hubo error desde BD
    if (factura.mensaje && factura.mensaje.includes('Error')) {
      return res.status(400).json({
        status: 'error',
        message: factura.mensaje,
        data: null
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Factura creada exitosamente',
      data: factura
    });

  } catch (err) {
    next(err);
  }
};

// ============================================================================
// MÓDULO 3: BODEGA CONTROLLER - registrarRecepcion() REFACTORIZADO
// ============================================================================

/**
 * Registrar recepción de bodega
 * POST /api/v1/bodega/recepciones
 * 
 * ANTES: Validaciones + transacción + múltiples updates en Node.js
 * DESPUÉS: Solo llamar sp_recepcion_registrar()
 */
export const registrarRecepcionRefactorizado = async (req, res, next) => {
  try {
    const { compraId, detalles } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // === VALIDACIÓN MÍNIMA EN NODE ===
    if (!compraId || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'compraId (número) y detalles (array) son requeridos',
        data: null
      });
    }

    // Validar estructura de detalles
    for (const item of detalles) {
      if (!item.productoId || !item.cantidad) {
        return res.status(400).json({
          status: 'error',
          message: 'Cada detalle debe tener: productoId, cantidad',
          data: null
        });
      }

      if (isNaN(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad debe ser un número positivo',
          data: null
        });
      }
    }

    // === CONVERTIR DETALLES A JSON PARA BD ===
    const detallesJson = JSON.stringify(detalles);

    // === LLAMAR A STORED PROCEDURE ===
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_recepcion_registrar(
        ${Number(compraId)}::INTEGER,
        ${detallesJson}::JSONB,
        ${id_empleado}::INTEGER
      )
    `;

    if (!resultado || resultado.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Error al registrar recepción',
        data: null
      });
    }

    const recepcion = resultado[0];

    // Validar si hubo error desde BD
    if (recepcion.mensaje && recepcion.mensaje.includes('Error')) {
      return res.status(400).json({
        status: 'error',
        message: recepcion.mensaje,
        data: null
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Recepción registrada exitosamente',
      data: recepcion
    });

  } catch (err) {
    next(err);
  }
};

// ============================================================================
// UTIL: MANEJO AVANZADO DE STORED PROCEDURES
// ============================================================================

/**
 * Invocar un stored procedure genérico con transacción
 * Útil para operaciones que requieren transaccionalidad
 */
export const invocarStoredProcedureConTransaccion = async (
  nombreSP,
  parametros,
  prismaClient
) => {
  try {
    const resultado = await prismaClient.$transaction(async (tx) => {
      // Construir query dinámica
      const query = `SELECT * FROM ${nombreSP}(${parametros.join(',')})`;
      
      const data = await tx.$queryRawUnsafe(query);
      return data;
    });

    return resultado;
  } catch (err) {
    throw new Error(`Error en ${nombreSP}: ${err.message}`);
  }
};

/**
 * Manejo de errores de Stored Procedures
 */
export const manejarErrorSP = (error) => {
  // Errores comunes de PostgreSQL
  const errorMap = {
    '23505': 'Registro duplicado',
    '23503': 'Referencia no encontrada',
    '23502': 'Campo requerido faltante',
    'P0001': 'Error lógico en SP',
  };

  const codigo = error.code || error.message.substring(0, 5);
  return errorMap[codigo] || 'Error en base de datos';
};

// ============================================================================
// EJEMPLO: INTEGRACIÓN COMPLETA EN CONTROLADOR
// ============================================================================

/**
 * Ejemplo completo con manejo robusto de errores
 */
export const crearClienteCompleto = async (req, res, next) => {
  try {
    const { ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad } = req.body;

    // Validación
    if (!ruc_cedula || !nombre1 || !apellido1) {
      return res.status(400).json({
        status: 'error',
        message: 'Parámetros requeridos',
        data: null
      });
    }

    // Ejecutar SP
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_cliente_crear(
        ${ruc_cedula}::VARCHAR(13),
        ${nombre1}::VARCHAR(50),
        ${apellido1}::VARCHAR(50),
        ${email || null}::VARCHAR(100),
        ${telefono || null}::VARCHAR(20),
        ${id_ciudad || null}::CHAR(3)
      )
    `;

    const cliente = resultado?.[0];

    if (!cliente) {
      return res.status(400).json({
        status: 'error',
        message: 'No se pudo crear el cliente',
        data: null
      });
    }

    // Verificar respuesta de SP
    if (cliente.error || cliente.mensaje?.includes('Error')) {
      return res.status(400).json({
        status: 'error',
        message: cliente.mensaje || 'Error desconocido',
        data: null
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Cliente creado',
      data: cliente
    });

  } catch (err) {
    // Capturar errores de BD específicos
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'error',
        message: 'El cliente ya existe',
        data: null
      });
    }

    if (err.code === '23503') {
      return res.status(400).json({
        status: 'error',
        message: 'Ciudad o referencia no válida',
        data: null
      });
    }

    // Error genérico
    next(err);
  }
};

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/**
 * PARA IMPLEMENTACIÓN:
 * 
 * 1. REEMPLAZAR el método actual con la versión "Refactorizado"
 * 2. ESPERAR a que James implemente los Stored Procedures
 * 3. VALIDAR tipos de datos en los ::CAST (INTEGER, VARCHAR, CHAR, UUID, etc.)
 * 4. RETORNO del SP debe ser una tabla (RETURNS TABLE)
 * 5. Usar prisma.$queryRaw para ejecutar
 * 6. SIEMPRE validar resultado[0] antes de usar
 * 7. MANEJO de errores: BD retorna mensaje de error en campo 'mensaje'
 * 
 * CAST TYPES:
 * - INTEGER, BIGINT
 * - VARCHAR(n), TEXT, CHAR(n)
 * - UUID
 * - TIMESTAMP, DATE, TIME
 * - DECIMAL(p,s), FLOAT
 * - BOOLEAN
 * - JSONB
 */

