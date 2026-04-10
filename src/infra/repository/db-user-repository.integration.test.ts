import { describe, it, expect, beforeEach } from "vitest";
import { createTestContext, cleanTables } from "../../tests/db-helpers";
import { UserRole } from "../../domain/entity/user";
import type { UserRepository } from "../../domain/repository/user-repository";
import { AppContext } from "../../config";

let fakePasswordHash = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
let userRepo: UserRepository;
let ctx: AppContext;

beforeEach(async () => {
  ctx = await createTestContext();
  userRepo = ctx.repo.user;
  await cleanTables("user");
});

function createUserData(overrides: Partial<{ email: string; name: string; role: UserRole }> = {}) {
  return {
    email: overrides.email ?? "test@example.com",
    passwordHash: fakePasswordHash,
    name: overrides.name ?? "Test User",
    role: overrides.role ?? UserRole.USER,
    isEmailVerified: false,
  };
}

describe("UserDbRepository", () => {
  describe("create", () => {
    it("creates a user and returns the entity", async () => {
      const user = await userRepo.create(
        createUserData({ email: "alice@example.com", name: "Alice" }),
        { ctx }
      );

      expect(user.id).toBeGreaterThan(0);
      expect(user.email).toBe("alice@example.com");
      expect(user.name).toBe("Alice");
      expect(user.role).toBe(UserRole.USER);
      expect(user.isEmailVerified).toBe(false);
      expect(user.createdAt).toBeTruthy();
    });
  });

  describe("findById", () => {
    it("returns the user by id", async () => {
      const created = await userRepo.create(
        createUserData({ email: "bob@example.com", name: "Bob" }),
        { ctx }
      );

      const found = await userRepo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.email).toBe("bob@example.com");
    });

    it("returns null for non-existent id", async () => {
      const found = await userRepo.findById(999999);
      expect(found).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("finds user by email", async () => {
      await userRepo.create(
        createUserData({ email: "carol@example.com", name: "Carol", role: UserRole.ADMIN }),
        { ctx }
      );

      const found = await userRepo.getByEmail("carol@example.com");
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Carol");
      expect(found!.role).toBe(UserRole.ADMIN);
    });

    it("returns null for unknown email", async () => {
      const found = await userRepo.getByEmail("nobody@example.com");
      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("updates user fields", async () => {
      const created = await userRepo.create(
        createUserData({ email: "dave@example.com", name: "Dave" }),
        { ctx }
      );

      const updated = await userRepo.update(
        { id: created.id, name: "David", isEmailVerified: true },
        { ctx }
      );

      expect(updated.name).toBe("David");
      expect(updated.isEmailVerified).toBe(true);
      expect(updated.email).toBe("dave@example.com");
    });
  });

  describe("deleteById", () => {
    it("deletes the user", async () => {
      const created = await userRepo.create(
        createUserData({ email: "eve@example.com", name: "Eve" }),
        { ctx }
      );

      const deleted = await userRepo.deleteById(created.id, { ctx });
      expect(deleted).not.toBeNull();
      expect(deleted!.id).toBe(created.id);

      const found = await userRepo.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe("count", () => {
    it("counts users", async () => {
      expect(await userRepo.count({})).toBe(0);

      await userRepo.create(createUserData({ email: "user1@example.com" }), { ctx });
      await userRepo.create(createUserData({ email: "user2@example.com" }), { ctx });

      expect(await userRepo.count({})).toBe(2);
    });
  });
});
