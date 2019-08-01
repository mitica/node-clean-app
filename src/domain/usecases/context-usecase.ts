import { BaseUseCase, IUseCaseEvents } from "./usecase";
import { IDomainContext } from "../context";

export abstract class ContextUseCase<
  TInput,
  TOutput,
  TContext extends IDomainContext = IDomainContext,
  TEvents extends IUseCaseEvents<TInput, TOutput> = IUseCaseEvents<
    TInput,
    TOutput
  >
> extends BaseUseCase<TInput, TOutput, TEvents, TContext> {}
