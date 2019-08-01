import {
  IRepositoryManagerEvents,
  IRepositoryManager
} from "./repository-manager";
import { BaseEventEmitter } from "../event-emitter";
import { IUserRepository } from "./user/user-repository";

export class BaseRepositoryManager<
  TUserRepository extends IUserRepository = IUserRepository,
  TEvents extends IRepositoryManagerEvents = IRepositoryManagerEvents
> extends BaseEventEmitter<TEvents>
  implements IRepositoryManager<TUserRepository, TEvents> {
  constructor(readonly user: TUserRepository) {
    super();
    [user].forEach(repo => {
      repo.on("entityCreated", data => this.emit("entityCreated", data));
      repo.on("entityDeleted", data => this.emit("entityDeleted", data));
      repo.on("entityUpdated", data => this.emit("entityUpdated", data));
    });
  }
}
