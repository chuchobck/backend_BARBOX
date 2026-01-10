import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express from 'express';
// Crear una app mínima para montar solo las rutas de promociones
import promocionesRoutes from '../../src/routes/promociones.routes.js';
const app = express();
app.use(express.json());
app.use('/api/v1/promociones', promocionesRoutes);

test('GET /api/v1/promociones/buscar sin filtros retorna 400', async () => {
  const res = await request(app).get('/api/v1/promociones/buscar');
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
});
