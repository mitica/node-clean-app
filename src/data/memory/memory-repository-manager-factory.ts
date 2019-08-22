import { RepositoryManagerFactory } from "../../domain/repositories/repository-manager-factory";
import { RepositoryManager } from "../../domain/repositories/repository-manager";
import { BaseRepositoryManager } from "../../domain/repositories/base-repository-manager";
import { UserMemoryRepository } from "./repositories/user-memory-repository";
import { DbCollectionName } from "./db/db-collection-name";

export default class MemoryRepositoryManagerFactory
  implements RepositoryManagerFactory {
  constructor(protected readonly db: Loki) {}
  create(): RepositoryManager {
    const user = new UserMemoryRepository(
      this.db.getCollection(DbCollectionName.USER)
    );
    const repo = new BaseRepositoryManager(user);

    return repo;
  }
}
