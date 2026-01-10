import prisma from '../lib/prisma.js';


// =============================================
// CRUD UNIDADES DE MEDIDA
// =============================================

/**
 * GET /api/v1/unidades-medida
 * Listar unidades de medida
 */
export const listarUnidadesMedida = async (req, res, next) => {
  try {
    const unidades = await prisma.unidad_medida.findMany({
      orderBy: { descripcion: 'asc' }
    });

    res.json({
      status: 'success',
      message: 'Unidades de medida obtenidas exitosamente',
      data: unidades
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/unidades-medida/:id
 * Obtener una unidad de medida por ID
 */
export const obtenerUnidadMedida = async (req, res, next) => {
  try {
    const { id } = req.params;

    const unidad = await prisma.unidad_medida.findUnique({
      where: { id_unidad_medida: id }
    });

    if (!unidad) {
      return res.status(404).json({
        status: 'error',
        message: 'Unidad de medida no encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'Unidad de medida obtenida exitosamente',
      data: unidad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/unidades-medida
 * Crear una nueva unidad de medida
 */
export const crearUnidadMedida = async (req, res, next) => {
  try {
    const { id_unidad_medida, descripcion } = req.body;

    if (!id_unidad_medida || !descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'id_unidad_medida y descripcion son requeridos'
      });
    }

    const unidad = await prisma.unidad_medida.create({
      data: { id_unidad_medida, descripcion }
    });

    res.status(201).json({
      status: 'success',
      message: 'Unidad de medida creada exitosamente',
      data: unidad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/unidades-medida/:id
 * Actualizar una unidad de medida
 */
export const actualizarUnidadMedida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'descripcion es requerida'
      });
    }

    const unidad = await prisma.unidad_medida.update({
      where: { id_unidad_medida: id },
      data: { descripcion }
    });

    res.json({
      status: 'success',
      message: 'Unidad de medida actualizada exitosamente',
      data: unidad
    });
  } catch (err) {
    next(err);
  };

