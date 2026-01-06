// 🟢 carrito.routes.ts
import { Router } from 'express';
import {
  obtenerCarritoUsuario,
  obtenerCarritoPorId,
  crearCarrito,
  agregarProductoCarrito,
  actualizarCantidadProducto,
  eliminarProductoCarrito,
  vaciarCarrito
} from '../controllers/carrito.controller.js';

const router = Router();

// 🔹 Obtener carrito de un usuario
// GET /api/v1/carrito?usuarioId=1
router.get('/', obtenerCarritoUsuario);

// 🔹 Obtener carrito por id de carrito
// GET /api/v1/carrito/:id_carrito
router.get('/:id_carrito', obtenerCarritoPorId);

// 🔹 Crear carrito vacío para un usuario
// POST /api/v1/carrito
router.post('/', crearCarrito);

// 🔹 Agregar producto al carrito
// POST /api/v1/carrito/:id_carrito/productos
router.post('/:id_carrito/productos', agregarProductoCarrito);

// 🔹 Actualizar cantidad de producto en carrito
// PUT /api/v1/carrito/:id_carrito/productos/:id_producto
router.put('/:id_carrito/productos/:id_producto', actualizarCantidadProducto);

// 🔹 Eliminar producto del carrito
// DELETE /api/v1/carrito/:id_carrito/productos/:id_producto
router.delete('/:id_carrito/productos/:id_producto', eliminarProductoCarrito);

// 🔹 Vaciar carrito completo
// DELETE /api/v1/carrito/:id_carrito
router.delete('/:id_carrito', vaciarCarrito);

export default router;
