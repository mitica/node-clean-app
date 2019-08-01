import { UserUseCases } from "./user/user-usecases";
import { IUseCaseGroupEvents } from "./usecase-group";
import { BaseEventEmitter } from "../event-emitter";

export class UseCaseManager<
  TEvents extends IUseCaseGroupEvents = IUseCaseGroupEvents
> extends BaseEventEmitter<TEvents> {
  constructor(readonly user: UserUseCases) {
    super();
    [user].forEach(item => {
      item.on("preExecute", data => this.emit("preExecute", data));
      item.on("postExecute", data => this.emit("postExecute", data));
    });
  }
}
