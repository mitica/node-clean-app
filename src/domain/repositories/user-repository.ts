import { User, UserWritableKeys, UserCreate } from "../entities/user";
import { Repository } from "./repository";

export interface UserRepository<
  TEntity extends User = User,
  TCreate extends UserCreate = UserCreate,
  KSet extends keyof TEntity = UserWritableKeys
> extends Repository<TEntity, TCreate, KSet> {
  getByEmail(email: string): TEntity | null;
}
