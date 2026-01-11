import prisma from '../lib/prisma.js';

/**
 * Recepción Controller - Maneja recepcion + detalle_recepcion
 */

export const listarRecepciones = async (req, res, next) => {
  try {
    const recepciones = await prisma.recepcion.findMany({
      where: { estado: 'ACT' },
      include: {
        detalle_recepcion: {
          include: {
            producto: {
              select: { id_producto: true, descripcion: true }
            }
          }
        },
        compra: {
          select: { id_compra: true, fecha: true, proveedor: { select: { nombre: true } } }
        },
        empleado: {
          select: { nombre1: true, apellido1: true }
        }
      },
      orderBy: { fecha_hora: 'desc' }
    });

    if (!recepciones || recepciones.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No existen recepciones registradas', data: [] });
    }

    return res.json({ status: 'success', message: 'Recepciones obtenidas', data: recepciones });
  } catch (err) {
    next(err);
  }
};

export const obtenerRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de recepción es requerido', data: null });

    const recepcion = await prisma.recepcion.findUnique({
      where: { id_recepcion: id },
      include: {
        detalle_recepcion: {
          include: {
            producto: {
              select: { id_producto: true, descripcion: true, saldo_actual: true }
            }
          }
        },
        compra: {
          include: {
            proveedor: true,
            detalle_compra: true
          }
        },
        empleado: {
          select: { nombre1: true, apellido1: true, cedula: true }
        }
      }
    });

    if (!recepcion) {
      return res.status(404).json({ status: 'error', message: 'Recepción no encontrada', data: null });
    }

    return res.json({ status: 'success', message: 'Recepción obtenida', data: recepcion });
  } catch (err) {
    next(err);
  }
};

export const buscarRecepciones = async (req, res, next) => {
  try {
    const { id_compra, id_empleado, fecha_desde, fecha_hasta, estado } = req.query;

    if (!id_compra && !id_empleado && !fecha_desde && !fecha_hasta && !estado) {
      return res.status(400).json({ status: 'error', message: 'Ingrese al menos un criterio de búsqueda', data: null });
    }

    const where = {};
    if (id_compra) where.id_compra = id_compra;
    if (id_empleado) where.id_empleado = Number(id_empleado);
    if (estado) where.estado = estado;
    if (fecha_desde || fecha_hasta) {
      where.fecha_hora = {};
      if (fecha_desde) where.fecha_hora.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_hora.lte = new Date(fecha_hasta);
    }

    const resultados = await prisma.recepcion.findMany({
      where,
      include: {
        detalle_recepcion: true,
        compra: { select: { id_compra: true, proveedor: { select: { nombre: true } } } },
        empleado: { select: { nombre1: true, apellido1: true } }
      },
      orderBy: { fecha_hora: 'desc' }
    });

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron recepciones', data: [] });
    }

    return res.json({ status: 'success', message: 'Búsqueda completada', data: resultados });
  } catch (err) {
    next(err);
  }
};

export const crearRecepcion = async (req, res, next) => {
  try {
    const { id_compra, id_empleado, descripcion, detalles, observaciones } = req.body;

    if (!detalles) {
      return res.status(400).json({ status: 'error', message: 'detalles es requerido', data: null });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ status: 'error', message: 'detalles debe ser un array con al menos 1 elemento', data: null });
    }

    // Validar compra si se proporciona
    if (id_compra) {
      const compra = await prisma.compra.findUnique({
        where: { id_compra },
        include: { detalle_compra: true }
      });
      if (!compra) {
        return res.status(404).json({ status: 'error', message: 'Compra no encontrada', data: null });
      }
    }

    // Validar cada detalle
    for (const detalle of detalles) {
      if (!detalle.id_producto || !detalle.cantidad_solicitada || !detalle.cantidad_recibida) {
        return res.status(400).json({ status: 'error', message: 'Cada detalle debe tener id_producto, cantidad_solicitada y cantidad_recibida', data: null });
      }

      const producto = await prisma.producto.findUnique({ where: { id_producto: detalle.id_producto } });
      if (!producto) {
        return res.status(404).json({ status: 'error', message: `Producto ${detalle.id_producto} no existe`, data: null });
      }
    }

    // Crear recepción en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const recepcion = await tx.recepcion.create({
        data: {
          id_compra: id_compra || null,
          id_empleado: id_empleado || null,
          descripcion: descripcion || null,
          num_productos: detalles.length,
          estado: 'ACT',
          observaciones: observaciones || null
        }
      });

      for (const detalle of detalles) {
        await tx.detalle_recepcion.create({
          data: {
            id_recepcion: recepcion.id_recepcion,
            id_producto: detalle.id_producto,
            cantidad_solicitada: detalle.cantidad_solicitada,
            cantidad_recibida: detalle.cantidad_recibida
          }
        });

        // Actualizar inventario con la cantidad recibida
        await tx.producto.update({
          where: { id_producto: detalle.id_producto },
          data: {
            ingresos: { increment: detalle.cantidad_recibida },
            saldo_actual: { increment: detalle.cantidad_recibida }
          }
        });

        // Si hay compra asociada, actualizar cantidad recibida
        if (id_compra) {
          await tx.detalle_compra.updateMany({
            where: {
              id_compra: id_compra,
              id_producto: detalle.id_producto
            },
            data: {
              cantidad_recibida: { increment: detalle.cantidad_recibida }
            }
          });
        }
      }

      return tx.recepcion.findUnique({
        where: { id_recepcion: recepcion.id_recepcion },
        include: { detalle_recepcion: true }
      });
    });

    return res.status(201).json({ status: 'success', message: 'Recepción creada', data: resultado });
  } catch (err) {
    next(err);
  }
};

