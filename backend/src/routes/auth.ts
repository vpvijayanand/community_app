import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db/pool";
import { generateToken, generateRefreshToken, authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) throw new AppError("Email and password required");

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length) throw new AppError("Email already registered", 409);

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role`,
    [email, hash]
  );
  const user = result.rows[0];
  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.status(201).json({ token, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required");

  const result = await query(
    "SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];
  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.is_active) throw new AppError("Account disabled", 403);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);

  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.json({ token, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/google
router.post("/google", async (req: Request, res: Response) => {
  const { email, name, googleId } = req.body;
  if (!email || !googleId) throw new AppError("Google auth data required");

  let userResult = await query("SELECT id, role FROM users WHERE email = $1", [email]);
  let user = userResult.rows[0];

  if (!user) {
    const ins = await query(
      `INSERT INTO users (email, role, is_email_verified) VALUES ($1, 'user', true) RETURNING id, role`,
      [email]
    );
    user = ins.rows[0];
  }

  // Upsert oauth account
  await query(
    `INSERT INTO oauth_accounts (user_id, provider, provider_account_id)
     VALUES ($1, 'google', $2)
     ON CONFLICT (provider, provider_account_id) DO NOTHING`,
    [user.id, googleId]
  );

  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);
  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.json({ token, refreshToken, user: { id: user.id, email, role: user.role } });
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError("Refresh token required");

  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    const result = await query("SELECT id, role FROM users WHERE id = $1 AND is_active = true", [decoded.userId]);
    if (!result.rows[0]) throw new AppError("User not found", 401);
    const user = result.rows[0];
    const token = generateToken(user.id, user.role);
    res.json({ token });
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT u.id, u.email, u.role, u.language_preference,
            p.id as profile_id, p.full_name, p.full_name_tamil, p.status as profile_status,
            us.tier as subscription_tier
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
     WHERE u.id = $1`,
    [req.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: true, message: "User not found" });
  res.json(result.rows[0]);
});

// POST /api/auth/logout
router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  await query("UPDATE users SET last_active_at = NOW() WHERE id = $1", [req.userId]);
  res.json({ message: "Logged out" });
});

export default router;
