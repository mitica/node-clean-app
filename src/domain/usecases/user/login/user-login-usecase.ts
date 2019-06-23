import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";

export type UserLoginInput = {
  email: string;
  password: string;
};

/**
 * Login a user.
 */
export class UserLoginUseCase extends BaseUseCase<UserLoginInput, User | null> {
  constructor(protected readonly userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<UserLoginInput>) {
    return this.userRepository.login(input.email, input.password);
  }
}
