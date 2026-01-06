import prisma from '../config/database.js';

/**
 * POST /api/v1/pagos
 * 
 * Body:
 * {
 *   "pedidoId": "PED0001",
 *   "metodo": "PAYPAL",
 *   "monto": 100.00,
 *   "referencia": "TXN123456"
 * }
 */
export const crearPago = async (req, res, next) => {
  try {
    const { pedidoId, metodo, monto, referencia } = req.body;

    if (!pedidoId || !metodo || !monto) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios (pedidoId, metodo, monto)',
        data: null
      });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: pedidoId },
      include: {
        factura: true
      }
    });

    if (!pedido) {
      return res.status(404).json({
        status: 'error',
        message: 'Pedido no encontrado',
        data: null
      });
    }

    if (pedido.factura) {
      return res.status(400).json({
        status: 'error',
        message: 'El pedido ya tiene una factura emitida',
        data: null
      });
    }

    // Crear el pago
    const pago = await prisma.pago.create({
      data: {
        id_pedido: pedidoId,
        metodo,
        monto,
        estado: 'OK', // Puedes dejarlo como 'PEN' si esperas confirmación externa
        referencia,
        fecha_pago: new Date()
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Pago registrado correctamente',
      data: pago
    });
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/v1/pagos?usuarioId=1
 * Obtener todos los pagos hechos por un usuario (a través de sus pedidos)
 */
/**
 * POST /api/v1/pagos/tarjeta
 * Simula un pago con tarjeta de crédito
 * Body:
 * {
 *   "pedidoId": "PED0001",
 *   "datosTarjeta": {
 *     "numero": "4532 1111 2222 3333",
 *     "titular": "JUAN PEREZ",
 *     "fechaExpiracion": "12/25",
 *     "cvv": "123"
 *   }
 * }
 */
export const pagarConTarjeta = async (req, res, next) => {
  try {
    console.log('🔍 REQUEST BODY:', JSON.stringify(req.body, null, 2));
    const { pedidoId, datosTarjeta } = req.body;

    // Validaciones
    if (!pedidoId || !datosTarjeta) {
      console.log('❌ Faltan campos:', { pedidoId, datosTarjeta });
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios (pedidoId, datosTarjeta)',
        data: null
      });
    }

    const { numero, titular, fechaExpiracion, cvv } = datosTarjeta;
    
    if (!numero || !titular || !fechaExpiracion || !cvv) {
      console.log('❌ Datos de tarjeta incompletos:', { numero, titular, fechaExpiracion, cvv });
      return res.status(400).json({
        status: 'error',
        message: 'Datos de tarjeta incompletos',
        data: null
      });
    }

    console.log('✅ Datos de tarjeta completos');

    // Verificar que el pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: pedidoId },
      include: {
        factura: true
      }
    });

    console.log('🔍 Pedido encontrado:', pedido ? 'SÍ' : 'NO');

    if (!pedido) {
      console.log('❌ Pedido no encontrado');
      return res.status(404).json({
        status: 'error',
        message: 'Pedido no encontrado',
        data: null
      });
    }

    console.log('🔍 Pedido tiene factura:', pedido.factura ? 'SÍ' : 'NO');

    if (pedido.factura) {
      console.log('❌ Pedido ya tiene factura');
      return res.status(400).json({
        status: 'error',
        message: 'El pedido ya tiene una factura emitida',
        data: null
      });
    }

    // Simular validación de tarjeta
    const numeroLimpio = numero.replace(/\s/g, '');
    console.log('🔍 Número limpio:', numeroLimpio, 'Longitud:', numeroLimpio.length);
    
    if (numeroLimpio.length !== 16) {
      console.log('❌ Número de tarjeta inválido');
      return res.status(400).json({
        status: 'error',
        message: 'Número de tarjeta inválido',
        data: null
      });
    }

    // Generar referencia de transacción simulada
    const referencia = `TC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Simular respuesta exitosa (en producción aquí iría la integración con pasarela de pago)
    const ultimosDigitos = numeroLimpio.slice(-4);
    
    // Crear el registro de pago
    const pago = await prisma.pago.create({
      data: {
        id_pedido: pedidoId,
        metodo: 'TARJETA',
        monto: pedido.total,
        estado: 'OK',
        referencia: referencia,
        fecha_pago: new Date()
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Pago con tarjeta procesado correctamente',
      data: {
        id_pago: pago.id_pago,
        referencia: referencia,
        ultimosDigitos: ultimosDigitos,
        titular: titular,
        monto: pedido.total,
        fecha_pago: pago.fecha_pago
      }
    });
  } catch (err) {
    console.error('Error en pago con tarjeta:', err);
    next(err);
  }
};

export const obtenerPagosPorUsuario = async (req, res, next) => {
  try {
    const usuarioId = parseInt(req.query.usuarioId);

    if (!usuarioId || isNaN(usuarioId)) {
      return res.status(400).json({
        status: 'error',
        message: 'usuarioId es requerido y debe ser numérico',
        data: null
      });
    }

    const pagos = await prisma.pago.findMany({
      where: {
        pedido: {
          id_usuario: usuarioId
        }
      },
      include: {
        pedido: {
          select: {
            id_pedido: true,
            subtotal: true,
            total: true,
            estado: true,
            id_cliente: true,
            fecha_creacion: true
          }
        }
      },
      orderBy: {
        fecha_pago: 'desc'
      }
    });

    return res.json({
      status: 'success',
      message: 'Pagos encontrados',
      data: pagos
    });
  } catch (err) {
    next(err);
  }
};
