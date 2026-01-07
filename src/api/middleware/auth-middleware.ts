import { config } from "../../config";
import { Context, Next, MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { UserRole } from "../../domain/entity";

/**
 * Authentication middleware that validates API keys and enriches the request context.
 * This middleware should run after contextMiddleware.
 */
export const authMiddleware: MiddlewareHandler<HonoEnv> = async (
  c: Context<HonoEnv>,
  next: Next
): Promise<Response | void> => {
  // Skip auth for health check endpoint
  if (c.req.path === "/health") {
    await next();
    return;
  }

  if (!config.apiKey && config.nodeEnv === "development") {
    console.warn("API_KEY is not set in development mode");
    // In development without API key, mark as authenticated but continue
    const currentCtx = c.get("requestContext");
    if (currentCtx) {
      c.set("requestContext", currentCtx.with({ isAuthenticated: true }));
    }
    await next();
    return;
  }

  // Check if API key is configured
  if (!config.apiKey) {
    console.error("API_KEY environment variable is not configured");
    return c.json(
      {
        success: false,
        error: "Server configuration error: API key not configured",
      },
      500
    );
  }

  // Get Authorization header
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json(
      {
        success: false,
        error: "Authorization header is required",
      },
      401
    );
  }

  // Check for Bearer token format
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (!tokenMatch) {
    return c.json(
      {
        success: false,
        error: "Authorization header must be in format: Bearer <token>",
      },
      401
    );
  }

  const token = tokenMatch[1];

  // Validate token against configured API key
  if (token !== config.apiKey) {
    return c.json(
      {
        success: false,
        error: "Invalid API key",
      },
      401
    );
  }

  // Token is valid - enrich context with authentication info
  const currentCtx = c.get("requestContext");
  // Try to load current user if X-User-ID header is provided
  // This allows API key auth with user context (e.g., admin acting as user)
  const userIdHeader = c.req.header("X-User-ID");
  let enrichedCtx = currentCtx.with({ isAuthenticated: true });

  if (userIdHeader) {
    const userId = parseInt(userIdHeader, 10);
    if (!isNaN(userId)) {
      try {
        const user = await currentCtx.repo.user.findById(userId);
        if (user) {
          enrichedCtx = enrichedCtx.with({
            userId: user.id,
            currentUser: user,
            isAdmin: user.role === UserRole.ADMIN,
          });
        }
      } catch (error) {
        console.warn(`Failed to load user ${userId}:`, error);
      }
    }
  }

  c.set("requestContext", enrichedCtx);

  // Proceed to next middleware/handler
  await next();
};
