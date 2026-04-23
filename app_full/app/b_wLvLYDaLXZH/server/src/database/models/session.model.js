/**
 * Session model — stores hashed refresh tokens so we can revoke individual
 * devices on logout without invalidating short-lived access JWTs.
 */

import { query } from "../../config/db.js"

export const SessionModel = {
  async create({ userId, tokenHash, expiresAt, userAgent, ip }) {
    const { rows } = await query(
      `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, tokenHash, expiresAt, userAgent ?? null, ip ?? null],
    )
    return rows[0]
  },

  async findActiveByHash(tokenHash) {
    const { rows } = await query(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
         FROM sessions
        WHERE token_hash = $1
          AND revoked_at IS NULL
          AND expires_at > now()`,
      [tokenHash],
    )
    return rows[0] ?? null
  },

  async revokeById(id) {
    await query(
      `UPDATE sessions SET revoked_at = now() WHERE id = $1`,
      [id],
    )
  },

  async revokeAllForUser(userId) {
    await query(
      `UPDATE sessions SET revoked_at = now()
        WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    )
  },

  async purgeExpired() {
    const { rowCount } = await query(
      `DELETE FROM sessions
        WHERE expires_at < now() OR revoked_at IS NOT NULL`,
    )
    return rowCount
  },
}
