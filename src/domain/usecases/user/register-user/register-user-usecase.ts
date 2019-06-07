import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";
import {
  RegisterUserData,
  RegisterUserDataValidator
} from "./register-user-data";
import { EmailExistsError } from "../../../errors/validation-error";

/**
 * Register user use case.
 */
export class RegisterUserUseCase extends BaseUseCase<RegisterUserData, User> {
  constructor(protected readonly userRepository: UserRepository) {
    super(new RegisterUserDataValidator());
    this.userRepository = userRepository;
  }

  protected async innerExecute(
    input: Readonly<RegisterUserData>
  ): Promise<User> {
    const user = await this.userRepository.getByEmail(input.email);
    if (user) {
      throw new EmailExistsError(input.email);
    }

    return this.userRepository.create(input);
  }
}
