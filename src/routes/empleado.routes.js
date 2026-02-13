import { Router } from "express";
import {
    createEmpleado,
    getEmpleados,
    updateEmpleado,
    deleteEmpleado
} from "./empleado.controller.js";

const route = Router();

route.post(
    "/",
    createEmpleado
);

route.get(
    "/",
    getEmpleados
);

route.put(
    "/:id",
    updateEmpleado
);

route.delete(
    "/:id",
    deleteEmpleado
);

export default route;
