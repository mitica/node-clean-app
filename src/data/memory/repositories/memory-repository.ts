import {
  RepositoryUpdateData,
  RepositoryEvents
} from "../../../domain/repositories/repository";
import { EntityData, EntityId } from "../../../domain/entities/entity-data";
import { Entity } from "../../../domain/entities/entity";
import { BaseRepository } from "../../../domain/repositories/base-repository";
import { NotFoundError } from "../../../domain/errors/not-found-error";
import EntityMapper from "../../../domain/entities/entity-mapper";
import { MemoryEntity } from "../entities/memory-entity";
import { Collection } from "lokijs";

export abstract class MemoryRepository<
  TMemoryEntity extends MemoryEntity,
  TEntityData extends EntityData,
  TEntity extends Entity<TEntityData>,
  TCreate,
  KSet extends keyof TEntityData,
  TUpdate extends RepositoryUpdateData<
    TEntityData,
    KSet
  > = RepositoryUpdateData<TEntityData, KSet>,
  Events extends RepositoryEvents<TEntityData, TEntity> = RepositoryEvents<
    TEntityData,
    TEntity
  >
> extends BaseRepository<TEntityData, TEntity, TCreate, KSet, TUpdate, Events> {
  constructor(
    protected readonly collection: Collection<TMemoryEntity>,
    protected readonly mapper: EntityMapper<TMemoryEntity, TEntity, TCreate>
  ) {
    super();
  }

  async innerCreate(data: Readonly<TCreate>): Promise<TEntity> {
    const created = this.collection.insertOne(this.mapper.toSource(data));
    if (!created) {
      throw new Error(`Not created entity: ${data}`);
    }

    return this.mapper.toEntity(created);
  }

  async innerUpdate(data: Readonly<TUpdate>): Promise<TEntity> {
    const { id } = data;
    const dbItem = this.collection.by("id", id);
    if (!dbItem) {
      throw new NotFoundError(`Not found entity with id ${id}`, id);
    }
    const setData = { updatedAt: new Date(), ...data.set };
    Object.assign(dbItem, setData);
    if (data.delete && data.delete.length) {
      data.delete.forEach(key => delete (dbItem as any)[key]);
    }
    return this.mapper.toEntity(dbItem);
  }

  async innerDelete(id: EntityId): Promise<TEntity | null> {
    const item = this.collection.by("id", id);
    if (!item) return null;
    this.collection.remove(item);
    return this.mapper.toEntity(item);
  }

  async getById(id: EntityId): Promise<TEntity | null> {
    const item = this.collection.by("id", id);
    if (item) {
      return this.mapper.toEntity(item);
    }
    return null;
  }

  async deleteStorage(): Promise<void> {
    this.collection.removeDataOnly();
  }
  async createStorage(): Promise<void> {}
}
