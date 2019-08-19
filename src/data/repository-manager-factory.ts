import { RepositoryManager } from "../domain/repositories/repository-manager";

export interface RepositoryManagerFactory {
  create(): RepositoryManager;
}
