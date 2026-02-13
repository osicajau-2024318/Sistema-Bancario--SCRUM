import { Router } from "express";
import { auth } from "../middlewares/auth.js";

import {
    createCuenta,
    getCuentas,
    getCuentaById,
    updateCuenta,
    deleteCuenta
} from "./cuenta.controller.js";

const route = Router();

route.post(
    "/",
    auth,
    createCuenta
);

route.get(
    "/",
    auth,
    getCuentas
);

route.get(
    "/:id",
    auth,
    getCuentaById
);

route.put(
    "/:id",
    auth,
    updateCuenta
);

route.delete(
    "/:id",
    auth,
    deleteCuenta
);

export default route;
