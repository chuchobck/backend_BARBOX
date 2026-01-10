import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRes } from '../utils/resMock.js';

// Import directo del controlador para validar ramas sin DB
const controller = await import('../../src/controllers/promocion.controller.js');

function mockReq({ params = {}, query = {}, body = {} } = {}) {
  return { params, query, body };
}

test('incrementarVendida con cantidad inválida retorna 400', async () => {
  const req = mockReq({ params: { id: 1 }, body: { cantidad: 0 } });
  const res = createRes();
  const next = () => {};
  await controller.incrementarVendida(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
});
