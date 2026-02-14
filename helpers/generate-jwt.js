'use strict';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateJWT = (userId, extraClaims = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        const payload = {
            sub: String(userId),
            jti: crypto.randomUUID(),
            iat: Math.floor(Date.now() / 1000),
            ...extraClaims,
        };

        const signOptions = {
            expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || '30m',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
        };

        jwt.sign(payload, process.env.JWT_SECRET, signOptions, (err, token) => {
            if (err) {
                console.error('Error generando JWT:', err);
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};