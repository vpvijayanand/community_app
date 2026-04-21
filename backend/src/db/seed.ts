import db from '../config/db';

async function runSeeds() {
  try {
    console.log('Running seeds...');
    await db.seed.run();
    console.log('✅ Seeds completed successfully.');
  } catch (err: any) {
    console.error('Error running seeds:', err.message);
    process.exit(1);
  } finally {
    db.destroy();
  }
}

runSeeds();
