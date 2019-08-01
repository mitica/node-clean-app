import { UserRepository } from "./user/user-repository";
import { EventEmitter } from "../event-emitter";
import { BaseEntity } from "../entities/base";

export interface RepositoryManagerEvents {
  entityCreated: BaseEntity;
  entityUpdated: BaseEntity;
  entityDeleted: BaseEntity;
}

export interface RepositoryManager<
  TUserRepository extends UserRepository = UserRepository,
  TEvents extends RepositoryManagerEvents = RepositoryManagerEvents
> extends EventEmitter<TEvents> {
  readonly user: TUserRepository;
}
