import { HttpError, NotFound } from "../utils/errors.js"
import { isProd } from "../config/env.js"

export function notFoundHandler(_req, _res, next) {
  next(NotFound("Route not found"))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    })
  }

  // Postgres unique_violation -> 409
  if (err?.code === "23505") {
    return res.status(409).json({
      error: {
        code: "conflict",
        message: "A record with that value already exists.",
        details: err.detail,
      },
    })
  }

  console.error("[api] unhandled error:", err)
  res.status(500).json({
    error: {
      code: "internal_error",
      message: isProd ? "Something went wrong." : err.message,
    },
  })
}
