import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config/app-context";
import { RequiredJSONSchema, EntityId } from "../../domain/base";
import {
  WorkerTask,
  WorkerTaskStatus,
  WorkerTaskUpdateData,
} from "../../domain/entity/worker-task";

export interface RetryTaskInput {
  /** Task ID to retry */
  taskId: EntityId;
  /** Reset attempt count to 0 */
  resetAttempts?: boolean;
}

/**
 * Retry a failed worker task.
 */
export class RetryTaskUseCase extends BaseUseCase<
  RetryTaskInput,
  WorkerTask,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<RetryTaskInput>,
    ctx: AppContext
  ): Promise<WorkerTask> {
    const task = await ctx.repo.workerTask.checkById(input.taskId);

    if (
      task.status !== WorkerTaskStatus.FAILED &&
      task.status !== WorkerTaskStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot retry task in status: ${task.status}. Only failed or cancelled tasks can be retried.`
      );
    }

    const updateData: WorkerTaskUpdateData = {
      id: input.taskId,
      status: WorkerTaskStatus.PENDING,
      errorMessage: null,
      errorStack: null,
      finishedAt: null,
      startedAt: null,
      lockedBy: null,
      lockedUntil: null,
      attempts: input.resetAttempts ? 0 : undefined,
    };

    const retried = await ctx.repo.workerTask.update(updateData, {});

    return retried;
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      taskId: WorkerTask.jsonSchema.properties.id,
      resetAttempts: { type: "boolean" },
    },
    required: ["taskId"],
    additionalProperties: false,
  };
}
