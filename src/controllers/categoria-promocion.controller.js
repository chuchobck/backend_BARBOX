// src/controllers/categoria-promocion.controller.js
// CRUD para gestión de Categorías de Promoción

import prisma from '../lib/prisma.js';

/**
 * GET /api/v1/categorias-promocion
 * Listar todas las categorías de promoción activas
 */
export const listarCategoriasPromocion = async (req, res, next) => {
  try {
    const categorias = await prisma.categoria_promocion.findMany({
      where: { activo: true },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    });

    if (categorias.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No existen categorías de promoción registradas',
        data: []
      });
    }

    res.json({
      status: 'success',
      message: 'Categorías de promoción obtenidas correctamente',
      data: categorias
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/categorias-promocion/:id
 * Obtener una categoría de promoción por ID
 */
export const obtenerCategoriaPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de categoría de promoción inválido',
        data: null
      });
    }

    const categoria = await prisma.categoria_promocion.findUnique({
      where: { id }
    });

    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría de promoción no encontrada',
        data: null
      });
    }

    res.json({
      status: 'success',
      message: 'Categoría de promoción obtenida correctamente',
      data: categoria
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/categorias-promocion
 * Crear una nueva categoría de promoción
 */
export const crearCategoriaPromocion = async (req, res, next) => {
  try {
    const { nombre, descripcion, orden } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre de la categoría es requerido',
        data: null
      });
    }

    // Crear la categoría
    const nuevaCategoria = await prisma.categoria_promocion.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        orden: orden ? Number(orden) : null,
        activo: true
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Categoría de promoción creada correctamente',
      data: nuevaCategoria
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/categorias-promocion/:id
 * Actualizar una categoría de promoción
 */
export const actualizarCategoriaPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, orden } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de categoría de promoción inválido',
        data: null
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre de la categoría es requerido',
        data: null
      });
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria_promocion.findUnique({
      where: { id }
    });

    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría de promoción no encontrada',
        data: null
      });
    }

    // Actualizar la categoría
    const categoriaActualizada = await prisma.categoria_promocion.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        orden: orden ? Number(orden) : null
      }
    });

    res.json({
      status: 'success',
      message: 'Categoría de promoción actualizada correctamente',
      data: categoriaActualizada
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/categorias-promocion/:id
 * Eliminar (desactivar) una categoría de promoción
 */
export const eliminarCategoriaPromocion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de categoría de promoción inválido',
        data: null
      });
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria_promocion.findUnique({
      where: { id }
    });

    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría de promoción no encontrada',
        data: null
      });
    }

    // Validar que NO esté ya inactiva
    if (!categoria.activo) {
      return res.status(400).json({
        status: 'error',
        message: 'La categoría de promoción ya se encuentra desactivada',
        data: null
      });
    }

    // Actualizar activo a false
    const categoriaDesactivada = await prisma.categoria_promocion.update({
      where: { id },
      data: { activo: false }
    });

    res.json({
      status: 'success',
      message: 'Categoría de promoción desactivada correctamente',
      data: categoriaDesactivada
    });
  } catch (err) {
    next(err);
  }
};
