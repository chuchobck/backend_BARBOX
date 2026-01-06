// src/middleware/auth.js - Autenticación JWT

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

/**
 * Genera un token JWT
 */
export function generarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * Middleware: Verifica que el usuario esté autenticado
 */
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token no proporcionado',
      data: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // { id, email, rol }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado',
        data: null
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
      data: null
    });
  }
}

/**
 * Middleware opcional: Verifica token si existe, pero no requiere
 */
export function verificarTokenOpcional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.usuario = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
  } catch {
    req.usuario = null;
  }
  
  next();
}
