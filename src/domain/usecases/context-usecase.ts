import { BaseUseCase, UseCaseEvents } from "./usecase";
import { DomainContext } from "../context";

export abstract class ContextUseCase<
  TInput,
  TOutput,
  TContext extends DomainContext = DomainContext,
  TEvents extends UseCaseEvents<TInput, TOutput> = UseCaseEvents<
    TInput,
    TOutput
  >
> extends BaseUseCase<TInput, TOutput, TEvents, TContext> {}
