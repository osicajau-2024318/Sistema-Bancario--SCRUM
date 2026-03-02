import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateDeposit = [
  body('account_number').notEmpty(),
  body('amount').isFloat({ gt: 0 }),
  checkValidators
];

export const validateTransfer = [
  body('toAccount').notEmpty(),
  body('amount').isFloat({ gt: 0 }),
  checkValidators
];

export const validateTransactionId = [
  param('id').isMongoId(),
  checkValidators
];