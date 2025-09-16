import { dbInstance } from "../infrastructure/database/db";
import { EntityId } from "../domain/base";
import { DomainContext } from "../domain/context";
import { getRepoContainer, RepoContainer } from "./repo";
import { getUseCaseContainer, UseCaseContainer } from "./usecase";
import { redisInstance } from "../infrastructure/database/redis";

export class AppContext implements DomainContext {
  userId?: EntityId;
  lang?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;

  repo: RepoContainer;
  usecase: UseCaseContainer;

  constructor(init: Partial<AppContext> = {}) {
    Object.assign(this, init);

    this.repo = init.repo || getRepoContainer();
    this.usecase = init.usecase || getUseCaseContainer();
  }

  async initialize(): Promise<void> {
    // await this.repo.database.initialize();
  }

  async close(): Promise<void> {
    await redisInstance().quit();
    await dbInstance().destroy();
  }
}
