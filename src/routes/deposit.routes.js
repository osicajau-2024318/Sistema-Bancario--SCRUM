import { Router } from 'express';
import { createDeposit, revertDeposit, getPendingDeposits, updateDeposit } from '../controllers/deposit.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateDeposit } from '../../middlewares/transaction.validators.js';
import { validateRevertDeposit, validateUpdateDeposit } from '../../middlewares/deposit.validators.js';

const router = Router();

// Depósito a una cuenta. Solo admin (ventanilla) puede crear depósitos.
// Antes este endpoint era público para simular ventanilla/terceros, pero
// permitía acreditar saldo a cualquier cuenta sin autenticación, lo que
// representaba un riesgo de seguridad real para el sistema bancario.
router.post('/', validateJWT, validateRole(Roles.ADMIN), validateDeposit, createDeposit);

// Solo admin puede ver depósitos pendientes
router.get('/pending', validateJWT, validateRole(Roles.ADMIN), getPendingDeposits);

// Solo admin puede revertir
router.post('/revert', validateJWT, validateRole(Roles.ADMIN), validateRevertDeposit, revertDeposit);

// Solo admin puede modificar un depósito
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateDeposit, updateDeposit);

export default router;