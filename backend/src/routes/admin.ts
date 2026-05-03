import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { query } from "../db/pool";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireAdmin);

import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

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
       us.tier,
       COALESCE(
         (SELECT json_agg(json_build_object(
           'id', p.id,
           'profile_number', p.profile_number,
           'full_name', p.full_name,
           'gender', p.gender,
           'status', p.status,
           'is_closed', p.is_closed,
           'created_at', p.created_at,
           'city', p.city,
           'state', p.state
         ) ORDER BY p.created_at)
         FROM profiles p WHERE p.user_id = u.id),
         '[]'::json
       ) as profiles
     FROM users u
     LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query("SELECT COUNT(*) FROM users");

  res.json({ users: result.rows, total: parseInt(count.rows[0].count), page });
});

// GET /api/admin/users/:id — single user with their profiles
router.get("/users/:id", async (req, res) => {
  const result = await query(
    `SELECT u.id, u.email, u.role, u.is_active, u.is_email_verified,
       u.created_at, u.last_active_at, u.last_login_at,
       us.tier, us.start_date as sub_start, us.end_date as sub_end,
       COALESCE(
         (SELECT json_agg(json_build_object(
           'id', p.id, 'full_name', p.full_name, 'gender', p.gender,
           'status', p.status, 'created_at', p.created_at,
           'city', p.city, 'state', p.state, 'completeness_score', p.completeness_score
         ) ORDER BY p.created_at)
         FROM profiles p WHERE p.user_id = u.id),
         '[]'::json
       ) as profiles
     FROM users u
     LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
     WHERE u.id = $1`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: true, message: "User not found" });
  res.json(result.rows[0]);
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

// GET /api/admin/profiles/:id — full profile detail for admin (any status)
router.get("/profiles/:id", async (req, res) => {
  const result = await query(
    `SELECT p.*, u.email,
       row_to_json(pe) as expectations,
       row_to_json(ad) as astrology,
       COALESCE(
         (SELECT json_agg(ph ORDER BY ph.sort_order) FROM profile_photos ph WHERE ph.profile_id = p.id),
         '[]'::json
       ) as photos,
       COALESCE(
         (SELECT json_agg(s ORDER BY s.sort_order) FROM profile_siblings s WHERE s.profile_id = p.id),
         '[]'::json
       ) as siblings
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN profile_expectations pe ON pe.profile_id = p.id
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: true, message: "Profile not found" });
  res.json(result.rows[0]);
});

// PUT /api/admin/profiles/:id — edit profile sections
router.put("/profiles/:id", async (req: AuthRequest, res: Response) => {
  const pid = req.params.id;
  const { section, data } = req.body;

  switch (section) {
    case "basic":
      await query(
        `UPDATE profiles SET full_name=$2, full_name_tamil=$3, date_of_birth=$4, gender=$5,
         marital_status=$6, mother_tongue=$7, religion=$8, height_cm=$9, weight_kg=$10,
         complexion=$11, food_preference=$12, body_type=$13, physical_disability=$14, updated_at=NOW()
         WHERE id=$1`,
        [pid, data.full_name, data.full_name_tamil, data.date_of_birth, data.gender,
         data.marital_status, data.mother_tongue, data.religion, data.height_cm || null, data.weight_kg || null,
         data.complexion, data.food_preference, data.body_type, data.physical_disability]
      );
      break;
    case "career":
      await query(
        `UPDATE profiles SET employment_type=$2, company_name=$3, designation=$4,
         work_location=$5, annual_income=$6, qualification=$7, field_of_study=$8,
         institution=$9, graduation_year=$10, updated_at=NOW() WHERE id=$1`,
        [pid, data.employment_type, data.company_name, data.designation,
         data.work_location, data.annual_income || null, data.qualification,
         data.field_of_study, data.institution, data.graduation_year || null]
      );
      break;
    case "family":
      await query(
        `UPDATE profiles SET family_type=$2, family_status=$3, family_values=$4,
         father_name=$5, father_occupation=$6, father_alive=$7,
         mother_name=$8, mother_occupation=$9, mother_alive=$10,
         country=$11, state=$12, city=$13, area=$14, native_place=$15, willing_to_relocate=$16,
         updated_at=NOW() WHERE id=$1`,
        [pid, data.family_type, data.family_status, data.family_values,
         data.father_name, data.father_occupation,
         data.father_alive === "yes" ? true : data.father_alive === "no" ? false : null,
         data.mother_name, data.mother_occupation,
         data.mother_alive === "yes" ? true : data.mother_alive === "no" ? false : null,
         data.country, data.state, data.city, data.area, data.native_place,
         data.willing_to_relocate === "yes" ? true : data.willing_to_relocate === "no" ? false : null]
      );
      break;
    case "astrology":
      await query(
        `INSERT INTO astrology_details
           (profile_id, date_of_birth, birth_time, birth_am_pm, birth_place, lagna_name, rasi_name, natchathiram, padam, rasi_chart, navamsa_chart)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (profile_id) DO UPDATE SET
           birth_time=$3, birth_am_pm=$4, birth_place=$5, lagna_name=$6,
           rasi_name=$7, natchathiram=$8, padam=$9, rasi_chart=$10, navamsa_chart=$11, updated_at=NOW()`,
        [pid, data.date_of_birth, data.birth_time, data.birth_am_pm, data.birth_place,
         data.lagna_name, data.rasi_name, data.natchathiram, data.padam || null,
         data.rasi_chart ? JSON.stringify(data.rasi_chart) : null,
         data.navamsa_chart ? JSON.stringify(data.navamsa_chart) : null]
      );
      break;
    case "expectations":
      await query(
        `INSERT INTO profile_expectations
           (profile_id, age_range_min, age_range_max, height_range_min, height_range_max,
            education_pref, employment_pref, income_pref, location_pref, minimum_poruthams, custom_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (profile_id) DO UPDATE SET
           age_range_min=$2, age_range_max=$3, height_range_min=$4, height_range_max=$5,
           education_pref=$6, employment_pref=$7, income_pref=$8, location_pref=$9,
           minimum_poruthams=$10, custom_note=$11, updated_at=NOW()`,
        [pid, data.age_range_min || null, data.age_range_max || null,
         data.height_range_min || null, data.height_range_max || null,
         data.education_pref, data.employment_pref || [],
         data.income_pref || null, data.location_pref || [],
         data.minimum_poruthams || 6, data.custom_note]
      );
      break;
    default:
      return res.status(400).json({ error: true, message: "Unknown section" });
  }

  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, details)
     VALUES ($1, 'update_profile', 'profile', $2, $3)`,
    [req.userId, pid, JSON.stringify({ section })]
  );
  res.json({ message: "Profile updated" });
});

// POST /api/admin/profiles/:id/photo — upload photo for any profile
router.post("/profiles/:id/photo", upload.single("photo"), async (req: AuthRequest, res: Response) => {
  const pid = req.params.id;
  if (!req.file) return res.status(400).json({ error: true, message: "No file uploaded" });
  const photoCount = await query("SELECT COUNT(*) FROM profile_photos WHERE profile_id = $1", [pid]);
  if (parseInt(photoCount.rows[0].count) >= 5) return res.status(400).json({ error: true, message: "Maximum 5 photos" });
  const isPrimary = parseInt(photoCount.rows[0].count) === 0;
  const result = await query(
    `INSERT INTO profile_photos (profile_id, url, is_primary, blur_for_basic, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [pid, `/uploads/${req.file.filename}`, isPrimary, req.body.blurForBasic === "true", parseInt(photoCount.rows[0].count)]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/admin/profiles/:id/photo/:photoId
router.delete("/profiles/:id/photo/:photoId", async (req: AuthRequest, res: Response) => {
  await query("DELETE FROM profile_photos WHERE id = $1 AND profile_id = $2", [req.params.photoId, req.params.id]);
  res.json({ message: "Photo deleted" });
});

// PUT /api/admin/profiles/:id/photo/:photoId/primary
router.put("/profiles/:id/photo/:photoId/primary", async (req: AuthRequest, res: Response) => {
  await query("UPDATE profile_photos SET is_primary = false WHERE profile_id = $1", [req.params.id]);
  await query("UPDATE profile_photos SET is_primary = true WHERE id = $1 AND profile_id = $2", [req.params.photoId, req.params.id]);
  res.json({ message: "Primary updated" });
});

// PATCH /api/admin/profiles/:id/photo/:photoId/blur
router.patch("/profiles/:id/photo/:photoId/blur", async (req: AuthRequest, res: Response) => {
  await query("UPDATE profile_photos SET blur_for_basic = $3 WHERE id = $1 AND profile_id = $2",
    [req.params.photoId, req.params.id, req.body.blur]);
  res.json({ message: "Blur updated" });
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

// GET /api/admin/profiles/:id/matches — find matching candidates for a profile
router.get("/profiles/:id/matches", async (req: AuthRequest, res: Response) => {
  const profileId = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // Load source profile with expectations and astrology
  const srcRes = await query(
    `SELECT p.*, pe.age_range_min, pe.age_range_max, pe.height_range_min, pe.height_range_max,
       pe.minimum_poruthams, pe.food_pref, pe.education_pref, pe.location_pref,
       ad.rasi_name as src_rasi, ad.natchathiram as src_star, ad.lagna_name as src_lagna,
       EXTRACT(YEAR FROM age(p.date_of_birth))::int as src_age
     FROM profiles p
     LEFT JOIN profile_expectations pe ON pe.profile_id = p.id
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     WHERE p.id = $1`,
    [profileId]
  );
  const src = srcRes.rows[0];
  if (!src) return res.status(404).json({ message: "Profile not found" });

  const defaultGender = src.gender === "male" ? "female" : "male";
  const genderFilter = (req.query.gender as string) || defaultGender;

  let where = `p.status = 'approved' AND p.is_closed = false AND p.gender = $1 AND p.id != $2`;
  const params: any[] = [genderFilter, profileId];
  let idx = 3;

  if (req.query.ageMin) { where += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) >= $${idx++}`; params.push(Number(req.query.ageMin)); }
  if (req.query.ageMax) { where += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) <= $${idx++}`; params.push(Number(req.query.ageMax)); }
  if (req.query.state)  { where += ` AND p.state ILIKE $${idx++}`; params.push(req.query.state); }
  if (req.query.rasi)   { where += ` AND ad.rasi_name = $${idx++}`; params.push(req.query.rasi); }

  const countRes = await query(
    `SELECT COUNT(*) FROM profiles p
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     WHERE ${where}`, params
  );
  const total = parseInt(countRes.rows[0].count);

  const result = await query(
    `SELECT p.id, p.profile_number, p.full_name, p.full_name_tamil, p.gender,
       p.date_of_birth, p.height_cm, p.complexion, p.food_preference,
       p.state, p.city, p.qualification, p.field_of_study, p.employment_type,
       p.designation, p.religion, p.completeness_score,
       ad.rasi_name, ad.natchathiram, ad.lagna_name,
       pe.age_range_min as exp_age_min, pe.age_range_max as exp_age_max,
       pe.height_range_min as exp_h_min, pe.height_range_max as exp_h_max,
       pe.minimum_poruthams as exp_poruthams,
       (SELECT ph.url FROM profile_photos ph WHERE ph.profile_id = p.id AND ph.is_primary = true LIMIT 1) as photo,
       EXTRACT(YEAR FROM age(p.date_of_birth))::int as age
     FROM profiles p
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     LEFT JOIN profile_expectations pe ON pe.profile_id = p.id
     WHERE ${where}
     ORDER BY p.completeness_score DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  // Score each candidate out of 10
  const srcAge: number | null = src.src_age;
  const candidates = result.rows.map((c: any) => {
    let score = 0;
    const matchDetails: string[] = [];

    // Age: candidate's age within source's expectation (2 pts)
    if (src.age_range_min && src.age_range_max && c.age) {
      if (c.age >= src.age_range_min && c.age <= src.age_range_max) { score += 2; matchDetails.push("Age within your expectation range"); }
    } else { score += 1; matchDetails.push("Age (no preference set)"); }

    // Source age within candidate's expectation (1 pt)
    if (c.exp_age_min && c.exp_age_max && srcAge) {
      if (srcAge >= c.exp_age_min && srcAge <= c.exp_age_max) { score += 1; matchDetails.push("Your age within their expectation"); }
    }

    // Height (1 pt — check both ways)
    if (src.height_range_min && src.height_range_max && c.height_cm) {
      if (c.height_cm >= src.height_range_min && c.height_cm <= src.height_range_max) { score += 1; matchDetails.push("Height within your preference"); }
    } else if (c.exp_h_min && c.exp_h_max && src.height_cm) {
      if (src.height_cm >= c.exp_h_min && src.height_cm <= c.exp_h_max) { score += 1; matchDetails.push("Your height within their preference"); }
    }

    // Religion (2 pts)
    if (src.religion && c.religion && src.religion === c.religion) { score += 2; matchDetails.push("Same religion"); }

    // Same state (1 pt)
    if (src.state && c.state && src.state.toLowerCase() === c.state.toLowerCase()) { score += 1; matchDetails.push("Same state"); }

    // Both have horoscope (2 pts)
    if (src.src_rasi && c.rasi_name) { score += 2; matchDetails.push("Both have horoscope data"); }

    // Food preference (1 pt)
    if (src.food_preference && c.food_preference && src.food_preference === c.food_preference) { score += 1; matchDetails.push("Food preference compatible"); }

    return { ...c, matchScore: Math.min(score, 10), matchTotal: 10, matchDetails };
  });

  candidates.sort((a: any, b: any) => b.matchScore - a.matchScore);

  res.json({
    sourceProfile: { id: src.id, full_name: src.full_name, gender: src.gender, profile_number: src.profile_number },
    candidates,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// PUT /api/admin/profiles/:id/close
router.put("/profiles/:id/close", async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  await query(
    `UPDATE profiles SET is_closed=true, closed_reason=$2, closed_at=NOW(), closed_by=$3, updated_at=NOW() WHERE id=$1`,
    [req.params.id, reason || null, req.userId]
  );
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, details)
     VALUES ($1, 'close_profile', 'profile', $2, $3)`,
    [req.userId, req.params.id, JSON.stringify({ reason })]
  );
  res.json({ message: "Profile closed" });
});

// PUT /api/admin/profiles/:id/reopen
router.put("/profiles/:id/reopen", async (req: AuthRequest, res: Response) => {
  await query(
    `UPDATE profiles SET is_closed=false, closed_reason=NULL, closed_at=NULL, closed_by=NULL, reopened_at=NOW(), updated_at=NOW() WHERE id=$1`,
    [req.params.id]
  );
  await query(
    `INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id)
     VALUES ($1, 'reopen_profile', 'profile', $2)`,
    [req.userId, req.params.id]
  );
  res.json({ message: "Profile reopened" });
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
