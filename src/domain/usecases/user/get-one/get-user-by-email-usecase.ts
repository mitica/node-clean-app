import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { DomainContext } from "../../../context";

/**
 * Get a user by email.
 */
export class GetUserByEmailUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<string, User | null, TContext> {
  protected innerExecute(
    input: string,
    context: Readonly<TContext>
  ): Promise<User | null> {
    return context.repo.user.getByEmail(input);
  }
}
