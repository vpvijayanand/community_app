const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT p.id, p.full_name, p.gender, p.date_of_birth, p.height_cm, 
             p.marital_status, p.religion, p.mother_tongue,
             ad.rasi_name, ad.natchathiram
      FROM profiles p 
      LEFT JOIN astrology_details ad ON ad.profile_id = p.id 
      WHERE p.status = 'approved'
    `);
    console.log('--- PROFILES DATA ---');
    res.rows.forEach((r, i) => {
      console.log(`${i+1}. ${r.full_name} (${r.gender}) - DOB: ${r.date_of_birth}, Ht: ${r.height_cm}, Marital: ${r.marital_status}, Astro: ${r.rasi_name}/${r.natchathiram}`);
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
