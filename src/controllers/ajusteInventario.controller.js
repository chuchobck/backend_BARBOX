import prisma from '../lib/prisma.js';

/**
 * Ajuste Inventario Controller - Maneja ajuste_inventario + detalle_ajuste
 */

export const listarAjustes = async (req, res, next) => {
  try {
    const ajustes = await prisma.ajuste_inventario.findMany({
      where: { estado: 'ACT' },
      include: {
        detalle_ajuste: {
          include: {
            producto: {
              select: { id_producto: true, descripcion: true, saldo_actual: true }
            }
          }
        }
      },
      orderBy: { fecha_hora: 'desc' }
    });

    if (!ajustes || ajustes.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No existen ajustes de inventario registrados', data: [] });
    }

    return res.json({ status: 'success', message: 'Ajustes obtenidos', data: ajustes });
  } catch (err) {
    next(err);
  }
};

export const obtenerAjuste = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de ajuste es requerido', data: null });

    const ajuste = await prisma.ajuste_inventario.findUnique({
      where: { id_ajuste: id },
      include: {
        detalle_ajuste: {
          include: {
            producto: {
              select: { id_producto: true, descripcion: true, saldo_actual: true }
            }
          }
        }
      }
    });

    if (!ajuste) {
      return res.status(404).json({ status: 'error', message: 'Ajuste de inventario no encontrado', data: null });
    }

    return res.json({ status: 'success', message: 'Ajuste obtenido', data: ajuste });
  } catch (err) {
    next(err);
  }
};

export const buscarAjustes = async (req, res, next) => {
  try {
    const { tipo, fecha_desde, fecha_hasta, estado } = req.query;

    if (!tipo && !fecha_desde && !fecha_hasta && !estado) {
      return res.status(400).json({ status: 'error', message: 'Ingrese al menos un criterio de búsqueda', data: null });
    }

    const where = {};
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (fecha_desde || fecha_hasta) {
      where.fecha_hora = {};
      if (fecha_desde) where.fecha_hora.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_hora.lte = new Date(fecha_hasta);
    }

    const resultados = await prisma.ajuste_inventario.findMany({
      where,
      include: { detalle_ajuste: true },
      orderBy: { fecha_hora: 'desc' }
    });

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron ajustes', data: [] });
    }

    return res.json({ status: 'success', message: 'Búsqueda completada', data: resultados });
  } catch (err) {
    next(err);
  }
};

export const crearAjuste = async (req, res, next) => {
  try {
    const { descripcion, tipo, detalles } = req.body;

    if (!descripcion || !tipo || !detalles) {
      return res.status(400).json({ status: 'error', message: 'descripcion, tipo y detalles son requeridos', data: null });
    }

    if (tipo !== 'E' && tipo !== 'S') {
      return res.status(400).json({ status: 'error', message: 'tipo debe ser E (Entrada) o S (Salida)', data: null });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ status: 'error', message: 'detalles debe ser un array con al menos 1 elemento', data: null });
    }

    // Validar cada detalle
    for (const detalle of detalles) {
      if (!detalle.id_producto || !detalle.cantidad || detalle.cantidad <= 0) {
        return res.status(400).json({ status: 'error', message: 'Cada detalle debe tener id_producto y cantidad > 0', data: null });
      }

      const producto = await prisma.producto.findUnique({ where: { id_producto: detalle.id_producto } });
      if (!producto) {
        return res.status(404).json({ status: 'error', message: `Producto ${detalle.id_producto} no existe`, data: null });
      }

      // Si es salida, validar stock suficiente
      if (tipo === 'S') {
        const ajustesActuales = producto.ajustes || 0;
        if (ajustesActuales < detalle.cantidad) {
          return res.status(400).json({ status: 'error', message: `Stock insuficiente para producto ${detalle.id_producto}`, data: null });
        }
      }
    }

    // Crear ajuste en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const ajuste = await tx.ajuste_inventario.create({
        data: {
          descripcion,
          tipo,
          num_productos: detalles.length,
          estado: 'ACT'
        }
      });

      for (const detalle of detalles) {
        await tx.detalle_ajuste.create({
          data: {
            id_ajuste: ajuste.id_ajuste,
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad
          }
        });

        // Actualizar inventario
        const producto = await tx.producto.findUnique({ where: { id_producto: detalle.id_producto } });
        const ajustesActuales = producto.ajustes || 0;
        const nuevoAjustes = tipo === 'E' 
          ? ajustesActuales + detalle.cantidad 
          : ajustesActuales - detalle.cantidad;

        await tx.producto.update({
          where: { id_producto: detalle.id_producto },
          data: { ajustes: nuevoAjustes }
        });
      }

      return ajuste;
    });

    return res.status(201).json({ status: 'success', message: 'Ajuste de inventario registrado correctamente', data: resultado });
  } catch (err) {
    next(err);
  }
};

export const anularAjuste = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de ajuste es requerido', data: null });

    const ajuste = await prisma.ajuste_inventario.findUnique({
      where: { id_ajuste: id },
      include: { detalle_ajuste: true }
    });

    if (!ajuste) {
      return res.status(404).json({ status: 'error', message: 'Ajuste de inventario no encontrado', data: null });
    }

    if (ajuste.estado === 'ANU') {
      return res.status(409).json({ status: 'error', message: 'Ajuste ya anulado', data: null });
    }

    // Validar que al revertir no quede stock negativo
    for (const detalle of ajuste.detalle_ajuste) {
      const producto = await prisma.producto.findUnique({ where: { id_producto: detalle.id_producto } });
      const ajustesActuales = producto.ajustes || 0;
      
      // Si el ajuste fue Entrada, al anular se resta
      if (ajuste.tipo === 'E' && ajustesActuales < detalle.cantidad) {
        return res.status(400).json({ status: 'error', message: `No se puede anular: stock insuficiente en producto ${detalle.id_producto}`, data: null });
      }
    }

    // Anular en transacción
    await prisma.$transaction(async (tx) => {
      for (const detalle of ajuste.detalle_ajuste) {
        const producto = await tx.producto.findUnique({ where: { id_producto: detalle.id_producto } });
        const ajustesActuales = producto.ajustes || 0;
        
        // Revertir ajuste
        const nuevoAjustes = ajuste.tipo === 'E'
          ? ajustesActuales - detalle.cantidad
          : ajustesActuales + detalle.cantidad;

        await tx.producto.update({
          where: { id_producto: detalle.id_producto },
          data: { ajustes: nuevoAjustes }
        });
      }

      await tx.ajuste_inventario.update({
        where: { id_ajuste: id },
        data: { estado: 'ANU' }
      });
    });

    return res.json({ status: 'success', message: 'Ajuste de inventario anulado correctamente', data: { id_ajuste: id } });
  } catch (err) {
    next(err);
  }
};

export default null;
