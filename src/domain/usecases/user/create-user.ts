import { User, UserCreate } from "../../entities/user";
import { BaseUseCase } from "../usecase";
import { UserRepository } from "../../repositories/user-repository";

/**
 * Create system user use case.
 */
export class CreateUserUseCase<
  TEntity extends User = User,
  TCreate extends UserCreate = UserCreate
> extends BaseUseCase<TCreate, TEntity> {
  protected readonly userRepository: UserRepository<TEntity, TCreate>;
  constructor(userRepository: UserRepository<TEntity, TCreate>) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(input: TCreate): Promise<TEntity> {
    return this.userRepository.create(input);
  }
}
