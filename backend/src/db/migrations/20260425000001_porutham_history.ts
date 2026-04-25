import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("porutham_history", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("user_id").references("id").inTable("users").onDelete("SET NULL");
    
    // Boy Details
    table.string("boy_name").notNullable();
    table.date("boy_dob").notNullable();
    table.string("boy_time_of_birth").notNullable();
    table.string("boy_place").notNullable();
    
    // Girl Details
    table.string("girl_name").notNullable();
    table.date("girl_dob").notNullable();
    table.string("girl_time_of_birth").notNullable();
    table.string("girl_place").notNullable();
    
    // Result
    table.jsonb("result_json").notNullable();
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("porutham_history");
}
