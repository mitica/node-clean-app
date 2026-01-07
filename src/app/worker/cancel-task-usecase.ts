import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config/app-context";
import { RequiredJSONSchema, EntityId } from "../../domain/base";
import { WorkerTask, WorkerTaskStatus } from "../../domain/entity/worker-task";

export interface CancelTaskInput {
  /** Task ID to cancel */
  taskId: EntityId;
}

/**
 * Cancel a pending worker task.
 */
export class CancelTaskUseCase extends BaseUseCase<
  CancelTaskInput,
  WorkerTask,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<CancelTaskInput>,
    ctx: AppContext
  ): Promise<WorkerTask> {
    const task = await ctx.repo.workerTask.checkById(input.taskId);

    if (task.status !== WorkerTaskStatus.PENDING) {
      throw new Error(
        `Cannot cancel task in status: ${task.status}. Only pending tasks can be cancelled.`
      );
    }

    const cancelled = await ctx.repo.workerTask.update(
      {
        id: input.taskId,
        status: WorkerTaskStatus.CANCELLED,
        finishedAt: new Date().toISOString(),
      },
      { ctx }
    );

    return cancelled;
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      taskId: WorkerTask.jsonSchema.properties.id,
    },
    required: ["taskId"],
    additionalProperties: false,
  };
}
