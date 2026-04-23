/**
 * Typed HTTP errors. Controllers `throw` these; the error middleware
 * serializes them to a consistent JSON envelope.
 */

export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const BadRequest = (message, details) =>
  new HttpError(400, "bad_request", message, details)
export const Unauthorized = (message = "Authentication required") =>
  new HttpError(401, "unauthorized", message)
export const Forbidden = (message = "You do not have permission") =>
  new HttpError(403, "forbidden", message)
export const NotFound = (message = "Not found") =>
  new HttpError(404, "not_found", message)
export const Conflict = (message, details) =>
  new HttpError(409, "conflict", message, details)
export const UnprocessableEntity = (message, details) =>
  new HttpError(422, "unprocessable_entity", message, details)
