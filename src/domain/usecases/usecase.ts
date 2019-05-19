export interface UseCase<TInput, TOutput> {
  execute(input: Readonly<TInput>): Promise<TOutput>;
}

/**
 * Base use case. All use cases should extends BaseUseCase.
 * All business logic should be defined in use cases.
 */
export abstract class BaseUseCase<TInput, TOutput>
  implements UseCase<TInput, TOutput> {
  public async execute(input: Readonly<TInput>): Promise<TOutput> {
    // pre code: logging, validation, events

    const output = await this.innerExecute(input);

    // post code

    return output;
  }

  protected abstract innerExecute(input: Readonly<TInput>): Promise<TOutput>;
}
