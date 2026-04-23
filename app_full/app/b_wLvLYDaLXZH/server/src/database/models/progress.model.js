/**
 * Reading progress model — where the reader left off in each article.
 */

import { query } from "../../config/db.js"

export const ProgressModel = {
  async upsert(userId, articleId, percent) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)))
    const { rows } = await query(
      `INSERT INTO reading_progress (user_id, article_id, percent, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id, article_id)
       DO UPDATE SET percent = EXCLUDED.percent, updated_at = now()
       RETURNING percent, updated_at`,
      [userId, articleId, clamped],
    )
    return rows[0]
  },

  async get(userId, articleId) {
    const { rows } = await query(
      `SELECT percent, updated_at FROM reading_progress
        WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    )
    return rows[0] ?? null
  },

  async clear(userId, articleId) {
    const { rowCount } = await query(
      `DELETE FROM reading_progress WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    )
    return rowCount > 0
  },

  async mapForUser(userId) {
    const { rows } = await query(
      `SELECT a.slug, rp.percent, rp.updated_at
         FROM reading_progress rp
         JOIN articles a ON a.id = rp.article_id
        WHERE rp.user_id = $1`,
      [userId],
    )
    const map = {}
    for (const r of rows) {
      map[r.slug] = { percent: r.percent, updatedAt: r.updated_at }
    }
    return map
  },
}
