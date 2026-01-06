import { Router } from 'express';
import {
  listarUnidadesMedida,
  obtenerUnidadMedida,
  crearUnidadMedida,
  actualizarUnidadMedida,
  eliminarUnidadMedida
} from '../controllers/unidadMedida.controller.js';

const router = Router();

router.get('/', listarUnidadesMedida);
router.get('/:id', obtenerUnidadMedida);
router.post('/', crearUnidadMedida);
router.put('/:id', actualizarUnidadMedida);
router.delete('/:id', eliminarUnidadMedida);

export default router;
