import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateAccount = [
  // Datos del usuario (obligatorios)
  body('name')
    .notEmpty()
    .withMessage('Nombre es obligatorio')
    .bail()
    .isLength({ max: 25 })
    .withMessage('Nombre máximo 25 caracteres'),

  body('surname')
    .notEmpty()
    .withMessage('Apellido es obligatorio')
    .bail()
    .isLength({ max: 25 })
    .withMessage('Apellido máximo 25 caracteres'),

  body('username')
    .notEmpty()
    .withMessage('Username es obligatorio')
    .bail()
    .isLength({ max: 25 })
    .withMessage('Username máximo 25 caracteres'),

  body('email')
    .notEmpty()
    .withMessage('Email es obligatorio')
    .bail()
    .isEmail()
    .withMessage('Email inválido'),

  body('password')
    .notEmpty()
    .withMessage('Contraseña es obligatoria')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Contraseña mínimo 8 caracteres'),

  body('phone')
    .notEmpty()
    .withMessage('Teléfono es obligatorio')
    .bail()
    .isLength({ min: 8, max: 8 })
    .withMessage('Teléfono debe tener 8 dígitos'),

  // Campos opcionales
  body('dpi')
    .optional()
    .isLength({ min: 13, max: 13 })
    .withMessage('DPI debe tener 13 dígitos'),

  body('address')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Dirección máximo 100 caracteres'),

  body('workName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Lugar de trabajo máximo 50 caracteres'),

  body('monthlyIncome')
    .notEmpty()
    .withMessage('Ingresos mensuales son obligatorios')
    .bail()
    .isFloat({ min: 100 })
    .withMessage('Ingresos mensuales deben ser >= Q100'),

  body('account_type')
    .optional()
    .isIn(['AHORRO', 'CORRIENTE', 'NOMINA'])
    .withMessage('Tipo de cuenta inválido'),

  checkValidators
];

export const validateTransfer = [
  body('fromAccount')
    .notEmpty()
    .withMessage('Cuenta origen obligatoria (número de tu cuenta desde la que envías)'),

  body('toAccount')
    .notEmpty()
    .withMessage('Cuenta destino obligatoria'),

  body('amount')
    .isFloat({ min: 5, max: 2000 })
    .withMessage('El monto debe estar entre Q5 y Q2,000'),

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

export const validateAccountIdParam = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),

  checkValidators
];