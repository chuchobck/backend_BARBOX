// =============================================
// 🛒 CARRITO CONTROLLER
// =============================================
import prisma from '../lib/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * GET /api/v1/carrito?usuarioId=1
 * Obtener carrito de un usuario
 * Frontend: Llamar en mounted/useEffect con el id del usuario logueado
 */
export const obtenerCarritoUsuario = async (req, res, next) => {
  try {
    const usuarioId = parseInt(req.query.usuarioId);

    if (!usuarioId || isNaN(usuarioId)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de usuario es requerido y debe ser un número válido',
        data: null
      });
    }

    // Buscar carrito activo del usuario SIN pedido asociado
    const carrito = await prisma.carrito.findFirst({
      where: { 
        id_usuario: usuarioId, 
        estado: 'ACT',
        pedido: null  // Solo carritos sin pedido
      },
      include: { 
        carrito_detalle: { 
          include: { 
            producto: {
              select: {
                id_producto: true,
                descripcion: true,
                precio_venta: true,
                imagen_url: true,
                saldo_actual: true,
                estado: true,
                marca: {
                  select: {
                    id_marca: true,
                    nombre: true
                  }
                }
              }
            }
          },
          orderBy: { fecha_agregado: 'desc' }
        },
        usuario: {
          select: {
            id_usuario: true,
            email: true
          }
        },
        canal_venta: {
          select: {
            id_canal: true,
            descripcion: true
          }
        }
      }
    });

    if (!carrito) {
      return res.json({
        status: 'success',
        message: 'No hay carrito activo. Puedes crear uno nuevo.',
        data: null,
        isEmpty: true
      });
    }

    // Validar disponibilidad de productos
    const productosConValidacion = carrito.carrito_detalle.map(detalle => ({
      ...detalle,
      disponible: detalle.producto.estado === 'ACT' && detalle.producto.saldo_actual >= detalle.cantidad,
      stock_disponible: detalle.producto.saldo_actual
    }));

    return res.json({
      status: 'success',
      message: 'Carrito obtenido exitosamente',
      data: {
        ...carrito,
        carrito_detalle: productosConValidacion,
        cantidad_items: carrito.carrito_detalle.length,
        total_productos: carrito.carrito_detalle.reduce((sum, item) => sum + item.cantidad, 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/carrito/:id_carrito
 * Obtener carrito por id de carrito (permitir sincronización sin usuario)
 */
export const obtenerCarritoPorId = async (req, res, next) => {
  try {
    const { id_carrito } = req.params;

    if (!id_carrito) {
      return res.status(400).json({
        status: 'error',
        message: 'id_carrito es requerido',
        data: null
      });
    }

    const carrito = await obtenerCarritoCompleto(id_carrito);

    if (!carrito) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado',
        data: null
      });
    }

    // Validar disponibilidad de productos
    const productosConValidacion = carrito.carrito_detalle.map(detalle => ({
      ...detalle,
      disponible: detalle.producto.estado === 'ACT' && detalle.producto.saldo_actual >= detalle.cantidad,
      stock_disponible: detalle.producto.saldo_actual
    }));

    return res.json({
      status: 'success',
      message: 'Carrito obtenido exitosamente',
      data: {
        ...carrito,
        carrito_detalle: productosConValidacion,
        cantidad_items: carrito.carrito_detalle.length,
        total_productos: carrito.carrito_detalle.reduce((sum, item) => sum + item.cantidad, 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/carrito
 * Crear carrito vacío para un usuario
 * Body: { usuarioId: number, id_canal: string }
 */
export const crearCarrito = async (req, res, next) => {
  try {
    const { usuarioId, id_canal = 'WEB' } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        status: 'error',
        message: 'usuarioId es requerido',
        data: null
      });
    }

    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: parseInt(usuarioId) }
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
        data: null
      });
    }

    // Verificar si ya tiene carrito activo SIN pedido
    const carritoExistente = await prisma.carrito.findFirst({
      where: { 
        id_usuario: parseInt(usuarioId), 
        estado: 'ACT',
        pedido: null  // Solo carritos sin pedido
      },
      include: { 
        carrito_detalle: { 
          include: { producto: true } 
        } 
      }
    });

    if (carritoExistente) {
      return res.json({
        status: 'success',
        message: 'Ya existe un carrito activo para este usuario',
        data: carritoExistente,
        isExisting: true
      });
    }

    // Crear nuevo carrito
    const nuevoCarrito = await prisma.carrito.create({
      data: {
        id_usuario: parseInt(usuarioId),
        id_canal,
        subtotal: new Decimal(0),
        descuento: new Decimal(0),
        total: new Decimal(0),
        estado: 'ACT',
        fecha_creacion: new Date()
      },
      include: { 
        carrito_detalle: true,
        usuario: {
          select: {
            id_usuario: true,
            email: true
          }
        },
        canal_venta: true
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      data: nuevoCarrito
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/carrito/:id_carrito/productos
 * Agregar producto al carrito
 * Body: { id_producto: string, cantidad: number, precio_referencial?: number }
 */
export const agregarProductoCarrito = async (req, res, next) => {
  try {
    const { id_carrito } = req.params;
    const { id_producto, cantidad = 1, precio_referencial } = req.body;

    // Validaciones
    if (!id_producto) {
      return res.status(400).json({
        status: 'error',
        message: 'id_producto es requerido',
        data: null
      });
    }

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser mayor o igual a 1',
        data: null
      });
    }

    // Verificar que el carrito existe
    const carrito = await prisma.carrito.findUnique({
      where: { id_carrito }
    });

    if (!carrito) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado',
        data: null
      });
    }

    if (carrito.estado !== 'ACT') {
      return res.status(400).json({
        status: 'error',
        message: 'El carrito no está activo',
        data: null
      });
    }

    // Verificar que el producto existe y está disponible
    const producto = await prisma.producto.findUnique({
      where: { id_producto }
    });

    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado',
        data: null
      });
    }

    if (producto.estado !== 'ACT') {
      return res.status(400).json({
        status: 'error',
        message: 'El producto no está disponible',
        data: null
      });
    }

    // Usar precio del producto si no se proporciona precio_referencial
    const precioFinal = precio_referencial ? new Decimal(precio_referencial) : producto.precio_venta;

    // Verificar si el producto ya está en el carrito
    const detalleExistente = await prisma.carrito_detalle.findUnique({
      where: { 
        id_carrito_id_producto: { 
          id_carrito, 
          id_producto 
        } 
      }
    });

    let nuevaCantidad = cantidad;
    
    if (detalleExistente) {
      // Actualizar cantidad existente
      nuevaCantidad = detalleExistente.cantidad + cantidad;
      
      // Verificar stock disponible
      if (producto.saldo_actual < nuevaCantidad) {
        return res.status(400).json({
          status: 'error',
          message: `Stock insuficiente. Disponible: ${producto.saldo_actual}`,
          data: { stock_disponible: producto.saldo_actual }
        });
      }

      await prisma.carrito_detalle.update({
        where: { 
          id_carrito_id_producto: { 
            id_carrito, 
            id_producto 
          } 
        },
        data: {
          cantidad: nuevaCantidad,
          subtotal: new Decimal(nuevaCantidad).mul(precioFinal)
        }
      });
    } else {
      // Verificar stock disponible
      if (producto.saldo_actual < cantidad) {
        return res.status(400).json({
          status: 'error',
          message: `Stock insuficiente. Disponible: ${producto.saldo_actual}`,
          data: { stock_disponible: producto.saldo_actual }
        });
      }

      // Crear nuevo detalle
      await prisma.carrito_detalle.create({
        data: {
          id_carrito,
          id_producto,
          cantidad,
          precio_referencial: precioFinal,
          subtotal: new Decimal(cantidad).mul(precioFinal),
          fecha_agregado: new Date()
        }
      });
    }

    // Recalcular totales del carrito
    await recalcularCarrito(id_carrito);

    // Obtener carrito actualizado
    const carritoActualizado = await obtenerCarritoCompleto(id_carrito);

    return res.json({
      status: 'success',
      message: detalleExistente ? 'Cantidad actualizada en el carrito' : 'Producto agregado al carrito',
      data: carritoActualizado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/carrito/:id_carrito/productos/:id_producto
 * Actualizar cantidad de un producto en el carrito
 * Body: { cantidad: number }
 */
export const actualizarCantidadProducto = async (req, res, next) => {
  try {
    const { id_carrito, id_producto } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser mayor o igual a 1',
        data: null
      });
    }

    // Verificar que existe el detalle
    const detalle = await prisma.carrito_detalle.findUnique({
      where: { 
        id_carrito_id_producto: { 
          id_carrito, 
          id_producto 
        } 
      },
      include: { producto: true }
    });

    if (!detalle) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado en el carrito',
        data: null
      });
    }

    // Verificar stock disponible
    if (detalle.producto.saldo_actual < cantidad) {
      return res.status(400).json({
        status: 'error',
        message: `Stock insuficiente. Disponible: ${detalle.producto.saldo_actual}`,
        data: { stock_disponible: detalle.producto.saldo_actual }
      });
    }

    // Actualizar cantidad
    await prisma.carrito_detalle.update({
      where: { 
        id_carrito_id_producto: { 
          id_carrito, 
          id_producto 
        } 
      },
      data: {
        cantidad,
        subtotal: new Decimal(cantidad).mul(detalle.precio_referencial)
      }
    });

    // Recalcular totales
    await recalcularCarrito(id_carrito);

    // Obtener carrito actualizado
    const carritoActualizado = await obtenerCarritoCompleto(id_carrito);

    return res.json({
      status: 'success',
      message: 'Cantidad actualizada exitosamente',
      data: carritoActualizado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/carrito/:id_carrito/productos/:id_producto
 * Eliminar un producto del carrito
 */
export const eliminarProductoCarrito = async (req, res, next) => {
  try {
    const { id_carrito, id_producto } = req.params;

    // Verificar que existe el detalle
    const detalle = await prisma.carrito_detalle.findUnique({
      where: { 
        id_carrito_id_producto: { 
          id_carrito, 
          id_producto 
        } 
      }
    });

    if (!detalle) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado en el carrito',
        data: null
      });
    }

    // Marcar producto como inactivo (eliminación lógica)
    await prisma.carrito_detalle.update({
      where: { 
        id_carrito_id_producto: { 
          id_carrito, 
          id_producto 
        } 
      },
      data: { estado: 'INA' }
    });

    // Recalcular totales
    await recalcularCarrito(id_carrito);

    // Obtener carrito actualizado
    const carritoActualizado = await obtenerCarritoCompleto(id_carrito);

    return res.json({
      status: 'success',
      message: 'Producto eliminado del carrito',
      data: carritoActualizado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/carrito/:id_carrito
 * Vaciar carrito completo
 */
export const vaciarCarrito = async (req, res, next) => {
  try {
    const { id_carrito } = req.params;

    // Verificar que el carrito existe
    const carrito = await prisma.carrito.findUnique({
      where: { id_carrito }
    });

    if (!carrito) {
      return res.status(404).json({
        status: 'error',
        message: 'Carrito no encontrado',
        data: null
      });
    }

    // Marcar todos los detalles como inactivos (eliminación lógica)
    await prisma.carrito_detalle.updateMany({ 
      where: { id_carrito },
      data: { estado: 'INA' }
    });

    // Actualizar totales a cero (mantiene estado ACT - no cambia a DEL)
    const carritoActualizado = await prisma.carrito.update({
      where: { id_carrito },
      data: { 
        // NO cambiar estado - solo limpiar totales
        subtotal: new Decimal(0), 
        descuento: new Decimal(0),
        total: new Decimal(0),
        fecha_actualizacion: new Date()
      },
      include: { 
        carrito_detalle: true,
        usuario: {
          select: {
            id_usuario: true,
            email: true
          }
        }
      }
    });

    return res.json({
      status: 'success',
      message: 'Carrito vaciado exitosamente',
      data: carritoActualizado
    });
  } catch (err) {
    next(err);
  }
};

// =============================================
// FUNCIONES AUXILIARES
// =============================================

/**
 * Recalcular subtotal y total del carrito
 */
async function recalcularCarrito(id_carrito) {
  const detalles = await prisma.carrito_detalle.findMany({
    where: { 
      id_carrito,
      estado: 'ACT'
    }
  });

  const subtotal = detalles.reduce((sum, detalle) => {
    return sum.add(new Decimal(detalle.subtotal));
  }, new Decimal(0));

  const carrito = await prisma.carrito.findUnique({
    where: { id_carrito }
  });

  const descuento = carrito?.descuento || new Decimal(0);
  const total = subtotal.sub(descuento);

  await prisma.carrito.update({
    where: { id_carrito },
    data: {
      subtotal,
      total: total.greaterThan(0) ? total : new Decimal(0),
      fecha_actualizacion: new Date()
    }
  });
}

/**
 * Obtener carrito completo con todas las relaciones
 */
async function obtenerCarritoCompleto(id_carrito) {
  return await prisma.carrito.findUnique({
    where: { id_carrito },
    include: {
      carrito_detalle: {
        where: { estado: 'ACT' },
        include: {
          producto: {
            select: {
              id_producto: true,
              descripcion: true,
              precio_venta: true,
              imagen_url: true,
              saldo_actual: true,
              estado: true,
              marca: {
                select: {
                  id_marca: true,
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: { fecha_agregado: 'desc' }
      },
      usuario: {
        select: {
          id_usuario: true,
          email: true
        }
      },
      canal_venta: {
        select: {
          id_canal: true,
          descripcion: true
        }
      }
    }
  });
}
