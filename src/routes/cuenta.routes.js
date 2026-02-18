import { Router } from 'express';
import {
    crearCuenta,
    obtenerTodasCuentas,
    obtenerMisCuentas,
    obtenerCuentaPorId,
    obtenerCuentaPorNumero,
    actualizarCuenta,
    cambiarEstadoCuenta,
    eliminarCuenta
} from '../controllers/cuenta.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import {
    validateCrearCuenta,
    validateActualizarCuenta,
    validateCambiarEstado,
    validateIdParam,
    validateNumeroCuentaParam
} from '../../middlewares/cuenta-validators.js';

const router = Router();

// Todas las rutas requieren autenticación 
router.use(validateJWT);

// Crear cuenta (Admin puede para cualquier usuario, Cliente solo para sí mismo)
router.post('/create',
    validateCrearCuenta,
    crearCuenta);

// Obtener todas las cuentas (Solo Admin)
router.get('/',
    validateRole('ADMIN'),
    obtenerTodasCuentas);

// Obtener mis cuentas (Cliente o Admin)
router.get('/mis-cuentas',
    obtenerMisCuentas);

// Obtener cuenta por ID
router.get('/:id',
    validateIdParam,
    obtenerCuentaPorId);

// Obtener cuenta por número de cuenta
router.get('/numero/:numeroCuenta',
    validateNumeroCuentaParam,
    obtenerCuentaPorNumero);

// Actualizar cuenta
router.put('/:id', 
    validateIdParam,
    validateActualizarCuenta,
    actualizarCuenta);

// Cambiar estado de cuenta (Solo Admin)
router.patch('/:id/estado',
    validateRole('ADMIN'),
    validateIdParam,
    validateCambiarEstado,
    cambiarEstadoCuenta);

// Eliminar cuenta "Solo puede eliminar el ADMIN"
router.delete('/:id',
    validateRole('ADMIN'),
    validateIdParam,
    eliminarCuenta);

export default router;