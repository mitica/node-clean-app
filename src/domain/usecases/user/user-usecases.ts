import { DomainContext } from "../../context";
import { UserRegisterUseCase } from "./register/user-register-usecase";
import { UserLoginUseCase } from "./login/user-login-usecase";
import { GetUserByEmailUseCase } from "./get-one/get-user-by-email-usecase";
import { GetUserByIdUseCase } from "./get-one/get-user-by-id-usecase";

export interface UserUseCases<TContext extends DomainContext = DomainContext> {
  readonly register: UserRegisterUseCase<TContext>;
  readonly login: UserLoginUseCase<TContext>;
  readonly getByEmail: GetUserByEmailUseCase<TContext>;
  readonly getById: GetUserByIdUseCase<TContext>;
}
