import { UserDbRepository } from "../infra/repository/db-user-repository";
import { WorkerTaskDbRepository } from "../infra/repository/db-worker-task-repository";
import { UserRepository } from "../domain/repository/user-repository";
import { WorkerTaskRepository } from "../domain/repository/worker-task-repository";
import { dbInstance } from "../infra/database/db";
import { QueryBuilderFactory } from "../infra/repository/query/query-builder-factory";
import { BaseRepository } from "../domain";
import { onEntityCreated } from "../app/hooks/on-entity-created";
import { onEntityUpdated } from "../app/hooks/on-entity-updated";
import { onEntityDeleted } from "../app/hooks/on-entity-deleted";

export interface RepoContainer {
  user: UserRepository;
  workerTask: WorkerTaskRepository;
}

const createRepoContainer = (): RepoContainer => {
  const knex = dbInstance();
  const factory = new QueryBuilderFactory(knex);
  return {
    user: new UserDbRepository(knex, factory),
    workerTask: new WorkerTaskDbRepository(knex, factory),
  };
};

let instance: RepoContainer | null = null;

export const getRepoContainer = (): RepoContainer => {
  if (!instance) {
    instance = createRepoContainer();
    for (const [key, repo] of Object.entries(instance)) {
      console.log(`Initialized repository: ${key}`);
      if (repo instanceof BaseRepository) {
        repo.on("entityCreated", onEntityCreated);
        repo.on("entityUpdated", onEntityUpdated);
        repo.on("entityDeleted", onEntityDeleted);
      }
    }
  }
  return instance;
};
