const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

async function run() {
  try {
    const tables = ['profiles', 'astrology_details', 'planet_positions', 'profile_siblings'];
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`--- ${table.toUpperCase()} ---`);
      console.log(res.rows.map(r => r.column_name).join(', '));
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
