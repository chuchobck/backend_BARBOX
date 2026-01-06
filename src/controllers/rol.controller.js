
import prisma from '../config/database.js';

// =============================================
// CRUD ROLES
// =============================================

/**
 * GET /api/v1/roles
 * Listar todos los roles
 */
export const listarRoles = async (req, res, next) => {
  try {
    const roles = await prisma.rol.findMany({
      where: { estado: 'ACT' },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { empleado: true }
        }
      }
    });

    res.json({
      status: 'success',
      message: 'Roles obtenidos exitosamente',
      data: roles
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/roles/:id
 * Obtener un rol por ID
 */
export const obtenerRol = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.findUnique({
      where: { id_rol: parseInt(id) },
      include: {
        _count: {
          select: { empleado: true }
        }
      }
    });

    if (!rol) {
      return res.status(404).json({
        status: 'error',
        message: 'Rol no encontrado'
      });
    }

    res.json({
      status: 'success',
      message: 'Rol obtenido exitosamente',
      data: rol
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/roles
 * Crear un nuevo rol
 */
export const crearRol = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        status: 'error',
        message: 'nombre es requerido'
      });
    }

    const rol = await prisma.rol.create({
      data: {
        nombre,
        descripcion,
        estado: 'ACT'
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Rol creado exitosamente',
      data: rol
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/roles/:id
 * Actualizar un rol
 */
export const actualizarRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (estado !== undefined) data.estado = estado;

    const rol = await prisma.rol.update({
      where: { id_rol: parseInt(id) },
      data
    });

    res.json({
      status: 'success',
      message: 'Rol actualizado exitosamente',
      data: rol
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/roles/:id
 * Eliminar un rol (soft delete)
 */
export const eliminarRol = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.update({
      where: { id_rol: parseInt(id) },
      data: { estado: 'INA' }
    });

    res.json({
      status: 'success',
      message: 'Rol desactivado exitosamente',
      data: rol
    });
  } catch (err) {
    next(err);
  }
};