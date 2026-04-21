import { Router, Response } from "express";
import { query } from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/subscription/plans
router.get("/plans", async (_req, res) => {
  const result = await query("SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly");
  res.json(result.rows);
});

// GET /api/subscription/me
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT us.*, sp.name as plan_name, sp.name_tamil, sp.profile_views_per_month,
       sp.chat_conversations_per_month, sp.can_view_astrology, sp.can_view_photos,
       sp.can_view_salary, sp.can_view_contact, sp.priority_in_search, sp.show_badge
     FROM user_subscriptions us
     JOIN subscription_plans sp ON sp.id = us.plan_id
     WHERE us.user_id = $1 AND us.status = 'active'
     ORDER BY us.end_date DESC LIMIT 1`,
    [req.userId]
  );
  if (!result.rows[0]) {
    // Return basic defaults
    const basic = await query("SELECT * FROM subscription_plans WHERE name = 'basic'");
    return res.json({ tier: "basic", plan: basic.rows[0] || null });
  }
  res.json(result.rows[0]);
});

// POST /api/subscription/upgrade
router.post("/upgrade", authenticate, async (req: AuthRequest, res: Response) => {
  const { planId, paymentId } = req.body;

  const plan = await query("SELECT * FROM subscription_plans WHERE id = $1", [planId]);
  if (!plan.rows[0]) return res.status(404).json({ error: true, message: "Plan not found" });

  // Create subscription
  const sub = await query(
    `INSERT INTO user_subscriptions (user_id, plan_id, tier, status, start_date, end_date)
     VALUES ($1, $2, $3, 'active', NOW(), NOW() + INTERVAL '1 month')
     RETURNING *`,
    [req.userId, planId, plan.rows[0].name]
  );

  // Record payment
  if (paymentId) {
    await query(
      `INSERT INTO payments (user_id, subscription_id, amount, gateway_payment_id, status, paid_at)
       VALUES ($1, $2, $3, $4, 'success', NOW())`,
      [req.userId, sub.rows[0].id, plan.rows[0].price_monthly, paymentId]
    );
  }

  // Expire old subscriptions
  await query(
    `UPDATE user_subscriptions SET status = 'expired' WHERE user_id = $1 AND id != $2 AND status = 'active'`,
    [req.userId, sub.rows[0].id]
  );

  res.json({ subscription: sub.rows[0] });
});

export default router;
