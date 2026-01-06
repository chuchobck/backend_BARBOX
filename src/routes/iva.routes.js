import { Router } from 'express';
import {
  listarIva,
  obtenerIvaActivo,
  obtenerIva,
  crearIva,
  actualizarIva,
  eliminarIva
} from '../controllers/iva.controller.js';

const router = Router();

router.get('/', listarIva);
router.get('/activo', obtenerIvaActivo);
router.get('/:id', obtenerIva);
router.post('/', crearIva);
router.put('/:id', actualizarIva);
router.delete('/:id', eliminarIva);

export default router;
