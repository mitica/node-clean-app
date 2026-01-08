import { AppContext } from "../config";
import {
  WorkerTaskCreateData,
  RepositoryWriteOptions,
  WorkerTaskStatus,
  WorkerTaskPriority,
} from "../domain";

export enum WorkerTaskType {
  EXAMPLE_TASK = "example:task",
}

/**
 * Create a new worker task
 */
export type CreateTaskOptions = Partial<
  Omit<WorkerTaskCreateData, "type" | "payload" | "type">
> &
  Pick<WorkerTaskCreateData, "type" | "payload"> & { type: WorkerTaskType };

const createWorkerTaskData = (
  options: CreateTaskOptions
): WorkerTaskCreateData => {
  return {
    status: WorkerTaskStatus.PENDING,
    priority: WorkerTaskPriority.NORMAL,
    attempts: 0,
    maxAttempts: 3,
    ...options,
  };
};

/**
 * Helper to create a worker task through the repository with idempotency support
 */
export async function createWorkerTask(
  ctx: AppContext,
  options: CreateTaskOptions,
  opt: RepositoryWriteOptions
) {
  const data = createWorkerTaskData(options);
  return ctx.repo.workerTask.createIdempotent(data, opt);
}
