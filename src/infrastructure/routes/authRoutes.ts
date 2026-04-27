import { Router } from "express";
import { container } from "../ioc/registry";

import AuthController from "../../controllers/AuthController";

const router = Router();
const authController = container.resolve("AuthController") as AuthController;

router.post("/login", (req, res, next) => authController.login(req, res));

export default router;
