# API Layer (Presentation)

The **API** layer is the entry point to the application, handling HTTP requests and responses.

## Responsibilities

- Define **routes** and **controllers**
- Handle **HTTP request/response** transformation
- Implement **authentication** and **authorization** middleware
- Validate **input** and format **output**
- Map between DTOs and domain entities
- Create **per-request context** with user/request info

## Key Principles

- Depends on **application** layer (calls use cases)
- **Thin layer** - delegates business logic to use cases
- Handles **presentation concerns** only
- Creates `AppContext` per request (never shares context between requests)

## Structure

- `controllers/` - HTTP request handlers
- `middleware/` - Hono middleware (auth, context, validation, etc.)
- `app.ts` - Hono application setup
- `types.ts` - Hono environment types

## Middleware Chain

The middleware chain processes requests in order:

1. **Logger** - Logs incoming requests
2. **CORS** - Handles cross-origin requests
3. **Context Middleware** - Creates `AppContext` with basic request info
4. **Auth Middleware** - Validates auth and enriches context with user info

```typescript
// Middleware order in app.ts
this.app.use("*", logger());
this.app.use("*", cors({...}));
this.app.use("*", createContextMiddleware(this.ctx));
this.app.use("*", authMiddleware);
```

## Accessing Request Context

Controllers access the per-request context via Hono's context:

```typescript
this.app.get("/:id", async (c) => {
  // Get the per-request context
  const ctx = c.get("requestContext");
  
  // Access repos/usecases with request context
  const user = await ctx.repo.user.findById(id);
  
  // Context includes request-specific data
  console.log(ctx.isAuthenticated, ctx.userId, ctx.requestId);
});
```

## Type Safety

The API layer defines Hono environment types for type-safe context access:

```typescript
// types.ts
export type HonoEnv = {
  Variables: {
    requestContext: AppContext;
  };
};

// Usage in app
private app: Hono<HonoEnv>;
```
