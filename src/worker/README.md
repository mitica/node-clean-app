# Worker

A database-backed task queue worker system for executing background jobs.

## Overview

The worker system provides a robust, type-safe way to execute background tasks with features like:

- **Persistent task queue**: Tasks are stored in PostgreSQL for durability
- **Concurrent processing**: Configurable concurrency for parallel task execution
- **Multiple worker instances**: Run specialized workers for different task types
- **Automatic retries**: Failed tasks can be retried with configurable attempts
- **Priority queuing**: Higher priority tasks are processed first
- **Scheduled tasks**: Tasks can be scheduled for future execution
- **Stale task recovery**: Automatically recovers tasks from crashed workers
- **Graceful shutdown**: Completes in-progress tasks before stopping
- **Event-driven**: Emits events for task lifecycle (created, started, completed, failed)

## Architecture

```
src/worker/
├── run.ts              # Worker entry point (standalone runner)
├── worker.ts           # Worker implementation
├── worker-app.ts       # WorkerApp with multi-worker support
├── index.ts            # Public exports
├── handlers/           # Task handlers
│   ├── index.ts
│   └── examples.ts     # Example task handlers
└── README.md           # This file

src/domain/
├── entity/
│   ├── worker-task.ts       # WorkerTask entity
│   └── worker-task.events.ts # Domain events
├── repository/
│   └── worker-task-repository.ts # Repository interface
└── worker/
    ├── index.ts
    └── worker.ts        # Worker interfaces

src/app/worker/         # Use cases
├── enqueue-task-usecase.ts
├── cancel-task-usecase.ts
└── retry-task-usecase.ts

src/infra/repository/
└── db-worker-task-repository.ts # PostgreSQL implementation
```

## Usage

### Running the Worker

```bash
# Development (with ts-node)
yarn worker:dev

# Production (compiled)
yarn build
yarn worker
```

### Configuring Multiple Workers

The `WorkerApp` supports running multiple worker instances with different configurations. This is useful when you need different concurrency levels or dedicated workers for specific task types.

```typescript
import { AppContext } from "./config";
import { WorkerApp } from "./worker";

const ctx = new AppContext();

// Default: single worker processing all task types
const app = new WorkerApp(ctx);

// Or configure multiple specialized workers
const app = new WorkerApp(ctx, {
  workers: [
    // Billing worker: low concurrency for payment-sensitive tasks
    {
      name: "billing",
      taskTypes: ["billing:process", "billing:refund"],
      concurrency: 2
    },
    // General worker: handles all other task types
    {
      name: "general",
      taskTypes: [], // empty = all types
      concurrency: 10
    }
  ]
});

await app.start();

// Access specific workers
const billingWorker = app.getWorker("billing");
const allWorkers = app.getWorkers();
```

#### WorkerInstanceConfig Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | required | Unique name for the worker instance |
| `taskTypes` | string[] | `[]` | Task types to process (empty = all) |
| `omitTaskTypes` | string[] | `[]` | Task types to exclude from processing |
| `concurrency` | number | `JOB_CONCURRENCY` | Concurrent tasks limit |
| `taskTimeout` | number | `JOB_TIMEOUT` | Task timeout in ms |
| `handlerTypes` | string[] | undefined | Specific handlers to register |

**Note:** When using `omitTaskTypes`, you can have a "general" worker that processes everything except specific task types that are handled by specialized workers:

```typescript
const app = new WorkerApp(ctx, {
  workers: [
    // Billing worker: only processes billing tasks with low concurrency
    { name: "billing", taskTypes: ["billing:process", "billing:refund"], concurrency: 2 },
    // General worker: processes everything EXCEPT billing tasks
    { name: "general", omitTaskTypes: ["billing:process", "billing:refund"], concurrency: 10 }
  ]
});
```

### Creating Tasks

```typescript
import { AppContext } from "./config";

const ctx = new AppContext();

// Using the use case
const task = await ctx.usecase.enqueueTask.execute(
  {
    type: "email:send",
    payload: {
      to: "user@example.com",
      subject: "Welcome!",
      template: "welcome"
    },
    priority: 10, // Higher = more urgent
    maxAttempts: 3
  },
  ctx
);

// Or using the repository directly
const task = await ctx.repo.workerTask.create({
  type: "email:send",
  payload: { to: "user@example.com" },
  status: WorkerTaskStatus.PENDING,
  priority: 5,
  attempts: 0,
  maxAttempts: 3
});
```

