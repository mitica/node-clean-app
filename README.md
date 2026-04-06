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
		hooks/          # Entity lifecycle hooks
			on-entity-created.ts
			on-entity-updated.ts
			on-entity-deleted.ts
			user.ts
			worker-task.ts
	config/                 # App configuration and context
	domain/                 # Core domain models, entities, base types
		entity/
			user.ts
			worker-task.ts
		repository/
			repository.ts
			user-repository.ts
			worker-task-repository.ts
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
			db-worker-task-repository.ts
			query/          # Query builder abstraction
				db-query-builder.ts
				query-builder-factory.ts
				query-builder.ts
		services/
			jwt.ts
	api/           # HTTP layer, controllers, middleware
		app.ts
		controllers/
			user-controller.ts
			auth-controller.ts
		middleware/
			auth-middleware.ts
			context-middleware.ts
			error-handler.ts
	worker/         # Background task worker
		run.ts
		worker.ts
		worker-app.ts
		handlers/
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

## Repository Hooks

The application uses **repository-level event hooks** for entity lifecycle events. Repositories extend `TypedEventEmitter` and emit events (`entityCreated`, `entityUpdated`, `entityDeleted`) which are handled by hook functions registered at startup.

### Architecture

| File | Purpose |
|------|---------|
| `src/domain/repository/repository.ts` | `BaseRepository` with typed event emitting |
| `src/config/repo.ts` | Registers hooks on repository instances |
| `src/app/hooks/on-entity-created.ts` | Dispatches to entity-specific created hooks |
| `src/app/hooks/on-entity-updated.ts` | Dispatches to entity-specific updated hooks |
| `src/app/hooks/on-entity-deleted.ts` | Dispatches to entity-specific deleted hooks |
| `src/app/hooks/user.ts` | User-specific hook handlers |
| `src/app/hooks/worker-task.ts` | Worker task hook handlers |

### Registering Hooks for a New Entity

1. **Create entity-specific hooks** in `src/app/hooks/{entity}.ts`:

```typescript
import { AppContext } from "../../config";
import { Order, OrderData } from "../../domain";
import { RepositoryEvents } from "../../domain/repository";

export const onOrderCreated = async (
  input: RepositoryEvents<OrderData, Order>["entityCreated"],
  ctx: AppContext
) => {
  // Handle order creation side effects
};
```

2. **Register in the dispatchers** (`on-entity-created.ts`, etc.):

```typescript
import { Order } from "../../domain";
import { onOrderCreated } from "./order";

// Inside onEntityCreated function:
if (entity instanceof Order) {
  promises.push(onOrderCreated({ entity, opt }, ctx));
}
```

### Key Benefits

- **Simple**: Direct function calls instead of pub/sub indirection
- **Type-safe**: Hook inputs are fully typed via `RepositoryEvents`
- **Traceable**: Easy to follow the code path from repository to hook
- **Context-aware**: Hooks receive `AppContext` for accessing other repositories and services

## License

ISC © Dumitru Cantea
# node-clean-app
