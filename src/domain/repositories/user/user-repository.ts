import { User, UserWritableKeys, IUserData } from "../../entities/user/user";
import { IRepository } from "../repository";
import { IUserCreateData } from "./user-create-data";

export interface IUserRepository<
  TData extends IUserData = IUserData,
  TEntity extends User<TData> = User<TData>,
  TCreateData extends IUserCreateData = IUserCreateData,
  KSet extends UserWritableKeys = UserWritableKeys
> extends IRepository<TData, TEntity, TCreateData, KSet> {
  getByEmail(email: string): Promise<TEntity | null>;
  login(email: string, password: string): Promise<TEntity | null>;
}
