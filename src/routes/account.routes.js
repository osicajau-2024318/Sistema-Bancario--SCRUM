import { Router } from 'express';
import multer from 'multer';
import { 
  createAccount, 
  getMyAccount, 
  transfer, 
  getAccountById, 
  getAccountsByActivity, 
  getAccountsByBalance,
  getAllAccounts,
  updateAccount,
  getAccountsByMovements,
  getAccountMovements
} from '../controllers/account.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateCreateAccount, validateTransfer } from '../../middlewares/account.validators.js';

const router = Router();
const parseFormData = multer().none();

// Rutas de cliente (deben estar ANTES que /:id)
router.get('/me', validateJWT, getMyAccount);
router.put('/me', validateJWT, validateRole(Roles.USER), updateAccount);
router.post('/transfer', validateJWT, validateRole(Roles.USER), validateTransfer, transfer);

// Rutas de admin
router.post('/', validateJWT, validateRole(Roles.ADMIN), parseFormData, validateCreateAccount, createAccount);
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllAccounts);
router.get('/by-activity', validateJWT, validateRole(Roles.ADMIN), getAccountsByActivity);
router.get('/by-balance', validateJWT, validateRole(Roles.ADMIN), getAccountsByBalance);
router.get('/by-movements', validateJWT, validateRole(Roles.ADMIN), getAccountsByMovements);
router.get('/:accountId/movements', validateJWT, validateRole(Roles.ADMIN), getAccountMovements);
router.get('/:id', validateJWT, validateRole(Roles.ADMIN), getAccountById);

export default router;
