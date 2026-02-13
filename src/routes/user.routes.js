import { Router } from "express";

import { 
    registerUser, 
    loginUser, 
    getUsers, 
    updateUser, 
    deleteUser 
} from "./user.controller.js";

import {auth} from "../middlewares/auth.js";

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
    auth,
    getUsers
);

route.put(
    "/:id",
    auth,
    updateUser
);

route.delete(
    "/:id",
    auth,
    deleteUser
);

export default route;

