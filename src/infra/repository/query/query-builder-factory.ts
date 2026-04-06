import { type Knex } from "knex";
import { FindBaseParams } from "../../../domain/repository";
import { IQueryBuilder } from "./query-builder";
import { DbQueryBuilder } from "./db-query-builder";

export interface IQueryBuilderFactory {
  /**
   * Create a new query builder instance
   */
  create<TFindParams extends FindBaseParams = FindBaseParams>(
    tableName: string
  ): IQueryBuilder<TFindParams>;
}

export class QueryBuilderFactory implements IQueryBuilderFactory {
  constructor(private knex: Knex) {}

  create<TFindParams extends FindBaseParams = FindBaseParams>(
    tableName: string
  ): IQueryBuilder<TFindParams> {
    switch (tableName) {
      default:
        return new DbQueryBuilder<TFindParams>(this.knex, tableName);
    }
  }
}
