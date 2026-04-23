import { Router } from "express"
import { healthcheck } from "../config/db.js"
import { asyncHandler } from "../utils/async-handler.js"
import { authRoutes } from "./auth.routes.js"
import { articlesRoutes } from "./articles.routes.js"
import { draftsRoutes } from "./drafts.routes.js"
import { bookmarksRoutes } from "./bookmarks.routes.js"
import { progressRoutes } from "./progress.routes.js"
import { usersRoutes } from "./users.routes.js"

export const apiRouter = Router()

apiRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const db = await healthcheck()
    res.json({ status: "ok", db })
  }),
)

apiRouter.use("/auth", authRoutes)
apiRouter.use("/articles", articlesRoutes)
apiRouter.use("/drafts", draftsRoutes)
apiRouter.use("/bookmarks", bookmarksRoutes)
apiRouter.use("/progress", progressRoutes)
apiRouter.use("/users", usersRoutes)
