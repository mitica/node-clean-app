import {
  Repository,
  RepositoryUpdateData,
  RepositoryEvents
} from "./repository";
import { EntityData, BaseEntity, EntityId } from "../entities/base";
import { DataValidator } from "../validators/data-validator";
import { BaseEventEmitter } from "../event-emitter";

/**
 * Base Repository class. All repository should extend this one.
 */
export abstract class BaseRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData>,
  TCreate,
  KSet extends keyof TData,
  TUpdate extends RepositoryUpdateData<TData, KSet> = RepositoryUpdateData<
    TData,
    KSet
  >,
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >
> extends BaseEventEmitter<Events>
  implements Repository<TData, TEntity, TCreate, KSet, TUpdate, Events> {
  constructor(
    protected readonly createValidator?: DataValidator<TCreate>,
    protected readonly updateValidator?: DataValidator<TUpdate>,
    protected readonly deleteValidator?: DataValidator<EntityId, boolean>
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
