import { Router, Response, NextFunction } from 'express';
import { query } from '../db/pool';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

// Helper: validate UUID format to avoid DB crashes
function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ─── POST /api/porutham/matches ───────────────────────────────────────────────
router.post('/matches', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      boyName, boyDob, boyTime, boyPlace,
      girlName, girlDob, girlTime, girlPlace,
      resultJson 
    } = req.body;

    if (!boyName || !girlName || !resultJson) {
      throw new AppError('Missing required fields for Porutham match', 400);
    }

    const result = await query(
      `INSERT INTO porutham_history
         (user_id, boy_name, boy_dob, boy_time_of_birth, boy_place,
          girl_name, girl_dob, girl_time_of_birth, girl_place, result_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, boy_name, girl_name, created_at`,
      [req.userId, boyName, boyDob, boyTime, boyPlace, girlName, girlDob, girlTime, girlPlace, JSON.stringify(resultJson)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/porutham/matches ────────────────────────────────────────────────
router.get('/matches', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      query(
        `SELECT id, boy_name, girl_name, boy_dob, girl_dob,
                (result_json->>'matchedCount')::int AS matched_count,
                (result_json->>'totalScore')::float AS total_score,
                created_at
         FROM porutham_history
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      ),
      query(
        'SELECT COUNT(*) FROM porutham_history WHERE user_id = $1',
        [req.userId]
      ),
    ]);

    res.json({
      matches: rows.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/porutham/matches/:id ───────────────────────────────────────────
router.get('/matches/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    if (!id || !isValidUUID(id)) {
      throw new AppError('Invalid match history ID', 400);
    }

    const result = await query(
      `SELECT id, user_id, boy_name, boy_dob, boy_time_of_birth, boy_place,
              girl_name, girl_dob, girl_time_of_birth, girl_place,
              result_json, created_at
       FROM porutham_history
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) throw new AppError('Match history not found', 404);

    const matchModel = result.rows[0];
    if (matchModel.user_id !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    res.json(matchModel);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/porutham/admin/matches ─────────────────────────────────────────
router.get('/admin/matches', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const whereClause = search ? `WHERE (ph.boy_name ILIKE $3 OR ph.girl_name ILIKE $3 OR u.email ILIKE $3)` : '';

    const [rows, countResult] = await Promise.all([
      query(
        `SELECT ph.id, ph.boy_name, ph.girl_name, ph.boy_dob, ph.girl_dob,
                (ph.result_json->>'matchedCount')::int AS matched_count,
                (ph.result_json->>'totalScore')::float AS total_score,
                ph.created_at,
                u.email AS user_email
         FROM porutham_history ph
         LEFT JOIN users u ON u.id = ph.user_id
         ${whereClause}
         ORDER BY ph.created_at DESC
         LIMIT $1 OFFSET $2`,
        search ? [limit, offset, `%${search}%`] : [limit, offset]
      ),
      query(
        `SELECT COUNT(*) FROM porutham_history ph
         LEFT JOIN users u ON u.id = ph.user_id
         ${whereClause}`,
        search ? [`%${search}%`] : []
      ),
    ]);

    res.json({
      matches: rows.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
