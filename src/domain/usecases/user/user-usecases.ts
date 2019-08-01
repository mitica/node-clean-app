import { UserRegisterUseCase } from "./register/user-register-usecase";
import { UserLoginUseCase } from "./login/user-login-usecase";
import { UserGetByEmailUseCase } from "./get-one/user-get-by-email-usecase";
import { UserGetByIdUseCase } from "./get-one/user-get-by-id-usecase";
import { UseCaseGroup, IUseCaseGroupEvents } from "../usecase-group";

export class UserUseCases<
  TEvents extends IUseCaseGroupEvents = IUseCaseGroupEvents
> extends UseCaseGroup<TEvents> {
  constructor(
    readonly register: UserRegisterUseCase,
    readonly login: UserLoginUseCase,
    readonly getByEmail: UserGetByEmailUseCase,
    readonly getById: UserGetByIdUseCase
  ) {
    super([register as any, login, getByEmail, getById]);
  }
}
