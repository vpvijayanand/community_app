import { Router } from "express"
import { BookmarksController } from "../controllers/bookmarks.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

export const bookmarksRoutes = Router()

bookmarksRoutes.use(requireAuth)

bookmarksRoutes.get("/", asyncHandler(BookmarksController.list))
bookmarksRoutes.get("/slugs", asyncHandler(BookmarksController.slugs))
bookmarksRoutes.put("/:slug", asyncHandler(BookmarksController.add))
bookmarksRoutes.delete("/:slug", asyncHandler(BookmarksController.remove))
