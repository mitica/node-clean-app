import { CursorPageParams } from "./cursor-pagination";

export enum DateGranularity {
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  QUARTER = "QUARTER",
  YEAR = "YEAR",
}

export enum DataAggregation {
  SUM = "SUM",
  AVG = "AVG",
  MIN = "MIN",
  MAX = "MAX",
  COUNT = "COUNT",
}

export interface Point {
  x: number;
  y: number;
}

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export type SortBy<T> = {
  name: T;
  direction?: SortDirection;
  nullsLast?: boolean;
};

export enum SqlOperator {
  EQ = "=",
  NEQ = "<>",
  GT = ">",
  GTE = ">=",
  LT = "<",
  LTE = "<=",
  CONTAINS = "CONTAINS",
  STARTS_WITH = "STARTS_WITH",
  EXISTS = "EXISTS",
}

// AND | OR
export enum SqlLogicalOperator {
  AND = "AND",
  OR = "OR",
  // NOT = "NOT",
}

export type FilterFieldValue =
  | string
  | number
  | boolean
  | (string | null)[]
  | number[]
  | boolean[]
  | Buffer
  | null;

export type FilterField<T extends string = string> = {
  name: T;
  op?: SqlOperator;
  value: FilterFieldValue;
  /** defaults to AND */
  lop?: SqlLogicalOperator;
  /** sub filter */
  filter?: FilterField<T>[];
  /** exists in table */
  // existsIn?: string;
};

// export type ExistsFilterQuery<T extends string = string> = {
//   exists: boolean;
// };

// export type FilterField<T extends string = string> = BaseFilterField<T> & {
//   exists?: ExistsFilterQuery<T>;
// };

export interface PaginationParams extends CursorPageParams {
  offset?: number;
}
