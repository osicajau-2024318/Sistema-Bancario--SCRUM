'use strict';

// Importa la librería jsonwebtoken para crear tokens JWT
import jwt from 'jsonwebtoken';
// Importa crypto para generar IDs únicos seguros
import crypto from 'crypto';

// Función helper para generar un token JWT
// userId: ID del usuario para quien se genera el token
// extraClaims: claims adicionales a incluir en el token (rol, permisos, etc)
// options: opciones de configuración (tiempo de expiración, etc)
export const generateJWT = (userId, extraClaims = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        // Payload del token con claims estándar
        const payload = {
            sub: String(userId),           // Subject: ID del usuario
            jti: crypto.randomUUID(),      // JWT ID: identificador único del token
            iat: Math.floor(Date.now() / 1000), // Issued At: fecha de emisión
            ...extraClaims,                // Agrega claims personalizados (rol, etc)
        };

        // Opciones de firma del token
        const signOptions = {
            expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || '30m', // Expiración (default 30 minutos)
            issuer: process.env.JWT_ISSUER,     // Emisor del token
            audience: process.env.JWT_AUDIENCE,  // Audiencia del token
        };

        // Firma el token con la clave secreta
        jwt.sign(payload, process.env.JWT_SECRET, signOptions, (err, token) => {
            if (err) {
                console.error('Error generando JWT:', err);
                reject(err);
            } else {
                resolve(token); // Retorna el token generado
            }
        });
    });
};