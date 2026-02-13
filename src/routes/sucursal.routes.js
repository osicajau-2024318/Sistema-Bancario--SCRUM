import { Router } from "express";
import {
    createSucursal,
    getSucursales,
    updateSucursal,
    deleteSucursal
} from "./sucursal.controller.js";

const route = Router();

route.post("/", createSucursal);
route.get("/", getSucursales);
route.put("/:id", updateSucursal);
route.delete("/:id", deleteSucursal);

export default route;
