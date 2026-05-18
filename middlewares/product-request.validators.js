import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateProductRequest = [
  body('productId').isMongoId().withMessage('productId inválido'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('notes no puede exceder 500 caracteres'),
  checkValidators,
];

export const validateUpdateProductRequestStatus = [
  param('id').isMongoId().withMessage('ID de solicitud inválido'),
  body('status')
    .notEmpty()
    .withMessage('status obligatorio')
    .isIn(['APROBADO', 'RECHAZADO'])
    .withMessage('status debe ser APROBADO o RECHAZADO'),
  body('adminNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('adminNotes no puede exceder 500 caracteres'),
  checkValidators,
];
