import { Router } from "express"
import { DraftsController } from "../controllers/drafts.controller.js"
import { requireRole } from "../middleware/auth.middleware.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { DraftSaveSchema } from "../utils/validators.js"

export const draftsRoutes = Router()

draftsRoutes.use(...requireRole("editor", "admin"))

draftsRoutes.get("/", asyncHandler(DraftsController.list))
draftsRoutes.get("/:id", asyncHandler(DraftsController.get))
draftsRoutes.post(
  "/",
  validateBody(DraftSaveSchema),
  asyncHandler(DraftsController.save),
)
draftsRoutes.delete("/:id", asyncHandler(DraftsController.remove))
