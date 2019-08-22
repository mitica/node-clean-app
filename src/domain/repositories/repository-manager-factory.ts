import { RepositoryManager } from "./repository-manager";

export interface RepositoryManagerFactory {
  create(): RepositoryManager;
}
