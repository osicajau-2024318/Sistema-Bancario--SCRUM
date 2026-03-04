import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateFavorite = [
  body('alias')
    .notEmpty().withMessage('Alias obligatorio'),

  body('account_number')
    .notEmpty().withMessage('Número de cuenta obligatorio'),

  checkValidators
];

export const validateFavoriteId = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),

  checkValidators
];

export const validateFavoriteTransfer = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Monto debe ser mayor a 0'),

  checkValidators
];