import { Router } from "express";
import { 
    registerEmpleado,
    registerEmpleadoByAdmin,
    loginEmpleado,
    getMyProfile,
    updateMyProfile,
    crearCuentaEmpleado,
    verUsuarios,
    verCuentas,
    buscarUsuario,
    getEmpleados,
    buscarEmpleado,
    updateEmpleado,
    deleteEmpleado,
    obtenerEmpleadosPendientes,
    activarEmpleado,
    desactivarEmpleado
} from "../controllers/empleado.controller.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { validateRole } from "../../middlewares/validate-role.js";
import { 
    validateRegisterEmpleado, 
    validateLoginEmpleado,
    validateCrearCuenta
} from "../../middlewares/empleado-validators.js";

const router = Router();

// Registro público de empleado (requiere aprobación del admin)
router.post("/register", validateRegisterEmpleado, registerEmpleado);

// Login de empleado
router.post("/login", validateLoginEmpleado, loginEmpleado);


// Ver mi perfil
router.get(
    "/me", 
    validateJWT, 
    validateRole('EMPLEADO', 'ADMIN'),
    getMyProfile
);

// Actualizar mi perfil
router.put(
    "/me", 
    validateJWT, 
    validateRole('EMPLEADO', 'ADMIN'),
    updateMyProfile
);

// Crear cuenta para usuarios (SIN aprobación - diferencia con clientes)
router.post(
    "/crear-cuenta",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    validateCrearCuenta,
    crearCuentaEmpleado
);

// Ver usuarios activos (Empleado puede ver)
router.get(
    "/usuarios",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    verUsuarios
);

// Ver cuentas activas (Empleado puede ver)
router.get(
    "/cuentas",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    verCuentas
);

// Buscar usuario (Empleado puede buscar)
router.get(
    "/buscar-usuario",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    buscarUsuario
);

// Registrar empleado como admin (sin aprobación)
router.post(
    "/register-admin",
    validateJWT,
    validateRole('ADMIN'),
    validateRegisterEmpleado,
    registerEmpleadoByAdmin
);

// Buscar empleado específico
router.get(
    "/buscar",
    validateJWT,
    validateRole('ADMIN'),
    buscarEmpleado
);

// Ver todos los empleados activos
router.get(
    "/",
    validateJWT,
    validateRole('ADMIN'),
    getEmpleados
);

// Ver empleados pendientes de activación
router.get(
    "/pendientes",
    validateJWT,
    validateRole('ADMIN'),
    obtenerEmpleadosPendientes
);

// Activar empleado
router.patch(
    "/:id/activar",
    validateJWT,
    validateRole('ADMIN'),
    activarEmpleado
);

// Desactivar empleado
router.patch(
    "/:id/desactivar",
    validateJWT,
    validateRole('ADMIN'),
    desactivarEmpleado
);

// Actualizar empleado (solo admin puede actualizar a otros)
router.put(
    "/:id",
    validateJWT,
    validateRole('ADMIN'),
    updateEmpleado
);

// Eliminar (desactivar) empleado
router.delete(
    "/:id",
    validateJWT,
    validateRole('ADMIN'),
    deleteEmpleado
);

export default router;