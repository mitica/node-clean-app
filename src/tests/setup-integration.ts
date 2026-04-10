import { afterAll } from "vitest";
import { destroyTestDb } from "./db-helpers";

// Automatically close the DB connection after all tests in any file
// that uses the integration setup.
afterAll(async () => {
  await destroyTestDb();
});
