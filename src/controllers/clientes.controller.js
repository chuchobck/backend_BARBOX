// src/controllers/clientes.controller.js
// 🟢 PERSONA 2: Módulo F4 - Gestión de Clientes

import prisma from '../config/database.js';

/**
 * GET /api/v1/clientes
 * F4.4.1 - Consulta general de clientes
 */
export const listarClientes = async (req, res, next) => {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { estado: 'ACT' },
      include: { ciudad: true }
    });

    return res.json({
      status: 'success',
      message: 'Clientes obtenidos correctamente',
      data: clientes
    });
  } catch (err) {
    // E1: Desconexión de BD
    next(err);
  }
};

/**
 * GET /api/v1/clientes/:id
 * Obtener cliente por ID
 */
export const obtenerCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: id }
    });

    if (!cliente) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no encontrado',
        data: null
      });
    }

    res.json({
      status: 'success',
      message: 'Cliente obtenido correctamente',
      data: cliente
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/clientes/buscar
 * F4.4.2 - Consulta de clientes por parámetros
 */
export const buscarClientes = async (req, res, next) => {
  try {
    const { nombre, cedula, estado } = req.query;

    // E5: Parámetros faltantes
    if (!nombre && !cedula && !estado) {
      return res.status(400).json({
        status: 'error',
        message: 'Ingrese al menos un criterio de búsqueda',
        data: null
      });
    }

    const clientes = await prisma.cliente.findMany({
      where: {
        AND: [
          nombre
            ? { nombre1: { contains: nombre, mode: 'insensitive' } }
            : {},
          cedula
            ? { ruc_cedula: cedula }
            : {},
          estado
            ? { estado }
            : {}
        ]
      }
    });

    // E6: Sin resultados
    if (clientes.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontraron clientes',
        data: []
      });
    }

    return res.json({
      status: 'success',
      message: 'Búsqueda completada',
      data: clientes
    });
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/v1/clientes/cedula/:cedula
 * Búsqueda rápida (POS)
 */
export const buscarPorCedula = async (req, res, next) => {
  try {
    const { cedula } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { ruc_cedula: cedula }
    });

    if (!cliente) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no encontrado',
        data: null
      });
    }

    return res.json({
      status: 'success',
      message: 'Cliente encontrado',
      data: cliente
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/clientes
 * Crear cliente
 * Llama a: sp_cliente_insertar
 */
export const crearCliente = async (req, res, next) => {
  try {
    const {
      id_cliente,
      nombre1,
      nombre2,
      apellido1,
      apellido2,
      ruc_cedula,
      telefono,
      celular,
      email,
      direccion,
      id_ciudad
    } = req.body;

    // E5: Datos obligatorios
    if (!id_cliente || !nombre1 || !apellido1 || !ruc_cedula || !id_ciudad) {
      return res.status(400).json({
        status: 'error',
        message: 'Campos obligatorios faltantes',
        data: null
      });
    }

    await prisma.cliente.create({
      data: {
        id_cliente,
        nombre1,
        nombre2,
        apellido1,
        apellido2,
        ruc_cedula,
        telefono,
        celular,
        email,
        direccion,
        id_ciudad,
        estado: 'ACT'
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Cliente creado correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/clientes/:id
 * Actualizar cliente
 */
export const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: id }
    });

    if (!cliente) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no existe',
        data: null
      });
    }

    await prisma.cliente.update({
      where: { id_cliente: id },
      data: req.body
    });

    res.json({
      status: 'success',
      message: 'Cliente actualizado correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};


/**
 * DELETE /api/v1/clientes/:id
 * Eliminación lógica (estado → INA)
 */
export const eliminarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: id }
    });

    if (!cliente) {
      return res.status(404).json({
        status: 'error',
        message: 'Cliente no existe',
        data: null
      });
    }

    if (cliente.estado === 'INA') {
      return res.status(409).json({
        status: 'error',
        message: 'Cliente ya está inactivo',
        data: null
      });
    }

    await prisma.cliente.update({
      where: { id_cliente: id },
      data: { estado: 'INA' }
    });

    res.json({
      status: 'success',
      message: 'Cliente desactivado correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
