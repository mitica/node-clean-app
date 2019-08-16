import { EntityData } from "./entity-data";
import { Entity } from "./entity";

export type EntityType = "user";

/**
 * Base entity class.
 * All entities should extend BaseEntity.
 */
export abstract class BaseEntity<TData extends EntityData = EntityData>
  implements Entity<TData> {
  constructor(
    protected readonly _data: TData,
    readonly _entityType: EntityType
  ) {}

  get id() {
    return this.get("id");
  }
  set id(value: TData["id"]) {
    this.set("id", value);
  }
  get createdAt() {
    return this.get("createdAt");
  }
  set createdAt(value: TData["createdAt"]) {
    this.set("createdAt", value);
  }
  get updatedAt() {
    return this.get("updatedAt");
  }
  set updatedAt(value: TData["updatedAt"]) {
    this.set("updatedAt", value);
  }

  getData() {
    return this._data;
  }

  set<TProp extends keyof TData>(prop: TProp, value: TData[TProp]) {
    if (value === undefined) {
      delete this._data[prop];
    } else {
      this._data[prop] = value;
    }
  }

  get<TProp extends keyof TData>(prop: TProp) {
    return this._data[prop];
  }
}
