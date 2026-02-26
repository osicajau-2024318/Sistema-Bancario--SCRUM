import { Router } from "express";
import { 
    registerUser,
    registerUserByAdmin,
    loginUser, 
    getUsers, 
    getMyProfile,
    buscarUsuario,
    updateUser, 
    deleteUser,
    obtenerUsuariosPendientes,
    activarUsuario,
    desactivarUsuario
} from "../controllers/user.controller.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { validateRole } from "../../middlewares/validate-role.js";
import { validateRegister, validateLogin } from "../../middlewares/auth-validators.js";

const route = Router();


// Registro público (requiere aprobación del admin)
route.post("/register", validateRegister, registerUser);

// Login
route.post("/login", validateLogin, loginUser);

// Ver mi perfil (Cliente o Admin)
route.get("/me", validateJWT, getMyProfile);

// Registrar usuario como admin
route.post(
    "/register-admin",
    validateJWT,
    validateRole('ADMIN'),
    validateRegister,
    registerUserByAdmin
);

// Buscar usuario específico (por email, username o DPI)
// ⚠️ DEBE ir ANTES de /:id
route.get(
    "/buscar",
    validateJWT,
    validateRole('ADMIN'),
    buscarUsuario
);

// Ver todos los usuarios activos
route.get(
    "/",
    validateJWT,
    validateRole('ADMIN'),
    getUsers
);

// ⚠️ DEBE ir ANTES de /:id — si va después, Express interpreta "pendientes" como un :id
route.get(
    "/pendientes",
    validateJWT,
    validateRole('ADMIN'),
    obtenerUsuariosPendientes
);

// Activar usuario
route.patch(
    "/:id/activar",
    validateJWT,
    validateRole('ADMIN'),
    activarUsuario
);

// Desactivar usuario
route.patch(
    "/:id/desactivar",
    validateJWT,
    validateRole('ADMIN'),
    desactivarUsuario
);

// Actualizar usuario
route.put(
    "/:id",
    validateJWT,
    validateRole('ADMIN'),
    updateUser
);

// Eliminar (desactivar) usuario
route.delete(
    "/:id",
    validateJWT,
    validateRole('ADMIN'),
    deleteUser
);

export default route;