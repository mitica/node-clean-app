import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";
import { CreateUserInput, CreateUserInputValidator } from "./create-user-input";

/**
 * Create user use case.
 */
export class CreateUserUseCase extends BaseUseCase<CreateUserInput, User> {
  protected readonly userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    super(new CreateUserInputValidator());
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<CreateUserInput>): Promise<User> {
    return this.userRepository.create(input);
  }
}
