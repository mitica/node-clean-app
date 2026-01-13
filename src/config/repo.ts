import { UserDbRepository } from "../infra/repository/db-user-repository";
import { WorkerTaskDbRepository } from "../infra/repository/db-worker-task-repository";
import { UserRepository } from "../domain/repository/user-repository";
import { WorkerTaskRepository } from "../domain/repository/worker-task-repository";

export interface RepoContainer {
  user: UserRepository;
  workerTask: WorkerTaskRepository;
}

const createRepoContainer = (): RepoContainer => {
  return {
    user: new UserDbRepository(),
    workerTask: new WorkerTaskDbRepository()
  };
};

let instance: RepoContainer | null = null;

export const getRepoContainer = (): RepoContainer => {
  if (!instance) {
    instance = createRepoContainer();
  }
  return instance;
};
