import { BaseEntity } from "./base";

export interface IOnEntityEvents<TEntity extends BaseEntity = BaseEntity>
  extends IOnEntityCreated<TEntity>,
    IOnEntityUpdated<TEntity>,
    IOnEntityDeleted<TEntity> {}

export interface IOnEntityCreated<TEntity extends BaseEntity = BaseEntity> {
  onEntityCreated(entity: TEntity): Promise<void>;
  onEntityCreated(entity: TEntity): void;
}

export interface IOnEntityUpdated<TEntity extends BaseEntity = BaseEntity> {
  onEntityUpdated(entity: TEntity): Promise<void>;
  onEntityUpdated(entity: TEntity): void;
}

export interface IOnEntityDeleted<TEntity extends BaseEntity = BaseEntity> {
  onEntityDeleted(entity: TEntity): Promise<void>;
  onEntityDeleted(entity: TEntity): void;
}
