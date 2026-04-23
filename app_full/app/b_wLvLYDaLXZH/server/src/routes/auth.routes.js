import { Router } from "express"
import { AuthController } from "../controllers/auth.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { authLimiter } from "../middleware/rate-limit.middleware.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { LoginSchema, RegisterSchema } from "../utils/validators.js"

export const authRoutes = Router()

authRoutes.post(
  "/register",
  authLimiter,
  validateBody(RegisterSchema),
  asyncHandler(AuthController.register),
)
authRoutes.post(
  "/login",
  authLimiter,
  validateBody(LoginSchema),
  asyncHandler(AuthController.login),
)
authRoutes.post("/refresh", asyncHandler(AuthController.refresh))
authRoutes.post("/logout", asyncHandler(AuthController.logout))
authRoutes.get("/me", requireAuth, asyncHandler(AuthController.me))
authRoutes.post(
  "/change-password",
  requireAuth,
  asyncHandler(AuthController.changePassword),
)
