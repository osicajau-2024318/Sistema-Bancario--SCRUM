import { Router } from 'express';
import { convertMoney, convertAccountCurrency, getRates } from '../controllers/currency.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateCurrencyConvert } from '../../middlewares/currency.validators.js';

const router = Router();

// Listado completo de tasas de cambio para una moneda base (default GTQ)
router.get('/rates', validateJWT, getRates);

// Convertir monto entre monedas (ej: ?from=GTQ&to=USD&amount=100)
router.get('/convert', validateJWT, validateCurrencyConvert, convertMoney);

// Convertir saldo de una cuenta a otra moneda (ej: /currency/:accountId?to=USD)
router.get('/:accountId', validateJWT, convertAccountCurrency);

export default router;