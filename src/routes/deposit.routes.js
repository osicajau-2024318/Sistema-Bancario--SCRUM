import { Router } from 'express';
import { createDeposit, revertDeposit, getPendingDeposits } from '../controllers/deposit.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';

const router = Router();

// El usuario puede crear un depósito en su propia cuenta
router.post('/', validateJWT, createDeposit);

// Solo admin puede ver depósitos pendientes
router.get('/pending', validateJWT, validateRole(Roles.ADMIN), getPendingDeposits);

// Solo admin puede revertir
router.post('/revert', validateJWT, validateRole(Roles.ADMIN), revertDeposit);

export default router;