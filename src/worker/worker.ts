import {
  IWorker,
  TaskHandlerContext,
  TaskHandlerRegistration,
  WorkerConfig,
  WorkerStats,
} from "../domain/worker";
import { WorkerTask, WorkerTaskStatus } from "../domain/entity/worker-task";
import { WorkerTaskRepository } from "../domain/repository";
import { AppContext, eventBus, config } from "../config";
import { createWorkerSpan, traceWorkerPoll } from "./telemetry";
import { SpanStatusCode } from "@opentelemetry/api";

// Import worker task events for type safety
import "../domain/entity/worker-task.events";

/**
 * Default worker configuration
 */
export const defaultWorkerConfig: WorkerConfig = {
  workerId: `worker-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  concurrency: config.jobs.concurrency,
  pollInterval: 1000,
  taskTimeout: config.jobs.timeout,
  lockDuration: 5 * 60 * 1000, // 5 minutes
  taskTypes: [],
  omitTaskTypes: [],
  staleTaskCheckInterval: 60 * 1000, // 1 minute
};

/**
 * Worker implementation for processing tasks from the database queue
 */
export class Worker implements IWorker {
  private readonly config: WorkerConfig;
  private readonly handlers: Map<string, TaskHandlerRegistration> = new Map();
  private readonly activeTasks: Map<number, Promise<void>> = new Map();
  private readonly taskRepo: WorkerTaskRepository;
  private readonly ctx: AppContext;

  private running = false;
  private shuttingDown = false;
  private pollTimer?: NodeJS.Timeout;
  private staleCheckTimer?: NodeJS.Timeout;
  private startedAt?: Date;

  private stats = {
    tasksProcessed: 0,
    tasksSucceeded: 0,
    tasksFailed: 0,
  };

  constructor(ctx: AppContext, config?: Partial<WorkerConfig>) {
    this.ctx = ctx;
    this.config = { ...defaultWorkerConfig, ...config };
    this.taskRepo = ctx.repo.workerTask;
  }

  /**
   * Create a request context for worker operations.
   * Workers use a system context since they don't have a user.
   */
  private createWorkerContext(): AppContext {
    return this.ctx.createContext({
      isAuthenticated: true,
      isAdmin: true, // Worker has admin privileges for task management
    });
  }

  /**
   * Register a handler for a specific task type
   */
  registerHandler(registration: TaskHandlerRegistration): void {
    if (this.handlers.has(registration.type)) {
      console.warn(
        `[Worker] Overwriting existing handler for task type: ${registration.type}`
      );
    }
    this.handlers.set(registration.type, registration);
    console.log(
      `[Worker] Registered handler for task type: ${registration.type}`
    );
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn(
        `[Worker] Worker ${this.config.workerId} is already running`
      );
      return;
    }

    const span = createWorkerSpan(this.config.workerId, "start");

    console.log(`[Worker] Starting worker ${this.config.workerId}`);
    console.log(`[Worker] Concurrency: ${this.config.concurrency}`);
    console.log(`[Worker] Poll interval: ${this.config.pollInterval}ms`);
    console.log(
      `[Worker] Task types: ${
        this.config.taskTypes.length ? this.config.taskTypes.join(", ") : "all"
      }`
    );
    if (this.config.omitTaskTypes.length) {
      console.log(
        `[Worker] Omit task types: ${this.config.omitTaskTypes.join(", ")}`
      );
    }

    this.running = true;
    this.shuttingDown = false;
    this.startedAt = new Date();

    // Reset any stale tasks from previous runs
    await this.resetStaleTasks();

    // Start polling for tasks
    this.pollTimer = setInterval(() => this.poll(), this.config.pollInterval);

    // Start stale task checker
    this.staleCheckTimer = setInterval(
      () => this.resetStaleTasks(),
      this.config.staleTaskCheckInterval
    );

    // Initial poll
    await this.poll();

    console.log(`[Worker] Worker ${this.config.workerId} started`);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  }

  /**
   * Stop the worker gracefully
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    const span = createWorkerSpan(this.config.workerId, "stop");

    console.log(`[Worker] Stopping worker ${this.config.workerId}...`);
    this.shuttingDown = true;
    this.running = false;

    // Clear timers
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
    if (this.staleCheckTimer) {
      clearInterval(this.staleCheckTimer);
      this.staleCheckTimer = undefined;
    }

    // Wait for active tasks to complete
    if (this.activeTasks.size > 0) {
      console.log(
        `[Worker] Waiting for ${this.activeTasks.size} active tasks to complete...`
      );
      // Use Promise.all with catch to wait for all tasks regardless of outcome
      const taskPromises = Array.from(this.activeTasks.values()).map((p) =>
        p.catch(() => {})
      );
      await Promise.all(taskPromises);
    }

    console.log(`[Worker] Worker ${this.config.workerId} stopped`);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  }

  /**
   * Check if the worker is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Check if shutdown was requested
   */
  isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  /**
   * Get worker statistics
   */
  getStats(): WorkerStats {
    return {
      workerId: this.config.workerId,
      isRunning: this.running,
      tasksProcessed: this.stats.tasksProcessed,
      tasksSucceeded: this.stats.tasksSucceeded,
      tasksFailed: this.stats.tasksFailed,
      currentTasks: this.activeTasks.size,
      uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      startedAt: this.startedAt,
    };
  }

  /**
   * Poll for available tasks
   */
  private async poll(): Promise<void> {
    if (!this.running || this.shuttingDown) {
      return;
    }

    // Check if we have capacity
    const availableSlots = this.config.concurrency - this.activeTasks.size;
    if (availableSlots <= 0) {
      return;
    }

    await traceWorkerPoll(this.config.workerId, async () => {
      // Acquire tasks up to available capacity
      for (let i = 0; i < availableSlots; i++) {
        if (this.shuttingDown) break;

        try {
          const task = await this.taskRepo.acquireNextTask({
            workerId: this.config.workerId,
            lockDuration: this.config.lockDuration,
            taskTypes: this.config.taskTypes.length
              ? this.config.taskTypes
              : undefined,
            omitTaskTypes: this.config.omitTaskTypes.length
              ? this.config.omitTaskTypes
              : undefined,
          });

          if (task) {
            this.processTask(task);
          } else {
            // No more tasks available
            break;
          }
        } catch (error) {
          console.error(`[Worker] Error acquiring task:`, error);
          break;
        }
      }
    });
  }

  /**
   * Process a task (non-blocking)
   */
  private processTask(task: WorkerTask): void {
    const taskPromise = this.executeTask(task);
    this.activeTasks.set(task.id, taskPromise);

    taskPromise.finally(() => {
      this.activeTasks.delete(task.id);
    });
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: WorkerTask): Promise<void> {
    const startTime = Date.now();
    const handler = this.handlers.get(task.type);

    console.log(
      `[Worker] Processing task ${task.id} (type: ${task.type}, attempt: ${task.attempts})`
    );

    // Emit started event
    await eventBus.emit("worker-task:started", {
      task,
      workerId: this.config.workerId,
    });

    if (!handler) {
      console.error(
        `[Worker] No handler registered for task type: ${task.type}`
      );
      await this.handleTaskFailure(
        task,
        new Error(`No handler for task type: ${task.type}`),
        startTime
      );
      return;
    }

    const timeout = handler.timeout || this.config.taskTimeout;

    try {
      // Create handler context
      const context: TaskHandlerContext = {
        task,
        workerId: this.config.workerId,
        isShuttingDown: () => this.shuttingDown,
      };

      // Execute with timeout
      const result = await Promise.race([
        handler.handler(context),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Task timeout after ${timeout}ms`)),
            timeout
          )
        ),
      ]);

      if (result.success) {
        await this.handleTaskSuccess(task, result.result, startTime);
      } else {
        await this.handleTaskFailure(
          task,
          result.error || new Error("Task failed without error"),
          startTime
        );
      }
    } catch (error) {
      await this.handleTaskFailure(task, error as Error, startTime);
    }
  }

  /**
   * Handle successful task completion
   */
  private async handleTaskSuccess(
    task: WorkerTask,
    result: Record<string, unknown> | undefined,
    startTime: number
  ): Promise<void> {
    const duration = Date.now() - startTime;

    try {
      const completedTask = await this.taskRepo.markCompleted(
        { id: task.id, result },
        { ctx: this.createWorkerContext() }
      );

      this.stats.tasksProcessed++;
      this.stats.tasksSucceeded++;

      console.log(
        `[Worker] Task ${task.id} completed successfully in ${duration}ms`
      );

      await eventBus.emit("worker-task:completed", {
        task: completedTask,
        result,
        duration,
      });
    } catch (error) {
      console.error(`[Worker] Error marking task as completed:`, error);
    }
  }

  /**
   * Handle task failure
   */
  private async handleTaskFailure(
    task: WorkerTask,
    error: Error,
    startTime: number
  ): Promise<void> {
    const duration = Date.now() - startTime;

    try {
      const failedTask = await this.taskRepo.markFailed(
        { id: task.id, error },
        { ctx: this.createWorkerContext() }
      );
      const willRetry = failedTask.status === WorkerTaskStatus.PENDING;

      this.stats.tasksProcessed++;
      this.stats.tasksFailed++;

      console.error(
        `[Worker] Task ${task.id} failed after ${duration}ms: ${error.message}`
      );
      if (willRetry) {
        console.log(
          `[Worker] Task ${task.id} will be retried (attempt ${task.attempts}/${task.maxAttempts})`
        );
      }

      await eventBus.emit("worker-task:failed", {
        task: failedTask,
        error,
        willRetry,
      });

      if (willRetry) {
        await eventBus.emit("worker-task:retrying", {
          task: failedTask,
          attempt: task.attempts + 1,
          nextAttemptAt: new Date(),
        });
      }
    } catch (err) {
      console.error(`[Worker] Error marking task as failed:`, err);
    }
  }

  /**
   * Reset stale tasks that have expired locks
   */
  private async resetStaleTasks(): Promise<void> {
    const span = createWorkerSpan(this.config.workerId, "stale-check");
    try {
      const count = await this.taskRepo.resetStaleTasks();
      if (count > 0) {
        console.log(`[Worker] Reset ${count} stale tasks`);
        span.setAttribute("worker.stale_tasks_reset", count);
      }
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error) {
      console.error(`[Worker] Error resetting stale tasks:`, error);
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      span.end();
    }
  }
}
