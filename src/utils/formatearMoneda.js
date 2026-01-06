// src/utils/formatearMoneda.js - Utilidades de formato de moneda

/**
 * Formatea un número como moneda
 * @param {number} valor - Valor a formatear
 * @param {string} moneda - Código de moneda (default: USD)
 * @param {string} locale - Locale para formato (default: es-EC)
 * @returns {string} - Valor formateado (ej: '$1,234.56')
 */
export function formatearMoneda(valor, moneda = 'USD', locale = 'es-EC') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

/**
 * Redondea un valor a 2 decimales
 * @param {number} valor - Valor a redondear
 * @returns {number} - Valor redondeado
 */
export function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula el subtotal de una lista de items
 * @param {Array<{cantidad: number, precioUnit: number}>} items - Lista de items
 * @returns {number} - Subtotal
 */
export function calcularSubtotal(items) {
  return redondear(
    items.reduce((acc, item) => acc + (item.cantidad * item.precioUnit), 0)
  );
}

/**
 * Calcula el IVA
 * @param {number} subtotal - Subtotal
 * @param {number} porcentaje - Porcentaje de IVA (default: 15)
 * @returns {number} - Valor del IVA
 */
export function calcularIva(subtotal, porcentaje = 15) {
  return redondear(subtotal * (porcentaje / 100));
}

/**
 * Calcula el total (subtotal + IVA)
 * @param {number} subtotal - Subtotal
 * @param {number} porcentajeIva - Porcentaje de IVA (default: 15)
 * @returns {{subtotal: number, iva: number, total: number}}
 */
export function calcularTotales(subtotal, porcentajeIva = 15) {
  const iva = calcularIva(subtotal, porcentajeIva);
  const total = redondear(subtotal + iva);
  
  return {
    subtotal: redondear(subtotal),
    iva,
    total
  };
}
