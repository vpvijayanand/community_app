/**
 * Article model — CRUD, search, and lifecycle helpers for the `articles` table.
 *
 * Public shape (camelCase) mirrors the frontend `Article` / `EditorArticle`
 * contracts so controllers can pass rows through without a transform layer.
 */

import { query, withTransaction } from "../../config/db.js"

const BASE_COLUMNS = `
  a.id, a.slug, a.title_tamil, a.title_english, a.summary, a.content,
  a.category, a.language, a.priority, a.image_url, a.meta_description,
  a.pricing_tier, a.price, a.currency, a.access_tier, a.preview_percent, a.support_note,
  a.pinned, a.featured, a.allow_comments, a.notify_subscribers, a.email_digest,
  a.status, a.scheduled_for, a.published_at, a.read_minutes, a.view_count, a.like_count,
  a.author_id, a.created_at, a.updated_at
`

const JOINS = `
  LEFT JOIN users u ON u.id = a.author_id
`

const AUTHOR_COLUMNS = `
  u.display_name AS author_name, u.tamil_name AS author_tamil_name, u.avatar_url AS author_avatar
`

function toPublic(row, tags = []) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    titleTamil: row.title_tamil,
    titleEnglish: row.title_english,
    summary: row.summary,
    content: row.content,
    category: row.category,
    language: row.language,
    priority: row.priority,
    imageUrl: row.image_url,
    metaDescription: row.meta_description,
    pricing: {
      tier: row.pricing_tier,
      price: Number(row.price),
      currency: row.currency,
      access: row.access_tier,
      previewPercent: row.preview_percent,
      supportNote: row.support_note,
    },
    flags: {
      pinned: row.pinned,
      featured: row.featured,
      allowComments: row.allow_comments,
      notifySubscribers: row.notify_subscribers,
      emailDigest: row.email_digest,
    },
    status: row.status,
    scheduledFor: row.scheduled_for,
    publishedAt: row.published_at,
    readMinutes: row.read_minutes,
    viewCount: row.view_count,
    likeCount: row.like_count,
    tags,
    author: row.author_name
      ? {
          id: row.author_id,
          name: row.author_name,
          tamilName: row.author_tamil_name,
          avatarUrl: row.author_avatar,
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function tagsFor(articleIds) {
  if (articleIds.length === 0) return new Map()
  const { rows } = await query(
    `SELECT article_id, tag FROM article_tags WHERE article_id = ANY($1)`,
    [articleIds],
  )
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.article_id)) map.set(r.article_id, [])
    map.get(r.article_id).push(r.tag)
  }
  return map
}

function applyTags(rows, tagsMap) {
  return rows.map((r) => toPublic(r, tagsMap.get(r.id) ?? []))
}

