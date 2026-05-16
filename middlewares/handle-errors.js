// Middleware global para manejar errores en toda la aplicación
export const errorHandler = (err, req, res, next) => {
    // Registra el error en la consola para debugging
    console.error(`Error in Admin Server: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);
    console.error(`Request: ${req.method} ${req.path}`);

    // Error de validación de Mongoose (campos requeridos, tipos incorrectos, etc)
    if (err.name === 'ValidationError') {
        // Extrae todos los errores de validación
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,      // Campo que falló
            message: error.message, // Mensaje del error
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors,
        });
    }

    // Error de duplicado de Mongoose (violación de índice único)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]; // Campo duplicado
        return res.status(400).json({
            success: false,
            message: `${field} ya existe`,
            error: 'DUPLICATE_FIELD',
        });
    }

    // Error de cast de Mongoose (ID inválido, formato incorrecto)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Formato de ID inválido',
            error: 'INVALID_ID',
        });
    }

    // Errores relacionados con JWT (tokens)
    // Token mal formado o firma inválida
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: 'INVALID_TOKEN',
        });
    }

    // Token expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado',
            error: 'TOKEN_EXPIRED',
        });
    }

    // Error personalizado con código de estado específico
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.code || 'CUSTOM_ERROR',
        });
    }

    // Error por defecto del servidor
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
            details: err.message,
            stack: err.stack,
        }),
    });
};
