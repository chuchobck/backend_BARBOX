import prisma from '../lib/prisma.js';

// =============================================
// CRUD IVA
// =============================================

/**
 * GET /api/v1/iva
 * Listar todas las configuraciones de IVA
 */
export const listarIva = async (req, res, next) => {
  try {
    const ivas = await prisma.iva.findMany({
      orderBy: { fecha_inicio: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'Configuraciones de IVA obtenidas exitosamente',
      data: ivas
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/iva/activo
 * Obtener configuración de IVA activa
 */
export const obtenerIvaActivo = async (req, res, next) => {
  try {
    const now = new Date();

    const iva = await prisma.iva.findFirst({
      where: {
        estado: 'A',
        fecha_inicio: { lte: now },
        OR: [
          { fecha_fin: null },
          { fecha_fin: { gte: now } }
        ]
      },
      orderBy: { fecha_inicio: 'desc' }
    });

    if (!iva) {
      return res.status(404).json({
        status: 'error',
        message: 'No hay configuración de IVA activa'
      });
    }

    res.json({
      status: 'success',
      message: 'IVA activo obtenido exitosamente',
      data: iva
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/iva/:id
 * Obtener una configuración de IVA por ID
 */
export const obtenerIva = async (req, res, next) => {
  try {
    const { id } = req.params;

    const iva = await prisma.iva.findUnique({
      where: { id_iva: parseInt(id) }
    });

    if (!iva) {
      return res.status(404).json({
        status: 'error',
        message: 'Configuración de IVA no encontrada'
      });
    }

    res.json({
      status: 'success',
      message: 'IVA obtenido exitosamente',
      data: iva
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/iva
 * Crear una nueva configuración de IVA
 */
export const crearIva = async (req, res, next) => {
  try {
    const { porcentaje, fecha_inicio, fecha_fin, estado } = req.body;

    if (!porcentaje || !fecha_inicio || !estado) {
      return res.status(400).json({
        status: 'error',
        message: 'porcentaje, fecha_inicio y estado son requeridos'
      });
    }

    const iva = await prisma.iva.create({
      data: {
        porcentaje: parseFloat(porcentaje),
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        estado
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Configuración de IVA creada exitosamente',
      data: iva
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/iva/:id
 * Actualizar una configuración de IVA
 */
export const actualizarIva = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { porcentaje, fecha_inicio, fecha_fin, estado } = req.body;

    const data = {};
    if (porcentaje !== undefined) data.porcentaje = parseFloat(porcentaje);
    if (fecha_inicio !== undefined) data.fecha_inicio = new Date(fecha_inicio);
    if (fecha_fin !== undefined) data.fecha_fin = fecha_fin ? new Date(fecha_fin) : null;
    if (estado !== undefined) data.estado = estado;

    const iva = await prisma.iva.update({
      where: { id_iva: parseInt(id) },
      data
    });

    res.json({
      status: 'success',
      message: 'Configuración de IVA actualizada exitosamente',
      data: iva
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/iva/:id
 * Desactivar una configuración de IVA (eliminación lógica)
 */
export const eliminarIva = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de IVA inválido',
        data: null
      });
    }

    // Verificar que la configuración existe
    const iva = await prisma.iva.findUnique({
      where: { id_iva: id }
    });

    if (!iva) {
      return res.status(404).json({
        status: 'error',
        message: 'Configuración de IVA no encontrada',
        data: null
      });
    }

    // Verificar que NO esté ya inactivo
    if (iva.estado === 'I') {
      return res.status(400).json({
        status: 'error',
        message: 'La configuración de IVA ya se encuentra desactivada',
        data: null
      });
    }

    // Actualizar estado a I (Inactivo)
    const ivaDesactivado = await prisma.iva.update({
      where: { id_iva: id },
      data: { estado: 'I' }
    });

    res.json({
      status: 'success',
      message: 'Configuración de IVA desactivada correctamente',
      data: ivaDesactivado
    });
  } catch (err) {
    next(err);
  }
};