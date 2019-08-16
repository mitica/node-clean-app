import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { DomainContext } from "../../../context";
import { EntityId } from "../../../entities/entity-data";

/**
 * Get a user by id.
 */
export class UserGetByIdUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<EntityId, User | null, TContext> {
  protected innerExecute(
    input: EntityId,
    context: Readonly<TContext>
  ): Promise<User | null> {
    return context.repo.user.getById(input);
  }
}
