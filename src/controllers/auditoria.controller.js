import prisma from '../lib/prisma.js';

/**
 * Auditoría Controller - Solo lectura
 */

export const listarAuditorias = async (req, res, next) => {
  try {
    const { limite = 100, pagina = 1 } = req.query;
    const skip = (Number(pagina) - 1) * Number(limite);

    const [auditorias, total] = await Promise.all([
      prisma.auditoria.findMany({
        skip,
        take: Number(limite),
        orderBy: [
          { fecha: 'desc' },
          { hora: 'desc' }
        ]
      }),
      prisma.auditoria.count()
    ]);

    if (!auditorias || auditorias.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No existen registros de auditoría', data: [] });
    }

    return res.json({
      status: 'success',
      message: 'Auditorías obtenidas',
      data: auditorias,
      pagination: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const obtenerAuditoria = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de auditoría es requerido', data: null });

    const auditoria = await prisma.auditoria.findUnique({
      where: { id_auditoria: id }
    });

    if (!auditoria) {
      return res.status(404).json({ status: 'error', message: 'Auditoría no encontrada', data: null });
    }

    return res.json({ status: 'success', message: 'Auditoría obtenida', data: auditoria });
  } catch (err) {
    next(err);
  }
};

export const buscarAuditorias = async (req, res, next) => {
  try {
    const { id_usuario, tabla, accion, fecha_desde, fecha_hasta, clave_registro, ip_maquina, limite = 100, pagina = 1 } = req.query;

    if (!id_usuario && !tabla && !accion && !fecha_desde && !fecha_hasta && !clave_registro && !ip_maquina) {
      return res.status(400).json({ status: 'error', message: 'Ingrese al menos un criterio de búsqueda', data: null });
    }

    const where = {};
    if (id_usuario) where.id_usuario = Number(id_usuario);
    if (tabla) where.tabla = { contains: tabla, mode: 'insensitive' };
    if (accion) where.accion = { contains: accion, mode: 'insensitive' };
    if (clave_registro) where.clave_registro = { contains: clave_registro, mode: 'insensitive' };
    if (ip_maquina) where.ip_maquina = { contains: ip_maquina, mode: 'insensitive' };
    
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
    }

    const skip = (Number(pagina) - 1) * Number(limite);

    const [resultados, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        skip,
        take: Number(limite),
        orderBy: [
          { fecha: 'desc' },
          { hora: 'desc' }
        ]
      }),
      prisma.auditoria.count({ where })
    ]);

    if (!resultados || resultados.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron registros', data: [] });
    }

    return res.json({
      status: 'success',
      message: 'Búsqueda completada',
      data: resultados,
      pagination: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const obtenerAuditoriasPorUsuario = async (req, res, next) => {
  try {
    const id_usuario = Number(req.params.id_usuario);
    const { limite = 50, pagina = 1 } = req.query;

    if (!id_usuario) {
      return res.status(400).json({ status: 'error', message: 'ID de usuario es requerido', data: null });
    }

    const skip = (Number(pagina) - 1) * Number(limite);

    const [auditorias, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { id_usuario },
        skip,
        take: Number(limite),
        orderBy: [
          { fecha: 'desc' },
          { hora: 'desc' }
        ]
      }),
      prisma.auditoria.count({ where: { id_usuario } })
    ]);

    if (!auditorias || auditorias.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No se encontraron auditorías para este usuario', data: [] });
    }

    return res.json({
      status: 'success',
      message: 'Auditorías del usuario obtenidas',
      data: auditorias,
      pagination: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const obtenerAuditoriasPorTabla = async (req, res, next) => {
  try {
    const { tabla } = req.params;
    const { limite = 50, pagina = 1 } = req.query;

    if (!tabla) {
      return res.status(400).json({ status: 'error', message: 'Nombre de tabla es requerido', data: null });
    }

    const skip = (Number(pagina) - 1) * Number(limite);

    const [auditorias, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { tabla },
        skip,
        take: Number(limite),
        orderBy: [
          { fecha: 'desc' },
          { hora: 'desc' }
        ]
      }),
      prisma.auditoria.count({ where: { tabla } })
    ]);

    if (!auditorias || auditorias.length === 0) {
      return res.status(404).json({ status: 'error', message: `No se encontraron auditorías para la tabla ${tabla}`, data: [] });
    }

    return res.json({
      status: 'success',
      message: `Auditorías de la tabla ${tabla} obtenidas`,
      data: auditorias,
      pagination: {
        total,
        pagina: Number(pagina),
        limite: Number(limite),
        totalPaginas: Math.ceil(total / Number(limite))
      }
    });
  } catch (err) {
    next(err);
  }
};
