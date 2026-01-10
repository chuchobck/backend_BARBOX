import { Router } from 'express';
import {
  listarAjustes,
  buscarAjustes,
  obtenerAjuste,
  crearAjuste,
  anularAjuste
} from '../controllers/ajusteInventario.controller.js';

const router = Router();

// Nota: /buscar antes de /:id
router.get('/buscar', buscarAjustes);
router.get('/', listarAjustes);
router.get('/:id', obtenerAjuste);
router.post('/', crearAjuste);
router.post('/:id/anular', anularAjuste);

export default router;
