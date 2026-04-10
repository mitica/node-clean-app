import { type Knex } from "knex";
import {
  WorkerTask,
  WorkerTaskCreateData,
  WorkerTaskData,
  WorkerTaskStatus,
  WorkerTaskUpdateData,
} from "../../domain/entity/worker-task";
import {
  AcquireTaskParams,
  WorkerTaskRepository,
  WorkerTaskStats,
  RepositoryReadOptions,
  CreateTaskResult,
  RepositoryWriteOptions,
  FindPendingInput,
  MarkCompletedInput,
  MarkFailedInput,
  ReleaseLockInput,
  CountByStatusInput,
  CleanupOldTasksInput,
  FindByIdempotencyKeyInput,
} from "../../domain/repository";
import { DbRepository } from "./db-repository";
import { IQueryBuilderFactory } from "./query/query-builder-factory";

export class WorkerTaskDbRepository
  extends DbRepository<WorkerTaskData, WorkerTask, WorkerTaskCreateData, WorkerTaskUpdateData>
  implements WorkerTaskRepository
{
  constructor(knex: Knex, queryBuilderFactory: IQueryBuilderFactory) {
    super(knex, queryBuilderFactory, WorkerTask, {
      tableName: WorkerTask.tableName(),
    });
  }

  async acquireNextTask(
    params: AcquireTaskParams,
    opt?: RepositoryReadOptions
  ): Promise<WorkerTask | null> {
    const { workerId, lockDuration = 5 * 60 * 1000, taskTypes, omitTaskTypes } = params;
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + lockDuration);

    // Use a raw query with FOR UPDATE SKIP LOCKED to safely acquire a task
    const query = this.query(opt)
      .where("status", WorkerTaskStatus.PENDING)
      .where(function () {
        this.whereNull("scheduled_at").orWhere("scheduled_at", "<=", now.toISOString());
      })
      .orderBy("priority", "desc")
      .orderBy("created_at", "asc")
      .limit(1)
      .forUpdate()
      .skipLocked();

    if (taskTypes && taskTypes.length > 0) {
      query.whereIn("type", taskTypes);
    }

    if (omitTaskTypes && omitTaskTypes.length > 0) {
      query.whereNotIn("type", omitTaskTypes);
    }

    const result = await this.knex.transaction(async (trx) => {
      const task = await query.transacting(trx).first();

      if (!task) return null;

      const updated = await this.knex(this.tableName)
        .transacting(trx)
        .where("id", task.id)
        .update({
          status: WorkerTaskStatus.RUNNING,
          started_at: now.toISOString(),
          locked_by: workerId,
          locked_until: lockedUntil.toISOString(),
          attempts: this.knex.raw("attempts + 1"),
          updated_at: now.toISOString(),
        })
        .returning("*");

      return updated[0];
    });

    return result ? this.toEntity(result) : null;
  }

  async findPending(input?: FindPendingInput, opt?: RepositoryReadOptions): Promise<WorkerTask[]> {
    const { taskTypes, omitTaskTypes, limit = 100 } = input || {};
    const now = new Date();
    const query = this.query(opt)
      .where("status", WorkerTaskStatus.PENDING)
      .where(function () {
        this.whereNull("scheduled_at").orWhere("scheduled_at", "<=", now.toISOString());
      })
      .orderBy("priority", "desc")
      .orderBy("created_at", "asc")
      .limit(limit);

    if (taskTypes && taskTypes.length > 0) {
      query.whereIn("type", taskTypes);
    }

    if (omitTaskTypes && omitTaskTypes.length > 0) {
      query.whereNotIn("type", omitTaskTypes);
    }

    const items = await query;
    return items.map((item: WorkerTaskData) => this.toEntity(item));
  }

  async findRunning(opt?: RepositoryReadOptions): Promise<WorkerTask[]> {
    const items = await this.query(opt)
      .where("status", WorkerTaskStatus.RUNNING)
      .orderBy("started_at", "asc");

    return items.map((item: WorkerTaskData) => this.toEntity(item));
  }

  async findStaleTasks(opt?: RepositoryReadOptions): Promise<WorkerTask[]> {
    const now = new Date();
    const items = await this.query(opt)
      .where("status", WorkerTaskStatus.RUNNING)
      .where("locked_until", "<", now.toISOString());

    return items.map((item: WorkerTaskData) => this.toEntity(item));
  }

  async markCompleted(input: MarkCompletedInput, opt: RepositoryWriteOptions): Promise<WorkerTask> {
    const { id, result } = input;
    const now = new Date().toISOString();
    const updated = await this.query(opt)
      .where("id", id)
      .update({
        status: WorkerTaskStatus.COMPLETED,
        finished_at: now,
        result: result ? JSON.stringify(result) : null,
        locked_by: null,
        locked_until: null,
        error_message: null,
        error_stack: null,
        updated_at: now,
      })
      .returning("*");

    if (!updated[0]) {
      throw new Error(`Task not found: ${id}`);
    }

    return this.toEntity(updated[0]);
  }

  async markFailed(input: MarkFailedInput, opt: RepositoryWriteOptions): Promise<WorkerTask> {
    const { id, error } = input;
    const now = new Date().toISOString();
    const task = await this.findById(id, opt);

    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    // Determine final status based on retry eligibility
    const canRetry = task.attempts < task.maxAttempts;
    const status = canRetry ? WorkerTaskStatus.PENDING : WorkerTaskStatus.FAILED;

    const updated = await this.query(opt)
      .where("id", id)
      .update({
        status,
        finished_at: canRetry ? null : now,
        error_message: error.message,
        error_stack: error.stack,
        locked_by: null,
        locked_until: null,
        updated_at: now,
      })
      .returning("*");

    return this.toEntity(updated[0]);
  }

  async releaseLock(input: ReleaseLockInput, opt: RepositoryWriteOptions): Promise<WorkerTask> {
    const { id } = input;
    const now = new Date().toISOString();
    const updated = await this.query(opt)
      .where("id", id)
      .update({
        status: WorkerTaskStatus.PENDING,
        locked_by: null,
        locked_until: null,
        started_at: null,
        updated_at: now,
      })
      .returning("*");

    if (!updated[0]) {
      throw new Error(`Task not found: ${id}`);
    }

    return this.toEntity(updated[0]);
  }

  async resetStaleTasks(opt?: RepositoryReadOptions): Promise<number> {
    const now = new Date();
    const result = await this.query(opt)
      .where("status", WorkerTaskStatus.RUNNING)
      .where("locked_until", "<", now.toISOString())
      .update({
        status: WorkerTaskStatus.PENDING,
        locked_by: null,
        locked_until: null,
        started_at: null,
        updated_at: now.toISOString(),
      });

    return result;
  }

  async countByStatus(input: CountByStatusInput, opt?: RepositoryReadOptions): Promise<number> {
    const { status } = input;
    const result = await this.query(opt).where("status", status).count("id as count").first();

    return parseInt(String(result?.count || "0"), 10);
  }

  async getStats(opt?: RepositoryReadOptions): Promise<WorkerTaskStats> {
    const result = await this.query(opt).select("status").count("id as count").groupBy("status");

    const stats: WorkerTaskStats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      total: 0,
    };

    for (const row of result) {
      const count = parseInt(String(row.count), 10);
      stats.total += count;

      switch (row.status) {
        case WorkerTaskStatus.PENDING:
          stats.pending = count;
          break;
        case WorkerTaskStatus.RUNNING:
          stats.running = count;
          break;
        case WorkerTaskStatus.COMPLETED:
          stats.completed = count;
          break;
        case WorkerTaskStatus.FAILED:
          stats.failed = count;
          break;
        case WorkerTaskStatus.CANCELLED:
          stats.cancelled = count;
          break;
      }
    }

    return stats;
  }

  async cleanupOldTasks(input: CleanupOldTasksInput, opt: RepositoryWriteOptions): Promise<number> {
    const { olderThanDays } = input;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.query(opt)
      .whereIn("status", [WorkerTaskStatus.COMPLETED, WorkerTaskStatus.FAILED])
      .where("finished_at", "<", cutoffDate.toISOString())
      .delete();

    return result;
  }

  async findByIdempotencyKey(
    input: FindByIdempotencyKeyInput,
    opt?: RepositoryReadOptions
  ): Promise<WorkerTask | null> {
    const { key } = input;
    const row = await this.query(opt)
      .where("idempotency_key", key)
      .orderBy("created_at", "desc")
      .first();

    return row ? this.toEntity(row) : null;
  }

  async createIdempotent(
    data: WorkerTaskCreateData,
    opt: RepositoryWriteOptions
  ): Promise<CreateTaskResult> {
    // If no idempotency key, just create normally
    if (!data.idempotencyKey) {
      const task = await this.create(data, opt);
      return { task, created: true };
    }

    // Check for existing task with same key
    const existing = await this.findByIdempotencyKey({ key: data.idempotencyKey }, opt);

    if (existing) {
      // Return existing task if it's still active (PENDING/RUNNING)
      const isActive = [WorkerTaskStatus.PENDING, WorkerTaskStatus.RUNNING].includes(
        existing.status
      );

      if (isActive) {
        return { task: existing, created: false };
      }

      // If completed successfully, return it (idempotent success)
      if (existing.status === WorkerTaskStatus.COMPLETED) {
        return { task: existing, created: false };
      }

      // If failed/cancelled, allow creating a new task
      // The partial unique index only covers PENDING/RUNNING so this is safe
    }

    // Create new task
    const task = await this.create(data, opt || {});
    return { task, created: true };
  }

  // Override to handle JSON fields
  override toEntity(data: WorkerTaskData): WorkerTask {
    // Parse JSON fields if they're strings
    const processedData = { ...data };

    if (typeof processedData.payload === "string") {
      processedData.payload = JSON.parse(processedData.payload);
    }
    if (typeof processedData.result === "string") {
      processedData.result = JSON.parse(processedData.result);
    }

    return super.toEntity(processedData);
  }
}
