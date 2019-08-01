import {
  RepositoryManagerEvents,
  RepositoryManager
} from "./repository-manager";
import { BaseEventEmitter } from "../event-emitter";
import { UserRepository } from "./user/user-repository";

export class BaseRepositoryManager<
  TUserRepository extends UserRepository = UserRepository,
  TEvents extends RepositoryManagerEvents = RepositoryManagerEvents
> extends BaseEventEmitter<TEvents>
  implements RepositoryManager<TUserRepository, TEvents> {
  constructor(readonly user: TUserRepository) {
    super();
    [user].forEach(repo => {
      repo.on("entityCreated", data => this.emit("entityCreated", data));
      repo.on("entityDeleted", data => this.emit("entityDeleted", data));
      repo.on("entityUpdated", data => this.emit("entityUpdated", data));
    });
  }
}
