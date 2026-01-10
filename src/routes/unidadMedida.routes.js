import { Router } from 'express';
import {
  listarUnidadesMedida,
  obtenerUnidadMedida,
  crearUnidadMedida,
  actualizarUnidadMedida
} from '../controllers/unidadMedida.controller.js';

const router = Router();

router.get('/', listarUnidadesMedida);
router.get('/:id', obtenerUnidadMedida);
router.post('/', crearUnidadMedida);
router.put('/:id', actualizarUnidadMedida);

export default router;
