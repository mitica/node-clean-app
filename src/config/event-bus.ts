import { DomainEventBus } from "../domain/base/event-bus";

/**
 * Singleton instance of the Domain Event Bus.
 * Import event declarations from entity files to get full type safety.
 */
let instance: DomainEventBus | null = null;

export const getEventBus = (): DomainEventBus => {
  if (!instance) {
    instance = new DomainEventBus();
  }
  return instance;
};

/**
 * Reset the event bus instance (useful for testing)
 */
export const resetEventBus = (): void => {
  if (instance) {
    instance.clearAll();
    instance = null;
  }
};

/** Export the singleton for convenience */
export const eventBus = getEventBus();
