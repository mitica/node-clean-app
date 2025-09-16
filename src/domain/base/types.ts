export type Nullable<T> = { [P in keyof T]: T[P] | null };

export interface Constructor<T, D = never> {
  new (data: D): T;
}

/**
 * Entity id type.
 */
export type EntityId = number;
