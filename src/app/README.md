# Application Layer

The **application** layer contains the use cases that orchestrate the domain entities to fulfill business requirements.

## Responsibilities

- Define **use cases** (application-specific business rules)
- Orchestrate domain entities and services
- Define **event listeners** for domain events
- Coordinate transactions and workflows

## Key Principles

- Depends only on the **domain** layer
- **Framework-agnostic** - no infrastructure concerns
- Each use case represents a single action the application can perform

## Structure

- `user/` - User-related use cases
- `listeners/` - Event listeners that react to domain events
