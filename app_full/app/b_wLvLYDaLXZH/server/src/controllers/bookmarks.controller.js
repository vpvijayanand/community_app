import { BookmarkModel } from "../database/models/bookmark.model.js"
import { ArticleModel } from "../database/models/article.model.js"
import { NotFound } from "../utils/errors.js"

export const BookmarksController = {
  async list(req, res) {
    const items = await BookmarkModel.listForUser(req.user.id)
    res.json({ items })
  },

  async slugs(req, res) {
    const slugs = await BookmarkModel.slugsForUser(req.user.id)
    res.json({ slugs })
  },

  async add(req, res) {
    const article = await ArticleModel.findBySlug(req.params.slug)
    if (!article) throw NotFound("Article not found")
    await BookmarkModel.add(req.user.id, article.id)
    res.status(204).end()
  },

  async remove(req, res) {
    const article = await ArticleModel.findBySlug(req.params.slug)
    if (!article) throw NotFound("Article not found")
    await BookmarkModel.remove(req.user.id, article.id)
    res.status(204).end()
  },
}
