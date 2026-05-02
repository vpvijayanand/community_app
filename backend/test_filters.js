const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const user = await pool.query("SELECT id FROM users WHERE email='family@example.com'");
    const userId = user.rows[0].id;
    
    console.log('Testing with ageMin=18, ageMax=65, heightMin=140, heightMax=210');
    const queryStr = `
      SELECT p.id, p.full_name, EXTRACT(YEAR FROM age(p.date_of_birth)) as age, p.height_cm
      FROM profiles p
      WHERE p.status = 'approved' AND p.user_id != $1
      AND EXTRACT(YEAR FROM age(p.date_of_birth)) >= 18
      AND EXTRACT(YEAR FROM age(p.date_of_birth)) <= 65
      AND p.height_cm >= 140
      AND p.height_cm <= 210
    `;
    const res = await pool.query(queryStr, [userId]);
    console.log('Results Count:', res.rowCount);
    console.log('Samples:', res.rows.slice(0, 3));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
