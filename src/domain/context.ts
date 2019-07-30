import { RepositoryManager } from "./repositories/repository-manager";
import { UseCaseManager } from "./usecases/usecase-manager";

export interface DomainContext {
  readonly repo: RepositoryManager;
  readonly usecase: UseCaseManager<this>;
}
