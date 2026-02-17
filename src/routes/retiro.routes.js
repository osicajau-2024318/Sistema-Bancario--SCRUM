import { Router } from "express";
import {
    createRetiro,
    getRetiros,
    getRetiroById,
    updateRetiro,
    deleteRetiro
} from "../controllers/retiro.controller.js";

// Aquí asumo que tienes un middleware de autenticación
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Crear un retiro
router.post("/", verifyToken, createRetiro);

// Obtener todos los retiros activos
router.get("/", verifyToken, getRetiros);

// Obtener un retiro por id
router.get("/:id", verifyToken, getRetiroById);

// Actualizar un retiro
router.put("/:id", verifyToken, updateRetiro);

// Eliminar un retiro (soft delete)
router.delete("/:id", verifyToken, deleteRetiro);

export default router;
