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
    table.integer("maxAttempts").notNullable().defaultTo(3);
    
    // Idempotency key for deduplication
    table.string("idempotencyKey", 50).nullable();
    
    // User who created the task
    table.integer("createdByUserId").nullable().index();
    
    // Scheduling
    table.timestamp("scheduledAt", { useTz: true }).nullable().index();
    
    // Execution timestamps
    table.timestamp("startedAt", { useTz: true }).nullable();
    table.timestamp("finishedAt", { useTz: true }).nullable();
    
    // Error tracking
    table.text("errorMessage").nullable();
    table.text("errorStack").nullable();
    
    // Result storage
    table.jsonb("result").nullable();
    
    // Lock management for concurrent workers
    table.string("lockedBy", 255).nullable().index();
    table.timestamp("lockedUntil", { useTz: true }).nullable().index();
    
    // Standard timestamps
    table.timestamp("createdAt", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    
    // Composite indexes for common queries
    table.index(["status", "priority", "scheduledAt"], "idx_worker_tasks_pending");
    table.index(["status", "lockedUntil"], "idx_worker_tasks_stale");
    table.index(["status", "finishedAt"], "idx_worker_tasks_cleanup");
  });

  // Partial unique index for idempotency key (PostgreSQL specific)
  // Ensures uniqueness only for active tasks (PENDING/RUNNING)
  await knex.raw(`
    CREATE UNIQUE INDEX idx_worker_tasks_idempotency_active 
    ON worker_tasks ("idempotencyKey") 
    WHERE "idempotencyKey" IS NOT NULL 
    AND status IN ('PENDING', 'RUNNING')
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_worker_tasks_idempotency_active`);
  await knex.schema.dropTableIfExists("worker_tasks");
}
