import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRes } from '../utils/resMock.js';

// Importar directamente el controlador (validaciones no requieren DB)
const controller = await import('../../src/controllers/sucursal.controller.js');

function mockReq({ params = {}, query = {}, body = {} } = {}) {
  return { params, query, body };
}

test('buscarSucursales sin filtros retorna 400', async () => {
  const req = mockReq({ query: {} });
  const res = createRes();
  const next = () => {};
  await controller.buscarSucursales(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
});

test('crearSucursal faltan campos obligatorios retorna 400', async () => {
  const req = mockReq({ body: { nombre: 'Sucursal 1' } });
  const res = createRes();
  const next = () => {};
  await controller.crearSucursal(req, res, next);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.status, 'error');
});
