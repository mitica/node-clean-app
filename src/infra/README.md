# Infrastructure Layer

The **infrastructure** layer contains implementations of interfaces defined in the domain layer and external service integrations.

## Responsibilities

- Implement **repository interfaces** from the domain layer
- Manage **database** connections and queries
- Handle **caching** (Redis, etc.)
- Integrate with **external services** (APIs, queues, etc.)
- Run **migrations** and **seeds**

## Key Principles

- Depends on **domain** layer (implements its interfaces)
- Contains all **framework-specific** and **external library** code
- Handles **persistence** and **I/O** operations

## Structure

- `database/` - Database connection, migrations, seeds, and caching
- `repository/` - Concrete implementations of domain repositories
