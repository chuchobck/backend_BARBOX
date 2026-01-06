// src/controllers/bodega.controller.js
// 🔵 PERSONA 1: Módulo F3 - Gestión de Bodega (Recepciones)

import prisma from '../config/database.js';

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
 * Llama a: sp_recepcion_registrar ⭐ CRÍTICO
 */
export const registrarRecepcion = async (req, res, next) => {
  try {
    const { compraId, detalles } = req.body;

    // E6: Datos faltantes
    if (!compraId || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Orden de compra y productos son requeridos',
        data: null
      });
    }

    // Validar cantidades
    for (const item of detalles) {
      if (!item.productoId || !item.cantidad) {
        return res.status(400).json({
          status: 'error',
          message: 'Datos incompletos en los productos',
          data: null
        });
      }

      if (item.cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cantidad incorrecta',
          data: null
        });
      }
    }

    // TODO (SP):
    // E2: Validar orden existente
    // E4: Validar orden NO anulada
    // E5: Validar que no exceda lo solicitado
    // SP sp_recepcion_registrar:
    // 1. Inserta cabecera
    // 2. Inserta detalle
    // 3. Suma stock
    // 4. Actualiza estado de orden (PAR / CER)

    return res.status(201).json({
      status: 'success',
      message: 'Ingreso de bodega registrado. Inventario actualizado.',
      data: null
    });
  } catch (err) {
    // E1: Desconexión
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
    const id = Number(req.params.id);

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

    // E3: Ingreso anulado
    if (!recepcion) {
      return res.status(404).json({
        status: 'error',
        message: 'No existe el ingreso de bodega',
        data: null
      });
    }

    if (recepcion.estado === 'ANU') {
      return res.status(409).json({
        status: 'error',
        message: 'El ingreso ya se encuentra anulado',
        data: null
      });
    }

    // TODO:
    // sp_recepcion_anular:
    // 1. Validar stock no negativo
    // 2. Revertir inventario
    // 3. Marcar recepción ANU
    // 4. Recalcular estado de orden

    return res.json({
      status: 'success',
      message: 'Ingreso de bodega anulado. Inventario revertido.',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
