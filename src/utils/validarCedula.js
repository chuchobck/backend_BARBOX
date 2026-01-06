// src/utils/validarCedula.js - Validación de cédula ecuatoriana

/**
 * Valida una cédula ecuatoriana
 * @param {string} cedula - Cédula a validar (10 dígitos)
 * @returns {boolean} - true si es válida
 */
export function validarCedula(cedula) {
  // Verificar que tenga 10 dígitos
  if (!cedula || !/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Obtener los primeros 2 dígitos (código de provincia)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  
  // Verificar que la provincia sea válida (01-24 o 30 para extranjeros)
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  // Algoritmo de validación módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
    if (valor > 9) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula.charAt(9), 10);
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  return resultado === digitoVerificador;
}

/**
 * Valida un RUC ecuatoriano
 * @param {string} ruc - RUC a validar (13 dígitos)
 * @returns {boolean} - true si es válido
 */
export function validarRuc(ruc) {
  // Verificar que tenga 13 dígitos
  if (!ruc || !/^\d{13}$/.test(ruc)) {
    return false;
  }

  // Los primeros 10 dígitos deben ser una cédula válida
  const cedula = ruc.substring(0, 10);
  if (!validarCedula(cedula)) {
    return false;
  }

  // Los últimos 3 dígitos deben ser 001 (establecimiento principal)
  // o cualquier número para establecimientos adicionales
  const establecimiento = ruc.substring(10, 13);
  if (!/^\d{3}$/.test(establecimiento)) {
    return false;
  }

  return true;
}
