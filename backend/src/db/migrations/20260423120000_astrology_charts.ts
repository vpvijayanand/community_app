import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('astrology_details', t => {
    t.jsonb('rasi_chart').nullable();
    t.jsonb('navamsa_chart').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('astrology_details', t => {
    t.dropColumn('rasi_chart');
    t.dropColumn('navamsa_chart');
  });
}
