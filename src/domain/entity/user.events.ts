import { User, UserUpdateData } from "./user";

/**
 * User entity domain events.
 * Uses declaration merging to register events in the global registry.
 */
declare module "../base/domain-event" {
  interface DomainEventRegistry {
    "user:created": EntityCreatedEvent<User>;
    "user:updated": EntityUpdatedEvent<User, UserUpdateData>;
    "user:deleted": EntityDeletedEvent<User>;
    "user:preDelete": EntityPreDeleteEvent;
  }
}

/** User event names for type-safe usage */
export type UserEventName =
  | "user:created"
  | "user:updated"
  | "user:deleted"
  | "user:preDelete";
