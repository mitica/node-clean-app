import { config } from "../../config";
import { Context, Next, MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { UserRole } from "../../domain/entity";
import { verifyAccessToken } from "../../infra/services/jwt";

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

  return c.json(
    {
      success: false,
      error: "Authorization header is required",
    },
    401
  );
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
    return c.json(
      {
        success: false,
        error: "Server configuration error: API key not configured",
      },
      500
    );
  }

  if (apiKey !== config.apiKey) {
    return c.json(
      {
        success: false,
        error: "Invalid API key",
      },
      401
    );
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
    return c.json(
      {
        success: false,
        error: "Authorization header must be in format: Bearer <token>",
      },
      401
    );
  }

  const token = tokenMatch[1];
  const result = verifyAccessToken(token);

  if (!result.valid) {
    const statusCode = result.error === "expired" ? 401 : 401;
    return c.json(
      {
        success: false,
        error: result.message,
        code: result.error === "expired" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      },
      statusCode
    );
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
      return c.json(
        {
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        },
        401
      );
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
    console.error("Failed to load user from token:", error);
    return c.json(
      {
        success: false,
        error: "Failed to authenticate user",
      },
      500
    );
  }
}
