import { Router } from 'express';
import { crearPago, obtenerPagosPorUsuario, pagarConTarjeta } from '../controllers/pago.controller.js';

const router = Router();

router.post('/', crearPago);
router.post('/tarjeta', pagarConTarjeta);
router.get('/', obtenerPagosPorUsuario);

export default router;
