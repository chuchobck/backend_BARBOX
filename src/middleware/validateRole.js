// src/middleware/validateRole.js - Validación de roles

/**
 * Middleware factory: Valida que el usuario tenga uno de los roles permitidos
 * @param {string[]} rolesPermitidos - Array de roles permitidos (ej: ['admin', 'pos'])
 */
export function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.usuario) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado',
        data: null
      });
    }

    // Verificar que tenga uno de los roles permitidos
    const { rol } = req.usuario;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
        data: null
      });
    }

    next();
  };
}

/**
 * Middleware: Solo administradores
 */
export const soloAdmin = requireRole('admin');

/**
 * Middleware: Admin o POS
 */
export const adminOPos = requireRole('admin', 'pos');

/**
 * Middleware: Solo clientes
 */
export const soloCliente = requireRole('cliente');

/**
 * Middleware: Cualquier usuario autenticado
 */
export const cualquierRol = requireRole('admin', 'cliente', 'pos');

/**
 * Middleware: Verifica que el usuario acceda solo a sus propios datos
 */
export function soloPropiosDatos(paramIdField = 'id') {
  return (req, res, next) => {
    const { rol, id: usuarioId, clienteId } = req.usuario;

    // Admin puede ver todo
    if (rol === 'admin') {
      return next();
    }

    // Para clientes, verificar que acceden a sus propios datos
    const idSolicitado = parseInt(req.params[paramIdField]);

    if (rol === 'cliente' && clienteId !== idSolicitado) {
      return res.status(403).json({
        status: 'error',
        message: 'Solo puede acceder a sus propios datos',
        data: null
      });
    }

    next();
  };
}
