import { Router } from 'express';
import {
  listarAuditorias,
  obtenerAuditoria,
  buscarAuditorias,
  obtenerAuditoriasPorUsuario,
  obtenerAuditoriasPorTabla
} from '../controllers/auditoria.controller.js';

const router = Router();

router.get('/buscar', buscarAuditorias);
router.get('/usuario/:id_usuario', obtenerAuditoriasPorUsuario);
router.get('/tabla/:tabla', obtenerAuditoriasPorTabla);
router.get('/', listarAuditorias);
router.get('/:id', obtenerAuditoria);

export default router;
