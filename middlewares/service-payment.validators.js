import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateServicePayment = [
  body('serviceId').isMongoId().withMessage('serviceId inválido'),
  body('accountId').isMongoId().withMessage('accountId inválido'),
  body('amount')
    .notEmpty()
    .withMessage('Monto obligatorio')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a 0'),
  body('currency')
    .optional()
    .isIn(['GTQ', 'USD', 'EUR'])
    .withMessage('Moneda inválida'),
  body('reference')
    .optional()
    .isLength({ max: 120 })
    .withMessage('La referencia no puede exceder 120 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  checkValidators,
];
