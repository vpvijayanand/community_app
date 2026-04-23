/**
 * Auth controller: register, login, refresh, logout, /me.
 *
 * - Access tokens are returned in the JSON body so the browser client can
 *   attach them as Authorization: Bearer <token>.
 * - Refresh tokens live in an httpOnly cookie; their SHA-256 hash is
 *   stored server-side in `sessions` so individual devices can be revoked.
 */

import { UserModel } from "../database/models/user.model.js"
import { SessionModel } from "../database/models/session.model.js"
import { hashPassword, verifyPassword } from "../utils/password.js"
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js"
import { env, isProd } from "../config/env.js"
import { BadRequest, Conflict, Unauthorized } from "../utils/errors.js"

const REFRESH_COOKIE = "mk_refresh"

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.cookie.secure || isProd,
    sameSite: "lax",
    domain: env.cookie.domain,
    expires: expiresAt,
    path: "/api/auth",
  })
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth", domain: env.cookie.domain })
}

async function issueSession(res, user, req) {
  const access = signAccessToken(user)
  const refresh = signRefreshToken(user)
  await SessionModel.create({
    userId: user.id,
    tokenHash: refresh.hash,
    expiresAt: refresh.expiresAt,
    userAgent: req.get("user-agent"),
    ip: req.ip,
  })
  setRefreshCookie(res, refresh.token, refresh.expiresAt)
  return access
}

export const AuthController = {
  async register(req, res) {
    const { email, password, displayName, tamilName } = req.body
    const existing = await UserModel.findByEmailWithSecret(email)
    if (existing) throw Conflict("An account with that email already exists.")
    const user = await UserModel.create({
      email,
      passwordHash: await hashPassword(password),
      displayName,
      tamilName,
      role: "reader",
      tier: "free",
    })
    const accessToken = await issueSession(res, user, req)
    res.status(201).json({ user, accessToken })
  },

  async login(req, res) {
    const { email, password } = req.body
    const row = await UserModel.findByEmailWithSecret(email)
    if (!row) throw Unauthorized("Invalid email or password.")
    const ok = await verifyPassword(password, row.password_hash)
    if (!ok) throw Unauthorized("Invalid email or password.")
    const user = UserModel.toPublic(row)
    await UserModel.markLogin(user.id)
    const accessToken = await issueSession(res, user, req)
    res.json({ user, accessToken })
  },

  async refresh(req, res) {
    const token = req.cookies?.[REFRESH_COOKIE]
    if (!token) throw Unauthorized("Missing refresh token")
    let decoded
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      throw Unauthorized("Invalid refresh token")
    }
    const hash = hashToken(token)
    const session = await SessionModel.findActiveByHash(hash)
    if (!session || session.user_id !== decoded.sub) {
      throw Unauthorized("Session revoked or expired")
    }
    const user = await UserModel.findById(decoded.sub)
    if (!user) throw Unauthorized("User no longer exists")

    // Rotate: revoke old, issue new.
    await SessionModel.revokeById(session.id)
    const accessToken = await issueSession(res, user, req)
    res.json({ user, accessToken })
  },

  async logout(req, res) {
    const token = req.cookies?.[REFRESH_COOKIE]
    if (token) {
      const session = await SessionModel.findActiveByHash(hashToken(token))
      if (session) await SessionModel.revokeById(session.id)
    }
    clearRefreshCookie(res)
    res.status(204).end()
  },

  async me(req, res) {
    if (!req.user) throw Unauthorized()
    res.json({ user: req.user })
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body ?? {}
    if (!currentPassword || !newPassword) throw BadRequest("Both passwords are required.")
    const row = await UserModel.findByEmailWithSecret(req.user.email)
    const ok = await verifyPassword(currentPassword, row.password_hash)
    if (!ok) throw Unauthorized("Current password is incorrect.")
    await UserModel.update(req.user.id, {}) // no-op touch
    const passwordHash = await hashPassword(newPassword)
    await SessionModel.revokeAllForUser(req.user.id)
    await (await import("../config/db.js")).query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, req.user.id],
    )
    clearRefreshCookie(res)
    res.status(204).end()
  },
}
