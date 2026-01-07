import { config } from "../../config";
import { Context, Next, MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { UserRole } from "../../domain/entity";
import { verifyAccessToken } from "../../infra/services/jwt";
import { UnauthorizedError } from "../../domain/base/errors";

/**
 * Authentication middleware that validates JWT tokens and enriches the request context.
 * This middleware should run after contextMiddleware.
 *
 * Supports two authentication methods:
 * 1. JWT Bearer token (primary): Authorization: Bearer <jwt_access_token>
 * 2. API Key (for service-to-service): X-API-Key: <api_key>
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

  // Skip auth for public auth endpoints
  if (c.req.path === "/api/auth/login" || c.req.path === "/api/auth/refresh") {
    await next();
    return;
  }

  // Check for API Key authentication first (service-to-service)
  const apiKey = c.req.header("X-API-Key");
  if (apiKey) {
    return handleApiKeyAuth(c, next, apiKey);
  }

  // Check for JWT Bearer token authentication
  const authHeader = c.req.header("Authorization");
  if (authHeader) {
    return handleJwtAuth(c, next, authHeader);
  }

  // Development mode without any auth header
  if (config.nodeEnv === "development") {
    console.warn("No authentication provided in development mode");
    const currentCtx = c.get("requestContext");
    if (currentCtx) {
      c.set("requestContext", currentCtx.with({ isAuthenticated: false }));
    }
    await next();
    return;
  }

  throw new UnauthorizedError("Authorization header is required");
};

/**
 * Handle API Key authentication (for service-to-service communication).
 */
async function handleApiKeyAuth(
  c: Context<HonoEnv>,
  next: Next,
  apiKey: string
): Promise<Response | void> {
  if (!config.apiKey) {
    if (config.nodeEnv === "development") {
      console.warn("API_KEY is not configured in development mode");
      const currentCtx = c.get("requestContext");
      if (currentCtx) {
        c.set("requestContext", currentCtx.with({ isAuthenticated: true }));
      }
      await next();
      return;
    }
    throw new Error("Server configuration error: API key not configured");
  }

  if (apiKey !== config.apiKey) {
    throw new UnauthorizedError("Invalid API key");
  }

  // API Key is valid - mark as authenticated (admin-level access)
  const currentCtx = c.get("requestContext");
  c.set(
    "requestContext",
    currentCtx.with({
      isAuthenticated: true,
      isAdmin: true,
    })
  );

  await next();
}

/**
 * Handle JWT Bearer token authentication.
 */
async function handleJwtAuth(
  c: Context<HonoEnv>,
  next: Next,
  authHeader: string
): Promise<Response | void> {
  // Validate Bearer token format
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (!tokenMatch) {
    throw new UnauthorizedError(
      "Authorization header must be in format: Bearer <token>"
    );
  }

  const token = tokenMatch[1];
  const result = verifyAccessToken(token);

  if (!result.valid) {
    const error = new UnauthorizedError(result.message);
    // Add error code for token expiration
    if (result.error === "expired") {
      (error as any).code = "TOKEN_EXPIRED";
    } else {
      (error as any).code = "INVALID_TOKEN";
    }
    throw error;
  }

  // Token is valid - load user and enrich context
  const currentCtx = c.get("requestContext");
  const userId =
    typeof result.payload.sub === "string"
      ? parseInt(result.payload.sub, 10)
      : result.payload.sub;

  try {
    const user = await currentCtx.repo.user.findById(userId);

    if (!user) {
      const error = new UnauthorizedError("User not found");
      (error as any).code = "USER_NOT_FOUND";
      throw error;
    }

    c.set(
      "requestContext",
      currentCtx.with({
        isAuthenticated: true,
        userId: user.id,
        currentUser: user,
        isAdmin: user.role === UserRole.ADMIN,
      })
    );

    await next();
  } catch (error) {
    // Re-throw UnauthorizedError as-is
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    // Wrap other errors
    console.error("Failed to load user from token:", error);
    throw new Error("Failed to authenticate user");
  }
}