### Creating Task Handlers

Create a handler in `src/worker/handlers/`:

```typescript
import { TaskHandlerRegistration } from "../../domain/worker";

export const myTaskHandler: TaskHandlerRegistration = {
  type: "my-task:process",
  timeout: 60000, // 1 minute timeout
  maxAttempts: 3,
  handler: async (context) => {
    const { task, workerId, isShuttingDown } = context;
    const { someData } = task.payload as { someData: string };

    // Check for graceful shutdown during long operations
    if (isShuttingDown()) {
      return {
        success: false,
        error: new Error("Worker shutting down")
      };
    }

    // Your task logic here
    const result = await processData(someData);

    return {
      success: true,
      result: { processed: true, output: result }
    };
  }
};
```

Register it in `src/worker/worker-app.ts`:

```typescript
import { myTaskHandler } from "./handlers/my-handler";

// In WorkerApp.collectHandlers():
private collectHandlers(): void {
  this.allHandlers.push(...exampleHandlers);
  this.allHandlers.push(myTaskHandler);
}
```

### Scheduling Tasks

```typescript
// Schedule for future execution
await ctx.usecase.enqueueTask.execute(
  {
    type: "report:generate",
    payload: { reportId: 123 },
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
  },
  ctx
);
```

### Managing Tasks

```typescript
// Cancel a pending task
await ctx.usecase.cancelTask.execute({ taskId: 123 }, ctx);

// Retry a failed task
await ctx.usecase.retryTask.execute({ taskId: 123, resetAttempts: true }, ctx);

// Get task statistics
const stats = await ctx.usecase.getTaskStats.execute(undefined, ctx);
console.log(stats);
// { pending: 10, running: 2, completed: 100, failed: 5, cancelled: 1, total: 118 }
```

### Subscribing to Events

```typescript
import { eventBus } from "./config";
import "./domain/entity/worker-task.events";

eventBus.on("worker-task:completed", (event) => {
  const { task, result, duration } = event.payload;
  console.log(`Task ${task.id} completed in ${duration}ms`);
});

eventBus.on("worker-task:failed", (event) => {
  const { task, error, willRetry } = event.payload;
  if (!willRetry) {
    // Send alert for permanently failed tasks
    alertService.notify(`Task ${task.id} failed: ${error.message}`);
  }
});
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `JOB_CONCURRENCY` | 5 | Number of concurrent tasks |
| `JOB_TIMEOUT` | 300000 | Default task timeout (ms) |

Worker config options:

```typescript
// Single worker (low-level)
const worker = new Worker(ctx, {
  workerId: "my-worker-1",
  concurrency: 10,
  pollInterval: 1000,
  taskTimeout: 300000,
  lockDuration: 300000,
  taskTypes: ["email:*", "report:*"], // Filter by type
  staleTaskCheckInterval: 60000
});

// Multiple workers via WorkerApp (recommended)
const app = new WorkerApp(ctx, {
  workers: [
    { name: "billing", taskTypes: ["billing:process"], concurrency: 2 },
    { name: "general", taskTypes: [] }
  ]
});
```

## Database Migration

Run the migration to create the `worker_tasks` table:

```bash
yarn migrate
```

## Task Lifecycle

1. **PENDING**: Task is queued and waiting to be processed
2. **RUNNING**: Task is being executed by a worker
3. **COMPLETED**: Task finished successfully
4. **FAILED**: Task failed after all retry attempts
5. **CANCELLED**: Task was cancelled before execution

## Best Practices

1. **Keep tasks idempotent**: Tasks may be retried, so design them to be safe to run multiple times
2. **Use appropriate timeouts**: Set realistic timeouts based on expected task duration
3. **Check for shutdown**: In long-running tasks, periodically check `isShuttingDown()` for graceful handling
4. **Log task progress**: Include task ID in logs for traceability
5. **Clean up old tasks**: Periodically run `cleanupOldTasks()` to remove completed/failed tasks
