import { DataValidator } from "../validators/data-validator";

export interface UseCase<TInput, TOutput, TContext = {}> {
  execute(
    input: Readonly<TInput>,
    context: Readonly<TContext>
  ): Promise<TOutput>;
}

/**
 * Base use case. All use cases should extends BaseUseCase.
 * All business logic should be defined in use cases.
 */
export abstract class BaseUseCase<TInput, TOutput, TContext = {}>
  implements UseCase<TInput, TOutput, TContext> {
  constructor(
    private inputValidator?: DataValidator<TInput, TInput, TContext>
  ) {}

  public async execute(
    input: Readonly<TInput>,
    context?: Readonly<TContext>
  ): Promise<TOutput> {
    // pre code: logging, validation, events
    const validatedInput = await this.validateInput(input, context);

    const output = await this.innerExecute(validatedInput, context);

    // post code

    return output;
  }

  protected async validateInput(
    input: Readonly<TInput>,
    context?: Readonly<TContext>
  ) {
    if (this.inputValidator) {
      return this.inputValidator.validate(input, context);
    }
    return input;
  }

  protected abstract innerExecute(
    input: Readonly<TInput>,
    context?: Readonly<TContext>
  ): Promise<TOutput>;
}
