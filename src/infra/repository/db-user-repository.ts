import {
  User,
  UserCreateData,
  UserData,
  UserUpdateData,
} from "../../domain/entity";
import { DbRepository } from "./db-repository";
import { UserRepository } from "../../domain/repository/user-repository";

export class UserDbRepository
  extends DbRepository<UserData, User, UserCreateData, UserUpdateData>
  implements UserRepository
{
  constructor() {
    super(User, {
      tableName: "users",
    });
  }

  async getByEmail(email: string): Promise<User | null> {
    const item = await this.query().where({ email }).first();
    return item ? this.toEntity(item) : null;
  }
}
