# Config Layer

The **config** layer contains application configuration and dependency injection setup.

## Responsibilities

- Define **configuration** values (environment variables, constants)
- Set up **dependency injection** (wiring layers together)
- Initialize **application context** (repositories, use cases)
- Configure **event bus** and listeners

## Key Principles

- This is the **composition root** where all dependencies are wired
- Only place that knows about all layers
- Configures the application based on environment

## Structure

- `config.ts` - Environment configuration
- `app-context.ts` - Application context (shared infra + per-request)
- `event-bus.ts` - Event bus configuration
- `repo.ts` - Repository instantiation
- `usecase.ts` - Use case instantiation

## AppContext Pattern

The application uses a single `AppContext` class that serves two purposes:

### Root Context (Shared Infrastructure)

Created once at application startup:

```typescript
// Created once at app startup
const ctx = new AppContext();
await ctx.initialize();

// Cleanup on shutdown
await ctx.close();
```

### Request Context (Per-Request)

Created for each incoming request via factory method:

```typescript
// In middleware - create context for each request
const requestContext = ctx.createContext({
  requestId: crypto.randomUUID(),
  lang: 'en',
  isAuthenticated: true,
  userId: 123,
});

// Use in handlers/controllers
const user = await requestContext.repo.user.findById(id);
await requestContext.usecase.login.execute(input, requestContext);
```

### Enriching Context

The context is immutable but can be enriched via the `with()` method:

```typescript
// In auth middleware - enrich with user info
const enrichedCtx = requestContext.with({
  isAuthenticated: true,
  userId: user.id,
  currentUser: user,
});
```

### Worker Context

Workers don't have incoming requests but still need a context for repository operations:

```typescript
// Worker creates its own system context
const workerCtx = ctx.createContext({
  isAuthenticated: true,
  isAdmin: true, // Worker has admin privileges
});
```

### Key Benefits

- **Single class** - No redundant types, simpler mental model
- **Immutability** - Request contexts are created via factory, never mutated
- **Platform agnostic** - `AppContext` has no Hono/API dependencies
- **Type safe** - Same type used everywhere, but root has lifecycle methods

