import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateDeposit = [
  body('accountNumber').notEmpty().withMessage('Número de cuenta obligatorio'),
  body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
  body('userId').notEmpty().withMessage('ID de usuario obligatorio'),
  checkValidators
];

export const validateRevertDeposit = [
  body('transactionId').notEmpty().withMessage('ID de transacción obligatorio'),
  checkValidators
];

export const validateUpdateDeposit = [
  param('id').isMongoId().withMessage('ID de transacción inválido'),
  body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
  checkValidators
];