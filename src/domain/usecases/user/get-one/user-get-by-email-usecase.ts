import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { DomainContext } from "../../../context";

/**
 * Get a user by email.
 */
export class UserGetByEmailUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<string, User | null, TContext> {
  protected innerExecute(input: Readonly<string>, context: Readonly<TContext>) {
    return context.repo.user.getByEmail(input);
  }
}
