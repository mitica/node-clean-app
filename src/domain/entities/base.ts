/**
 * Root entity interface.
 * All entities will extend it.
 */
export interface Entity {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity it type.
 */
export type EntityId = string;
