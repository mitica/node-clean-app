import { RefreshTokenUseCase, UserLoginUseCase, UserRegisterUseCase } from "../app/user";
import { EnqueueTaskUseCase, CancelTaskUseCase, RetryTaskUseCase } from "../app/worker";

export interface UseCaseContainer {
  login: UserLoginUseCase;
  register: UserRegisterUseCase;
  refreshToken: RefreshTokenUseCase;
  enqueueTask: EnqueueTaskUseCase;
  cancelTask: CancelTaskUseCase;
  retryTask: RetryTaskUseCase;
}

const createUseCaseContainer = (): UseCaseContainer => {
  return {
    login: new UserLoginUseCase(),
    register: new UserRegisterUseCase(),
    refreshToken: new RefreshTokenUseCase(),
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
