/**
 * User model — thin, typed wrappers around the `users` table.
 * No business logic here; controllers compose these.
 */

import { query } from "../../config/db.js"

const PUBLIC_COLUMNS = `
  id, email, display_name, tamil_name, avatar_url,
  role, tier, email_verified_at, last_login_at, created_at, updated_at
`

export const UserModel = {
  /**
   * Shape returned to clients (never includes password_hash).
   */
  toPublic(row) {
    if (!row) return null
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      tamilName: row.tamil_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      tier: row.tier,
      emailVerifiedAt: row.email_verified_at,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
      [id],
    )
    return this.toPublic(rows[0])
  },

  async findByEmailWithSecret(email) {
    const { rows } = await query(
      `SELECT id, email, password_hash, display_name, tamil_name, avatar_url,
              role, tier, email_verified_at, last_login_at, created_at, updated_at
         FROM users WHERE email = $1`,
      [email],
    )
    return rows[0] ?? null
  },

  async create({ email, passwordHash, displayName, tamilName, role = "reader", tier = "free" }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, display_name, tamil_name, role, tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PUBLIC_COLUMNS}`,
      [email, passwordHash, displayName, tamilName ?? null, role, tier],
    )
    return this.toPublic(rows[0])
  },

  async update(id, patch) {
    const cols = []
    const vals = []
    let i = 1
    const map = {
      displayName: "display_name",
      tamilName: "tamil_name",
      avatarUrl: "avatar_url",
      role: "role",
      tier: "tier",
    }
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in map)) continue
      cols.push(`${map[k]} = $${i++}`)
      vals.push(v)
    }
    if (cols.length === 0) return this.findById(id)
    vals.push(id)
    const { rows } = await query(
      `UPDATE users SET ${cols.join(", ")} WHERE id = $${i}
       RETURNING ${PUBLIC_COLUMNS}`,
      vals,
    )
    return this.toPublic(rows[0])
  },

  async markLogin(id) {
    await query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [id])
  },

  async list({ limit = 50, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return rows.map((r) => this.toPublic(r))
  },
}
