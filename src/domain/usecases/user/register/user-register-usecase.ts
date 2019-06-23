import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";
import {
  UserRegisterInput,
  UserRegisterInputValidator
} from "./user-register-input";

/**
 * Register user use case.
 */
export class UserRegisterUseCase extends BaseUseCase<UserRegisterInput, User> {
  constructor(protected readonly userRepository: UserRepository) {
    super(new UserRegisterInputValidator(userRepository));
    this.userRepository = userRepository;
  }

  protected async innerExecute(
    input: Readonly<UserRegisterInput>
  ): Promise<User> {
    return this.userRepository.create(input);
  }
}
