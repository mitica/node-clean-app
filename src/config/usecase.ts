import { UserLoginUseCase } from "../app/user/user-login-usecase";
import {
  EnqueueTaskUseCase,
  CancelTaskUseCase,
  RetryTaskUseCase,
} from "../app/worker";

export interface UseCaseContainer {
  login: UserLoginUseCase;
  enqueueTask: EnqueueTaskUseCase;
  cancelTask: CancelTaskUseCase;
  retryTask: RetryTaskUseCase;
}

export const createUseCaseContainer = (): UseCaseContainer => {
  return {
    login: new UserLoginUseCase(),
    enqueueTask: new EnqueueTaskUseCase(),
    cancelTask: new CancelTaskUseCase(),
    retryTask: new RetryTaskUseCase(),
  };
};

let instance: UseCaseContainer | null = null;

export const getUseCaseContainer = (): UseCaseContainer => {
  if (!instance) {
    instance = createUseCaseContainer();
  }
  return instance;
};
