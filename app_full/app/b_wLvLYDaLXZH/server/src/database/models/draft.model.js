/**
 * Draft model — JSONB snapshots of in-progress editor state.
 *
 * A draft is either "standalone" (article_id IS NULL, i.e. the editor is
 * composing something new) or attached to an existing article (autosaved
 * edit session). Only one active draft is allowed per (user, article).
 */

import { query } from "../../config/db.js"

function toPublic(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    articleId: row.article_id,
    payload: row.payload,
    titlePreview: row.title_preview,
    category: row.category,
    lastSavedAt: row.last_saved_at,
    createdAt: row.created_at,
  }
}

function titlePreviewOf(payload) {
  const t = payload?.titleEnglish?.trim() || payload?.titleTamil?.trim() || ""
  return t.slice(0, 140) || null
}

export const DraftModel = {
  async listForUser(userId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT * FROM drafts
        WHERE user_id = $1
        ORDER BY last_saved_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )
    return rows.map(toPublic)
  },

  async findById(id, userId) {
    const { rows } = await query(
      `SELECT * FROM drafts WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    return toPublic(rows[0])
  },

  async findForArticle(userId, articleId) {
    const { rows } = await query(
      `SELECT * FROM drafts WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    )
    return toPublic(rows[0])
  },

  /**
   * Create or update an autosave. Uses UPSERT when an article_id is supplied,
   * otherwise inserts a new standalone draft.
   */
  async save({ id, userId, articleId, payload }) {
    const titlePreview = titlePreviewOf(payload)
    const category = payload?.category ?? null

    if (id) {
      const { rows } = await query(
        `UPDATE drafts
            SET payload = $1,
                title_preview = $2,
                category = $3,
                last_saved_at = now()
          WHERE id = $4 AND user_id = $5
          RETURNING *`,
        [payload, titlePreview, category, id, userId],
      )
      return toPublic(rows[0])
    }

    if (articleId) {
      const { rows } = await query(
        `INSERT INTO drafts (user_id, article_id, payload, title_preview, category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, article_id)
         DO UPDATE SET payload = EXCLUDED.payload,
                       title_preview = EXCLUDED.title_preview,
                       category = EXCLUDED.category,
                       last_saved_at = now()
         RETURNING *`,
        [userId, articleId, payload, titlePreview, category],
      )
      return toPublic(rows[0])
    }

    const { rows } = await query(
      `INSERT INTO drafts (user_id, payload, title_preview, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, payload, titlePreview, category],
    )
    return toPublic(rows[0])
  },

  async remove(id, userId) {
    const { rowCount } = await query(
      `DELETE FROM drafts WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    return rowCount > 0
  },

  async countForUser(userId) {
    const { rows } = await query(
      `SELECT count(*)::int AS n FROM drafts WHERE user_id = $1`,
      [userId],
    )
    return rows[0].n
  },
}
