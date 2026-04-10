import { type Knex } from "knex";
import { InvalidInputError } from "../../../domain/base/errors";
import {
  BaseFilterParams,
  FindBaseParams,
  FindParams,
  StatsParams,
} from "../../../domain/repository";
import {
  FilterField,
  FilterFieldValue,
  SortDirection,
  SqlLogicalOperator,
  SqlOperator,
  toSnakeCase,
  uniq,
} from "../../../domain/base";
import {
  ApplyFilterInput,
  ApplyJoinInput,
  ApplySelectInput,
  ApplySortInput,
  IQueryBuilder,
} from "./query-builder";

export type FormatFilderFieldResult = {
  tableName: string;
  name: string;
  value: FilterFieldValue;
  direction?: SortDirection;
  asName?: string;
};

export type FormatFilterFieldInput = {
  params: FindBaseParams;
  tableName: string;
  fname: string;
  value: FilterFieldValue;
  direction?: SortDirection;
  asName?: string;
};

export type FormatFieldResult = {
  tableName: string;
  name: string;
  value: FilterFieldValue;
  direction?: SortDirection;
  asName?: string;
};

export type FormatFieldInput = {
  params: BaseFilterParams;
  tableName: string;
  fname: string;
  value: FilterFieldValue;
  direction?: SortDirection;
  asName?: string;
};

export type QueryFilterFieldInput = {
  params: FindBaseParams;
  tableName: string;
  filter: FilterField;
  parent?: FilterField;
};

export type GetJoinInfoInput = {
  params: BaseFilterParams;
  name: string;
  filters?: FilterField[];
};

export class DbQueryBuilder<
  TFindParams extends FindBaseParams = FindBaseParams,
