// src/controllers/compras.controller.js
// 🔵 PERSONA 1: Módulo F2 - Gestión de Órdenes de Compra

import prisma from '../config/database.js';

/**
 * GET /api/v1/compras
 * F2.4.1 - Consulta general de órdenes de compra
 */
export const listarCompras = async (req, res, next) => {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        proveedor: true,
        detalles: {
          include: { producto: true }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
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
    const id = Number(req.params.id);

    if (isNaN(id)) {
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
        detalles: {
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
          proveedor ? { proveedorId: Number(proveedor) } : {},
          estado ? { estado } : {},
          fechaDesde ? { fecha_creacion: { gte: new Date(fechaDesde) } } : {},
          fechaHasta ? { fecha_creacion: { lte: new Date(fechaHasta) } } : {}
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
 * Llama a: sp_compra_insertar
 */
export const crearCompra = async (req, res, next) => {
  try {
    const { proveedorId, detalles } = req.body;

    // E5: Datos obligatorios
    if (!proveedorId || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Proveedor y al menos un producto son requeridos',
        data: null
      });
    }

    // Validación de detalles
    for (const item of detalles) {
      if (!item.productoId) {
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

    // TODO:
    // 1. Validar proveedor activo (E2)
    // 2. Validar productos existentes (E3)
    // 3. Llamar a sp_compra_insertar

    return res.status(201).json({
      status: 'success',
      message: 'Orden de compra creada correctamente',
      data: null
    });
  } catch (err) {
    // E1: Desconexión
    next(err);
  }
};

/**
 * PUT /api/v1/compras/:id
 * F2.2 - Actualización de orden de compra
 * Llama a: sp_compra_actualizar
 */
export const actualizarCompra = async (req, res, next) => {
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

    const compra = await prisma.compra.findUnique({
      where: { id_compra: id }
    });

    // E2: Orden inexistente
    if (!compra) {
      return res.status(404).json({
        status: 'error',
        message: 'La orden no existe',
        data: null
      });
    }

    // E3: Orden no editable
    if (compra.estado !== 'ACT') {
      return res.status(409).json({
        status: 'error',
        message: 'La orden no puede modificarse',
        data: null
      });
    }

    // TODO:
    // Validar productos (E4)
    // Llamar a sp_compra_actualizar

    return res.json({
      status: 'success',
      message: 'Orden de compra actualizada correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/compras/:id
 * F2.3 - Anulación de orden de compra
 * Llama a: sp_compra_anular
 */
export const anularCompra = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID inválido',
        data: null
      });
    }

    const compra = await prisma.compra.findUnique({
      where: { id_compra: id }
    });

    // E2: Orden inexistente
    if (!compra) {
      return res.status(404).json({
        status: 'error',
        message: 'La orden no existe',
        data: null
      });
    }

    // E3: Orden ya anulada
    if (compra.estado === 'ANU') {
      return res.status(409).json({
        status: 'error',
        message: 'La orden ya se encuentra anulada',
        data: null
      });
    }

    // TODO: Llamar a sp_compra_anular

    return res.json({
      status: 'success',
      message: 'Orden de compra anulada correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
