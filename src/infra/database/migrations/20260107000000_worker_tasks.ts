import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("worker_tasks", (table) => {
    table.increments("id").primary();
    
    // Task identification
    table.string("type", 50).notNullable().index();
    table.jsonb("payload").notNullable().defaultTo("{}");
    
    // Status and priority
    table.string("status", 50).notNullable().defaultTo("PENDING").index();
    table.integer("priority").notNullable().defaultTo(5);
    
    // Retry handling
    table.integer("attempts").notNullable().defaultTo(0);
    table.integer("max_attempts").notNullable().defaultTo(3);
    
    // Idempotency key for deduplication
    table.string("idempotency_key", 50).nullable();
    
    // User who created the task
    table.integer("created_by_user_id").nullable().index();
    
    // Scheduling
    table.timestamp("scheduled_at", { useTz: true }).nullable().index();
    
    // Execution timestamps
    table.timestamp("started_at", { useTz: true }).nullable();
    table.timestamp("finished_at", { useTz: true }).nullable();
    
    // Error tracking
    table.text("error_message").nullable();
    table.text("error_stack").nullable();
    
    // Result storage
    table.jsonb("result").nullable();
    
    // Lock management for concurrent workers
    table.string("locked_by", 255).nullable().index();
    table.timestamp("locked_until", { useTz: true }).nullable().index();
    
    // Standard timestamps
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    
    // Composite indexes for common queries
    table.index(["status", "priority", "scheduled_at"], "idx_worker_tasks_pending");
    table.index(["status", "locked_until"], "idx_worker_tasks_stale");
    table.index(["status", "finished_at"], "idx_worker_tasks_cleanup");
  });

  // Partial unique index for idempotency key (PostgreSQL specific)
  // Ensures uniqueness only for active tasks (PENDING/RUNNING)
  await knex.raw(`
    CREATE UNIQUE INDEX idx_worker_tasks_idempotency_active 
    ON worker_tasks ("idempotency_key") 
    WHERE "idempotency_key" IS NOT NULL 
    AND status IN ('PENDING', 'RUNNING')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_worker_tasks_idempotency_active`);
  await knex.schema.dropTableIfExists("worker_tasks");
}
