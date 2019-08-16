import * as bcrypt from "bcryptjs";
import { User } from "../../../entities/user/user";
import { UserRegisterInput } from "./user-register-input";
import { DomainContext } from "../../../context";
import { ContextUseCase } from "../../context-usecase";

/**
 * Register user use case.
 */
export class UserRegisterUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<UserRegisterInput, User, TContext> {
  protected async innerExecute(
    input: Readonly<UserRegisterInput>,
    context: Readonly<TContext>
  ): Promise<User> {
    const password = await bcrypt.hash(input.password, 10);

    return context.repo.user.create({ ...input, password });
  }
}
