// src/middleware/validators.js - Validadores de entrada

/**
 * Validar que un campo no esté vacío
 */
export const validarNoVacio = (valor, campo) => {
  if (!valor || valor.trim() === '') {
    throw new Error(`${campo} es requerido`);
  }
};

/**
 * Validar email
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error('Email inválido');
  }
};

/**
 * Validar número positivo
 */
export const validarNumeroPositivo = (numero, campo) => {
  if (isNaN(numero) || numero <= 0) {
    throw new Error(`${campo} debe ser un número positivo`);
  }
};

/**
 * Validar longitud de string
 */
export const validarLongitud = (valor, min, max, campo) => {
  if (valor.length < min || valor.length > max) {
    throw new Error(`${campo} debe tener entre ${min} y ${max} caracteres`);
  }
};

/**
 * Validar contraseña fuerte
 */
export const validarContraseña = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!regex.test(password)) {
    throw new Error('Contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
  }
};

/**
 * Sanitizar entrada
 */
export const sanitizar = (valor) => {
  if (typeof valor !== 'string') return valor;
  return valor.trim().replace(/[<>]/g, '');
};
