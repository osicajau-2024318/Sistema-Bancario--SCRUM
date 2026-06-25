import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateLoan = [
  body('name').notEmpty().withMessage('El nombre del préstamo es requerido').isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('type').optional().isIn(['Crédito Automotriz', 'Consumo', 'Hipotecario', 'Personal']).withMessage('Tipo de préstamo inválido'),
  body('principalAmount').notEmpty().withMessage('El monto original es requerido').isFloat({ min: 0 }).withMessage('El monto original debe ser un número positivo'),
  body('outstandingBalance').optional().isFloat({ min: 0 }).withMessage('El saldo pendiente debe ser un número positivo'),
  body('interestRate').optional().isFloat({ min: 0 }).withMessage('La tasa de interés debe ser un número positivo'),
  body('monthlyInstallment').optional().isFloat({ min: 0 }).withMessage('La cuota mensual debe ser un número positivo'),
  body('user_id').notEmpty().withMessage('El user_id es requerido'),
  checkValidators,
];

export const validateUpdateLoan = [
  param('id').notEmpty().withMessage('El ID del préstamo es requerido'),
  body('name').optional().isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('type').optional().isIn(['Crédito Automotriz', 'Consumo', 'Hipotecario', 'Personal']).withMessage('Tipo de préstamo inválido'),
  body('principalAmount').optional().isFloat({ min: 0 }).withMessage('El monto original debe ser un número positivo'),
  body('status').optional().isIn(['ACTIVO', 'PAGADO', 'CANCELADO']).withMessage('Estado inválido'),
  checkValidators,
];

export const validateLoanId = [
  param('id').notEmpty().withMessage('El ID del préstamo es requerido'),
  checkValidators,
];
