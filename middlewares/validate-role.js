'use strict';

export const validateRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({
                success: false,
                message: 'Se requiere validar JWT primero'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para esta acción',
                error: 'FORBIDDEN'
            });
        }

        next();
    };
};