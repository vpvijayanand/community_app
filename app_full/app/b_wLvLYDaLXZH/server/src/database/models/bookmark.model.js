/**
 * Bookmark model — reader "save for later".
 */

import { query } from "../../config/db.js"

export const BookmarkModel = {
  async add(userId, articleId) {
    await query(
      `INSERT INTO bookmarks (user_id, article_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, articleId],
    )
  },

  async remove(userId, articleId) {
    const { rowCount } = await query(
      `DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    )
    return rowCount > 0
  },

  async isBookmarked(userId, articleId) {
    const { rows } = await query(
      `SELECT 1 FROM bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    )
    return rows.length > 0
  },

  async listForUser(userId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT b.article_id, b.created_at,
              a.slug, a.title_english, a.title_tamil, a.summary,
              a.category, a.image_url, a.read_minutes
         FROM bookmarks b
         JOIN articles a ON a.id = b.article_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )
    return rows.map((r) => ({
      articleId: r.article_id,
      bookmarkedAt: r.created_at,
      slug: r.slug,
      titleEnglish: r.title_english,
      titleTamil: r.title_tamil,
      summary: r.summary,
      category: r.category,
      imageUrl: r.image_url,
      readMinutes: r.read_minutes,
    }))
  },

  async slugsForUser(userId) {
    const { rows } = await query(
      `SELECT a.slug
         FROM bookmarks b JOIN articles a ON a.id = b.article_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC`,
      [userId],
    )
    return rows.map((r) => r.slug)
  },
}
