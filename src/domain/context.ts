import { RepositoryManager } from "./repositories/repository-manager";
import { UseCaseManager } from "./usecases/usecase-manager";
import { User } from "./entities/user/user";
import { DomainConfig } from "./config";

export interface DomainContext<TConfig extends DomainConfig = DomainConfig> {
  config: Readonly<TConfig>;
  repo: Readonly<RepositoryManager>;
  usecase: Readonly<UseCaseManager>;
}

export interface UserDomainContext<
  TUser extends User = User,
  TConfig extends DomainConfig = DomainConfig
> extends DomainContext<TConfig> {
  user: Readonly<TUser>;
}
