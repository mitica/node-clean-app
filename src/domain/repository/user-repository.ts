import { User, UserCreateData, UserData, UserUpdateData } from "../entity";
import { Repository, RepositoryReadOptions } from "./repository";

export interface UserRepository extends Repository<
  UserData,
  User,
  UserCreateData,
  UserUpdateData
> {
  getByEmail(email: string, opt?: RepositoryReadOptions): Promise<User | null>;
}
