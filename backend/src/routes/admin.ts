import { Router, Response } from "express";
import { query } from "../db/pool";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  const users = await query("SELECT COUNT(*) FROM users");
  const active = await query("SELECT COUNT(*) FROM users WHERE last_active_at > NOW() - INTERVAL '30 days'");
  const newThisWeek = await query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'");
  const pending = await query("SELECT COUNT(*) FROM profiles WHERE status = 'pending'");

  const subs = await query(
    `SELECT tier, COUNT(*) FROM user_subscriptions WHERE status = 'active' GROUP BY tier`
  );
  const subMap: Record<string, number> = {};
  subs.rows.forEach((r: any) => { subMap[r.tier] = parseInt(r.count); });

  const revenue = await query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success' AND paid_at > date_trunc('month', NOW())"
  );

  res.json({
    totalUsers: parseInt(users.rows[0].count),
    activeThisMonth: parseInt(active.rows[0].count),
    newThisWeek: parseInt(newThisWeek.rows[0].count),
    pendingApprovals: parseInt(pending.rows[0].count),
    subscriptions: { basic: subMap.basic || 0, silver: subMap.silver || 0, gold: subMap.gold || 0 },
    revenueThisMonth: parseInt(revenue.rows[0].total),
  });
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 25;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.last_active_at,
       p.full_name, p.status as profile_status,
       us.tier
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query("SELECT COUNT(*) FROM users");

  res.json({ users: result.rows, total: parseInt(count.rows[0].count), page });
});

// PUT /api/admin/users/:id
router.put("/users/:id", async (req: AuthRequest, res: Response) => {
  const { role, isActive, tier } = req.body;
  if (role !== undefined) {
    await query("UPDATE users SET role = $2 WHERE id = $1", [req.params.id, role]);
  }
  if (isActive !== undefined) {
    await query("UPDATE users SET is_active = $2 WHERE id = $1", [req.params.id, isActive]);
  }

  // Audit log
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, details)
     VALUES ($1, 'update_user', 'user', $2, $3)`,
    [req.userId, req.params.id, JSON.stringify(req.body)]
  );

  res.json({ message: "User updated" });
});

// GET /api/admin/profiles — approval queue
router.get("/profiles", async (req, res) => {
  const status = (req.query.status as string) || "pending";
  const result = await query(
    `SELECT p.*, u.email,
       (SELECT ph.url FROM profile_photos ph WHERE ph.profile_id = p.id AND ph.is_primary = true LIMIT 1) as photo
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.status = $1
     ORDER BY p.created_at DESC`,
    [status]
  );
  res.json(result.rows);
});

// PUT /api/admin/profiles/:id/approve
router.put("/profiles/:id/approve", async (req: AuthRequest, res: Response) => {
  await query("UPDATE profiles SET status = 'approved', is_verified = true, updated_at = NOW() WHERE id = $1", [req.params.id]);
  const profile = await query("SELECT user_id FROM profiles WHERE id = $1", [req.params.id]);
  if (profile.rows[0]) {
    await query(
      `INSERT INTO notifications (user_id, type, title, title_tamil, message, message_tamil)
       VALUES ($1, 'profile_approved', 'Profile Approved', 'சுயவிவரம் அங்கீகரிக்கப்பட்டது',
         'Your profile has been approved', 'உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட்டது')`,
      [profile.rows[0].user_id]
    );
  }
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id)
     VALUES ($1, 'approve_profile', 'profile', $2)`,
    [req.userId, req.params.id]
  );
  res.json({ message: "Profile approved" });
});

// PUT /api/admin/profiles/:id/reject
router.put("/profiles/:id/reject", async (req: AuthRequest, res: Response) => {
  await query("UPDATE profiles SET status = 'rejected', updated_at = NOW() WHERE id = $1", [req.params.id]);
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id)
     VALUES ($1, 'reject_profile', 'profile', $2)`,
    [req.userId, req.params.id]
  );
  res.json({ message: "Profile rejected" });
});

// POST /api/admin/news
router.post("/news", async (req: AuthRequest, res: Response) => {
  const { title, titleTamil, content, contentTamil, category, imageUrl, tags } = req.body;
  const result = await query(
    `INSERT INTO news_posts (author_id, title, title_tamil, content, content_tamil, category, image_url, tags, is_published, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW()) RETURNING *`,
    [req.userId, title, titleTamil, content, contentTamil, category, imageUrl, tags || []]
  );
  res.status(201).json(result.rows[0]);
});

// POST /api/admin/ads
router.post("/ads", async (req: AuthRequest, res: Response) => {
  const { title, titleTamil, description, descriptionTamil, imageUrl, linkUrl, type, startDate, endDate } = req.body;
  const result = await query(
    `INSERT INTO ads (created_by, title, title_tamil, description, description_tamil, image_url, link_url, type, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [req.userId, title, titleTamil, description, descriptionTamil, imageUrl, linkUrl, type, startDate, endDate]
  );
  res.status(201).json(result.rows[0]);
});

// GET /api/admin/settings
router.get("/settings", async (_req, res) => {
  const result = await query("SELECT * FROM platform_settings ORDER BY key");
  res.json(result.rows);
});

// PUT /api/admin/settings/:key
router.put("/settings/:key", async (req: AuthRequest, res: Response) => {
  await query(
    "UPDATE platform_settings SET value = $2, updated_by = $3, updated_at = NOW() WHERE key = $1",
    [req.params.key, req.body.value, req.userId]
  );
  res.json({ message: "Setting updated" });
});

export default router;
