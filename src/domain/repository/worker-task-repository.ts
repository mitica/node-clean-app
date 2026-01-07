import {
  WorkerTask,
  WorkerTaskCreateData,
  WorkerTaskData,
  WorkerTaskStatus,
  WorkerTaskUpdateData
} from "../entity/worker-task";
import { Repository, RepositoryMethodOptions } from "./repository";
import { EntityId } from "../base";

export interface AcquireTaskOptions extends RepositoryMethodOptions {
  /** Worker ID to lock the task */
  workerId: string;
  /** Lock duration in milliseconds (default: 5 minutes) */
  lockDuration?: number;
  /** Task types to acquire (empty = all types) */
  taskTypes?: string[];
}

export interface WorkerTaskRepository
  extends Repository<
    WorkerTaskData,
    WorkerTask,
    WorkerTaskCreateData,
    WorkerTaskUpdateData
  > {
  /**
   * Acquire the next pending task and lock it for processing.
   * Returns null if no task is available.
   */
  acquireNextTask(options: AcquireTaskOptions): Promise<WorkerTask | null>;

  /**
   * Find all pending tasks, optionally filtered by type.
   */
  findPending(
    taskTypes?: string[],
    limit?: number,
    opt?: RepositoryMethodOptions
  ): Promise<WorkerTask[]>;

  /**
   * Find all running tasks.
   */
  findRunning(opt?: RepositoryMethodOptions): Promise<WorkerTask[]>;

  /**
   * Find stale tasks (running but lock expired).
   */
  findStaleTasks(opt?: RepositoryMethodOptions): Promise<WorkerTask[]>;

  /**
   * Mark a task as completed with optional result.
   */
  markCompleted(
    id: EntityId,
    result?: Record<string, unknown>,
    opt?: RepositoryMethodOptions
  ): Promise<WorkerTask>;

  /**
   * Mark a task as failed with error details.
   */
  markFailed(
    id: EntityId,
    error: Error,
    opt?: RepositoryMethodOptions
  ): Promise<WorkerTask>;

  /**
   * Release lock on a task (used for graceful shutdown).
   */
  releaseLock(id: EntityId, opt?: RepositoryMethodOptions): Promise<WorkerTask>;

  /**
   * Reset stale tasks to pending status.
   */
  resetStaleTasks(opt?: RepositoryMethodOptions): Promise<number>;

  /**
   * Count tasks by status.
   */
  countByStatus(
    status: WorkerTaskStatus,
    opt?: RepositoryMethodOptions
  ): Promise<number>;

  /**
   * Get task statistics.
   */
  getStats(opt?: RepositoryMethodOptions): Promise<WorkerTaskStats>;

  /**
   * Delete old completed/failed tasks.
   */
  cleanupOldTasks(
    olderThanDays: number,
    opt?: RepositoryMethodOptions
  ): Promise<number>;

  /**
   * Find task by idempotency key.
   */
  findByIdempotencyKey(
    key: string,
    opt?: RepositoryMethodOptions
  ): Promise<WorkerTask | null>;

  /**
   * Create a task with idempotency support.
   * If idempotencyKey is provided and an active task with this key exists,
   * returns the existing task instead of creating a new one.
   */
  createIdempotent(
    data: WorkerTaskCreateData,
    opt?: RepositoryMethodOptions
  ): Promise<CreateTaskResult>;
}

/**
 * Result of attempting to create a task with idempotency
 */
export interface CreateTaskResult {
  task: WorkerTask;
  /** True if a new task was created, false if existing was returned */
  created: boolean;
}

export interface WorkerTaskStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  total: number;
}
