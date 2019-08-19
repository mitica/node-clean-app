import { User } from "../../entities/user/user";
import { Repository } from "../repository";
import { UserCreateData } from "./user-create-data";
import { UserData, UserWritableKeys } from "../../entities/user/user-data";

export interface UserRepository<
  TData extends UserData = UserData,
  TEntity extends User<TData> = User<TData>,
  TCreateData extends UserCreateData = UserCreateData,
  KSet extends UserWritableKeys = UserWritableKeys
> extends Repository<TData, TEntity, TCreateData, KSet> {
  getByEmail(email: string): Promise<TEntity | null>;
}
