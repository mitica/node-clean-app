import { config } from "../config";
import { AppContext } from "../config/app-context";
import { Worker } from "./worker";
import { exampleHandlers } from "./handlers";
import { WorkerTaskDbRepository } from "../infra/repository/db-worker-task-repository";

// Register event handlers
import "../app/listeners";

/**
 * Worker Application
 *
 * Manages the worker lifecycle and task processing
 */
export class WorkerApp {
  private worker: Worker;
  private context: AppContext;
  private taskRepository: WorkerTaskDbRepository;

  constructor() {
    this.context = new AppContext();
    this.taskRepository = new WorkerTaskDbRepository();
    this.worker = new Worker(this.taskRepository, {
      workerId: `worker-${process.env.HOSTNAME || "local"}-${Date.now()}`,
      concurrency: config.jobs.concurrency,
      taskTimeout: config.jobs.timeout,
    });
  }

  /**
   * Initialize and start the worker
   */
  async start(): Promise<void> {
    console.log("🔧 Initializing worker...");

    await this.context.initialize();

    // Register all task handlers
    this.registerHandlers();

    // Start the worker
    await this.worker.start();

    console.log("✅ Worker started successfully");
  }

  /**
   * Register task handlers
   */
  private registerHandlers(): void {
    // Register example handlers
    for (const handler of exampleHandlers) {
      this.worker.registerHandler(handler);
    }

    // TODO: Register your custom handlers here
    // this.worker.registerHandler({
    //   type: "my-task:type",
    //   handler: async (ctx) => {
    //     // Your task logic
    //     return { success: true };
    //   }
    // });
  }

  /**
   * Get the worker instance for external access
   */
  getWorker(): Worker {
    return this.worker;
  }

  /**
   * Get the task repository for creating tasks
   */
  getTaskRepository(): WorkerTaskDbRepository {
    return this.taskRepository;
  }

  /**
   * Stop the worker gracefully
   */
  async stop(): Promise<void> {
    console.log("🛑 Stopping worker...");
    await this.worker.stop();
    await this.context.close();
    console.log("✅ Worker stopped");
  }
}

/**
 * Main entry point for running the worker standalone
 */
async function main(): Promise<void> {
  const app = new WorkerApp();

  // Graceful shutdown handlers
  process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT, shutting down...");
    await app.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM, shutting down...");
    await app.stop();
    process.exit(0);
  });

  try {
    await app.start();

    const stats = app.getWorker().getStats();
    console.log(`\n🚀 Worker running`);
    console.log(`📊 Worker ID: ${stats.workerId}`);
    console.log(`⚡ Concurrency: ${config.jobs.concurrency}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);

    // Keep the process running
    console.log("\nPress Ctrl+C to stop the worker\n");
  } catch (error) {
    console.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
}

// Run if this is the main module
main().catch(console.error);
