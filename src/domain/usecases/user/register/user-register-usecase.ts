import { User } from "../../../entities/user/user";
import { UserRegisterInput } from "./user-register-input";
import { IDomainContext } from "../../../context";
import { ContextUseCase } from "../../context-usecase";

/**
 * Register user use case.
 */
export class UserRegisterUseCase<
  TContext extends IDomainContext = IDomainContext
> extends ContextUseCase<UserRegisterInput, User, TContext> {
  protected async innerExecute(
    input: Readonly<UserRegisterInput>,
    context: Readonly<TContext>
  ): Promise<User> {
    return context.repo.user.create(input);
  }
}
