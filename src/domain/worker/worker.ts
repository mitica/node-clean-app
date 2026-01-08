import { WorkerTask } from "../entity/worker-task";

/**
 * Task handler result
 */
export interface TaskHandlerResult {
  success: boolean;
  result?: Record<string, unknown>;
  error?: Error;
}

/**
 * Task handler context provided to handlers
 */
export interface TaskHandlerContext {
  /** Current task being processed */
  task: WorkerTask;
  /** Worker ID processing this task */
  workerId: string;
  /** Signal to check if shutdown was requested */
  isShuttingDown: () => boolean;
}

/**
 * Task handler function type
 */
export type TaskHandler = (
  context: TaskHandlerContext
) => Promise<TaskHandlerResult>;

/**
 * Task handler registration
 */
export interface TaskHandlerRegistration {
  /** Task type this handler processes */
  type: string;
  /** Handler function */
  handler: TaskHandler;
  /** Optional timeout override in ms */
  timeout?: number;
  /** Optional max attempts override */
  maxAttempts?: number;
}

/**
 * Worker configuration
 */
export interface WorkerConfig {
  /** Unique worker identifier */
  workerId: string;
  /** Number of concurrent tasks to process */
  concurrency: number;
  /** Polling interval in milliseconds */
  pollInterval: number;
  /** Default task timeout in milliseconds */
  taskTimeout: number;
  /** Lock duration in milliseconds */
  lockDuration: number;
  /** Task types this worker should process (empty = all) */
  taskTypes: string[];
  /** Task types this worker should NOT process */
  omitTaskTypes: string[];
  /** Interval to reset stale tasks (ms) */
  staleTaskCheckInterval: number;
}

/**
 * Worker interface for processing tasks
 */
export interface IWorker {
  /** Start the worker */
  start(): Promise<void>;
  /** Stop the worker gracefully */
  stop(): Promise<void>;
  /** Register a task handler */
  registerHandler(registration: TaskHandlerRegistration): void;
  /** Check if worker is running */
  isRunning(): boolean;
  /** Get worker stats */
  getStats(): WorkerStats;
}

/**
 * Worker statistics
 */
export interface WorkerStats {
  workerId: string;
  isRunning: boolean;
  tasksProcessed: number;
  tasksSucceeded: number;
  tasksFailed: number;
  currentTasks: number;
  uptime: number;
  startedAt?: Date;
}
