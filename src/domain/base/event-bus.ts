import EventEmitter from "emittery";
import {
  DomainEvent,
  DomainEventName,
  DomainEventPayload,
  createDomainEvent,
} from "./domain-event";

type EventHandler<T extends DomainEventName> = (
  event: DomainEvent<T>
) => void | Promise<void>;

/**
 * Domain Event Bus Interface.
 * Provides type-safe event emission and subscription using declaration merging.
 *
 * Events are registered via declaration merging on DomainEventRegistry.
 */
export interface IDomainEventBus {
  /**
   * Emit a domain event
   */
  emit<T extends DomainEventName>(
    type: T,
    payload: DomainEventPayload<T>,
    correlationId?: string
  ): Promise<void>;

  /**
   * Subscribe to a domain event
   * @returns Unsubscribe function
   */
  on<T extends DomainEventName>(
    eventType: T,
    handler: EventHandler<T>
  ): () => void;

  /**
   * Subscribe to a domain event once
   */
  once<T extends DomainEventName>(eventType: T, handler: EventHandler<T>): void;

  /**
   * Unsubscribe from a domain event
   */
  off<T extends DomainEventName>(eventType: T, handler: EventHandler<T>): void;

  /**
   * Clear all listeners (useful for testing)
   */
  clearAll(): void;
}

/**
 * Domain Event Bus implementation.
 * Use the singleton instance from config/event-bus.ts
 */
export class DomainEventBus implements IDomainEventBus {
  private emitter = new EventEmitter();

  async emit<T extends DomainEventName>(
    type: T,
    payload: DomainEventPayload<T>,
    correlationId?: string
  ) {
    const event = createDomainEvent(type, payload, correlationId);
    await this.emitter.emit(type as string, event);
  }

  on<T extends DomainEventName>(eventType: T, handler: EventHandler<T>) {
    return this.emitter.on(eventType as string, handler);
  }

  async once<T extends DomainEventName>(
    eventType: T,
    handler: EventHandler<T>
  ) {
    return this.emitter.once(eventType as string).then(handler);
  }

  off<T extends DomainEventName>(eventType: T, handler: EventHandler<T>) {
    this.emitter.off(eventType as string, handler);
  }

  clearAll(): void {
    this.emitter.clearListeners();
  }
}
