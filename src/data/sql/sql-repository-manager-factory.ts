import { RepositoryManagerFactory } from "../repository-manager-factory";
import { RepositoryManager } from "../../domain/repositories/repository-manager";
import { UserSqlRepository } from "./repositories/user-sql-repository";
import { BaseRepositoryManager } from "../../domain/repositories/base-repository-manager";

export default class SqlRepositoryManagerFactory
  implements RepositoryManagerFactory {
  create(): RepositoryManager {
    const user = new UserSqlRepository();
    const repo = new BaseRepositoryManager(user);

    return repo;
  }
}
