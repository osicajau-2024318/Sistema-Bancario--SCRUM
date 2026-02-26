
export const validateRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
        }

        next();
    };
};