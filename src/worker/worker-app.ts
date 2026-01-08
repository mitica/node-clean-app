import { config } from "../config";
import { AppContext } from "../config/app-context";
import { Worker } from "./worker";
import { exampleHandlers } from "./handlers";
import { TaskHandlerRegistration } from "../domain/worker";

/**
 * Configuration for a single worker instance
 */
export interface WorkerInstanceConfig {
  /** Unique name for this worker instance (used in workerId) */
  name: string;
  /** Task types this worker should process (empty = all types not claimed by other workers) */
  taskTypes?: string[];
  /** Task types this worker should NOT process */
  omitTaskTypes?: string[];
  /** Number of concurrent tasks (defaults to config.jobs.concurrency) */
  concurrency?: number;
  /** Task timeout in ms (defaults to config.jobs.timeout) */
  taskTimeout?: number;
  /** Handler types to register for this worker (if not specified, registers all handlers) */
  handlerTypes?: string[];
}

/**
 * Configuration for WorkerApp
 */
export interface WorkerAppConfig {
  /**
   * Worker instance configurations.
   * If not provided or empty, a single default worker processing all task types is created.
   *
   * @example
   * // Single billing worker with low concurrency, and a general worker for everything else
   * workers: [
   *   { name: "billing", taskTypes: ["billing:process", "billing:refund"], concurrency: 2 },
   *   { name: "general", taskTypes: [] } // processes all other types
   * ]
   */
  workers?: WorkerInstanceConfig[];
}

/**
 * Worker Application
 *
 * Manages the worker lifecycle and task processing.
 * Supports multiple worker instances with different configurations.
 */
export class WorkerApp {
  private workers: Worker[] = [];
  private readonly workerConfigs: WorkerInstanceConfig[];
  private allHandlers: TaskHandlerRegistration[] = [];

  constructor(private ctx: AppContext, config?: WorkerAppConfig) {
    // Default to single worker if no config provided
    this.workerConfigs = config?.workers?.length
      ? config.workers
      : [{ name: "default" }];
  }

  /**
   * Initialize and start all workers
   */
  async start(): Promise<void> {
    console.log("🔧 Initializing worker(s)...");

    await this.ctx.initialize();

    // Collect all available handlers
    this.collectHandlers();

    // Create and start all worker instances
    for (const workerConfig of this.workerConfigs) {
      const worker = this.createWorker(workerConfig);
      this.registerHandlersForWorker(worker, workerConfig);
      this.workers.push(worker);
    }

    // Start all workers
    await Promise.all(this.workers.map((w) => w.start()));

    console.log(`✅ ${this.workers.length} worker(s) started successfully`);
  }

  /**
   * Create a worker instance from config
   */
  private createWorker(workerConfig: WorkerInstanceConfig): Worker {
    const hostname = process.env.HOSTNAME || "local";
    const timestamp = Date.now();

    return new Worker(this.ctx, {
      workerId: `worker-${hostname}-${workerConfig.name}-${timestamp}`,
      concurrency: workerConfig.concurrency ?? config.jobs.concurrency,
      taskTimeout: workerConfig.taskTimeout ?? config.jobs.timeout,
      taskTypes: workerConfig.taskTypes ?? [],
      omitTaskTypes: workerConfig.omitTaskTypes ?? [],
    });
  }

  /**
   * Collect all available task handlers
   */
  private collectHandlers(): void {
    // Add example handlers
    this.allHandlers.push(...exampleHandlers);

    // TODO: Add your custom handlers here
    // this.allHandlers.push({
    //   type: "my-task:type",
    //   handler: async (ctx) => {
    //     // Your task logic
    //     return { success: true };
    //   }
    // });
  }

  /**
   * Register handlers for a specific worker based on its configuration
   */
  private registerHandlersForWorker(
    worker: Worker,
    workerConfig: WorkerInstanceConfig
  ): void {
    for (const handler of this.allHandlers) {
      // If handlerTypes is specified, only register matching handlers
      if (workerConfig.handlerTypes?.length) {
        if (workerConfig.handlerTypes.includes(handler.type)) {
          worker.registerHandler(handler);
        }
      }
      // If taskTypes is specified, only register handlers for those types
      else if (workerConfig.taskTypes?.length) {
        if (workerConfig.taskTypes.includes(handler.type)) {
          worker.registerHandler(handler);
        }
      }
      // Otherwise register all handlers
      else {
        worker.registerHandler(handler);
      }
    }
  }

  /**
   * Get all worker instances
   */
  getWorkers(): Worker[] {
    return [...this.workers];
  }

  /**
   * Get a specific worker by name
   */
  getWorker(name: string): Worker | undefined {
    return this.workers.find((w) =>
      w.getStats().workerId.includes(`-${name}-`)
    );
  }

  /**
   * Stop all workers gracefully
   */
  async stop(): Promise<void> {
    console.log("🛑 Stopping worker(s)...");
    await Promise.all(this.workers.map((w) => w.stop()));
    console.log("✅ Worker(s) stopped");
  }
}
