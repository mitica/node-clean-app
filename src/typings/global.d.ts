import { type Knex } from "knex";
import { AppContext } from "../config";

// var redisInstance: Redis;
var knexInstance: Knex;

// globalThis.redisInstance = redisInstance;
globalThis.knexInstance = knexInstance;

// Extend the Knex.QueryBuilder interface
declare module "knex" {
  interface QueryBuilder {
    state: Record<string, any>;
  }
}

declare global {
  namespace NodeJS {
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
