const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

const PLANETS = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke', 'La'];
const RASIS = [
  'Mesham', 'Rishabam', 'Mithunam', 'Kadagam',
  'Simmam', 'Kanni', 'Thulam', 'Viruchigam',
  'Dhanusu', 'Magaram', 'Kumbam', 'Meenam'
];

async function seed() {
  try {
    const profiles = await pool.query("SELECT id FROM profiles WHERE status = 'approved'");
    console.log(`Seeding astrology charts for ${profiles.rows.length} profiles...`);

    for (const row of profiles.rows) {
      const profileId = row.id;
      
      const rasiChart = {};
      const navamsaChart = {};

      RASIS.forEach(r => { rasiChart[r] = []; navamsaChart[r] = []; });

      PLANETS.forEach(p => {
        const r1 = RASIS[Math.floor(Math.random() * 12)];
        const r2 = RASIS[Math.floor(Math.random() * 12)];
        rasiChart[r1].push(p);
        navamsaChart[r2].push(p);
      });

      // Update or Insert astrology_details
      const astro = await pool.query("SELECT id FROM astrology_details WHERE profile_id = $1", [profileId]);
      if (astro.rows.length === 0) {
        await pool.query(
          "INSERT INTO astrology_details (profile_id, rasi_name, natchathiram, birth_time, birth_place, rasi_chart, navamsa_chart) VALUES ($1, 'Mesham', 'Aswini', '10:00', 'Chennai', $2, $3)",
          [profileId, JSON.stringify(rasiChart), JSON.stringify(navamsaChart)]
        );
      } else {
        await pool.query(
          "UPDATE astrology_details SET rasi_chart = $1, navamsa_chart = $2 WHERE profile_id = $3",
          [JSON.stringify(rasiChart), JSON.stringify(navamsaChart), profileId]
        );
      }
      console.log(`  - Seeded charts for profile ${profileId}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
