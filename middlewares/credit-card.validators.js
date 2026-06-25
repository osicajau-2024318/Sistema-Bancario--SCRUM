import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateCreditCard = [
  body('name').notEmpty().withMessage('El nombre de la tarjeta es requerido').isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('type').optional().isIn(['Visa', 'Mastercard', 'Amex']).withMessage('Tipo de tarjeta inválido'),
  body('currency').optional().isIn(['GTQ', 'USD']).withMessage('Moneda inválida'),
  body('authorizedLimit').notEmpty().withMessage('El límite autorizado es requerido').isFloat({ min: 0 }).withMessage('El límite autorizado debe ser un número positivo'),
  body('balanceDue').optional().isFloat({ min: 0 }).withMessage('El saldo pendiente debe ser un número positivo'),
  body('availableBalance').optional().isFloat({ min: 0 }).withMessage('El saldo disponible debe ser un número positivo'),
  body('minimumPayment').optional().isFloat({ min: 0 }).withMessage('El pago mínimo debe ser un número positivo'),
  body('user_id').notEmpty().withMessage('El user_id es requerido'),
  checkValidators,
];

export const validateUpdateCreditCard = [
  param('id').notEmpty().withMessage('El ID de la tarjeta es requerido'),
  body('name').optional().isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('type').optional().isIn(['Visa', 'Mastercard', 'Amex']).withMessage('Tipo de tarjeta inválido'),
  body('currency').optional().isIn(['GTQ', 'USD']).withMessage('Moneda inválida'),
  body('authorizedLimit').optional().isFloat({ min: 0 }).withMessage('El límite autorizado debe ser un número positivo'),
  body('status').optional().isIn(['ACTIVA', 'BLOQUEADA', 'CERRADA']).withMessage('Estado inválido'),
  checkValidators,
];

export const validateCreditCardId = [
  param('id').notEmpty().withMessage('El ID de la tarjeta es requerido'),
  checkValidators,
];
