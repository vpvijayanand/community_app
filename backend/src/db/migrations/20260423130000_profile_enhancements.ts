import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Profile number sequence starting at 1001
  await knex.raw("CREATE SEQUENCE IF NOT EXISTS profile_number_seq START 1001");

  await knex.schema.table('profiles', t => {
    t.bigInteger('profile_number').nullable().unique();
    t.boolean('is_closed').notNullable().defaultTo(false);
    t.text('closed_reason').nullable();
    t.timestamp('closed_at', { useTz: true }).nullable();
    t.uuid('closed_by').nullable().references('id').inTable('users');
    t.timestamp('reopened_at', { useTz: true }).nullable();
  });

  // Assign numbers to existing profiles in creation order
  await knex.raw(`
    UPDATE profiles SET profile_number = nextval('profile_number_seq')
    WHERE profile_number IS NULL
  `);

  // Set as default for new profiles
  await knex.raw(`
    ALTER TABLE profiles
      ALTER COLUMN profile_number SET DEFAULT nextval('profile_number_seq'),
      ALTER COLUMN profile_number SET NOT NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('profiles', t => {
    t.dropColumn('profile_number');
    t.dropColumn('is_closed');
    t.dropColumn('closed_reason');
    t.dropColumn('closed_at');
    t.dropColumn('closed_by');
    t.dropColumn('reopened_at');
  });
  await knex.raw("DROP SEQUENCE IF EXISTS profile_number_seq");
}
