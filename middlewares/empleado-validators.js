import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';

// Validar registro de empleado
export const validateRegisterEmpleado = [
    body('empleado_name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('empleado_surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('empleado_email')
        .trim()
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('empleado_password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('empleado_dpi')
        .trim()
        .notEmpty()
        .withMessage('El DPI es obligatorio')
        .matches(/^\d{13}$/)
        .withMessage('El DPI debe tener exactamente 13 dígitos'),
    
    body('empleado_age')
        .notEmpty()
        .withMessage('La edad es obligatoria')
        .isInt({ min: 18, max: 70 })
        .withMessage('La edad debe estar entre 18 y 70 años'),
    
    body('empleado_antique')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La antigüedad no puede ser negativa'),
    
    body('empleado_salary')
        .notEmpty()
        .withMessage('El salario es obligatorio')
        .isNumeric()
        .withMessage('El salario debe ser un número')
        .custom((value) => {
            if (value < 0) {
                throw new Error('El salario no puede ser negativo');
            }
            return true;
        }),
    
    body('empleado_post')
        .notEmpty()
        .withMessage('El puesto es obligatorio')
        .isIn(['CAJERO', 'ASESOR', 'GERENTE', 'SUPERVISOR', 'ANALISTA'])
        .withMessage('Puesto no válido. Valores permitidos: CAJERO, ASESOR, GERENTE, SUPERVISOR, ANALISTA'),
    
    checkValidators
];

// Validar login de empleado
export const validateLoginEmpleado = [
    body('empleado_email')
        .trim()
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    
    body('empleado_password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    
    checkValidators
];

// Validar creación de cuenta por empleado
export const validateCrearCuenta = [
    body('user_id')
        .notEmpty()
        .withMessage('El ID del usuario es obligatorio')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    
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
    
    // Validación condicional del saldo mínimo según la moneda
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
    
    checkValidators
];