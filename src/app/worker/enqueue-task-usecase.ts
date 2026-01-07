import {
  BaseUseCase,
  WorkerTask,
  WorkerTaskPriority,
  WorkerTaskStatus,
  RequiredJSONSchema,
} from "../../domain";
import { AppContext } from "../../config";

export interface EnqueueTaskInput {
  /** Task type identifier */
  type: string;
  /** Task payload data */
  payload: Record<string, unknown>;
  /** Priority (1-100, default: 5) */
  priority?: number;
  /** Maximum retry attempts (default: 3) */
  maxAttempts?: number;
  /** Scheduled execution time (optional) */
  scheduledAt?: string;
  /**
   * Optional idempotency key to prevent duplicate tasks.
   * If provided and an active task with this key exists, returns existing task.
   *
   * @example
   * // Prevent duplicate email sends
   * idempotencyKey: `email:welcome:${userId}`
   *
   * // Prevent duplicate report generation for same params
   * idempotencyKey: `report:daily:${date}`
   */
  idempotencyKey?: string;
}

export interface EnqueueTaskOutput {
  task: WorkerTask;
  /** True if a new task was created, false if existing was returned */
  created: boolean;
}

/**
 * Enqueue a new worker task.
 */
export class EnqueueTaskUseCase extends BaseUseCase<
  EnqueueTaskInput,
  EnqueueTaskOutput,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<EnqueueTaskInput>,
    ctx: AppContext
  ): Promise<EnqueueTaskOutput> {
    const result = await ctx.repo.workerTask.createIdempotent(
      {
        type: input.type,
        payload: input.payload,
        status: WorkerTaskStatus.PENDING,
        priority: input.priority ?? WorkerTaskPriority.NORMAL,
        attempts: 0,
        maxAttempts: input.maxAttempts ?? 3,
        idempotencyKey: input.idempotencyKey,
        scheduledAt: input.scheduledAt,
      },
      { ctx }
    );

    if (!result.created && input.idempotencyKey) {
      console.log(
        `[EnqueueTask] Returning existing task ${result.task.id} for idempotency key: ${input.idempotencyKey}`
      );
    }

    return result;
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      type: { type: "string", minLength: 1, maxLength: 50 },
      payload: { type: "object" },
      priority: { type: "integer", minimum: 1, maximum: 100 },
      maxAttempts: { type: "integer", minimum: 1, maximum: 100 },
      scheduledAt: { type: "string", format: "date-time" },
      idempotencyKey: { type: "string", maxLength: 50 },
    },
    required: ["type", "payload"],
    additionalProperties: false,
  };
}
