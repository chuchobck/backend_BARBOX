// src/routes/promociones.routes.js - Rutas para promociones (E-commerce)
import { Router } from 'express';
import prisma from '../lib/prisma.js';


const router = Router();

// ========== CATEGORÍAS DE PROMOCIÓN (OCASIONES) ==========

// GET /api/v1/promociones/categorias - Listar todas las categorías/ocasiones
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await prisma.categoria_promocion.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        orden: true,
        _count: {
          select: {
            promociones: {
              where: {
                activo: true,
                fecha_fin: { gte: new Date() }
              }
            }
          }
        }
      },
      orderBy: { orden: 'asc' }
    });

    // Formatear respuesta con conteo de ofertas
    const categoriasFormateadas = categorias.map(cat => ({
      id: cat.id,
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      orden: cat.orden,
      totalOfertas: cat._count.promociones
    }));

    res.json({
      success: true,
      data: categoriasFormateadas
    });
  } catch (error) {
    console.error('Error cargando categorías de promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar categorías de promoción',
      details: error.message
    });
  }
});

// ========== PROMOCIONES ==========

// GET /api/v1/promociones - Listar promociones con filtros
router.get('/', async (req, res) => {
  try {
    const {
      categoria,
      ordenarPor = 'destacado',
      pagina = 1,
      limite = 12,
      soloActivas = true,
      minPrecio,
      maxPrecio
    } = req.query;

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const take = parseInt(limite);

    // Construir where
    const where = {};

    if (soloActivas === 'true' || soloActivas === true) {
      where.activo = true;
      where.fecha_fin = { gte: new Date() };
      where.fecha_inicio = { lte: new Date() };
    }

    if (categoria) {
      where.categoria_promocion = { nombre: { equals: categoria, mode: 'insensitive' } };
    }

    if (minPrecio) {
      where.precio_promocional = { ...where.precio_promocional, gte: parseFloat(minPrecio) };
    }

    if (maxPrecio) {
      where.precio_promocional = { ...where.precio_promocional, lte: parseFloat(maxPrecio) };
    }

    // Ordenamiento
    let orderBy = {};
    switch (ordenarPor) {
      case 'mayor-descuento':
        orderBy = { porcentaje_descuento: 'desc' };
        break;
      case 'menor-precio':
        orderBy = { precio_promocional: 'asc' };
        break;
      case 'mas-vendidos':
        orderBy = { cantidad_vendida: 'desc' };
        break;
      case 'fecha':
        orderBy = { fecha_creacion: 'desc' };
        break;
      default:
        orderBy = [{ destacado: 'desc' }, { cantidad_vendida: 'desc' }];
    }

    // Contar total
    let total = 0;
    if (categoria) {
      total = await prisma.promociones.count({
        where: {
          ...where,
          categoria_promocion: { nombre: { equals: categoria, mode: 'insensitive' } }
        }
      });
    } else {
      total = await prisma.promociones.count({ where });
    }

    // Obtener promociones
    const promociones = await prisma.promociones.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        descripcion_corta: true,
        marca: true,
        precio_original: true,
        precio_promocional: true,
        porcentaje_descuento: true,
        cantidad_vendida: true,
        fecha_inicio: true,
        fecha_fin: true,
        activo: true,
        destacado: true,
        cantidad_maxima_cliente: true,
        stock_disponible: true,
        mensaje_regalo: true,
        categoria_promocion: {
          select: {
            id: true,
            nombre: true
          }
        },
        promocion_productos: {
          select: {
            id: true,
            cantidad: true,
            producto: {
              select: {
                id_producto: true,
                descripcion: true,
                imagen_url: true,
                volumen: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take
    });

    const totalPaginas = Math.ceil(total / parseInt(limite));

    res.json({
      success: true,
      data: {
        promociones,
        total,
        pagina: parseInt(pagina),
        totalPaginas,
        limite: parseInt(limite)
      }
    });
  } catch (error) {
    console.error('Error cargando promociones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar promociones',
      details: error.message
    });
  }
});

// GET /api/v1/promociones/destacadas - Obtener promociones destacadas
router.get('/destacadas', async (req, res) => {
  try {
    const { limite = 6 } = req.query;

    const promociones = await prisma.promociones.findMany({
      where: {
        activo: true,
        destacado: true,
        fecha_fin: { gte: new Date() },
        fecha_inicio: { lte: new Date() }
      },
      select: {
        id: true,
        nombre: true,
        descripcion_corta: true,
        precio_original: true,
        precio_promocional: true,
        porcentaje_descuento: true,
        cantidad_vendida: true,
        categoria_promocion: {
          select: {
            id: true,
            nombre: true
          }
        },
        promocion_productos: {
          take: 3,
          select: {
            producto: {
              select: {
                descripcion: true,
                imagen_url: true
              }
            }
          }
        }
      },
      orderBy: { cantidad_vendida: 'desc' },
      take: parseInt(limite)
    });

    res.json({
      success: true,
      data: promociones
    });
  } catch (error) {
    console.error('Error cargando promociones destacadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar promociones destacadas',
      details: error.message
    });
  }
});

// GET /api/v1/promociones/:id - Obtener una promoción específica
router.get('/:id', async (req, res) => {
  try {
    const promocion = await prisma.promociones.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        descripcion_corta: true,
        marca: true,
        precio_original: true,
        precio_promocional: true,
        porcentaje_descuento: true,
        cantidad_vendida: true,
        fecha_inicio: true,
        fecha_fin: true,
        activo: true,
        destacado: true,
        cantidad_maxima_cliente: true,
        stock_disponible: true,
        mensaje_regalo: true,
        categoria_promocion: {
          select: {
            id: true,
            nombre: true
          }
        },
        promocion_productos: {
          select: {
            id: true,
            cantidad: true,
            es_regalo: true,
            producto: {
              select: {
                id_producto: true,
                descripcion: true,
                imagen_url: true,
                volumen: true,
                precio_venta: true
              }
            }
          }
        }
      }
    });

    if (!promocion) {
      return res.status(404).json({
        success: false,
        error: 'Promoción no encontrada'
      });
    }

    res.json({
      success: true,
      data: promocion
    });
  } catch (error) {
    console.error('Error cargando promoción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar promoción',
      details: error.message
    });
  }
});

// GET /api/v1/promociones/countdown/navidad - Obtener tiempo restante para Navidad
router.get('/countdown/navidad', async (req, res) => {
  try {
    const now = new Date();
    const navidad = new Date(now.getFullYear(), 11, 25); // 25 de diciembre

    // Si ya pasó Navidad, usar el próximo año
    if (now > navidad) {
      navidad.setFullYear(navidad.getFullYear() + 1);
    }

    const diff = navidad - now;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    res.json({
      success: true,
      data: {
        dias,
        horas,
        minutos,
        segundos,
        fechaObjetivo: navidad.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al calcular countdown',
      details: error.message
    });
  }
});

export default router;
