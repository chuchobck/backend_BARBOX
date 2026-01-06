import { Router } from 'express';
import {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol
} from '../controllers/rol.controller.js';

const router = Router();

router.get('/', listarRoles);
router.get('/:id', obtenerRol);
router.post('/', crearRol);
router.put('/:id', actualizarRol);
router.delete('/:id', eliminarRol);

export default router;
