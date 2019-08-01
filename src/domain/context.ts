import { RepositoryManager } from "./repositories/repository-manager";
import { UseCaseManager } from "./usecases/usecase-manager";
import { User } from "./entities/user/user";
import { DomainConfig } from "./config";

export interface DomainContext {
  config: Readonly<DomainConfig>;
  repo: Readonly<RepositoryManager>;
  usecase: Readonly<UseCaseManager>;
}

export interface UserDomainContext extends DomainContext {
  user: Readonly<User>;
}
