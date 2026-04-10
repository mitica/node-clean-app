import { User, UserCreateData, UserData, UserUpdateData } from "../../domain/entity";
import { DbRepository } from "./db-repository";
import { UserRepository } from "../../domain/repository/user-repository";
import { IQueryBuilderFactory } from "./query/query-builder-factory";
import { type Knex } from "knex";
import { RepositoryReadOptions } from "../../domain";

export class UserDbRepository
  extends DbRepository<UserData, User, UserCreateData, UserUpdateData>
  implements UserRepository
{
  constructor(knex: Knex, queryBuilderFactory: IQueryBuilderFactory) {
    super(knex, queryBuilderFactory, User, {
      tableName: User.tableName(),
    });
  }

  async getByEmail(email: string, opt?: RepositoryReadOptions): Promise<User | null> {
    const item = await this.query(opt).where({ email }).first();
    return item ? this.toEntity(item) : null;
  }
}
