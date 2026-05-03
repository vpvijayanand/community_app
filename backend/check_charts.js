const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT p.full_name, ad.rasi_chart, ad.navamsa_chart
      FROM profiles p 
      LEFT JOIN astrology_details ad ON ad.profile_id = p.id 
      WHERE p.status = 'approved'
    `);
    console.log('--- CHARTS DATA ---');
    res.rows.forEach((r, i) => {
      console.log(`${i+1}. ${r.full_name}: Rasi=${JSON.stringify(r.rasi_chart)}, Navamsa=${JSON.stringify(r.navamsa_chart)}`);
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
