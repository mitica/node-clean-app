import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";
import { RegisterUserData, RegisterUserDataValidator } from "./register-user-data";

/**
 * Create user use case.
 */
export class RegisterUserUseCase extends BaseUseCase<RegisterUserData, User> {
  constructor(protected readonly userRepository: UserRepository) {
    super(new RegisterUserDataValidator());
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<RegisterUserData>): Promise<User> {
    return this.userRepository.create(input);
  }
}
