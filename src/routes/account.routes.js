import { Router } from 'express';
import { 
  createAccount,
  createMyAccount,
  activateAccount,
  getMyAccount,
  getMyInfo,
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
import { validateTransfer } from '../../middlewares/account.validators.js';


const router = Router();

// ─── USUARIO ───
router.get('/my-info', validateJWT, getMyInfo);           // PRIMERO
router.get('/me', validateJWT, getMyAccount);
router.post('/my-account', validateJWT, validateRole(Roles.USER), createMyAccount);
router.put('/me', validateJWT, validateRole(Roles.USER), updateAccount);
router.post('/transfer', validateJWT, validateRole(Roles.USER), validateTransfer, transfer);

// ─── ADMIN ───
router.post('/', validateJWT, validateRole(Roles.ADMIN), createAccount);
router.post('/:accountId/activate', validateJWT, validateRole(Roles.ADMIN), activateAccount);
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllAccounts);
router.get('/by-activity', validateJWT, validateRole(Roles.ADMIN), getAccountsByActivity);
router.get('/by-balance', validateJWT, validateRole(Roles.ADMIN), getAccountsByBalance);
router.get('/by-movements', validateJWT, validateRole(Roles.ADMIN), getAccountsByMovements);
router.get('/:accountId/movements', validateJWT, validateRole(Roles.ADMIN), getAccountMovements);
router.get('/:id', validateJWT, validateRole(Roles.ADMIN), getAccountById);  // ÚLTIMO

export default router;