// src/controllers/auth.controller.js - Controlador de autenticación
// 🟡 PERSONA 3: Módulo Auth

import prisma from '../lib/prisma.js';
import { generarToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

/**
 * POST /api/v1/auth/login
 * Iniciar sesión
 */
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos',
        data: null
      });
    }

    // 🔹 Normalizar email
    email = email.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    console.log('Usuario encontrado:', {
      id: usuario?.id_usuario,
      estado: usuario?.estado,
      tipo_usuario: usuario?.tipo_usuario,
      rol: usuario?.rol,
      hasPassword: !!usuario?.password_hash
    });

    if (!usuario || usuario.estado !== 'ACT') {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas',
        data: null
      });
    }

    // 🔹 Usuarios sin password (POS/Admin creados por sistema)
    if (!usuario.password_hash) {
      return res.status(403).json({
        status: 'error',
        message: 'Usuario no habilitado para login web',
        data: null
      });
    }

    const passwordValido = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordValido) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas',
        data: null
      });
    }

    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_acceso: new Date() }
    });

    const token = generarToken({
      id: usuario.id_usuario,
      rol: usuario.rol,
      tipo: usuario.tipo_usuario
    });

    res.json({
      status: 'success',
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol,
          tipo_usuario: usuario.tipo_usuario
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};

export const registro = async (req, res, next) => {
  try {
    console.log('Registro body:', req.body);

    const {
      cliente: {
        id_cliente,
        nombre1,
        nombre2,
        apellido1,
        apellido2,
        ruc_cedula,
        telefono,
        celular,
        email: clienteEmail,
        direccion,
        id_ciudad,
      },
      usuario: { email, password },
    } = req.body;

    // 🔹 Validaciones básicas
    if (!id_cliente || !nombre1 || !apellido1 || !ruc_cedula || !id_ciudad) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de cliente obligatorios faltantes',
        data: null,
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña de usuario son obligatorios',
        data: null,
      });
    }

    // 🔹 Normalizar email
    const emailNormalized = email.toLowerCase().trim();

    // 🔹 Validar email duplicado en usuario
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalized },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado',
        data: null,
      });
    }

    // 🔹 Validar RUC/Cédula único
    const clienteExistente = await prisma.cliente.findUnique({
      where: { ruc_cedula },
    });

    if (clienteExistente) {
      return res.status(409).json({
        status: 'error',
        message: 'El cliente con este RUC/Cédula ya existe',
        data: null,
      });
    }

    // 🔹 Encriptar password
    const passwordHash = await bcrypt.hash(password, 10);

    // 🔹 Crear cliente + usuario en transacción
    const [clienteCreado, usuarioCreado] = await prisma.$transaction([
      prisma.cliente.create({
        data: {
          id_cliente,
          nombre1,
          nombre2,
          apellido1,
          apellido2,
          ruc_cedula,
          telefono,
          celular,
          email: clienteEmail || null,
          direccion,
          id_ciudad,
          estado: 'ACT',
        },
      }),
      prisma.usuario.create({
        data: {
          email: emailNormalized,
          password_hash: passwordHash,
          rol: 'CLIENTE',
          tipo_usuario: 'CLIENTE',
          id_cliente,
          estado: 'ACT',
        },
      }),
    ]);

    console.log('Cliente creado:', clienteCreado);
    console.log('Usuario creado:', { id: usuarioCreado.id_usuario, email: usuarioCreado.email });

    // 🔹 Generar token JWT
    const token = generarToken({
      id: usuarioCreado.id_usuario,
      rol: usuarioCreado.rol,
      tipo: usuarioCreado.tipo_usuario,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registrado correctamente',
      data: {
        token,
        usuario: {
          id_usuario: usuarioCreado.id_usuario,
          email: usuarioCreado.email,
          rol: usuarioCreado.rol,
          tipo_usuario: usuarioCreado.tipo_usuario,
        },
        cliente: clienteCreado,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/perfil
 * Obtener perfil del usuario autenticado
 */
export const perfil = async (req, res, next) => {
  try {
    const { id, rol } = req.usuario;

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: {
        cliente: true
      }
    });

    res.json({
      status: 'success',
      message: 'Perfil obtenido',
      data: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol,
        tipo_usuario: usuario.tipo_usuario,
        cliente: usuario.cliente
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/auth/actualizar-perfil
 * Actualizar datos del perfil del usuario autenticado
 */
export const actualizarPerfil = async (req, res, next) => {
  try {
    const { id } = req.usuario;
    const {
      nombre1,
      nombre2,
      apellido1,
      apellido2,
      telefono,
      celular,
      direccion,
      id_ciudad
    } = req.body;

    // Obtener usuario y verificar que tenga cliente asociado
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { cliente: true }
    });

    if (!usuario || !usuario.cliente) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no tiene cliente asociado',
        data: null
      });
    }

    // Preparar datos para actualizar (solo los que se enviaron)
    const datosActualizar = {};
    if (nombre1 !== undefined) datosActualizar.nombre1 = nombre1;
    if (nombre2 !== undefined) datosActualizar.nombre2 = nombre2;
    if (apellido1 !== undefined) datosActualizar.apellido1 = apellido1;
    if (apellido2 !== undefined) datosActualizar.apellido2 = apellido2;
    if (telefono !== undefined) datosActualizar.telefono = telefono;
    if (celular !== undefined) datosActualizar.celular = celular;
    if (direccion !== undefined) datosActualizar.direccion = direccion;
    if (id_ciudad !== undefined) datosActualizar.id_ciudad = id_ciudad;

    // Actualizar cliente
    const clienteActualizado = await prisma.cliente.update({
      where: { id_cliente: usuario.cliente.id_cliente },
      data: datosActualizar
    });

    res.json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      data: {
        cliente: clienteActualizado
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/auth/cambiar-password
 * Cambiar contraseña
 */
export const cambiarPassword = async (req, res, next) => {
  try {
    const { id } = req.usuario;
    const { passwordActual, passwordNueva } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id }
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
        data: null
      });
    }

    const valida = await bcrypt.compare(
      passwordActual,
      usuario.password_hash
    );

    if (!valida) {
      return res.status(401).json({
        status: 'error',
        message: 'Contraseña actual incorrecta',
        data: null
      });
    }

    const nuevaHash = await bcrypt.hash(passwordNueva, 10);

    await prisma.usuario.update({
      where: { id_usuario: id },
      data: { password_hash: nuevaHash }
    });

    res.json({
      status: 'success',
      message: 'Contraseña actualizada correctamente',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

