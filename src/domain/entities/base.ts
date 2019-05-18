/**
 * Base entity interface.
 * All entities will extend it.
 */
export interface IBaseEntity {
  id: BaseEntityId
  createdAt: Date
  updatedAt: Date
}

/**
 * Base entity it type.
 */
export type BaseEntityId = string;
