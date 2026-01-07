import { Hono } from "hono";
import { HonoEnv } from "../types";
import { asyncHandler } from "../middleware/error-handler";

/**
 * Auth Controller - Handles authentication endpoints.
 *
 * Endpoints:
 * - POST /login - Authenticate user and return JWT tokens
 * - POST /refresh - Refresh access token using refresh token
 * - POST /logout - Invalidate refresh token (client-side only for now)
 */
export class AuthController {
  private app: Hono<HonoEnv>;

  constructor() {
    this.app = new Hono<HonoEnv>();
    this.setupRoutes();
  }

  getRouter(): Hono<HonoEnv> {
    return this.app;
  }

  private setupRoutes(): void {
    // Login endpoint
    this.app.post("/login", asyncHandler(async (c) => {
      const ctx = c.get("requestContext");
      const body = await c.req.json<{ email: string; password: string }>();

      const result = await ctx.usecase.login.execute(
        {
          email: body.email,
          password: body.password,
        },
        ctx
      );

      return c.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        },
      });
    }));

    // Refresh token endpoint
    this.app.post("/refresh", asyncHandler(async (c) => {
      const ctx = c.get("requestContext");
      const body = await c.req.json<{ refreshToken: string }>();

      const result = await ctx.usecase.refreshToken.execute(
        { refreshToken: body.refreshToken },
        ctx
      );

      return c.json({
        success: true,
        data: {
          tokens: result.tokens,
        },
      });
    }));

    // Logout endpoint (client should discard tokens)
    // In a production app, you might want to maintain a token blacklist
    this.app.post("/logout", async (c) => {
      // For stateless JWT, logout is handled client-side by discarding tokens
      // In a more complex setup, you could add the token to a blacklist in Redis
      return c.json({
        success: true,
        message: "Logged out successfully. Please discard your tokens.",
      });
    });

    // Get current user info (requires authentication)
    this.app.get("/me", asyncHandler(async (c) => {
      const ctx = c.get("requestContext");

      if (!ctx.isAuthenticated || !ctx.currentUser) {
        return c.json(
          {
            success: false,
            error: "Authentication required",
          },
          401
        );
      }

      return c.json({
        success: true,
        data: {
          id: ctx.currentUser.id,
          email: ctx.currentUser.email,
          name: ctx.currentUser.name,
          role: ctx.currentUser.role,
          isEmailVerified: ctx.currentUser.isEmailVerified,
          lastLoginAt: ctx.currentUser.lastLoginAt,
        },
      });
    }));
  }
}
