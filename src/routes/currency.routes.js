import { Router } from 'express';
import { convertMoney, convertAccountCurrency } from '../controllers/currency.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateCurrencyConvert } from '../../middlewares/currency.validators.js';

const router = Router();

// Convertir monto entre monedas (ej: ?from=GTQ&to=USD&amount=100)
router.get('/convert', validateJWT, validateCurrencyConvert, convertMoney);

// Convertir saldo de una cuenta a otra moneda (ej: /currency/:accountId?to=USD)
router.get('/:accountId', validateJWT, convertAccountCurrency);

export default router;