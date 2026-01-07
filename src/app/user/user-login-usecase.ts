import * as bcrypt from "bcryptjs";
import { User } from "../../domain/entity";
import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config/app-context";
import { InvalidInputError, RequiredJSONSchema } from "../../domain/base";

export type UserLoginInput = {
  email: string;
  password: string;
};

/**
 * Login a user.
 */
export class UserLoginUseCase extends BaseUseCase<
  UserLoginInput,
  User,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<UserLoginInput>,
    ctx: AppContext
  ) {
    const email = input.email.toLowerCase().trim();
    const user = await ctx.repo.user.getByEmail(email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new InvalidInputError(`Invalid email or password`);
    }

    return ctx.repo.user.update(
      {
        id: user.id,
        lastLoginAt: new Date().toISOString()
      },
      { ctx }
    );
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 }
    },
    required: ["email", "password"],
    additionalProperties: false
  };
}
