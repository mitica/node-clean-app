import { DomainContext } from "../../domain/context";
import {
  BaseEntity,
  EntityData,
  EntityId,
  TypedEventEmitter,
  Validator,
  EntityUpdateData,
  EntityCreateData,
  EntityConstructor,
  NotFoundError,
  omitFieldsByValue,
  FilterField,
  SortBy,
  PaginationParams,
  CursorPage,
  createCursorPage,
  CursorPageParams,
} from "../base";

export interface BaseFilterParams<FEType extends string = string, SEType extends string = string> {
  filter?: FilterField<FEType>[];
  select?: SEType[];
  user?: UserFilterParams;
}

export interface BaseStatsParams<
  FEType extends string = string,
  SEType extends string = string,
> extends BaseFilterParams<FEType> {
  select: SEType[];
  group?: number[];
}

export interface StatsParams<
  FEType extends string = string,
  SEType extends string = string,
> extends BaseStatsParams<FEType, SEType> {
  first: number;
  offset?: number;
  sort?: SortBy<number>[];
}

export interface CursorStatsParams<FEType extends string = string, SEType extends string = string>
  extends StatsParams<FEType, SEType>, CursorPageParams {}

export type StatsPropValue = string | number;

export interface StatsData {
  values: StatsPropValue[];
}

export interface UserSuggestedParams {
  userId: string;
  lang: string;
  coordinates?: number[];
}

export interface UserFilterParams {
  userId?: string;
  lang: string;
  coordinates?: number[];
  visitorId?: string;
}

export interface FindBaseParams<T extends string = string> extends BaseFilterParams<T> {
  sort?: SortBy<T | number>[];
  user?: UserFilterParams;
}

export type FindParams<T extends FindBaseParams = FindBaseParams> = T & PaginationParams;

export interface RepositoryEvents<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
> {
  entityCreated: { entity: TEntity; opt?: RepositoryReadOptions };
  entityUpdated: {
    entity: TEntity;
    data: TUpdate;
    opt?: RepositoryReadOptions;
  };
  entityDeleted: { entity: TEntity; opt?: RepositoryReadOptions };
  preEntityDelete: EntityId;
}

export interface RepositoryReadOptions<TCtx extends DomainContext = DomainContext> {
  trx?: unknown;
  cache?: boolean;
  ctx?: TCtx;
}

export interface RepositoryWriteOptions<
  TCtx extends DomainContext = DomainContext,
> extends RepositoryReadOptions<TCtx> {
  ctx: TCtx;
}

export interface Repository<
  TData extends EntityData = EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  TFindParams extends FindBaseParams = FindBaseParams,
  TEvents extends RepositoryEvents<TData, TEntity> = RepositoryEvents<TData, TEntity, TUpdate>,
