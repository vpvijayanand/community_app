import { ZodError } from "zod"
import { UnprocessableEntity } from "../utils/errors.js"

/**
 * Validates req.body against a Zod schema and replaces it with the parsed,
 * fully-typed object so controllers can rely on defaults being applied.
 */
export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body ?? {})
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        UnprocessableEntity(
          "Request body failed validation",
          err.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        ),
      )
    }
    next(err)
  }
}

export const validateQuery = (schema) => (req, _res, next) => {
  try {
    req.query = schema.parse(req.query ?? {})
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        UnprocessableEntity(
          "Query parameters failed validation",
          err.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        ),
      )
    }
    next(err)
  }
}
