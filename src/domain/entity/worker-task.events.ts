import { EntityId } from "../base/types";
import { WorkerTask, WorkerTaskUpdateData } from "./worker-task";

/**
 * Worker task entity domain events.
 * Uses declaration merging to register events in the global registry.
 */
declare module "../base/domain-event" {
  interface DomainEventRegistry {
    "worker-task:created": EntityCreatedEvent<WorkerTask>;
    "worker-task:updated": EntityUpdatedEvent<WorkerTask, WorkerTaskUpdateData>;
    "worker-task:deleted": EntityDeletedEvent<WorkerTask>;
    "worker-task:preDelete": EntityId;
    "worker-task:started": WorkerTaskStartedEvent;
    "worker-task:completed": WorkerTaskCompletedEvent;
    "worker-task:failed": WorkerTaskFailedEvent;
    "worker-task:retrying": WorkerTaskRetryingEvent;
  }
}

/** Custom event payload types */
export interface WorkerTaskStartedEvent {
  task: WorkerTask;
  workerId: string;
}

export interface WorkerTaskCompletedEvent {
  task: WorkerTask;
  result?: Record<string, unknown>;
  duration: number;
}

export interface WorkerTaskFailedEvent {
  task: WorkerTask;
  error: Error;
  willRetry: boolean;
}

export interface WorkerTaskRetryingEvent {
  task: WorkerTask;
  attempt: number;
  nextAttemptAt: Date;
}

/** Worker task event names for type-safe usage */
export type WorkerTaskEventName =
  | "worker-task:created"
  | "worker-task:updated"
  | "worker-task:deleted"
  | "worker-task:preDelete"
  | "worker-task:started"
  | "worker-task:completed"
  | "worker-task:failed"
  | "worker-task:retrying";
