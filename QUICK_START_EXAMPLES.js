/**
 * QUICK START - Invocar Stored Procedures desde Prisma
 * 
 * Este archivo muestra ejemplos prácticos y listos para usar
 */

// ============================================================================
// 1. IMPORTAR PRISMA
// ============================================================================

import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

// ============================================================================
// 2. PLANTILLAS BÁSICAS
// ============================================================================

/**
 * Template 1: SP Simple (sin JSONB)
 * Ideal para: sp_cliente_crear()
 */
async function ejemploSPSimple() {
  try {
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_cliente_crear(
        ${'1234567890'}::VARCHAR(13),
        ${'Juan'}::VARCHAR(50),
        ${'Pérez'}::VARCHAR(50),
        ${'juan@example.com'}::VARCHAR(100),
        ${null}::VARCHAR(20),
        ${'001'}::CHAR(3)
      )
    `;

    console.log(resultado[0]);
    // Resultado:
    // {
    //   id_cliente: 1,
    //   ruc_cedula: '1234567890',
    //   nombre1: 'Juan',
    //   apellido1: 'Pérez',
    //   email: 'juan@example.com',
    //   telefono: null,
    //   id_ciudad: '001',
    //   estado: 'ACT',
    //   fecha_creacion: 2026-01-20T10:30:00.000Z,
    //   error: false,
    //   mensaje: 'Cliente creado exitosamente'
    // }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// 3. EJEMPLOS POR MÓDULO
// ============================================================================

/**
 * EJEMPLO 1: Crear Cliente
 * POST /api/v1/clientes
 */
async function crearCliente(req, res) {
  try {
    const { ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad } = req.body;

    // Validación mínima
    if (!ruc_cedula || !nombre1 || !apellido1) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Datos requeridos' 
      });
    }

    // 🔷 LLAMAR SP
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

    const cliente = resultado[0];

    // Validar respuesta
    if (!cliente) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error desconocido' 
      });
    }

    // Validar error de BD
    if (cliente.error === true) {
      return res.status(400).json({ 
        status: 'error', 
        message: cliente.mensaje 
      });
    }

    // Éxito
    return res.status(201).json({
      status: 'success',
      message: 'Cliente creado',
      data: cliente
    });

  } catch (error) {
    // Errores específicos de BD
    if (error.code === '23505') {
      return res.status(409).json({ 
        status: 'error', 
        message: 'Cliente ya existe' 
      });
    }
    
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// ============================================================================

/**
 * EJEMPLO 2: Crear Factura
 * POST /api/v1/facturas
 */
async function crearFactura(req, res) {
  try {
    const { id_cliente, id_carrito, id_metodo_pago, id_sucursal } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // Validación mínima
    if (!id_cliente || !id_carrito || !id_metodo_pago || !id_sucursal) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Parámetros requeridos' 
      });
    }

    // 🔷 LLAMAR SP
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_factura_crear(
        ${Number(id_cliente)}::INTEGER,
        ${id_carrito}::UUID,
        ${Number(id_metodo_pago)}::INTEGER,
        ${Number(id_sucursal)}::INTEGER,
        ${id_empleado}::INTEGER
      )
    `;

    const factura = resultado[0];

    if (!factura) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error al crear factura' 
      });
    }

    if (factura.error === true) {
      return res.status(400).json({ 
        status: 'error', 
        message: factura.mensaje 
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Factura creada',
      data: factura
    });

  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// ============================================================================

/**
 * EJEMPLO 3: Registrar Recepción
 * POST /api/v1/bodega/recepciones
 */
async function registrarRecepcion(req, res) {
  try {
    const { compraId, detalles } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // Validación mínima
    if (!compraId || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Datos requeridos' 
      });
    }

    // Validar estructura de detalles
    for (const item of detalles) {
      if (!item.productoId || !item.cantidad) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Estructura de detalles incorrecta' 
        });
      }
    }

    // 🔷 CONVERTIR DETALLES A JSON
    const detallesJson = JSON.stringify(detalles);

    // 🔷 LLAMAR SP
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_recepcion_registrar(
        ${Number(compraId)}::INTEGER,
        ${detallesJson}::JSONB,
        ${id_empleado}::INTEGER
      )
    `;

    const recepcion = resultado[0];

    if (!recepcion) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error al registrar recepción' 
      });
    }

    if (recepcion.error === true) {
      return res.status(400).json({ 
        status: 'error', 
        message: recepcion.mensaje 
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Recepción registrada',
      data: recepcion
    });

  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// ============================================================================
// 4. PATRONES DE ERROR HANDLING
// ============================================================================

/**
 * Patrón 1: Validar respuesta y error
 */
function patronValidarRespuesta(resultado) {
  // Validar que hay resultado
  if (!resultado || resultado.length === 0) {
    throw new Error('SP no retornó resultado');
  }

  const data = resultado[0];

  // Validar error desde BD
  if (data.error === true || data.error === 'true') {
    throw new Error(data.mensaje || 'Error desconocido');
  }

  return data;
}

/**
 * Patrón 2: Códigos de error de PostgreSQL
 */
function manejarErrorPostgres(error) {
  const errorMap = {
    '23505': { status: 409, message: 'Registro duplicado' },
    '23503': { status: 400, message: 'Referencia no existe' },
    '23502': { status: 400, message: 'Campo requerido faltante' },
    'P0001': { status: 400, message: 'Error en base de datos' },
    'P0002': { status: 404, message: 'No encontrado' }
  };

  const codigo = error.code || 'UNKNOWN';
  return errorMap[codigo] || { 
    status: 500, 
    message: 'Error en base de datos' 
  };
}

/**
 * Uso del patrón:
 */
async function ejemploConErrorHandling(req, res) {
  try {
    const resultado = await prisma.$queryRaw`
      SELECT * FROM sp_cliente_crear(...)
    `;

    const cliente = patronValidarRespuesta(resultado);
    return res.json({ status: 'success', data: cliente });

  } catch (error) {
    if (error.code) {
      // Error de PostgreSQL
      const { status, message } = manejarErrorPostgres(error);
      return res.status(status).json({ status: 'error', message });
    }

    // Error general
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// ============================================================================
// 5. TIPS Y TRUCOS
// ============================================================================

/**
 * TIP 1: Pasar null correctamente
 */

// ❌ INCORRECTO
const resultado1 = await prisma.$queryRaw`
  SELECT * FROM sp_cliente_crear(..., null, ...)
