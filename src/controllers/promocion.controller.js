import prisma from '../lib/prisma.js';

/**
 * Promocion Controller - Gestión de promociones con productos asociados
 */

export const listarPromociones = async (req, res, next) => {
  try {
    const promociones = await prisma.promocion.findMany({
      where: { activo: true },
      include: {
        categoria_promocion: true,
        promocion_producto: {
          include: { producto: true }
        }
      },
      orderBy: [{ destacado: 'desc' }, { fecha_inicio: 'desc' }]
    });

    if (!promociones || promociones.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No existen promociones registradas', data: [] });
    }

    return res.json({ status: 'success', message: 'Promociones obtenidas', data: promociones });
  } catch (err) {
    next(err);
  }
};

export const obtenerPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de promoción es requerido', data: null });

    const promocion = await prisma.promocion.findUnique({
      where: { id },
      include: {
        categoria_promocion: true,
        promocion_producto: {
          include: { producto: true },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!promocion) {
      return res.status(404).json({ status: 'error', message: 'Promoción no encontrada', data: null });
    }

    return res.json({ status: 'success', message: 'Promoción obtenida', data: promocion });
  } catch (err) {
    next(err);
  }
};

export const obtenerPromocionesActivas = async (req, res, next) => {
  try {
    const ahora = new Date();

    const promociones = await prisma.promocion.findMany({
      where: {
        activo: true,
        fecha_inicio: { lte: ahora },
        fecha_fin: { gte: ahora },
        stock_disponible: { gt: 0 }
      },
      include: {
        categoria_promocion: true,
        promocion_producto: {
          include: { producto: true },
          orderBy: { orden: 'asc' }
        }
      },
      orderBy: { destacado: 'desc' }
    });

    return res.json({ status: 'success', message: 'Promociones activas obtenidas', data: promociones });
  } catch (err) {
    next(err);
  }
};

export const buscarPromociones = async (req, res, next) => {
  try {
    const { nombre, id_categoria, destacado, activo } = req.query;

    if (!nombre && !id_categoria && typeof destacado === 'undefined' && typeof activo === 'undefined') {
      return res.status(400).json({ status: 'error', message: 'Ingrese al menos un criterio de búsqueda', data: null });
    }

    const where = {};
    if (nombre) where.nombre = { contains: nombre, mode: 'insensitive' };
    if (id_categoria) where.id_categoria = Number(id_categoria);
    if (typeof destacado !== 'undefined') where.destacado = String(destacado).toLowerCase() === 'true';
    if (typeof activo !== 'undefined') where.activo = String(activo).toLowerCase() === 'true';

    const resultados = await prisma.promocion.findMany({
      where,
      include: { categoria_promocion: true },
      orderBy: { fecha_inicio: 'desc' }
    });

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron promociones', data: [] });
    }

    return res.json({ status: 'success', message: 'Búsqueda completada', data: resultados });
  } catch (err) {
    next(err);
  }
};

