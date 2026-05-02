const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email='family@example.com'");
    const userId = user.rows[0].id;
    
    // Default filters from frontend
    const filters = {
      ageMin: 18, ageMax: 65, heightMin: 140, heightMax: 210
    };
    
    let filterClause = `p.status = 'approved' AND p.user_id != $1`;
    const params = [userId];
    let paramIdx = 2;
    
    if (filters.ageMin) {
      filterClause += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) >= $${paramIdx}`;
      params.push(filters.ageMin);
      paramIdx++;
    }
    if (filters.ageMax) {
      filterClause += ` AND EXTRACT(YEAR FROM age(p.date_of_birth)) <= $${paramIdx}`;
      params.push(filters.ageMax);
      paramIdx++;
    }
    if (filters.heightMin) {
      filterClause += ` AND p.height_cm >= $${paramIdx}`;
      params.push(filters.heightMin);
      paramIdx++;
    }
    if (filters.heightMax) {
      filterClause += ` AND p.height_cm <= $${paramIdx}`;
      params.push(filters.heightMax);
      paramIdx++;
    }
    
    const queryStr = `SELECT id, full_name FROM profiles p WHERE ${filterClause}`;
    console.log('Query:', queryStr);
    console.log('Params:', params);
    
    const res = await pool.query(queryStr, params);
    console.log('Count:', res.rowCount);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
