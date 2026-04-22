import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateProductId = [
  param('id')
    .isMongoId()
    .withMessage('ID de producto inválido'),
  checkValidators
];

export const validateCreateProduct = [
  body('name')
    .notEmpty().withMessage('Nombre del producto/servicio obligatorio')
    .isLength({ max: 100 }).withMessage('Nombre máximo 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('type')
    .notEmpty().withMessage('Tipo obligatorio (PRODUCTO o SERVICIO)')
    .isIn(['PRODUCTO', 'SERVICIO']).withMessage('Tipo debe ser PRODUCTO o SERVICIO'),
  body('price')
    .notEmpty().withMessage('Precio obligatorio')
    .isFloat({ min: 0 }).withMessage('Precio debe ser mayor o igual a 0'),
  checkValidators
];

export const validateUpdateProduct = [
  param('id').isMongoId().withMessage('ID de producto inválido'),
  body('name')
    .optional()
    .notEmpty().withMessage('Nombre no puede estar vacío')
    .isLength({ max: 100 }).withMessage('Nombre máximo 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Precio debe ser mayor o igual a 0'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser true o false'),
  checkValidators
];
