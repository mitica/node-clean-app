export interface DataValidator<
  TInput,
  TOutput = TInput,
  TContext = {}
> {
  validate(data: Readonly<TInput>, context?: Readonly<TContext>): Promise<TOutput>;
}
