import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { validateRole } from './validate-role.js';

export const validateCreateField = [
    validateJWT,
    validateRole('ADMIN'),
    body('fieldName')
        .trim()
        .notEmpty()
        .withMessage('El nombre del campo es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('fieldType')
        .notEmpty()
        .withMessage('El tipo de campo es requerido')
        .isIn(['NATURAL', 'SINTETICA', 'CONCRETO'])
        .withMessage('Tipo de superficie no válida'),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isIn(['FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11'])
        .withMessage('Capacidad no válida'),
    body('pricePerHour')
        .notEmpty()
        .withMessage('El precio por hora es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    checkValidators,
];

export const validateUpdateFieldRequest = [
    validateJWT,
    validateRole('ADMIN'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('fieldName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('fieldType')
        .optional()
        .isIn(['NATURAL', 'SINTETICA', 'CONCRETO'])
        .withMessage('Tipo de superficie no válida'),
    body('capacity')
        .optional()
        .isIn(['FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11'])
        .withMessage('Capacidad no válida'),
    body('pricePerHour')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio por hora debe ser mayor o igual a 0'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    checkValidators,
];

export const validateFieldStatusChange = [
    validateJWT,
    validateRole('ADMIN'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetFieldById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
