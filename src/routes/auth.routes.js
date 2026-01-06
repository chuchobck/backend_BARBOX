// src/routes/auth.routes.js - Rutas de autenticación
// 👤 PERSONA 3: Módulo Auth

import { Router } from 'express';
import {
  login,
  registro,
  perfil,
  actualizarPerfil,
  cambiarPassword
} from '../controllers/auth.controller.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// POST /api/v1/auth/login - Iniciar sesión
router.post('/login', login);

// POST /api/v1/auth/registro - Registro de cliente (E-commerce)
router.post('/registro', registro);

// GET /api/v1/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, perfil);

// PUT /api/v1/auth/actualizar-perfil - Actualizar datos del perfil
router.put('/actualizar-perfil', verificarToken, actualizarPerfil);

// PUT /api/v1/auth/cambiar-password - Cambiar contraseña
router.put('/cambiar-password', verificarToken, cambiarPassword);

export default router;
