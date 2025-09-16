import { NotFoundError, ValidationError } from "../../domain/base/errors";
import { JsonValidator } from "../../domain/base/validator";
import { EntityId } from "../../domain/base/types";
import {
  BaseRepository,
  RepositoryEvents,
  RepositoryMethodOptions,
  RepositoryOptions
} from "../../domain/repository";
import {
  BaseEntity,
  EntityConstructor,
  EntityCreateData,
  EntityData,
  EntityUpdateData
} from "../../domain/base";
import { dbInstance } from "../database/db";

export interface DbRepositoryOptions<
  TData extends EntityData,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>
> extends RepositoryOptions<TCreate, TUpdate> {
  tableName?: string;
  isLangTable?: boolean;
}

export abstract class DbRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >,
  TMOptions extends RepositoryMethodOptions = RepositoryMethodOptions,
  TOptions extends DbRepositoryOptions<
    TData,
    TCreate,
    TUpdate
  > = DbRepositoryOptions<TData, TCreate, TUpdate>
> extends BaseRepository<
  TData,
  TEntity,
  TCreate,
  TUpdate,
  Events,
  TMOptions,
  TOptions
> {
  protected readonly knex = dbInstance();
  protected readonly tableName: string;
  // protected readonly isLangTable: boolean;
  constructor(
    entityBuilder: EntityConstructor<TData, TEntity>,
    options?: DbRepositoryOptions<TData, TCreate, TUpdate>
  ) {
    super(entityBuilder, {
      createValidator: new JsonValidator(entityBuilder.jsonSchema),
      updateValidator: new JsonValidator({
        ...entityBuilder.jsonSchema,
        required: ["id"]
      }),
      isLangTable: options?.isLangTable,
      tableName: options?.tableName
    } as never);

    this.tableName = options?.tableName || entityBuilder.tableName();
    // this.isLangTable = options?.isLangTable ?? false;
  }

  protected override getTableName() {
    return this.tableName;
  }

  protected query(opt?: TMOptions) {
    const query = this.knex(this.getTableName());
    const r = opt?.trx ? query.transacting(opt?.trx as never) : query;
    (r as any).state = {};
    return r;
  }

  async transaction<T>(scope: (trx: unknown) => Promise<T> | void) {
    return this.knex.transaction<T>(scope);
  }

  async deleteByIds(ids: EntityId[], ops: TMOptions): Promise<number> {
    const items = await this.query(ops)
      .whereIn("id", ids)
      .delete()
      .returning("*");
    return this.onDeletedItems(items, ops);
  }

  protected async innerDelete(
    id: EntityId,
    opt: TMOptions
  ): Promise<TEntity | null> {
    const result = await this.query(opt).where({ id }).delete().returning("*");

    return result.length ? this.toEntity(result[0]) : null;
  }

  protected async innerCreate(data: TCreate, opt: TMOptions): Promise<TEntity> {
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
    const model = await this.query(opt).insert(data).returning("*");

    return this.toEntity(model[0]);
  }

  protected async innerUpdate(data: TUpdate, opt: TMOptions): Promise<TEntity> {
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

    updateData.updatedAt = new Date().toISOString();
    const model = await this.query(opt)
      .where({ id })
      .update(updateData)
      .returning("*");

    if (!model.length) {
      throw new NotFoundError(
        `Entity ${this.tableName} with id ${id} not found!`
      );
    }

    return this.toEntity(model[0]);
  }

  public async findById(
    id: EntityId,
    opt?: TMOptions
  ): Promise<TEntity | null> {
    const model = await this.query(opt).where({ id }).first();

    return model ? this.toEntity(model) : null;
  }

  async existsById(id: EntityId, opt?: TMOptions) {
    const model = await this.query(opt).where({ id }).select("id").first();

    return !!model;
  }

  public async findByIds(ids: EntityId[], opt?: TMOptions): Promise<TEntity[]> {
    if (ids.length === 0) return [];

    const models = await this.query(opt).whereIn("id", ids);

    return this.toEntities(models);
  }

  public async deleteAll(opt: TMOptions): Promise<number> {
    const items = await this.query(opt).delete().returning("*");
    return this.onDeletedItems(items, opt);
  }

  public async totalCount(opt?: TMOptions): Promise<number> {
    return this.query(opt).count("id");
  }

  public async getAllIds(opt?: TMOptions): Promise<EntityId[]> {
    return this.query(opt)
      .select("id")
      .then((rows) => rows.map((it) => it.id));
  }

  protected async onDeletedItems(items: TEntity[], opt: TMOptions) {
    await Promise.all(items.map((item) => this.onDeleted(item, opt)));
    return items.length;
  }
}
