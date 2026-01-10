// src/controllers/canal-venta.controller.js
// CRUD para gestión de Canales de Venta

import prisma from '../lib/prisma.js';

/**
 * GET /api/v1/canales-venta
 * Listar todos los canales de venta activos
 */
export const listarCanalesVenta = async (req, res, next) => {
  try {
    const canales = await prisma.canal_venta.findMany({
      where: { estado: 'ACT' },
      select: {
        id_canal: true,
        descripcion: true,
        estado: true
      },
      orderBy: { descripcion: 'asc' }
    });

    if (canales.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No existen canales de venta registrados',
        data: []
      });
    }

    res.json({
      status: 'success',
      message: 'Canales de venta obtenidos correctamente',
      data: canales
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/canales-venta/:id
 * Obtener un canal de venta por ID
 */
export const obtenerCanalVenta = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de canal es requerido',
        data: null
      });
    }

    const canal = await prisma.canal_venta.findUnique({
      where: { id_canal: id },
      select: {
        id_canal: true,
        descripcion: true,
        estado: true
      }
    });

    if (!canal) {
      return res.status(404).json({
        status: 'error',
        message: 'Canal de venta no encontrado',
        data: null
      });
    }

    res.json({
      status: 'success',
      message: 'Canal de venta obtenido correctamente',
      data: canal
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/canales-venta
 * Crear un nuevo canal de venta
 */
export const crearCanalVenta = async (req, res, next) => {
  try {
    const { id_canal, descripcion } = req.body;

    // Validaciones
    if (!id_canal) {
      return res.status(400).json({
        status: 'error',
        message: 'ID del canal es requerido',
        data: null
      });
    }

    if (id_canal.length !== 3) {
      return res.status(400).json({
        status: 'error',
        message: 'ID del canal debe tener exactamente 3 caracteres',
        data: null
      });
    }

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Descripción del canal es requerida',
        data: null
      });
    }

    // Verificar que el canal no exista
    const canalExistente = await prisma.canal_venta.findUnique({
      where: { id_canal }
    });

    if (canalExistente) {
      return res.status(409).json({
        status: 'error',
        message: 'El canal ya existe',
        data: null
      });
    }

    // Crear el canal
    const nuevoCanal = await prisma.canal_venta.create({
      data: {
        id_canal: id_canal.toUpperCase(),
        descripcion: descripcion.trim(),
        estado: 'ACT'
      },
      select: {
        id_canal: true,
        descripcion: true,
        estado: true
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Canal de venta creado correctamente',
      data: nuevoCanal
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/canales-venta/:id
 * Actualizar un canal de venta
 */
export const actualizarCanalVenta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de canal es requerido',
        data: null
      });
    }

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Descripción del canal es requerida',
        data: null
      });
    }

    // Verificar que el canal existe
    const canal = await prisma.canal_venta.findUnique({
      where: { id_canal: id }
    });

    if (!canal) {
      return res.status(404).json({
        status: 'error',
        message: 'Canal de venta no encontrado',
        data: null
      });
    }

    // Actualizar el canal
    const canalActualizado = await prisma.canal_venta.update({
      where: { id_canal: id },
      data: {
        descripcion: descripcion.trim()
      },
      select: {
        id_canal: true,
        descripcion: true,
        estado: true
      }
    });

    res.json({
      status: 'success',
      message: 'Canal de venta actualizado correctamente',
      data: canalActualizado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/canales-venta/:id
 * Eliminar (desactivar) un canal de venta
 */
export const eliminarCanalVenta = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de canal es requerido',
        data: null
      });
    }

    // Verificar que el canal existe
    const canal = await prisma.canal_venta.findUnique({
      where: { id_canal: id }
    });

    if (!canal) {
      return res.status(404).json({
        status: 'error',
        message: 'Canal de venta no encontrado',
        data: null
      });
    }

    // Validar que NO esté ya inactivo
    if (canal.estado === 'INA') {
      return res.status(400).json({
        status: 'error',
        message: 'El canal de venta ya se encuentra desactivado',
        data: null
      });
    }

    // Actualizar estado a INA
    const canalDesactivado = await prisma.canal_venta.update({
      where: { id_canal: id },
      data: { estado: 'INA' },
      select: {
        id_canal: true,
        descripcion: true,
        estado: true
      }
    });

    res.json({
      status: 'success',
      message: 'Canal de venta desactivado correctamente',
      data: canalDesactivado
    });
  } catch (err) {
    next(err);
  }
};
