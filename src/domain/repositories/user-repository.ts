import { IUser, UserWritableKeys, IUserCreate } from "../entities/user";
import { IRepository } from "./repository";

export interface IUserRepository<TEntity extends IUser = IUser, TCreate extends IUserCreate = IUserCreate, KSet extends keyof TEntity = UserWritableKeys> extends IRepository<TEntity, TCreate, KSet> {
  getByEmail(email: string): TEntity | null
}
