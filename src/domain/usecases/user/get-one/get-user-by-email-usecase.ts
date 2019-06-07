import { User } from "../../../entities/user/user";
import { BaseUseCase } from "../../usecase";
import { UserRepository } from "../../../repositories/user/user-repository";
import { ValidationError } from "../../../errors/validation-error";

export type GetUserByEmailData = {
  email: string;
};

/**
 * Get a user by email.
 */
export class GetUserByEmailUseCase extends BaseUseCase<
  GetUserByEmailData,
  User | null
> {
  constructor(protected readonly userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  protected innerExecute(input: Readonly<GetUserByEmailData>) {
    return this.userRepository.getByEmail(input.email);
  }

  protected async validateInputData(input: Readonly<GetUserByEmailData>) {
    if (!input || !input.email) {
      throw new ValidationError(`Invalid GetUserByEmail input data`, input);
    }
    return super.validateInputData(input);
  }
}