> implements IQueryBuilder<TFindParams> {
  constructor(
    protected readonly knex: Knex,
    protected readonly tableName: string
  ) {}

  protected formatField({
    params,
    tableName,
    fname,
    value,
    direction,
    asName,
  }: FormatFieldInput): FormatFieldResult {
    if (
      fname === null ||
      fname === undefined ||
      fname.toString().trim() === ""
    ) {
      throw new InvalidInputError(
        `Filter field name is empty for ${tableName} (${JSON.stringify(
          params
        )})`
      );
    }
    const parts = String(fname).split(/__/g);
    const fieldName = toSnakeCase(parts[0]);
    const name = /^\d+$/.test(fieldName)
      ? fieldName
      : `"${tableName}"."${fieldName}"`;

    return {
      tableName,
      name,
      value,
      direction: direction || SortDirection.ASC,
      asName,
    };
  }

  formatFilterField(input: FormatFilterFieldInput): FormatFilderFieldResult {
    const field = this.formatField(input);
    const parts = String(input.fname).split(/__/g);
    const fullFieldName = field.name;
    const name = applyFunctions(parts.slice(1), fullFieldName, field.asName);

    return {
      tableName: field.tableName,
      name,
      value: field.value,
      direction: field.direction || SortDirection.ASC,
    };
  }

  protected queryFilterField(
    query: Knex.QueryInterface,
    { params, filter, tableName }: QueryFilterFieldInput
  ) {
    const olp = filter.lop || SqlLogicalOperator.AND;
    const { value, name } = this.formatFilterField({
      params,
      tableName,
      fname: filter.name,
      value: filter.value,
    });

    if (value === null) {
      if (olp === SqlLogicalOperator.OR) {
        query.orWhereRaw(
            `${name} ${filter.op === SqlOperator.NEQ ? "is not" : "is"} null`
          );
      } else {
        query.whereRaw(
            `${name} ${filter.op === SqlOperator.NEQ ? "is not" : "is"} null`
          );
      }
    } else {
      if (Array.isArray(value) && !Buffer.isBuffer(value)) {
        if (value.length === 0) return query;
        if (olp === SqlLogicalOperator.OR) {
          query.orWhereRaw(
              `${name}${filter.op === SqlOperator.NEQ ? " not" : ""} in (${value
                .map((_) => `?`)
                .join(",")})`,
              value
            );
        } else {
          query.whereRaw(
              `${name}${filter.op === SqlOperator.NEQ ? " not" : ""} in (${value
                .map((_) => `?`)
                .join(",")})`,
              value
            );
        }
      } else if (filter.value !== undefined) {
        if (filter.op === SqlOperator.CONTAINS) {
          if (olp === SqlLogicalOperator.OR) {
            query.orWhereRaw(
                `${name} like '%' || ? || '%'`,
                value.toString().trim().toLowerCase()
              );
          } else {
            query.whereRaw(
                `${name} like '%' || ? || '%'`,
                value.toString().trim().toLowerCase()
              );
          }
        } else if (filter.op === SqlOperator.EXISTS) {
          const existsFn = (qb: Knex.QueryInterface) =>
            this.applyFilters(
              qb
                .from(tableName)
                .select(`${tableName}.id`)
                .where(`${tableName}.id`, `${this.tableName}.id`),
              {
                params,
                tableName,
                filters: filter.filter || [],
                findParams: params,
              }
            );

          if (value === true) {
            if (olp === SqlLogicalOperator.OR) {
              query.orWhereExists((qb) => existsFn(qb));
            } else {
              query.whereExists((qb) => existsFn(qb));
            }
          } else {
            if (olp === SqlLogicalOperator.OR) {
              query.orWhereNotExists((qb) => existsFn(qb));
            } else {
              query.whereNotExists((qb) => existsFn(qb));
            }
          }
        } else {
          if (olp === SqlLogicalOperator.OR) {
            query.orWhereRaw(`${name} ${filter.op || "="} ?`, value);
          } else {
            query.whereRaw(`${name} ${filter.op || "="} ?`, value);
          }
        }
      }
    }
    return query;
  }

  applyFilters(
    query: Knex.QueryInterface,
    { filters, params, tableName, parent }: ApplyFilterInput
  ) {
    if (!filters?.length) return this;
    for (const filter of filters) {
      if (filter.value === undefined)
        throw new InvalidInputError(`Filter value is undefined`);
      const olp = filter.lop || SqlLogicalOperator.AND;
      this.queryFilterField(query, { params, tableName, filter, parent });
      if (
        filter.op !== SqlOperator.EXISTS &&
        filter.filter &&
        filter.filter.length
      ) {
        const subfilter = filter.filter;
        if (olp === SqlLogicalOperator.OR) {
          query.orWhere((qb) =>
              this.applyFilters(qb, {
                filters: subfilter,
                params,
                tableName,
                parent: filter,
                findParams: params,
              })
            );
        } else {
          query.where((qb) =>
              this.applyFilters(qb, {
                filters: subfilter,
                params,
                tableName,
                parent: filter,
                findParams: params,
              })
            );
        }
      }
    }
    return this;
  }

  protected getJoinInfo(_query: Knex.QueryInterface, _input: GetJoinInfoInput) {
    const key = "";

    const fn: (() => typeof _query) | null = null as (() => typeof _query) | null;

    return { key, fn };
  }

  hasJoinKey(query: Knex.QueryInterface, entityName: string) {
    const q = query as any;
    if (!q.state) q.state = {};
    return !!q.state[`join_${entityName}`];
  }

  setJoinKey(query: Knex.QueryInterface, entityName: string) {
    const q = query as any;
    if (!q.state) q.state = {};
    q.state[`join_${entityName}`] = true;
  }

  applyJoins(
    query: Knex.QueryInterface,
    { findParams: { sort, filter, select }, params }: ApplyJoinInput
  ) {
    const keys: Record<string, boolean> = {};
    const names = uniq(
      (filter || [])
        .map((it) => it.name)
        .concat(select || [])
        .concat((sort || []).map((it) => it.name.toString()))
    );
    for (const name of names) {
      const { key, fn } = this.getJoinInfo(query, {
        params,
        name,
        filters: filter,
      });

      if (key && !keys[key]) {
        keys[key] = true;
        if (fn) fn();
      }
    }

    return this;
  }

  applySort(
    query: Knex.QueryInterface,
    { findParams: { sort }, params, tableName }: ApplySortInput
  ) {
    if (!sort?.length) return this;
    // console.log("Sort Fields:", sort);
    sort.forEach(({ name, direction, nullsLast }) => {
      // console.log("Sorting by:", { name, direction, nullsLast });
      const { name: fieldName, direction: fieldDirection } =
        this.formatFilterField({
          params,
          tableName,
          fname: name.toString(),
          value: 0,
          direction,
        });
      query.orderByRaw(
        `${fieldName} ${fieldDirection}${nullsLast ? " NULLS LAST" : ""}`
      );
    });

    return this;
  }

  applySelect(
    query: Knex.QueryInterface,
    { select, params, tableName }: ApplySelectInput
  ) {
    if (select?.length) {
      const fields = select.map(
        (it, i) =>
          this.formatFilterField({
            params,
            tableName,
            fname: it,
            value: 0,
            asName: `_${i}`,
          }).name
      );
      query.select(...fields.map((f) => this.knex.raw(f)));
    } else query.select(`${tableName}.*`);

    return this;
  }

  public build(
    query: Knex.QueryInterface,
    params: FindParams<TFindParams> | StatsParams
  ) {
    const tableName = this.tableName;
    this.applyJoins(query, {
      params,
      findParams: params,
    });

    this.applySelect(query, {
      params,
      tableName,
      select: params.select,
      findParams: params,
    });

    this.applyFilters(query, {
      params,
      tableName,
      filters: params.filter || [],
      findParams: params,
    });

    if (params.sort?.length)
      this.applySort(query, { params, tableName, findParams: params });
    else query.orderBy(`${tableName}.id`, "ASC");

    // if (params.first) query.limit(params.first);
    // query.offset(params.offset || parseOffsetFromCursor(params.after));

    return query;
  }
}

