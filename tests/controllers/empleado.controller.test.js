import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRes } from '../utils/resMock.js';

// Import directo del controlador para validar ramas sin DB
const controller = await import('../../src/controllers/empleado.controller.js');

function mockReq({ params = {}, query = {}, body = {} } = {}) {
  return { params, query, body };
}

test('crearEmpleado faltan campos obligatorios retorna 400', async () => {
  const req = mockReq({ body: { nombre: 'A', apellido: 'B' } });
  const res = createRes();
  const next = () => {};
  await controller.crearEmpleado(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
});
