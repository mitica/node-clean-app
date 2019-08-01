import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { IDomainContext } from "../../../context";
import { EntityId } from "../../../entities/base";

/**
 * Get a user by id.
 */
export class UserGetByIdUseCase<
  TContext extends IDomainContext = IDomainContext
> extends ContextUseCase<EntityId, User | null, TContext> {
  protected innerExecute(
    input: EntityId,
    context: Readonly<TContext>
  ): Promise<User | null> {
    return context.repo.user.getById(input);
  }
}
