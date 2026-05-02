import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('astrology_chart_history');
  if (tableExists) {
    const hasDeletedAt = await knex.schema.hasColumn('astrology_chart_history', 'deleted_at');
    if (!hasDeletedAt) {
      await knex.schema.alterTable('astrology_chart_history', (t) => {
        t.timestamp('deleted_at').nullable();
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable('astrology_chart_history');
  if (tableExists) {
    const hasDeletedAt = await knex.schema.hasColumn('astrology_chart_history', 'deleted_at');
    if (hasDeletedAt) {
      await knex.schema.alterTable('astrology_chart_history', (t) => {
        t.dropColumn('deleted_at');
      });
    }
  }
}
