// Configuración de CORS (Cross-Origin Resource Sharing) para permitir peticiones desde otros dominios
export const corsOptions = {
    // origin: true permite peticiones desde cualquier origen
    origin: true,
    // credentials: true permite el envío de cookies y headers de autenticación
    credentials: true,
    // Métodos HTTP permitidos en las peticiones
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Headers permitidos en las peticiones
    allowedHeaders: ['Content-Type', 'Authorization'],
};