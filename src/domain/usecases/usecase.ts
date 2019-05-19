export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export abstract class BaseUseCase<TInput, TOutput>
  implements UseCase<TInput, TOutput> {
  public async execute(input: TInput): Promise<TOutput> {
    // pre execute code
    const result = await this.innerExecute(input);
    // post execute code

    return result;
  }

  protected abstract innerExecute(input: TInput): Promise<TOutput>;
}
