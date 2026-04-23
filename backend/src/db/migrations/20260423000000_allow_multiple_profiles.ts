import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('profiles', (t) => {
    t.dropUnique(['user_id'], 'profiles_user_id_unique');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('profiles', (t) => {
    t.unique(['user_id']);
  });
}
