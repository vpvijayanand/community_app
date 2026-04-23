import { ProgressModel } from "../database/models/progress.model.js"
import { ArticleModel } from "../database/models/article.model.js"
import { NotFound } from "../utils/errors.js"

export const ProgressController = {
  async mapForUser(req, res) {
    const progress = await ProgressModel.mapForUser(req.user.id)
    res.json({ progress })
  },

  async upsert(req, res) {
    const article = await ArticleModel.findBySlug(req.params.slug)
    if (!article) throw NotFound("Article not found")
    const row = await ProgressModel.upsert(req.user.id, article.id, req.body.percent)
    res.json({ progress: { percent: row.percent, updatedAt: row.updated_at } })
  },

  async clear(req, res) {
    const article = await ArticleModel.findBySlug(req.params.slug)
    if (!article) throw NotFound("Article not found")
    await ProgressModel.clear(req.user.id, article.id)
    res.status(204).end()
  },
}
