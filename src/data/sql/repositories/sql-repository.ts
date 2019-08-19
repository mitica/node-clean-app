import {
  RepositoryUpdateData,
  RepositoryEvents
} from "../../../domain/repositories/repository";
import { EntityData, EntityId } from "../../../domain/entities/entity-data";
import { Entity } from "../../../domain/entities/entity";
import { BaseRepository } from "../../../domain/repositories/base-repository";
import { ModelClass } from "objection";
import BaseModel from "../models/base-model";
import { NotFoundError } from "../../../domain/errors/not-found-error";
import { BaseSqlEntity } from "../entities/base-sql-entity";
import EntityMapper from "../mappers/entity-mapper";

export abstract class SqlRepository<
  TDataEntity extends BaseSqlEntity,
  TModel extends BaseModel<TDataEntity>,
  TData extends EntityData,
  TEntity extends Entity<TData>,
  TCreate,
  KSet extends keyof TData,
  TUpdate extends RepositoryUpdateData<TData, KSet> = RepositoryUpdateData<
    TData,
    KSet
  >,
  Events extends RepositoryEvents<TData, TEntity> = RepositoryEvents<
    TData,
    TEntity
  >
> extends BaseRepository<TData, TEntity, TCreate, KSet, TUpdate, Events> {
  constructor(
    protected readonly model: ModelClass<TModel>,
    protected readonly mapper: EntityMapper<TEntity, TDataEntity, TCreate>
  ) {
    super();
  }

  async innerCreate(data: Readonly<TCreate>): Promise<TEntity> {
    const created = await this.model
      .query()
      .insertAndFetch(this.mapper.fromCreate(data) as any)
      .first();

    if (!created) {
      throw new Error(`Not created entity: ${data}`);
    }

    return this.mapper.toEntity(created.toData());
  }

  async innerUpdate(data: Readonly<TUpdate>): Promise<TEntity> {
    const { id } = data;
    const updated = await this.model
      .query()
      .updateAndFetchById(id, data.set || ({} as any));
    if (!updated) {
      throw new NotFoundError(`Entity with id ${id} not found.`);
    }
    return this.mapper.toEntity(updated.toData());
  }

  async innerDelete(id: EntityId): Promise<TEntity | null> {
    const item = await this.model.query().findById(id);
    if (!item) return null;
    return this.mapper.toEntity(item.toData());
  }

  async getById(id: EntityId): Promise<TEntity | null> {
    const item = await this.model.query().findById(id);
    if (item) {
      return this.mapper.toEntity(item.toData());
    }
    return null;
  }

  async deleteStorage(): Promise<void> {}
  async createStorage(): Promise<void> {}
}
