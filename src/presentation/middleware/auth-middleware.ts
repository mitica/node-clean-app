import { config } from "../../config";
import { Context, Next } from "hono";

export const authMiddleware = async (
  c: Context,
  next: Next
): Promise<Response | void> => {
  // Skip auth for health check endpoint
  if (c.req.path === "/health") {
    await next();
    return;
  }

  if (!config.apiKey && config.nodeEnv === "development") {
    console.warn("API_KEY is not set in development mode");
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

  // Token is valid, proceed to next middleware/handler
  await next();
};
