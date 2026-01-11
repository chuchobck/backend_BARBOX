import { Router } from 'express';
import {
  listarRecepciones,
  buscarRecepciones,
  obtenerRecepcion,
  crearRecepcion,
  actualizarRecepcion,
  anularRecepcion,
  eliminarRecepcion
} from '../controllers/recepcion.controller.js';

const router = Router();

router.get('/buscar', buscarRecepciones);
router.get('/', listarRecepciones);
router.get('/:id', obtenerRecepcion);
router.post('/', crearRecepcion);
router.put('/:id', actualizarRecepcion);
router.post('/:id/anular', anularRecepcion);
router.delete('/:id', eliminarRecepcion);

export default router;
