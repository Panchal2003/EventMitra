import { Router } from "express";
import { getProfile, login, register, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authenticate, getProfile);
authRoutes.put("/me", authenticate, updateProfile);
