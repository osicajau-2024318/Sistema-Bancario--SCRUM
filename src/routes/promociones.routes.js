import { Router } from "express";
import {
    createPromocion,
    getPromociones,
    updatePromocion,
    deletePromocion
} from "./promocion.controller.js";

const route = Router();

route.post(
    "/",
    createPromocion
);

route.get(
    "/",
    getPromociones
);

route.put(
    "/:id",
    updatePromocion
);

route.delete(
    "/:id",
    deletePromocion
);

export default route;
