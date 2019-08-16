import { EntityData } from "./entity-data";
import { EntityType } from "./base-entity";

export interface Entity<TData extends EntityData = EntityData> {
  readonly _entityType: EntityType;

  getData(): TData;

  /**
   * Set property value.
   * @param prop Property name
   * @param value Property value
   */
  set<TProp extends keyof TData>(prop: TProp, value: TData[TProp]): void;

  /**
   * Get property value.
   * @param prop Property name
   */
  get<TProp extends keyof TData>(prop: TProp): TData[TProp];
}
