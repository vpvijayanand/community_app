import { Router } from "express";
import { query } from "../db/pool";

const router = Router();

// GET /api/news/learn — must come BEFORE /:id
router.get("/learn", async (req, res) => {
  const category = req.query.category as string;
  let where = "is_published = true";
  const params: any[] = [];
  if (category) { where += " AND category = $1"; params.push(category); }

  const result = await query(
    `SELECT * FROM learning_articles WHERE ${where} ORDER BY published_at DESC`,
    params
  );
  res.json(result.rows);
});

// GET /api/news/ads — must come BEFORE /:id
router.get("/ads", async (_req, res) => {
  const result = await query(
    `SELECT * FROM ads WHERE is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
     ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

// GET /api/news
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const category = req.query.category as string;

  let where = "is_published = true";
  const params: any[] = [];
  let idx = 1;

  if (category) {
    where += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }

  const countRes = await query(`SELECT COUNT(*) FROM news_posts WHERE ${where}`, params);
  const result = await query(
    `SELECT id, title, title_tamil, excerpt, excerpt_tamil, category, image_url, tags,
       published_at, view_count
     FROM news_posts WHERE ${where}
     ORDER BY published_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  res.json({ posts: result.rows, total: parseInt(countRes.rows[0].count), page });
});

// GET /api/news/:id
router.get("/:id", async (req, res) => {
  const result = await query(
    `UPDATE news_posts SET view_count = view_count + 1 WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: true, message: "Not found" });
  res.json(result.rows[0]);
});

export default router;
