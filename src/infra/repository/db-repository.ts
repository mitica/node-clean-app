import { NotFoundError, ValidationError } from "../../domain/base/errors";
import { JsonValidator } from "../../domain/base/validator";
import { EntityId } from "../../domain/base/types";
import {
  BaseRepository,
  BaseStatsParams,
  FindBaseParams,
  FindParams,
  RepositoryEvents,
  RepositoryReadOptions,
  RepositoryOptions,
  StatsData,
  StatsParams,
  RepositoryWriteOptions,
} from "../../domain/repository";
import {
  BaseEntity,
  EntityConstructor,
  EntityCreateData,
  EntityData,
  EntityUpdateData,
  parseOffsetFromCursor,
  camelCaseKeys,
  snakeCaseKeys,
} from "../../domain/base";
import { type Knex } from "knex";
import { IQueryBuilderFactory } from "./query/query-builder-factory";

export interface DbRepositoryOptions<
  TData extends EntityData,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
> extends RepositoryOptions<TCreate, TUpdate> {
  tableName?: string;
  isLangTable?: boolean;
}

export abstract class DbRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  TFindParams extends FindBaseParams = FindBaseParams,
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >,
  TOptions extends DbRepositoryOptions<TData, TCreate, TUpdate> =
    DbRepositoryOptions<TData, TCreate, TUpdate>,
> extends BaseRepository<
  TData,
  TEntity,
  TCreate,
  TUpdate,
  TFindParams,
  Events,
  TOptions
