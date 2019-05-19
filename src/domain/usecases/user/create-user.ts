import { User, UserCreate } from "../../entities/user";
import { BaseUseCase } from "../usecase";
import { UserRepository } from "../../repositories/user-repository";

/**
 * Create user use case.
 */
export class CreateUserUseCase<
  TEntity extends User = User,
  TInput extends UserCreate = UserCreate
> extends BaseUseCase<TInput, TEntity> {
  protected readonly userRepository: UserRepository<TEntity, TInput>;
  constructor(userRepository: UserRepository<TEntity, TInput>) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<TInput>): Promise<TEntity> {
    return this.userRepository.create(input);
  }
}
