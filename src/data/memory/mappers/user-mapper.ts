import { User } from "../../../domain/entities/user/user";
import { UserCreateData } from "../../../domain/repositories/user/user-create-data";
import EntityMapper from "../../../domain/entities/entity-mapper";
import { MemoryUser } from "../entities/memory-user";
import { generate } from "shortid";
import { UserRole } from "../../../domain/entities/user/user-role";

export default class UserMapper
  implements EntityMapper<MemoryUser, User, UserCreateData> {
  toEntity(input: MemoryUser): User {
    const copy = { ...input };
    delete (copy as any)["$loki"];
    return new User(copy);
  }

  toSource(input: UserCreateData): MemoryUser {
    const required = {
      id: generate(),
      role: UserRole.USER,
      createdAt: new Date()
    };
    return { ...required, ...input };
  }
}
