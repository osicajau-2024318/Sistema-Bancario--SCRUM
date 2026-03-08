import { Router } from 'express';
import { createDeposit, revertDeposit, getPendingDeposits, updateDeposit } from '../controllers/deposit.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateDeposit } from '../../middlewares/transaction.validators.js';

const router = Router();

// Cualquier persona puede hacer un depósito a una cuenta (sin token). Ej: pagar colegiatura en ventanilla.
router.post('/', validateDeposit, createDeposit);

// Solo admin puede ver depósitos pendientes
router.get('/pending', validateJWT, validateRole(Roles.ADMIN), getPendingDeposits);

// Solo admin puede revertir
router.post('/revert', validateJWT, validateRole(Roles.ADMIN), revertDeposit);

// Solo admin puede modificar un depósito
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), updateDeposit);

export default router;