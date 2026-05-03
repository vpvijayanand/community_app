const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email='family@example.com'");
    if (user.rows[0]) {
      const blocks = await pool.query("SELECT * FROM blocks WHERE blocker_user_id = $1", [user.rows[0].id]);
      console.log('Blocks for family:', blocks.rows);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
