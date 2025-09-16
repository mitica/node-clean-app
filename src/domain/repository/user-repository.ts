import { User, UserCreateData, UserData, UserUpdateData } from "../entity";
import { Repository } from "./repository";

export interface UserRepository
  extends Repository<UserData, User, UserCreateData, UserUpdateData> {
  getByEmail(email: string): Promise<User | null>;
}
