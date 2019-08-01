import { IUserRepository } from "./user/user-repository";
import { IEventEmitter } from "../event-emitter";
import { BaseEntity } from "../entities/base";

export interface IRepositoryManagerEvents {
  entityCreated: BaseEntity;
  entityUpdated: BaseEntity;
  entityDeleted: BaseEntity;
}

export interface IRepositoryManager<
  TUserRepository extends IUserRepository = IUserRepository,
  TEvents extends IRepositoryManagerEvents = IRepositoryManagerEvents
> extends IEventEmitter<TEvents> {
  readonly user: TUserRepository;
}
