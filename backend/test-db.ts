import db from './src/config/db';

async function test() {
  try {
    const res = await db.raw('SELECT 1+1 AS result');
    console.log('✅ Database connected successfully!', res.rows);
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    db.destroy();
  }
}

test();
