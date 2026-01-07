import { eventBus } from "../../config";

// Import worker task events for type safety
import "../../domain/entity/worker-task.events";

/**
 * Worker task event handlers
 */

eventBus.on("worker-task:created", (event) => {
  const { entity } = event.payload;
  console.log(`[worker-task:created] Task ${entity.id} (${entity.type})`, {
    taskId: entity.id,
    type: entity.type,
    priority: entity.priority
  });
});

eventBus.on("worker-task:started", (event) => {
  const { task, workerId } = event.payload;
  console.log(`[worker-task:started] Task ${task.id} started by ${workerId}`, {
    taskId: task.id,
    type: task.type,
    attempt: task.attempts
  });
});

eventBus.on("worker-task:completed", (event) => {
  const { task, duration } = event.payload;
  console.log(`[worker-task:completed] Task ${task.id} completed in ${duration}ms`, {
    taskId: task.id,
    type: task.type
  });
});

eventBus.on("worker-task:failed", (event) => {
  const { task, error, willRetry } = event.payload;
  console.error(
    `[worker-task:failed] Task ${task.id} failed: ${error.message}`,
    {
      taskId: task.id,
      type: task.type,
      willRetry,
      attempts: task.attempts,
      maxAttempts: task.maxAttempts
    }
  );
});

eventBus.on("worker-task:retrying", (event) => {
  const { task, attempt, nextAttemptAt } = event.payload;
  console.log(
    `[worker-task:retrying] Task ${task.id} will retry (attempt ${attempt})`,
    {
      taskId: task.id,
      type: task.type,
      nextAttemptAt
    }
  );
});
