import { BaseEventEmitter } from "../event-emitter";
import { UseCaseEvents, UseCase } from "./usecase";

export interface UseCaseGroupEvents {
  preExecute: { usecase: UseCase; input: Readonly<any> };
  postExecute: {
    usecase: UseCase;
    input: Readonly<any>;
    output: Readonly<any>;
  };
}

export class UseCaseGroup<
  TEvents extends UseCaseGroupEvents = UseCaseGroupEvents
> extends BaseEventEmitter<TEvents> {
  constructor(usecases: UseCase<UseCaseEvents>[]) {
    super();
    usecases.forEach(item => {
      item.on("preExecute", data =>
        this.emit("preExecute", { ...data, usecase: item })
      );
      item.on("postExecute", data =>
        this.emit("postExecute", { ...data, usecase: item })
      );
    });
  }
}