export const crearPromocion = async (req, res, next) => {
  try {
    const {
      id_categoria,
      nombre,
      descripcion,
      descripcion_corta,
      precio_original,
      precio_promocional,
      porcentaje_descuento,
      fecha_inicio,
      fecha_fin,
      stock_disponible,
      cantidad_maxima_cliente,
      destacado,
      productos
    } = req.body;

    // Validaciones básicas
    if (!id_categoria || !nombre || !fecha_inicio || !fecha_fin || !stock_disponible) {
      return res.status(400).json({ status: 'error', message: 'Campos obligatorios: id_categoria, nombre, fecha_inicio, fecha_fin, stock_disponible', data: null });
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Debe incluir al menos un producto', data: null });
    }

    // Validar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (fin <= inicio) {
      return res.status(400).json({ status: 'error', message: 'fecha_fin debe ser posterior a fecha_inicio', data: null });
    }

    if (stock_disponible <= 0) {
      return res.status(400).json({ status: 'error', message: 'stock_disponible debe ser mayor a 0', data: null });
    }

    // Validar categoría
    const categoria = await prisma.categoria_promocion.findUnique({ where: { id: Number(id_categoria) } });
    if (!categoria) {
      return res.status(400).json({ status: 'error', message: 'Categoría de promoción no existe', data: null });
    }

    // Validar productos
    const principales = productos.filter(p => p.es_principal === true);
    if (principales.length > 1) {
      return res.status(400).json({ status: 'error', message: 'Solo puede haber un producto principal', data: null });
    }

    for (const prod of productos) {
      const producto = await prisma.producto.findUnique({ where: { id_producto: prod.id_producto } });
      if (!producto) {
        return res.status(400).json({ status: 'error', message: `Producto ${prod.id_producto} no existe`, data: null });
      }
      if (!prod.cantidad || prod.cantidad <= 0) {
        return res.status(400).json({ status: 'error', message: `Cantidad debe ser mayor a 0 para producto ${prod.id_producto}`, data: null });
      }
    }

    // Crear en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const promo = await tx.promocion.create({
        data: {
          id_categoria: Number(id_categoria),
          nombre,
          descripcion: descripcion || null,
          descripcion_corta: descripcion_corta || null,
          precio_original: precio_original ? Number(precio_original) : null,
          precio_promocional: precio_promocional ? Number(precio_promocional) : null,
          porcentaje_descuento: porcentaje_descuento ? Number(porcentaje_descuento) : null,
          fecha_inicio: inicio,
          fecha_fin: fin,
          stock_disponible: Number(stock_disponible),
          cantidad_vendida: 0,
          cantidad_maxima_cliente: cantidad_maxima_cliente ? Number(cantidad_maxima_cliente) : null,
          destacado: Boolean(destacado),
          activo: true
        }
      });

      for (const prod of productos) {
        await tx.promocion_producto.create({
          data: {
            id_promocion: promo.id,
            id_producto: prod.id_producto,
            cantidad: Number(prod.cantidad),
            es_principal: Boolean(prod.es_principal),
            orden: prod.orden ? Number(prod.orden) : null
          }
        });
      }

      return promo;
    });

    return res.status(201).json({ status: 'success', message: 'Promoción creada correctamente', data: resultado });
  } catch (err) {
    next(err);
  }
};

