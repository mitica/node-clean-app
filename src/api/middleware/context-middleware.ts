import { Context, Next, MiddlewareHandler } from "hono";
import { AppContext, AppContextData } from "../../config";
import { HonoEnv } from "../types";

/**
 * Creates a middleware that initializes an AppContext for each request.
 * This middleware should be registered early in the middleware chain.
 *
 * The context is created with basic request information and can be
 * enriched by subsequent middleware (e.g., auth middleware).
 *
 * @param ctx The shared application context
 */
export const createContextMiddleware = (
  ctx: AppContext
): MiddlewareHandler<HonoEnv> => {
  return async (c: Context<HonoEnv>, next: Next): Promise<void | Response> => {
    // Extract request information
    const requestId = c.req.header("X-Request-ID") || crypto.randomUUID();
    const lang = c.req.header("Accept-Language")?.split(",")[0]?.trim() || "en";
    const ip = c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP");

    // Create initial request context with basic info
    const requestData: AppContextData = {
      requestId,
      lang,
      ip,
      isAuthenticated: false,
    };

    const requestContext = ctx.createContext(requestData);

    // Store in Hono's context for access in handlers
    c.set("requestContext", requestContext);

    await next();
  };
};

/**
 * Helper to get the request context from Hono's context.
 * Throws if context is not available (middleware not registered).
 */
export const getRequestContext = (c: Context<HonoEnv>): AppContext => {
  const ctx = c.get("requestContext");
  if (!ctx) {
    throw new Error(
      "AppContext not found. Ensure contextMiddleware is registered."
    );
  }
  return ctx;
};
