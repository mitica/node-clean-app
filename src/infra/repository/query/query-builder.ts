import { Knex } from "knex";
import {
  BaseFilterParams,
  FindBaseParams,
  FindParams,
  StatsParams,
} from "../../../domain/repository";
import { FilterField } from "../../../domain/base";

export type ApplyJoinInput = {
  params: BaseFilterParams;
  findParams: FindBaseParams;
};

export type ApplySortInput = {
  params: BaseFilterParams;
  tableName: string;
  findParams: FindBaseParams;
};

export type ApplySelectInput = {
  params: BaseFilterParams;
  tableName: string;
  select?: string[];
  findParams: FindBaseParams;
};

export type ApplyFilterInput = {
  params: BaseFilterParams;
  tableName: string;
  filters: FilterField[];
  parent?: FilterField;
  findParams: FindBaseParams;
};

export interface IQueryBuilder<TFindParams extends FindBaseParams = FindBaseParams> {
  /**
   * Apply all find params to the query
   * @param query
   * @param params
   */
  build(
    query: Knex.QueryInterface,
    params: FindParams<TFindParams> | StatsParams
  ): Knex.QueryInterface;

  applyJoins(query: Knex.QueryInterface, input: ApplyJoinInput): this;

  /**
   * Apply filters/where only to the query
   * @param query
   * @param input
   */
  applyFilters(query: Knex.QueryInterface, input: ApplyFilterInput): this;

  /**
   * Apply sorting to the query
   * @param query
   * @param input
   */
  applySort(query: Knex.QueryInterface, input: ApplySortInput): this;

  /**
   * Apply select to the query
   * @param query
   * @param input
   */
  applySelect(query: Knex.QueryInterface, input: ApplySelectInput): this;
}
