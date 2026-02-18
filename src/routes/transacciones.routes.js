import { Router } from "express";
import {
	createTransaccion,
	getTransacciones,
	getTransaccionById,
	modificarORevertirDeposito,
} from "../controllers/transacciones.controller.js";

import { validateJWT } from "../../middlewares/validate-JWT.js";

const route = Router();

route.post(
	"/",
	validateJWT,
	createTransaccion
);

route.get(
	"/",
	validateJWT,
	getTransacciones
);

route.get(
	"/:id",
	validateJWT,
	getTransaccionById
);

// Usado para modificar o revertir depósitos
route.put(
	"/:id",
	validateJWT,
	modificarORevertirDeposito
);

export default route;
