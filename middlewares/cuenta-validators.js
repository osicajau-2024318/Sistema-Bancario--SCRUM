import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCrearCuenta = [
    body('tipoCuenta')
        .optional()
        .isIn(['AHORRO', 'CORRIENTE', 'NOMINA'])
        .withMessage('Tipo de cuenta no válido'),
    
    body('userId')
        .optional()
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    
    checkValidators
];

export const validateActualizarCuenta = [
    body('tipoCuenta')
        .optional()
        .isIn(['AHORRO', 'CORRIENTE', 'NOMINA'])
        .withMessage('Tipo de cuenta no válido'),
    
    body('estado')
        .optional()
        .isIn(['ACTIVA', 'BLOQUEADA', 'CERRADA'])
        .withMessage('Estado no válido'),
    
    checkValidators
];

export const validateCambiarEstado = [
    body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['ACTIVA', 'BLOQUEADA', 'CERRADA'])
        .withMessage('Estado no válido'),
    
    checkValidators
];

export const validateIdParam = [
    param('id')
        .isMongoId()
        .withMessage('ID inválido'),
    
    checkValidators
];

export const validateNumeroCuentaParam = [
    param('numeroCuenta')
        .matches(/^\d{10}$/)
        .withMessage('Número de cuenta inválido (debe tener 10 dígitos)'),
    
    checkValidators
];