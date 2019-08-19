export type Nullable<T> = { [P in keyof T]: T[P] | null };

export type PickKeysByType<T, KT> = {
  [P in keyof Required<T>]: T[P] extends KT ? P : never
}[keyof T];

export type PickByType<T, KT> = Pick<T, PickKeysByType<T, KT>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T];

export type ArrayKeys<T> = PickKeysByType<T, any[]>;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
