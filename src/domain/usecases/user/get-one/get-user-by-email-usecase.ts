import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";

/**
 * Get a user by email.
 */
export class GetUserByEmailUseCase extends BaseUseCase<string, User | null> {
  constructor(protected readonly userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(email: string) {
    return this.userRepository.getByEmail(email);
  }
}
