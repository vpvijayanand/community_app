import db from './src/config/db';

async function checkUsers() {
  try {
    const users = await db('users').select('email', 'role', 'is_active');
    console.log('Users in database:', JSON.stringify(users, null, 2));
  } catch (err: any) {
    console.error('Error checking users:', err.message);
  } finally {
    await db.destroy();
  }
}

checkUsers();
