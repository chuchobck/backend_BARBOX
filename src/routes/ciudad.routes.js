import { Router } from 'express';
import {
  listarCiudades,
  obtenerCiudad,
  crearCiudad,
  actualizarCiudad,
  eliminarCiudad
} from '../controllers/ciudad.controller.js';

const router = Router();

router.get('/', listarCiudades);
router.get('/:id', obtenerCiudad);
router.post('/', crearCiudad);
router.put('/:id', actualizarCiudad);
router.delete('/:id', eliminarCiudad);

export default router;
