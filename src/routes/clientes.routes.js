// src/routes/clientes.routes.js - Rutas de clientes
// 🟢 PERSONA 2: Módulo F4

import { Router } from 'express';
import {
  listarClientes,
  obtenerCliente,
  buscarClientes,
  buscarPorCedula,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../controllers/clientes.controller.js';
import { verificarToken, verificarTokenOpcional } from '../middleware/auth.js';
import { adminOPos, soloPropiosDatos } from '../middleware/validateRole.js';

const router = Router();

// GET /api/v1/clientes - Listar todos (Admin y POS)
router.get('/', verificarToken, adminOPos, listarClientes);

// GET /api/v1/clientes/buscar?nombre=&cedula=&ciudad= - Buscar (Admin)
router.get('/buscar', verificarToken, adminOPos, buscarClientes);

// GET /api/v1/clientes/cedula/:cedula - Buscar por cédula (Admin, POS)
router.get('/cedula/:cedula', verificarToken, adminOPos, buscarPorCedula);

// GET /api/v1/clientes/:id - Obtener por ID (Admin, Cliente propio, POS)
router.get('/:id', verificarToken, soloPropiosDatos('id'), obtenerCliente);

// POST /api/v1/clientes - Crear cliente (Admin, E-commerce registro, POS)
router.post('/', verificarTokenOpcional, crearCliente);

// PUT /api/v1/clientes/:id - Actualizar (Admin, Cliente propio)
router.put('/:id', verificarToken, soloPropiosDatos('id'), actualizarCliente);

// DELETE /api/v1/clientes/:id - Eliminar lógico (Solo Admin)
router.delete('/:id', verificarToken, adminOPos, eliminarCliente);

export default router;
