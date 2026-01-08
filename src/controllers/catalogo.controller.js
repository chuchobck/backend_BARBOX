import prisma from '../lib/prisma.js';

// ========== CATEGORÍAS ==========
export const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await prisma.categoria_producto.findMany({
      where: { activo: true },
      select: {
        id_categoria_producto: true,
        nombre: true,
        activo: true
      }
    });

    res.json({ success: true, data: categorias });
  } catch (error) {
    next(error);
  }
};

export const obtenerCategoria = async (req, res, next) => {
  try {
    const categoria = await prisma.categoria_producto.findUnique({
      where: { id_categoria_producto: parseInt(req.params.id) }
    });

    if (!categoria) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: categoria });
  } catch (error) {
    next(error);
  }
};

// ========== MARCAS ==========
export const listarMarcas = async (req, res, next) => {
  try {
    const marcas = await prisma.marca.findMany({
      where: { estado: 'ACT' },
      orderBy: { nombre: 'asc' }
    });

    res.json({ success: true, data: marcas });
  } catch (error) {
    next(error);
  }
};

// ========== PRODUCTOS ==========
export const listarProductos = async (req, res, next) => {
  try {
    // (tu lógica de filtros aquí)
    const productos = await prisma.producto.findMany({
      where: { estado: 'ACT' }
    });

    res.json({ success: true, data: productos });
  } catch (error) {
    next(error);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id_producto: parseInt(req.params.id) }
    });

    if (!producto) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: producto });
  } catch (error) {
    next(error);
  }
};

// ========== FILTROS ==========
export const obtenerFiltros = async (req, res, next) => {
  try {
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ========== DESTACADOS ==========
export const listarDestacados = async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

export const listarNuevos = async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};
