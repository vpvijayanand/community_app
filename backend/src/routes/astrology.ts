import { Router, Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

// Helper: validate UUID format to avoid DB crashes
function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─── POST /api/astrology/charts ───────────────────────────────────────────────
router.post('/charts', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, gender, dob, timeOfBirth, placeName, latitude, longitude, resultJson } = req.body;

    if (!name || !dob || !timeOfBirth || !placeName || !latitude || !longitude || !resultJson) {
      throw new AppError('Missing required fields', 400);
    }

    const result = await query(
      `INSERT INTO astrology_chart_history
         (user_id, name, gender, dob, time_of_birth, place_name, latitude, longitude, result_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, dob, place_name, created_at`,
      [req.userId, name, gender, dob, timeOfBirth, placeName, latitude, longitude, JSON.stringify(resultJson)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/astrology/charts ────────────────────────────────────────────────
router.get('/charts', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      query(
        `SELECT id, name, gender, dob, time_of_birth, place_name,
                result_json->>'moonRasiTamil' AS moon_rasi_tamil,
                result_json->>'natchathiramTamil' AS natchathiram_tamil,
                result_json->>'lagnamTamil' AS lagnam_tamil,
                (result_json->>'pada')::int AS pada,
                created_at
         FROM astrology_chart_history
         WHERE user_id = $1 AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      ),
      query(
        'SELECT COUNT(*) FROM astrology_chart_history WHERE user_id = $1 AND deleted_at IS NULL',
        [req.userId]
      ),
    ]);

    res.json({
      charts: rows.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/astrology/charts/:id ───────────────────────────────────────────
router.get('/charts/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      throw new AppError('Invalid chart ID', 400);
    }

    const result = await query(
      `SELECT id, user_id, name, gender, dob, time_of_birth, place_name,
              latitude, longitude, result_json, created_at
       FROM astrology_chart_history
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!result.rows[0]) throw new AppError('Chart not found', 404);

    const chart = result.rows[0];
    if (chart.user_id !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    res.json(chart);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/astrology/charts/:id  (soft delete) ─────────────────────────
router.delete('/charts/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      throw new AppError('Invalid chart ID', 400);
    }

    // Fetch the chart first to verify ownership / admin
    const existing = await query(
      `SELECT id, user_id FROM astrology_chart_history WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!existing.rows[0]) throw new AppError('Chart not found', 404);

    if (existing.rows[0].user_id !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    // Soft delete — set deleted_at timestamp
    await query(
      `UPDATE astrology_chart_history SET deleted_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Chart deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/astrology/admin/charts ─────────────────────────────────────────
router.get('/admin/charts', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const isDeleted = req.query.isDeleted === 'true';

    const whereBase = isDeleted 
      ? `WHERE ach.deleted_at IS NOT NULL`
      : `WHERE ach.deleted_at IS NULL`;

    const whereClause = search
      ? `${whereBase} AND (ach.name ILIKE $3 OR u.email ILIKE $3)`
      : whereBase;

    const [rows, countResult] = await Promise.all([
      query(
        `SELECT ach.id, ach.name, ach.gender, ach.dob, ach.time_of_birth, ach.place_name,
                ach.result_json->>'moonRasiTamil' AS moon_rasi_tamil,
                ach.result_json->>'natchathiramTamil' AS natchathiram_tamil,
                ach.result_json->>'lagnamTamil' AS lagnam_tamil,
                (ach.result_json->>'pada')::int AS pada,
                ach.created_at,
                u.email AS user_email
         FROM astrology_chart_history ach
         LEFT JOIN users u ON u.id = ach.user_id
         ${whereClause}
         ORDER BY ach.created_at DESC
         LIMIT $1 OFFSET $2`,
        search ? [limit, offset, `%${search}%`] : [limit, offset]
      ),
      query(
        `SELECT COUNT(*) FROM astrology_chart_history ach
         LEFT JOIN users u ON u.id = ach.user_id
         ${whereClause}`,
        search ? [`%${search}%`] : []
      ),
    ]);

    res.json({
      charts: rows.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
