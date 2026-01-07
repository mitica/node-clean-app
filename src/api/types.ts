import { AppContext } from "../config";

/**
 * Hono environment variables for type-safe context access.
 * This file contains Hono-specific types that bridge the platform-agnostic
 * AppContext with Hono's context system.
 */
export type HonoEnv = {
  Variables: {
    requestContext: AppContext;
  };
};
