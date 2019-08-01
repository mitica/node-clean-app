import { IRepositoryManager } from "./repositories/repository-manager";
import { UseCaseManager } from "./usecases/usecase-manager";
import { User } from "./entities/user/user";
import { IDomainConfig } from "./config";

export interface IDomainContext<TConfig extends IDomainConfig = IDomainConfig> {
  config: Readonly<TConfig>;
  repo: Readonly<IRepositoryManager>;
  usecase: Readonly<UseCaseManager>;
}

export interface IUserDomainContext<
  TUser extends User = User,
  TConfig extends IDomainConfig = IDomainConfig
> extends IDomainContext<TConfig> {
  user: Readonly<TUser>;
}