export const ArticleModel = {
  /**
   * List articles with filters. Public feed typically calls with
   * { status: 'published' }.
   */
  async list({
    status,
    category,
    search,
    authorId,
    featured,
    limit = 20,
    offset = 0,
    sort = "published_at_desc",
  } = {}) {
    const where = []
    const vals = []
    let i = 1

    if (status) {
      where.push(`a.status = $${i++}`)
      vals.push(status)
    }
    if (category) {
      where.push(`a.category = $${i++}`)
      vals.push(category)
    }
    if (authorId) {
      where.push(`a.author_id = $${i++}`)
      vals.push(authorId)
    }
    if (featured === true) {
      where.push(`a.featured = true`)
    }
    if (search) {
      where.push(`
        to_tsvector('simple',
          coalesce(a.title_english,'') || ' ' ||
          coalesce(a.title_tamil,'')   || ' ' ||
          coalesce(a.summary,'')
        ) @@ plainto_tsquery('simple', $${i++})
      `)
      vals.push(search)
    }

    const orderBy =
      sort === "views_desc"
        ? "a.view_count DESC NULLS LAST"
        : sort === "created_desc"
          ? "a.created_at DESC"
          : "COALESCE(a.published_at, a.updated_at) DESC"

    const sql = `
      SELECT ${BASE_COLUMNS}, ${AUTHOR_COLUMNS},
             COUNT(*) OVER() AS total_count
        FROM articles a
        ${JOINS}
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY a.pinned DESC, ${orderBy}
        LIMIT $${i++} OFFSET $${i++}
    `
    vals.push(limit, offset)
    const { rows } = await query(sql, vals)
    const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0
    const ids = rows.map((r) => r.id)
    const tagsMap = await tagsFor(ids)
    return { items: applyTags(rows, tagsMap), total, limit, offset }
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT ${BASE_COLUMNS}, ${AUTHOR_COLUMNS} FROM articles a ${JOINS} WHERE a.id = $1`,
      [id],
    )
    const row = rows[0]
    if (!row) return null
    const tagsMap = await tagsFor([row.id])
    return toPublic(row, tagsMap.get(row.id) ?? [])
  },

  async findBySlug(slug) {
    const { rows } = await query(
      `SELECT ${BASE_COLUMNS}, ${AUTHOR_COLUMNS} FROM articles a ${JOINS} WHERE a.slug = $1`,
      [slug],
    )
    const row = rows[0]
    if (!row) return null
    const tagsMap = await tagsFor([row.id])
    return toPublic(row, tagsMap.get(row.id) ?? [])
  },

  async related({ articleId, category, limit = 3 }) {
    const { rows } = await query(
      `
      SELECT ${BASE_COLUMNS}, ${AUTHOR_COLUMNS}
        FROM articles a ${JOINS}
       WHERE a.status = 'published'
         AND a.category = $1
         AND a.id <> $2
       ORDER BY a.published_at DESC NULLS LAST
       LIMIT $3
      `,
      [category, articleId, limit],
    )
    const tagsMap = await tagsFor(rows.map((r) => r.id))
    return applyTags(rows, tagsMap)
  },

  async create(input, authorId) {
    return withTransaction(async (c) => {
      const { rows } = await c.query(
        `
        INSERT INTO articles (
          slug, title_english, title_tamil, summary, content,
          category, language, priority, image_url, meta_description,
          pricing_tier, price, currency, access_tier, preview_percent, support_note,
          pinned, featured, allow_comments, notify_subscribers, email_digest,
          status, scheduled_for, published_at, read_minutes, author_id
        ) VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,
          $17,$18,$19,$20,$21,
          $22,$23,$24,$25,$26
        )
        RETURNING id
        `,
        [
          input.slug,
          input.titleEnglish,
          input.titleTamil ?? null,
          input.summary ?? "",
          input.content ?? "",
          input.category,
          input.language ?? "bilingual",
          input.priority ?? "normal",
          input.imageUrl ?? null,
          input.metaDescription ?? null,
          input.pricing?.tier ?? "free",
          input.pricing?.price ?? 0,
          input.pricing?.currency ?? "INR",
          input.pricing?.access ?? "all-members",
          input.pricing?.previewPercent ?? 100,
          input.pricing?.supportNote ?? null,
          !!input.flags?.pinned,
          !!input.flags?.featured || input.priority === "featured",
          input.flags?.allowComments ?? true,
          input.flags?.notifySubscribers ?? true,
          input.flags?.emailDigest ?? false,
          input.status ?? "draft",
          input.scheduledFor ?? null,
          input.status === "published" ? (input.publishedAt ?? new Date()) : null,
          input.readMinutes ?? 3,
          authorId,
        ],
      )
      const id = rows[0].id
      await replaceTags(c, id, input.tags ?? [])
      return this.findById(id)
    })
  },

  async update(id, patch) {
    const cols = []
    const vals = []
    let i = 1
    const map = {
      slug: "slug",
      titleEnglish: "title_english",
      titleTamil: "title_tamil",
      summary: "summary",
      content: "content",
      category: "category",
      language: "language",
      priority: "priority",
      imageUrl: "image_url",
      metaDescription: "meta_description",
      readMinutes: "read_minutes",
      scheduledFor: "scheduled_for",
    }
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in map)) continue
      cols.push(`${map[k]} = $${i++}`)
      vals.push(v)
    }
    if (patch.pricing) {
      const p = patch.pricing
      cols.push(
        `pricing_tier = $${i++}`,
        `price = $${i++}`,
        `currency = $${i++}`,
        `access_tier = $${i++}`,
        `preview_percent = $${i++}`,
        `support_note = $${i++}`,
      )
      vals.push(
        p.tier,
        p.price,
        p.currency,
        p.access,
        p.previewPercent,
        p.supportNote ?? null,
      )
    }
    if (patch.flags) {
      const f = patch.flags
      cols.push(
        `pinned = $${i++}`,
        `featured = $${i++}`,
        `allow_comments = $${i++}`,
        `notify_subscribers = $${i++}`,
        `email_digest = $${i++}`,
      )
      vals.push(
        !!f.pinned,
        !!f.featured,
        f.allowComments ?? true,
        f.notifySubscribers ?? true,
        f.emailDigest ?? false,
      )
    }

    return withTransaction(async (c) => {
      if (cols.length > 0) {
        vals.push(id)
        await c.query(
          `UPDATE articles SET ${cols.join(", ")} WHERE id = $${i}`,
          vals,
        )
      }
      if (Array.isArray(patch.tags)) {
        await replaceTags(c, id, patch.tags)
      }
      return this.findById(id)
    })
  },

  async setStatus(id, status, { publishedAt, scheduledFor } = {}) {
    await query(
      `UPDATE articles
          SET status = $1,
              published_at = CASE WHEN $1 = 'published' THEN COALESCE($2, now()) ELSE published_at END,
              scheduled_for = CASE WHEN $1 = 'scheduled' THEN $3 ELSE NULL END
        WHERE id = $4`,
      [status, publishedAt ?? null, scheduledFor ?? null, id],
    )
    return this.findById(id)
  },

  async incrementView(id) {
    await query(`UPDATE articles SET view_count = view_count + 1 WHERE id = $1`, [id])
  },

  async remove(id) {
    const { rowCount } = await query(`DELETE FROM articles WHERE id = $1`, [id])
    return rowCount > 0
  },
}

async function replaceTags(client, articleId, tags) {
  await client.query("DELETE FROM article_tags WHERE article_id = $1", [articleId])
  const clean = [...new Set(tags.map((t) => t.trim()).filter(Boolean))]
  for (const tag of clean) {
    await client.query(
      "INSERT INTO article_tags (article_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [articleId, tag],
    )
  }
}
