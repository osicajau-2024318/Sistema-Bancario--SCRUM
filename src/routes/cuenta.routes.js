import { Router } from "express";
import { 
    registerEmpleado,
    registerEmpleadoByAdmin,
    loginEmpleado,
    getMyProfile,
    updateMyProfile,
    crearCuentaEmpleado,
    getMisCuentasEmpleado,
    actualizarCuentaEmpleado,
    buscarCuentaEmpleado,
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



// Ver mi perfil de empleado
router.get(
    "/me", 
    validateJWT, 
    validateRole('EMPLEADO', 'ADMIN'),
    getMyProfile
);

// Actualizar mi perfil de empleado
router.put(
    "/me", 
    validateJWT, 
    validateRole('EMPLEADO', 'ADMIN'),
    updateMyProfile
);

// Ver mis cuentas (cuentas activas del sistema que el empleado gestiona)
router.get(
    "/mis-cuentas",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    getMisCuentasEmpleado
);

// Buscar cuenta por número de cuenta
router.get(
    "/buscar-cuenta",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    buscarCuentaEmpleado
);

// Crear cuenta para usuarios (directamente aprobada, sin esperar admin)
router.post(
    "/crear-cuenta",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    validateCrearCuenta,
    crearCuentaEmpleado
);

// Actualizar una cuenta específica (tipo y estado)
router.put(
    "/cuenta/:id",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    actualizarCuentaEmpleado
);

// Ver usuarios activos
router.get(
    "/usuarios",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    verUsuarios
);

// Buscar usuario por email, username o DPI
router.get(
    "/buscar-usuario",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    buscarUsuario
);

// Ver todas las cuentas activas (con filtro opcional ?estado=ACTIVA|BLOQUEADA|CERRADA)
router.get(
    "/cuentas",
    validateJWT,
    validateRole('EMPLEADO', 'ADMIN'),
    verCuentas
);



// Registrar empleado como admin (directamente activo)
router.post(
    "/register-admin",
    validateJWT,
    validateRole('ADMIN'),
    validateRegisterEmpleado,
    registerEmpleadoByAdmin
);

// Buscar empleado por email o DPI
router.get(
    "/buscar",
    validateJWT,
    validateRole('ADMIN'),
    buscarEmpleado
);

// ⚠️ DEBE ir ANTES de /:id
// Ver empleados pendientes de activación
router.get(
    "/pendientes",
    validateJWT,
    validateRole('ADMIN'),
    obtenerEmpleadosPendientes
);

// Ver todos los empleados activos
router.get(
    "/",
    validateJWT,
    validateRole('ADMIN'),
    getEmpleados
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

// Actualizar datos de un empleado (admin actualiza a otros)
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