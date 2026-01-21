// src/controllers/compra.controller.js
// 🔵 PERSONA 1: Módulo F2 - Gestión de Órdenes de Compra

import prisma from '../lib/prisma.js';

/**
 * GET /api/v1/compras
 * F2.4.1 - Consulta general de órdenes de compra
 */
export const listarCompras = async (req, res, next) => {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        proveedor: true,
        detalle_compra: {
          include: { producto: true }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    return res.json({
      status: 'success',
      message: 'Órdenes de compra obtenidas',
      data: compras
    });
  } catch (err) {
    // E1: Desconexión
    next(err);
  }
};

/**
 * GET /api/v1/compras/:id
 * Obtener orden de compra con detalle
 */
export const obtenerCompra = async (req, res, next) => {
  try {
    const id = req.params.id; // Es String (VARCHAR)

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'ID inválido',
        data: null
      });
    }

    const compra = await prisma.compra.findUnique({
      where: { id_compra: id },
      include: {
        proveedor: true,
        detalle_compra: {
          include: { producto: true }
        }
      }
    });

    // E2: Orden inexistente
    if (!compra) {
      return res.status(404).json({
        status: 'error',
        message: 'La orden de compra no existe',
        data: null
      });
    }

    return res.json({
      status: 'success',
      message: 'Orden de compra obtenida',
      data: compra
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/compras/buscar
 * F2.4.2 - Consulta de órdenes por parámetros
 */
export const buscarCompras = async (req, res, next) => {
  try {
    const { proveedor, fechaDesde, fechaHasta, estado } = req.query;

    // E5: Parámetros faltantes
    if (!proveedor && !fechaDesde && !fechaHasta && !estado) {
      return res.status(400).json({
        status: 'error',
        message: 'Ingrese al menos un criterio de búsqueda',
        data: null
      });
    }

    const compras = await prisma.compra.findMany({
      where: {
        AND: [
          proveedor ? { id_proveedor: proveedor } : {},
          estado ? { estado } : {},
          fechaDesde ? { fecha: { gte: new Date(fechaDesde) } } : {},
          fechaHasta ? { fecha: { lte: new Date(fechaHasta) } } : {}
        ]
      },
      include: { proveedor: true }
    });

    // E6: Sin resultados
    if (compras.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontraron órdenes de compra',
        data: []
      });
    }

    return res.json({
      status: 'success',
      message: 'Búsqueda completada',
      data: compras
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/compras
 * F2.1 - Ingreso de orden de compra
 * Crea la orden sin stored procedures
 */
export const crearCompra = async (req, res, next) => {
  try {
    const { id_proveedor, detalles } = req.body;

    // E5: Datos obligatorios
    if (!id_proveedor || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Proveedor y al menos un producto son requeridos',
        data: null
      });
    }

    // Validación básica de detalles
    for (const item of detalles) {
      if (!item.id_producto) {
        return res.status(400).json({
          status: 'error',
          message: 'Producto inexistente',
          data: null
        });
      }

      if (!item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad incorrecta',
          data: null
        });
      }
    }

    // 1. Validar que el proveedor existe y está activo
    const proveedor = await prisma.proveedor.findUnique({
      where: { id_proveedor: id_proveedor }
    });

    if (!proveedor) {
      return res.status(404).json({
        status: 'error',
        message: 'El proveedor no existe',
        data: null
      });
    }

    if (proveedor.estado !== 'ACT') {
      return res.status(400).json({
        status: 'error',
        message: 'El proveedor no está activo',
        data: null
      });
    }

    // 2. Validar productos y obtener costo unitario
    const productosValidados = [];
    for (const item of detalles) {
      const producto = await prisma.producto.findUnique({
        where: { id_producto: item.id_producto }
      });

      if (!producto) {
        return res.status(404).json({
          status: 'error',
          message: `El producto ${item.id_producto} no existe`,
          data: null
        });
      }

      if (item.costo_unitario === undefined || item.costo_unitario <= 0) {
        return res.status(400).json({
          status: 'error',
          message: `Costo unitario inválido para producto ${item.id_producto}`,
          data: null
        });
      }

      productosValidados.push({
        ...item,
        costo_unitario: Number(item.costo_unitario),
        cantidad: Number(item.cantidad)
      });
    }

    // 3. Calcular subtotales para cada detalle
    let subtotalTotal = 0;
    const detallesConCalculos = productosValidados.map((item) => {
      const subtotal = item.cantidad * item.costo_unitario;
      subtotalTotal += subtotal;

      return {
        ...item,
        subtotal
      };
    });

    // Calcular total (el schema no tiene IVA en compra)
    const total = subtotalTotal;

    // 4. Usar transacción para crear orden y detalles
    const resultado = await prisma.$transaction(async (tx) => {
      // El id_compra se genera automáticamente por la BD (dbgenerated)
      // Crear la orden de compra
      const compra = await tx.compra.create({
        data: {
          id_proveedor: id_proveedor,
          subtotal: subtotalTotal,
          total: total,
          estado: 'PEN' // Pendiente
        }
      });

      // Crear detalles de la compra
      for (const detalle of detallesConCalculos) {
        await tx.detalle_compra.create({
          data: {
            id_compra: compra.id_compra,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            costo_unitario: detalle.costo_unitario,
            subtotal: detalle.subtotal
          }
        });
      }

      // Retornar compra con detalles
      return await tx.compra.findUnique({
        where: { id_compra: compra.id_compra },
        include: {
          proveedor: true,
          detalle_compra: {
            include: { producto: true }
          }
        }
      });
    });

    return res.status(201).json({
      status: 'success',
      message: 'Orden de compra creada correctamente',
      data: resultado
    });
  } catch (err) {
    // E1: Desconexión
    next(err);
  }
};

