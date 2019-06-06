export interface DataValidator<TInput, TOutput = TInput> {
  validate(data: TInput): Promise<TOutput>;
}
