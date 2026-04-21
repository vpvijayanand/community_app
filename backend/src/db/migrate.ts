import db from '../config/db';

export async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  await db.migrate.latest();
  console.log('✅ Migrations completed.');
}

// Run standalone when called directly (npm run db:migrate)
if (require.main === module) {
  runMigrations()
    .catch((err) => { console.error('Migration failed:', err); process.exit(1); })
    .finally(() => db.destroy());
}
