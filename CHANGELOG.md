# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-01-07

### Added

- EventBus implementation for domain event handling
- Event handlers registration system
- User event listeners

### Changed

- Refactored EventBus architecture for better extensibility
- Fixed EventEmitter implementation

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

[0.2.0]: https://github.com/mitica/node-clean-app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mitica/node-clean-app/releases/tag/v0.1.0
[Unreleased]: https://github.com/mitica/node-clean-app/compare/v0.2.0...HEAD
