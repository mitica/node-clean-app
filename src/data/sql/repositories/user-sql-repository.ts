import { SqlRepository } from "./sql-repository";
import { UserSqlEntity } from "../entities/user-sql-entity";
import UserModel from "../models/user-model";
import {
  UserData,
  UserWritableKeys
} from "../../../domain/entities/user/user-data";
import { User } from "../../../domain/entities/user/user";
import { UserCreateData } from "../../../domain/repositories/user/user-create-data";
import { UserRepository } from "../../../domain/repositories/user/user-repository";
import UserEntityMapper from "../mappers/user-mapper";

export class UserSqlRepository
  extends SqlRepository<
    UserSqlEntity,
    UserModel,
    UserData,
    User,
    UserCreateData,
    UserWritableKeys
  >
  implements UserRepository {
  constructor() {
    super(UserModel, new UserEntityMapper());
  }
  async getByEmail(email: string): Promise<User | null> {
    const item = await this.model.query().findOne({ email });
    if (!item) return null;
    return this.mapper.toEntity(item.toData());
  }
}
