import { Router } from 'express';
import {
    crearCuenta,
    crearCuentaByAdmin,
    obtenerTodasCuentas,
    obtenerMisCuentas,
    obtenerCuentaPorId,
    obtenerCuentaPorNumero,
    actualizarCuenta,
    cambiarEstadoCuenta,
    cerrarCuenta,
    obtenerCuentasPendientes,
    aprobarCuenta,
    desactivarCuenta,
    activarCuentaCerrada
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

// Crear cuenta como cliente (requiere aprobación)
router.post(
    '/create',
    validateCrearCuenta,
    crearCuenta
);

// Ver mis cuentas aprobadas
router.get(
    '/mis-cuentas',
    obtenerMisCuentas
);

// Ver cuenta por ID (solo propias o admin)
router.get(
    '/:id',
    validateIdParam,
    obtenerCuentaPorId
);

// Ver cuenta por número (solo propias o admin)
router.get(
    '/numero/:numeroCuenta',
    validateNumeroCuentaParam,
    obtenerCuentaPorNumero
);

// ==========================================
// RUTAS SOLO ADMIN
// ==========================================

// Crear cuenta como admin (directamente aprobada)
router.post(
    '/create-admin',
    validateRole('ADMIN'),
    validateCrearCuenta,
    crearCuentaByAdmin
);

// Ver todas las cuentas aprobadas
router.get(
    '/',
    validateRole('ADMIN'),
    obtenerTodasCuentas
);

// Ver cuentas pendientes de aprobación
router.get(
    '/admin/pendientes',
    validateRole('ADMIN'),
    obtenerCuentasPendientes
);

// Aprobar cuenta
router.patch(
    '/:id/aprobar',
    validateRole('ADMIN'),
    validateIdParam,
    aprobarCuenta
);

// Desactivar/Rechazar cuenta
router.patch(
    '/:id/desactivar',
    validateRole('ADMIN'),
    validateIdParam,
    desactivarCuenta
);

// Activar cuenta cerrada (reactivar)
router.patch(
    '/:id/activar-cerrada',
    validateRole('ADMIN'),
    validateIdParam,
    activarCuentaCerrada
);

// Actualizar cuenta (solo admin)
router.put(
    '/:id',
    validateRole('ADMIN'),
    validateIdParam,
    validateActualizarCuenta,
    actualizarCuenta
);

// Cambiar estado de cuenta (solo admin)
router.patch(
    '/:id/estado',
    validateRole('ADMIN'),
    validateIdParam,
    validateCambiarEstado,
    cambiarEstadoCuenta
);

// Cerrar cuenta (solo admin) - equivale a "eliminar"
router.delete(
    '/:id',
    validateRole('ADMIN'),
    validateIdParam,
    cerrarCuenta
);

export default router;