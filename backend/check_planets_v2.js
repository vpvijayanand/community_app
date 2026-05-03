const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT p.full_name, 
             (SELECT COUNT(*) FROM planet_positions pp 
              JOIN astrology_details ad ON ad.id = pp.astrology_id 
              WHERE ad.profile_id = p.id) as planet_count
      FROM profiles p 
      WHERE p.status = 'approved'
    `);
    console.log('--- PLANET DATA ---');
    res.rows.forEach((r, i) => {
      console.log(`${i+1}. ${r.full_name}: ${r.planet_count} planets`);
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
