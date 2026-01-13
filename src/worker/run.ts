import { config } from "../config";
import { AppContext } from "../config/app-context";
import { WorkerApp } from "./worker-app";

// Register event handlers
import "../app/listeners";

/**
 * Main entry point for running the worker standalone
 */
async function main(): Promise<void> {
  const ctx = new AppContext();

  // Example: Configure multiple workers with different task types and concurrency
  // Uncomment and modify as needed:
  //
  // const app = new WorkerApp(ctx, {
  //   workers: [
  //     // Billing worker: low concurrency for payment-sensitive tasks
  //     { name: "billing", taskTypes: ["billing:process", "billing:refund"], concurrency: 2 },
  //     // General worker: handles all other task types
  //     { name: "general", taskTypes: [] }
  //   ]
  // });

  // Default: single worker processing all task types
  const app = new WorkerApp(ctx);

  // Graceful shutdown handlers
  process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT, shutting down...");
    await app.stop();
    await ctx.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM, shutting down...");
    await app.stop();
    await ctx.close();
    process.exit(0);
  });

  try {
    await app.start();

    const workers = app.getWorkers();
    console.log(`\n🚀 ${workers.length} Worker(s) running`);
    for (const worker of workers) {
      const stats = worker.getStats();
      console.log(`📊 Worker ID: ${stats.workerId}`);
    }
    console.log(`🌍 Environment: ${config.nodeEnv}`);

    // Keep the process running
    console.log("\nPress Ctrl+C to stop the worker(s)\n");
  } catch (error) {
    console.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
}

// Run if this is the main module
main().catch(console.error);
