// Importa Router de Express para definir las rutas
import { Router } from 'express';
// Importa controladores de transacciones
import { 
  transfer,                  // Realizar transferencia entre cuentas
  getMyTransactions,         // Obtener transacciones del usuario con filtros
  getAllMyTransactions,      // Obtener todas las transacciones del usuario
  getTransactionById,        // Obtener una transacción específica por ID
  getAllTransactions         // Obtener todas las transacciones del sistema (admin)
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
// Ver todas las transacciones del sistema con filtros (fecha, tipo, usuario, etc)
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllTransactions);

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