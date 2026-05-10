// Importa express-rate-limit para limitar peticiones por IP
import rateLimit from 'express-rate-limit';

// Configuración del rate limiter para prevenir ataques de fuerza bruta y abuso
export const requestLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de tiempo: 15 minutos
    max: 100, // Límite de 100 requests por ventana de tiempo por IP
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
    legacyHeaders: false, // Desactiva los headers `X-RateLimit-*` deprecados
    // Excluye Swagger para no bloquear la consulta de documentacion
    skip: (req) => req.path === '/docs' || req.path === '/docs/' || req.path === '/docs.json' || req.path.startsWith('/docs/'),
    // Handler personalizado cuando se excede el límite
    handler: (req, res) => {
        // Registra en consola la IP que excedió el límite
        console.log(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        // Retorna error 429 (Too Many Requests)
        res.status(429).json({
            success: false,
            message:
                'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
            error: 'RATE_LIMIT_EXCEEDED',
            // Tiempo en segundos hasta que se resetee el límite
            retryAfter: Math.round((req.rateLimit.resetTime - Date.now()) / 1000),
        });
    },
});
