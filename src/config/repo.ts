import { UserDbRepository } from "../infra/repository/db-user-repository";
import { UserRepository } from "../domain/repository/user-repository";

export interface RepoContainer {
  user: UserRepository;
}

export const createRepoContainer = (): RepoContainer => {
  return {
    user: new UserDbRepository()
  };
};

let instance: RepoContainer | null = null;

export const getRepoContainer = (): RepoContainer => {
  if (!instance) {
    instance = createRepoContainer();
  }
  return instance;
};
