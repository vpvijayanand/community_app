import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { query } from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { v4 as uuid } from "uuid";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880") },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP allowed") as any, false);
    }
    cb(null, true);
  },
});

const router = Router();

// POST /api/upload/photo — upload profile photo
router.post("/photo", authenticate, upload.single("photo"), async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded");

  const profileRes = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  if (!profileRes.rows[0]) throw new AppError("Create profile first", 400);

  const profileId = profileRes.rows[0].id;
  const photoCount = await query("SELECT COUNT(*) FROM profile_photos WHERE profile_id = $1", [profileId]);
  if (parseInt(photoCount.rows[0].count) >= 5) throw new AppError("Maximum 5 photos allowed", 400);

  const isPrimary = parseInt(photoCount.rows[0].count) === 0;
  const url = `/uploads/${req.file.filename}`;

  const result = await query(
    `INSERT INTO profile_photos (profile_id, url, is_primary, blur_for_basic, sort_order)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [profileId, url, isPrimary, req.body.blurForBasic === "true", parseInt(photoCount.rows[0].count)]
  );

  res.status(201).json(result.rows[0]);
});

// DELETE /api/upload/photo/:id
router.delete("/photo/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const profileRes = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  if (!profileRes.rows[0]) throw new AppError("Profile not found", 404);

  await query(
    "DELETE FROM profile_photos WHERE id = $1 AND profile_id = $2",
    [req.params.id, profileRes.rows[0].id]
  );

  res.json({ message: "Photo deleted" });
});

// PUT /api/upload/photo/:id/primary
router.put("/photo/:id/primary", authenticate, async (req: AuthRequest, res: Response) => {
  const profileRes = await query("SELECT id FROM profiles WHERE user_id = $1", [req.userId]);
  if (!profileRes.rows[0]) throw new AppError("Profile not found", 404);
  const profileId = profileRes.rows[0].id;

  await query("UPDATE profile_photos SET is_primary = false WHERE profile_id = $1", [profileId]);
  await query("UPDATE profile_photos SET is_primary = true WHERE id = $1 AND profile_id = $2", [req.params.id, profileId]);

  res.json({ message: "Primary photo updated" });
});

export default router;
