import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { IDomainContext } from "../../../context";

/**
 * Get a user by email.
 */
export class UserGetByEmailUseCase<
  TContext extends IDomainContext = IDomainContext
> extends ContextUseCase<string, User | null, TContext> {
  protected innerExecute(input: Readonly<string>, context: Readonly<TContext>) {
    return context.repo.user.getByEmail(input);
  }
}
