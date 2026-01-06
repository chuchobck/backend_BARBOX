// src/middleware/correlation.js - Correlation ID para trazabilidad

import { randomUUID } from 'crypto';

/**
 * Middleware: Agrega un Correlation-ID único a cada request
 * Útil para trazar requests en logs y debugging
 */
export function correlationId(req, res, next) {
  // Usar el ID que viene del cliente o generar uno nuevo
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  
  // Guardar en request para uso interno
  req.correlationId = correlationId;
  
  // Enviar en respuesta para que el cliente pueda rastrear
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
}

/**
 * Helper: Obtener correlation ID del request actual
 */
export function getCorrelationId(req) {
  return req.correlationId || 'unknown';
}
