// Importa Router de Express para definir las rutas
import { Router } from 'express';
// Importa controladores de transacciones
import { 
  transfer,
  getMyTransactions,
  getAllMyTransactions,
  getTransactionById,
  getAllTransactions,
  getHistoryMe,
  getHistoryByAccountId
} from '../controllers/transaction.controller.js';
// Importa controlador para crear depósitos
import { createDeposit } from '../controllers/deposit.controller.js';
// Importa middleware para validar el token JWT
import { validateJWT } from '../../middlewares/validate-JWT.js';
// Importa middleware para validar el rol del usuario
import { validateRole } from '../../middlewares/validate-role.js';
// Importa constantes de roles
import { Roles } from '../constants/roles.js';
// Importa validadores de depósito y transferencia
import { validateDeposit, validateTransfer } from '../../middlewares/transaction.validators.js';

const router = Router();

// RUTAS DE ADMINISTRADOR
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllTransactions);

// Historial de cuenta: depósitos y transferencias en orden fecha/hora
// Cualquier usuario (cliente o admin) ve su propio historial
router.get('/history/me', validateJWT, getHistoryMe);
// Admin ve historial de una cuenta por ID
router.get('/history/:accountId', validateJWT, validateRole(Roles.ADMIN), getHistoryByAccountId);

// RUTAS PÚBLICAS (sin autenticación)
// Crear depósito a una cuenta (por ventanilla, queda pendiente de aprobación)
router.post('/deposit', validateDeposit, createDeposit);

// RUTAS DE CLIENTE (requieren autenticación)
// Obtener transacciones propias con filtros (paginación, tipo, fechas)
router.get('/my-transactions', validateJWT, getMyTransactions);
// Obtener todas las transacciones propias usando el token
router.get('/my-transactionsToken', validateJWT, getAllMyTransactions);
// Realizar una transferencia a otra cuenta
router.post('/transfer', validateJWT, validateRole(Roles.USER), validateTransfer, transfer);
// Alias de /my-transactions
router.get('/', validateJWT, getMyTransactions);

// Ruta dinámica para obtener una transacción específica por ID (debe ir al final)
router.get('/:id', validateJWT, getTransactionById);

export default router;