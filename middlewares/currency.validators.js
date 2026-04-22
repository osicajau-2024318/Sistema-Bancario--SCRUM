import { query } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCurrencyConvert = [
  query('from')
    .notEmpty().withMessage('Moneda origen requerida')
    .isLength({ min: 3, max: 3 }),

  query('to')
    .notEmpty().withMessage('Moneda destino requerida')
    .isLength({ min: 3, max: 3 }),

  query('amount')
    .notEmpty().withMessage('Monto requerido')
    .isFloat({ min: 0.01 })
    .withMessage('Monto inválido'),

  checkValidators
];