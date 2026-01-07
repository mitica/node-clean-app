import {
  BaseEntity,
  EntityCreateData,
  EntityData,
  EntityId,
  EntityUpdateData,
  RequiredJSONSchema
} from "../base";

/**
 * Worker task status enum
 */
export enum WorkerTaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

/**
 * Worker task priority enum
 */
export enum WorkerTaskPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20
}

/**
 * Worker task data interface
 */
export interface WorkerTaskData extends EntityData {
  /** Unique task type identifier (e.g., "email:send", "report:generate") */
  type: string;
  /** JSON payload for the task */
  payload: Record<string, unknown>;
  /** Current task status */
  status: WorkerTaskStatus;
  /** Task priority (higher = more urgent) */
  priority: number;
  /** Number of retry attempts */
  attempts: number;
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Optional unique key to prevent duplicate tasks */
  idempotencyKey?: string;
  /** User ID who created this task (optional) */
  createdByUserId?: EntityId;
  /** Scheduled time to run (null = immediate) */
  scheduledAt?: string;
  /** Time when task started running */
  startedAt?: string;
  /** Time when task completed/failed */
  finishedAt?: string;
  /** Error message if task failed */
  errorMessage?: string;
  /** Error stack trace */
  errorStack?: string;
  /** Result data if task completed */
  result?: Record<string, unknown>;
  /** Worker ID that is processing this task */
  lockedBy?: string;
  /** Lock expiration time */
  lockedUntil?: string;
}

export type WorkerTaskCreateData = EntityCreateData<WorkerTaskData>;
export type WorkerTaskUpdateData = EntityUpdateData<WorkerTaskData>;

/**
 * Worker Task Entity
 */
export class WorkerTask
  extends BaseEntity<WorkerTaskData>
  implements WorkerTaskData
{
  get type() {
    return this._data.type;
  }
  get payload() {
    return this._data.payload;
  }
  get status() {
    return this._data.status;
  }
  get priority() {
    return this._data.priority;
  }
  get attempts() {
    return this._data.attempts;
  }
  get maxAttempts() {
    return this._data.maxAttempts;
  }
  get idempotencyKey() {
    return this._data.idempotencyKey;
  }
  get createdByUserId() {
    return this._data.createdByUserId;
  }
  get scheduledAt() {
    return this._data.scheduledAt;
  }
  get startedAt() {
    return this._data.startedAt;
  }
  get finishedAt() {
    return this._data.finishedAt;
  }
  get errorMessage() {
    return this._data.errorMessage;
  }
  get errorStack() {
    return this._data.errorStack;
  }
  get result() {
    return this._data.result;
  }
  get lockedBy() {
    return this._data.lockedBy;
  }
  get lockedUntil() {
    return this._data.lockedUntil;
  }

  /** Check if task can be retried */
  canRetry(): boolean {
    return (
      this.status === WorkerTaskStatus.FAILED &&
      this.attempts < this.maxAttempts
    );
  }

  /** Check if task is stale (lock expired) */
  isStale(): boolean {
    if (!this.lockedUntil) return false;
    return new Date(this.lockedUntil) < new Date();
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      ...super.jsonSchema.properties,
      type: { type: "string", minLength: 1, maxLength: 50 },
      payload: { type: "object" },
      status: { type: "string", enum: Object.values(WorkerTaskStatus) },
      priority: { type: "integer", minimum: 1, maximum: 100 },
      attempts: { type: "integer", minimum: 0 },
      maxAttempts: { type: "integer", minimum: 1 },
      idempotencyKey: { type: "string", maxLength: 50 },
      createdByUserId: { type: "integer" },
      scheduledAt: { type: "string", format: "date-time" },
      startedAt: { type: "string", format: "date-time" },
      finishedAt: { type: "string", format: "date-time" },
      errorMessage: { type: "string" },
      errorStack: { type: "string" },
      result: { type: "object" },
      lockedBy: { type: "string", maxLength: 255 },
      lockedUntil: { type: "string", format: "date-time" }
    },
    required: [
      ...super.jsonSchema.required,
      "type",
      "payload",
      "status",
      "priority",
      "attempts",
      "maxAttempts"
    ],
    additionalProperties: false
  };
}
