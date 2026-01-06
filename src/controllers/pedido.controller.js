import prisma from '../config/database.js';

/**
 * POST /api/v1/pedidos
 * 
 * Body:
 * {
 *   "carritoId": "UUID",
 *   "canal": "WEB",
 *   "nombre": "Juan",
 *   "apellido": "Pérez",
 *   "celular": "0998765432"
 * }
 */
export const crearPedido = async (req, res, next) => {
  try {
    const { carritoId, canal, nombre, apellido, celular } = req.body;
    const usuarioId = req.usuario?.id; // 🔐 Del JWT decodificado

    if (!carritoId || !canal) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos: carritoId y canal son requeridos' });
    }

    if (!usuarioId) {
      return res.status(401).json({ status: 'error', message: 'Usuario no autenticado' });
    }

    // 🔐 Buscar cliente vinculado al usuario autenticado
    const cliente = await prisma.cliente.findFirst({
      where: { 
        usuario: {
          some: {
            id_usuario: usuarioId
          }
        }
      },
    });

    if (!cliente) {
      return res.status(403).json({ status: 'error', message: 'Cliente no encontrado para este usuario' });
    }

    // Validar carrito
    const carrito = await prisma.carrito.findUnique({
      where: { id_carrito: carritoId },
      include: { 
        carrito_detalle: true,
        pedido: true  // Verificar si ya tiene pedido asociado
      }
    });

    if (!carrito) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    if (carrito.estado !== 'ACT') {
      return res.status(400).json({ status: 'error', message: 'Carrito no está activo (ya fue cerrado por pago confirmado)' });
    }

    // Si ya tiene un pedido pendiente, devolver ese en lugar de crear uno nuevo
    if (carrito.pedido) {
      // Solo si el pedido está pendiente (PEN), se puede reutilizar
      if (carrito.pedido.estado === 'PEN') {
        return res.status(200).json({ 
          status: 'success', 
          message: 'Ya existe un pedido pendiente para este carrito',
          data: { 
            id_pedido: carrito.pedido.id_pedido, 
            estado: carrito.pedido.estado,
            datosCliente: {
              id_cliente: cliente.id_cliente,
              nombre1: cliente.nombre1,
              nombre2: cliente.nombre2,
              apellido1: cliente.apellido1,
              apellido2: cliente.apellido2,
              celular: cliente.celular,
              telefono: cliente.telefono,
              email: cliente.email
            }
          }
        });
      }
      
      // Si el pedido ya fue facturado, el carrito debería estar cerrado
      return res.status(409).json({ 
        status: 'error', 
        message: 'Este carrito ya tiene un pedido procesado',
        data: { pedidoExistente: carrito.pedido.id_pedido }
      });
    }

    if (carrito.carrito_detalle.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Carrito vacío' });
    }

    // Calcular subtotal y preparar detalle
    let subtotal = 0;
    const pedidoDetalle = carrito.carrito_detalle.map(item => {
      const sub = item.precio_referencial * item.cantidad;
      subtotal += sub;
      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_referencial,
        subtotal: sub,
      };
    });

    const total = subtotal;

    // Generar ID de pedido
    const ultimoPedido = await prisma.pedido.findFirst({
      orderBy: { id_pedido: 'desc' }
    });
    
    let numeroSecuencia = 1;
    if (ultimoPedido && ultimoPedido.id_pedido) {
      const numeroActual = parseInt(ultimoPedido.id_pedido.replace('PED', ''));
      numeroSecuencia = numeroActual + 1;
    }
    
    const id_pedido = `PED${String(numeroSecuencia).padStart(4, '0')}`;

    // Crear pedido con el clienteId del backend
    const pedido = await prisma.pedido.create({
      data: {
        id_pedido,
        id_carrito: carritoId,
        id_cliente: cliente.id_cliente, // 👈 viene del backend, NO del body
        id_usuario: usuarioId,
        id_canal: canal,
        subtotal,
        total,
        estado: 'PEN',
        pedido_detalle: {
          create: pedidoDetalle
        }
      }
    });

    // Log de datos de contacto (si se proporcionaron)
    if (nombre || apellido || celular) {
      console.log('📞 Datos de contacto:', { nombre, apellido, celular });
    }

    // ⚠️ NO cerramos el carrito aquí - se cierra cuando se CONFIRMA el pago (al crear factura)
    // Esto permite que el usuario pueda cancelar y volver a editar el carrito

    return res.status(201).json({
      status: 'success',
      message: 'Pedido creado correctamente',
      data: { 
        id_pedido: pedido.id_pedido, 
        estado: pedido.estado,
        // Datos del cliente para el formulario de contacto
        datosCliente: {
          id_cliente: cliente.id_cliente,
          nombre1: cliente.nombre1,
          nombre2: cliente.nombre2,
          apellido1: cliente.apellido1,
          apellido2: cliente.apellido2,
          celular: cliente.celular,
          telefono: cliente.telefono,
          email: cliente.email
        }
      }
    });

  } catch (err) {
    next(err);
  }
};
