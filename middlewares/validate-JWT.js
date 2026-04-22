// Importa la librería jsonwebtoken para validar tokens JWT
import jwt from 'jsonwebtoken';

// Middleware que valida el token JWT en las peticiones
export const validateJWT = (req, res, next) => {
    // Configuración del JWT desde variables de entorno
    const jwtConfig = {
        secret: process.env.JWT_SECRET,        // Clave secreta para verificar el token
        issuer: process.env.JWT_ISSUER,        // Emisor del token
        audience: process.env.JWT_AUDIENCE,    // Audiencia del token
    };

    // Valida que la clave secreta esté configurada
    if (!jwtConfig.secret) {
        console.error('Error de validación JWT: JWT_SECRET no está definido');
        return res.status(500).json({
            success: false,
            message: 'Configuración del servidor inválida: falta JWT_SECRET',
        });
    }

    // Intenta obtener el token del header x-token o Authorization
    const token =
        req.header('x-token') ||
        req.header('Authorization')?.replace('Bearer ', '');

    // Si no hay token, retorna error 401 (no autorizado)
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó un token',
            error: 'MISSING_TOKEN',
        });
    }

    try {
        // Opciones para verificar el token
        const verifyOptions = {};
        if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
        if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

        // Verifica y decodifica el token
        const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

        // Log para debug - remover en producción
        // Advierte si el token no tiene el campo 'role'
        if (!decoded.role) {
            console.warn(
                `Token sin campo 'role' para usuario ${decoded.sub}. Payload:`,
                JSON.stringify(decoded, null, 2)
            );
        }

        // Agrega la información del usuario al objeto request
        req.user = {
            id: decoded.sub, // userId del servicio de autenticación
            jti: decoded.jti, // ID único del token
            iat: decoded.iat, // Emitido en (timestamp)
            role: decoded.role || 'USER_ROLE', // Rol del usuario (default: USER_ROLE)
        };

        // Continúa con el siguiente middleware o controlador
        next();
    } catch (error) {
        console.error('Error de validación JWT:', error.message);

        // Manejo de token expirado
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado',
                error: 'TOKEN_EXPIRED',
            });
        }

        // Manejo de token inválido
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'INVALID_TOKEN',
            });
        }

        // Error genérico de validación
        return res.status(500).json({
            success: false,
            message: 'Error al validar el token',
            error: 'TOKEN_VALIDATION_ERROR',
        });
    }
};
