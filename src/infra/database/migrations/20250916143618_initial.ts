import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user", (table) => {
    table.increments("id").primary();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 60).notNullable();
    table.string("name", 255).notNullable();
    table.string("role", 50).notNullable().defaultTo("USER");
    table.boolean("is_email_verified").notNullable().defaultTo(false);
    table.timestamp("last_login_at", { useTz: true }).nullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user");
}
