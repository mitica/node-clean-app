# API Error Handling - Best Practices

## Overview

This application implements a **centralized error handling** strategy for the API layer, following best practices for consistency, maintainability, and developer experience.

## Architecture

### Components

1. **Centralized Error Handler** ([error-handler.ts](src/api/middleware/error-handler.ts))
   - Single source of truth for error-to-HTTP response mapping
   - Registered with Hono's `onError()` hook
   - Automatically handles all thrown errors

2. **Async Handler Wrapper** (`asyncHandler`)
   - Wraps async route handlers to catch exceptions
   - Forwards errors to centralized handler
   - Eliminates try-catch boilerplate in controllers

3. **Domain Errors** ([domain/base/errors.ts](src/domain/base/errors.ts))
   - Type-safe error classes with business context
   - Include error codes, HTTP status, and additional data
   - Automatically mapped to appropriate HTTP responses

## Usage Patterns

### Controllers

**Before:**
```typescript
this.app.post("/login", async (c) => {
  try {
    const result = await someUsecase.execute(data);
    return c.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof DomainError) {
      return c.json({ success: false, error: error.message }, 400);
    }
    return c.json({ success: false, error: "Internal error" }, 500);
  }
});
```

**After:**
```typescript
this.app.post("/login", asyncHandler(async (c) => {
  const result = await someUsecase.execute(data);
  return c.json({ success: true, data: result });
}));
```

### Middleware

**Before:**
```typescript
export const authMiddleware = async (c, next) => {
  if (!authHeader) {
    return c.json({ success: false, error: "Auth required" }, 401);
  }
  // ...
};
```

**After:**
```typescript
export const authMiddleware = async (c, next) => {
  if (!authHeader) {
    throw new UnauthorizedError("Auth required");
  }
  // ...
};
```

## Error Response Format

All errors return a consistent JSON structure:

```typescript
{
  success: false,
  error: "Human-readable error message",
  code?: "ERROR_CODE",        // Optional error code
  data?: { key: "value" }     // Optional additional context
}
```

## HTTP Status Code Mapping

The centralized handler automatically maps domain errors to HTTP status codes:

| Error Type | HTTP Status | Use Case |
|------------|-------------|----------|
| `UnauthorizedError` | 401 | Invalid credentials, expired tokens |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource doesn't exist |
| `DuplicationError` | 409 | Unique constraint violations |
| `ValidationError` | 400 | Input validation failures |
| `InvalidInputError` | 400 | Malformed requests |
| Generic `Error` | 500 | Unexpected errors |

## Custom Error Codes

For client-side error handling, use error codes:

```typescript
// In middleware
const error = new UnauthorizedError("Token expired");
(error as any).code = "TOKEN_EXPIRED";
throw error;

// Response:
{
  success: false,
  error: "Token expired",
  code: "TOKEN_EXPIRED"
}
```

## Best Practices

### ✅ DO

- **Throw domain errors** in business logic and middleware
- **Use `asyncHandler`** for all async route handlers
- **Create specific error classes** for new error types
- **Include context** in error messages for debugging
- **Let the centralized handler** format responses

### ❌ DON'T

- **Don't return JSON errors** directly from handlers
- **Don't duplicate error handling** logic in controllers
- **Don't catch errors** unless you need to transform them
- **Don't mix error formats** across the application

## Examples

### Creating a New Domain Error

```typescript
// In src/domain/base/errors.ts
export class PaymentError extends DomainError {
  constructor(message: string) {
    super(message, {
      errorCode: "PAYMENT_FAILED",
      httpStatus: 402
    });
  }
}
```

### Using in a Controller

```typescript
import { asyncHandler } from "../middleware/error-handler";
import { NotFoundError } from "../../domain/base/errors";

this.app.get("/orders/:id", asyncHandler(async (c) => {
  const order = await findOrder(id);
  
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  
  return c.json({ success: true, data: order });
}));
```

### Custom HTTP Error (Non-Domain)

```typescript
import { HttpError } from "../middleware/error-handler";

this.app.post("/webhook", asyncHandler(async (c) => {
  const signature = c.req.header("X-Signature");
  
  if (!isValidSignature(signature)) {
    throw new HttpError("Invalid webhook signature", 403);
  }
  
  // Process webhook...
}));
```

## Testing

When testing error scenarios:

```typescript
// The handler automatically catches and formats errors
const response = await app.request("/api/users/999");

expect(response.status).toBe(404);
expect(await response.json()).toEqual({
  success: false,
  error: "User not found",
  code: "NOT_FOUND"
});
```

## Migration Checklist

When refactoring existing code:

- [ ] Remove try-catch blocks from route handlers
- [ ] Wrap handlers with `asyncHandler()`
- [ ] Replace `c.json()` error returns with `throw`
- [ ] Use appropriate domain error classes
- [ ] Remove duplicate error handling methods
- [ ] Test all error paths

## Benefits

1. **Consistency**: All errors follow the same format
2. **Maintainability**: Single place to update error handling logic
3. **Less Boilerplate**: No try-catch in every handler
4. **Type Safety**: Domain errors are strongly typed
5. **Better Debugging**: Centralized logging of all errors
6. **Client-Friendly**: Predictable error responses

## Related Files

- [error-handler.ts](src/api/middleware/error-handler.ts) - Centralized handler
- [errors.ts](src/domain/base/errors.ts) - Domain error classes
- [app.ts](src/api/app.ts) - Error handler registration
- [auth-controller.ts](src/api/controllers/auth-controller.ts) - Example usage
- [user-controller.ts](src/api/controllers/user-controller.ts) - Example usage
- [auth-middleware.ts](src/api/middleware/auth-middleware.ts) - Middleware example
