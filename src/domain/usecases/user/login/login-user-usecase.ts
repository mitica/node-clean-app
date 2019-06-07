import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";

export type LoginUserData = {
  email: string;
  password: string;
};

/**
 * Get a user by email.
 */
export class LoginUserUseCase extends BaseUseCase<LoginUserData, User | null> {
  constructor(protected readonly userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<LoginUserData>) {
    return this.userRepository.login(input.email, input.password);
  }
}
