/**
 * Draft controller — autosave snapshots the editor can resume from.
 *
 * Endpoints are user-scoped; a draft belongs to the user who created it
 * and never leaks to other editors.
 */

import { DraftModel } from "../database/models/draft.model.js"
import { Forbidden, NotFound } from "../utils/errors.js"

function assertEditor(user) {
  if (!user || (user.role !== "editor" && user.role !== "admin")) throw Forbidden()
}

export const DraftsController = {
  async list(req, res) {
    assertEditor(req.user)
    const items = await DraftModel.listForUser(req.user.id)
    res.json({ items })
  },

  async get(req, res) {
    assertEditor(req.user)
    const draft = await DraftModel.findById(req.params.id, req.user.id)
    if (!draft) throw NotFound("Draft not found")
    res.json({ draft })
  },

  async save(req, res) {
    assertEditor(req.user)
    const draft = await DraftModel.save({
      id: req.body.id,
      userId: req.user.id,
      articleId: req.body.articleId ?? null,
      payload: req.body.payload,
    })
    res.status(req.body.id ? 200 : 201).json({ draft })
  },

  async remove(req, res) {
    assertEditor(req.user)
    const ok = await DraftModel.remove(req.params.id, req.user.id)
    if (!ok) throw NotFound("Draft not found")
    res.status(204).end()
  },
}
