/**
 * Authentication & authorization middleware.
 *
 *   requireAuth   -> requires a valid access JWT (sets req.user)
 *   optionalAuth  -> populates req.user if a token is present, but never 401s
 *   requireRole   -> requireAuth + role allow-list
 *   requireTier   -> requireAuth + tier allow-list (paid content)
 */

import { UserModel } from "../database/models/user.model.js"
import { verifyAccessToken } from "../utils/tokens.js"
import { Forbidden, Unauthorized } from "../utils/errors.js"

function extractBearer(req) {
  const header = req.get("authorization") ?? ""
  if (header.toLowerCase().startsWith("bearer ")) return header.slice(7).trim()
  return null
}

async function resolveUser(token) {
  try {
    const decoded = verifyAccessToken(token)
    const user = await UserModel.findById(decoded.sub)
    return user
  } catch {
    return null
  }
}

export async function optionalAuth(req, _res, next) {
  const token = extractBearer(req)
  if (!token) return next()
  req.user = await resolveUser(token)
  next()
}

export async function requireAuth(req, _res, next) {
  const token = extractBearer(req)
  if (!token) return next(Unauthorized())
  const user = await resolveUser(token)
  if (!user) return next(Unauthorized("Invalid or expired token"))
  req.user = user
  next()
}

export function requireRole(...roles) {
  return [
    requireAuth,
    (req, _res, next) => {
      if (!roles.includes(req.user.role)) return next(Forbidden())
      next()
    },
  ]
}

export function requireTier(...tiers) {
  return [
    requireAuth,
    (req, _res, next) => {
      if (!tiers.includes(req.user.tier)) return next(Forbidden("Upgrade required"))
      next()
    },
  ]
}
