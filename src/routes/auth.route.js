import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
const route = Router();

route.post("/", login);

export default route;
