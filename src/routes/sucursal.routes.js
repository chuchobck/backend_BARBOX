import { Router } from 'express';
import {
  listarSucursales,
  buscarSucursales,
  obtenerSucursal,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
  listarPuntosRetiro
} from '../controllers/sucursal.controller.js';

const router = Router();

// Nota: Rutas específicas antes de /:id
router.get('/puntos-retiro', listarPuntosRetiro); // Para e-commerce
router.get('/buscar', buscarSucursales);
router.get('/', listarSucursales);
router.get('/:id', obtenerSucursal);
router.post('/', crearSucursal);
router.put('/:id', actualizarSucursal);
router.delete('/:id', eliminarSucursal);

export default router;
