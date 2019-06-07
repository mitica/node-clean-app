import { Repository, RepositoryUpdateData } from "./repository";
import { EntityData, BaseEntity, EntityId } from "../entities/base";
import { DataValidator } from "../validators/data-validator";

/**
 * Base Repository class. All repository should extend this one.
 */
export abstract class BaseRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData>,
  TCreate,
  KSet extends keyof TData
> implements Repository<TData, TEntity, TCreate, KSet> {
  constructor(
    protected readonly createValidator?: DataValidator<TCreate>,
    protected readonly updateValidator?: DataValidator<
      RepositoryUpdateData<TData, KSet>
    >,
    protected readonly deleteValidator?: DataValidator<EntityId, boolean>
  ) {}

  async delete(id: string) {
    if (this.deleteValidator) {
      if (!(await this.deleteValidator.validate(id))) {
        return null;
      }
    }
    return this.innerDelete(id);
  }
  abstract innerDelete(id: EntityId): Promise<TEntity | null>;

  async create(data: Readonly<TCreate>): Promise<TEntity> {
    if (this.createValidator) {
      data = await this.createValidator.validate(data);
    }
    return this.innerCreate(data);
  }
  abstract innerCreate(data: Readonly<TCreate>): Promise<TEntity>;

  async update(data: RepositoryUpdateData<TData, KSet>): Promise<TEntity> {
    if (this.updateValidator) {
      data = await this.updateValidator.validate(data);
    }
    return this.innerUpdate(data);
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
