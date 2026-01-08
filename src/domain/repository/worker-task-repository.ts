import {
  WorkerTask,
  WorkerTaskCreateData,
  WorkerTaskData,
  WorkerTaskStatus,
  WorkerTaskUpdateData
} from "../entity/worker-task";
import { Repository, RepositoryReadOptions, RepositoryWriteOptions } from "./repository";
import { EntityId } from "../base";

export interface AcquireTaskOptions extends RepositoryReadOptions {
  /** Worker ID to lock the task */
  workerId: string;
  /** Lock duration in milliseconds (default: 5 minutes) */
  lockDuration?: number;
  /** Task types to acquire (empty = all types) */
  taskTypes?: string[];
  /** Task types to exclude from acquisition */
  omitTaskTypes?: string[];
}

export interface FindPendingInput {
  /** Task types to filter (empty = all types) */
  taskTypes?: string[];
  /** Task types to exclude */
  omitTaskTypes?: string[];
  /** Maximum number of tasks to return (default: 100) */
  limit?: number;
}

export interface MarkCompletedInput {
  /** Task ID */
  id: EntityId;
  /** Optional result data */
  result?: Record<string, unknown>;
}

export interface MarkFailedInput {
  /** Task ID */
  id: EntityId;
  /** Error that caused the failure */
  error: Error;
}

export interface ReleaseLockInput {
  /** Task ID */
  id: EntityId;
}

export interface CountByStatusInput {
  /** Status to count */
  status: WorkerTaskStatus;
}

export interface CleanupOldTasksInput {
  /** Delete tasks older than this many days */
  olderThanDays: number;
}

export interface FindByIdempotencyKeyInput {
  /** Idempotency key to search for */
  key: string;
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
    input?: FindPendingInput,
    opt?: RepositoryReadOptions
  ): Promise<WorkerTask[]>;

  /**
   * Find all running tasks.
   */
  findRunning(opt?: RepositoryReadOptions): Promise<WorkerTask[]>;

  /**
   * Find stale tasks (running but lock expired).
   */
  findStaleTasks(opt?: RepositoryReadOptions): Promise<WorkerTask[]>;

  /**
   * Mark a task as completed with optional result.
   */
  markCompleted(
    input: MarkCompletedInput,
    opt: RepositoryWriteOptions
  ): Promise<WorkerTask>;

  /**
   * Mark a task as failed with error details.
   */
  markFailed(
    input: MarkFailedInput,
    opt: RepositoryWriteOptions
  ): Promise<WorkerTask>;

  /**
   * Release lock on a task (used for graceful shutdown).
   */
  releaseLock(input: ReleaseLockInput, opt: RepositoryWriteOptions): Promise<WorkerTask>;

  /**
   * Reset stale tasks to pending status.
   */
  resetStaleTasks(opt?: RepositoryReadOptions): Promise<number>;

  /**
   * Count tasks by status.
   */
  countByStatus(
    input: CountByStatusInput,
    opt?: RepositoryReadOptions
  ): Promise<number>;

  /**
   * Get task statistics.
   */
  getStats(opt?: RepositoryReadOptions): Promise<WorkerTaskStats>;

  /**
   * Delete old completed/failed tasks.
   */
  cleanupOldTasks(
    input: CleanupOldTasksInput,
    opt: RepositoryWriteOptions
  ): Promise<number>;

  /**
   * Find task by idempotency key.
   */
  findByIdempotencyKey(
    input: FindByIdempotencyKeyInput,
    opt?: RepositoryReadOptions
  ): Promise<WorkerTask | null>;

  /**
   * Create a task with idempotency support.
   * If idempotencyKey is provided and an active task with this key exists,
   * returns the existing task instead of creating a new one.
   */
  createIdempotent(
    data: WorkerTaskCreateData,
    opt: RepositoryWriteOptions
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
