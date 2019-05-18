
export interface IUseCase<TOutput, TInput> {
  execute(data: TInput): Promise<TOutput>
}
