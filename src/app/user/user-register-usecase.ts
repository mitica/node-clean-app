import * as bcrypt from "bcryptjs";
import { User, UserCreateData, UserRole } from "../../domain/entity";
import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config";
import { DuplicationError, pick, RequiredJSONSchema } from "../../domain/base";
import { generateTokenPair, TokenPair } from "../../infra/services/jwt";

export type UserRegisterInput = Pick<UserCreateData, "email" | "name"> & {
  password: string;
};

export type UserRegisterOutput = {
  user: User;
  tokens: TokenPair;
};

export class UserRegisterUseCase extends BaseUseCase<
  UserRegisterInput,
  UserRegisterOutput,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<UserRegisterInput>,
    ctx: AppContext
  ): Promise<UserRegisterOutput> {
    const email = input.email.toLowerCase().trim();

    const existing = await ctx.repo.user.getByEmail(email);
    if (existing) {
      throw new DuplicationError(`A user with this email already exists`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await ctx.repo.user.create(
      {
        email,
        passwordHash,
        name: input.name.trim(),
        role: UserRole.USER,
        isEmailVerified: false,
      },
      { ctx }
    );

    const tokens = generateTokenPair(user.id, user.email, user.role);

    return { user, tokens };
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      ...pick(["email", "name"], User.jsonSchema.properties!),
      password: { type: "string", minLength: 6 },
    },
    required: ["email", "password", "name"],
    additionalProperties: false,
  };
}
