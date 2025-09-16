# node-clean-app

A base Node.js/TypeScript Clean Architecture application template.

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
	application/            # Use cases, business logic
		user/
			user-login-usecase.ts
	config/                 # App configuration and context
	domain/                 # Core domain models, entities, base types
		entity/
			user.ts
		repository/
			user-repository.ts
	infrastructure/         # Database, cache, external services
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
	presentation/           # HTTP layer, controllers, middleware
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
- Implement new repositories in `src/domain/repository/` and `src/infrastructure/repository/`
- Create new use cases in `src/application/`
- Add controllers and routes in `src/presentation/controllers/`
- Configure middleware in `src/presentation/middleware/`

## License

ISC © Dumitru Cantea
# node-clean-app
