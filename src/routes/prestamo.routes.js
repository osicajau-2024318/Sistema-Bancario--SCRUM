import { Router } from "express";
import {
    createPrestamo,
    getPrestamos,
    getPrestamoById,
    updatePrestamo,
    deletePrestamo
} from "../controllers/prestamo.controller.js";

import { auth } from "../middlewares/auth.js";

const router = Router();

router.post(
    "/",
    auth,
    createPrestamo
);

router.get(
    "/",
    auth,
    getPrestamos
);

router.get(
    "/:id",
    auth,
    getPrestamoById
);

router.put(
    "/:id",
    auth,
    updatePrestamo
);

router.delete(
    "/:id",
    auth,
    deletePrestamo
);

export default router;
