// src/routes/productos.routes.js - Rutas de productos

import { Router } from 'express';
import {
  listarProductos,
  obtenerProducto,
  buscarProductos,
  productosPorCategoria,
  productosEnPromocion,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  ajustarStock
} from '../controllers/productos.controller.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// ========== RUTAS PÚBL  ICAS (E-commerce) ==========

// GET /api/v1/productos - Listar productos activos (público)
router.get('/', listarProductos);

// GET /api/v1/productos/buscar?nombre=&codigo= - Buscar productos (público)
router.get('/buscar', buscarProductos);

// GET /api/v1/productos/categoria/:id - Productos por categoría (público)
router.get('/categoria/:id', productosPorCategoria);

// GET /api/v1/productos/promociones - Productos en promoción (público)
router.get('/promociones', productosEnPromocion);

// GET /api/v1/productos/:id - Obtener producto por ID (público)
router.get('/:id', obtenerProducto);

// ========== RUTAS PROTEGIDAS ==========

// POST /api/v1/productos - Crear producto (requiere auth)
router.post('/', verificarToken, crearProducto);

// PUT /api/v1/productos/:id - Actualizar producto (requiere auth)
router.put('/:id', verificarToken, actualizarProducto);

// DELETE /api/v1/productos/:id - Eliminar lógico (requiere auth)
router.delete('/:id', verificarToken, eliminarProducto);

// POST /api/v1/productos/:id/ajustar-stock - Ajuste manual de inventario (requiere auth)
router.post('/:id/ajustar-stock', verificarToken, ajustarStock);

export default router;
