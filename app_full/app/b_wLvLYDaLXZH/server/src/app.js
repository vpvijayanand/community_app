import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"

import { env, isProd } from "./config/env.js"
import { apiRouter } from "./routes/index.js"
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js"

export function createApp() {
  const app = express()

  app.disable("x-powered-by")
  app.set("trust proxy", 1)

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())
  app.use(morgan(isProd ? "combined" : "dev"))

  app.get("/", (_req, res) => {
    res.json({ service: "mathat-news-server", status: "ok" })
  })

  app.use("/api", apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
