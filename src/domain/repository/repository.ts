import { IDomainEventBus } from "../base/event-bus";
import {
  DomainEventName,
  DomainEventPayload,
} from "../base/domain-event";
import {
  BaseEntity,
  DomainContext,
  EntityData,
  EntityId,
  Validator,
  EntityUpdateData,
  EntityCreateData,
  EntityConstructor,
  NotFoundError,
  omitFieldsByValue,
} from "../base";

export interface RepositoryMethodOptions {
  trx?: unknown;
  cache?: boolean;
  ctx?: DomainContext;
}

export interface Repository<
  TData extends EntityData = EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  TMOptions extends RepositoryMethodOptions = RepositoryMethodOptions
> {
  /**
   * Delete an entity by id.
   * @param id Entity id to be deleted
   */
  deleteById(id: EntityId, opt: TMOptions): Promise<TEntity | null>;

  /**
   * Delete an entity by ids.
   * @param ids Entities id to be deleted
   */
  deleteByIds(ids: EntityId[], opt: TMOptions): Promise<number>;

  /**
   * Create a new entity.
   * @param data Entity data
   */
  create(data: TCreate, opt: TMOptions): Promise<TEntity>;

  /**
   * Create name entities.
   * @param data Entity data
   */
  createMany(data: TCreate[], opt: TMOptions): Promise<TEntity[]>;

  /**
   * Find or create a new entity.
   * @param data Entity data
   */
  findOrCreate(data: TCreate, opt: TMOptions): Promise<TEntity>;

  findOrCreateMany(data: TCreate[], opt: TMOptions): Promise<TEntity[]>;

  /**
   * Update an existing entity.
   * @param data Entity update data
   */
  update(data: TUpdate, opt: TMOptions): Promise<TEntity>;

  /**
   * Create or update an entity.
   * @param data Entity data
   */
  createOrUpdate(data: TCreate, opt: TMOptions): Promise<TEntity>;

  /**
   * Find unique entity.
   * @param data Entity data
   */
  findUnique(data: TCreate, opt?: TMOptions): Promise<TEntity | null>;

  /**
   * Get an entity by id.
   * @param id Entity id
   */
  findById(id: EntityId, opt?: TMOptions): Promise<TEntity | null>;

  /**
   * Check exists by id.
   * @param id Entity id
   */
  existsById(id: EntityId, opt?: TMOptions): Promise<boolean>;

  /**
   * Check entity by id.
   * @param id Entity id
   */
  checkById(id: EntityId, opt?: TMOptions): Promise<TEntity>;

  /**
   * Get an entitis by ids.
   * @param ids Entity ids
   */
  findByIds(ids: EntityId[], opt?: TMOptions): Promise<TEntity[]>;

  /**
   * Deletes all entities.
   */
  deleteAll(opt: TMOptions): Promise<number>;

  /**
   * Total items count
   */
  totalCount(opt?: TMOptions): Promise<number>;

  getAllIds(opt?: TMOptions): Promise<EntityId[]>;

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
 * 
 * Subclasses must:
 * 1. Define event names via `getEventPrefix()` (e.g., "user" → "user:created")
 * 2. Register events in DomainEventRegistry via declaration merging
 * 3. Pass the event bus singleton to the constructor
 */
export abstract class BaseRepository<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
  TCreate extends EntityCreateData<EntityData> = EntityCreateData<TData>,
  TUpdate extends EntityUpdateData<TData> = EntityUpdateData<TData>,
  TMOptions extends RepositoryMethodOptions = RepositoryMethodOptions,
  TOptions extends RepositoryOptions<TCreate, TUpdate> = RepositoryOptions<
    TCreate,
    TUpdate
  >
> implements Repository<TData, TEntity, TCreate, TUpdate>
{
  protected readonly options: Readonly<TOptions>;

  public constructor(
    protected entityBuilder: EntityConstructor<TData, TEntity>,
    protected eventBus: IDomainEventBus,
    options: TOptions
  ) {
    this.options = { ...options };
  }

  /**
   * Override to provide entity name prefix for events.
   * E.g., "user" will emit "user:created", "user:updated", etc.
   */
  protected abstract getEventPrefix(): string;

  abstract existsById(id: EntityId, opt?: TMOptions): Promise<boolean>;

  abstract transaction<T>(
    scope: (trx: unknown) => Promise<T> | void
  ): Promise<T>;
  abstract deleteByIds(ids: EntityId[], opt: TMOptions): Promise<number>;

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

  async checkById(id: EntityId, opt?: TMOptions): Promise<TEntity> {
    const entity = await this.findById(id, {
      ...opt,
      cache: false,
    } as TMOptions);
    if (!entity)
      throw new NotFoundError(`${this.getEntityName()} ${id} not found!`);
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

  public async deleteById(id: EntityId, opt: TMOptions) {
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
    opt: TMOptions
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

  public async create(data: TCreate, opt: TMOptions): Promise<TEntity> {
    data = await this.preCreate(data);
    const entity = await this.innerCreate(data, opt);

    await this.onCreated(entity, opt);

    return entity;
  }

  public async createMany(data: TCreate[], opt: TMOptions): Promise<TEntity[]> {
    return Promise.all(data.map((item) => this.create(item, opt)));
  }

  protected abstract innerCreate(
    data: TCreate,
    opt?: TMOptions
  ): Promise<TEntity>;

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

  public async update(data: TUpdate, opt: TMOptions): Promise<TEntity> {
    data = await this.preUpdate(data);
    const entity = await this.innerUpdate(data, opt);

    await this.onUpdated(entity, data, opt);

    return entity;
  }

  protected abstract innerUpdate(
    data: TUpdate,
    opt: TMOptions
  ): Promise<TEntity>;
  public abstract findById(
    id: EntityId,
    opt?: TMOptions
  ): Promise<TEntity | null>;
  public abstract findByIds(
    ids: EntityId[],
    opt?: TMOptions
  ): Promise<TEntity[]>;

  public async findUnique(
    data: TCreate,
    opt?: TMOptions
  ): Promise<TEntity | null> {
    return data.id
      ? this.findById(data.id, { ...opt, cache: false } as TMOptions)
      : null;
  }

  public async findOrCreate(data: TCreate, opt: TMOptions) {
    const existingEntity = await this.findUnique(data, opt);
    return existingEntity ? existingEntity : await this.create(data, opt);
  }

  async findOrCreateMany(data: TCreate[], opt: TMOptions): Promise<TEntity[]> {
    const output: TEntity[] = [];
    for (const item of data) {
      output.push(await this.findOrCreate(item, opt));
    }
    return output;
  }

  public async createOrUpdate(data: TCreate, opt: TMOptions): Promise<TEntity> {
    const exists = await this.findUnique(data);
    if (exists) {
      return exists.dataIsEqual(data)
        ? exists
        : this.update({ ...data, id: exists.id } as never, opt);
    }

    return this.create(data, opt);
  }

  public abstract deleteAll(opt: TMOptions): Promise<number>;
  public abstract totalCount(opt?: TMOptions): Promise<number>;
  public abstract getAllIds(opt?: TMOptions): Promise<EntityId[]>;

  /**
   * Fire entity created event.
   * Event name: `${prefix}:created`
   */
  protected async onCreated(entity: TEntity, opt: TMOptions) {
    const eventName = `${this.getEventPrefix()}:created` as DomainEventName;
    return this.eventBus.emit(eventName, { entity, opt } as unknown as DomainEventPayload<typeof eventName>);
  }

  /**
   * Fire entity deleted event.
   * Event name: `${prefix}:deleted`
   */
  protected async onDeleted(entity: TEntity, opt: TMOptions) {
    const eventName = `${this.getEventPrefix()}:deleted` as DomainEventName;
    return this.eventBus.emit(eventName, { entity, opt } as unknown as DomainEventPayload<typeof eventName>);
  }

  /**
   * Fire entity updated event.
   * Event name: `${prefix}:updated`
   */
  protected async onUpdated(entity: TEntity, data: TUpdate, opt: TMOptions) {
    const eventName = `${this.getEventPrefix()}:updated` as DomainEventName;
    return this.eventBus.emit(eventName, { entity, data, opt } as unknown as DomainEventPayload<typeof eventName>);
  }

  /**
   * Fire pre-delete event.
   * Event name: `${prefix}:preDelete`
   */
  protected async onPreDelete(id: EntityId) {
    const eventName = `${this.getEventPrefix()}:preDelete` as DomainEventName;
    return this.eventBus.emit(eventName, id as unknown as DomainEventPayload<typeof eventName>);
  }
}
