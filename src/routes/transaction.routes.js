import { Router } from 'express';
import { 
  transfer, 
  getMyTransactions, 
  getTransactionById,
  getAllTransactions 
} from '../controllers/transaction.controller.js';
import { createDeposit } from '../controllers/deposit.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateDeposit, validateTransfer } from '../../middlewares/transaction.validators.js';

const router = Router();

// ADMIN
router.post('/deposit', validateJWT, validateRole(Roles.ADMIN), validateDeposit, createDeposit);
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllTransactions);

// CLIENTE - Rutas específicas/raíz primero, dinámicas al final
router.get('/my-transactions', validateJWT, getMyTransactions);
router.post('/transfer', validateJWT, validateRole(Roles.USER), validateTransfer, transfer);
router.get('/', validateJWT, getMyTransactions);

// Ruta dinámica para obtener una transacción por ID (debe ir al final)
router.get('/:id', validateJWT, getTransactionById);

export default router;