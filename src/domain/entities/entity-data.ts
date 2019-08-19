/**
 * Entity it type.
 */
export type EntityId = string;

/**
 * Root entity data.
 */
export interface EntityData {
  id: EntityId;
  createdAt: Date;
  updatedAt?: Date;
}
