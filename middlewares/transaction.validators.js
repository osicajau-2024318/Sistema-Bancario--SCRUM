import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateDeposit = [
  body('accountNumber')
    .notEmpty()
    .withMessage('Número de cuenta es obligatorio'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Monto debe ser mayor a 0'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD'])
    .withMessage('Moneda debe ser GTQ o USD'),
  body('description')
    .optional()
    .isString()
    .withMessage('Descripción debe ser texto'),
  checkValidators
];

export const validateTransfer = [
  body('toAccount').notEmpty(),
  body('amount').isFloat({ min: 5, max: 2000 }).withMessage('El monto debe estar entre Q5 y Q2,000'),
  checkValidators
];

export const validateTransactionId = [
  param('id').isMongoId(),
  checkValidators
];