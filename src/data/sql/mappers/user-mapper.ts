import { User } from "../../../domain/entities/user/user";
import { UserSqlEntity } from "../entities/user-sql-entity";
import { UserCreateData } from "../../../domain/repositories/user/user-create-data";
import EntityMapper from "./entity-mapper";

export default class UserEntityMapper
  implements EntityMapper<User, UserSqlEntity, UserCreateData> {
  toEntity(input: UserSqlEntity): User {
    const { id, ...rest } = input;
    return new User({ id: String(id), ...rest });
  }

  fromCreate(input: UserCreateData): Partial<UserSqlEntity> {
    const { id, ...rest } = input;
    return { id: (id !== undefined && parseInt(id, 10)) || undefined, ...rest };
  }
}
