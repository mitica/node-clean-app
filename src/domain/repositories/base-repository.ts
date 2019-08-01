import {
  IRepository,
  IRepositoryUpdateData,
  IRepositoryEvents
} from "./repository";
import { IEntityData, BaseEntity, EntityId } from "../entities/base";
import { IDataValidator } from "../validators/data-validator";
import { BaseEventEmitter } from "../event-emitter";

/**
 * Base Repository class. All repository should extend this one.
 */
export abstract class BaseRepository<
  TData extends IEntityData,
  TEntity extends BaseEntity<TData>,
  TCreate,
  KSet extends keyof TData,
  TUpdate extends IRepositoryUpdateData<TData, KSet> = IRepositoryUpdateData<
    TData,
    KSet
  >,
  Events extends IRepositoryEvents<TData, TEntity> = IRepositoryEvents<
    TData,
    TEntity
  >
> extends BaseEventEmitter<Events>
  implements IRepository<TData, TEntity, TCreate, KSet, TUpdate, Events> {
  constructor(
    protected readonly createValidator?: IDataValidator<TCreate>,
    protected readonly updateValidator?: IDataValidator<TUpdate>,
    protected readonly deleteValidator?: IDataValidator<EntityId, boolean>
  ) {
    super();
  }

  protected async preDelete(id: EntityId): Promise<boolean> {
    if (this.deleteValidator) {
      if (!(await this.deleteValidator.validate(id))) {
        return false;
      }
    }
    return true;
  }

  async delete(id: EntityId) {
    if (!(await this.preDelete(id))) {
      return null;
    }
    const entity = await this.innerDelete(id);
    if (entity) {
      await this.emit("entityDeleted", entity);
    }
    return entity;
  }
  abstract innerDelete(id: EntityId): Promise<TEntity | null>;

  protected async preCreate(data: Readonly<TCreate>): Promise<TCreate> {
    if (this.createValidator) {
      data = await this.createValidator.validate(data);
    }
    return data;
  }

  async create(data: Readonly<TCreate>): Promise<TEntity> {
    data = await this.preCreate(data);
    const entity = await this.innerCreate(data);
    if (entity) {
      await this.emit("entityCreated", entity);
    }
    return entity;
  }
  abstract innerCreate(data: Readonly<TCreate>): Promise<TEntity>;

  async preUpdate(data: Readonly<TUpdate>): Promise<TUpdate> {
    if (this.updateValidator) {
      data = await this.updateValidator.validate(data);
    }
    return data;
  }
  async update(data: Readonly<TUpdate>): Promise<TEntity> {
    data = await this.preUpdate(data);
    const entity = await this.innerUpdate(data);
    if (entity) {
      await this.emit("entityUpdated", entity);
    }
    return entity;
  }
  abstract innerUpdate(data: Readonly<TUpdate>): Promise<TEntity>;

  abstract getById(id: string): Promise<TEntity | null>;
  abstract getByIds(ids: string[]): Promise<TEntity[]>;
  abstract exists(id: string): Promise<boolean>;

  abstract deleteStorage(): Promise<void>;
  abstract createStorage(): Promise<void>;
}
