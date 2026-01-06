// src/config/cors.js - Configuración de CORS

// Lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:3001",  // BARBOX Frontend (npm start)
];

// Función para validar origen (permite IPs de red local)
const validateOrigin = (origin, callback) => {
  // Permitir requests sin origin (ej: Postman, mobile apps)
  if (!origin) {
    return callback(null, true);
  }

  // Permitir orígenes en la lista
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Permitir cualquier IP de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localNetworkPattern = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/;
  if (localNetworkPattern.test(origin)) {
    return callback(null, true);
  }

  // Origen no permitido
  callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
};

export const corsConfig = {
  origin: validateOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Correlation-ID',
    'X-Sistema'  // ecommerce, admin, pos
  ],
  exposedHeaders: ['X-Total-Count', 'X-Correlation-ID'],
  credentials: true,
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const CLIENT_ORIGINS = allowedOrigins;

