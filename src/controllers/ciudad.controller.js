import prisma from '../config/database.js';

// =============================================
// CRUD CIUDADES
// =============================================

/**
 * GET /api/v1/ciudades
 * Listar todas las ciudades
 */
export const listarCiudades = async (req, res, next) => {
  try {
    const ciudades = await prisma.ciudad.findMany({
      orderBy: { descripcion: 'asc' }
    });

    res.json({
      status: 'success',
      message: 'Ciudades obtenidas exitosamente',
      data: ciudades
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/ciudades/:id
 * Obtener una ciudad por ID
 */
export const obtenerCiudad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ciudad = await prisma.ciudad.findUnique({
      where: { id_ciudad: id }
    });

    if (!ciudad) {
      return res.status(404).json({
        status: 'error',
        message: 'Ciudad no encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'Ciudad obtenida exitosamente',
      data: ciudad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/ciudades
 * Crear una nueva ciudad
 */
export const crearCiudad = async (req, res, next) => {
  try {
    const { id_ciudad, descripcion } = req.body;

    if (!id_ciudad || !descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'id_ciudad y descripcion son requeridos'
      });
    }

    const ciudad = await prisma.ciudad.create({
      data: { id_ciudad, descripcion }
    });

    res.status(201).json({
      status: 'success',
      message: 'Ciudad creada exitosamente',
      data: ciudad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/ciudades/:id
 * Actualizar una ciudad
 */
export const actualizarCiudad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'descripcion es requerida'
      });
    }

    const ciudad = await prisma.ciudad.update({
      where: { id_ciudad: id },
      data: { descripcion }
    });

    res.json({
      status: 'success',
      message: 'Ciudad actualizada exitosamente',
      data: ciudad
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/ciudades/:id
 * Eliminar una ciudad
 */
export const eliminarCiudad = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.ciudad.delete({
      where: { id_ciudad: id }
    });

    res.json({
      status: 'success',
      message: 'Ciudad eliminada exitosamente'
    });
  } catch (err) {
    next(err);
  }
};