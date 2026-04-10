import { type Knex } from "knex";
import { AppContext } from "../config";

// eslint-disable-next-line no-unassigned-vars
let knexInstance: Knex;

globalThis.knexInstance = knexInstance;

// Extend the Knex.QueryBuilder interface
declare module "knex" {
  interface QueryBuilder {
    state: Record<string, any>;
  }
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Global {
      // redisInstance?: Redis;
    }
  }

  namespace Express {
    export interface Request {
      context: AppContext;
      rawBody: Buffer;
    }
  }
}
