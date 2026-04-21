import { Router, Response } from "express";
import { query } from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/profile/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT p.*, 
       (SELECT json_agg(s ORDER BY s.sort_order) FROM profile_siblings s WHERE s.profile_id = p.id) as siblings,
       (SELECT json_agg(ph ORDER BY ph.sort_order) FROM profile_photos ph WHERE ph.profile_id = p.id) as photos,
       row_to_json(pe) as expectations,
       row_to_json(ad) as astrology
     FROM profiles p
     LEFT JOIN profile_expectations pe ON pe.profile_id = p.id
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     WHERE p.user_id = $1`,
    [req.userId]
  );
  if (!result.rows[0]) return res.json(null);
  res.json(result.rows[0]);
});

// POST /api/profile/create — create or update profile (wizard step-by-step)
router.post("/create", authenticate, async (req: AuthRequest, res: Response) => {
  const { step, data } = req.body;
  if (!step || !data) throw new AppError("Step and data required");

  // Check existing
  let profileRes = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  let profileId: string;

  if (!profileRes.rows[0]) {
    // Step 1 must come first
    if (step !== 1) throw new AppError("Create profile from step 1");
    const ins = await query(
      `INSERT INTO profiles (user_id, full_name, full_name_tamil, gender, date_of_birth,
        marital_status, mother_tongue, religion, wizard_step)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
       RETURNING id`,
      [req.userId, data.fullName, data.fullNameTamil || null, data.gender,
       data.dateOfBirth, data.maritalStatus || "never_married",
       data.motherTongue || "Tamil", data.religion || "Hindu"]
    );
    profileId = ins.rows[0].id;
  } else {
    profileId = profileRes.rows[0].id;
  }

  // Update by step
  switch (step) {
    case 1:
      await query(
        `UPDATE profiles SET full_name=$2, full_name_tamil=$3, gender=$4, date_of_birth=$5,
         marital_status=$6, mother_tongue=$7, religion=$8, wizard_step=GREATEST(wizard_step,1), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.fullName, data.fullNameTamil, data.gender, data.dateOfBirth,
         data.maritalStatus, data.motherTongue, data.religion]
      );
      break;

    case 2:
      await query(
        `UPDATE profiles SET height_cm=$2, weight_kg=$3, complexion=$4, food_preference=$5,
         body_type=$6, physical_disability=$7, wizard_step=GREATEST(wizard_step,2), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.heightCm, data.weightKg, data.complexion, data.foodPreference,
         data.bodyType, data.physicalDisability]
      );
      break;

    case 3:
      await query(
        `UPDATE profiles SET employment_type=$2, company_name=$3, designation=$4,
         work_location=$5, annual_income=$6, wizard_step=GREATEST(wizard_step,3), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.employmentType, data.companyName, data.designation,
         data.workLocation, data.annualIncome]
      );
      break;

    case 4:
      await query(
        `UPDATE profiles SET qualification=$2, field_of_study=$3, institution=$4,
         graduation_year=$5, wizard_step=GREATEST(wizard_step,4), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.qualification, data.fieldOfStudy, data.institution, data.graduationYear]
      );
      break;

    case 5:
      await query(
        `UPDATE profiles SET family_type=$2, father_name=$3, father_occupation=$4, father_alive=$5,
         mother_name=$6, mother_occupation=$7, mother_alive=$8,
         family_status=$9, family_values=$10, wizard_step=GREATEST(wizard_step,5), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.familyType, data.fatherName, data.fatherOccupation, data.fatherAlive,
         data.motherName, data.motherOccupation, data.motherAlive,
         data.familyStatus, data.familyValues]
      );
      // Siblings
      if (data.siblings?.length) {
        await query("DELETE FROM profile_siblings WHERE profile_id = $1", [profileId]);
        for (let i = 0; i < data.siblings.length; i++) {
          const s = data.siblings[i];
          await query(
            `INSERT INTO profile_siblings (profile_id, name, gender, marital_status, occupation, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [profileId, s.name, s.gender, s.maritalStatus, s.occupation, i]
          );
        }
      }
      break;

    case 6:
      await query(
        `UPDATE profiles SET country=$2, state=$3, city=$4, area=$5,
         native_place=$6, willing_to_relocate=$7, wizard_step=GREATEST(wizard_step,6), updated_at=NOW()
         WHERE id=$1`,
        [profileId, data.country, data.state, data.city, data.area,
         data.nativePlace, data.willingToRelocate]
      );
      break;

    case 7:
      // Astrology
      await query(
        `INSERT INTO astrology_details (profile_id, date_of_birth, birth_time, birth_am_pm,
          birth_place, birth_lat, birth_lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (profile_id) DO UPDATE SET
           birth_time=$3, birth_am_pm=$4, birth_place=$5, birth_lat=$6, birth_lng=$7, updated_at=NOW()`,
        [profileId, data.dateOfBirth, data.birthTime, data.birthAmPm,
         data.birthPlace, data.birthLat, data.birthLng]
      );
      await query(
        `UPDATE profiles SET wizard_step=GREATEST(wizard_step,7), updated_at=NOW() WHERE id=$1`,
        [profileId]
      );
      break;

    case 8:
      // Expectations
      await query(
        `INSERT INTO profile_expectations (profile_id, age_range_min, age_range_max,
          height_range_min, height_range_max, complexion_pref, food_pref,
          education_pref, employment_pref, income_pref, location_pref,
          minimum_poruthams, custom_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (profile_id) DO UPDATE SET
           age_range_min=$2, age_range_max=$3, height_range_min=$4, height_range_max=$5,
           complexion_pref=$6, food_pref=$7, education_pref=$8, employment_pref=$9,
           income_pref=$10, location_pref=$11, minimum_poruthams=$12, custom_note=$13, updated_at=NOW()`,
        [profileId, data.ageRangeMin, data.ageRangeMax, data.heightRangeMin, data.heightRangeMax,
         data.complexionPref || [], data.foodPref || [], data.educationPref,
         data.employmentPref || [], data.incomePref, data.locationPref || [],
         data.minimumPoruthams || 6, data.customNote]
      );
      await query(
        `UPDATE profiles SET wizard_step=GREATEST(wizard_step,8), status='pending', updated_at=NOW() WHERE id=$1`,
        [profileId]
      );
      break;
  }

  // Recalculate completeness
  const profile = (await query("SELECT * FROM profiles WHERE id = $1", [profileId])).rows[0];
  let score = 0;
  if (profile.full_name) score += 10;
  if (profile.height_cm) score += 10;
  if (profile.employment_type) score += 10;
  if (profile.qualification) score += 10;
  if (profile.family_type) score += 10;
  if (profile.state) score += 10;
  const astro = (await query("SELECT id FROM astrology_details WHERE profile_id = $1", [profileId])).rows[0];
  if (astro) score += 20;
  const photos = (await query("SELECT COUNT(*) FROM profile_photos WHERE profile_id = $1", [profileId])).rows[0];
  if (parseInt(photos.count) > 0) score += 10;
  const exp = (await query("SELECT id FROM profile_expectations WHERE profile_id = $1", [profileId])).rows[0];
  if (exp) score += 10;

  await query("UPDATE profiles SET completeness_score = $2 WHERE id = $1", [profileId, score]);

  res.json({ profileId, step, completeness: score });
});

// GET /api/profile/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const result = await query(
    `SELECT p.*,
       (SELECT json_agg(s ORDER BY s.sort_order) FROM profile_siblings s WHERE s.profile_id = p.id) as siblings,
       (SELECT json_agg(ph ORDER BY ph.sort_order) FROM profile_photos ph WHERE ph.profile_id = p.id) as photos,
       row_to_json(pe) as expectations,
       row_to_json(ad) as astrology,
       (SELECT json_agg(pp) FROM planet_positions pp WHERE pp.astrology_id = ad.id) as planets
     FROM profiles p
     LEFT JOIN profile_expectations pe ON pe.profile_id = p.id
     LEFT JOIN astrology_details ad ON ad.profile_id = p.id
     WHERE p.id = $1 AND p.status = 'approved'`,
    [id]
  );
  if (!result.rows[0]) throw new AppError("Profile not found", 404);

  // Track view
  await query(
    "INSERT INTO profile_views (viewer_user_id, viewed_profile_id) VALUES ($1, $2)",
    [req.userId, id]
  );
  await query("UPDATE profiles SET view_count = view_count + 1 WHERE id = $1", [id]);

  // Update usage
  const month = new Date().toISOString().slice(0, 7);
  await query(
    `INSERT INTO usage_tracking (user_id, month, profile_views)
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, month) DO UPDATE SET profile_views = usage_tracking.profile_views + 1, updated_at = NOW()`,
    [req.userId, month]
  );

  // Get viewer subscription to determine blur
  const sub = await query(
    "SELECT tier FROM user_subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY end_date DESC LIMIT 1",
    [req.userId]
  );
  const tier = sub.rows[0]?.tier || "basic";

  const profile = result.rows[0];
  // Blur photos for basic users
  if (tier === "basic" && profile.photos) {
    profile.photos = profile.photos.map((p: any) => ({ ...p, url: null, blurred: true }));
  }
  // Hide salary for non-gold
  if (tier !== "gold") {
    profile.annual_income = null;
  }

  res.json({ ...profile, viewerTier: tier });
});

// POST /api/profile/:id/interest
router.post("/:id/interest", authenticate, async (req: AuthRequest, res: Response) => {
  const toProfile = await query("SELECT user_id FROM profiles WHERE id = $1", [req.params.id]);
  if (!toProfile.rows[0]) throw new AppError("Profile not found", 404);

  await query(
    `INSERT INTO interests (from_user_id, to_user_id, message)
     VALUES ($1, $2, $3)
     ON CONFLICT (from_user_id, to_user_id) DO NOTHING`,
    [req.userId, toProfile.rows[0].user_id, req.body.message || null]
  );

  // Notification
  await query(
    `INSERT INTO notifications (user_id, type, title, title_tamil, message, message_tamil, data)
     VALUES ($1, 'interest_received', 'New Interest', 'புதிய ஆர்வம்',
       'Someone expressed interest in your profile', 'யாரோ உங்கள் சுயவிவரத்தில் ஆர்வம் காட்டியுள்ளனர்',
       $2)`,
    [toProfile.rows[0].user_id, JSON.stringify({ fromUserId: req.userId })]
  );

  res.json({ message: "Interest sent" });
});

export default router;
