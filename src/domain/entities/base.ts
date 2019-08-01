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
  updatedAt: Date;
}

export type EntityType = "user";

/**
 * Root entity interface.
 * All entities will extend it.
 */
export abstract class BaseEntity<
  TData extends EntityData = EntityData,
  TType extends EntityType = EntityType
> implements EntityData {
  protected _data: TData;

  constructor(readonly entityType: TType, data: TData) {
    this._data = data;
  }

  get id() {
    return this._data.id;
  }
  set id(value: EntityId) {
    this._data.id = value;
  }
  get createdAt() {
    return this._data.createdAt;
  }
  set createdAt(value: Date) {
    this._data.createdAt = value;
  }
  get updatedAt() {
    return this._data.updatedAt;
  }
  set updatedAt(value: Date) {
    this._data.updatedAt = value;
  }

  getData() {
    return this._data;
  }
}
