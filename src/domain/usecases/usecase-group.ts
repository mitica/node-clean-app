import { BaseEventEmitter } from "../event-emitter";
import { IUseCaseEvents, IUseCase } from "./usecase";

export interface IUseCaseGroupEvents {
  preExecute: { usecase: IUseCase; input: Readonly<any> };
  postExecute: {
    usecase: IUseCase;
    input: Readonly<any>;
    output: Readonly<any>;
  };
}

export class UseCaseGroup<
  TEvents extends IUseCaseGroupEvents = IUseCaseGroupEvents
> extends BaseEventEmitter<TEvents> {
  constructor(usecases: IUseCase<IUseCaseEvents>[]) {
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
