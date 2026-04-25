import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('astrology_chart_history', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    // Birth input
    t.string('name', 255).notNullable();
    t.string('gender', 10).notNullable();
    t.date('dob').notNullable();
    t.string('time_of_birth', 10).notNullable();
    t.string('place_name', 255).notNullable();
    t.decimal('latitude', 10, 6).notNullable();
    t.decimal('longitude', 10, 6).notNullable();
    // Full result stored as JSONB
    t.jsonb('result_json').notNullable();
    t.timestamps(true, true); // created_at, updated_at
  });

  // Index for fast user history lookups
  await knex.schema.raw(
    'CREATE INDEX idx_astrology_chart_history_user_id ON astrology_chart_history(user_id)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('astrology_chart_history');
}
