import { dbInstance } from "../infra/database/db";
import { EntityId } from "../domain/base";
import { DomainContext } from "../domain/context";
import { User } from "../domain/entity";
import { getRepoContainer, RepoContainer } from "./repo";
import { getUseCaseContainer, UseCaseContainer } from "./usecase";
import { redisInstance } from "../infra/database/redis";

/**
 * Context data that can vary per-request.
 */
export interface AppContextData extends DomainContext {
  requestId?: string;
}

/**
 * Application Context - Can be used as both shared infrastructure and per-request context.
 *
 * Usage patterns:
 * 1. **Root context** - Created once at startup, holds shared repos/usecases
 * 2. **Request context** - Created per-request via `createContext()`, contains request-specific data
 *
 * This is platform/technology agnostic - it doesn't depend on any API framework.
 */
export class AppContext implements DomainContext {
  readonly repo: RepoContainer;
  readonly usecase: UseCaseContainer;

  // Per-request data (optional on root context)
  readonly userId?: EntityId;
  readonly lang?: string;
  readonly isAuthenticated?: boolean;
  readonly isAdmin?: boolean;
  readonly currentUser?: User;
  readonly requestId?: string;
  readonly ip?: string;

  // Flag to track if this is the root context (has lifecycle methods)
  private readonly isRoot: boolean;

  constructor(
    init: Partial<Pick<AppContext, "repo" | "usecase">> & AppContextData = {},
    isRoot = true
  ) {
    this.repo = init.repo || getRepoContainer();
    this.usecase = init.usecase || getUseCaseContainer();
    this.isRoot = isRoot;

    // Copy request-specific data
    this.userId = init.userId;
    this.lang = init.lang;
    this.isAuthenticated = init.isAuthenticated;
    this.isAdmin = init.isAdmin;
    this.currentUser = init.currentUser;
    this.requestId = init.requestId;
    this.ip = init.ip;
  }

  /**
   * Initialize the application context.
   * Call this once at application startup (only on root context).
   */
  async initialize(): Promise<void> {
    if (!this.isRoot) {
      throw new Error("initialize() can only be called on root context");
    }
    // await this.repo.database.initialize();
  }

  /**
   * Create a new context for handling a specific request.
   * Inherits repos/usecases from parent, adds request-specific data.
   *
   * @param data Request-specific data (userId, lang, auth status, etc.)
   * @returns A new AppContext instance for this request
   */
  createContext(data: AppContextData = {}): AppContext {
    return new AppContext(
      {
        repo: this.repo,
        usecase: this.usecase,
        ...data,
      },
      false // Not a root context
    );
  }

  /**
   * Create a new context with updated data.
   * Useful for enriching context after authentication.
   */
  with(data: Partial<AppContextData>): AppContext {
    return new AppContext(
      {
        repo: this.repo,
        usecase: this.usecase,
        userId: data.userId ?? this.userId,
        lang: data.lang ?? this.lang,
        isAuthenticated: data.isAuthenticated ?? this.isAuthenticated,
        isAdmin: data.isAdmin ?? this.isAdmin,
        currentUser: data.currentUser ?? this.currentUser,
        requestId: data.requestId ?? this.requestId,
        ip: data.ip ?? this.ip,
      },
      false // Derived contexts are not root
    );
  }

  /**
   * Close all connections and cleanup resources.
   * Call this when shutting down the application (only on root context).
   */
  async close(): Promise<void> {
    if (!this.isRoot) {
      throw new Error("close() can only be called on root context");
    }
    await redisInstance().quit();
    await dbInstance().destroy();
  }
}
