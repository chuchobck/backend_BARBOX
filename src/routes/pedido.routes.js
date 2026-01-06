import express from 'express';
import { crearPedido } from '../controllers/pedido.controller.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// 🔐 Ruta protegida: requiere autenticación
router.post('/', verificarToken, crearPedido);

export default router;
