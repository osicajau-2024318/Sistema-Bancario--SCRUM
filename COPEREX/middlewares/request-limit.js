/**
 * Rate limiter global para proteger los endpoints.
 * Máximo 100 peticiones por IP cada 15 minutos.
 */

import rateLimit from 'express-rate-limit';

export const requestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones, intente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
