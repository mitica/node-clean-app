import { MemoryRepository } from "./memory-repository";
import { MemoryUser } from "../entities/memory-user";
import {
  UserData,
  UserWritableKeys
} from "../../../domain/entities/user/user-data";
import { User } from "../../../domain/entities/user/user";
import { UserCreateData } from "../../../domain/repositories/user/user-create-data";
import { UserRepository } from "../../../domain/repositories/user/user-repository";
import UserMapper from "../mappers/user-mapper";

export class UserMemoryRepository
  extends MemoryRepository<
    MemoryUser,
    UserData,
    User,
    UserCreateData,
    UserWritableKeys
  >
  implements UserRepository {
  constructor(collection: Collection<MemoryUser>) {
    super(collection, new UserMapper());
  }
  async getByEmail(email: string): Promise<User | null> {
    const item = this.collection.by("email", email);
    return item ? this.mapper.toEntity(item) : null;
  }
}
