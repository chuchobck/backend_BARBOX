// src/middleware/auth.js
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
    
    // ✅ Estructura completa del usuario
    req.usuario = {
      id: decoded.id,
      rol: decoded.rol,
      tipo: decoded.tipo,
      id_cliente: decoded.id_cliente || null,
      id_empleado: decoded.id_empleado || null
    };
    
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
    req.usuario = {
      id: decoded.id,
      rol: decoded.rol,
      tipo: decoded.tipo,
      id_cliente: decoded.id_cliente || null,
      id_empleado: decoded.id_empleado || null
    };
  } catch {
    req.usuario = null;
  }
  
  next();
}

/**
 * Middleware: Verificar que sea cliente
 */
export function soloClientes(req, res, next) {
  if (req.usuario?.tipo !== 'CLIENTE') {
    return res.status(403).json({
      status: 'error',
      message: 'Acceso solo para clientes',
      data: null
    });
  }
  next();
}

/**
 * Middleware: Verificar que sea empleado
 */
export function soloEmpleados(req, res, next) {
  if (req.usuario?.tipo !== 'EMPLEADO') {
    return res.status(403).json({
      status: 'error',
      message: 'Acceso solo para empleados',
      data: null
    });
  }
  next();
}

/**
 * Middleware: Verificar roles específicos
 */
export function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`,
        data: null
      });
    }
    next();
  };
}

export default {
  generarToken,
  verificarToken,
  verificarTokenOpcional,
  soloClientes,
  soloEmpleados,
  requiereRol
};