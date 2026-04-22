import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateServiceId = [
  param('id').isMongoId().withMessage('ID de servicio inválido'),
  checkValidators
];

export const validateCreateService = [
  body('name')
    .notEmpty().withMessage('Nombre del servicio obligatorio')
    .isLength({ max: 100 }).withMessage('Nombre máximo 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('assigned_to')
    .optional()
    .notEmpty().withMessage('assigned_to no puede estar vacío')
    .isLength({ max: 64 }).withMessage('ID de usuario máximo 64 caracteres'),
  checkValidators
];

export const validateUpdateService = [
  param('id').isMongoId().withMessage('ID de servicio inválido'),
  body('name')
    .optional()
    .notEmpty().withMessage('Nombre no puede estar vacío')
    .isLength({ max: 100 }).withMessage('Nombre máximo 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser true o false'),
  body('assigned_to')
    .optional({ values: 'null' })
    .isLength({ max: 64 }).withMessage('assigned_to máximo 64 caracteres'),
  checkValidators
];
