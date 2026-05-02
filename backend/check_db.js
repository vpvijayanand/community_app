const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email='family@example.com'");
    console.log('User:', user.rows);
    const profiles = await pool.query("SELECT * FROM profiles WHERE status='approved'");
    console.log('Approved Profiles Count:', profiles.rowCount);
    if (user.rows[0]) {
      const matches = await pool.query("SELECT id FROM profiles WHERE status='approved' AND user_id != $1", [user.rows[0].id]);
      console.log('Matches Count:', matches.rowCount);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
