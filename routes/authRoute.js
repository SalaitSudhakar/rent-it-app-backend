import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { authLimiter } from "../config/rateLimitConfig.js";
import verifyToken from "../middleware/authMiddleware.js";
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from "../validators/authValidator.js";
import validateData from "../middleware/validate.js";

const route = express.Router();

route.post(
  "/register",
  authLimiter,
  registerValidator,
  validateData,
  register,
);
route.post("/login", authLimiter, loginValidator, validateData, login);
route.post("/refresh", refreshToken);
route.post("/logout", verifyToken, logout);
route.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validateData,
  forgotPassword,
);
route.post(
  "/reset-password",
  resetPasswordValidator,
  validateData,
  resetPassword,
);

export default route;
