import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { IDomainContext } from "../../../context";

export type UserLoginInput = {
  email: string;
  password: string;
};

/**
 * Login a user.
 */
export class UserLoginUseCase<
  TContext extends IDomainContext = IDomainContext
> extends ContextUseCase<UserLoginInput, User | null, TContext> {
  protected innerExecute(
    input: Readonly<UserLoginInput>,
    context: Readonly<TContext>
  ) {
    return context.repo.user.login(input.email, input.password);
  }
}
