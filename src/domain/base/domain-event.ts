import { EntityId } from "./types";
import { BaseEntity, EntityData, EntityUpdateData } from "./entity";
import { RepositoryWriteOptions } from "../repository";
import { DomainContext } from "../context";

/**
 * Global Domain Event Registry - extend via declaration merging.
 *
 * Usage in entity files:
 * ```typescript
 * declare module "../base/domain-event" {
 *   interface DomainEventRegistry {
 *     "user:created": EntityCreatedEvent<User>;
 *     "user:updated": EntityUpdatedEvent<User, UserUpdateData>;
 *     "user:deleted": EntityDeletedEvent<User>;
 *     "user:preDelete": EntityId;
 *   }
 * }
 * ```
 */
export interface DomainEventRegistry {
  // Extended via declaration merging in entity files
  "usecase:executed": {
    name: string;
    input: unknown;
    output: unknown;
    ctx: DomainContext;
  };
  "usecase:executing": { name: string; input: unknown; ctx: DomainContext };
}

/** Event name must be registered in DomainEventRegistry */
export type DomainEventName = keyof DomainEventRegistry;

/** Get payload type for a specific event */
export type DomainEventPayload<T extends DomainEventName> =
  DomainEventRegistry[T];

/**
 * Domain Event wrapper with metadata
 */
export interface DomainEvent<T extends DomainEventName = DomainEventName> {
  type: T;
  payload: DomainEventPayload<T>;
  timestamp: Date;
  /** Optional correlation id for tracing */
  correlationId?: string;
}

/**
 * Helper function to create a domain event
 */
export function createDomainEvent<T extends DomainEventName>(
  type: T,
  payload: DomainEventPayload<T>,
  correlationId?: string
): DomainEvent<T> {
  return {
    type,
    payload,
    timestamp: new Date(),
    correlationId,
  };
}

// ============================================
// Standard Repository Event Payload Types
// ============================================

export interface EntityCreatedEvent<
  TEntity extends BaseEntity<EntityData> = BaseEntity<EntityData>
> {
  entity: TEntity;
  opt: RepositoryWriteOptions;
}

export interface EntityUpdatedEvent<
  TEntity extends BaseEntity<EntityData> = BaseEntity<EntityData>,
  TUpdate extends EntityUpdateData<EntityData> = EntityUpdateData<EntityData>
> {
  entity: TEntity;
  data: TUpdate;
  opt: RepositoryWriteOptions;
}

export interface EntityDeletedEvent<
  TEntity extends BaseEntity<EntityData> = BaseEntity<EntityData>
> {
  entity: TEntity;
  opt: RepositoryWriteOptions;
}

export interface EntityPreDeleteEvent {
  entityId: EntityId;
  opt: RepositoryWriteOptions;
}

// ============================================
// Helper type for repository event names
// ============================================

export type RepositoryEventNames<EntityName extends string> =
  | `${EntityName}:created`
  | `${EntityName}:updated`
  | `${EntityName}:deleted`
  | `${EntityName}:preDelete`;
