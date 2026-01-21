import prisma from '../lib/prisma.js';

// =============================================
// CRUD CATEGORÍAS DE PRODUCTOS
// =============================================

/**
 * GET /api/v1/categorias
 * Listar categorías de productos
 */
export const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await prisma.categoria_producto.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { producto: true, marca: true }
        }
      }
    });

    res.json({
      status: 'success',
      message: 'Categorías obtenidas exitosamente',
      data: categorias
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/categorias/:id
 * Obtener una categoría por ID
 */
export const obtenerCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria_producto.findUnique({
      where: { id_prod_categoria: parseInt(id) },
      include: {
        _count: {
          select: { producto: true, marca: true }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'Categoría obtenida exitosamente',
      data: categoria
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/categorias
 * Crear una nueva categoría
 */
export const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        status: 'error',
        message: 'nombre es requerido'
      });
    }

    const categoria = await prisma.categoria_producto.create({
      data: {
        nombre,
        descripcion,
        activo: true
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Categoría creada exitosamente',
      data: categoria
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/categorias/:id
 * Actualizar una categoría
 */
export const actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const data = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (activo !== undefined) data.activo = activo;

    const categoria = await prisma.categoria_producto.update({
      where: { id_prod_categoria: parseInt(id) },
      data
    });

    res.json({
      status: 'success',
      message: 'Categoría actualizada exitosamente',
      data: categoria
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/categorias/:id
 * Eliminar una categoría (soft delete)
 */
export const eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria_producto.update({
      where: { id_prod_categoria: parseInt(id) },
      data: { activo: false }
    });

    res.json({
      status: 'success',
      message: 'Categoría desactivada exitosamente',
      data: categoria
    });
  } catch (err) {
    next(err);
  }
};
