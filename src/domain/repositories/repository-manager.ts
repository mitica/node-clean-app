import { UserRepository } from "./user/user-repository";
import { EventEmitter } from "../event-emitter";
import { Entity } from "../entities/entity";

export interface RepositoryManagerEvents {
  entityCreated: Entity;
  entityUpdated: Entity;
  entityDeleted: Entity;
}

export interface RepositoryManager<
  TUserRepository extends UserRepository = UserRepository,
  TEvents extends RepositoryManagerEvents = RepositoryManagerEvents
> extends EventEmitter<TEvents> {
  readonly user: TUserRepository;
}
