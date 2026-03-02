import { Router } from 'express';
import { convertMoney } from '../controllers/currency.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateCurrencyConvert } from '../../middlewares/currency.validators.js';

const router = Router();

// Cliente
router.get('/convert', validateJWT, validateCurrencyConvert, convertMoney);

export default router;