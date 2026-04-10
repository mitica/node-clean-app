---
description: "Use when creating, modifying, or reviewing use cases in src/app/. Covers use case structure, input types, JSON schema conventions, and registration."
applyTo: "src/app/**/*-usecase.ts"
---

# Use Case Creation

## Structure

Every use case extends `BaseUseCase<TInput, TOutput, AppContext>` and implements `innerExecute()`.

```
src/app/<domain>/<name>-usecase.ts
```

## Input types must derive from entity data

Use case input types should `Pick` fields from the related entity's `EntityCreateData` or `EntityUpdateData` types. Add non-entity fields (like `password`) as intersections.

```ts
// CORRECT — derives from entity types
export type UserRegisterInput = Pick<UserCreateData, "email" | "name"> & {
  password: string;
};

// WRONG — duplicates entity field types
export type UserRegisterInput = {
  email: string;
  name: string;
  password: string;
};
```

## JSON schema must reference the entity schema

Pick property definitions from `Entity.jsonSchema.properties` instead of duplicating them. Only define schemas for fields that don't exist on the entity (like `password`).

Use `pick()` from `domain/base` to spread entity properties, then add non-entity fields.

```ts
// CORRECT — picks from entity schema
static override jsonSchema: RequiredJSONSchema = {
  type: "object",
  properties: {
    ...pick(["email", "name"], User.jsonSchema.properties!),
    password: { type: "string", minLength: 6 },
  },
  required: ["email", "password", "name"],
  additionalProperties: false,
};

// WRONG — duplicates entity schema definitions
static override jsonSchema: RequiredJSONSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    name: { type: "string", minLength: 1, maxLength: 255 },
    password: { type: "string", minLength: 6 },
  },
  required: ["email", "password", "name"],
  additionalProperties: false,
};
```

## Registration checklist

1. Export from `src/app/<domain>/index.ts`
2. Add to `UseCaseContainer` interface in `src/config/usecase.ts`
3. Instantiate in `createUseCaseContainer()` in the same file
4. Wire to API route in the appropriate controller under `src/api/controllers/`

## Accessing use cases

Always access use cases through `AppContext`. Never instantiate use cases directly.

```ts
// CORRECT — use cases from context
const result = await ctx.usecase.register.execute(input, ctx);

// WRONG — direct instantiation
const usecase = new UserRegisterUseCase();
const result = await usecase.execute(input, ctx);
```

This applies to controllers, tests, and any other code that calls use cases.
