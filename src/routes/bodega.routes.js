// src/routes/bodega.routes.js - Rutas de recepciones de bodega
// 🔵 PERSONA 1: Módulo F3

import { Router } from 'express';
import {
  listarRecepciones,
  obtenerRecepcion,
  buscarRecepciones,
  registrarRecepcion,
  modificarRecepcion,
  anularRecepcion
} from '../controllers/bodega.controller.js';
import { verificarToken } from '../middleware/auth.js';
import { soloAdmin } from '../middleware/validateRole.js';

const router = Router();

// Todas las rutas requieren autenticación y rol admin
router.use(verificarToken, soloAdmin);

// GET /api/v1/bodega/recepciones - Listar recepciones
router.get('/recepciones', listarRecepciones);

// GET /api/v1/bodega/recepciones/buscar?compra=&fecha= - Buscar recepciones
router.get('/recepciones/buscar', buscarRecepciones);

// GET /api/v1/bodega/recepciones/:id - Obtener recepción con detalle
router.get('/recepciones/:id', obtenerRecepcion);

// POST /api/v1/bodega/recepciones - Registrar recepción (actualiza stock)
router.post('/recepciones', registrarRecepcion);

// PUT /api/v1/bodega/recepciones/:id - Modificar recepción (solo ABIERTO)
router.put('/recepciones/:id', modificarRecepcion);

// DELETE /api/v1/bodega/recepciones/:id - Anular recepción (revierte stock)
router.delete('/recepciones/:id', anularRecepcion);

export default router;
