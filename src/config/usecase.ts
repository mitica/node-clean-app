import { UserLoginUseCase } from "../application/user/user-login-usecase";

export interface UseCaseContainer {
  login: UserLoginUseCase;
}

export const createUseCaseContainer = (): UseCaseContainer => {
  return { login: new UserLoginUseCase() };
};

let instance: UseCaseContainer | null = null;

export const getUseCaseContainer = (): UseCaseContainer => {
  if (!instance) {
    instance = createUseCaseContainer();
  }
  return instance;
};
