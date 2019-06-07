import { DataValidator } from "../validators/data-validator";

export interface UseCase<TInput, TOutput> {
  execute(input: Readonly<TInput>): Promise<TOutput>;
}

/**
 * Base use case. All use cases should extends BaseUseCase.
 * All business logic should be defined in use cases.
 */
export abstract class BaseUseCase<TInput, TOutput>
  implements UseCase<TInput, TOutput> {
  constructor(private inputValidator?: DataValidator<TInput>) {}

  public async execute(input: Readonly<TInput>): Promise<TOutput> {
    // pre code: logging, validation, events
    const validatedInput = await this.validateInputData(input);

    const output = await this.innerExecute(validatedInput);

    // post code

    return output;
  }

  protected async validateInputData(input: Readonly<TInput>) {
    if (this.inputValidator) {
      return this.inputValidator.validate(input);
    }
    return input;
  }

  protected abstract innerExecute(input: Readonly<TInput>): Promise<TOutput>;
}