`;

// ✅ CORRECTO
const resultado2 = await prisma.$queryRaw`
  SELECT * FROM sp_cliente_crear(..., ${null}::VARCHAR(20), ...)
`;

/**
 * TIP 2: Convertir tipos correctamente
 */

// ❌ INCORRECTO - Prisma lo envía como string
const clienteId = '123';
const resultado3 = await prisma.$queryRaw`
  SELECT * FROM sp_cliente_crear(${clienteId}::INTEGER, ...)
`;

// ✅ CORRECTO
const resultado4 = await prisma.$queryRaw`
  SELECT * FROM sp_cliente_crear(${Number(clienteId)}::INTEGER, ...)
`;

/**
 * TIP 3: Pasar objetos como JSON
 */

// Para JSONB en SP:
const detalles = [
  { productoId: 'P001', cantidad: 10 },
  { productoId: 'P002', cantidad: 5 }
];

const detallesJson = JSON.stringify(detalles);

const resultado5 = await prisma.$queryRaw`
  SELECT * FROM sp_recepcion_registrar(
    ${compraId}::INTEGER,
    ${detallesJson}::JSONB,
    ${empleadoId}::INTEGER
  )
`;

/**
 * TIP 4: Usar Prisma.sql para parámetros
 */

import { Prisma } from '@prisma/client';

const resultado6 = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM sp_cliente_crear(${ruc}, ${nombre}, ...)`
);

/**
 * TIP 5: Con transacción (si SP no la maneja)
 */

const resultado7 = await prisma.$transaction(async (tx) => {
  const data = await tx.$queryRaw`
    SELECT * FROM sp_cliente_crear(...)
  `;
  return data;
});

// ============================================================================
// 6. VALIDACIONES COMUNES
// ============================================================================

/**
 * Validar UUID válido
 */
function esUuidValido(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validar número positivo
 */
function esNumeroPositivo(valor) {
  const num = Number(valor);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Validar Cédula Ecuador (básico)
 */
function esCedulaValida(cedula) {
  return /^\d{10}$/.test(cedula); // 10 dígitos
}

/**
 * Validar RUC (básico)
 */
function esRucValido(ruc) {
  return /^\d{13}$/.test(ruc); // 13 dígitos
}

// ============================================================================
// 7. TESTING UNITARIO
// ============================================================================

/**
 * Ejemplo con Jest
 */

describe('crearCliente', () => {
  
  test('Debe crear cliente válido', async () => {
    const req = {
      body: {
        ruc_cedula: '1234567890',
        nombre1: 'Juan',
        apellido1: 'Pérez',
        email: 'juan@example.com',
        telefono: null,
        id_ciudad: '001'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await crearCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success'
      })
    );
  });

  test('Debe rechazar sin nombre', async () => {
    const req = {
      body: {
        ruc_cedula: '1234567890',
        nombre1: '',
        apellido1: 'Pérez'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await crearCliente(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});

// ============================================================================
// 8. DEBUGGING
// ============================================================================

/**
 * Agregar logs para debugging
 */
async function crearClienteConLogs(req, res) {
  try {
    console.log('[INICIO] crearCliente');
    console.log('[INPUT]', req.body);

    const { ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad } = req.body;

    console.log('[LLAMANDO] sp_cliente_crear con:', {
      ruc_cedula,
      nombre1,
      apellido1
    });

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

    console.log('[RESULTADO]', resultado);

    const cliente = resultado[0];
    console.log('[CLIENTE]', cliente);

    if (cliente.error) {
      console.log('[ERROR]', cliente.mensaje);
      return res.status(400).json({ 
        status: 'error', 
        message: cliente.mensaje 
      });
    }

    console.log('[ÉXITO]', cliente.id_cliente);
    return res.status(201).json({
      status: 'success',
      data: cliente
    });

  } catch (error) {
    console.error('[EXCEPCIÓN]', error);
    return res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
}

// ============================================================================
// 9. EXPORTAR PARA USO EN CONTROLADORES
// ============================================================================

export {
  crearCliente,
  crearFactura,
  registrarRecepcion,
  patronValidarRespuesta,
  manejarErrorPostgres
};

