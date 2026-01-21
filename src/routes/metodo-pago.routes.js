// src/routes/metodo-pago.routes.js
// Rutas para gestión de Métodos de Pago

import { Router } from 'express';
import {
  listarMetodosPago,
  obtenerMetodoPago,
  buscarMetodosPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
  listarMetodosPagoWeb
} from '../controllers/metodo-pago.controller.js';
import { verificarToken } from '../middleware/auth.js';
import { soloAdmin } from '../middleware/validateRole.js';

const router = Router();

// Rutas públicas (para e-commerce)
router.get('/disponibles-web', listarMetodosPagoWeb); // Para checkout
router.get('/buscar', buscarMetodosPago);
router.get('/', listarMetodosPago);
router.get('/:id', obtenerMetodoPago);

// Rutas protegidas (Admin)
router.post('/', verificarToken, soloAdmin, crearMetodoPago);
router.put('/:id', verificarToken, soloAdmin, actualizarMetodoPago);
router.delete('/:id', verificarToken, soloAdmin, eliminarMetodoPago);

export default router;
