// src/server.js - Servidor principal con seguridad JWT

import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { corsConfig } from "./config/cors.js";
import { correlationId } from "./middleware/correlation.js";
import { helmetMiddleware, apiLimiter } from "./middleware/security.js";

// Cargar variables de entorno
dotenv.config();

const app = express();

// ========== MIDDLEWARE GLOBAL ==========

// 1. Headers de seguridad (Helmet)
app.use(helmetMiddleware);

// 2. Rate Limiting (200 peticiones/15min)
app.use(apiLimiter);

// 3. CORS configurado para los 3 frontends
app.use(cors(corsConfig));

// 4. Parsear JSON
app.use(express.json());

// 5. Correlation ID para trazabilidad
app.use(correlationId);

// 6. Logger optimizado con medición de latencia (sin memory leak)
const logRequest = (req, res, next) => {
  const start = Date.now();
  const time = new Date().toISOString();
  
  // Log de entrada
  console.log(`[${time}] → ${req.method} ${req.url}`);
  
  // Usar 'once' en lugar de 'on' para evitar listeners acumulados
  const onFinish = () => {
    const duration = Date.now() - start;
    console.log(`[${time}] ← ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  };
  
  res.once('finish', onFinish);
  
  // Limpiar listener si hay error
  res.once('close', () => {
    res.removeListener('finish', onFinish);
  });
  
  next();
};

app.use(logRequest);

// 7. Middleware CORS para archivos estáticos (imágenes)
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  }
  next();
});

// 8. Servir archivos estáticos (imágenes)
app.use('/logos', express.static(path.join(process.cwd(), 'public/logos')));
app.use('/productos', express.static(path.join(process.cwd(), 'public/productos')));
app.use('/promociones', express.static(path.join(process.cwd(), 'public/promociones')));

// ========== RUTAS ==========

// ===================================
// Health check dinámico
// ===================================
app.get('/health', (req, res) => {
  // Extraer módulos registrados dinámicamente del router principal
  const modules = routes.stack
    .filter(layer => layer.name === 'router') // solo capas que son routers
    .map(layer => {
      // Cada layer tiene un 'path' que es el prefijo
      return layer.regexp.source
        .replace('\\/?', '')   // limpiar regex de Express
        .replace('(?=\\/|$)', '')
        .replace('^', '')
        .replace('\\/', '')
        .replace(/\\\//g, '/'); // reponer slashes
    });

  res.json({
    status: 'success',
    message: 'API funcionando correctamente',
    data: {
      version: 'v1',
      timestamp: new Date().toISOString(),
      modules: modules
    }
  });
});


// API versionada
app.use('/api/v1', routes);

// Compatibilidad con rutas sin versión (deprecado)
app.use('/api', routes);

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint no encontrado: ${req.method} ${req.url}`,
    data: null
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  console.error(err.stack);

  // Determinar código de estado
  let statusCode = 500;
  let message = 'Error interno del servidor';

  // Errores de Prisma
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro no encontrado';
  } else if (err.code?.startsWith('P2')) {
    statusCode = 400;
    message = 'Error en la operación de base de datos';
  }

  // Error de CORS
  if (err.message.includes('CORS')) {
    statusCode = 403;
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    data: null
  });
});

// ========== INICIAR SERVIDOR ==========


// Mostrar la URL de conexión a la base de datos al iniciar el servidor
console.log('Conectando a la base de datos:', process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🚀 API REST SEGURA - SISTEMA DE GESTIÓN              ║
╠════════════════════════════════════════════════════════════════╣
║  Servidor:     http://localhost:${PORT}                          ║
║  Health:       http://localhost:${PORT}/health                   ║
║  API Base:     http://localhost:${PORT}/api/v1                   ║
║  Imágenes:     http://localhost:${PORT}/logos & /productos       ║
╠════════════════════════════════════════════════════════════════╣
║  🔐 SEGURIDAD ACTIVADA:                                        ║
║  ✓ JWT Authentication                                          ║
║  ✓ Helmet (Headers seguros)                                    ║
║  ✓ Rate Limiting (200 req/15min)                               ║
║  ✓ Login Limiter (20 intentos/10min)                           ║
║  ✓ CORS (Multiple origins)                                     ║
║  ✓ XSS Protection                                              ║
║  ✓ Input Validation & Sanitization                             ║
╠════════════════════════════════════════════════════════════════╣
║  FRONTENDS PERMITIDOS:                                         ║
║  • http://localhost:5173 - E-commerce (BARBOX)                 ║
║  • http://localhost:5174 - POS                                 ║
║  • http://localhost:5175 - Backoffice Admin                    ║
╠════════════════════════════════════════════════════════════════╣
║  ⚡ OPTIMIZACIONES ACTIVAS:                                    ║
║  ✓ Connection Pooling                                          ║
║  ✓ Memory Leak Prevention                                      ║
║  ✓ Graceful Shutdown                                           ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Configurar timeout del servidor (30 segundos)
server.timeout = 30000;
server.keepAliveTimeout = 65000; // Debe ser mayor que el timeout del load balancer
server.headersTimeout = 66000; // Debe ser mayor que keepAliveTimeout

// Graceful shutdown del servidor
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  ${signal} recibido. Cerrando servidor...`);
  
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado');
    process.exit(0);
  });
  
  // Si el servidor no se cierra en 10 segundos, forzar salida
  setTimeout(() => {
    console.error('⚠️  Forzando cierre del servidor...');
    process.exit(1);
  }, 10000);
};

// Escuchar señales de terminación
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;
