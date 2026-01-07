# Domain Layer

The **domain** layer contains the core business rules and entities. This is the heart of the application.

## Responsibilities

- Define **entities** (business objects with identity)
- Define **value objects** (immutable objects without identity)
- Define **domain events** (significant occurrences in the domain)
- Define **repository interfaces** (contracts for data access)
- Contain pure business logic and validation rules

## Key Principles

- **No dependencies** on other layers (most inner layer)
- **Framework-agnostic** - no external libraries for business logic
- **Stable** - changes only when business rules change

## Structure

- `entity/` - Business entities and their domain events
- `repository/` - Repository interfaces (contracts)
- `base/` - Base classes and utilities for domain objects
