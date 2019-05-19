import { EntityId, Entity } from "../entities/base";
import { OptionalKeys, ArrayKeys } from "../types";

export interface RepositoryUpdateData<
  TEntity extends Entity,
  KSet extends keyof TEntity = never
> {
  /**
   * Entity id to updated.
   */
  readonly id: EntityId;
  /**
   * Entity fields to set.
   */
  readonly set?: Readonly<Partial<Pick<TEntity, KSet>>>;
  /**
   * Add items to array fields.
   */
  readonly add?: Readonly<Pick<TEntity, ArrayKeys<TEntity>>>;
  /**
   * Remove items from array fields.
   */
  readonly remove?: Readonly<Pick<TEntity, ArrayKeys<TEntity>>>;
  /**
   * Entity fields to delete.
   */
  readonly delete?: ReadonlyArray<(OptionalKeys<TEntity>)>;
};

export interface Repository<
  TEntity extends Entity,
  TCreate,
  KSet extends keyof TEntity = never
> {
  /**
   * Delete an entity by id.
   * @param id Entity id to be deleted
   */
  delete(id: EntityId): Promise<boolean>;

  /**
   * Create a new entity.
   * @param data Entity data
   */
  create(data: Readonly<TCreate>): Promise<TEntity>;

  /**
   * Update an existing entity.
   * @param data Entity update data
   */
  update(data: RepositoryUpdateData<TEntity, KSet>): Promise<TEntity>;

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
   * Useful in tests.
   */
  deleteStorage(): Promise<void>;

  /** Creates tables or files associated with this repository
   * Useful in tests.
   */
  createStorage(): Promise<void>;
}
