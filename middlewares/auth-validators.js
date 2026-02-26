'use strict';

import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateRegister = [
    body('user_name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),
    
    body('user_username')
        .trim()
        .notEmpty().withMessage('El username es obligatorio')
        .isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
    
    body('user_email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    
    body('user_password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
    
    body('user_dpi')
        .trim()
        .notEmpty().withMessage('El DPI es obligatorio')
        .matches(/^\d{13}$/).withMessage('El DPI debe tener 13 dígitos'),
    
    body('user_address')
        .trim()
        .notEmpty().withMessage('La dirección es obligatoria'),
    
    body('user_phone_number')
        .trim()
        .notEmpty().withMessage('El celular es obligatorio')
        .matches(/^\d{8}$/).withMessage('El celular debe tener 8 dígitos'),
    
    body('user_name_work')
        .trim()
        .notEmpty().withMessage('El nombre de trabajo es obligatorio'),
    
    body('user_income_month')
        .notEmpty().withMessage('Los ingresos mensuales son obligatorios')
        .isNumeric().withMessage('Debe ser un número')
        .custom((value) => {
            if (value < 100) {
                throw new Error('Los ingresos deben ser al menos Q100');
            }
            return true;
        }),
    
    checkValidators
];

export const validateLogin = [
    body('user_email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Email inválido'),
    
    body('user_password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    
    checkValidators
];