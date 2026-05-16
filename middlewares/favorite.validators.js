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
    .notEmpty()
    .trim()
    .withMessage('Se requiere el ID o el alias del favorito'),

  checkValidators
];

export const validateQuickTransfer = [
  param('id')
    .notEmpty()
    .trim()
    .withMessage('Se requiere el ID o el alias del favorito'),
  body('amount')
    .isFloat({ min: 1, max: 2000 })
    .withMessage('El monto debe estar entre 1 y 2,000'),
  body('fromAccount')
    .notEmpty()
    .withMessage('Cuenta origen obligatoria (fromAccount): número de tu cuenta desde la que envías'),
  checkValidators
];