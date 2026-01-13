import { RefreshTokenUseCase, UserLoginUseCase } from "../app/user";
import {
  EnqueueTaskUseCase,
  CancelTaskUseCase,
  RetryTaskUseCase,
} from "../app/worker";
import { eventBus } from "./event-bus";

export interface UseCaseContainer {
  login: UserLoginUseCase;
  refreshToken: RefreshTokenUseCase;
  enqueueTask: EnqueueTaskUseCase;
  cancelTask: CancelTaskUseCase;
  retryTask: RetryTaskUseCase;
}

const createUseCaseContainer = (): UseCaseContainer => {
  return {
    login: new UserLoginUseCase(eventBus),
    refreshToken: new RefreshTokenUseCase(eventBus),
    enqueueTask: new EnqueueTaskUseCase(eventBus),
    cancelTask: new CancelTaskUseCase(eventBus),
    retryTask: new RetryTaskUseCase(eventBus),
  };
};

let instance: UseCaseContainer | null = null;

export const getUseCaseContainer = (): UseCaseContainer => {
  if (!instance) {
    instance = createUseCaseContainer();
  }
  return instance;
};
