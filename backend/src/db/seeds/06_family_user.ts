import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  const email = 'family@example.com';
  const password = 'Family@123';

  // Idempotent: delete existing data for this user
  await knex('users').where({ email }).del();

  const hash = await bcrypt.hash(password, 10);

  await knex('users').insert({
    email,
    password_hash: hash,
    role: 'user',
    is_active: true,
    is_email_verified: true,
  });

  console.log(`✅ Family user seeded: ${email}`);
}
