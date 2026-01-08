// src/routes/catalogo.routes.js

import { Router } from 'express';
import {
  listarCategorias,
  obtenerCategoria,
  listarMarcas,
  listarProductos,
  obtenerProducto,
  obtenerFiltros,
  listarDestacados,
  listarNuevos
} from '../controllers/catalogo.controller.js';

const router = Router();

// ========== CATEGORÍAS ==========
router.get('/categorias', listarCategorias);
router.get('/categorias/:id', obtenerCategoria);

// ========== MARCAS ==========
router.get('/marcas', listarMarcas);

// ========== PRODUCTOS ==========
router.get('/productos', listarProductos);
router.get('/productos/:id', obtenerProducto);

// ========== FILTROS ==========
router.get('/filtros', obtenerFiltros);

// ========== DESTACADOS / NUEVOS ==========
router.get('/destacados', listarDestacados);
router.get('/nuevos', listarNuevos);

export default router;
