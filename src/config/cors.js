// CORS ultra-permisivo para debugging

export const corsConfig = {
  origin: true, // Permitir TODOS los orígenes temporalmente
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Sistema'],
  exposedHeaders: ['X-Total-Count', 'X-Correlation-ID'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const CLIENT_ORIGINS = [];
