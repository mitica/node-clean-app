import { BaseUseCase } from "../../domain/usecase";
import { AppContext } from "../../config";
import { RequiredJSONSchema, UnauthorizedError } from "../../domain/base";
import { generateTokenPair, verifyRefreshToken, TokenPair } from "../../infra/services/jwt";

export type RefreshTokenInput = {
  refreshToken: string;
};

export type RefreshTokenOutput = {
  tokens: TokenPair;
};

/**
 * Refresh access token using a valid refresh token.
 * Returns a new token pair (both access and refresh tokens).
 */
export class RefreshTokenUseCase extends BaseUseCase<
  RefreshTokenInput,
  RefreshTokenOutput,
  AppContext
> {
  protected async innerExecute(
    input: Readonly<RefreshTokenInput>,
    ctx: AppContext
  ): Promise<RefreshTokenOutput> {
    const result = verifyRefreshToken(input.refreshToken);

    if (!result.valid) {
      if (result.error === "expired") {
        throw new UnauthorizedError("Refresh token has expired. Please login again.");
      }
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Verify the user still exists and is active
    const userId =
      typeof result.payload.sub === "string"
        ? parseInt(result.payload.sub, 10)
        : result.payload.sub;

    const user = await ctx.repo.user.checkById(userId);

    // Generate new token pair
    const tokens = generateTokenPair(user.id, user.email, user.role);

    return { tokens };
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      refreshToken: { type: "string", minLength: 1 },
    },
    required: ["refreshToken"],
    additionalProperties: false,
  };
}
