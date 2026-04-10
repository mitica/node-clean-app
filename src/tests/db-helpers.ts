import { knex, type Knex } from "knex";
import { dbInstance } from "../infra/database/db";
import { AppContext, type AppContextData } from "../config/app-context";
import { User, WorkerTask } from "../domain";

const TEST_DB_CONNECTION =
  process.env["TEST_DB_CONNECTION"] ||
  process.env["DB_CONNECTION"] ||
  "postgres://api@localhost:5432/api";

let db: Knex;
let rootCtx: AppContext;
let migrated = false;

/**
 * Creates (or returns cached) test AppContext backed by a test DB.
 * Runs migrations on first call. Optionally accepts per-request overrides.
 */
export async function createTestContext(data?: AppContextData): Promise<AppContext> {
  if (!db) {
    db = knex({
      client: "pg",
      connection: { connectionString: TEST_DB_CONNECTION },
    });

    // Inject into the singleton so getRepoContainer() picks it up
    dbInstance(db);
  }

  if (!migrated) {
    await db.migrate.latest({
      directory: "./src/infra/database/migrations",
      extension: "ts",
    });
    migrated = true;
  }

  if (!rootCtx) {
    rootCtx = new AppContext();
  }

  return data ? rootCtx.createContext(data) : rootCtx;
}

/**
 * Returns the raw Knex instance for direct queries in tests.
 */
export async function getTestDb(): Promise<Knex> {
  await createTestContext();
  return db;
}

/**
 * Destroys the test DB connection.
 */
export async function destroyTestDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = undefined!;
    rootCtx = undefined!;
    migrated = false;
  }
}

/**
 * Truncates all rows from the given tables (default: all app tables).
 */
export async function cleanTables(...tables: string[]): Promise<void> {
  const testDb = await getTestDb();
  const targets = tables.length > 0 ? tables : [User.tableName(), WorkerTask.tableName()];
  for (const table of targets) {
    await testDb(table).delete();
  }
}
