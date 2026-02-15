import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    getUsers, 
    updateUser, 
    deleteUser 
} from "../controllers/user.controller.js";

// Importar middlewares correctos
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { validateRole } from "../../middlewares/validate-role.js";
import { validateRegister, validateLogin } from "../../middlewares/auth-validators.js";

const route = Router();

// Rutas públicas no necesitan JWT
route.post(
    "/register",
    validateRegister,  //  Validar campos
    registerUser
);

route.post(
    "/login",
    validateLogin,     //  Validar campos
    loginUser
);

// Rutas protegidas dÍ necesitan JWT
route.get(
    "/",
    validateJWT,       // Validar que tenga token
    validateRole('ADMIN'),  // Solo admin puede ver todos los usuarios
    getUsers
);

route.put(
    "/:id",
    validateJWT,       //  Validar que tenga token
    updateUser
);

route.delete(
    "/:id",
    validateJWT,       // Validar que tenga token
    validateRole('ADMIN'),  //  Solo admin puede eliminar
    deleteUser
);

export default route;