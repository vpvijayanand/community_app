import { Router, Response } from "express";
import { query } from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/matches — paginated match list
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get viewer's profile for filtering
  const myProfile = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  if (!myProfile.rows[0]) return res.json({ profiles: [], total: 0 });

  const myProfileId = myProfile.rows[0].id;

  // Get blocked users
  const blocked = await query(
    "SELECT blocked_user_id FROM blocks WHERE blocker_user_id = $1", [req.userId]
  );
  const blockedIds = blocked.rows.map((r: any) => r.blocked_user_id);

  let filterClause = `p.status = 'approved' AND p.user_id != $1`;
  const params: any[] = [req.userId];
  let paramIdx = 2;

  if (blockedIds.length) {
    filterClause += ` AND p.user_id != ALL($${paramIdx})`;
    params.push(blockedIds);
    paramIdx++;
  }

  // Optional filters from query string
  if (req.query.gender) {
    filterClause += ` AND p.gender = $${paramIdx}`;
    params.push(req.query.gender);
    paramIdx++;
  }
  if (req.query.ageMin) {
    filterClause += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) >= $${paramIdx}`;
    params.push(parseInt(req.query.ageMin as string));
    paramIdx++;
  }
  if (req.query.ageMax) {
    filterClause += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) <= $${paramIdx}`;
    params.push(parseInt(req.query.ageMax as string));
    paramIdx++;
  }
  if (req.query.state) {
    filterClause += ` AND p.state = $${paramIdx}`;
    params.push(req.query.state);
    paramIdx++;
  }
  if (req.query.rasi) {
    filterClause += ` AND ad.rasi_name = $${paramIdx}`;
    params.push(req.query.rasi);
    paramIdx++;
  }

  const sortMap: Record<string, string> = {
    score: "p.completeness_score DESC",
    age: "p.date_of_birth DESC",
    newest: "p.created_at DESC",
    active: "u.last_active_at DESC NULLS LAST",
  };
  const sort = sortMap[req.query.sort as string] || "p.completeness_score DESC";

  const countRes = await query(
    `SELECT COUNT(*) FROM profiles p
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     LEFT JOIN users u ON u.id = p.user_id
     WHERE ${filterClause}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const result = await query(
    `SELECT p.id, p.full_name, p.full_name_tamil, p.gender, p.date_of_birth,
       p.height_cm, p.complexion, p.food_preference, p.state, p.city,
       p.qualification, p.employment_type, p.completeness_score, p.is_verified,
       ad.rasi_name, ad.natchathiram,
       (SELECT ph.url FROM profile_photos ph WHERE ph.profile_id = p.id AND ph.is_primary = true LIMIT 1) as photo,
       us.tier as subscription_tier,
       EXTRACT(YEAR FROM age(p.date_of_birth))::int as age
     FROM profiles p
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN user_subscriptions us ON us.user_id = p.user_id AND us.status = 'active'
     WHERE ${filterClause}
     ORDER BY CASE WHEN us.tier = 'gold' THEN 0 WHEN us.tier = 'silver' THEN 1 ELSE 2 END, ${sort}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  res.json({
    profiles: result.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/matches/:id/compatibility
router.get("/:id/compatibility", authenticate, async (req: AuthRequest, res: Response) => {
  const myProfile = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  if (!myProfile.rows[0]) return res.json(null);

  const cached = await query(
    `SELECT * FROM compatibility_results
     WHERE (profile_id_1 = $1 AND profile_id_2 = $2) OR (profile_id_1 = $2 AND profile_id_2 = $1)`,
    [myProfile.rows[0].id, req.params.id]
  );

  if (cached.rows[0]) return res.json(cached.rows[0]);

  // Would normally calculate — return placeholder
  res.json({ total_score: 0, poruthams: [], message: "Compatibility not yet calculated" });
});

// POST /api/matches/search — advanced search
router.post("/search", authenticate, async (req: AuthRequest, res: Response) => {
  // Reuse GET / logic with body filters — simplified redirect
  const filters = req.body.filters || {};
  const searchQuery = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => searchQuery.set(k, String(v)));
  searchQuery.set("page", String(req.body.page || 1));
  searchQuery.set("sort", req.body.sort || "score");

  // Redirect internally
  req.query = Object.fromEntries(searchQuery.entries());
  const handler = router.stack.find((s: any) => s.route?.path === "/")?.route?.stack[0]?.handle;
  if (handler) return handler(req, res, () => {});
  res.json({ profiles: [], total: 0 });
});

export default router;
