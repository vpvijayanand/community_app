import { Router } from "express"
import { ProgressController } from "../controllers/progress.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ProgressSchema } from "../utils/validators.js"

export const progressRoutes = Router()

progressRoutes.use(requireAuth)

progressRoutes.get("/", asyncHandler(ProgressController.mapForUser))
progressRoutes.put(
  "/:slug",
  validateBody(ProgressSchema),
  asyncHandler(ProgressController.upsert),
)
progressRoutes.delete("/:slug", asyncHandler(ProgressController.clear))
