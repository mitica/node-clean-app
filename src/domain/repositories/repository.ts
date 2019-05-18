import { BaseEntityId, IBaseEntity } from "../entities/base";
import { OptionalKeys, ArrayKeys } from "../../types";

export type RepositoryUpdateData<T extends IBaseEntity, KSet extends keyof T = never> = {
  /**
   * Entity id to updated.
   */
  id: BaseEntityId
  /**
   * Entity fields to set.
   */
  set?: Partial<Pick<T, KSet>>
  /**
   * Add items to array fields.
   */
  add?: Pick<T, ArrayKeys<T>>
  /**
   * Remove items from array fields.
   */
  remove?: Pick<T, ArrayKeys<T>>
  /**
   * Entity fields to delete.
   */
  delete?: (OptionalKeys<T>)[]
}

export interface IRepository<TEntity extends IBaseEntity, TCreate, KSet extends keyof TEntity = never> {
  /**
   * Delete an entity by id.
   * @param id Entity id to be deleted
   */
  delete(id: BaseEntityId): Promise<boolean>

  /**
   * Create a new entity.
   * @param data Entity data
   */
  create(data: TCreate): Promise<TEntity>

  /**
   * Update an existing entity.
   * @param data Entity update data
   */
  update(data: RepositoryUpdateData<TEntity, KSet>): Promise<TEntity>

  /**
   * Get an entity by id.
   * @param id Entity id
   */
  getById(id: BaseEntityId): Promise<TEntity | null>

  /**
   * Get entities by ids
   * @param ids Entities ids
   */
  getByIds(ids: BaseEntityId[]): Promise<TEntity[]>

  /**
   * Check if an entity exists.
   * @param id Entity id
   */
  exists(id: BaseEntityId): Promise<boolean>

  /**
   * Deletes all tables or files associated with this repository.
   * Useful in tests.
   */
  deleteStorage(): Promise<void>

  /** Creates tables or files associated with this repository 
   * Useful in tests.
   */
  createStorage(): Promise<void>
}
