import { AppContext } from "../../config";
import { BaseEntity, EntityData } from "../../domain/base";
import { User } from "../../domain/entity";
import { RepositoryEvents } from "../../domain/repository";
import { onUserUpdated } from "./user";

export async function onEntityUpdated<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
>(input: RepositoryEvents<TData, TEntity>["entityUpdated"]) {
  const ctx = input.opt?.ctx as AppContext;
  if (!ctx) return;

  const entity = input.entity;

  const promises: Promise<unknown>[] = [];
  if (entity instanceof User) {
    promises.push(onUserUpdated({ ...input, entity }, ctx));
  }

  await Promise.all(promises).catch(console.error);
}
