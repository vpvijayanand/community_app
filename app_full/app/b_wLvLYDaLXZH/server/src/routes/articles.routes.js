import { Router } from "express"
import { ArticlesController } from "../controllers/articles.controller.js"
import {
  optionalAuth,
  requireRole,
} from "../middleware/auth.middleware.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { writeLimiter } from "../middleware/rate-limit.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import {
  ArticleCreateSchema,
  ArticleUpdateSchema,
  PublishSchema,
} from "../utils/validators.js"

export const articlesRoutes = Router()

// Public feed
articlesRoutes.get("/", asyncHandler(ArticlesController.listPublic))

// Admin-scoped list (must come before /:slug to avoid collision)
articlesRoutes.get(
  "/admin",
  ...requireRole("editor", "admin"),
  asyncHandler(ArticlesController.listAdmin),
)

// Single article — optional auth so paid articles can gate content.
articlesRoutes.get(
  "/:slug",
  optionalAuth,
  asyncHandler(ArticlesController.getBySlug),
)

// Editor/admin mutations
articlesRoutes.post(
  "/",
  writeLimiter,
  ...requireRole("editor", "admin"),
  validateBody(ArticleCreateSchema),
  asyncHandler(ArticlesController.create),
)
articlesRoutes.patch(
  "/:id",
  writeLimiter,
  ...requireRole("editor", "admin"),
  validateBody(ArticleUpdateSchema),
  asyncHandler(ArticlesController.update),
)
articlesRoutes.post(
  "/:id/publish",
  ...requireRole("editor", "admin"),
  asyncHandler(ArticlesController.publish),
)
articlesRoutes.post(
  "/:id/schedule",
  ...requireRole("editor", "admin"),
  validateBody(PublishSchema),
  asyncHandler(ArticlesController.schedule),
)
articlesRoutes.post(
  "/:id/unpublish",
  ...requireRole("editor", "admin"),
  asyncHandler(ArticlesController.unpublish),
)
articlesRoutes.delete(
  "/:id",
  ...requireRole("editor", "admin"),
  asyncHandler(ArticlesController.remove),
)
