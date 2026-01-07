# API Layer (Presentation)

The **API** layer is the entry point to the application, handling HTTP requests and responses.

## Responsibilities

- Define **routes** and **controllers**
- Handle **HTTP request/response** transformation
- Implement **authentication** and **authorization** middleware
- Validate **input** and format **output**
- Map between DTOs and domain entities

## Key Principles

- Depends on **application** layer (calls use cases)
- **Thin layer** - delegates business logic to use cases
- Handles **presentation concerns** only

## Structure

- `controllers/` - HTTP request handlers
- `middleware/` - Express middleware (auth, validation, etc.)
- `app.ts` - Express application setup
