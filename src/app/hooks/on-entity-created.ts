import { AppContext } from "../../config";
import { User } from "../../domain";
import { BaseEntity, EntityData } from "../../domain/base";
import { RepositoryEvents } from "../../domain/repository";

import { onUserCreated } from "./user";

export async function onEntityCreated<
  TData extends EntityData,
  TEntity extends BaseEntity<TData> = BaseEntity<TData>,
>({ entity, opt }: RepositoryEvents<TData, TEntity>["entityCreated"]) {
  const ctx = opt?.ctx as AppContext;
  if (!ctx) throw new Error("AppContext is required in opt.ctx");

  const promises: Promise<unknown>[] = [];
  if (entity instanceof User) {
    promises.push(onUserCreated({ entity, opt }, ctx));
  }

  await Promise.all(promises).catch(console.error);
}
