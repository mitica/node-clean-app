import { EventEmitter } from "../event-emitter";
import { UserRegisterUseCase } from "./user/register/user-register-usecase";
import { DomainContext } from "../context";
import { UserLoginUseCase } from "./user/login/user-login-usecase";

export interface UseCaseManager<
  TContext extends DomainContext = DomainContext,
  EventDataMap extends {} = {}
> extends EventEmitter<EventDataMap> {
  readonly userRegister: UserRegisterUseCase<TContext>;
  readonly userLogin: UserLoginUseCase<TContext>;
}
