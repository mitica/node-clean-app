import { User, UserWritableKeys } from "../../entities/user/user";
import { Repository } from "../repository";
import { UserCreateInput } from "./user-create-input";

export interface UserRepository<
  TEntity extends User = User,
  TCreateInput extends UserCreateInput = UserCreateInput,
  KSet extends UserWritableKeys = UserWritableKeys
> extends Repository<TEntity, TCreateInput, KSet> {
  getByEmail(email: string): TEntity | null;
}