> {
  // protected readonly knex = dbWriter();
  protected readonly tableName: string;
  // protected readonly isLangTable: boolean;
  constructor(
    protected readonly knex: Knex,
    protected queryBuilderFactory: IQueryBuilderFactory,
    entityBuilder: EntityConstructor<TData, TEntity>,
    options?: DbRepositoryOptions<TData, TCreate, TUpdate>
  ) {
    super(entityBuilder, {
      createValidator: new JsonValidator(entityBuilder.jsonSchema),
      updateValidator: new JsonValidator({
        ...entityBuilder.jsonSchema,
        required: ["id"],
      }),
      isLangTable: options?.isLangTable,
      tableName: options?.tableName,
    } as never);

    this.tableName = options?.tableName || entityBuilder.tableName();
    // this.isLangTable = options?.isLangTable ?? false;
  }

  protected override getTableName() {
    return this.tableName;
  }

  override toEntity(data: TData): TEntity {
    return super.toEntity(
      camelCaseKeys(data as Record<string, unknown>) as TData
    );
  }

  protected getQueryBuilder() {
    return this.queryBuilderFactory.create<TFindParams>(this.getTableName());
  }

  protected query(opt?: RepositoryReadOptions) {
    const query = this.knex(this.getTableName());
    const r = opt?.trx ? query.transacting(opt?.trx as never) : query;
    (r as any).state = {};
    return r;
  }

  async transaction<T>(scope: (trx: unknown) => Promise<T> | void) {
    return this.knex.transaction<T>(scope);
  }

  protected toQuery(
    params: FindParams<TFindParams> | StatsParams,
    ops?: RepositoryReadOptions
  ) {
    return this.getQueryBuilder().build(this.query(ops), params);
  }

  async find(
    params: FindParams<TFindParams>,
    ops?: RepositoryReadOptions
  ): Promise<TEntity[]> {
    const query = this.toQuery(params, ops);
    const { first, after, offset } = params;

    if (first) query.limit(first);
    const rows = await query.offset(offset || parseOffsetFromCursor(after));

    return this.toEntities(rows);
  }

  async ids(
    params: FindParams<TFindParams>,
    ops?: RepositoryReadOptions
  ): Promise<EntityId[]> {
    const table = this.getTableName();
    const query = this.toQuery(params, ops)
      .clearSelect()
      .select(`"${table}".id`);
    const { first, after, offset } = params;

    if (first) query.limit(first);
    const rows = await query.offset(offset || parseOffsetFromCursor(after));

    return rows.map((it: { id: string }) => it.id);
  }

  async count(
    params: TFindParams,
    ops?: RepositoryReadOptions
  ): Promise<number> {
    const tableName = this.getTableName();
    const query = this.query(ops);
    const builder = this.getQueryBuilder();
    builder.applyJoins(query, { params, findParams: params });
    builder.applyFilters(query, {
      params,
      tableName,
      filters: params.filter || [],
      findParams: params,
    });

    const rows = await this.knex
      .queryBuilder()
      .with("t", query)
      .select(this.knex.raw('count(*) as "count"'))
      .from("t");

    return rows[0].count as number;
  }

  override async statsList(
    params: StatsParams,
    ops?: RepositoryReadOptions
  ): Promise<StatsData[]> {
    const query = this.toQuery(params, ops);

    const { first, offset } = params;

    if (first) query.limit(first);
    if (params.group?.length) query.groupByRaw(`${params.group.join(",")}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await query.offset(offset || 0);

    return rows.map<StatsData>((row) => ({ values: Object.values(row) }));
  }

  override async statsCount(
    params: BaseStatsParams,
    ops?: RepositoryReadOptions
  ): Promise<number> {
    const table = this.getTableName();
    const query = this.query(ops);
    const builder = this.getQueryBuilder();
    builder.applyJoins(query, { params, findParams: params });
    builder.applyFilters(query, {
      params,
      tableName: table,
      filters: params.filter || [],
      findParams: params,
    });

    if (params.group?.length) query.groupByRaw(`${params.group.join(",")}`);

    const row = await this.knex
      .queryBuilder()
      .with("t", query)
      .select(this.knex.raw('count(*) as "count"'))
      .from("t")
      .first();

    return row.count as number;
  }

  async deleteByIds(
    ids: EntityId[],
    ops: RepositoryWriteOptions
  ): Promise<number> {
    const items = await this.query(ops)
      .whereIn("id", ids)
      .delete()
      .returning("*");
    return this.onDeletedItems(items, ops);
  }

  protected async innerDelete(
    id: EntityId,
    opt: RepositoryWriteOptions
  ): Promise<TEntity | null> {
    const [item] = await this.query(opt).where({ id }).delete().returning("*");
    const entity = item ? this.toEntity(item) : null;
    if (entity) {
      await this.onDeleted(entity, opt);
    }
    return entity;
  }

  protected async innerCreate(
    data: TCreate,
    opt: RepositoryWriteOptions
  ): Promise<TEntity> {
    // if ("coordinates" in data && Array.isArray(data.coordinates)) {
    //   data.coordinates = this.knex.raw("POINT(?, ?)", data.coordinates);
    // } else if (
    //   "inputCoordinates" in data &&
    //   Array.isArray(data.inputCoordinates)
    // ) {
    //   data.inputCoordinates = this.knex.raw(
    //     "POINT(?, ?)",
    //     data.inputCoordinates
    //   );
    // } else if ("vector" in data && Array.isArray(data.vector)) {
    //   data.vector = this.knex.raw("(?::vector)", `[${data.vector.join(",")}]`);
    // }
    const inputData = this.toInputData(data);
    const [item] = await this.query(opt).insert(inputData).returning("*");
    const entity = item ? this.toEntity(item) : null;
    if (!entity) {
      throw new ValidationError("Failed to insert entity: no id returned", {
        data,
      });
    }

    return entity;
  }

  protected async innerUpdate(
    data: TUpdate,
    opt: RepositoryWriteOptions
  ): Promise<TEntity> {
    const { id, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData = rest as any;

    delete updateData["createdAt"];
    delete updateData["updatedAt"];

    if (Object.keys(updateData).length === 0)
      throw new ValidationError(`Update data is empty!`, { data });

    // if ("coordinates" in updateData && Array.isArray(updateData.coordinates)) {
    //   updateData.coordinates = this.knex.raw(
    //     "POINT(?, ?)",
    //     updateData.coordinates
    //   );
    // } else if (
    //   "inputCoordinates" in updateData &&
    //   Array.isArray(updateData.inputCoordinates)
    // ) {
    //   updateData.inputCoordinates = this.knex.raw(
    //     "POINT(?, ?)",
    //     updateData.inputCoordinates
    //   );
    // } else if ("vector" in updateData && Array.isArray(updateData.vector)) {
    //   updateData.vector = this.knex.raw(
    //     "(?::vector)",
    //     `[${updateData.vector.join(",")}]`
    //   );
    // }

    const inputData = this.toInputData(updateData);
    const [item] = await this.query(opt)
      .where({ id })
      .update(inputData)
      .returning("*");
    const entity = item ? this.toEntity(item) : null;
    if (!entity) {
      throw new NotFoundError(
        `Entity ${this.tableName} with id ${id} not found!`
      );
    }

    return entity;
  }

  public async findById(
    id: EntityId,
    opt?: RepositoryReadOptions
  ): Promise<TEntity | null> {
    const model = await this.query(opt).where({ id }).first();

    return model ? this.toEntity(model) : null;
  }

  async existsById(id: EntityId, opt?: RepositoryReadOptions) {
    const model = await this.query(opt).where({ id }).select("id").first();

    return !!model;
  }

  public async findByIds(
    ids: EntityId[],
    opt?: RepositoryReadOptions
  ): Promise<TEntity[]> {
    if (ids.length === 0) return [];

    const models = await this.query(opt).whereIn("id", ids);

    return this.toEntities(models);
  }

  public async deleteAll(opt: RepositoryWriteOptions): Promise<number> {
    const items = await this.query(opt).delete().returning("*");
    return this.onDeletedItems(this.toEntities(items), opt);
  }

  public async totalCount(opt?: RepositoryReadOptions): Promise<number> {
    return this.query(opt).count("id");
  }

  public async getAllIds(opt?: RepositoryReadOptions): Promise<EntityId[]> {
    return this.query(opt)
      .select<{ id: EntityId }[]>("id")
      .then((rows) => rows.map((it) => it.id));
  }

  protected async onDeletedItems(
    items: TEntity[],
    opt: RepositoryWriteOptions
  ) {
    await Promise.all(items.map((item) => this.onDeleted(item, opt)));
    return items.length;
  }

  protected toInputData<T extends object>(data: T): T {
    return snakeCaseKeys(data as Record<string, unknown>) as T;
  }
}