> extends TypedEventEmitter<TEvents> {
  statsList(params: StatsParams): Promise<StatsData[]>;
  statsCount(params: BaseStatsParams): Promise<number>;
  statsCursor(params: CursorStatsParams): Promise<CursorPage<StatsData>>;
  find(params: FindParams<TFindParams>, opt?: RepositoryReadOptions): Promise<TEntity[]>;
  first(params: TFindParams, opt?: RepositoryReadOptions): Promise<TEntity | null>;
  count(params: TFindParams, opt?: RepositoryReadOptions): Promise<number>;
  ids(params: FindParams<TFindParams>, opt?: RepositoryReadOptions): Promise<EntityId[]>;
  cursor(
    params: FindParams<TFindParams>,
    opt?: RepositoryReadOptions
  ): Promise<CursorPage<TEntity>>;
  generator(params: FindParams<TFindParams>, opt?: RepositoryReadOptions): AsyncGenerator<TEntity>;
  generatorList(
    params: FindParams<TFindParams>,
    opt?: RepositoryReadOptions
  ): AsyncGenerator<TEntity[]>;
  /**
   * Delete an entity by id.
   * @param id Entity id to be deleted
   */
  deleteById(id: EntityId, opt: RepositoryWriteOptions): Promise<TEntity | null>;

  /**
   * Delete an entity by ids.
   * @param ids Entities id to be deleted
   */
  deleteByIds(ids: EntityId[], opt: RepositoryWriteOptions): Promise<number>;

  // /**
  //  * Upsert an entity.
  //  * @param data Entity data
  //  */
  // upsert(data: TCreate, opt: TMOptions): Promise<TEntity>;

  // /**
  //  * Upsert many entities.
  //  * @param data Entity data
  //  */
  // upsertMany(data: TCreate[], opt: TMOptions): Promise<TEntity[]>;

  /**
   * Create a new entity.
   * @param data Entity data
   */
  create(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity>;

  /**
   * Create name entities.
   * @param data Entity data
   */
  createMany(data: TCreate[], opt: RepositoryWriteOptions): Promise<TEntity[]>;

  /**
   * Find or create a new entity.
   * @param data Entity data
   */
  findOrCreate(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity>;

  findOrCreateMany(data: TCreate[], opt: RepositoryWriteOptions): Promise<TEntity[]>;

  /**
   * Update an existing entity.
   * @param data Entity update data
   */
  update(data: TUpdate, opt: RepositoryWriteOptions): Promise<TEntity>;

  /**
   * Create or update an entity.
   * @param data Entity data
   */
  createOrUpdate(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity>;

  /**
   * Find unique entity.
   * @param data Entity data
   */
  findUnique(data: TCreate, opt?: RepositoryReadOptions): Promise<TEntity | null>;

  /**
   * Get an entity by id.
   * @param id Entity id
   */
  findById(id: EntityId, opt?: RepositoryReadOptions): Promise<TEntity | null>;

  /**
   * Check exists by id.
   * @param id Entity id
   */
  existsById(id: EntityId, opt?: RepositoryReadOptions): Promise<boolean>;

  /**
   * Check entity by id.
   * @param id Entity id
   */
  checkById(id: EntityId, opt?: RepositoryReadOptions): Promise<TEntity>;

  /**
   * Get an entitis by ids.
   * @param ids Entity ids
   */
  findByIds(ids: EntityId[], opt?: RepositoryReadOptions): Promise<TEntity[]>;

  /**
   * Deletes all entities.
   */
  deleteAll(opt: RepositoryWriteOptions): Promise<number>;

  /**
   * Total items count
   */
  totalCount(opt?: RepositoryReadOptions): Promise<number>;

  getAllIds(opt?: RepositoryReadOptions): Promise<EntityId[]>;

  /** create transaction */
  transaction<T>(scope: (trx: unknown) => Promise<T> | void): Promise<T>;
}

export interface RepositoryOptions<TCreate, TUpdate> {
  createValidator?: Validator<TCreate>;
  updateValidator?: Validator<TUpdate>;
  deleteValidator?: Validator<EntityId, boolean>;
}

/**
 * Base Repository class. All repository should extend this one.
 */
export abstract class BaseRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  TFindParams extends FindBaseParams = FindBaseParams,
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<TData, TEntity, TUpdate>,
  TOptions extends RepositoryOptions<TCreate, TUpdate> = RepositoryOptions<TCreate, TUpdate>,
>
  extends TypedEventEmitter<Events>
  implements Repository<TData, TEntity, TCreate, TUpdate, TFindParams, Events>
{
  protected readonly options: Readonly<TOptions>;

  public constructor(
    protected entityBuilder: EntityConstructor<TData, TEntity>,
    options: TOptions
  ) {
    super();
    this.options = { ...options };
  }

  abstract find(params: FindParams<TFindParams>, opt?: RepositoryReadOptions): Promise<TEntity[]>;
  abstract count(params: TFindParams, opt?: RepositoryReadOptions): Promise<number>;
  abstract ids(params: FindParams<TFindParams>, opt?: RepositoryReadOptions): Promise<EntityId[]>;
  abstract statsList(params: StatsParams, opt?: RepositoryReadOptions): Promise<StatsData[]>;
  abstract statsCount(params: BaseStatsParams, opt?: RepositoryReadOptions): Promise<number>;

  statsCursor(
    params: CursorStatsParams,
    opt?: RepositoryReadOptions
  ): Promise<CursorPage<StatsData>> {
    const { after, first, offset: _offset, ...countParams } = params;
    return createCursorPage<StatsData>(
      { after, first },
      () => this.statsCount(countParams, opt),
      () => this.statsList(params, opt)
    );
  }

  async first(params: TFindParams, opt?: RepositoryReadOptions) {
    const [one] = await this.find({ ...params, first: 1 }, opt);
    return one || null;
  }

  async *generator(
    params: FindParams<TFindParams>,
    opt?: RepositoryReadOptions
  ): AsyncGenerator<TEntity> {
    while (true) {
      const { edges, pageInfo } = await this.cursor(params, opt);
      for (const edge of edges) yield edge.node as TEntity;

      if (!pageInfo.hasNextPage || edges.length <= params.first) break;
    }
  }

  async *generatorList(params: FindParams<TFindParams>, opt?: RepositoryReadOptions) {
    while (true) {
      const { edges, pageInfo } = await this.cursor(params, opt);
      yield edges.map((edge) => edge.node as TEntity);

      if (!pageInfo.hasNextPage || edges.length <= params.first) break;
    }
  }

  cursor(
    params: FindParams<TFindParams>,
    opt?: RepositoryReadOptions
  ): Promise<CursorPage<TEntity>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { after, first, offset, ...countParams } = params;
    return createCursorPage<TEntity>(
      { after, first },
      () => this.count(countParams as never, opt),
      () => this.find(params, opt)
    );
  }

  abstract existsById(id: EntityId, opt?: RepositoryReadOptions): Promise<boolean>;

  abstract transaction<T>(scope: (trx: unknown) => Promise<T> | void): Promise<T>;
  abstract deleteByIds(ids: EntityId[], opt: RepositoryReadOptions): Promise<number>;

  getEntityName(): string {
    return this.entityBuilder.name;
  }

  toEntity(data: TData): TEntity {
    return new this.entityBuilder(data);
  }

  protected toEntities(data: TData[]) {
    return data.map((d) => this.toEntity(d));
  }

  protected getTableName(_input?: unknown): string {
    return this.getEntityName();
  }

  async checkById(id: EntityId, opt?: RepositoryReadOptions): Promise<TEntity> {
    const entity = await this.findById(id, {
      ...opt,
      cache: false,
    });
    if (!entity) throw new NotFoundError(`${this.getEntityName()} ${id} not found!`);
    return entity;
  }

  /**
   * Pre delete operations: validation, etc.
   * @param id Entity id
   */
  protected async preDelete(id: EntityId): Promise<boolean> {
    if (this.options.deleteValidator) {
      if (!(await this.options.deleteValidator.validate(id))) {
        return false;
      }
    }
    return true;
  }

  public async deleteById(id: EntityId, opt: RepositoryWriteOptions) {
    if (!(await this.preDelete(id))) {
      return null;
    }

    await this.onPreDelete(id);

    const entity = await this.innerDelete(id, opt);
    if (entity) await this.onDeleted(entity, opt);

    return entity;
  }

  protected abstract innerDelete(
    id: EntityId,
    opt: RepositoryWriteOptions
  ): Promise<TEntity | null>;

  /**
   * Pre create operations: validation, etc.
   * @param data Entity data
   */
  protected async preCreate(data: TCreate): Promise<TCreate> {
    if (this.options.createValidator) {
      data = await this.options.createValidator.validate(data);
    }
    return data;
  }

  public async create(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity> {
    data = await this.preCreate(data);
    const entity = await this.innerCreate(data, opt);

    await this.onCreated(entity, opt);

    return entity;
  }

  public async createMany(data: TCreate[], opt: RepositoryWriteOptions): Promise<TEntity[]> {
    return Promise.all(data.map((item) => this.create(item, opt)));
  }

  protected abstract innerCreate(data: TCreate, opt?: RepositoryWriteOptions): Promise<TEntity>;

  /**
   * Pre update operations: validation, etc.
   * @param data Entity data
   */
  protected async preUpdate(data: TUpdate): Promise<TUpdate> {
    data = omitFieldsByValue(data, [undefined]);
    if (this.options.updateValidator) {
      data = await this.options.updateValidator.validate(data);
    }
    return data;
  }

  public async update(data: TUpdate, opt: RepositoryWriteOptions): Promise<TEntity> {
    data = await this.preUpdate(data);
    const entity = await this.innerUpdate(data, opt);

    await this.onUpdated(entity, data, opt);

    return entity;
  }

  protected abstract innerUpdate(data: TUpdate, opt: RepositoryWriteOptions): Promise<TEntity>;
  public abstract findById(id: EntityId, opt?: RepositoryReadOptions): Promise<TEntity | null>;
  public abstract findByIds(ids: EntityId[], opt?: RepositoryReadOptions): Promise<TEntity[]>;

  public async findUnique(data: TCreate, opt?: RepositoryReadOptions): Promise<TEntity | null> {
    return data.id ? this.findById(data.id, { ...opt, cache: false }) : null;
  }

  public async findOrCreate(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity> {
    const existingEntity = await this.findUnique(data, opt);
    return existingEntity ? existingEntity : await this.create(data, opt);
  }

  async findOrCreateMany(data: TCreate[], opt: RepositoryWriteOptions): Promise<TEntity[]> {
    const output: TEntity[] = [];
    for (const item of data) {
      output.push(await this.findOrCreate(item, opt));
    }
    return output;
  }

  public async createOrUpdate(data: TCreate, opt: RepositoryWriteOptions): Promise<TEntity> {
    const exists = await this.findUnique(data);
    if (exists) {
      return exists.dataIsEqual(data)
        ? exists
        : this.update({ ...data, id: exists.id } as never, opt);
    }

    return this.create(data, opt);
  }

  public abstract deleteAll(opt: RepositoryWriteOptions): Promise<number>;
  public abstract totalCount(opt?: RepositoryReadOptions): Promise<number>;
  public abstract getAllIds(opt?: RepositoryReadOptions): Promise<EntityId[]>;

  /**
   * Fire entityCreated event.
   * @param entity Created entity
   */
  protected async onCreated(entity: TEntity, opt: RepositoryWriteOptions) {
    return this.emit("entityCreated", { entity, opt });
  }

  /**
   * Fire entityDeleted event.
   * @param entity Deleted entity
   */
  protected async onDeleted(entity: TEntity, opt: RepositoryWriteOptions) {
    return this.emit("entityDeleted", { entity, opt });
  }

  /**
   * Fire entityUpdated event.
   * @param entity Updated entity
   */
  protected async onUpdated(entity: TEntity, data: TUpdate, opt: RepositoryWriteOptions) {
    return this.emit("entityUpdated", { entity, data, opt });
  }

  /**
   * Fire preEntityDelete event.
   */
  protected async onPreDelete(id: EntityId) {
    return this.emit("preEntityDelete", id);
  }
}
