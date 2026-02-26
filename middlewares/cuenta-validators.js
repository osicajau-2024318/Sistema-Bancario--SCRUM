import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCrearCuenta = [
    body('account_type')
        .optional()
        .isIn(['AHORRO', 'CORRIENTE', 'NOMINA'])
        .withMessage('Tipo de cuenta no válido'),

    body('account_balance')
        .notEmpty()
        .withMessage('El saldo inicial es obligatorio')
        .isNumeric()
        .withMessage('El saldo debe ser un número')
        .custom((value) => {
            if (value < 0) {
                throw new Error('El saldo no puede ser negativo');
            }
            return true;
        }),

    body('moneda')
        .notEmpty()
        .withMessage('La moneda es obligatoria')
        .isIn(['GTQ', 'USD'])
        .withMessage('Moneda no válida. Use GTQ o USD'),

    // Validación de saldo mínimo según moneda
    body('account_balance')
        .custom((value, { req }) => {
            const moneda = req.body.moneda;

            if (moneda === 'GTQ' && value < 100) {
                throw new Error('El saldo mínimo para cuentas en Quetzales es Q100');
            }

            if (moneda === 'USD' && value < 25) {
                throw new Error('El saldo mínimo para cuentas en Dólares es $25');
            }

            return true;
        }),

    body('user_id')
        .optional()
        .isMongoId()
        .withMessage('ID de usuario inválido'),

    checkValidators
];

export const validateActualizarCuenta = [
    body('account_type')
        .optional()
        .isIn(['AHORRO', 'CORRIENTE', 'NOMINA'])
        .withMessage('Tipo de cuenta no válido'),

    body('estado')
        .optional()
        .isIn(['ACTIVA', 'BLOQUEADA', 'CERRADA'])
        .withMessage('Estado no válido'),

    checkValidators
];

export const validateCambiarEstado = [
    body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['ACTIVA', 'BLOQUEADA', 'CERRADA'])
        .withMessage('Estado no válido'),

    checkValidators
];

export const validateIdParam = [
    param('id')
        .isMongoId()
        .withMessage('ID inválido'),

    checkValidators
];

export const validateNumeroCuentaParam = [
    param('account_number')
        .matches(/^\d{10}$/)
        .withMessage('Número de cuenta inválido (debe tener 10 dígitos)'),

    checkValidators
];