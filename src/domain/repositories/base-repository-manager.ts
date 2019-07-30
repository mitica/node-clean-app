import {
  RepositoryManagerEvents,
  RepositoryManager
} from "./repository-manager";
import { BaseEventEmitter } from "../event-emitter";
import { UserRepository } from "./user/user-repository";

export class BaseRepositoryManager<
  EventDataMap extends RepositoryManagerEvents = RepositoryManagerEvents
> extends BaseEventEmitter<EventDataMap>
  implements RepositoryManager<EventDataMap> {
  constructor(readonly user: UserRepository) {
    super();
    [user].forEach(repo => {
      repo.on("entityCreated", data => this.emit("entityCreated", data));
      repo.on("entityDeleted", data => this.emit("entityDeleted", data));
      repo.on("entityUpdated", data => this.emit("entityUpdated", data));
    });
  }
}
