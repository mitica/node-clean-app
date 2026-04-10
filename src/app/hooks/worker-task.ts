import { WorkerTask } from "../../domain/entity/worker-task";

export interface WorkerTaskStartedInput {
  task: WorkerTask;
  workerId: string;
}

export interface WorkerTaskCompletedInput {
  task: WorkerTask;
  result?: Record<string, unknown>;
  duration: number;
}

export interface WorkerTaskFailedInput {
  task: WorkerTask;
  error: Error;
  willRetry: boolean;
}

export interface WorkerTaskRetryingInput {
  task: WorkerTask;
  attempt: number;
  nextAttemptAt: Date;
}

export async function onWorkerTaskStarted(input: WorkerTaskStartedInput) {
  console.log(`[Hook] Task ${input.task.id} started by worker ${input.workerId}`);
}

export async function onWorkerTaskCompleted(input: WorkerTaskCompletedInput) {
  console.log(`[Hook] Task ${input.task.id} completed in ${input.duration}ms`);
}

export async function onWorkerTaskFailed(input: WorkerTaskFailedInput) {
  console.error(
    `[Hook] Task ${input.task.id} failed: ${input.error.message}`,
    input.willRetry ? "(will retry)" : "(final failure)"
  );
}

export async function onWorkerTaskRetrying(input: WorkerTaskRetryingInput) {
  console.log(
    `[Hook] Task ${input.task.id} retrying (attempt ${input.attempt}) at ${input.nextAttemptAt.toISOString()}`
  );
}
