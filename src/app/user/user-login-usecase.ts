import * as bcrypt from "bcryptjs";
import { User } from "../../domain/entity";
import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config";
import { InvalidInputError, RequiredJSONSchema } from "../../domain/base";
import { generateTokenPair, TokenPair } from "../../infra/services/jwt";

export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserLoginOutput = {
  user: User;
  tokens: TokenPair;
};

/**
 * Login a user and return JWT tokens.
 */
export class UserLoginUseCase extends BaseUseCase<
  UserLoginInput,
  UserLoginOutput,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<UserLoginInput>,
    ctx: AppContext
  ): Promise<UserLoginOutput> {
    const email = input.email.toLowerCase().trim();
    const user = await ctx.repo.user.getByEmail(email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new InvalidInputError(`Invalid email or password`);
    }

    // Update last login timestamp
    const updatedUser = await ctx.repo.user.update(
      {
        id: user.id,
        lastLoginAt: new Date().toISOString()
      },
      { ctx }
    );

    // Generate JWT tokens
    const tokens = generateTokenPair(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role
    );

    return {
      user: updatedUser,
      tokens,
    };
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
