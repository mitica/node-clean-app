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
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >
> extends BaseEventEmitter<Events>
  implements Repository<TData, TEntity, TCreate, KSet, Events> {
  constructor(
    protected readonly createValidator?: DataValidator<TCreate>,
    protected readonly updateValidator?: DataValidator<
      RepositoryUpdateData<TData, KSet>
    >,
    protected readonly deleteValidator?: DataValidator<EntityId, boolean>
  ) {
    super();
  }

  async delete(id: string) {
    if (this.deleteValidator) {
      if (!(await this.deleteValidator.validate(id))) {
        return null;
      }
    }
    const entity = await this.innerDelete(id);
    if (entity) {
      await this.emit("entityDeleted", entity);
    }
    return entity;
  }
  abstract innerDelete(id: EntityId): Promise<TEntity | null>;

  async create(data: Readonly<TCreate>): Promise<TEntity> {
    if (this.createValidator) {
      data = await this.createValidator.validate(data);
    }
    const entity = await this.innerCreate(data);
    if (entity) {
      await this.emit("entityCreated", entity);
    }
    return entity;
  }
  abstract innerCreate(data: Readonly<TCreate>): Promise<TEntity>;

  async update(data: RepositoryUpdateData<TData, KSet>): Promise<TEntity> {
    if (this.updateValidator) {
      data = await this.updateValidator.validate(data);
    }
    const entity = await this.innerUpdate(data);
    if (entity) {
      await this.emit("entityUpdated", entity);
    }
    return entity;
  }
  abstract innerUpdate(
    data: RepositoryUpdateData<TData, KSet>
  ): Promise<TEntity>;

  abstract getById(id: string): Promise<TEntity | null>;
  abstract getByIds(ids: string[]): Promise<TEntity[]>;
  abstract exists(id: string): Promise<boolean>;
  abstract deleteStorage(): Promise<void>;
  abstract createStorage(): Promise<void>;
}
