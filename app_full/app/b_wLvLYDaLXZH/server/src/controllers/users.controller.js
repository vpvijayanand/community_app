import { UserModel } from "../database/models/user.model.js"
import { Forbidden } from "../utils/errors.js"

export const UsersController = {
  async updateMe(req, res) {
    const user = await UserModel.update(req.user.id, req.body)
    res.json({ user })
  },

  async listAdmin(req, res) {
    if (req.user.role !== "admin") throw Forbidden()
    const items = await UserModel.list({
      limit: Math.min(Number(req.query.limit) || 50, 200),
      offset: Number(req.query.offset) || 0,
    })
    res.json({ items })
  },
}
