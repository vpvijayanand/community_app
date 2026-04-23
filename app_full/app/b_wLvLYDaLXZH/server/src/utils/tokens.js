/**
 * JWT access tokens (stateless, 15m TTL) and refresh tokens (30d,
 * hashed with SHA-256 before hitting the DB so a leaked sessions
 * table is not by itself a session takeover).
 */

import crypto from "node:crypto"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tier: user.tier },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl },
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret)
}

export function signRefreshToken(user) {
  const token = jwt.sign(
    { sub: user.id, typ: "refresh", jti: crypto.randomUUID() },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshTtl },
  )
  const hash = crypto.createHash("sha256").update(token).digest("hex")
  const decoded = jwt.decode(token)
  return { token, hash, expiresAt: new Date(decoded.exp * 1000) }
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret)
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}
