import { Router } from "express"
import { UsersController } from "../controllers/users.controller.js"
import { requireAuth, requireRole } from "../middleware/auth.middleware.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { UpdateProfileSchema } from "../utils/validators.js"

export const usersRoutes = Router()

usersRoutes.patch(
  "/me",
  requireAuth,
  validateBody(UpdateProfileSchema),
  asyncHandler(UsersController.updateMe),
)

usersRoutes.get(
  "/",
  ...requireRole("admin"),
  asyncHandler(UsersController.listAdmin),
)
