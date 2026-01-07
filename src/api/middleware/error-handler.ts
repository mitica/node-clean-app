import { Context } from "hono";
import { HonoEnv } from "../types";
import { DomainError, BaseErrorCode } from "../../domain/base/errors";

/**
 * Standard error response format
 */
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  data?: Record<string, unknown>;
}

/**
 * Maps DomainError to HTTP status code.
 * Returns the httpStatus if set, otherwise maps based on error code.
 */
function getHttpStatusFromError(error: DomainError): number {
  if (error.httpStatus) {
    return error.httpStatus;
  }

  // Default mappings based on error code
  switch (error.errorCode) {
    case BaseErrorCode.UNAUTHENTICATED:
      return 401;
    case BaseErrorCode.FORBIDDEN:
    case BaseErrorCode.NOT_AUTH_LIMIT:
      return 403;
    case BaseErrorCode.NOT_FOUND:
      return 404;
    case BaseErrorCode.DUPLICATION:
      return 409;
    case BaseErrorCode.VALIDATION:
    case BaseErrorCode.INVALID_INPUT:
      return 400;
    case BaseErrorCode.INTERNAL_SERVER_ERROR:
    default:
      return 500;
  }
}

/**
 * Centralized error handler for the API.
 * Converts errors into standardized JSON responses.
 *
 * Usage in app.ts:
 *   this.app.onError(errorHandler);
 */
export function errorHandler(err: Error, c: Context<HonoEnv>) {
  console.error("API Error:", {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle DomainError with proper status code and error code
  if (err instanceof DomainError) {
    const statusCode = getHttpStatusFromError(err);
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      code: err.errorCode,
    };

    // Include additional error data if present
    if (err.data) {
      response.data = err.data;
    }

    return c.json(response, statusCode as 400);
  }

  // Handle standard Error
  if (err instanceof Error) {
    return c.json(
      {
        success: false,
        error: err.message,
      } as ErrorResponse,
      500
    );
  }

  // Handle unknown error types
  return c.json(
    {
      success: false,
      error: "Internal server error",
    } as ErrorResponse,
    500
  );
}

/**
 * Creates an HTTP error that can be thrown in handlers.
 * This is useful for non-domain errors that need specific HTTP status codes.
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Wraps an async route handler to automatically catch and forward errors
 * to Hono's error handler.
 *
 * Usage:
 *   this.app.get("/users/:id", asyncHandler(async (c) => {
 *     const user = await getUserById(id);
 *     return c.json({ success: true, data: user });
 *   }));
 */
export function asyncHandler<T extends Context<HonoEnv>>(
  handler: (c: T) => Promise<Response>
) {
  return async (c: T): Promise<Response> => {
    try {
      return await handler(c);
    } catch (error) {
      // Forward to Hono's error handler
      throw error;
    }
  };
}
