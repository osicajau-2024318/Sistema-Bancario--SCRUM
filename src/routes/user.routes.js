import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    getUsers, 
    updateUser, 
    deleteUser 
} from "./user.controller.js";

const route = Router();

route.post(
    "/register",
    registerUser
);

route.post(
    "/login",
    loginUser
);

route.get(
    "/",
    getUsers
);

route.put(
    "/:id",
    updateUser
);

route.delete(
    "/:id",
    deleteUser
);

export default route;