/**
 * PUT /api/v1/compras/:id
 * F2.2 - Actualización de orden de compra
 * Actualiza los detalles y recalcula totales
 */
export const actualizarCompra = async (req, res, next) => {
  try {
    const id_compra = req.params.id; // VARCHAR
    const { detalles } = req.body;

    // Validación de entrada
    if (!id_compra) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de compra es requerido',
        data: null
      });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Al menos un producto es requerido',
        data: null
      });
    }

    // Validación básica de detalles
    for (const item of detalles) {
      if (!item.id_producto) {
        return res.status(400).json({
          status: 'error',
          message: 'Producto inexistente',
          data: null
        });
      }

      if (!item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad incorrecta',
          data: null
        });
      }

      if (item.costo_unitario === undefined || item.costo_unitario <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Costo unitario inválido',
          data: null
        });
      }
    }

    // 1. Validar que la compra existe y estado = 'PEN'
    const compra = await prisma.compra.findUnique({
      where: { id_compra }
    });

    if (!compra) {
      return res.status(404).json({
        status: 'error',
        message: 'La orden de compra no existe',
        data: null
      });
    }

    if (compra.estado !== 'PEN') {
      return res.status(409).json({
        status: 'error',
        message: 'Solo se pueden modificar órdenes con estado pendiente',
        data: null
      });
    }

    // 2. Validar todos los productos
    const productosValidados = [];
    for (const item of detalles) {
      const producto = await prisma.producto.findUnique({
        where: { id_producto: item.id_producto }
      });

      if (!producto) {
        return res.status(404).json({
          status: 'error',
          message: `El producto ${item.id_producto} no existe`,
          data: null
        });
      }

      productosValidados.push({
        ...item,
        costo_unitario: Number(item.costo_unitario),
        cantidad: Number(item.cantidad)
      });
    }

    // Calcular nuevos totales
    let subtotalTotal = 0;
    const detallesConCalculos = productosValidados.map((item) => {
      const subtotal = item.cantidad * item.costo_unitario;
      subtotalTotal += subtotal;

      return {
        ...item,
        subtotal
      };
    });

    const total = subtotalTotal;

    // 3. Usar transacción para actualizar
    const resultado = await prisma.$transaction(async (tx) => {
      // a. Eliminar detalles anteriores
      await tx.detalle_compra.deleteMany({
        where: { id_compra }
      });

      // b. Insertar los nuevos detalles
      for (const detalle of detallesConCalculos) {
        await tx.detalle_compra.create({
          data: {
            id_compra,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            costo_unitario: detalle.costo_unitario,
            subtotal: detalle.subtotal
          }
        });
      }

      // c. Actualizar la cabecera de compra
      const compraActualizada = await tx.compra.update({
        where: { id_compra },
        data: {
          subtotal: subtotalTotal,
          total: total
        },
        include: {
          proveedor: true,
          detalle_compra: {
            include: { producto: true }
          }
        }
      });

      return compraActualizada;
    });

    return res.json({
      status: 'success',
      message: 'Orden de compra actualizada correctamente',
      data: resultado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/compras/:id
 * F2.3 - Anulación de orden de compra
 * Solo permite anular si no tiene recepciones asociadas
 */
export const anularCompra = async (req, res, next) => {
  try {
    const id_compra = req.params.id; // VARCHAR

    if (!id_compra) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de compra es requerido',
        data: null
      });
    }

    // 1. Validar que la compra existe
    const compra = await prisma.compra.findUnique({
      where: { id_compra }
    });

    if (!compra) {
      return res.status(404).json({
        status: 'error',
        message: 'La orden de compra no existe',
        data: null
      });
    }

    // 2. Validar que NO está ya anulada
    if (compra.estado === 'ANU') {
      return res.status(409).json({
        status: 'error',
        message: 'La orden ya se encuentra anulada',
        data: null
      });
    }

    // 3. Validar que NO tiene recepciones asociadas
    const recepciones = await prisma.recepcion.findMany({
      where: { id_compra }
    });

    if (recepciones.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'No se puede anular una orden con recepciones',
        data: null
      });
    }

    // 4. Actualizar estado a 'ANU'
    const compraAnulada = await prisma.compra.update({
      where: { id_compra },
      data: { estado: 'ANU' }
    });

    return res.json({
      status: 'success',
      message: 'Orden de compra anulada correctamente',
      data: {
        id_compra: compraAnulada.id_compra,
        estado: compraAnulada.estado
      }
    });
  } catch (err) {
    next(err);
  }
};