export const actualizarPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const {
      nombre,
      descripcion,
      descripcion_corta,
      precio_original,
      precio_promocional,
      porcentaje_descuento,
      fecha_inicio,
      fecha_fin,
      stock_disponible,
      cantidad_maxima_cliente,
      destacado,
      activo,
      productos
    } = req.body;

    if (!id) return res.status(400).json({ status: 'error', message: 'ID de promoción es requerido', data: null });

    const promocion = await prisma.promocion.findUnique({ where: { id } });
    if (!promocion) {
      return res.status(404).json({ status: 'error', message: 'Promoción no encontrada', data: null });
    }

    // Validar fechas si vienen
    if (fecha_inicio && fecha_fin) {
      const inicio = new Date(fecha_inicio);
      const fin = new Date(fecha_fin);
      if (fin <= inicio) {
        return res.status(400).json({ status: 'error', message: 'fecha_fin debe ser posterior a fecha_inicio', data: null });
      }
    }

    // Si hay productos, validar
    if (productos && Array.isArray(productos)) {
      const principales = productos.filter(p => p.es_principal === true);
      if (principales.length > 1) {
        return res.status(400).json({ status: 'error', message: 'Solo puede haber un producto principal', data: null });
      }

      for (const prod of productos) {
        const producto = await prisma.producto.findUnique({ where: { id_producto: prod.id_producto } });
        if (!producto) {
          return res.status(400).json({ status: 'error', message: `Producto ${prod.id_producto} no existe`, data: null });
        }
      }
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar promoción
      const actualizado = await tx.promocion.update({
        where: { id },
        data: {
          nombre: nombre ?? promocion.nombre,
          descripcion: typeof descripcion === 'undefined' ? promocion.descripcion : descripcion,
          descripcion_corta: typeof descripcion_corta === 'undefined' ? promocion.descripcion_corta : descripcion_corta,
          precio_original: typeof precio_original === 'undefined' ? promocion.precio_original : (precio_original ? Number(precio_original) : null),
          precio_promocional: typeof precio_promocional === 'undefined' ? promocion.precio_promocional : (precio_promocional ? Number(precio_promocional) : null),
          porcentaje_descuento: typeof porcentaje_descuento === 'undefined' ? promocion.porcentaje_descuento : (porcentaje_descuento ? Number(porcentaje_descuento) : null),
          fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : promocion.fecha_inicio,
          fecha_fin: fecha_fin ? new Date(fecha_fin) : promocion.fecha_fin,
          stock_disponible: typeof stock_disponible === 'undefined' ? promocion.stock_disponible : Number(stock_disponible),
          cantidad_maxima_cliente: typeof cantidad_maxima_cliente === 'undefined' ? promocion.cantidad_maxima_cliente : (cantidad_maxima_cliente ? Number(cantidad_maxima_cliente) : null),
          destacado: typeof destacado === 'undefined' ? promocion.destacado : Boolean(destacado),
          activo: typeof activo === 'undefined' ? promocion.activo : Boolean(activo)
        }
      });

      // Si vienen productos, actualizar
      if (productos && Array.isArray(productos)) {
        // Eliminar productos anteriores
        await tx.promocion_producto.deleteMany({ where: { id_promocion: id } });

        // Crear nuevos
        for (const prod of productos) {
          await tx.promocion_producto.create({
            data: {
              id_promocion: id,
              id_producto: prod.id_producto,
              cantidad: Number(prod.cantidad),
              es_principal: Boolean(prod.es_principal),
              orden: prod.orden ? Number(prod.orden) : null
            }
          });
        }
      }

      return actualizado;
    });

    return res.json({ status: 'success', message: 'Promoción actualizada correctamente', data: resultado });
  } catch (err) {
    next(err);
  }
};

export const eliminarPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de promoción es requerido', data: null });

    const promocion = await prisma.promocion.findUnique({ where: { id } });
    if (!promocion) {
      return res.status(404).json({ status: 'error', message: 'Promoción no encontrada', data: null });
    }

    if (promocion.activo === false) {
      return res.status(409).json({ status: 'error', message: 'La promoción ya está inactiva', data: null });
    }

    await prisma.promocion.update({ where: { id }, data: { activo: false } });

    return res.json({ status: 'success', message: 'Promoción desactivada correctamente', data: { id } });
  } catch (err) {
    next(err);
  }
};

export const incrementarVendida = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body;

    if (!id) return res.status(400).json({ status: 'error', message: 'ID de promoción es requerido', data: null });
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ status: 'error', message: 'Cantidad debe ser mayor a 0', data: null });
    }

    const promocion = await prisma.promocion.findUnique({ where: { id } });
    if (!promocion) {
      return res.status(404).json({ status: 'error', message: 'Promoción no encontrada', data: null });
    }

    if (!promocion.activo) {
      return res.status(400).json({ status: 'error', message: 'La promoción no está activa', data: null });
    }

    if (promocion.stock_disponible < cantidad) {
      return res.status(400).json({ status: 'error', message: 'Stock insuficiente', data: null });
    }

    const nuevoStock = promocion.stock_disponible - cantidad;
    const nuevaCantidadVendida = (promocion.cantidad_vendida || 0) + cantidad;

    const actualizado = await prisma.promocion.update({
      where: { id },
      data: {
        cantidad_vendida: nuevaCantidadVendida,
        stock_disponible: nuevoStock,
        activo: nuevoStock > 0 ? promocion.activo : false
      }
    });

    return res.json({
      status: 'success',
      message: 'Venta registrada correctamente',
      data: {
        cantidad_vendida: actualizado.cantidad_vendida,
        stock_disponible: actualizado.stock_disponible,
        activo: actualizado.activo
      }
    });
  } catch (err) {
    next(err);
  }
};

export default null;
