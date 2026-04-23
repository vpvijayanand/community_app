/**
 * Article controller — public feed (published only), editor CRUD,
 * lifecycle transitions (draft -> scheduled -> published), and
 * access-aware single-article reads.
 */

import { ArticleModel } from "../database/models/article.model.js"
import { BookmarkModel } from "../database/models/bookmark.model.js"
import { ProgressModel } from "../database/models/progress.model.js"
import { Forbidden, NotFound, UnprocessableEntity } from "../utils/errors.js"
import { appendSuffix, slugify } from "../utils/slugify.js"

function canEdit(user) {
  return user && (user.role === "editor" || user.role === "admin")
}

function canAccessPaid(user, article) {
  if (article.pricing.tier === "free") return true
  if (!user) return false
  if (user.tier === "life") return true
  if (article.pricing.access === "life-members") return user.tier === "life"
  if (article.pricing.access === "paid-members")
    return user.tier === "paid" || user.tier === "life"
  return true
}

async function resolveUniqueSlug(proposed) {
  let slug = slugify(proposed)
  for (let i = 0; i < 5; i += 1) {
    const existing = await ArticleModel.findBySlug(slug)
    if (!existing) return slug
    slug = appendSuffix(slugify(proposed))
  }
  return appendSuffix(slug)
}

/**
 * Trims the content to `previewPercent` of its length when the reader
 * does not yet have access. Preserves the pricing metadata so the client
 * can render the paywall card.
 */
function applyPaywall(article, user) {
  if (canAccessPaid(user, article)) return { ...article, locked: false }
  const pct = Math.max(0, Math.min(100, article.pricing.previewPercent))
  const fullContent = article.content ?? ""
  const cutoff = Math.floor((fullContent.length * pct) / 100)
  return {
    ...article,
    content: fullContent.slice(0, cutoff),
    locked: true,
  }
}

export const ArticlesController = {
  async listPublic(req, res) {
    const { category, q, limit, offset } = req.query
    const result = await ArticleModel.list({
      status: "published",
      category: category || undefined,
      search: q || undefined,
      limit: Math.min(Number(limit) || 20, 50),
      offset: Number(offset) || 0,
    })
    res.json(result)
  },

  async listAdmin(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const { status, category, q, limit, offset, sort } = req.query
    const result = await ArticleModel.list({
      status: status || undefined,
      category: category || undefined,
      search: q || undefined,
      sort: sort || undefined,
      limit: Math.min(Number(limit) || 20, 100),
      offset: Number(offset) || 0,
    })
    res.json(result)
  },

  async getBySlug(req, res) {
    const article = await ArticleModel.findBySlug(req.params.slug)
    if (!article) throw NotFound("Article not found")
    if (article.status !== "published" && !canEdit(req.user)) {
      throw NotFound("Article not found")
    }

    await ArticleModel.incrementView(article.id).catch(() => {})

    const display = applyPaywall(article, req.user)
    let bookmarked = false
    let progress = null
    if (req.user) {
      bookmarked = await BookmarkModel.isBookmarked(req.user.id, article.id)
      progress = await ProgressModel.get(req.user.id, article.id)
    }
    const related = await ArticleModel.related({
      articleId: article.id,
      category: article.category,
      limit: 3,
    })
    res.json({ article: display, bookmarked, progress, related })
  },

  async create(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const input = req.body
    if (input.status === "scheduled" && !input.scheduledFor) {
      throw UnprocessableEntity("Scheduled articles need a scheduledFor timestamp.")
    }
    const slug = await resolveUniqueSlug(input.slug || input.titleEnglish || input.titleTamil)
    const article = await ArticleModel.create({ ...input, slug }, req.user.id)
    res.status(201).json({ article })
  },

  async update(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const existing = await ArticleModel.findById(req.params.id)
    if (!existing) throw NotFound("Article not found")
    const patch = { ...req.body }
    if (patch.slug && patch.slug !== existing.slug) {
      patch.slug = await resolveUniqueSlug(patch.slug)
    }
    const article = await ArticleModel.update(req.params.id, patch)
    res.json({ article })
  },

  async publish(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const article = await ArticleModel.setStatus(req.params.id, "published", {
      publishedAt: new Date(),
    })
    if (!article) throw NotFound("Article not found")
    res.json({ article })
  },

  async schedule(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const { scheduledFor } = req.body
    if (!scheduledFor)
      throw UnprocessableEntity("scheduledFor is required when scheduling.")
    const article = await ArticleModel.setStatus(req.params.id, "scheduled", {
      scheduledFor: new Date(scheduledFor),
    })
    if (!article) throw NotFound("Article not found")
    res.json({ article })
  },

  async unpublish(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const article = await ArticleModel.setStatus(req.params.id, "draft", {})
    if (!article) throw NotFound("Article not found")
    res.json({ article })
  },

  async remove(req, res) {
    if (!canEdit(req.user)) throw Forbidden()
    const ok = await ArticleModel.remove(req.params.id)
    if (!ok) throw NotFound("Article not found")
    res.status(204).end()
  },
}
