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
- `app-context.ts` - Application context setup
- `event-bus.ts` - Event bus configuration
- `repo.ts` - Repository instantiation
- `usecase.ts` - Use case instantiation
