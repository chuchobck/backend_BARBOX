// src/controllers/favoritos.controller.js
import prisma from '../config/database.js';

/**
 * Listar favoritos de un usuario
 * GET /api/v1/favoritos?usuarioId=123
 */
export const listarFavoritos = async (req, res, next) => {
  try {
    const usuarioId = parseInt(req.query.usuarioId);
    if (!usuarioId) {
      return res.status(400).json({ status: 'error', message: 'UsuarioId requerido', data: null });
    }

    const favoritos = await prisma.producto_favorito.findMany({
      where: { id_usuario: usuarioId, estado: 'ACT' },
      include: { 
        producto: {
          include: {
            marca: {
              select: {
                id_marca: true,
                nombre: true
              }
            },
            categoria_producto: {
              select: {
                id_categoria_producto: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        }
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json({ status: 'success', message: 'Favoritos obtenidos', data: favoritos });
  } catch (err) {
    next(err);
  }
};

/**
 * Agregar producto a favoritos
 * POST /api/v1/favoritos
 * Body: { usuarioId: 1, productoId: "PRO0001" }
 */
export const agregarFavorito = async (req, res, next) => {
  try {
    const { usuarioId, productoId } = req.body;
    if (!usuarioId || !productoId) {
      return res.status(400).json({ status: 'error', message: 'usuarioId y productoId son requeridos', data: null });
    }

    // Evitar duplicados
    const existente = await prisma.producto_favorito.findFirst({
      where: { id_usuario: usuarioId, id_producto: productoId }
    });

    if (existente) {
      if (existente.estado === 'ACT') {
        return res.status(409).json({ status: 'error', message: 'Producto ya está en favoritos', data: null });
      }
      // Reactivar si estaba inactivo
      const reactivar = await prisma.producto_favorito.update({
        where: { id_favorito: existente.id_favorito },
        data: { estado: 'ACT', fecha_creacion: new Date() }
      });
      return res.json({ status: 'success', message: 'Producto reactivado en favoritos', data: reactivar });
    }

    const favorito = await prisma.producto_favorito.create({
      data: { id_usuario: usuarioId, id_producto: productoId }
    });

    res.status(201).json({ status: 'success', message: 'Producto agregado a favoritos', data: favorito });
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminar favorito
 * DELETE /api/v1/favoritos/:id_favorito
 */
export const eliminarFavorito = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id_favorito);
    if (!id) {
      return res.status(400).json({ status: 'error', message: 'id_favorito es requerido', data: null });
    }

    await prisma.producto_favorito.delete({ where: { id_favorito: id } });

    res.json({ status: 'success', message: 'Producto eliminado de favoritos', data: null });
  } catch (err) {
    next(err);
  }
};
