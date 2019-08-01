import * as Emittery from "emittery";

type UnsubscribeFn = () => void;

export interface IEventEmitter<TEvents extends {}> {
  on<Name extends keyof TEvents>(
    eventName: Name,
    listener: (eventData: TEvents[Name]) => any
  ): UnsubscribeFn;

  once<Name extends keyof TEvents>(eventName: Name): Promise<TEvents[Name]>;

  off<Name extends keyof TEvents>(
    eventName: Name,
    listener: (eventData: TEvents[Name]) => any
  ): void;

  onAny(
    listener: (
      eventName: keyof TEvents,
      eventData?: TEvents[keyof TEvents]
    ) => any
  ): UnsubscribeFn;
  offAny(
    listener: (
      eventName: keyof TEvents,
      eventData?: TEvents[keyof TEvents]
    ) => any
  ): void;
}

export class BaseEventEmitter<EventDataMap extends {}>
  implements IEventEmitter<EventDataMap> {
  private _emitter: Emittery.Typed<EventDataMap>;

  constructor() {
    this._emitter = new Emittery.Typed();
  }

  on<Name extends keyof EventDataMap>(
    eventName: Name,
    listener: (eventData: EventDataMap[Name]) => any
  ): UnsubscribeFn {
    return this._emitter.on(eventName as any, listener as any);
  }

  once<Name extends keyof EventDataMap>(
    eventName: Name
  ): Promise<EventDataMap[Name]> {
    return this._emitter.once(eventName as any);
  }

  off<Name extends keyof EventDataMap>(
    eventName: Name,
    listener: (eventData: EventDataMap[Name]) => any
  ): void {
    return this._emitter.off(eventName as any, listener as any);
  }

  onAny(
    listener: (
      eventName: keyof EventDataMap,
      eventData?: EventDataMap[keyof EventDataMap]
    ) => any
  ): UnsubscribeFn {
    return this._emitter.onAny(listener as any);
  }
  offAny(
    listener: (
      eventName: keyof EventDataMap,
      eventData?: EventDataMap[keyof EventDataMap]
    ) => any
  ): void {
    return this._emitter.offAny(listener as any);
  }

  protected emit<Name extends keyof EventDataMap>(
    eventName: Name,
    eventData: EventDataMap[Name]
  ): Promise<void> {
    return this._emitter.emit(eventName as any, eventData);
  }

  protected emitSerial<Name extends keyof EventDataMap>(
    eventName: Name,
    eventData: EventDataMap[Name]
  ): Promise<void> {
    return this._emitter.emitSerial(eventName as any, eventData);
  }
}
