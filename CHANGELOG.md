# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-10

### Added

- Vitest testing framework with sample tests for domain utilities
- ESLint with flat config and typescript-eslint for type-aware linting
- User registration use case (`UserRegisterUseCase`) with email uniqueness check and JWT token generation
- `POST /register` endpoint in auth controller
- Generic `pick` utility in `domain/base/utils`
- Copilot instruction file for use case creation conventions (`.github/instructions/usecase.instructions.md`)
- Prettier with project-level config and VS Code integration
- `.prettierignore` for excluding build output
- `yarn test`, `yarn test:watch` scripts
- `yarn lint`, `yarn lint:fix` scripts
- `yarn format`, `yarn format:check` scripts

### Changed

- Updated `tsconfig.json` `lib` from `["es2018", "esnext.asynciterable", "DOM"]` to `["ES2022"]`
- Updated `@types/node` from `^12.0.2` to `^22.0.0`
- Updated Dockerfile base image from `node:21.7.2-alpine` to `node:22-alpine`
- Excluded test files (`*.test.ts`) from TypeScript build output
- Updated `.vscode/settings.json` with Prettier as default formatter and format-on-save
- Docker Compose PostgreSQL volume mount updated from `/var/lib/postgresql/data` to `/var/lib/postgresql` for PostgreSQL 18+ compatibility

### Fixed

- Replaced ternary-as-statement expressions with proper `if/else` in query builder
- Replaced deprecated `{}` types with `Record<string, unknown>` in cache storage
- Removed unnecessary regex escapes in string utilities
- Removed useless try-catch wrapper in error handler
- Added `{ cause }` to re-thrown errors in auth middleware
- Fixed unused variable warnings across codebase
- Updated stale eslint-disable comments
- ESLint parsing errors for test files excluded from `tsconfig.json` by adding `**/*.test.ts` to ESLint ignores

### Removed

- Deprecated `prettier.tslintIntegration` setting from VS Code config
- Old ava test runner references

## [0.2.0] - 2026-01-07

### Added

- EventBus implementation for domain event handling
- Event handlers registration system
- User event listeners
- Centralized error handler middleware for consistent API error responses
- `asyncHandler` wrapper utility to eliminate try-catch boilerplate in controllers
- `HttpError` class for custom HTTP status codes
- Comprehensive error handling documentation ([ERROR_HANDLING.md](src/api/ERROR_HANDLING.md))

### Changed

- Refactored EventBus architecture for better extensibility
- Fixed EventEmitter implementation
- Refactored API error handling to use centralized error handler
- Updated all controllers to use `asyncHandler` wrapper
- Updated auth middleware to throw domain errors instead of returning JSON responses
- Simplified error handling logic across all API endpoints
- Improved error response consistency with standardized format

### Removed

- Duplicate `handleError` methods from individual controllers
- Redundant try-catch blocks in route handlers

## [0.1.0] - 2025-09-16

### Added

- Initial Clean Architecture project structure
- Domain layer with base entities, validators, and error handling
- User entity with password hashing support
- User repository interface and database implementation
- Application use cases (user login, registration)
- Infrastructure layer with PostgreSQL and Redis integration
- Knex.js migrations and seed scripts
- Presentation layer with Hono web framework
- Authentication middleware
- Docker and Docker Compose setup
- TypeScript configuration
- Nodemon for hot-reloading in development

### Changed

- Simplified context management
- Entity getter/setter improvements
- Configurable password salt length

### Dependencies

- Bump hono from 4.9.7 to 4.10.3

[0.4.0]: https://github.com/mitica/node-clean-app/compare/v0.2.0...v0.4.0
[0.2.0]: https://github.com/mitica/node-clean-app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mitica/node-clean-app/releases/tag/v0.1.0
