import { Router } from 'express';
import { getMyCreditCards, getAllCreditCards, createCreditCard, updateCreditCard, deleteCreditCard } from '../controllers/credit-card.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateCreateCreditCard, validateUpdateCreditCard, validateCreditCardId } from '../../middlewares/credit-card.validators.js';

const router = Router();

router.get('/me', validateJWT, getMyCreditCards);

router.get('/', validateJWT, validateRole(Roles.ADMIN), getAllCreditCards);

router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateCreditCard, createCreditCard);

router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateCreditCard, updateCreditCard);

router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateCreditCardId, deleteCreditCard);

export default router;
