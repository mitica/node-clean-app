import * as bcrypt from "bcryptjs";
import { User } from "../../../entities/user/user";
import {
  UserRegisterInput,
  UserRegisterInputValidator
} from "./user-register-input";
import { DomainContext } from "../../../context";
import { ContextUseCase } from "../../context-usecase";
import { EmailExistsError } from "../../../errors/validation-error";
import { UseCaseEvents } from "../../usecase";
import { DataValidator } from "../../../validators/data-validator";

export interface UserRegisterUseCaseEvents
  extends UseCaseEvents<UserRegisterInput, User> {
  emailExists: { input: Readonly<UserRegisterInput>; existingUser: User };
}

/**
 * Register user use case.
 */
export class UserRegisterUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<
  UserRegisterInput,
  User,
  TContext,
  UserRegisterUseCaseEvents
> {
  constructor(
    inputValidator: DataValidator<
      UserRegisterInput
    > = new UserRegisterInputValidator()
  ) {
    super(inputValidator);
  }

  protected async innerExecute(
    input: Readonly<UserRegisterInput>,
    context: Readonly<TContext>
  ): Promise<User> {
    const password = await bcrypt.hash(
      input.password,
      context.config.passwordSaltLength
    );

    return context.repo.user.create({ ...input, password });
  }

  async validateInput(input: Readonly<UserRegisterInput>, context: TContext) {
    const validatedInput = await super.validateInput(input, context);

    const existingUser = await context.repo.user.getByEmail(input.email);
    if (existingUser) {
      await this.onEmailExists(input, existingUser);
      throw new EmailExistsError(input.email);
    }

    return validatedInput;
  }

  protected async onEmailExists(
    input: Readonly<UserRegisterInput>,
    existingUser: User
  ) {
    return this.emit("emailExists", { input, existingUser });
  }
}
