# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-01-12

### Added

- **OpenTelemetry Integration**: Distributed tracing for API and Worker processes
  - Auto-instrumentation for HTTP, PostgreSQL, Redis
  - Hono middleware for HTTP request tracing
  - Worker task instrumentation with trace context propagation
  - Jaeger integration in Docker Compose
  - Configurable via environment variables (`OTEL_ENABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`, etc.)
- Telemetry configuration module (`src/config/telemetry/`)
- Telemetry utilities: `withSpan`, `SpanAttributes`, `isTelemetryEnabled`
- Worker service added to Docker Compose
- Comprehensive telemetry documentation ([src/config/telemetry/README.md](src/config/telemetry/README.md))

### Changed

- Entry points (`index.ts`, `worker/run.ts`) now initialize telemetry before other imports
- Graceful shutdown includes telemetry flush
- Task handlers wrapped with `traceTaskHandler` for automatic tracing

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

## [Unreleased]

- Future improvements and features will be documented here

[0.3.0]: https://github.com/mitica/node-clean-app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/mitica/node-clean-app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mitica/node-clean-app/releases/tag/v0.1.0
[Unreleased]: https://github.com/mitica/node-clean-app/compare/v0.3.0...HEAD
