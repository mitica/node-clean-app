import * as bcrypt from "bcryptjs";
import { User } from "../../../entities/user/user";
import { ContextUseCase } from "../../context-usecase";
import { DomainContext } from "../../../context";
import { UserLoginError } from "../../../errors/not-found-error";

export type UserLoginInput = {
  email: string;
  password: string;
};

/**
 * Login a user.
 */
export class UserLoginUseCase<
  TContext extends DomainContext = DomainContext
> extends ContextUseCase<UserLoginInput, User, TContext> {
  protected async innerExecute(
    input: Readonly<UserLoginInput>,
    context: Readonly<TContext>
  ) {
    const user = await context.repo.user.getByEmail(input.email);

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UserLoginError(input.email);
    }

    return context.repo.user.update({
      id: user.id,
      set: {
        lastLoginAt: new Date()
      }
    });
  }
}
