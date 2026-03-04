'use strict';

// Importa las constantes de roles definidas en el sistema
import { Roles } from '../src/constants/roles.js';

// Middleware que valida si el usuario tiene uno de los roles permitidos
// Recibe como parámetros los roles que están autorizados para acceder a la ruta
export const validateRole = (...allowedRoles) => {
  // Retorna una función middleware
  return (req, res, next) => {
    // Verifica que el usuario esté autenticado y tenga un rol asignado
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Verifica si el rol del usuario está en la lista de roles permitidos
    const hasRole = allowedRoles.includes(req.user.role);

    // Si no tiene el rol necesario, retorna error 403 (prohibido)
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      });
    }

    // Si tiene el rol adecuado, continúa con el siguiente middleware o controlador
    next();
  };
};