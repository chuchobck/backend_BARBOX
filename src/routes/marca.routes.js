import { Router } from 'express';
import {
  listarMarcas,
  obtenerMarca,
  crearMarca,
  actualizarMarca,
  eliminarMarca
} from '../controllers/marca.controller.js';

const router = Router();

router.get('/', listarMarcas);
router.get('/:id', obtenerMarca);
router.post('/', crearMarca);
router.put('/:id', actualizarMarca);
router.delete('/:id', eliminarMarca);

export default router;
