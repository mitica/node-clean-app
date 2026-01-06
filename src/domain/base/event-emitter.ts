import EventEmitter from "emittery";

interface Events {
  [eventName: string]: any;
}

export class TypedEventEmitter<EventDataMap extends Events> {
  private _emitter: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();
  }

  on<Name extends keyof EventDataMap>(
    eventName: Name,
    listener: (eventData: EventDataMap[Name]) => any
  ): this {
    this._emitter.on(eventName as any, listener as any);
    return this;
  }

  async once<Name extends keyof EventDataMap>(
    eventName: Name,
    listener: (eventData: EventDataMap[Name]) => any
  ): Promise<void> {
    await this._emitter.once(eventName as any, listener as any);
  }

  off<Name extends keyof EventDataMap>(
    eventName: Name,
    listener: (eventData: EventDataMap[Name]) => any
  ): void {
    this._emitter.off(eventName as any, listener as any);
  }

  protected async emit<Name extends keyof EventDataMap>(
    eventName: Name,
    eventData: EventDataMap[Name]
  ): Promise<void> {
    await this._emitter.emit(eventName as any, eventData);
  }
}
