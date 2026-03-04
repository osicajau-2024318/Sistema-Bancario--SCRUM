// Importa Router de Express para definir las rutas
import { Router } from 'express';
// Importa todos los controladores de cuentas bancarias
import { 
  createAccount,        // Crear cuenta (admin)
  createMyAccount,      // Crear mi cuenta (usuario)
  activateAccount,      // Activar cuenta pendiente (admin)
  getMyAccount,         // Obtener mis cuentas
  getMyInfo,            // Obtener mi info completa (usuario + cuentas)
  transfer,             // Realizar transferencia
  getAccountById,       // Obtener cuenta por ID
  getAccountsByActivity, // Filtrar cuentas por actividad
  getAccountsByBalance,  // Ordenar cuentas por saldo
  getAllAccounts,        // Ver todas las cuentas
  updateAccount,         // Actualizar cuenta
  getAccountsByMovements, // Ordenar cuentas por cantidad de movimientos
  getAccountMovements     // Ver movimientos de una cuenta
} from '../controllers/account.controller.js';
// Importa middleware para validar el token JWT
import { validateJWT } from '../../middlewares/validate-JWT.js';
// Importa middleware para validar el rol del usuario
import { validateRole } from '../../middlewares/validate-role.js';
// Importa constantes de roles
import { Roles } from '../constants/roles.js';
// Importa validadores de transferencia
import { validateTransfer } from '../../middlewares/account.validators.js';


const router = Router();

// RUTAS DE USUARIO (requieren autenticación)
// Obtener información completa del usuario (datos personales + cuentas)
router.get('/my-info', validateJWT, getMyInfo);
// Obtener solo las cuentas del usuario autenticado
router.get('/me', validateJWT, getMyAccount);
// Crear una nueva cuenta propia (queda pendiente de activación)
router.post('/my-account', validateJWT, validateRole(Roles.USER), createMyAccount);
// Realizar una transferencia a otra cuenta
router.post('/transfer', validateJWT, validateRole(Roles.USER), validateTransfer, transfer);

// RUTAS DE ADMINISTRADOR (requieren autenticación y rol ADMIN)
// Crear cuenta para cualquier usuario (queda activa inmediatamente)
router.post('/', validateJWT, validateRole(Roles.ADMIN), createAccount);
// Activar una cuenta que está en estado PENDIENTE
router.post('/:accountId/activate', validateJWT, validateRole(Roles.ADMIN), activateAccount);
// Ver todas las cuentas del sistema
router.get('/all', validateJWT, validateRole(Roles.ADMIN), getAllAccounts);
// Filtrar cuentas por estado de actividad (activas/inactivas)
router.get('/by-activity', validateJWT, validateRole(Roles.ADMIN), getAccountsByActivity);
// Obtener cuentas ordenadas por saldo (ascendente o descendente)
router.get('/by-balance', validateJWT, validateRole(Roles.ADMIN), getAccountsByBalance);
// Obtener cuentas ordenadas por cantidad de movimientos
router.get('/by-movements', validateJWT, validateRole(Roles.ADMIN), getAccountsByMovements);
// Ver los últimos movimientos de una cuenta específica
router.get('/:accountId/movements', validateJWT, validateRole(Roles.ADMIN), getAccountMovements);
// Actualizar información de una cuenta (no permite modificar el saldo)
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), updateAccount);
// Obtener detalles de una cuenta por su ID (debe ir al final por ser ruta dinámica)
router.get('/:id', validateJWT, validateRole(Roles.ADMIN), getAccountById);

export default router;