# node-clean-app

A base Node.js/TypeScript Clean Architecture application template.

See [CHANGELOG.md](CHANGELOG.md) for version history and recent changes.

## Overview

This project provides a scalable, maintainable starting point for Node.js backend applications, following Clean Architecture principles. It separates concerns into distinct layers (domain, application, infrastructure, presentation) and includes Docker support, PostgreSQL integration, and modern tooling.

## Features

- **TypeScript**: Type-safe codebase for reliability and maintainability.
- **Clean Architecture**: Clear separation of domain, application, infrastructure, and presentation layers.
- **Dockerized**: Ready-to-use Docker and Docker Compose setup for local development and deployment.
- **PostgreSQL**: Integrated database with migration and seed scripts.
- **Redis**: Optional caching layer via Redis.
- **OpenTelemetry**: Distributed tracing for API and Worker processes with Jaeger integration.
- **Knex.js**: SQL query builder and migration tool.
- **Hono**: Lightweight web framework for HTTP APIs.
- **Nodemon**: Hot-reloading for development.
- **Extensible**: Easily add new features, repositories, and use cases.

## Project Structure

```
src/
	index.ts                # Entry point
	app/            # Use cases, business logic
		user/
			user-login-usecase.ts
	config/                 # App configuration and context
	domain/                 # Core domain models, entities, base types
		entity/
			user.ts
		repository/
			user-repository.ts
	infra/         # Database, cache, external services
		database/
			db.ts
			migrations/
			seeds/
			scripts/
				knex.ts
				seed.ts
				drop-db.ts
				drop-cache.ts
		repository/
			db-user-repository.ts
	api/           # HTTP layer, controllers, middleware
		app.ts
		controllers/
			user-controller.ts
		middleware/
			auth-middleware.ts
	typings/
		global.d.ts           # TypeScript global types
docker/
	postgres/
		Dockerfile.pg
		init.sql
Dockerfile                # Main Dockerfile
docker-compose.yml        # Compose for multi-service setup
nodemon.json              # Nodemon config
tsconfig.json             # TypeScript config
package.json              # Project metadata and scripts
README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/mitica/node-clean-app.git
cd node-clean-app

# Install dependencies
yarn install
```

### Development

```bash
# Start services and enable hot-reloading
yarn dev
```

### Build

```bash
yarn build
```

### Database Migrations & Seeds

```bash
# Run migrations
yarn migrate

# Rollback migrations
yarn rollback

# Create a new migration
yarn new-migrate

# Seed the database
yarn seed
```

### Docker

```bash
# Start all services (API, PostgreSQL, Redis)
yarn up

# Stop all services
yarn down
```

## Scripts

See `package.json` for all available scripts, including:

- `up`, `down`, `dev`: Docker lifecycle
- `build`, `clean`: Build and clean artifacts
- `migrate`, `rollback`, `seed`: Database operations
- `drop-db`, `drop-cache`: Utility scripts

## Technologies Used

- TypeScript
- Node.js
- Docker, Docker Compose
- PostgreSQL
- Redis
- Knex.js
- Hono
- Ajv (JSON schema validation)
- Ramda (functional utilities)
- bcryptjs (password hashing)

## Extending the Template

- Add new domain entities in `src/domain/entity/`
- Implement new repositories in `src/domain/repository/` and `src/infra/repository/`
- Create new use cases in `src/app/`
- Add controllers and routes in `src/api/controllers/`
- Configure middleware in `src/api/middleware/`

## Domain Event Bus

The application includes a **type-safe singleton event bus** for domain events, using TypeScript's declaration merging pattern.

### Architecture

| File | Purpose |
|------|---------|
| `src/domain/base/domain-event.ts` | Defines `DomainEventRegistry` interface + helper types |
| `src/domain/base/event-bus.ts` | `IDomainEventBus` interface + `DomainEventBus` class |
| `src/config/event-bus.ts` | Singleton instance |
| `src/domain/entity/*.events.ts` | Entity events via declaration merging |

### Registering Events for a New Entity

1. **Create `{entity}.events.ts`** in `src/domain/entity/`:

```typescript
import { EntityCreatedEvent, EntityDeletedEvent, EntityUpdatedEvent } from "../base/domain-event";
import { Order, OrderUpdateData } from "./order";
import { EntityId } from "../base/types";

declare module "../base/domain-event" {
  interface DomainEventRegistry {
    "order:created": EntityCreatedEvent<Order>;
    "order:updated": EntityUpdatedEvent<Order, OrderUpdateData>;
    "order:deleted": EntityDeletedEvent<Order>;
    "order:preDelete": EntityId;
  }
}
```

2. **Export from `src/domain/entity/index.ts`**:

```typescript
export * from "./order.events";
```

3. **Implement `getEventPrefix()` in repository**:

```typescript
export class OrderDbRepository extends DbRepository<...> {
  protected override getEventPrefix(): string {
    return "order";
  }
}
```

### Subscribing to Events

```typescript
import { eventBus } from "../config";
import "../domain/entity/user.events"; // Ensure declaration merging is applied

// Full type safety - payload is typed as EntityCreatedEvent<User>
eventBus.on("user:created", (event) => {
  console.log(event.payload.entity.email); // ✅ Typed!
});

// TypeScript error: "invalid:event" not in registry
eventBus.on("invalid:event", () => {}); // ❌ Compile error!
```

### Key Benefits

- **Strong types**: Event names and payloads are checked at compile time
- **Singleton**: One subscription point for the entire app
- **Clean Architecture**: Domain defines types, Config provides instance
- **Extensible**: Each entity registers its own events via declaration merging
- **Testable**: `resetEventBus()` for test isolation

## OpenTelemetry (Distributed Tracing)

The application includes built-in **OpenTelemetry** support for distributed tracing across API and Worker processes.

### Features

- **Auto-instrumentation**: HTTP, PostgreSQL, Redis automatically traced
- **Manual instrumentation**: Custom spans via `withSpan()` utility
- **Distributed tracing**: Trace context propagates from API to Worker tasks
- **Jaeger integration**: Pre-configured in Docker Compose

### Quick Start

```bash
# Start all services with Jaeger
yarn up

# View traces at http://localhost:16686
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OTEL_ENABLED` | Enable/disable telemetry | `true` |
| `OTEL_SERVICE_NAME` | Base service name | `node-clean-app` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | - |
| `OTEL_TRACES_SAMPLER_ARG` | Sample rate (0.0 - 1.0) | `1.0` (dev), `0.1` (prod) |

### Usage

```typescript
import { withSpan, SpanAttributes } from "./config/telemetry";

// Create custom spans
const result = await withSpan("processOrder", async (span) => {
  span.setAttribute(SpanAttributes.ENTITY_ID, orderId);
  return await processOrder(orderId);
});

// Worker tasks with trace context
import { injectTaskTraceContext } from "./worker/telemetry";

await createWorkerTask(ctx, {
  type: "email:send",
  payload: injectTaskTraceContext({ to: "user@example.com" })
});
```

See [src/config/telemetry/README.md](src/config/telemetry/README.md) for detailed documentation.

## License

ISC © Dumitru Cantea
# node-clean-app
