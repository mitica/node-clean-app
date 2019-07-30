import { BaseEventEmitter } from "../event-emitter";
import { DomainContext } from "../context";
import { UserUseCases } from "./user/user-usecases";

export class UseCaseManager<
  TContext extends DomainContext = DomainContext
> extends BaseEventEmitter<{}> {
  constructor(readonly user: UserUseCases<TContext>) {
    super();
  }
}
