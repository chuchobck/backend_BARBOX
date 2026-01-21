// src/controllers/bodega.controller.js
// 🔵 PERSONA 1: Módulo F3 - Gestión de Bodega (Recepciones)

import prisma from '../lib/prisma.js';

/**
 * GET /api/v1/bodega/recepciones
 * F3.4.1 - Consulta general de bodega
 */
export const listarRecepciones = async (req, res, next) => {
  try {
    const recepciones = await prisma.recepcion.findMany({
      include: {
        compra: true,
        detalles: {
          include: { producto: true }
        }
      },
      orderBy: { fecha_recepcion: 'desc' }
    });

    return res.json({
      status: 'success',
      message: 'Recepciones obtenidas',
      data: recepciones
    });
  } catch (err) {
    // E1: Desconexión
    next(err);
  }
};

/**
 * GET /api/v1/bodega/recepciones/:id
 * Obtener recepción con detalle
 */
export const obtenerRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID inválido',
        data: null
      });
    }

    const recepcion = await prisma.recepcion.findUnique({
      where: { id_recepcion: id },
      include: {
        compra: true,
        detalles: {
          include: { producto: true }
        }
      }
    });

    // E2: Ingreso inexistente
    if (!recepcion) {
      return res.status(404).json({
        status: 'error',
        message: 'No existe el ingreso de bodega',
        data: null
      });
    }

    return res.json({
      status: 'success',
      message: 'Recepción obtenida',
      data: recepcion
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/bodega/recepciones/buscar
 * F3.4.2 - Consulta de bodega por parámetros
 */
export const buscarRecepciones = async (req, res, next) => {
  try {
    const { compra, fechaDesde, fechaHasta } = req.query;

    // E5: Parámetros faltantes
    if (!compra && !fechaDesde && !fechaHasta) {
      return res.status(400).json({
        status: 'error',
        message: 'Ingrese al menos un criterio de búsqueda',
        data: null
      });
    }

    const recepciones = await prisma.recepcion.findMany({
      where: {
        AND: [
          compra ? { compraId: Number(compra) } : {},
          fechaDesde ? { fecha_recepcion: { gte: new Date(fechaDesde) } } : {},
          fechaHasta ? { fecha_recepcion: { lte: new Date(fechaHasta) } } : {}
        ]
      },
      include: { compra: true }
    });

    // E6: Sin resultados
    if (recepciones.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontraron ingresos de bodega',
        data: []
      });
    }

    return res.json({
      status: 'success',
      message: 'Búsqueda completada',
      data: recepciones
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/bodega/recepciones
 * F3.1 - Ingreso de bodega
 * 
 * REFACTORIZADO: Usa fn_ingresar_recepcion() de la BD
 */
export const registrarRecepcion = async (req, res, next) => {
  try {
    const { id_compra, detalles } = req.body;
    const id_empleado = req.usuario?.id_empleado || null;

    // Validación mínima en Node.js
    if (!id_compra || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'id_compra y detalles son requeridos',
        data: null
      });
    }

    // Validar estructura básica de detalles
    for (const item of detalles) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cada detalle debe tener id_producto y cantidad > 0',
          data: null
        });
      }
    }

    // 🔷 CONVERTIR DETALLES A JSON
    const detallesJson = JSON.stringify(detalles);

    // 🔷 LLAMAR FUNCIÓN DE BD: fn_ingresar_recepcion()
    const resultado = await prisma.$queryRaw`
      SELECT * FROM fn_ingresar_recepcion(
        ${Number(id_compra)}::INTEGER,
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

    // Validar si BD retornó error
    if (recepcion.error || recepcion.mensaje?.includes('Error')) {
      return res.status(400).json({
        status: 'error',
        message: recepcion.mensaje || 'Error al registrar recepción',
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

/**
 * PUT /api/v1/bodega/recepciones/:id
 * F3.2 - Actualización de bodega
 * Llama a: sp_recepcion_modificar
 */
export const modificarRecepcion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { detalles } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID inválido',
        data: null
      });
    }

    const recepcion = await prisma.recepcion.findUnique({
      where: { id_recepcion: id }
    });

    // E2: Ingreso inexistente
    if (!recepcion) {
      return res.status(404).json({
        status: 'error',
        message: 'No existe el ingreso de bodega',
        data: null
      });
    }

    // E3: Ingreso cerrado
    if (recepcion.estado === 'CER') {
      return res.status(409).json({
        status: 'error',
        message: 'El ingreso está cerrado y no puede modificarse',
        data: null
      });
    }

    // TODO:
    // E5: Validar cantidades
    // sp_recepcion_modificar:
    // 1. Revertir stock
    // 2. Aplicar nuevo stock
    // 3. Recalcular estado de la orden

    return res.json({
      status: 'success',
      message: 'Ingreso de bodega actualizado correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/bodega/recepciones/:id
 * F3.3 - Eliminación de bodega
 * Llama a: sp_recepcion_anular ⭐ CRÍTICO
 */
export const anularRecepcion = async (req, res, next) => {
  try {
    const id_recepcion = req.params.id;
    const { motivo_anulacion } = req.body;

    if (!id_recepcion) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de recepción es requerido',
        data: null
      });
    }

    // 1. Validar que la recepción existe
    const recepcion = await prisma.recepcion.findUnique({
      where: { id_recepcion: Number(id_recepcion) },
      include: {
        detalles: true,
        compra: {
          include: {
            detalles: true
          }
        }
      }
    });

    if (!recepcion) {
      return res.status(404).json({
        status: 'error',
        message: 'No existe el ingreso de bodega',
        data: null
      });
    }

    // 2. Validar que NO está ya anulada
    if (recepcion.estado === 'ANU') {
      return res.status(409).json({
        status: 'error',
        message: 'El ingreso ya se encuentra anulado',
        data: null
      });
    }

    // 3. Obtener todos los detalles de la recepción (ya están incluidos)
    // 4. Validar que al revertir el stock, ningún producto quedará en negativo
    for (const detalle of recepcion.detalles) {
      const producto = await prisma.producto.findUnique({
        where: { id_producto: detalle.id_producto },
        select: { ingresos: true }
      });

      if (!producto || producto.ingresos < detalle.cantidad) {
        return res.status(400).json({
          status: 'error',
          message: `No se puede revertir. Ingresos insuficientes para producto ${detalle.id_producto}`,
          data: null
        });
      }
    }

    // 5. Usar transacción para anular
    const resultado = await prisma.$transaction(async (tx) => {
      // a. Para cada detalle: decrementar ingresos y cantidad_recibida
      for (const detalle of recepcion.detalles) {
        // Decrementar 'ingresos' del producto
        await tx.producto.update({
          where: { id_producto: detalle.id_producto },
          data: {
            ingresos: {
              decrement: detalle.cantidad
            }
          }
        });

        // Encontrar el detalle_compra correspondiente y decrementar cantidad_recibida
        const detalleCompra = recepcion.compra.detalles.find(
          d => d.id_producto === detalle.id_producto
        );

        if (detalleCompra) {
          await tx.detalle_compra.update({
            where: { id_detalle_compra: detalleCompra.id_detalle_compra },
            data: {
              cantidad_recibida: {
                decrement: detalle.cantidad
              }
            }
          });
        }
      }

      // b. Actualizar recepción
      const recepcionAnulada = await tx.recepcion.update({
        where: { id_recepcion: Number(id_recepcion) },
        data: {
          estado: 'ANU',
          fecha_anulacion: new Date(),
          motivo_anulacion: motivo_anulacion || null
        }
      });

      // c. Recalcular estado de la orden
      const detallesActualizados = await tx.detalle_compra.findMany({
        where: { id_compra: recepcion.id_compra }
      });

      let nuevoEstado = 'PEN';

      const todosCompletos = detallesActualizados.every(
        d => d.cantidad_recibida >= d.cantidad
      );

      const algunoRecibido = detallesActualizados.some(
        d => d.cantidad_recibida > 0
      );

      if (todosCompletos) {
        nuevoEstado = 'CER';
      } else if (algunoRecibido) {
        nuevoEstado = 'PAR';
      }

      // Actualizar la orden
      const compraActualizada = await tx.compra.update({
        where: { id_compra: recepcion.id_compra },
        data: { estado: nuevoEstado }
      });

      return { recepcionAnulada, compraActualizada };
    });

    return res.json({
      status: 'success',
      message: 'Ingreso de bodega anulado. Inventario revertido.',
      data: {
        id_recepcion: resultado.recepcionAnulada.id_recepcion,
        estado: resultado.recepcionAnulada.estado,
        orden_compra_estado: resultado.compraActualizada.estado
      }
    });
  } catch (err) {
    next(err);
  }
};
