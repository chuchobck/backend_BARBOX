// src/utils/generarCorrelativo.js - Generador de números correlativos

/**
 * Genera un número correlativo con formato
 * @param {string} prefijo - Prefijo del número (ej: 'FACT', 'OC', 'REC')
 * @param {number} secuencia - Número de secuencia
 * @param {number} padding - Cantidad de dígitos (default: 6)
 * @returns {string} - Número formateado (ej: 'FACT-2025-000123')
 */
export function generarCorrelativo(prefijo, secuencia, padding = 6) {
  const año = new Date().getFullYear();
  const secuenciaFormateada = String(secuencia).padStart(padding, '0');
  return `${prefijo}-${año}-${secuenciaFormateada}`;
}

/**
 * Genera número de factura
 * @param {number} secuencia - Número de secuencia
 * @returns {string} - Número de factura (ej: 'FACT-2025-000123')
 */
export function generarNumeroFactura(secuencia) {
  return generarCorrelativo('FACT', secuencia);
}

/**
 * Genera número de orden de compra
 * @param {number} secuencia - Número de secuencia
 * @returns {string} - Número de OC (ej: 'OC-2025-000045')
 */
export function generarNumeroOrdenCompra(secuencia) {
  return generarCorrelativo('OC', secuencia);
}

/**
 * Genera número de recepción de bodega
 * @param {number} secuencia - Número de secuencia
 * @returns {string} - Número de recepción (ej: 'REC-2025-000078')
 */
export function generarNumeroRecepcion(secuencia) {
  return generarCorrelativo('REC', secuencia);
}
