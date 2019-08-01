import { EntityId, EntityData, BaseEntity } from "../entities/base";
import { OptionalKeys, ArrayKeys } from "../types";
import { EventEmitter } from "../event-emitter";

export interface RepositoryUpdateData<
  TData extends EntityData,
  KSet extends keyof TData = never
> {
  /**
   * Entity id to update.
   */
  readonly id: EntityId;
  /**
   * Entity fields to set.
   */
  readonly set?: Readonly<Partial<Pick<TData, KSet>>>;
  /**
   * Add items to array fields.
   */
  readonly add?: Readonly<Pick<TData, ArrayKeys<TData>>>;
  /**
   * Remove items from array fields.
   */
  readonly remove?: Readonly<Pick<TData, ArrayKeys<TData>>>;
  /**
   * Entity fields to delete.
   */
  readonly delete?: ReadonlyArray<OptionalKeys<TData>>;
}

export interface RepositoryEvents<
  TData extends EntityData,
  TEntity extends BaseEntity<TData>
> {
  entityCreated: TEntity;
  entityUpdated: TEntity;
  entityDeleted: TEntity;
}

export interface Repository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData>,
  TCreate,
  KSet extends keyof TData = never,
  TUpdate extends RepositoryUpdateData<TData, KSet> = RepositoryUpdateData<
    TData,
    KSet
  >,
  TEvents extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >
> extends EventEmitter<TEvents> {
  /**
   * Delete an entity by id.
   * @param id Entity id to be deleted
   */
  delete(id: EntityId): Promise<TEntity | null>;

  /**
   * Create a new entity.
   * @param data Entity data
   */
  create(data: Readonly<TCreate>): Promise<TEntity>;

  /**
   * Update an existing entity.
   * @param data Entity update data
   */
  update(data: Readonly<TUpdate>): Promise<TEntity>;

  /**
   * Get an entity by id.
   * @param id Entity id
   */
  getById(id: EntityId): Promise<TEntity | null>;

  /**
   * Get entities by ids
   * @param ids Entities ids
   */
  getByIds(ids: EntityId[]): Promise<TEntity[]>;

  /**
   * Check if an entity exists.
   * @param id Entity id
   */
  exists(id: EntityId): Promise<boolean>;

  /**
   * Deletes all tables or files associated with this repository.
   * Useful for tests.
   */
  deleteStorage(): Promise<void>;

  /** Creates tables or files associated with this repository
   * Useful for tests.
   */
  createStorage(): Promise<void>;
}
