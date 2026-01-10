// src/routes/canal-venta.routes.js
// Rutas para gestión de Canales de Venta

import { Router } from 'express';
import {
  listarCanalesVenta,
  obtenerCanalVenta,
  crearCanalVenta,
  actualizarCanalVenta,
  eliminarCanalVenta
} from '../controllers/canal-venta.controller.js';
import { verificarToken } from '../middleware/auth.js';
import { soloAdmin } from '../middleware/validateRole.js';

const router = Router();

// GET /api/v1/canales-venta - Listar canales activos (público)
router.get('/', listarCanalesVenta);

// GET /api/v1/canales-venta/:id - Obtener canal por ID (público)
router.get('/:id', obtenerCanalVenta);

// POST /api/v1/canales-venta - Crear canal (Admin)
router.post('/', verificarToken, soloAdmin, crearCanalVenta);

// PUT /api/v1/canales-venta/:id - Actualizar canal (Admin)
router.put('/:id', verificarToken, soloAdmin, actualizarCanalVenta);

// DELETE /api/v1/canales-venta/:id - Desactivar canal (Admin)
router.delete('/:id', verificarToken, soloAdmin, eliminarCanalVenta);

export default router;
