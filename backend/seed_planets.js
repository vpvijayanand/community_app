const pg = require('pg');
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/new_maratha_latest_1' });

const PLANETS = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke', 'La'];

async function seed() {
  try {
    const profiles = await pool.query("SELECT id FROM profiles WHERE status = 'approved'");
    console.log(`Seeding planets for ${profiles.rows.length} profiles...`);

    for (const row of profiles.rows) {
      const profileId = row.id;
      
      // 1. Get or Create astrology_details
      let astro = await pool.query("SELECT id FROM astrology_details WHERE profile_id = $1", [profileId]);
      let astroId;
      if (astro.rows.length === 0) {
        const ins = await pool.query(
          "INSERT INTO astrology_details (profile_id, rasi_name, natchathiram, birth_time, birth_place) VALUES ($1, 'Mesham', 'Aswini', '10:00', 'Chennai') RETURNING id",
          [profileId]
        );
        astroId = ins.rows[0].id;
      } else {
        astroId = astro.rows[0].id;
      }

      // 2. Clear existing planets
      await pool.query("DELETE FROM planet_positions WHERE astrology_id = $1", [astroId]);

      // 3. Insert new planets (Rasi & Navamsa)
      for (const isNavamsa of [false, true]) {
        for (const p of PLANETS) {
          const house = Math.floor(Math.random() * 12) + 1;
          const rasi = (house + 2) % 12 + 1; // dummy rasi
          await pool.query(
            "INSERT INTO planet_positions (astrology_id, planet, house, rasi) VALUES ($1, $2, $3, $4)",
            [astroId, p, house, rasi]
          );
        }
      }
      console.log(`  - Seeded planets for profile ${profileId}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
