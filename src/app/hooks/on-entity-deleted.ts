import { AppContext } from "../../config";
import { User } from "../../domain";
import { BaseEntity, EntityData } from "../../domain/base";
import { RepositoryEvents } from "../../domain/repository";
import { onUserDeleted } from "./user";

export async function onEntityDeleted<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
>(input: RepositoryEvents<TData, TEntity>["entityDeleted"]) {
  const ctx = input.opt?.ctx as AppContext;
  if (!ctx) return;

  const entity = input.entity;

  const promises: Promise<unknown>[] = [];
  if (entity instanceof User) {
    promises.push(onUserDeleted({ ...input, entity }, ctx));
  }

  await Promise.all(promises).catch(console.error);
}
