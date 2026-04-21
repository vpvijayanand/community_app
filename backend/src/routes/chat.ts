import { Router, Response } from "express";
import { query } from "../db/pool";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";

const router = Router();

// GET /api/chat/conversations
router.get("/conversations", authenticate, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT c.id, c.last_message_at, c.is_blocked,
       cp.unread_count,
       CASE WHEN c.participant_1_id = $1 THEN c.participant_2_id ELSE c.participant_1_id END as partner_id,
       u.email as partner_email,
       p.full_name as partner_name, p.full_name_tamil as partner_name_tamil,
       (SELECT ph.url FROM profile_photos ph WHERE ph.profile_id = p.id AND ph.is_primary = true LIMIT 1) as partner_photo,
       (SELECT m.text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
     JOIN users u ON u.id = CASE WHEN c.participant_1_id = $1 THEN c.participant_2_id ELSE c.participant_1_id END
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE c.participant_1_id = $1 OR c.participant_2_id = $1
     ORDER BY c.last_message_at DESC NULLS LAST`,
    [req.userId]
  );
  res.json(result.rows);
});

// GET /api/chat/:userId/messages
router.get("/:userId/messages", authenticate, async (req: AuthRequest, res: Response) => {
  const partnerId = req.params.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  // Find or create conversation
  let conv = await query(
    `SELECT id FROM conversations
     WHERE (participant_1_id = $1 AND participant_2_id = $2)
        OR (participant_1_id = $2 AND participant_2_id = $1)`,
    [req.userId, partnerId]
  );

  if (!conv.rows[0]) return res.json({ messages: [], conversationId: null });

  const convId = conv.rows[0].id;
  const msgs = await query(
    `SELECT * FROM messages WHERE conversation_id = $1 AND is_deleted = false
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [convId, limit, offset]
  );

  res.json({ messages: msgs.rows.reverse(), conversationId: convId });
});

// POST /api/chat/:userId/send
router.post("/:userId/send", authenticate, async (req: AuthRequest, res: Response) => {
  const partnerId = req.params.userId;
  const { text } = req.body;
  if (!text?.trim()) throw new AppError("Message text required");

  // Check subscription chat limit
  const month = new Date().toISOString().slice(0, 7);
  const sub = await query(
    "SELECT tier FROM user_subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY end_date DESC LIMIT 1",
    [req.userId]
  );
  const tier = sub.rows[0]?.tier || "basic";
  if (tier === "basic") throw new AppError("Chat requires Silver or Gold subscription", 403);

  const usage = await query(
    "SELECT chat_initiations FROM usage_tracking WHERE user_id = $1 AND month = $2",
    [req.userId, month]
  );
  const used = usage.rows[0]?.chat_initiations || 0;
  const limits: Record<string, number> = { silver: 10, gold: 50 };
  if (used >= (limits[tier] || 0)) throw new AppError("Monthly chat limit reached", 429);

  // Find or create conversation
  let conv = await query(
    `SELECT id FROM conversations
     WHERE (participant_1_id = $1 AND participant_2_id = $2)
        OR (participant_1_id = $2 AND participant_2_id = $1)`,
    [req.userId, partnerId]
  );

  let convId: string;
  let isNew = false;
  if (!conv.rows[0]) {
    const ins = await query(
      `INSERT INTO conversations (participant_1_id, participant_2_id, last_message_at)
       VALUES ($1, $2, NOW()) RETURNING id`,
      [req.userId, partnerId]
    );
    convId = ins.rows[0].id;
    isNew = true;
    // Create participant records
    await query(
      `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
      [convId, req.userId, partnerId]
    );
  } else {
    convId = conv.rows[0].id;
  }

  // Insert message
  const msgRes = await query(
    `INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *`,
    [convId, req.userId, text.trim()]
  );

  // Update conversation
  await query("UPDATE conversations SET last_message_at = NOW() WHERE id = $1", [convId]);
  // Increment partner unread
  await query(
    `UPDATE conversation_participants SET unread_count = unread_count + 1
     WHERE conversation_id = $1 AND user_id = $2`,
    [convId, partnerId]
  );

  // Track usage if new conversation
  if (isNew) {
    await query(
      `INSERT INTO usage_tracking (user_id, month, chat_initiations)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, month) DO UPDATE SET chat_initiations = usage_tracking.chat_initiations + 1`,
      [req.userId, month]
    );
  }

  res.status(201).json(msgRes.rows[0]);
});

// GET /api/chat/limit
router.get("/limit", authenticate, async (req: AuthRequest, res: Response) => {
  const month = new Date().toISOString().slice(0, 7);
  const sub = await query(
    "SELECT tier FROM user_subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY end_date DESC LIMIT 1",
    [req.userId]
  );
  const tier = sub.rows[0]?.tier || "basic";
  const limits: Record<string, number> = { basic: 0, silver: 10, gold: 50 };
  const usage = await query(
    "SELECT chat_initiations FROM usage_tracking WHERE user_id = $1 AND month = $2",
    [req.userId, month]
  );

  res.json({
    used: usage.rows[0]?.chat_initiations || 0,
    limit: limits[tier] || 0,
    plan: tier,
  });
});

// POST /api/chat/:userId/block
router.post("/:userId/block", authenticate, async (req: AuthRequest, res: Response) => {
  await query(
    `INSERT INTO blocks (blocker_user_id, blocked_user_id, reason)
     VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
    [req.userId, req.params.userId, req.body.reason || null]
  );
  res.json({ message: "User blocked" });
});

// POST /api/chat/:userId/report
router.post("/:userId/report", authenticate, async (req: AuthRequest, res: Response) => {
  await query(
    `INSERT INTO reports (reporter_user_id, reported_user_id, reason, description)
     VALUES ($1, $2, $3, $4)`,
    [req.userId, req.params.userId, req.body.reason || "other", req.body.description || null]
  );
  res.json({ message: "Report submitted" });
});

export default router;
