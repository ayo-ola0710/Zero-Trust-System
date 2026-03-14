import { Router } from "express";
import { register, login, logout } from "../controller/authController.js";
import { authenticate } from "../middleware/zeroTrustMiddleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/logout", authenticate, logout);
export default authRouter;