export const actualizarRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de recepción es requerido', data: null });

    const { descripcion, observaciones, estado } = req.body;

    const recepcionExiste = await prisma.recepcion.findUnique({ where: { id_recepcion: id } });
    if (!recepcionExiste) {
      return res.status(404).json({ status: 'error', message: 'Recepción no encontrada', data: null });
    }

    const data = {};
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (observaciones !== undefined) data.observaciones = observaciones;
    if (estado !== undefined) data.estado = estado;

    const recepcion = await prisma.recepcion.update({
      where: { id_recepcion: id },
      data,
      include: { detalle_recepcion: true }
    });

    return res.json({ status: 'success', message: 'Recepción actualizada', data: recepcion });
  } catch (err) {
    next(err);
  }
};

export const anularRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { motivo_anulacion } = req.body;

    if (!id) return res.status(400).json({ status: 'error', message: 'ID de recepción es requerido', data: null });
    if (!motivo_anulacion) return res.status(400).json({ status: 'error', message: 'motivo_anulacion es requerido', data: null });

    const recepcionExiste = await prisma.recepcion.findUnique({
      where: { id_recepcion: id },
      include: { detalle_recepcion: true }
    });

    if (!recepcionExiste) {
      return res.status(404).json({ status: 'error', message: 'Recepción no encontrada', data: null });
    }

    if (recepcionExiste.estado === 'ANU') {
      return res.status(400).json({ status: 'error', message: 'La recepción ya está anulada', data: null });
    }

    // Anular en transacción (revertir movimientos de inventario)
    const resultado = await prisma.$transaction(async (tx) => {
      // Revertir inventario
      for (const detalle of recepcionExiste.detalle_recepcion) {
        await tx.producto.update({
          where: { id_producto: detalle.id_producto },
          data: {
            ingresos: { decrement: detalle.cantidad_recibida },
            saldo_actual: { decrement: detalle.cantidad_recibida }
          }
        });

        // Revertir cantidad recibida en compra si existe
        if (recepcionExiste.id_compra) {
          await tx.detalle_compra.updateMany({
            where: {
              id_compra: recepcionExiste.id_compra,
              id_producto: detalle.id_producto
            },
            data: {
              cantidad_recibida: { decrement: detalle.cantidad_recibida }
            }
          });
        }
      }

      return await tx.recepcion.update({
        where: { id_recepcion: id },
        data: {
          estado: 'ANU',
          motivo_anulacion,
          fecha_anulacion: new Date()
        }
      });
    });

    return res.json({ status: 'success', message: 'Recepción anulada', data: resultado });
  } catch (err) {
    next(err);
  }
};

export const eliminarRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de recepción es requerido', data: null });

    const recepcionExiste = await prisma.recepcion.findUnique({ where: { id_recepcion: id } });
    if (!recepcionExiste) {
      return res.status(404).json({ status: 'error', message: 'Recepción no encontrada', data: null });
    }

    await prisma.recepcion.delete({ where: { id_recepcion: id } });

    return res.json({ status: 'success', message: 'Recepción eliminada', data: null });
  } catch (err) {
    next(err);
  }
};
