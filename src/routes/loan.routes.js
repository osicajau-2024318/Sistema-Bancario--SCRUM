import { Router } from 'express';
import { getMyLoans, getAllLoans, createLoan, updateLoan, deleteLoan } from '../controllers/loan.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateCreateLoan, validateUpdateLoan, validateLoanId } from '../../middlewares/loan.validators.js';

const router = Router();

router.get('/me', validateJWT, getMyLoans);

router.get('/', validateJWT, validateRole(Roles.ADMIN), getAllLoans);

router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateLoan, createLoan);

router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateLoan, updateLoan);

router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateLoanId, deleteLoan);

export default router;