const applyFunctions = (
  fs: string[],
  fullFieldName: string,
  asName?: string
): string => {
  let name = fullFieldName;
  if (fs.length > 0) {
    for (let i = fs.length - 1; i >= 0; i--) {
      const f = fs[i];
      name = applyFunction(f, name);
    }
  }
  return `${name}${asName ? ` as "${asName}"` : ""}`;
};

const applyFunction = (f: string, fullFieldName: string): string => {
  switch (f) {
    case "count":
    case "max":
    case "min":
    case "sum":
    case "avg":
    case "date":
    case "unnest":
    case "upper":
    case "lower":
    case "trim":
    case "length":
      return `${f}(${fullFieldName})`;
    case "trunc_hour":
    case "trunc_day":
    case "trunc_week":
    case "trunc_month":
    case "trunc_year": {
      const fparts = f.split(/_/g);
      const truncType = fparts[1].toLowerCase();
      // PostgreSQL date truncation using date_trunc
      switch (truncType) {
        case "hour":
          return `date_trunc('hour', ${fullFieldName})`;
        case "day":
          return `date_trunc('day', ${fullFieldName})`;
        case "week":
          return `date_trunc('week', ${fullFieldName})`;
        case "month":
          return `date_trunc('month', ${fullFieldName})`;
        case "year":
          return `date_trunc('year', ${fullFieldName})`;
        default:
          throw new InvalidInputError(
            `Unsupported truncate type: ${truncType}`
          );
      }
    }
    case "count_distinct":
      return `count(distinct ${fullFieldName})`;
    case "random":
      return `RANDOM()`;
    case "agg":
      return `STRING_AGG(${fullFieldName}::text, ',')`;
    case "agg_distinct":
      return `STRING_AGG(DISTINCT ${fullFieldName}::text, ',')`;
    default: {
      if (f.startsWith("coalesce_")) {
        const fparts = f.split(/_/g);
        if (fparts.length > 1 && /^\d+$/.test(fparts[1]))
          return `COALESCE(${fullFieldName}, ${fparts[1]})`;
        return `COALESCE(${fullFieldName}, '')`;
      }
      if (f.startsWith("round_")) {
        const fparts = f.split(/_/g);
        if (fparts.length > 1 && /^\d+$/.test(fparts[1]))
          return `ROUND(${fullFieldName}, ${fparts[1]})`;
        return `ROUND(${fullFieldName})`;
      }
      if (f.startsWith("floor_")) {
        const fparts = f.split(/_/g);
        if (fparts.length > 1 && /^\d+$/.test(fparts[1]))
          return `FLOOR(${fullFieldName}::numeric, ${fparts[1]})`;
        return `FLOOR(${fullFieldName}::numeric)`;
      }
      if (f.startsWith("ceil_")) {
        const fparts = f.split(/_/g);
        if (fparts.length > 1 && /^\d+$/.test(fparts[1]))
          return `CEIL(${fullFieldName}::numeric, ${fparts[1]})`;
        return `CEIL(${fullFieldName}::numeric)`;
      }
      throw new InvalidInputError(`Unsupported function: ${f}`);
    }
  }
};
