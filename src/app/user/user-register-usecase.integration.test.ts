import { describe, it, expect, beforeEach } from "vitest";
import { createTestContext, cleanTables } from "../../tests/db-helpers";
import { UserRole } from "../../domain/entity/user";
import { AppContext } from "../../config";
import { DuplicationError } from "../../domain/base";
import * as bcrypt from "bcryptjs";

let ctx: AppContext;

beforeEach(async () => {
  ctx = await createTestContext();
  await cleanTables("user");
});

describe("UserRegisterUseCase", () => {
  it("creates a new user and returns tokens", async () => {
    const result = await ctx.usecase.register.execute(
      { email: "alice@example.com", password: "secret123", name: "Alice" },
      ctx
    );

    expect(result.user.id).toBeGreaterThan(0);
    expect(result.user.email).toBe("alice@example.com");
    expect(result.user.name).toBe("Alice");
    expect(result.user.role).toBe(UserRole.USER);
    expect(result.user.isEmailVerified).toBe(false);
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();
  });

  it("hashes the password", async () => {
    const result = await ctx.usecase.register.execute(
      { email: "bob@example.com", password: "secret123", name: "Bob" },
      ctx
    );

    expect(result.user.passwordHash).not.toBe("secret123");
    expect(await bcrypt.compare("secret123", result.user.passwordHash)).toBe(true);
  });

  it("normalizes email to lowercase", async () => {
    const result = await ctx.usecase.register.execute(
      { email: "Alice@Example.COM", password: "secret123", name: "Alice" },
      ctx
    );

    expect(result.user.email).toBe("alice@example.com");
  });

  it("trims the name", async () => {
    const result = await ctx.usecase.register.execute(
      { email: "alice@example.com", password: "secret123", name: "  Alice  " },
      ctx
    );

    expect(result.user.name).toBe("Alice");
  });

  it("throws DuplicationError for duplicate email", async () => {
    await ctx.usecase.register.execute(
      { email: "alice@example.com", password: "secret123", name: "Alice" },
      ctx
    );

    await expect(
      ctx.usecase.register.execute(
        { email: "alice@example.com", password: "other456", name: "Alice 2" },
        ctx
      )
    ).rejects.toThrow(DuplicationError);
  });

  it("throws DuplicationError for same email with different casing", async () => {
    await ctx.usecase.register.execute(
      { email: "alice@example.com", password: "secret123", name: "Alice" },
      ctx
    );

    await expect(
      ctx.usecase.register.execute(
        { email: "ALICE@EXAMPLE.COM", password: "other456", name: "Alice 2" },
        ctx
      )
    ).rejects.toThrow(DuplicationError);
  });
});
